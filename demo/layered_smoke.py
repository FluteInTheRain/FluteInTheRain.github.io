"""Drive clue.api's service layer directly — no server, no HTTP, no FastAPI.

If the rules live in their own layer, plain Python can exercise them: a
fake repository stands in for storage, and the rules neither know nor
care. Both scenarios below call the same CaseService the endpoints call.

    cd demo
    uv run --python 3.13 layered_smoke.py
"""

from layered_data import CaseRecord, CaseRepository, InMemoryCaseRepository
from layered_service import CaseRuleError, CaseService


class FakeRepository:
    """Same shape as CaseRepository, none of the storage machinery:
    it keeps records in a list and counts the saves."""

    def __init__(self) -> None:
        self.records: list[CaseRecord] = []
        self.saves = 0

    def add(self, record: CaseRecord) -> None:
        self.records.append(record)

    def get(self, case_id: str) -> CaseRecord | None:
        return next((r for r in self.records if r.case_id == case_id), None)

    def save(self, record: CaseRecord) -> None:
        self.saves += 1


def run_scenario(repo: CaseRepository) -> None:
    service = CaseService(repo)
    case = service.open_case(title="The missing gnome")
    print(f"    opened {case.case_id}: {case.title}")
    try:
        service.close(case.case_id, resolution="given up")
    except CaseRuleError as exc:
        print(f"    close refused -> {exc}")
    service.assign(case.case_id, detective="wren")
    case = service.close(case.case_id, resolution="gnome found under the hydrangeas")
    print(f"    closed {case.case_id}: detective={case.detective}")


print("[1] rules with a fake repository — no FastAPI, no HTTP, no storage")
fake = FakeRepository()
run_scenario(fake)
print(f"    save() calls the fake saw: {fake.saves} (nothing real stored)\n")

print("[2] the same rules with InMemoryCaseRepository — storage swapped, rules unchanged")
run_scenario(InMemoryCaseRepository())
