"""A tiny load check: N requests, a few at a time, fail if p95 is over a bound.

    uvicorn p05_nplus1:app --port 4339      (in another terminal)
    python p09_burst.py http://127.0.0.1:4339 '/eager?limit=100' 200 5 70

Arguments: base url, path, request count, concurrency, p95 bound in ms.
Exit code 1 when the bound is broken, so CI can run it as a plain step.
"""

import asyncio
import statistics
import sys
import time

import httpx


async def one(client: httpx.AsyncClient, path: str, gate: asyncio.Semaphore) -> float:
    async with gate:  # at most `concurrency` requests in flight
        started = time.perf_counter()
        response = await client.get(path)
        response.raise_for_status()
        return (time.perf_counter() - started) * 1000


async def main(base: str, path: str, n: int, concurrency: int, bound_ms: float) -> int:
    gate = asyncio.Semaphore(concurrency)
    async with httpx.AsyncClient(base_url=base, timeout=60) as client:
        await client.get(path)  # warm-up: first request pays connection and import costs
        started = time.perf_counter()
        times = sorted(await asyncio.gather(*(one(client, path, gate) for _ in range(n))))
        wall = time.perf_counter() - started
    p50 = statistics.median(times)
    p95 = times[int(len(times) * 0.95) - 1]
    verdict = "ok" if p95 <= bound_ms else "FAIL"
    print(
        f"GET {path} x{n} at {concurrency}: {n / wall:.0f} req/s | "
        f"p50 {p50:.1f} ms | p95 {p95:.1f} ms | max {times[-1]:.1f} ms | "
        f"bound {bound_ms:.0f} ms -> {verdict}"
    )
    return 0 if p95 <= bound_ms else 1


if __name__ == "__main__":
    base, path, n, concurrency, bound = sys.argv[1:6]
    sys.exit(asyncio.run(main(base, path, int(n), int(concurrency), float(bound))))
