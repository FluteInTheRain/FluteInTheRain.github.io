"""clue.api's read path with a Redis cache in front of the database.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with 'sqlalchemy==2.0.*' --with 'redis==8.2.0' \
        uvicorn p08_cache:app --port 4338
"""

import json
import os
import threading
import time

import redis
from fastapi import Depends, FastAPI, HTTPException, Response

from p05_db import Base, CaseRow, SessionLocal, engine
from p08_redis import get_redis

TTL_SECONDS = int(os.environ.get("CASE_TTL", "30"))

Base.metadata.create_all(engine)
app = FastAPI(title="clue.api: a cache in front of the database")

_reads_lock = threading.Lock()
db_reads = 0  # how many times the database was really asked


def case_key(case_id: str) -> str:
    return f"case:{case_id}"


def read_case_from_db(case_id: str) -> dict | None:
    global db_reads
    with _reads_lock:
        db_reads += 1
    time.sleep(0.05)  # stands in for a heavy query: joins, aggregates
    with SessionLocal() as session:
        row = session.get(CaseRow, case_id)
        if row is None:
            return None
        return {
            "case_id": row.case_id,
            "title": row.title,
            "status": row.status,
            "detective": row.detective,
        }


def write_detective(case_id: str, detective: str) -> None:
    with SessionLocal() as session:
        row = session.get(CaseRow, case_id)
        if row is None:
            raise HTTPException(404, f"no case {case_id}")
        row.detective = detective
        session.commit()


@app.post("/seed", status_code=201)
def seed() -> dict:
    with SessionLocal() as session:
        if session.get(CaseRow, "C-1") is None:
            session.add(CaseRow(case_id="C-1", title="The missing violin", status="open"))
            session.commit()
    return {"seeded": "C-1"}


@app.get("/cases/{case_id}")
def get_case(
    case_id: str, response: Response, cache: redis.Redis = Depends(get_redis)
) -> dict:
    """Cache-aside: look in Redis, on a miss ask the database and remember."""
    cached = cache.get(case_key(case_id))
    if cached is not None:
        response.headers["X-Cache"] = "HIT"
        return json.loads(cached)
    case = read_case_from_db(case_id)
    if case is None:
        raise HTTPException(404, f"no case {case_id}")
    cache.set(case_key(case_id), json.dumps(case), ex=TTL_SECONDS)
    response.headers["X-Cache"] = "MISS"
    return case


@app.post("/cases/{case_id}/assign-stale")
def assign_stale(
    case_id: str, detective: str, cache: redis.Redis = Depends(get_redis)
) -> dict:
    """The AI-typical version: write the database, forget the cache."""
    write_detective(case_id, detective)
    return {"case_id": case_id, "detective": detective}


@app.post("/cases/{case_id}/assign")
def assign(case_id: str, detective: str, cache: redis.Redis = Depends(get_redis)) -> dict:
    """Delete-on-write: after the database changes, drop the cached copy."""
    write_detective(case_id, detective)
    cache.delete(case_key(case_id))  # the next read misses and refills
    return {"case_id": case_id, "detective": detective}


@app.get("/cases/{case_id}/guarded")
def get_case_guarded(
    case_id: str, response: Response, cache: redis.Redis = Depends(get_redis)
) -> dict:
    """Single-flight: when the key is missing, one request rebuilds it."""
    key = case_key(case_id)
    lock = f"lock:{key}"
    for _ in range(100):  # wait up to about 2 s for whoever holds the lock
        cached = cache.get(key)
        if cached is not None:
            response.headers["X-Cache"] = "HIT"
            return json.loads(cached)
        if cache.set(lock, "1", nx=True, ex=5):  # I won the right to rebuild
            try:
                cached = cache.get(key)  # re-check: the last winner may just be done
                if cached is not None:
                    return json.loads(cached)
                case = read_case_from_db(case_id)
                if case is None:
                    raise HTTPException(404, f"no case {case_id}")
                cache.set(key, json.dumps(case), ex=TTL_SECONDS)
                response.headers["X-Cache"] = "MISS"
                return case
            finally:
                cache.delete(lock)
        time.sleep(0.02)  # somebody else is rebuilding: wait, then read again
    raise HTTPException(503, "cache rebuild took too long")


@app.get("/stats/db-reads")
def stats() -> dict:
    return {"db_reads": db_reads}
