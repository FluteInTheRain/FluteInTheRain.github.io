"""Post 2 add-on: /v1 and /v2 side by side.

v1 is the promise already made: responses keep {case_id, title, priority}.
v2 is the breaking change (title becomes name), so it ships under a new
prefix while v1 keeps answering exactly as before.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn p02_versions:app --port 4332
"""

from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="clue.api versions demo")

STORE = {3: {"title": "Missing garden gnome", "priority": "normal"}}


class CaseV1(BaseModel):
    case_id: int
    title: str
    priority: str


class CaseV2(BaseModel):
    case_id: int
    name: str  # renamed from title: a breaking change
    priority: str


v1 = APIRouter(prefix="/v1/cases", tags=["v1"])
v2 = APIRouter(prefix="/v2/cases", tags=["v2"])


@v1.get("/{case_id}")
def get_case_v1(case_id: int) -> CaseV1:
    if case_id not in STORE:
        raise HTTPException(status_code=404, detail="case not found")
    return CaseV1(case_id=case_id, **STORE[case_id])


@v2.get("/{case_id}")
def get_case_v2(case_id: int) -> CaseV2:
    if case_id not in STORE:
        raise HTTPException(status_code=404, detail="case not found")
    row = STORE[case_id]
    return CaseV2(case_id=case_id, name=row["title"], priority=row["priority"])


app.include_router(v1)
app.include_router(v2)
