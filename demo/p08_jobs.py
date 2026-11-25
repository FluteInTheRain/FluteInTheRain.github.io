"""A small job queue on Redis lists: enqueue, claim, ack, retry, dead-letter.

The queue is a list. A worker does not pop a job, it *moves* it to a
processing list and deletes it from there only after the work succeeded.
A job that is in neither list's "done" state is never silently gone.
"""

import json
import time
import uuid

import redis

QUEUE = "jobs:reports"
PROCESSING = "jobs:reports:processing"
DELAYED = "jobs:reports:delayed"  # sorted set: score = when to try again
DEAD = "jobs:reports:dead"
MAX_ATTEMPTS = 4
BACKOFF_BASE = 1.0  # seconds; attempt n waits BACKOFF_BASE * 2 ** (n - 1)


def enqueue(r: redis.Redis, case_id: str) -> str:
    job = {"id": uuid.uuid4().hex[:8], "case_id": case_id, "attempt": 1}
    r.lpush(QUEUE, json.dumps(job))
    return job["id"]


def claim(r: redis.Redis, timeout: int = 1) -> str | None:
    """Move the oldest job to the processing list; it is now ours, not gone."""
    return r.blmove(QUEUE, PROCESSING, timeout, src="RIGHT", dest="LEFT")


def ack(r: redis.Redis, raw: str) -> None:
    r.lrem(PROCESSING, 1, raw)


def fail(r: redis.Redis, raw: str, error: str) -> str:
    """Schedule a retry with backoff, or give up and dead-letter the job."""
    job = json.loads(raw)
    with r.pipeline(transaction=True) as pipe:  # MULTI/EXEC: all or nothing
        if job["attempt"] >= MAX_ATTEMPTS:
            job["error"] = error
            pipe.lpush(DEAD, json.dumps(job))
            outcome = "dead-lettered"
        else:
            delay = BACKOFF_BASE * 2 ** (job["attempt"] - 1)
            job["attempt"] += 1
            pipe.zadd(DELAYED, {json.dumps(job): time.time() + delay})
            outcome = f"retry in {delay:g} s"
        pipe.lrem(PROCESSING, 1, raw)
        pipe.execute()
    return outcome


def promote_due(r: redis.Redis) -> None:
    """Move retries whose time has come back onto the queue."""
    for raw in r.zrangebyscore(DELAYED, 0, time.time()):
        if r.zrem(DELAYED, raw):  # only one worker wins the removal
            r.lpush(QUEUE, raw)


def requeue_orphans(r: redis.Redis) -> int:
    """Startup recovery: anything still in processing belongs to a dead worker.

    Safe with ONE worker. With several you need a lease or visibility timeout.
    """
    n = 0
    while r.lmove(PROCESSING, QUEUE, src="LEFT", dest="RIGHT"):
        n += 1
    return n
