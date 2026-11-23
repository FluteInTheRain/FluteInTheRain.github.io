"""The print() trap: two overlapping requests, one stream, no way to tell them apart.

    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn p10_print:app --port 4340
"""

import asyncio

from fastapi import FastAPI

app = FastAPI(title="clue.api")


@app.get("/cases/{case_id}/close")
async def close(case_id: str) -> dict:
    print("closing case")  # which case? which request? how long?
    await asyncio.sleep(0.2 if case_id == "C-1" else 0.05)
    print("rule check passed")
    await asyncio.sleep(0.1)
    print("done")
    return {"closed": case_id}
