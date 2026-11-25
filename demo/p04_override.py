"""Test the endpoints' rules with a fake repository, no server and no port.

app.dependency_overrides swaps get_repo for a fake; TestClient calls the
app in-process. The service, the exception handlers and the routes run for real.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with httpx python -W ignore p04_override.py
"""

from fastapi.testclient import TestClient

from layered_data import CaseRecord
from p04_depends import app, get_repo


class FakeRepository:
    def __init__(self) -> None:
        self.records: dict[str, CaseRecord] = {}

    def add(self, record: CaseRecord) -> None:
        self.records[record.case_id] = record

    def __len__(self) -> int:
        return len(self.records)

    def get(self, case_id: str) -> CaseRecord | None:
        return self.records.get(case_id)

    def save(self, record: CaseRecord) -> None:
        self.records[record.case_id] = record


fake = FakeRepository()
app.dependency_overrides[get_repo] = lambda: fake
client = TestClient(app)

opened = client.post("/cases", params={"title": "The missing gnome"})
print("open   ->", opened.status_code, opened.json()["case_id"])

refused = client.post("/cases/C-1/close", params={"resolution": "given up"})
print("close  ->", refused.status_code, refused.json()["detail"])

missing = client.post("/cases/C-9/close", params={"resolution": "x"})
print("ghost  ->", missing.status_code, missing.json()["detail"])

fake.records["C-1"].detective = "wren"
closed = client.post("/cases/C-1/close", params={"resolution": "found"})
print("close  ->", closed.status_code, closed.json()["status"])
print("fake saw", len(fake.records), "record; the real dict was never touched")

app.dependency_overrides.clear()
