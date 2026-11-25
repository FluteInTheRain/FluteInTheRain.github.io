"""Drives p08_cache.py so each cache behaviour can be captured.

    python p08_drive.py timing | stale | stampede [/guarded]
"""

import sys
import time
from concurrent.futures import ThreadPoolExecutor

import httpx
import redis

BASE = "http://127.0.0.1:4338"
r = redis.Redis.from_url("redis://localhost:6388/0", decode_responses=True)
http = httpx.Client()  # one client: keep-alive, so timings are not all handshakes


def get(path: str) -> tuple[str, float, dict]:
    t0 = time.perf_counter()
    resp = http.get(BASE + path)
    ms = (time.perf_counter() - t0) * 1000
    return resp.headers.get("x-cache", "-"), ms, resp.json()


def show(label: str, path: str) -> None:
    cache, ms, body = get(path)
    print(f"{label:<22} X-Cache: {cache:<4} {ms:6.1f} ms  detective={body['detective']}")


def timing() -> None:
    for rnd in (1, 2):
        r.delete("case:C-1")
        for n in (1, 2, 3):
            show(f"round {rnd}: GET #{n}", "/cases/C-1")
    print(f"TTL case:C-1 = {r.ttl('case:C-1')} s")


def stale() -> None:
    http.post(BASE + "/cases/C-1/assign", params={"detective": "Hale"})  # known start
    show("read (warms cache)", "/cases/C-1")
    http.post(BASE + "/cases/C-1/assign-stale", params={"detective": "Wren"})
    print("-> assign-stale: database now says Wren")
    show("read after update", "/cases/C-1")
    r.delete("case:C-1")
    show("read (warms cache)", "/cases/C-1")
    http.post(BASE + "/cases/C-1/assign", params={"detective": "Okafor"})
    print("-> assign (delete-on-write): database now says Okafor")
    show("read after update", "/cases/C-1")


def stampede(suffix: str = "") -> None:
    r.set("case:C-1", "{}", px=1)  # a hot key that has just expired
    time.sleep(0.2)
    before = http.get(BASE + "/stats/db-reads").json()["db_reads"]
    with ThreadPoolExecutor(20) as pool:
        t0 = time.perf_counter()
        results = list(pool.map(lambda _: get(f"/cases/C-1{suffix}"), range(20)))
        wall = time.perf_counter() - t0
    after = http.get(BASE + "/stats/db-reads").json()["db_reads"]
    misses = sum(1 for cache, _, _ in results if cache == "MISS")
    print(f"20 concurrent GET /cases/C-1{suffix}: wall {wall:.2f} s")
    print(f"responses marked MISS: {misses}; database reads: {after - before}")


if __name__ == "__main__":
    cmd = sys.argv[1]
    {"timing": timing, "stale": stale, "stampede": stampede}[cmd](*sys.argv[2:])
