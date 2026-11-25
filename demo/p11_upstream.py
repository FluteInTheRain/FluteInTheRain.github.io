"""evidence-lab stand-in: usually quick, but every 40th call is slow.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn p11_upstream:app --port 4361
"""

import asyncio
import itertools

from fastapi import FastAPI

app = FastAPI(title="evidence-lab")
calls = itertools.count(1)


@app.get("/analyze/{case_id}")
async def analyze(case_id: str) -> dict:
    n = next(calls)
    # A GC pause, a cold cache, a noisy neighbour: 1 call in 40 takes 0.8 s.
    await asyncio.sleep(0.8 if n % 40 == 0 else 0.02)
    return {"case_id": case_id, "score": 0.87}
