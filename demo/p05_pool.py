"""A pool of two connections, and three requests that each hold one for 3 s.

    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with 'sqlalchemy==2.0.*' uvicorn p05_pool:app --port 4335
"""

import time

from fastapi import Depends, FastAPI
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

engine = create_engine(
    "sqlite:///pool_demo.db",
    connect_args={"check_same_thread": False},
    pool_size=2,  # connections kept open
    max_overflow=0,  # extra connections allowed under load: none
    pool_timeout=1,  # seconds a request waits for a free connection
)
SessionLocal = sessionmaker(engine)


def get_session():
    with SessionLocal() as session:
        yield session


app = FastAPI()


@app.get("/slow")
def slow(session: Session = Depends(get_session)) -> dict:
    session.execute(text("SELECT 1"))  # first query: the connection is checked out here
    time.sleep(3)  # stands in for a slow call made while still holding it
    return {"pool": engine.pool.status()}
