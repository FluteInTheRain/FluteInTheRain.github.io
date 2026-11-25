"""clue.api before any latency work: one cheap route, one that calls evidence-lab.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with httpx uvicorn p11_naive:app --port 4360
"""

import os

import httpx
from fastapi import FastAPI

LAB = os.environ.get("LAB_URL", "http://127.0.0.1:4361")
app = FastAPI(title="clue.api", version="0.11.0")
lab = httpx.AsyncClient(base_url=LAB)  # no timeout= argument: httpx's default applies


@app.get("/cases/{case_id}")
async def get_case(case_id: str) -> dict:
    return {"case_id": case_id, "status": "open"}


@app.get("/cases/{case_id}/report")
async def report(case_id: str) -> dict:
    analysis = (await lab.get(f"/analyze/{case_id}")).json()
    return {"case_id": case_id, "analysis": analysis}
