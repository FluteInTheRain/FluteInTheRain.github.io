# Backend posts 2–12: writing the series (Implementation Plan)

**Goal:** Write posts 2–12 of the `backend` series (11 posts, map approved in `docs/superpowers/specs/2026-11-21-backend-series-design.md`), each following the production recipe the pilot (post 1) settled through two revision rounds with Khang on 2026-11-23.

**Status reference:** post 1 is published (live). The series skeleton (`series.ts`, cover page, reading paths) already exists — posts slot in as they publish; no `series.ts` edits.

## Per-post recipe (non-negotiable, learned from the pilot)

1. **Knowledge first, Python as demo.** The post teaches one backend competence; the Lubanovic book is cited in `sources` per chapter alongside primary docs (MDN, OWASP, 12factor, FastAPI/SQLAlchemy/Redis docs). No "chapter N" framing in bodies.
2. **DDIA split rule** for posts 3, 5, 8, 11 (see spec table): state the split in the intro, link the DDIA post, never re-teach its side.
3. **Voice:** EN + VI bodies; VI is humanized per `voice.md` (senior dev to peer, "mình"/"bạn", no AI-translation stiffness). Gate: the SKILL.md Step 7 keep-diff must print `non-prose unchanged` when only prose changed.
4. **Figures:** 4–6 on-page SVG `BeP<NN><Name>.astro` per post (one figure per file, site tokens, bilingual tspans, plain-polygon arrowheads, no marker ids), drawn with the excalidraw-diagram skill's design principles: generous whitespace, free-floating text, no text-on-figure overlap, one accent (`--red` = the part you own).
5. **Icons:** real colour icons on nodes from `public/icons/flow/` (12 already added by the pilot: python, fastapi, curl, dns, lock, envelope, envelope-arrow, plug, cache, detective, satellite, profiler). New per-topic icons go through the same Iconify convention (README row, CC0/MIT sets only); dark or low-contrast icons get a light disc only in dark mode (`:global([data-theme='dark']) .disc`).
6. **Demos:** `demo/` is the series' running service and grows one layer per post. Code shown in a post must be **byte-identical** to the committed `demo/*.py` (verify with a diff script); every terminal block is a **real capture** from today (`uv run` on the stack in the block's label). No fabricated output, ever.
7. **Cover:** a genuine screenshot of the running stack on that topic (Swagger UI, pytest output, Redis CLI, locust chart, K8s dashboard…), captured locally — the Go-Series Cover Convention. In-post heroes stay metaphor photos.
8. **QA per post:** `scripts/figures/figshot.sh` + a vision-model subagent reading light-EN / light-VI / dark-VI screenshots, loop until PASS; one fact review (labels/numbers vs the post's own traces; EN/VI labels say the same thing; nothing taught the post hasn't taught).
9. **Gates per step:** `npm run build` clean + `node --test` 47+ pass; draft stays `draft: true` until Khang approves the voice on the dev server; only he flips.

## Waves and ownership

The demo service accumulates layers, so posts touching it merge **in slug order** within a wave: one owning agent per post in its own worktree, controller merges 2 → 3 → 4 … sequentially (each post only adds layers, so conflicts resolve by union). One fact reviewer per wave; controller checks every figure via the vision loop.

| Wave | Posts | Demo state reached |
|---|---|---|
| A | 2 rest-api-design, 3 validation-schemas, 4 layered-architecture | routers + Pydantic boundaries + 3-layer split |
| B | 5 database-access, 6 async-concurrency, 7 auth-oauth2-jwt | SQLAlchemy layer, worker model, security module |
| C | 8 caching-queues, 9 testing-strategy, 10 observability | Redis cache + queue worker, pytest suite, OTel |
| D | 11 performance-p99, 12 production-deploy | locust + py-spy, Dockerfile + K8s manifests |

New icons needed per wave: A — OpenAPI/Swagger; B — postgresql (exists: `database.svg`), shield/key for auth; C — redis (exists: `mailbox.svg`), pytest, OpenTelemetry; D — locust, docker, kubernetes.

## Global Constraints

- No edits to shared components (`Figure`, `TerminalOutput`, `AnimatedFlow`, `DemoFrame`, `DiagramIcon`) or other series' posts. `BackendLifecycleDiagram` and the five `BeP01*` are frozen as published.
- Every post: `title`/`title_vi`, `description`/`description_vi` (natural VI, not translated), `category: backend`, tags, `sources` frontmatter, unique cover + cover_alt.
- Blog-body MDX follows the bilingual `<En>`/`<Vi>` structure; code fences at column 0.
- Nothing about another post that hasn't been written yet: links go only to published posts (the pilot) or stay within the wave's merge order.
- Quiz stays deferred (spec non-goal).
- CHANGELOG entry per wave; PR per wave; Khang merges and flips drafts per post after reading them.

## Tasks

- [ ] Task 0: this plan approved by Khang (merge the chore PR).
- [ ] Task 1 (Wave A): three agents, one post each; controller merges in slug order; fact review + vision QA + captures; PR "backend posts 2–4 (draft)".
- [ ] Task 2: Khang reads wave A on dev, flips what he approves.
- [ ] Task 3 (Wave B): same loop for posts 5–7.
- [ ] Task 4: Khang reads wave B, flips.
- [ ] Task 5 (Wave C): same loop for posts 8–10.
- [ ] Task 6: Khang reads wave C, flips.
- [ ] Task 7 (Wave D): same loop for posts 11–12 (final; series complete at 12/12).
- [ ] Task 8: Khang reads wave D, flips; series done. Then evaluate the quiz pattern (deferred decision).

## Review Focus (per post)

- A figure showing a concept the post has not taught; numbers differing from the traces shown beside them; EN/VI labels diverging; VI reading as word-by-word translation.
- Code blocks not byte-identical with `demo/`; terminal output not a real capture; demo README missing the new files.
- DDIA split rule broken (re-teaching isolation levels, replication, distributed retries).
- Any text overlapping a figure, in any theme or language.
