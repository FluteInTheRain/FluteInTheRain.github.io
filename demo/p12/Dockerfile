# Build the demo from the demo/ folder:  docker build -f p12/Dockerfile -t clue-api:p12 .

# ---- build stage: has uv and the resolver; never ships ----
FROM python:3.13-slim AS build
COPY --from=ghcr.io/astral-sh/uv:0.13.0 /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy
WORKDIR /app
COPY p12/pyproject.toml p12/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# ---- runtime stage: Python, the venv, our two files ----
FROM python:3.13-slim
RUN useradd --system --uid 10001 --no-create-home app
WORKDIR /app
COPY --from=build /app/.venv /app/.venv
COPY p12_settings.py p12_app.py ./
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER 10001
EXPOSE 8000
# Exec form: uvicorn is PID 1 and receives SIGTERM itself.
CMD ["uvicorn", "p12_app:app", "--host", "0.0.0.0", "--port", "8000"]
