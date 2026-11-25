"""Metrics: a counter and a histogram per request, scraped from /metrics."""

import time

from fastapi import FastAPI, Request, Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

REQUESTS = Counter(
    "http_requests_total", "Requests served", ["method", "route", "status"]
)
LATENCY = Histogram(
    "http_request_duration_seconds",
    "Request latency",
    ["route"],
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5),
)


def install(app: FastAPI) -> None:
    @app.middleware("http")
    async def measure(request: Request, call_next):
        started = time.perf_counter()
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
            return response
        finally:
            # The route TEMPLATE ("/cases/{case_id}"), never the raw path:
            # the raw path would mint one time series per case id.
            route = request.scope.get("route")
            label = route.path if route else "unmatched"
            REQUESTS.labels(request.method, label, str(status)).inc()
            LATENCY.labels(label).observe(time.perf_counter() - started)

    @app.get("/metrics", include_in_schema=False)
    def metrics() -> Response:
        return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
