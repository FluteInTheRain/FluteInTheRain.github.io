"""A fake repository: a real, working implementation, just not durable.

It behaves like storage on the one point that matters for tests: what you
save is a copy, and what you get back is a fresh copy. Change a record
after save() without saving again and the fake forgets the change, exactly
as a database row would.
"""

from dataclasses import replace

from layered_data import CaseRecord


class FakeCaseRepository:
    def __init__(self) -> None:
        self.rows: dict[str, CaseRecord] = {}

    def add(self, record: CaseRecord) -> None:
        self.rows[record.case_id] = replace(record)

    def get(self, case_id: str) -> CaseRecord | None:
        row = self.rows.get(case_id)
        return replace(row) if row else None

    def save(self, record: CaseRecord) -> None:
        self.rows[record.case_id] = replace(record)
