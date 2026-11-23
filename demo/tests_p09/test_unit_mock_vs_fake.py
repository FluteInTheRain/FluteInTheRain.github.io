"""The same check twice: with a mock, then with a fake. Only one of them can see the bug."""

from unittest.mock import MagicMock

import pytest

from layered_data import CaseRecord
from layered_service import CaseService
from p09_buggy_service import BuggyCaseService

SERVICES = [
    CaseService,
    pytest.param(
        BuggyCaseService,
        marks=pytest.mark.xfail(strict=True, reason="the fake catches the bug"),
    ),
]
ALL = [CaseService, BuggyCaseService]


@pytest.mark.parametrize("service_cls", ALL)
def test_close_with_a_mock(service_cls):
    repo = MagicMock()
    repo.get.return_value = CaseRecord("C-1", "gnome", "open", detective="wren")

    service_cls(repo).close("C-1", "found")

    repo.save.assert_called_once()  # "save was called": true for both classes


@pytest.mark.parametrize("service_cls", SERVICES)
def test_close_with_a_fake(service_cls, fake_repo):
    fake_repo.add(CaseRecord("C-1", "gnome", "open", detective="wren"))

    service_cls(fake_repo).close("C-1", "found")

    assert fake_repo.get("C-1").status == "closed"  # what storage really holds
