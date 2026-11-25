import asyncio
import logging
import os
import socket
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response

from p12_settings import Settings

settings = Settings()  # fails here, at import, if CLUE_DATABASE_URL is missing
POD = os.environ.get("POD_NAME", socket.gethostname())
log = logging.getLogger("uvicorn.error")
inflight = 0


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: warm things up (pool, caches). uvicorn does not listen until
    # this block finishes, and /readyz stays 503 until the flag is set.
    log.info("startup: warming up for %.1fs (release %s)", settings.startup_delay_s, settings.release)
    await asyncio.sleep(settings.startup_delay_s)
    app.state.ready = True
    log.info("startup: ready")
    yield
    # Shutdown: uvicorn has stopped accepting and waited for open requests.
    app.state.ready = False
    log.info("shutdown: in-flight requests left: %d", inflight)


app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def count_inflight(request, call_next):
    global inflight
    inflight += 1
    try:
        return await call_next(request)
    finally:
        inflight -= 1


def who() -> dict:
    return {"pod": POD, "pid": os.getpid(), "release": settings.release}


@app.get("/livez")
async def livez() -> dict:
    # Liveness: "is this process stuck?" Never check dependencies here.
    return {"alive": True}


@app.get("/readyz")
async def readyz(response: Response) -> dict:
    # Readiness: "should traffic come here right now?"
    if not app.state.ready:
        response.status_code = 503
    return {"ready": app.state.ready}


@app.get("/work")
async def work() -> dict:
    await asyncio.sleep(settings.work_ms / 1000)
    return who()


@app.get("/slow")
async def slow() -> dict:
    await asyncio.sleep(settings.slow_ms / 1000)
    return who()


@app.post("/debug/unready")
async def debug_unready() -> dict:
    # Pretend a dependency went away: readiness fails, the process is fine.
    app.state.ready = False
    return {"ready": False}


@app.post("/debug/hang")
async def debug_hang() -> dict:
    # A blocking call on the event loop: nothing answers, /livez included.
    time.sleep(120)
    return {"hung": False}
