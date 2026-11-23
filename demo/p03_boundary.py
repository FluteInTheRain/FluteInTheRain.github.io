"""Post 3, second demo: where each request value lands, and how the door talks back.

One endpoint, three kinds of input (path, query, body), constraints on all of
them, a body model that refuses unknown fields, and one exception handler that
reshapes FastAPI's 422.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn p03_boundary:app --port 4333
"""

from typing import Annotated

from fastapi import FastAPI, Path, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

app = FastAPI(title="clue.api", version="0.2.1")


class Draft(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: Annotated[str, Field(min_length=3, max_length=120)]
    priority: Annotated[int, Field(ge=1, le=5)] = 3


class DraftSaved(BaseModel):
    case_id: str
    title: str
    priority: int
    dry_run: bool


@app.put("/cases/{case_id}/draft")
async def save_draft(
    case_id: Annotated[str, Path(pattern=r"^[0-9a-f]{8}$")],
    draft: Draft,
    dry_run: Annotated[bool, Query()] = False,
) -> DraftSaved:
    return DraftSaved(case_id=case_id, dry_run=dry_run, **draft.model_dump())


@app.exception_handler(RequestValidationError)
async def flat_422(request: Request, exc: RequestValidationError) -> JSONResponse:
    fields = {".".join(str(part) for part in e["loc"]): e["msg"] for e in exc.errors()}
    return JSONResponse(status_code=422, content={"error": "invalid_request", "fields": fields})
