"""The N+1 query, and the one-word fix. Each response counts its own SQL.

    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with 'sqlalchemy==2.0.*' uvicorn p05_nplus1:app --port 4335
    SQL_ECHO=1 ... to see every statement.
"""

import time

from fastapi import Depends, FastAPI
from sqlalchemy import event, func, select
from sqlalchemy.orm import Session, selectinload

from p05_db import Base, CaseRow, EvidenceRow, SessionLocal, engine, get_session

Base.metadata.create_all(engine)
with SessionLocal() as s, s.begin():
    if s.scalar(select(func.count()).select_from(CaseRow)) == 0:
        for n in range(1, 201):
            s.add(CaseRow(case_id=f"C-{n}", title=f"Case {n}", status="open",
                          detective=None, resolution=None,
                          evidence=[EvidenceRow(label=f"item {k}") for k in range(3)]))

statements: list[str] = []


@event.listens_for(engine, "before_cursor_execute")
def count_statement(conn, cursor, statement, *args) -> None:
    statements.append(statement)


app = FastAPI()


def summarize(cases) -> list[dict]:
    return [{"case": c.case_id, "evidence": len(c.evidence)} for c in cases]


def measure(query, session: Session) -> dict:
    statements.clear()
    started = time.perf_counter()
    cases = summarize(session.scalars(query))
    return {
        "cases": len(cases),
        "queries": len(statements),
        "ms": round((time.perf_counter() - started) * 1000, 1),
    }


@app.get("/lazy")
def lazy(limit: int = 20, session: Session = Depends(get_session)) -> dict:
    return measure(select(CaseRow).limit(limit), session)


@app.get("/eager")
def eager(limit: int = 20, session: Session = Depends(get_session)) -> dict:
    query = select(CaseRow).options(selectinload(CaseRow.evidence)).limit(limit)
    return measure(query, session)
