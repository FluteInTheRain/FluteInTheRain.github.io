"""Shared fixtures. Layer markers are assigned from the file name."""

import os
import tempfile

# p05_db reads DATABASE_URL when it is imported. Point it at a throwaway
# file first, so importing p05_app never touches the real clue.db.
os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.gettempdir()}/p09-import-only.db"

import pytest  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

import p05_db  # noqa: E402
from fakes import FakeCaseRepository  # noqa: E402
from layered_service import CaseService  # noqa: E402


def pytest_collection_modifyitems(items):
    for item in items:
        name = item.path.name
        for layer in ("unit", "api", "e2e", "contract"):
            if name.startswith(f"test_{layer}"):
                item.add_marker(getattr(pytest.mark, layer))


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def fake_repo() -> FakeCaseRepository:
    return FakeCaseRepository()


@pytest.fixture
def service(fake_repo: FakeCaseRepository) -> CaseService:
    return CaseService(fake_repo)


@pytest.fixture
def sql_sessions(tmp_path, monkeypatch):
    """A brand-new SQLite file per test, wired in where p05_db builds sessions."""
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False}
    )
    p05_db.Base.metadata.create_all(engine)
    factory = sessionmaker(engine, expire_on_commit=False)
    # get_session() stays the real one (its commit/rollback is under test);
    # only the factory it opens sessions from is swapped.
    monkeypatch.setattr(p05_db, "SessionLocal", factory)
    yield factory
    engine.dispose()
