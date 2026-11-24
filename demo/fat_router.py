"""clue.api before layering — everything the endpoint needs, inside the endpoint.

Parse, validate, business rules, id generation, storage and response
shaping all live in the router functions. It works — curl passes, the demo
is convincing — and every future change (a new rule, a new field, a real
database) lands in this same file, next to everything else.

Run it with the stack the series posts are captured on:

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        uvicorn fat_router:app --port 4328

Then, from another terminal:

    curl -X POST http://127.0.0.1:4328/cases \
        -H 'content-type: application/json' -d '{"title": "The missing gnome"}'
"""

from fastapi import FastAPI, HTTPException

app = FastAPI(title="clue.api", version="0.4.0")

# Storage and id generation live here too — module-level state.
CASES: dict[str, dict] = {}
_next_id = 1


@app.post("/cases", status_code=201)
async def open_case(body: dict) -> dict:
    # 1. parse + validate
    title = str(body.get("title", "")).strip()
    if not title or len(title) > 80:
        raise HTTPException(status_code=422, detail="title must be 1-80 chars")
    # 2. business rules and id generation
    global _next_id
    case_id = f"C-{_next_id}"
    _next_id += 1
    # 3. storage
    case = {
        "case_id": case_id,
        "title": title,
        "status": "open",
        "detective": None,
        "resolution": None,
    }
    CASES[case_id] = case
    # 4. response shaping — same function
    return case


@app.post("/cases/{case_id}/close")
async def close_case(case_id: str, body: dict) -> dict:
    case = CASES.get(case_id)  # storage, again
    if case is None:
        raise HTTPException(status_code=404, detail=f"no case {case_id}")
    if case["status"] == "closed":  # rule #1, inline
        raise HTTPException(status_code=409, detail="case already closed")
    if case["detective"] is None:  # rule #2, inline
        raise HTTPException(status_code=409, detail="assign a detective first")
    # rule #3, mixed into the storage write
    case["status"] = "closed"
    case["resolution"] = str(body.get("resolution", "")).strip()
    return case
