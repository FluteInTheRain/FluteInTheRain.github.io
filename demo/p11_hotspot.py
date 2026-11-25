"""A slow route nobody can explain by reading it, plus a ?profile=1 switch.

    cd demo
    uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
        --with pyinstrument uvicorn p11_hotspot:app --port 4362
"""

from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from pyinstrument import Profiler

app = FastAPI(title="clue.api", version="0.11.1")


@app.middleware("http")
async def profile_on_request(request: Request, call_next):
    if request.query_params.get("profile") != "1":
        return await call_next(request)
    profiler = Profiler(async_mode="enabled")
    profiler.start()
    await call_next(request)
    profiler.stop()
    text = profiler.output_text(
        unicode=False, color=False, processor_options={"hide_regex": r".*site-packages.*"}
    )
    return PlainTextResponse(text)


def dedupe(items: list[str]) -> list[str]:
    seen: list[str] = []
    for item in items:
        if item not in seen:
            seen.append(item)
    return seen


def score(evidence: list[str]) -> int:
    return len(dedupe(evidence))


@app.get("/cases/{case_id}/score")
async def case_score(case_id: str) -> dict:
    evidence = [f"clue-{i % 2500}" for i in range(10000)]
    return {"case_id": case_id, "distinct_clues": score(evidence)}


@app.get("/health")
async def health() -> dict:
    return {"ok": True}
