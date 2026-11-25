"""API tests: the real routes and handlers, a fake repository via dependency_overrides."""

import httpx
import pytest
from fastapi.testclient import TestClient

from layered_data import CaseRecord
from p04_depends import app, get_repo


@pytest.fixture
def client(fake_repo):
    app.dependency_overrides[get_repo] = lambda: fake_repo
    yield TestClient(app)
    app.dependency_overrides.clear()  # the app object is module-global: always clean up


def test_open_returns_201_and_the_case(client, fake_repo):
    response = client.post("/cases", params={"title": "The missing gnome"})
    assert response.status_code == 201
    assert response.json() == {
        "case_id": "C-1",
        "title": "The missing gnome",
        "status": "open",
        "detective": None,
        "resolution": None,
    }
    assert fake_repo.rows["C-1"].title == "The missing gnome"


def test_rule_error_becomes_409_with_the_reason(client, fake_repo):
    fake_repo.add(CaseRecord("C-1", "gnome", "open"))
    response = client.post("/cases/C-1/close", params={"resolution": "x"})
    assert response.status_code == 409
    assert response.json() == {"detail": "an unassigned case cannot be closed"}


def test_missing_case_becomes_404(client):
    response = client.post("/cases/C-9/close", params={"resolution": "x"})
    assert response.status_code == 404


def test_missing_parameter_is_a_422(client):
    assert client.post("/cases").status_code == 422


@pytest.mark.anyio
async def test_same_app_through_an_async_client(fake_repo):
    app.dependency_overrides[get_repo] = lambda: fake_repo
    try:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post("/cases", params={"title": "async"})
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 201
