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
