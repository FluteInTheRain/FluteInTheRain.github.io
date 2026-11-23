"""The backend series' tiny demo service — post 2 stage: a real REST shape.

trace_demo.py answered one URL; this file grows clue.api into a small,
honest API: a versioned APIRouter (the pattern from FastAPI's "bigger
applications" docs), resources named as nouns in the URL, verbs in the
HTTP methods, and status codes that report what actually happened.

The store is a plain dict, seeded with twelve cases so pagination has
something to paginate. It resets on every restart — a real database
layer arrives later in the series.

Run it with the stack the series posts are captured on:

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn rest_api:app --port 4326

Then, from another terminal:

    curl -i 'http://127.0.0.1:4326/v1/cases?limit=5'
    curl -i -X POST http://127.0.0.1:4326/v1/cases \
        -H 'Content-Type: application/json' \
        -d '{"title": "Ghost in the greenhouse", "priority": "normal"}'
"""

from fastapi import APIRouter, FastAPI, HTTPException, Query, Response, status
from pydantic import BaseModel

app = FastAPI(title="clue.api", version="1.0.0")

SEEDS = [
    ("Vanishing teapot", "normal"),
    ("Ghost in the library", "high"),
    ("Missing garden gnome", "normal"),
    ("The silent piano", "low"),
    ("Footprints on the roof", "high"),
    ("Broken streetlight", "normal"),
    ("The midnight violin", "low"),
    ("Stolen biscuit tin", "normal"),
    ("Greenhouse window ajar", "high"),
    ("The empty birdcage", "low"),
    ("Vanished fountain pen", "normal"),
    ("The unlocked bike shed", "normal"),
]

cases: dict[int, dict] = {}
next_id = 1
for title, priority in SEEDS:
    cases[next_id] = {"case_id": next_id, "title": title, "priority": priority}
    next_id += 1


class CaseIn(BaseModel):
    """What a caller may send — the request body."""

    title: str
    priority: str


class Case(CaseIn):
    """What the API returns — the stored case, with the id its URL names."""

    case_id: int


# One resource, one router, one version prefix. In a bigger service this
# router would live in its own module (routers/cases.py) and be included
# by the main app; the pattern and the code stay the same.
cases_router = APIRouter(prefix="/v1/cases", tags=["cases"])


@cases_router.get("")
def list_cases(
    limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0)
) -> list[Case]:
    """One page of the collection, ordered by case_id."""
    ids = sorted(cases)
    return [Case(**cases[i]) for i in ids[offset : offset + limit]]


@cases_router.post("", status_code=status.HTTP_201_CREATED)
def create_case(case: CaseIn, response: Response) -> Case:
    """Create a case; the response says 201 and where the new case lives."""
    global next_id
    case_id = next_id
    next_id += 1
    new_case = Case(case_id=case_id, title=case.title, priority=case.priority)
    cases[case_id] = new_case.model_dump()
    response.headers["Location"] = f"/v1/cases/{case_id}"
    return new_case


@cases_router.get("/{case_id}")
def get_case(case_id: int) -> Case:
    """Fetch one case — or admit it isn't there."""
    case = cases.get(case_id)
    if case is None:
        raise HTTPException(status_code=404, detail="case not found")
    return Case(**case)


@cases_router.put("/{case_id}")
def replace_case(case_id: int, case: CaseIn) -> Case:
    """Full replacement of one case. Same request twice, same result."""
    if case_id not in cases:
        raise HTTPException(status_code=404, detail="case not found")
    updated = Case(case_id=case_id, title=case.title, priority=case.priority)
    cases[case_id] = updated.model_dump()
    return updated


@cases_router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(case_id: int) -> None:
    """Delete one case. Nothing to return — 204 and an empty body."""
    if case_id not in cases:
        raise HTTPException(status_code=404, detail="case not found")
    del cases[case_id]


app.include_router(cases_router)
