"""A plausible AI "refactor" of CaseService.close — with one wrong line order.

It saves first and sets the fields afterwards. Against InMemoryCaseRepository
that goes unnoticed (the repository holds the very same object, so the late
assignments show up anyway). Against anything that stores a copy, such as a
database row, the closed status is silently lost.
"""

from layered_service import CaseRecord, CaseRuleError, CaseService


class BuggyCaseService(CaseService):
    def close(self, case_id: str, resolution: str) -> CaseRecord:
        case = self._require(case_id)
        if case.detective is None:
            raise CaseRuleError("an unassigned case cannot be closed")
        self._repo.save(case)  # saved too early: status is still "open" here
        case.status = "closed"
        case.resolution = resolution
        return case
