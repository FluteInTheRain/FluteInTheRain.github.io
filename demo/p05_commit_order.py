"""When does the commit happen: before the client gets its answer, or after?

A slow COMMIT (we add a one-second sleep to it) makes the order visible in
the client's stopwatch.

    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with 'sqlalchemy==2.0.*' uvicorn p05_commit_order:app --port 4335
"""

import time

from fastapi import Depends, FastAPI
from sqlalchemy import event, text
from sqlalchemy.orm import Session

from p05_db import Base, engine, get_session

Base.metadata.create_all(engine)


@event.listens_for(engine, "commit")
def slow_commit(conn) -> None:
    print("db      | COMMIT starts (1 s)")
    time.sleep(1)


app = FastAPI()


@app.post("/default")
def default(session: Session = Depends(get_session)) -> dict:
    session.execute(text("INSERT INTO cases VALUES ('d', 't', 'open', NULL, NULL)"))
    print("web     | endpoint returns")
    return {"ok": True}


@app.post("/early")
def early(session: Session = Depends(get_session, scope="function")) -> dict:
    session.execute(text("INSERT INTO cases VALUES ('e', 't', 'open', NULL, NULL)"))
    print("web     | endpoint returns")
    return {"ok": True}
