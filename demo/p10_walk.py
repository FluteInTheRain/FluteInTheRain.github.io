"""Drive clue.api like a small morning of traffic, then read its own metrics.

    python p10_walk.py   # with clue.api on :4340 and evidence-lab on :4341
"""

import httpx

BASE = "http://127.0.0.1:4340"
ROUTE = "/cases/{case_id}/report"

with httpx.Client(base_url=BASE, timeout=10) as c:
    for n in range(1, 9):
        c.post("/cases", params={"title": f"case {n}"})
        c.post(f"/cases/C-{n}/assign", params={"detective": "Holmes"})
    for _ in range(5):  # forty reports, one of the eight cases is the slow one
        for n in range(1, 9):
            c.get(f"/cases/C-{n}/report")
    scrape = c.get("/metrics").text

rows = [ln for ln in scrape.splitlines() if ROUTE in ln and not ln.startswith("#")]
buckets = [ln for ln in rows if "_bucket" in ln]
total = float(next(ln for ln in rows if "_sum" in ln).split()[-1])
count = float(next(ln for ln in rows if "_count" in ln).split()[-1])
for ln in buckets:
    print(ln)
print(f"average = {total / count * 1000:.0f} ms over {count:.0f} requests")
