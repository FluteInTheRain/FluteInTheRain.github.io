"""clue.api, layered — the web layer: parse, validate, respond.

Three files, one direction:
    layered_app.py       web:     HTTP in, HTTP out (this file)
    layered_service.py   service: the case workflow rules
    layered_data.py      data:    storage behind a repository interface

The wiring happens once, here at the edge: this file builds the data
layer and hands it to the service. Nothing in the two files below
imports FastAPI — that is the whole point.

Run it with the stack the series posts are captured on:

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn layered_app:app --port 4328

Then, from another terminal:

    curl -X POST http://127.0.0.1:4328/cases \
        -H 'content-type: application/json' -d '{"title": "The missing gnome"}'
"""

import time

from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from layered_data import CaseRecord, InMemoryCaseRepository
from layered_service import CaseNotFoundError, CaseRuleError, CaseService


def _trace(msg: str) -> None:
    print(f"web     | {msg}")


repo = InMemoryCaseRepository()
service = CaseService(repo)

app = FastAPI(title="clue.api", version="0.4.0")
router = APIRouter(prefix="/cases", tags=["cases"])


@app.middleware("http")
async def trace_layers(request: Request, call_next):
    _trace(f"{request.method} {request.url.path} -> dispatch to a handler")
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000
    _trace(f"{response.status_code} back through the stack · {elapsed_ms:.2f} ms")
    return response


# Where domain errors become status codes: once, at the edge.
@app.exception_handler(CaseNotFoundError)
async def case_not_found(request: Request, exc: CaseNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(CaseRuleError)
async def rule_refused(request: Request, exc: CaseRuleError) -> JSONResponse:
    _trace(f"rule refused: {exc}; mapping CaseRuleError -> 409")
    return JSONResponse(status_code=409, content={"detail": str(exc)})


class OpenBody(BaseModel):
    title: str


class AssignBody(BaseModel):
    detective: str


class CloseBody(BaseModel):
    resolution: str


class CaseOut(BaseModel):
    case_id: str
    title: str
    status: str
    detective: str | None
    resolution: str | None


def _out(case: CaseRecord) -> CaseOut:
    return CaseOut(
        case_id=case.case_id,
        title=case.title,
        status=case.status,
        detective=case.detective,
        resolution=case.resolution,
    )


@router.post("", status_code=201)
async def open_case(body: OpenBody) -> CaseOut:
    _trace("title parsed and validated; asking the service to open the case")
    return _out(service.open_case(title=body.title))


@router.get("/{case_id}")
async def get_case(case_id: str) -> CaseOut:
    _trace(f"{case_id} asked for; the service knows what exists")
    return _out(service.get_case(case_id))


@router.post("/{case_id}/assign")
async def assign(case_id: str, body: AssignBody) -> CaseOut:
    _trace("case_id and detective parsed; asking the service to assign")
    return _out(service.assign(case_id=case_id, detective=body.detective))


@router.post("/{case_id}/close")
async def close(case_id: str, body: CloseBody) -> CaseOut:
    _trace("case_id and resolution parsed; asking the service to close")
    return _out(service.close(case_id=case_id, resolution=body.resolution))


app.include_router(router)
