"""A second service, evidence-lab, that clue.api calls. Same logs, same header.

    TRACE=1 uvicorn p10_lab:app --port 4341
"""

import logging
import os
import time

from fastapi import FastAPI

import p10_logs
import p10_middleware

p10_logs.configure("evidence-lab")
log = logging.getLogger("lab")

app = FastAPI(title="evidence-lab")
p10_middleware.install(app)
if os.environ.get("TRACE") == "1":
    import p10_tracing

    p10_tracing.setup(app, "evidence-lab")


@app.get("/analyze/{case_id}")
def analyze(case_id: str) -> dict:
    delay = 1.2 if case_id == "C-7" else 0.05  # C-7 has a huge evidence set
    log.info("analysis started", extra={"case_id": case_id})
    time.sleep(delay)  # stands in for a slow forensic job
    return {"case_id": case_id, "match": "fingerprint"}
