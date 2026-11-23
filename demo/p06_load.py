import asyncio
import sys
import time

import httpx


async def timed(client: httpx.AsyncClient, url: str, started: float) -> float:
    await client.get(url)
    return time.perf_counter() - started


async def main(base: str, path: str, n: int, probe: bool) -> None:
    async with httpx.AsyncClient(base_url=base, timeout=60) as client:
        started = time.perf_counter()
        jobs = [asyncio.create_task(timed(client, path, started)) for _ in range(n)]
        probe_job = None
        if probe:
            await asyncio.sleep(0.2)  # let the burst land first

            async def ping() -> float:
                t0 = time.perf_counter()
                await client.get("/health")
                return time.perf_counter() - t0

            probe_job = asyncio.create_task(ping())
        done = await asyncio.gather(*jobs)
        wall = time.perf_counter() - started
        line = (
            f"GET {path} x{n}: wall {wall:.2f} s"
            f" (fastest {min(done):.2f} s, slowest {max(done):.2f} s)"
        )
        if probe_job:
            line += f" | /health sent at +0.2 s answered after {await probe_job:.2f} s"
        print(line)


if __name__ == "__main__":
    base, path, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
    asyncio.run(main(base, path, n, probe="--probe" in sys.argv))
