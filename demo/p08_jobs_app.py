"""The API half of the queue: accept the work, answer 202, let a worker do it.

    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with 'redis==8.2.0' uvicorn p08_jobs_app:app --port 4338
"""

import redis
from fastapi import Depends, FastAPI

import p08_jobs as jobs
from p08_redis import get_redis

app = FastAPI(title="clue.api: jobs")


@app.post("/cases/{case_id}/report", status_code=202)
def request_report(case_id: str, r: redis.Redis = Depends(get_redis)) -> dict:
    job_id = jobs.enqueue(r, case_id)  # one Redis write, then we are done
    return {"status": "accepted", "job_id": job_id}


@app.get("/jobs/stats")
def job_stats(r: redis.Redis = Depends(get_redis)) -> dict:
    return {
        "queued": r.llen(jobs.QUEUE),
        "processing": r.llen(jobs.PROCESSING),
        "delayed": r.zcard(jobs.DELAYED),
        "dead": r.llen(jobs.DEAD),
    }
