"""One middleware: set the correlation id, time the request, write one log line."""

import logging
import time
import uuid

from fastapi import FastAPI, Request

from p10_logs import request_id_var

log = logging.getLogger("clue.access")


def install(app: FastAPI) -> None:
    @app.middleware("http")
    async def request_context(request: Request, call_next):
        # Trust a caller's id (so one id spans services), or mint our own.
        rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:8]
        token = request_id_var.set(rid)
        started = time.perf_counter()
        status = 500  # if call_next raises, this is what we really answered
        try:
            response = await call_next(request)
            status = response.status_code
            response.headers["X-Request-ID"] = rid
            return response
        finally:
            log.info(
                "request",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status": status,
                    "duration_ms": round((time.perf_counter() - started) * 1000, 1),
                },
            )
            request_id_var.reset(token)
