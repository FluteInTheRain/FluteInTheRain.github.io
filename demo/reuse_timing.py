"""First vs second request on one connection, with httpx.

Post 1, section 3: the first request on a fresh connection pays DNS, TCP
and TLS before its first byte; the second request reuses the pooled
connection and pays only the round trip. This prints both, for real:

    cd demo
    uv run --python 3.13 --with httpx reuse_timing.py
"""

import time

import httpx

URL = "https://fastapi.tiangolo.com/"


def ms(since: float) -> float:
    return (time.perf_counter() - since) * 1000


with httpx.Client() as client:
    t = time.perf_counter()
    client.get(URL)
    first = ms(t)

    t = time.perf_counter()
    client.get(URL)
    second = ms(t)

print(f"first request:  {first:7.1f} ms   (fresh connection)")
print(f"second request:  {second:7.1f} ms   (connection reused)")
