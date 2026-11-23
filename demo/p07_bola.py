from typing import Annotated

from fastapi import FastAPI, HTTPException, Security

import p07_security as sec

# case_id -> who opened it. The owner is data, not a login detail.
CASES = {
    "C-1": {"owner": "alice", "title": "The missing gnome", "notes": "suspect: the neighbour"},
    "C-2": {"owner": "bob", "title": "The squeaky stair", "notes": "witness: the cat"},
}

app = FastAPI(title="clue.api", version="0.7.1")
app.include_router(sec.router)


# BEFORE: checks "who are you" and "may you read cases", never "is this YOUR case".
@app.get("/vulnerable/cases/{case_id}")
async def read_case_vulnerable(
    case_id: str,
    user: Annotated[str, Security(sec.get_current_user, scopes=["cases:read"])],
) -> dict:
    case = CASES.get(case_id)
    if case is None:
        raise HTTPException(404, "no such case")
    return case


# AFTER: the object-level check. 404 (not 403) so other people's ids stay unguessable.
@app.get("/cases/{case_id}")
async def read_case(
    case_id: str,
    user: Annotated[str, Security(sec.get_current_user, scopes=["cases:read"])],
) -> dict:
    case = CASES.get(case_id)
    if case is None or case["owner"] != user:
        raise HTTPException(404, "no such case")
    return case
