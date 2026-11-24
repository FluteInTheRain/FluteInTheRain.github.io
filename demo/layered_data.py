"""clue.api's data layer — the storage half of the layered app.

Records and where they live, nothing else: no business rules (those live
in layered_service.py), no HTTP, no framework import.

CaseRepository is the seam: the interface the service layer depends on,
not an implementation. InMemoryCaseRepository is today's implementation;
when this series reaches its data-access post, a real database takes over
down here and the two files above it do not change.
"""

from dataclasses import dataclass
from typing import Protocol


@dataclass
class CaseRecord:
    case_id: str
    title: str
    status: str
    detective: str | None = None
    resolution: str | None = None


class CaseRepository(Protocol):
    """The shape of storage, as the service layer sees it."""

    def add(self, record: CaseRecord) -> None: ...
    def get(self, case_id: str) -> CaseRecord | None: ...
    def save(self, record: CaseRecord) -> None: ...


class InMemoryCaseRepository:
    """Today's implementation: the records live in one process dict."""

    def __init__(self) -> None:
        self._cases: dict[str, CaseRecord] = {}

    def add(self, record: CaseRecord) -> None:
        self._cases[record.case_id] = record
        print(f"data    | add({record.case_id}) -> in-memory store")

    def get(self, case_id: str) -> CaseRecord | None:
        print(f"data    | get({case_id}) <- in-memory store")
        return self._cases.get(case_id)

    def save(self, record: CaseRecord) -> None:
        self._cases[record.case_id] = record
        print(f"data    | save({record.case_id}) -> in-memory store")
