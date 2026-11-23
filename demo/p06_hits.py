import sys
from collections import Counter

import httpx


def main(base: str, n: int, keep_alive: bool) -> None:
    last_seen: dict[int, int] = {}
    served = Counter()
    shared = httpx.Client(base_url=base) if keep_alive else None
    for _ in range(n):
        if shared:
            body = shared.get("/hit").json()
        else:
            with httpx.Client(base_url=base) as fresh:  # a new connection each time
                body = fresh.get("/hit").json()
        served[body["pid"]] += 1
        last_seen[body["pid"]] = body["hits"]
    mode = "one kept-alive connection" if keep_alive else "a new connection per request"
    print(f"{n} requests over {mode}:")
    for pid, count in sorted(served.items()):
        print(f"  pid {pid}: served {count}, its own counter reads {last_seen[pid]}")


if __name__ == "__main__":
    main(sys.argv[1], int(sys.argv[2]), keep_alive="--keep-alive" in sys.argv)
