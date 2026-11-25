"""An AI-style debug log line, with and without the redaction filter."""

import logging
import sys

import p10_logs

token = "eyJhbGciOi.demo.signature"
user = {"name": "holmes", "password": "hunter2"}

# 1) The line an assistant writes while debugging a login problem.
plain = logging.StreamHandler(sys.stdout)
plain.setFormatter(p10_logs.JsonFormatter("clue-api"))
log = logging.getLogger("clue.auth")
log.addHandler(plain)
log.setLevel(logging.INFO)
log.info(f"login failed for {user} token={token}")

# 2) The same call after the redaction filter is on the handler.
log.removeHandler(plain)
safe = logging.StreamHandler(sys.stdout)
safe.setFormatter(p10_logs.JsonFormatter("clue-api"))
safe.addFilter(p10_logs.RedactFilter())
log.addHandler(safe)
log.info(f"login failed for {user} token={token}")
log.info("login failed", extra={"user": "holmes", "password": user["password"]})
