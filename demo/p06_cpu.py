import asyncio
from concurrent.futures import ProcessPoolExecutor
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool


def burn(n: int = 12_000_000) -> int:
    # Pure-Python arithmetic: the thread running it holds the GIL throughout.
    return sum(i * i for i in range(n))


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pool = ProcessPoolExecutor(max_workers=4)  # 4 separate interpreters
    yield
    app.state.pool.shutdown()


app = FastAPI(title="clue.api: CPU work", lifespan=lifespan)


@app.get("/health")
async def health() -> dict:
    return {"ok": True}


@app.get("/cpu-inline")
async def cpu_inline() -> dict:
    return {"sum": burn()}  # CPU on the event loop: nothing else runs


@app.get("/cpu-thread")
async def cpu_thread() -> dict:
    return {"sum": await run_in_threadpool(burn)}  # a thread, same interpreter


@app.get("/cpu-process")
async def cpu_process() -> dict:
    loop = asyncio.get_running_loop()
    return {"sum": await loop.run_in_executor(app.state.pool, burn)}  # another process
