"""clue.api on a real database: post 4's service, unchanged, over SQLAlchemy.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with 'sqlalchemy==2.0.*' uvicorn p05_app:app --port 4335
"""

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from layered_service import CaseNotFoundError, CaseRuleError, CaseService
from p05_db import Base, CaseRow, SqlCaseRepository, engine, get_session

Base.metadata.create_all(engine)  # fine for a demo; see the migrations section

app = FastAPI(title="clue.api", version="0.5.0")


def get_service(
    session: Session = Depends(get_session, scope="function"),
) -> CaseService:
    service = CaseService(SqlCaseRepository(session))
    # The service counts ids in memory, and this service lives one request.
    # Seed the counter from the table or the second request reuses C-1.
    service._next_id = session.scalar(select(func.count()).select_from(CaseRow)) + 1
    return service


@app.exception_handler(CaseNotFoundError)
def case_not_found(request: Request, exc: CaseNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(CaseRuleError)
def rule_refused(request: Request, exc: CaseRuleError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.post("/cases", status_code=201)
def open_case(title: str, service: CaseService = Depends(get_service)) -> dict:
    return vars(service.open_case(title=title))


@app.post("/cases/{case_id}/assign")
def assign(
    case_id: str, detective: str, service: CaseService = Depends(get_service)
) -> dict:
    return vars(service.assign(case_id=case_id, detective=detective))


@app.post("/cases/batch", status_code=201)
def open_batch(titles: list[str], service: CaseService = Depends(get_service)) -> dict:
    """Open several cases in one request: all of them, or none."""
    for title in titles:
        if not title.strip():
            raise ValueError("blank title")
        service.open_case(title=title)
    return {"opened": len(titles)}


@app.get("/stats")
def stats(session: Session = Depends(get_session)) -> dict:
    return {"cases": session.scalar(select(func.count()).select_from(CaseRow))}
