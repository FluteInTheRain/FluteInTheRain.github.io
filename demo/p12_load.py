"""Steady request loop that counts what the caller would see.

Every request opens a new connection (no keep-alive) and has a 3 s timeout.
"""

import asyncio
import sys
import time
from collections import Counter

import httpx


async def one(client: httpx.AsyncClient, url: str, t0: float, out: dict) -> None:
    second = int(time.monotonic() - t0)
    try:
        r = await client.get(url)
        if r.status_code == 200:
            out["ok"] += 1
            out["releases"][r.json()["release"]] += 1
        else:
            out["errors"][f"HTTP {r.status_code}"] += 1
            out["by_second"][second] += 1
    except httpx.HTTPError as exc:
        out["errors"][type(exc).__name__] += 1
        out["by_second"][second] += 1


async def run_load(url: str, rps: int, stop: asyncio.Event) -> dict:
    out = {"sent": 0, "ok": 0, "errors": Counter(), "releases": Counter(), "by_second": Counter()}
    limits = httpx.Limits(max_keepalive_connections=0)
    t0 = time.monotonic()
    tasks = []
    async with httpx.AsyncClient(timeout=3.0, limits=limits) as client:
        while not stop.is_set():
            tasks.append(asyncio.create_task(one(client, url, t0, out)))
            out["sent"] += 1
            await asyncio.sleep(1 / rps)
        await asyncio.gather(*tasks)
    return out


def report(out: dict) -> None:
    failed = sum(out["errors"].values())
    print(f"sent={out['sent']} ok={out['ok']} failed={failed}")
    print("errors:", dict(out["errors"]) or "none")
    print("answered by release:", dict(out["releases"]))
    print("failed requests per second:", dict(sorted(out["by_second"].items())) or "none")


async def main(url: str, rps: int, seconds: int) -> None:
    stop = asyncio.Event()
    asyncio.get_running_loop().call_later(seconds, stop.set)
    report(await run_load(url, rps, stop))


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], int(sys.argv[2]), int(sys.argv[3])))
