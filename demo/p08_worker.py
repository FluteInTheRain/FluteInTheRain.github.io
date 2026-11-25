"""The worker: a separate process that takes jobs off the Redis queue.

    uv run --python 3.13 --with 'redis==8.2.0' python p08_worker.py once
    modes: once (idempotent handler), naive (not idempotent),
           forget (pops with no ack: the fire-and-forget trap)
"""

import json
import os
import signal
import sys
import time

import redis

import p08_jobs as jobs
from p08_redis import REDIS_URL

T0 = time.perf_counter()


def log(msg: str) -> None:
    print(f"[+{time.perf_counter() - T0:5.2f} s] {msg}", flush=True)


def build_report(job: dict) -> None:
    time.sleep(2)  # stands in for slow work: a PDF, a data export
    if job["case_id"] == "C-BAD":
        raise ValueError("report template missing")  # fails every time
    if job["case_id"] == "C-FLAKY" and job["attempt"] < 3:
        raise ConnectionError("mail relay timed out")  # fails twice, then works


def deliver_naive(r: redis.Redis, job: dict) -> None:
    """Appends to a list: run the same job twice and the mail goes out twice."""
    build_report(job)
    r.rpush("outbox:naive", job["case_id"])
    log(f"job {job['id']} {job['case_id']}: mail sent (appended)")
    if os.environ.get("CRASH_BEFORE_ACK") == "1":
        os.kill(os.getpid(), signal.SIGKILL)  # die after the effect, before the ack


def deliver_once(r: redis.Redis, job: dict) -> None:
    """The job id is the key: the effect and the dedupe are one atomic write."""
    build_report(job)
    if r.hsetnx("outbox:once", job["id"], job["case_id"]):
        log(f"job {job['id']} {job['case_id']}: mail sent")
    else:
        log(f"job {job['id']} {job['case_id']}: already sent, skipping")
    if os.environ.get("CRASH_BEFORE_ACK") == "1":
        os.kill(os.getpid(), signal.SIGKILL)


def main(mode: str) -> None:
    r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    if mode == "forget":
        log("worker up (fire-and-forget: BRPOP, no ack)")
        while True:
            popped = r.brpop([jobs.QUEUE], timeout=1)  # the job leaves Redis now
            if popped:
                job = json.loads(popped[1])
                log(f"job {job['id']} {job['case_id']}: popped, working")
                build_report(job)
                log(f"job {job['id']} {job['case_id']}: finished")
    handler = deliver_once if mode == "once" else deliver_naive
    log(f"worker up ({mode}); requeued {jobs.requeue_orphans(r)} orphan(s)")
    while True:
        jobs.promote_due(r)
        raw = jobs.claim(r)
        if raw is None:
            continue
        job = json.loads(raw)
        log(f"job {job['id']} {job['case_id']}: attempt {job['attempt']} started")
        try:
            handler(r, job)
        except Exception as exc:
            log(f"job {job['id']} {job['case_id']}: failed ({exc}) -> {jobs.fail(r, raw, str(exc))}")
        else:
            jobs.ack(r, raw)
            log(f"job {job['id']} {job['case_id']}: acked")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "once")
