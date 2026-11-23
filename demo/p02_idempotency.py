"""Post 2 add-on: an Idempotency-Key on POST /v1/cases.

FastAPI has no built-in idempotency support. This is the small version of
what Stripe describes: the client sends a unique key with the POST, the
server runs the create once, stores the response under that key, and
replays the stored answer to any retry that carries the same key.

The store is a plain dict (one process, lost on restart). A real service
would keep it in a database or Redis, and expire keys after about a day.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn p02_idempotency:app --port 4332
"""

from fastapi import FastAPI, Header, Response, status
from pydantic import BaseModel

app = FastAPI(title="clue.api idempotency demo")


class CaseIn(BaseModel):
    title: str
    priority: str


class Case(CaseIn):
    case_id: int


cases: dict[int, Case] = {}
next_id = 1
# key -> the case that key already created
replays: dict[str, Case] = {}


@app.post("/v1/cases", status_code=status.HTTP_201_CREATED)
def create_case(
    case: CaseIn,
    response: Response,
    idempotency_key: str | None = Header(default=None),
) -> Case:
    """Create a case once per Idempotency-Key; replay the saved answer on retries."""
    global next_id
    if idempotency_key is not None and idempotency_key in replays:
        saved = replays[idempotency_key]
        response.headers["Location"] = f"/v1/cases/{saved.case_id}"
        response.headers["Idempotent-Replayed"] = "true"
        return saved
    new_case = Case(case_id=next_id, **case.model_dump())
    next_id += 1
    cases[new_case.case_id] = new_case
    if idempotency_key is not None:
        replays[idempotency_key] = new_case
    response.headers["Location"] = f"/v1/cases/{new_case.case_id}"
    return new_case


@app.get("/v1/cases")
def list_cases() -> list[Case]:
    return list(cases.values())
