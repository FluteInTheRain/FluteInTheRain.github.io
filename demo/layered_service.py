"""clue.api's service layer — the business rules, and nothing else.

What this module knows: how a case's workflow goes (open -> assign ->
close) and which moves the rules refuse. What it never imports: HTTP and
storage — it talks to the CaseRepository interface from layered_data.py,
so any implementation of that shape plugs in underneath.
"""

from layered_data import CaseRecord, CaseRepository


class CaseNotFoundError(Exception):
    """The workflow asked for a case that storage does not have."""


class CaseRuleError(Exception):
    """A rule refused the move — the web layer maps this to a 4xx."""


def _trace(msg: str) -> None:
    print(f"service | {msg}")


class CaseService:
    """The case workflow, rules enforced at every move."""

    def __init__(self, repo: CaseRepository) -> None:
        self._repo = repo
        self._next_id = 1

    def open_case(self, title: str) -> CaseRecord:
        _trace("open_case: the id and the open status are ours to set")
        case = CaseRecord(case_id=f"C-{self._next_id}", title=title, status="open")
        self._next_id += 1
        self._repo.add(case)
        return case

    def get_case(self, case_id: str) -> CaseRecord:
        return self._require(case_id)

    def assign(self, case_id: str, detective: str) -> CaseRecord:
        case = self._require(case_id)
        _trace(f"assign({case_id}): rule — only an open case can be taken")
        if case.status == "closed":
            raise CaseRuleError("a closed case cannot be assigned")
        case.detective = detective
        self._repo.save(case)
        return case

    def close(self, case_id: str, resolution: str) -> CaseRecord:
        case = self._require(case_id)
        _trace(f"close({case_id}): rule — a case closes with a detective on it")
        if case.detective is None:
            raise CaseRuleError("an unassigned case cannot be closed")
        case.status = "closed"
        case.resolution = resolution
        self._repo.save(case)
        return case

    def _require(self, case_id: str) -> CaseRecord:
        case = self._repo.get(case_id)
        if case is None:
            raise CaseNotFoundError(f"no case {case_id}")
        return case
