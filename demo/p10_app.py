"""clue.api with observability: JSON logs, request ids, metrics, traces.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with 'sqlalchemy==2.0.*' --with prometheus-client --with httpx \
        --with opentelemetry-sdk --with opentelemetry-instrumentation-fastapi \
        --with opentelemetry-instrumentation-sqlalchemy \
        --with opentelemetry-instrumentation-httpx \
        uvicorn p10_app:app --port 4340
"""

import logging
import os

import httpx
from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from opentelemetry import trace
from sqlalchemy import func, select
from sqlalchemy.orm import Session

import layered_service
import p10_logs
import p10_metrics
import p10_middleware
from layered_data import CaseRecord
from layered_service import CaseNotFoundError, CaseRuleError, CaseService
from p05_db import Base, CaseRow, SqlCaseRepository, engine, get_session

p10_logs.configure("clue-api")
log = logging.getLogger("clue.service")
tracer = trace.get_tracer("clue.service")
# Post 4's service says what it is doing with print(). One assignment turns
# every one of those lines into a structured log line with the request id.
layered_service._trace = lambda msg: log.info(msg)
LAB = os.environ.get("LAB_URL", "http://127.0.0.1:4341")

Base.metadata.create_all(engine)
app = FastAPI(title="clue.api", version="0.10.0")
# Order matters: the last one installed is the outermost. Metrics wrap logging
# wrap the app, so the request id is set before anything inside logs.
p10_middleware.install(app)
p10_metrics.install(app)


@app.exception_handler(CaseNotFoundError)
def case_not_found(request: Request, exc: CaseNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(CaseRuleError)
def rule_refused(request: Request, exc: CaseRuleError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


if os.environ.get("TRACE") == "1":
    import p10_tracing

    p10_tracing.setup(app, "clue-api", engine)


def stamp_request_id(request: httpx.Request) -> None:
    """Forward the correlation id on every outgoing call, so nobody forgets."""
    request.headers["X-Request-ID"] = p10_logs.request_id_var.get()


lab = httpx.Client(base_url=LAB, event_hooks={"request": [stamp_request_id]})


class ObservedCaseService(CaseService):
    """post 4's service, unchanged, plus a span around each move."""

    def get_case(self, case_id: str) -> CaseRecord:
        with tracer.start_as_current_span("CaseService.get_case"):
            return super().get_case(case_id)

    def assign(self, case_id: str, detective: str) -> CaseRecord:
        with tracer.start_as_current_span("CaseService.assign"):
            return super().assign(case_id, detective)


def get_service(session: Session = Depends(get_session, scope="function")) -> CaseService:
    service = ObservedCaseService(SqlCaseRepository(session))
    service._next_id = session.scalar(select(func.count()).select_from(CaseRow)) + 1
    return service


@app.post("/cases", status_code=201)
def open_case(title: str, service: CaseService = Depends(get_service)) -> dict:
    return vars(service.open_case(title=title))


@app.post("/cases/{case_id}/assign")
def assign(case_id: str, detective: str, service: CaseService = Depends(get_service)) -> dict:
    return vars(service.assign(case_id=case_id, detective=detective))


@app.get("/cases/{case_id}/report")
def report(case_id: str, service: CaseService = Depends(get_service)) -> dict:
    case = service.get_case(case_id)
    analysis = lab.get(f"/analyze/{case_id}", timeout=5).json()
    return {"case": vars(case), "analysis": analysis}
