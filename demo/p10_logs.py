"""Structured JSON logs: one object per line, the request id stamped by a filter.

Nothing here knows about FastAPI. Any code that calls logging.getLogger(...)
gets the request id for free, because the id lives in a ContextVar.
"""

import json
import logging
import re
import sys
from contextvars import ContextVar

from opentelemetry import trace

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

# Attributes every LogRecord has; anything else came from `extra=` and is ours.
_STANDARD = set(vars(logging.makeLogRecord({}))) | {"message", "asctime"}
# Catches token=abc, pwd=abc, 'password': 'hunter2', "api_key": "abc" and
# Authorization: Bearer abc alike. The optional scheme word is eaten with the token.
_SECRET = re.compile(
    r"""(?i)(password|passwd|pwd|token|secret|authorization|api[_-]?key)"""
    r"""(['"]?\s*[=:]\s*)['"]?(?:(?:bearer|basic)\s+)?[^\s,'"})]+['"]?"""
)


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        ctx = trace.get_current_span().get_span_context()
        if ctx.is_valid:  # only when tracing is on and a span is open
            record.trace_id = format(ctx.trace_id, "032x")
        return True


class RedactFilter(logging.Filter):
    """Last line of defence: scrub secrets from the message and from extras."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = _SECRET.sub(r"\1\2[REDACTED]", record.getMessage())
        record.args = None
        for key in ("password", "passwd", "pwd", "token", "secret", "api_key", "authorization"):
            if key in record.__dict__:
                record.__dict__[key] = "[REDACTED]"
        return True


class JsonFormatter(logging.Formatter):
    def __init__(self, service: str) -> None:
        super().__init__()
        self.service = service

    def format(self, record: logging.LogRecord) -> str:
        line = {
            "ts": self.formatTime(record, "%H:%M:%S") + f".{int(record.msecs):03d}",
            "level": record.levelname,
            "service": self.service,
            "logger": record.name,
            "request_id": getattr(record, "request_id", "-"),
            "msg": record.getMessage(),
        }
        line.update({k: v for k, v in vars(record).items() if k not in _STANDARD})
        if record.exc_info:
            line["exc"] = self.formatException(record.exc_info)
        return json.dumps(line, default=str)


def configure(service: str) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter(service))
    handler.addFilter(RequestIdFilter())
    handler.addFilter(RedactFilter())
    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(logging.INFO)
    # uvicorn's own access log would be a second, unstructured line per request.
    logging.getLogger("uvicorn.access").disabled = True
