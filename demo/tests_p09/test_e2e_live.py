"""End to end: a real uvicorn process, real sockets, a real login."""

import os
import socket
import subprocess
import sys
import time
from pathlib import Path

import httpx
import pytest

PORT = int(os.environ.get("P09_PORT", "4339"))
DEMO = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="module")
def base_url():
    server = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "p07_bola:app", "--port", str(PORT), "--log-level", "warning"],
        cwd=DEMO,
    )
    try:
        for _ in range(100):  # wait until the port accepts connections
            with socket.socket() as probe:
                if probe.connect_ex(("127.0.0.1", PORT)) == 0:
                    break
            time.sleep(0.1)
        else:
            pytest.fail("uvicorn did not start")
        yield f"http://127.0.0.1:{PORT}"
    finally:
        server.terminate()
        server.wait(timeout=10)


def login(base_url: str, user: str, password: str) -> dict:
    form = {"username": user, "password": password, "scope": "cases:read"}
    token = httpx.post(f"{base_url}/token", data=form).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_login_then_read_own_case(base_url):
    headers = login(base_url, "alice", "alice-demo-pw")
    response = httpx.get(f"{base_url}/cases/C-1", headers=headers)
    assert response.status_code == 200


def test_a_valid_login_still_cannot_read_someone_elses_case(base_url):
    headers = login(base_url, "bob", "bob-demo-pw")
    assert httpx.get(f"{base_url}/cases/C-1", headers=headers).status_code == 404
