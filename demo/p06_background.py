import time

from fastapi import BackgroundTasks, FastAPI

app = FastAPI(title="clue.api: after the response")

T0 = time.perf_counter()


def log(msg: str) -> None:
    print(f"[+{time.perf_counter() - T0:5.2f} s] {msg}", flush=True)


def build_report(case_id: str) -> None:
    log(f"report for {case_id}: started")
    time.sleep(2)  # stands in for slow work: a PDF, a mail, a data export
    log(f"report for {case_id}: finished")


@app.post("/cases/{case_id}/report", status_code=202)
async def request_report(case_id: str, background: BackgroundTasks) -> dict:
    background.add_task(build_report, case_id)  # runs after the response is sent
    log(f"{case_id}: returning 202")
    return {"status": "accepted"}
