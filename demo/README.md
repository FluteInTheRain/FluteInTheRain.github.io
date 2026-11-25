# demo/ — the backend series' running demo service

The blog series **"Backend with Python FastAPI"** (`src/content/blog/backend-*.mdx`)
traces one small FastAPI service across its 12 posts: it starts as the trace
skeleton below and gains layers, a database, auth, tests, observability and
deploys as the series goes on. Keeping the code in the repo is what makes every
"captured locally" screenshot and terminal block in the posts reproducible.

## Stack

The posts are captured on the exact stack shown in their terminal labels:

- Python 3.13
- FastAPI 0.165.0
- uvicorn (via `uvicorn[standard]`)

`uv` fetches that stack on the fly — nothing needs to be installed globally:

```sh
cd demo
uv run --python 3.13 --with 'fastapi==0.165.0' --with 'uvicorn[standard]' \
    uvicorn trace_demo:app --port 4324
```

## Files (so far)

| File | Post | What it shows |
|---|---|---|
| `trace_demo.py` | `backend-http-request-lifecycle` | One `/cases/{case_id}` endpoint plus an HTTP middleware printing the ASGI `scope`, the dispatch chain, and the response round trip |
| `station_timing.py` | `backend-http-request-lifecycle` | Raw-socket walk paying each station of one HTTPS request separately: DNS, TCP, TLS, then the first response bytes |
| `reuse_timing.py` | `backend-http-request-lifecycle` | First vs second `GET` on one pooled `httpx.Client` connection — what keep-alive buys |
| `p01_raw_asgi.py` | `backend-http-request-lifecycle` | A framework-free ASGI app: uvicorn hands it a `scope` dict, and it answers with two `send()` calls |
| `rest_api.py` | `backend-rest-api-design` | The same service grown up: a versioned `/v1/cases` APIRouter — list with `?limit`/`?offset`, one case (404 when missing), POST with 201 + `Location`, PUT replace, DELETE 204 |
| `p02_idempotency.py` | `backend-rest-api-design` | POST /v1/cases with an `Idempotency-Key` header; a retry with the same key replays the saved response instead of creating a second case |
| `p02_versions.py` | `backend-rest-api-design` | `/v1` and `/v2` routers side by side; v2 renames `title` to `name` while v1 keeps its shape |
| `schemas.py` | `backend-validation-schemas` | clue.api case intake behind typed boundaries: a Pydantic v2 `CaseCreate` with length/pattern/range constraints, an untyped `POST /cases/raw` twin for contrast, and a `CaseOut` response model that filters internal fields out of the 201 |
| `p03_boundary.py` | `backend-validation-schemas` | One `PUT /cases/{case_id}/draft`: path/query/body parameter sources with `Annotated` constraints, `extra="forbid"`, a `RequestValidationError` handler that flattens the 422, and the `openapi.json` it generates |
| `fat_router.py` | `backend-layered-architecture` | The "before": parsing, rules, id generation, storage and response shaping all inside the endpoint functions |
| `layered_data.py` | `backend-layered-architecture` | The data layer: `CaseRecord` plus `CaseRepository` (a `Protocol` seam) and today's in-memory implementation |
| `layered_service.py` | `backend-layered-architecture` | The service layer: the case workflow (open → assign → close) and the rules each move must pass, framework-free |
| `layered_app.py` | `backend-layered-architecture` | The web layer: thin `APIRouter` endpoints, one middleware tracing web → service → data with timings, and the two exception handlers that map domain errors to status codes |
| `layered_smoke.py` | `backend-layered-architecture` | The payoff: the same service rules driven by plain Python with a fake repository, then with the in-memory one — no server needed |
| `p04_depends.py` | `backend-layered-architecture` | The same layers wired with `Depends`: cached `get_repo`, `get_service`, and endpoints that ask for the service in their signature |
| `p04_override.py` | `backend-layered-architecture` | `app.dependency_overrides` plus `TestClient`: the endpoints' rules driven over HTTP with a fake repository, no server |
| `p05_db.py` | `backend-database-access-layer` | SQLAlchemy 2.x engine, `sessionmaker`, tables, `SqlCaseRepository` behind post 4's `CaseRepository`, and the commit/rollback session dependency |
| `p05_app.py` | `backend-database-access-layer` | clue.api on the real database: post 4's service unchanged, `get_service` with an early-commit session, an all-or-nothing `/cases/batch` |
| `p05_commit_order.py` | `backend-database-access-layer` | Default vs `scope="function"` for a yield dependency, made visible by a 1 s slow COMMIT |
| `p05_pool.py` | `backend-database-access-layer` | A 2-connection pool, three slow requests, and the real `QueuePool` timeout |
| `p05_nplus1.py` | `backend-database-access-layer` | `/lazy` vs `/eager` (`selectinload`), each response counting its own SQL statements |
| `p05_migrate.py` | `backend-database-access-layer` | Why `create_all` is not a migration, plus a minimal numbered-migration runner |
| `p06_loop.py` | `backend-async-concurrency-workers` | `async def` + `await` vs `time.sleep` vs plain `def`; the requests-in-async trap and its two fixes; the thread pool limit |
| `p06_upstream.py` | `backend-async-concurrency-workers` | A 0.5 s slow upstream API the trap endpoints call |
| `p06_load.py` | `backend-async-concurrency-workers` | httpx burst driver: N concurrent requests, wall time, optional `/health` probe |
| `p06_cpu.py` | `backend-async-concurrency-workers` | CPU work inline vs `run_in_threadpool` vs `ProcessPoolExecutor` |
| `p06_workers.py` | `backend-async-concurrency-workers` | Per-process hit counter plus pid, for `--workers 3` |
| `p06_hits.py` | `backend-async-concurrency-workers` | Driver showing counters diverging across workers |
| `p06_background.py` | `backend-async-concurrency-workers` | `BackgroundTasks` after a 202, and its loss on `kill -9` |
| `p07_hashing.py` | `backend-auth-oauth2-jwt` | sha256 vs Argon2id: hash format, salt, per-guess cost |
| `p07_security.py` | `backend-auth-oauth2-jwt` | Token endpoint (`OAuth2PasswordRequestForm`, pwdlib, PyJWT), `get_current_user` guard, scoped routes |
| `p07_attacks.py` | `backend-auth-oauth2-jwt` | No, expired, tampered and `alg=none` tokens against the guard |
| `p07_scopes.py` | `backend-auth-oauth2-jwt` | Requested vs granted scopes; 403 on a missing scope |
| `p07_revocation.py` | `backend-auth-oauth2-jwt` | Session logout (401) vs JWT after logout (200) |
| `p07_bola.py` | `backend-auth-oauth2-jwt` | Vulnerable vs owner-checked case endpoint |
| `p07_bola_check.py` | `backend-auth-oauth2-jwt` | Driver capturing the before/after BOLA results |
| `p08_redis.py` | `backend-caching-queues` | One shared Redis connection pool (`ConnectionPool`) and `get_redis` dependency |
| `p08_cache.py` | `backend-caching-queues` | Cache-aside `GET`, stale write vs delete-on-write invalidation, and `SET NX` single-flight guard |
| `p08_drive.py` | `backend-caching-queues` | Burst/timing driver capturing cache hits, stale reads, and 20-request stampedes |
| `p08_jobs.py` | `backend-caching-queues` | Reliable queue on Redis lists (`LPUSH`, `BLMOVE`, `LREM`), exponential-backoff retries (`ZADD`), and dead-letter queue |
| `p08_jobs_app.py` | `backend-caching-queues` | `POST /cases/{case_id}/report` returning `202` and `GET /jobs/stats` |
| `p08_worker.py` | `backend-caching-queues` | Separate worker process comparing `forget` (`BRPOP`), `naive`, and idempotent (`HSETNX`) delivery under `kill -9` |
| `p09_buggy_service.py` | `backend-testing-strategy` | Plausible AI refactor of `CaseService.close` with swapped save/mutation order |
| `p09_weak_tests.py` | `backend-testing-strategy` | Two green-but-worthless tests (mocking the unit under test; asserting only status 201) |
| `p09_snapshot.py` | `backend-testing-strategy` | Generates `tests_p09/openapi.snapshot.json` for contract diff checks |
| `p09_burst.py` | `backend-testing-strategy` | Async httpx p95 load check comparing `/eager` vs `/lazy` against a CI bound |
| `pytest.ini`, `tests_p09/*` | `backend-testing-strategy` | 37-test suite across `unit` (fakes vs mocks), `api` (`dependency_overrides` + SQLite), `contract`, and `e2e` layers |
| `p10_print.py` | `backend-observability` | Interleaved `print()` lines from two concurrent requests |
| `p10_logs.py`, `p10_redact.py` | `backend-observability` | Structured JSON logging formatter plus `RequestIdFilter` and `RedactFilter` |
| `p10_middleware.py`, `p10_metrics.py` | `backend-observability` | Access-log middleware setting `ContextVar` request id and Prometheus request counter/histogram |
| `p10_cardinality.py` | `backend-observability` | Demonstrates unbounded label cardinality exploding Prometheus time series |
| `p10_tracing.py`, `p10_spans.py` | `backend-observability` | OpenTelemetry FastAPI/HTTPX/SQLAlchemy tracing (`traceparent`) and span waterfall table printer |
| `p10_app.py`, `p10_lab.py`, `p10_walk.py` | `backend-observability` | `clue-api` + `evidence-lab` instrumented services and morning traffic driver |
| `p11_upstream.py`, `p11_naive.py` | `backend-performance-p99` | evidence-lab stand-in where every 40th call takes 0.8 s, and clue.api's report route calling it with httpx's default timeout |
| `p11_measure.py` | `backend-performance-p99` | Driver: N requests with C in flight, then mean/p50/p95/p99/max per status class (sleeps for `Retry-After` after a 503) |
| `p11_hotspot.py`, `p11_hotfix.py` | `backend-performance-p99` | A blocking `dedupe` inside `async def`, a `?profile=1` pyinstrument middleware, and the one-line `dict.fromkeys` fix |
| `p11_timeout.py` | `backend-performance-p99` | The report route with `httpx.Timeout(0.25)` and a 504 on `httpx.TimeoutException` |
| `p11_shed.py` | `backend-performance-p99` | Four worker slots (`asyncio.Semaphore`) behind an in-flight gate: 503 + `Retry-After` past `MAX_IN_FLIGHT` |
| `p11_locustfile.py` | `backend-performance-p99` | A locust `HttpUser` ramping against the gated and ungated service |
| `p12_settings.py` | `backend-production-deploy` | `pydantic-settings` `Settings` read from `CLUE_*` env vars; required `database_url`, validated numbers |
| `p12_app.py` | `backend-production-deploy` | Deploy-ready FastAPI app: lifespan warm-up and shutdown log, `/livez`, `/readyz`, `/work`, `/slow`, and `/debug/*` switches for probe demos |
| `p12/Dockerfile`, `p12/Dockerfile.fat` | `backend-production-deploy` | Multi-stage, non-root, uv image (258 MB) vs the single-stage root image an assistant tends to write (1.7 GB) |
| `p12/pyproject.toml`, `p12/uv.lock` | `backend-production-deploy` | Pinned dependency set the image installs with `uv sync --frozen` |
| `p12/k8s/*.yaml` | `backend-production-deploy` | ConfigMap + Secret, NodePort Service, and three Deployments: naive, readiness only, full (startup/readiness/liveness, `preStop`, grace period) |
| `p12_load.py`, `p12_rollout.py` | `backend-production-deploy` | Request loop counting failures during a rolling update on a local kind cluster (refuses any context but `kind-p12`) |
| `p12_drain.py` | `backend-production-deploy` | One in-flight request across `docker stop`, `docker kill`, and a shell-wrapped entrypoint (PID 1 trap) |
| `p12_check_blocks.py` | `backend-production-deploy` | Checks every code block in the post is a verbatim slice of a demo file |
