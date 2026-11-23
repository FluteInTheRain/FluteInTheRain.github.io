# demo/ — the backend series' running demo service

The blog series **"Backend with Python FastAPI"** (`src/content/blog/backend-*.mdx`)
traces one small FastAPI service across its 12 posts: it starts as the trace
skeleton below and gains layers, a database, auth, tests, observability and
deploys as the series goes on. Keeping the code in the repo is what makes every
"captured locally" screenshot and terminal block in the posts reproducible.

## Stack

The posts are captured on the exact stack shown in their terminal labels:

- Python 3.13
- FastAPI 0.165.0
- uvicorn (via `uvicorn[standard]`)

`uv` fetches that stack on the fly — nothing needs to be installed globally:

```sh
cd demo
uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
    uvicorn trace_demo:app --port 4324
```

## Files (so far)

| File | Post | What it shows |
|---|---|---|
| `trace_demo.py` | `backend-http-request-lifecycle` | One `/cases/{case_id}` endpoint plus an HTTP middleware printing the ASGI `scope`, the dispatch chain, and the response round trip |
| `station_timing.py` | `backend-http-request-lifecycle` | Raw-socket walk paying each station of one HTTPS request separately: DNS, TCP, TLS, then the first response bytes |
| `reuse_timing.py` | `backend-http-request-lifecycle` | First vs second `GET` on one pooled `httpx.Client` connection — what keep-alive buys |
| `p01_raw_asgi.py` | `backend-http-request-lifecycle` | A framework-free ASGI app: uvicorn hands it a `scope` dict, and it answers with two `send()` calls |
| `rest_api.py` | `backend-rest-api-design` | The same service grown up: a versioned `/v1/cases` APIRouter — list with `?limit`/`?offset`, one case (404 when missing), POST with 201 + `Location`, PUT replace, DELETE 204 |
| `p02_idempotency.py` | `backend-rest-api-design` | POST /v1/cases with an `Idempotency-Key` header; a retry with the same key replays the saved response instead of creating a second case |
| `p02_versions.py` | `backend-rest-api-design` | `/v1` and `/v2` routers side by side; v2 renames `title` to `name` while v1 keeps its shape |
| `schemas.py` | `backend-validation-schemas` | clue.api case intake behind typed boundaries: a Pydantic v2 `CaseCreate` with length/pattern/range constraints, an untyped `POST /cases/raw` twin for contrast, and a `CaseOut` response model that filters internal fields out of the 201 |
| `p03_boundary.py` | `backend-validation-schemas` | One `PUT /cases/{case_id}/draft`: path/query/body parameter sources with `Annotated` constraints, `extra="forbid"`, a `RequestValidationError` handler that flattens the 422, and the `openapi.json` it generates |
| `fat_router.py` | `backend-layered-architecture` | The "before": parsing, rules, id generation, storage and response shaping all inside the endpoint functions |
| `layered_data.py` | `backend-layered-architecture` | The data layer: `CaseRecord` plus `CaseRepository` (a `Protocol` seam) and today's in-memory implementation |
| `layered_service.py` | `backend-layered-architecture` | The service layer: the case workflow (open → assign → close) and the rules each move must pass, framework-free |
| `layered_app.py` | `backend-layered-architecture` | The web layer: thin `APIRouter` endpoints, one middleware tracing web → service → data with timings, and the two exception handlers that map domain errors to status codes |
| `layered_smoke.py` | `backend-layered-architecture` | The payoff: the same service rules driven by plain Python with a fake repository, then with the in-memory one — no server needed |
| `p04_depends.py` | `backend-layered-architecture` | The same layers wired with `Depends`: cached `get_repo`, `get_service`, and endpoints that ask for the service in their signature |
| `p04_override.py` | `backend-layered-architecture` | `app.dependency_overrides` plus `TestClient`: the endpoints' rules driven over HTTP with a fake repository, no server |
