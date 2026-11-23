import asyncio
import os
import time

from fastapi import FastAPI

app = FastAPI(title="clue.api: what a worker owns")

hits = 0  # module state: every worker process gets its own copy


@app.get("/hit")
async def hit() -> dict:
    global hits
    hits += 1
    return {"pid": os.getpid(), "hits": hits}


@app.get("/async-blocking")
async def async_blocking() -> dict:
    time.sleep(1)  # the p06_loop.py sin, now with several processes around it
    return {"pid": os.getpid()}


@app.get("/async-await")
async def async_await() -> dict:
    await asyncio.sleep(1)
    return {"pid": os.getpid()}
