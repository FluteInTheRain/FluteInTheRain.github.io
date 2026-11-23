# demo/ — the backend series' running demo service

The blog series **"How backend actually works"** (`src/content/blog/backend-*.mdx`)
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
| `rest_api.py` | `backend-rest-api-design` | The same service grown up: a versioned `/v1/cases` APIRouter — list with `?limit`/`?offset`, one case (404 when missing), POST with 201 + `Location`, PUT replace, DELETE 204 |
