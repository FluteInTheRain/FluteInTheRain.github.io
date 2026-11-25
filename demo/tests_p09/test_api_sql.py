"""API tests on a real database: SQLAlchemy, SQLite, one fresh file per test."""

import pytest
from fastapi.testclient import TestClient

from layered_data import CaseRecord
from p05_app import app
from p05_db import SqlCaseRepository
from p09_buggy_service import BuggyCaseService


@pytest.fixture
def client(sql_sessions):
    # raise_server_exceptions=False: a crash in the app is a 500 we can assert on.
    return TestClient(app, raise_server_exceptions=False)


def test_ids_are_unique_across_requests(client):
    # The post-5 bug (a counter reset per request) lives only in the database:
    # a dict-backed fake would never have produced the duplicate key.
    first = client.post("/cases", params={"title": "one"})
    second = client.post("/cases", params={"title": "two"})
    assert (first.status_code, second.status_code) == (201, 201)
    assert second.json()["case_id"] == "C-2"


def test_each_test_starts_empty(client):
    assert client.get("/stats").json() == {"cases": 0}  # no leftovers from other tests


def test_batch_with_a_blank_title_opens_nothing(client):
    response = client.post("/cases/batch", json=["one", "two", "  "])
    assert response.status_code == 500
    assert client.get("/stats").json() == {"cases": 0}  # rolled back, all or nothing


def test_the_real_repository_catches_the_save_before_mutate_bug(sql_sessions):
    with sql_sessions() as session, session.begin():
        repo = SqlCaseRepository(session)
        repo.add(CaseRecord("C-1", "gnome", "open", detective="wren"))
        BuggyCaseService(repo).close("C-1", "found")
    with sql_sessions() as session:
        assert SqlCaseRepository(session).get("C-1").status == "open"  # the bug, on disk
