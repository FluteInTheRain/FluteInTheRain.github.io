"""Contract check: the OpenAPI document the app generates must match the committed one.

A renamed field, a changed type or a removed route changes the document and
fails here, in CI, before a client finds out. To accept a change on purpose:
    python p09_snapshot.py    (then review the diff of the snapshot in git)
"""

import difflib
import json
from pathlib import Path

import pytest

from layered_app import app

SNAPSHOT = Path(__file__).with_name("openapi.snapshot.json")


def as_lines(document: dict) -> list[str]:
    return json.dumps(document, indent=2, sort_keys=True).splitlines()


def test_openapi_matches_the_committed_snapshot():
    committed = as_lines(json.loads(SNAPSHOT.read_text()))
    generated = as_lines(app.openapi())
    diff = list(difflib.unified_diff(committed, generated, "committed", "generated", lineterm="", n=1))
    if diff:
        pytest.fail("the API contract changed:\n" + "\n".join(diff), pytrace=False)
