"""What AI-written tests often look like: green, and nearly worthless.

Not collected by the suite (the file name has no test_ prefix). Run it on purpose:

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with httpx --with pytest pytest p09_weak_tests.py
"""

from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from layered_data import CaseRecord
from p04_depends import app, get_service

client = TestClient(app)


def test_close_returns_ok():
    service = MagicMock()  # replaces the very thing the endpoint exists to call
    service.close.return_value = CaseRecord("C-1", "gnome", "closed", "wren", "found")
    app.dependency_overrides[get_service] = lambda: service
    try:
        response = client.post("/cases/C-1/close", params={"resolution": "found"})
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 200
    service.close.assert_called_once()


def test_open_returns_201():
    response = client.post("/cases", params={"title": "The missing gnome"})
    assert response.status_code == 201  # the body, the id, the status: never looked at
