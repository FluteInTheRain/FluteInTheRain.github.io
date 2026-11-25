"""Metric label cardinality: every distinct label value is its own time series."""

from prometheus_client import CollectorRegistry, Counter, generate_latest

good = CollectorRegistry()
by_route = Counter("reports", "per route", ["route"], registry=good)
bad = CollectorRegistry()
by_user = Counter("reports", "per user", ["user_id"], registry=bad)

for user_id in range(1, 10_001):  # ten thousand callers, one route
    by_route.labels("/cases/{case_id}/report").inc()
    by_user.labels(str(user_id)).inc()


def series(registry: CollectorRegistry) -> int:
    lines = generate_latest(registry).decode().splitlines()
    return sum(1 for ln in lines if ln.startswith("reports_total"))


print(f"label route   : {series(good):>6} series")
print(f"label user_id : {series(bad):>6} series")
