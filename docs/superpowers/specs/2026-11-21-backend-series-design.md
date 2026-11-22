# Backend series (Python demos) — design (short)

Date: 2026-11-21. Status: **proposed v2** — Khang redirected v1 on 2026-11-21: *"the book is only a reference and Python is only a demo language — focus on backend knowledge."* Awaiting approval of the 12-post map below.

## Intent

New bilingual series `backend` — **backend engineering knowledge first, Python + FastAPI as the running demo**. Mirrors the site's series pattern (`src/data/series.ts`, `/blog/series/backend/` cover page, SeriesBar/Pager, `draft: true` until Khang flips). Lubanovic's *FastAPI* (O'Reilly 2023, `books/fastapi/FastAPI.pdf`, gitignored) is **a reference**, not the skeleton; posts cite it alongside primary sources (MDN, OWASP, 12factor, FastAPI/SQLAlchemy/Redis docs) and cross-link the DDIA series where concepts overlap.

**The angle:** *AI writes your endpoints in seconds; backend judgment is still yours.* Each post teaches one backend competence, demonstrates it in a small running Python service, and shows what AI-generated code typically gets wrong there. Complements DDIA (data systems concepts) by covering the **service** side: HTTP, API design, layering, auth, testing, observability, deploys.

## Post map (12, knowledge-first)

| # | Slug | Knowledge topic | Demo (Python) | Book ref |
|---|---|---|---|---|
| 1 | `backend-http-request-lifecycle` | URL → DNS → TCP/TLS → HTTP → server: what a request really is; where your code runs | uvicorn/ASGI trace of one request | ch1, ch3 |
| 2 | `backend-rest-api-design` | Resources, verbs, status codes, pagination, idempotency, versioning | FastAPI routers; AI-typical mistakes (POST everything, 200-only) | ch3, ch8 |
| 3 | `backend-validation-schemas` | Typed API boundaries: validate early, fail fast, contract for callers | Pydantic v2 request/response models | ch5 |
| 4 | `backend-layered-architecture` | web → service → data: why fat routers rot, where logic lives | the book's 3-layer site structure | ch8–ch9 |
| 5 | `backend-database-access-layer` | Pools, a transaction per request, migrations, N+1, SQLite→Postgres | SQLAlchemy + SQLite | ch10 |
| 6 | `backend-async-concurrency-workers` | Event loop vs threads vs processes; when async wins; the worker model | asyncio FastAPI, `--workers`, blocking-call demo | ch4 |
| 7 | `backend-auth-oauth2-jwt` | Sessions vs tokens, OAuth2 flows, password hashing, scopes, the confused deputy | FastAPI security module | ch11 |
| 8 | `backend-caching-queues` | Cache patterns + invalidation; background jobs, at-least-once, retries | Redis + a small queue worker | ch13 (perf), ch9 |
| 9 | `backend-testing-strategy` | Test pyramid: unit vs integration vs e2e, fakes vs mocks, contract & load tests | pytest + httpx against the demo service | ch12 |
| 10 | `backend-observability` | Structured logging, metrics, tracing, correlation IDs; debug by evidence | OpenTelemetry on the demo service | ch9 |
| 11 | `backend-performance-p99` | Latency percentiles, profiling, timeouts, backpressure, load testing | py-spy / locust on the demo service | ch13 |
| 12 | `backend-production-deploy` | 12-factor config, Docker, K8s, graceful shutdown, health checks, zero-downtime | uvicorn workers + a Dockerfile + K8s manifests | ch13 |

Acts: `foundations` (1–3) / `building` (4–7) / `operating` (8–12). Reading paths: `full` (all 12) · `ai-review` (2 → 3 → 4 → 9: what to check when AI wrote the service) · `oncall` (10 → 11 → 12 + 6: latency spike / incident path).

## Overlap with the DDIA series — scope rules (checked 2026-11-21)

No post duplicates a DDIA post; four touch shared concepts and follow one rule each: **state the split in the intro, link the DDIA post, never re-teach it.**

| Backend post | Touches DDIA | Rule |
|---|---|---|
| 3. validation-schemas | #5 encoding and schema evolution | This post = runtime input validation at one API boundary; evolution/compat across versions stays with DDIA #5 |
| 5. database-access-layer | #8 transactions and ACID | No isolation-level theory here — transaction-per-request, pools, N+1, migrations; link DDIA #8 for anomalies |
| 8. caching-queues | #6 replication | Cache is an app-level copy on the read path (TTL/invalidation), not server-side replication consistency |
| 11. performance-p99 | #9 distributed failures | Single-service latency work only; distributed timeout/retry theory stays with DDIA #9 |

Everything else (HTTP lifecycle, REST design, layering, async/workers, auth, testing, observability, deploys) has no DDIA counterpart.

## Series identity

- Title: EN **"How backend actually works"** / VI **"Hiểu đúng bản chất Backend"** (family identity with "How Go actually works").
- Kicker: "A 12-part series" / "Series 12 bài". Category `backend`; tags per post (`python`, `fastapi`, + topic).
- Credit: "Demonstrated in Python with FastAPI; *FastAPI: Modern Python Web Development* (Bill Lubanovic, O'Reilly 2023) among the references." Per-post `sources` cite the exact book chapters used **plus** primary docs.
- Series cover plate: a real screenshot of the demo service's Swagger `/docs` page (captured locally), same "real artifact" convention as the golang series.

## Cover art convention (per the Go-Series Cover Convention)

Each post's frontmatter `cover` = a genuine screenshot of the running stack on that topic (uvicorn trace, Swagger UI, Redis CLI, pytest output, locust chart, K8s dashboard…) captured locally — topic-native, real, one visual family. In-post heroes stay the standard site metaphor photos.

## Non-goals (v1)

- Python language deep-dives (asyncio internals, typing theory) — Python serves the topic, not the reverse.
- Book Part IV (gallery: games, forms, dataviz) unused unless a topic needs it.
- Quiz sets — follow the DDIA pattern later, once posts exist.
- No changes to existing series/posts/components.

## Pilot (after map approval)

Draft post 1 (`backend-http-request-lifecycle`) with the `book-to-post` voice → build + test clean → Khang checks the voice → then batch the rest.
