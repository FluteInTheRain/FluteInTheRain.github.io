"""The backend series' tiny demo service — post 3 stage: typed boundaries.

clue.api grows case intake. The endpoint takes a Pydantic v2 model, so input
is checked at the boundary — FastAPI answers bad JSON with a structured 422
before the handler runs — and answers with a response_model, so internal
fields cannot leak back out. POST /cases/raw is the untyped twin: it takes
any dict, which is exactly what AI-generated endpoints usually do.

Run it with the stack the series posts are captured on:

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn schemas:app --port 4327

Then, from another terminal:

    curl -s -X POST http://127.0.0.1:4327/cases/raw \
        -H 'content-type: application/json' -d '{"title": "???"}'
    curl -s -X POST http://127.0.0.1:4327/cases \
        -H 'content-type: application/json' -d '{"title": "???"}'
"""

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="clue.api", version="0.2.0")


class CaseCreate(BaseModel):
    """What a new case must prove at the door to be let in."""

    title: str = Field(min_length=3, max_length=120)
    case_code: str = Field(pattern=r"^CLUE-[0-9]{4}$")
    priority: int = Field(ge=1, le=5, description="1 = someday, 5 = drop everything")
    reward: float = Field(ge=0, le=100_000)


class CaseOut(BaseModel):
    """The contract callers see: no reporter IP, no triage score."""

    case_id: str
    title: str
    case_code: str
    priority: int
    reward: float
    status: str
    opened_at: datetime


@app.post("/cases/raw")
async def create_case_raw(payload: dict) -> dict:
    """The untyped version: anything that parses as JSON is 'valid' here."""
    return {"accepted": payload}


@app.post("/cases", response_model=CaseOut, status_code=201)
async def create_case(case: CaseCreate) -> dict:
    # Proof in the captures: this line never runs when validation fails —
    # the 422 is emitted before the handler is called.
    print(f"handler running: {case.case_code}")
    # The boundary already did its job: every field of `case` is in range
    # and the code matches the pattern. The handler only builds the record.
    record = {
        "case_id": uuid4().hex[:8],
        **case.model_dump(),
        "status": "open",
        "opened_at": datetime.now(timezone.utc),
        # Two fields no caller should ever see:
        "reporter_ip": "203.0.113.7",
        "triage_score": 87,
    }
    return record
