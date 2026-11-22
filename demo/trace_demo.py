"""The backend series' tiny demo service — pilot stage (post 1).

One endpoint, one middleware that prints what the ASGI stack sees, so the
request lifecycle can be traced from the server's own point of view.

Run it with the stack the series posts are captured on:

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn trace_demo:app --port 4324

Then, from another terminal:

    curl http://127.0.0.1:4324/cases/42
"""

import time

from fastapi import FastAPI, Request

app = FastAPI(title="clue.api", version="0.1.0")


@app.middleware("http")
async def trace_middleware(request: Request, call_next):
    scope = request.scope
    print(
        f"ASGI scope: type={scope['type']} scheme={scope['scheme']}"
        f" http_version={scope.get('http_version')}"
    )
    print(f"app -> router -> endpoint: {request.method} {request.url.path}")
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000
    print(
        f"endpoint returned, response back through the stack:"
        f" {response.status_code} in {elapsed_ms:.2f} ms"
    )
    return response


@app.get("/cases/{case_id}")
async def get_case(case_id: int) -> dict:
    return {"case_id": case_id, "status": "open"}
