"""clue.api with a deadline on the outbound call: wait 0.25 s, then answer 504.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with httpx uvicorn p11_timeout:app --port 4363
"""

import os

import httpx
from fastapi import FastAPI, HTTPException

LAB = os.environ.get("LAB_URL", "http://127.0.0.1:4361")
app = FastAPI(title="clue.api", version="0.11.2")
lab = httpx.AsyncClient(base_url=LAB, timeout=httpx.Timeout(0.25))


@app.get("/cases/{case_id}/report")
async def report(case_id: str) -> dict:
    try:
        analysis = (await lab.get(f"/analyze/{case_id}")).json()
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="evidence-lab: no answer in 0.25 s")
    return {"case_id": case_id, "analysis": analysis}
