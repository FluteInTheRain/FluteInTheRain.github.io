"""Unit tests: the case rules, a fake repository, no FastAPI, no database."""

import pytest

from layered_data import CaseRecord
from layered_service import CaseNotFoundError, CaseRuleError


def test_open_case_sets_id_and_status(service, fake_repo):
    case = service.open_case("The missing gnome")
    assert (case.case_id, case.status) == ("C-1", "open")
    assert fake_repo.rows["C-1"].title == "The missing gnome"


def test_ids_count_up(service):
    assert [service.open_case(t).case_id for t in "abc"] == ["C-1", "C-2", "C-3"]


def test_assign_is_persisted(service, fake_repo):
    service.open_case("gnome")
    service.assign("C-1", "wren")
    assert fake_repo.rows["C-1"].detective == "wren"


def test_close_is_persisted(service, fake_repo):
    service.open_case("gnome")
    service.assign("C-1", "wren")
    service.close("C-1", "found in the pond")
    stored = fake_repo.rows["C-1"]
    assert (stored.status, stored.resolution) == ("closed", "found in the pond")


def test_cannot_close_without_a_detective(service, fake_repo):
    service.open_case("gnome")
    with pytest.raises(CaseRuleError, match="unassigned"):
        service.close("C-1", "x")
    assert fake_repo.rows["C-1"].status == "open"  # and nothing was half-written


def test_cannot_assign_a_closed_case(service):
    service.open_case("gnome")
    service.assign("C-1", "wren")
    service.close("C-1", "done")
    with pytest.raises(CaseRuleError, match="closed"):
        service.assign("C-1", "kite")


@pytest.mark.parametrize("move", ["get_case", "assign", "close"])
def test_unknown_case_is_not_found(service, move):
    args = {"get_case": ("C-9",), "assign": ("C-9", "wren"), "close": ("C-9", "x")}
    with pytest.raises(CaseNotFoundError):
        getattr(service, move)(*args[move])


# The whole rulebook as a table: (status, detective, move) -> what the rules say.
MOVES = {
    "assign": lambda s: s.assign("C-1", "kite"),
    "close": lambda s: s.close("C-1", "done"),
}


@pytest.mark.parametrize(
    "status, detective, move, refused",
    [
        ("open", None, "assign", False),
        ("open", "wren", "assign", False),
        ("closed", "wren", "assign", True),
        ("open", None, "close", True),
        ("open", "wren", "close", False),
        ("closed", "wren", "close", False),
    ],
)
def test_rulebook(service, fake_repo, status, detective, move, refused):
    fake_repo.add(CaseRecord("C-1", "gnome", status, detective))
    if refused:
        with pytest.raises(CaseRuleError):
            MOVES[move](service)
    else:
        MOVES[move](service)
