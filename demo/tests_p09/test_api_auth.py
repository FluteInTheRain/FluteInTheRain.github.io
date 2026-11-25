"""Auth tests: real tokens where the rule is auth, an override where it is not."""

import pytest
from fastapi.testclient import TestClient

import p07_bola
import p07_security as sec

client = TestClient(p07_bola.app)


def bearer(user: str, scopes: list[str]) -> dict:
    return {"Authorization": f"Bearer {sec.make_token(user, scopes)}"}


def test_owner_reads_own_case():
    response = client.get("/cases/C-1", headers=bearer("alice", ["cases:read"]))
    assert response.status_code == 200
    assert response.json()["title"] == "The missing gnome"


def test_other_users_case_looks_like_it_does_not_exist():
    response = client.get("/cases/C-1", headers=bearer("bob", ["cases:read"]))
    assert response.status_code == 404


def test_no_token_is_401():
    assert client.get("/cases/C-1").status_code == 401


def test_missing_scope_is_403_with_the_scope_named():
    response = client.post("/purge", headers=bearer("bob", ["cases:read"]))
    assert response.status_code == 403
    assert "cases:write" in response.json()["detail"]


@pytest.fixture
def as_bob():
    p07_bola.app.dependency_overrides[sec.get_current_user] = lambda: "bob"
    yield
    p07_bola.app.dependency_overrides.clear()


def test_override_is_fine_for_testing_the_owner_rule(as_bob):
    assert client.get("/cases/C-2").status_code == 200  # no token built at all
    assert client.get("/cases/C-1").status_code == 404


def test_override_also_switches_the_scope_check_off(as_bob):
    # Bob holds no cases:write, yet /purge answers 200: the override replaced
    # the very function that enforces scopes. Keep a real-token test (above).
    assert client.post("/purge").status_code == 200
