"""OpenTelemetry: one span per request, per SQL statement, per outgoing call."""

from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import ConsoleSpanExporter, SimpleSpanProcessor


def setup(app: FastAPI, service: str, engine=None) -> None:
    provider = TracerProvider(resource=Resource.create({"service.name": service}))
    # Console exporter: no collector needed. Production would use a
    # BatchSpanProcessor + OTLP exporter instead of printing each span.
    provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
    trace.set_tracer_provider(provider)

    FastAPIInstrumentor.instrument_app(app)
    HTTPXClientInstrumentor().instrument()  # also injects the traceparent header
    if engine is not None:
        SQLAlchemyInstrumentor().instrument(engine=engine)
