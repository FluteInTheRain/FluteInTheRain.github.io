"""clue.api's real data layer: SQLAlchemy 2.x behind post 4's CaseRepository seam.

layered_service.py is NOT touched. It asks for something shaped like
CaseRepository; SqlCaseRepository is that shape, backed by a database.
Nothing in this file commits: the session's owner does (see p05_app.py).
"""

import os
from collections.abc import Iterator

from sqlalchemy import ForeignKey, create_engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    sessionmaker,
)

from layered_data import CaseRecord

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///clue.db")
ECHO = os.environ.get("SQL_ECHO") == "1"

# SQLite refuses a connection used from another thread; FastAPI runs sync
# endpoints in a threadpool. Postgres has no such flag.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=ECHO, connect_args=connect_args)
SessionLocal = sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class CaseRow(Base):
    """The table. A different type from CaseRecord on purpose."""

    __tablename__ = "cases"

    case_id: Mapped[str] = mapped_column(primary_key=True)
    title: Mapped[str]
    status: Mapped[str]
    detective: Mapped[str | None]
    resolution: Mapped[str | None]
    evidence: Mapped[list["EvidenceRow"]] = relationship(back_populates="case")


class EvidenceRow(Base):
    __tablename__ = "evidence"

    id: Mapped[int] = mapped_column(primary_key=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.case_id"))
    label: Mapped[str]
    case: Mapped[CaseRow] = relationship(back_populates="evidence")


class SqlCaseRepository:
    """Same three methods as InMemoryCaseRepository; the session is borrowed."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, record: CaseRecord) -> None:
        self._session.add(CaseRow(**vars(record)))
        self._session.flush()  # send the INSERT now; commit is not ours to do

    def get(self, case_id: str) -> CaseRecord | None:
        row = self._session.get(CaseRow, case_id)
        if row is None:
            return None
        return CaseRecord(
            row.case_id, row.title, row.status, row.detective, row.resolution
        )

    def save(self, record: CaseRecord) -> None:
        row = self._session.get(CaseRow, record.case_id)
        row.status = record.status
        row.detective = record.detective
        row.resolution = record.resolution
        self._session.flush()


def get_session() -> Iterator[Session]:
    """One session per request: commit if the request succeeds, else roll back."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
