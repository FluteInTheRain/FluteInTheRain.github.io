import asyncio

from fastapi import FastAPI

app = FastAPI(title="slow upstream")


@app.get("/slow")
async def slow() -> dict:
    # Stands in for a third-party API that takes half a second to answer.
    await asyncio.sleep(0.5)
    return {"from": "upstream"}
