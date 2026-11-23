import asyncio
import time

import anyio.to_thread
import httpx
import requests
from fastapi import FastAPI

app = FastAPI(title="clue.api: the event loop")

UPSTREAM = "http://127.0.0.1:4366/slow"  # a 0.5 s third-party API (p06_upstream.py)


@app.get("/health")
async def health() -> dict:
    return {"ok": True}


# --- one second of waiting, three ways -------------------------------------


@app.get("/async-await")
async def async_await() -> dict:
    await asyncio.sleep(1)  # hands the loop back while it waits
    return {"route": "async-await"}


@app.get("/async-blocking")
async def async_blocking() -> dict:
    time.sleep(1)  # never hands the loop back
    return {"route": "async-blocking"}


@app.get("/plain-def")
def plain_def() -> dict:
    time.sleep(1)  # FastAPI runs a plain def in a worker thread
    return {"route": "plain-def"}


# --- the same wait, behind a real client library ---------------------------


@app.get("/trap")
async def trap() -> dict:
    # `requests` is a blocking client: the whole loop waits with it.
    return requests.get(UPSTREAM).json()


@app.get("/fixed-async")
async def fixed_async() -> dict:
    async with httpx.AsyncClient() as client:
        return (await client.get(UPSTREAM)).json()


@app.get("/fixed-def")
def fixed_def() -> dict:
    return requests.get(UPSTREAM).json()


@app.get("/threadpool-limit")
async def threadpool_limit() -> dict:
    limiter = anyio.to_thread.current_default_thread_limiter()
    return {"worker_threads_for_plain_def": limiter.total_tokens}
