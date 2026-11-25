"""Fire N requests with C in flight, then print the latency percentiles.

    python p11_measure.py http://127.0.0.1:4360 /cases/C-1/report 400 8
"""

import asyncio
import math
import statistics
import sys
import time
from collections import Counter

import httpx


def pct(sorted_ms: list[float], p: float) -> float:
    """Nearest-rank percentile: the smallest value with p% of samples at or below."""
    return sorted_ms[max(0, math.ceil(p / 100 * len(sorted_ms)) - 1)]


async def worker(client: httpx.AsyncClient, path: str, jobs: asyncio.Queue, out: list) -> None:
    while True:
        try:
            jobs.get_nowait()
        except asyncio.QueueEmpty:
            return
        started = time.perf_counter()
        try:
            response = await client.get(path)
            status = response.status_code
        except httpx.TimeoutException:
            response, status = None, 0
        out.append((status, (time.perf_counter() - started) * 1000))
        if status == 503 and response is not None:  # a polite client obeys Retry-After
            await asyncio.sleep(float(response.headers.get("retry-after", "0")))


async def main(base: str, path: str, n: int, c: int) -> None:
    jobs: asyncio.Queue = asyncio.Queue()
    for _ in range(n):
        jobs.put_nowait(1)
    out: list[tuple[int, float]] = []
    async with httpx.AsyncClient(base_url=base, timeout=30) as client:
        wall = time.perf_counter()
        await asyncio.gather(*(worker(client, path, jobs, out) for _ in range(c)))
        wall = time.perf_counter() - wall
    codes = dict(Counter(status for status, _ in out))
    print(f"{path}  n={n} in-flight={c}  wall={wall:.1f}s  statuses={codes}")
    for label, keep in (("200 only", lambda s: s == 200), ("all", lambda s: True)):
        ms = sorted(m for status, m in out if keep(status))
        if not ms or (label == "all" and len(codes) == 1):
            continue
        print(
            f"  {label:8}: mean={statistics.fmean(ms):.0f}ms  p50={pct(ms, 50):.0f}ms"
            f"  p95={pct(ms, 95):.0f}ms  p99={pct(ms, 99):.0f}ms  max={ms[-1]:.0f}ms"
        )


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])))
