"""A service with 4 worker slots that refuses work past 8 in flight: 503 + Retry-After.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn p11_shed:app --port 4364
    # MAX_IN_FLIGHT=1000 uvicorn ... turns shedding off, for the comparison
"""

import asyncio
import os

from fastapi import FastAPI
from fastapi.responses import JSONResponse

MAX_IN_FLIGHT = int(os.environ.get("MAX_IN_FLIGHT", "8"))
slots = asyncio.Semaphore(4)  # the scarce thing: 4 jobs can run at once
in_flight = 0
app = FastAPI(title="clue.api", version="0.11.3")


@app.get("/cases/{case_id}/report")
async def report(case_id: str):
    global in_flight
    if in_flight >= MAX_IN_FLIGHT:
        return JSONResponse(
            status_code=503,
            headers={"Retry-After": "1"},
            content={"detail": "busy, retry in 1 s"},
        )
    in_flight += 1
    try:
        async with slots:
            await asyncio.sleep(0.05)  # the work: 50 ms of a slot
            return {"case_id": case_id, "report": "ready"}
    finally:
        in_flight -= 1
