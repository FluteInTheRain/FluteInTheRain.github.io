# Go series redesign: one ladder from first program to interview — design

Date: 2026-11-23. Status: **approved** by Khang on 2026-11-23.

## Intent

The `golang` series (12 published posts, `src/data/series.ts`, id `golang`) is hard for newcomers. Khang (2026-11-23): *"Người mới tiếp cận sẽ không dễ hiểu được."* The series gets re-cut into one ladder that climbs from basic to advanced, and every post is rewritten against that ladder.

**Reader:** a developer who already writes another language (Java, Python, JS/TS, C#…) and has **never written Go**. Posts do not explain what a variable or a loop is. They explain what is different in Go, and why, by comparing with what the reader already knows.

**Decided by Khang (2026-11-23):**
- Approach A: one series, 4 levels, one topic per post, no topic taught twice.
- Posts may be long. Depth and clear explanation matter more than length.
- The books are the main reference: *100 Go Mistakes and How to Avoid Them* (Teiva Harsanyi, Manning 2022) and *Efficient Go* (Bartłomiej Płotka, O'Reilly 2022). PDFs sit in `books/` (gitignored).
- Three extra posts on top of the first 17-post draft: one **Go interview** post, plus the two Claude proposed and Khang accepted: **Concurrency patterns** and **Build an HTTP service**. Total: **20 posts**.
- Review gates: the per-post outlines below count as the `book-to-post` Step 3/4 approval. Khang reviews post 1 (pilot) in full; from post 2 on he reads the finished draft before flipping it. *(Taken from Khang's "Đồng ý" on 2026-11-23; to confirm.)*

## What is wrong today (checked 2026-11-23)

| Problem | Evidence |
|---|---|
| Part 1 opens at expert depth | `go-fundamentals-toolchain-modules-packages-types.mdx` §1 starts with SSA, export data, MVS, struct padding |
| Topics repeat across posts | typed nil: parts 2 and 5 · slice header: 2 and 4 · `%w`: 3 and 5 · `defer`: 1, 3, 5 · escape analysis: 7 and 8 · cache lines: 7 and 9 · `pprof`: 7 and 11 |
| Each post crams 4–5 big topics | 6,500–9,000 words each (EN + VI), e.g. part 3 = errors + defer/panic + goroutines + channels/mutex/context + testing |
| Order follows book tables of contents, not difficulty | parts 4–7 = *100 Go Mistakes*, 8–12 = *Efficient Go*; GC/cache lines show up in part 7 before the reader learns to measure |
| No post assembles the pieces | after the fundamentals the reader never builds one real program; the advanced posts each invent their own example |

## Goals

- A newcomer can read post 1 → 20 in order and never meet an idea that was not introduced earlier.
- Each concept has **one home post**. Other posts link to it instead of re-teaching it.
- Levels 1–2: after reading, the reader can write, test and run a small concurrent HTTP service in Go.
- Levels 3–4: the reader can explain the runtime behaviour behind common bugs, and prove a speed-up with numbers.
- Post 20: the reader can check themselves against interview-style questions and coding tasks, each linked back to the post that teaches it.

## Non-goals

- Teaching programming from zero.
- Quiz sets (Go has none today; add later on the DDIA pattern if Khang wants). Post 20's "predict the output" items live inside the post, not in `src/data/quiz/`.
- Changing shared MDX components (`AnimatedFlow`, `DemoFrame`, `DiagramIcon`, …) or the series page layout.

## Anti-goals (a failure even if it builds)

- An expert-only term (SSA, MVS internals, iface layout, GMP) appears in levels 1–2 without being needed.
- Two posts explain the same mechanism at the same depth.
- Book text copied or a book figure redrawn (rules in `.claude/skills/book-to-post/SKILL.md` "Never").
- Post 20 claims a question is "asked at company X" without a source.

## Approaches considered

| | Approach | Trade-off | Verdict |
|---|---|---|---|
| **A** | One series re-cut into one ladder (now 20 posts) | Most rewriting (levels 1–2 almost new); 3 old URLs redirect | **Picked by Khang** |
| B | Two series: "Go for new devs" + "Go performance" | Less rewriting of the advanced part, but breaks the single ladder Khang wants | Rejected |
| C | Keep the 12 posts and URLs, rewrite text only | Cheapest, but keeps the repetition and the jumps in order, which is the root problem | Rejected |

## The new ladder

Each level has a one-line promise the series page shows as the act blurb.

| Level (act id) | Promise | Posts |
|---|---|---|
| 1 `basics` — Write Go | "You can write, structure and test a Go program" | 1–6 |
| 2 `concurrency` — Run things at once | "You can run work concurrently and ship a small service" | 7–10 |
| 3 `internals` — Under the hood & traps | "You know why the classic Go bugs happen" | 11–14 |
| 4 `performance` — Measure, then optimize | "You can prove a speed-up with numbers" | 15–19 |
| 5 `interview` — Check yourself | "You can answer and code it under interview pressure" | 20 |

### Post map

"Reuses" names sections of the current posts (by heading, since line numbers will drift) that move into the new post, usually rewritten gentler. "Book" lists the main chapters and mistake numbers; each 100 Go Mistakes item has exactly one home post.

| # | Slug | Topic label (title) | Reuses | Book |
|---|---|---|---|---|
| 1 | `go-first-program-modules-packages` *(new)* | Go basics | old part 1 §2 packages/`internal/`, light parts of §1 build and §3 `go.mod` | EG ch2; 100GM ch2 #12–#16 |
| 2 | `go-variables-types-pointers-functions` *(new)* | Go types and functions | old part 1 §4 pointers + `defer` (no struct padding) | EG ch2; 100GM #1, #2, #17–#19, #42, #47 |
| 3 | `go-slices-maps-strings` *(new)* | Go collections | old part 2 §1–2 (usage only), old part 1 §5 strings | 100GM #20–#24, #36, #37 |
| 4 | `go-structs-methods-interfaces` *(new)* | Go structs and interfaces | old part 2 §3–5 (usage, no `iface` layout) | — (no 100GM item; embedding hazards are #10 in post 12) |
| 5 | `go-errors-defer-panic` *(new)* | Go errors | old part 3 §1–2, old part 5 §4 "handle once" | 100GM #43, #44, ch7 #48–#54 |
| 6 | `go-testing-table-tests` *(new)* | Go testing | old part 3 §5 | 100GM ch11 #82–#88, #90 |
| 7 | `go-goroutines-channels-select` *(new)* | Goroutines and channels | old part 3 §3–4 (channels/select) | 100GM #55, #57, #62, #65, #67 |
| 8 | `go-context-timeouts-mutexes` *(new)* | Context and locks | old part 3 §4 (context, mutex) | 100GM #60, #61, #70, #71, #74 |
| 9 | `go-concurrency-patterns-worker-pools-pipelines` *(new)* | Go concurrency patterns | none (new material) | 100GM #73; Go blog "Pipelines and cancellation"; Rob Pike "Go Concurrency Patterns" (2012) |
| 10 | `go-http-service-net-http-json-middleware` *(new)* | Build a Go HTTP service | none (new material) | EG ch2; `net/http` docs, Go 1.22 routing and `log/slog` posts on the Go blog |
| 11 | `go-memory-data-types-slices-maps-strings` *(kept)* | Go memory | old part 4 (slice header, leaks, range) + old part 2 §1–2 internals (24-byte header, SwissTable) | 100GM #25–#35, #38–#41 |
| 12 | `go-abstractions-interfaces-generics-errors` *(kept)* | Go interfaces deep dive | old part 5 §1–3 + old part 2 §5 `iface`/typed nil; errors section moves to post 5 | 100GM #3–#11, #45, #46 |
| 13 | `go-concurrency-scheduler-channels-context-mutexes` *(kept)* | Go concurrency deep dive | old part 6 (GMP, races, nil channels, etcd deadlock) | 100GM #56, #58, #59, #63, #64, #66, #68, #69, #72; EG ch4 (scheduler) |
| 14 | `go-production-stdlib-cpu-cache-gc-kubernetes` *(kept)* | Go in production | old part 7 §1 stdlib traps + §4 K8s CFS throttling | 100GM ch10 #75–#81, #100 |
| 15 | `go-efficiency-workflow-raer-tfbo-hardware-memory` *(kept)* | When to optimize | old part 8 §1–3 (RAER, TFBO) | EG ch1, ch3 |
| 16 | `go-hardware-cpu-caches-virtual-memory-gc-allocator` *(kept)* | Go hardware and GC | old part 9 + old part 7 §2–3 + old part 8 §4–5 (escape analysis) + old part 1 struct alignment | EG ch4, ch5; 100GM #91–#97, #99 |
| 17 | `go-observability-metrics-microbenchmarks-benchstat` *(kept)* | Go benchmarking | old part 10 + old part 7 §4 test accuracy | EG ch6–ch8; 100GM #89 |
| 18 | `go-profiling-pprof-flamegraphs-off-cpu-continuous` *(kept)* | Go profiling | old part 11 | EG ch9; 100GM #98 |
| 19 | `go-three-rs-optimization-patterns-streaming-pooling` *(kept)* | Go optimization patterns | old part 12 | EG ch10, ch11 |
| 20 | `go-interview-questions-output-live-coding` *(new)* | Go interview prep | none (new material, links back to posts 1–19) | none as primary; each answer cites its home post |

Book abbreviations: EG = *Efficient Go*, 100GM = *100 Go Mistakes*.

### Outline per post (the drafts to rewrite from)

Every post follows the `book-to-post` structure: hero, hook, Concepts box, sections, Key takeaways, Review questions, bilingual `<En>`/`<Vi>`, `sources` frontmatter. Levels 1–2 add a **"Coming from Java / Python / JS"** comparison table in the first section.

**1. Go basics.** What Go is built for (fast builds, one static binary, simple deploy), with Go's own design story as the real case. `go install`, `go run`, `go build`. `go mod init`, what `go.mod`/`go.sum` hold, `go get` (one paragraph on why versions are stable, no MVS algorithm). Packages = folders, capitalised names are exported, `internal/`. Project layout for a small service; the module path is explained at the first import that uses it. `gofmt`, `go vet`. Docker `FROM scratch` / cross-compiling: one sentence, details in post 10. Demo: animated flow "source → `go build` → one binary → run on a bare container".

**2. Go types and functions.** `var` vs `:=`, zero values (why no "undefined"), basic types, constants and `iota`, explicit conversions, integer overflow. Functions with multiple returns. Pointers: everything passes by value; when to pass `*T`; no pointer arithmetic. `defer` basics (runs at function exit, LIFO, arguments captured now). Shadowing with `:=` as the first trap. Overflow/float/octal stay short: one overflow example, octal in two lines, no NaN/Inf detail. Demo: interactive "pass by value vs pointer" stepper.

**3. Go collections.** Arrays vs slices as a reader of other languages sees them (`ArrayList`/`list`/`Array`), `make`, `append`, `len`/`cap` at usage level, nil vs empty slice, `copy`. Maps: create, comma-ok, delete, iteration order is random. Slices can share memory: one plain `b := a[1:3]; b[0] = 99` example, the why goes to post 11. Strings are bytes; `rune`; ranging over `"Phở"`. Link forward to post 11 for what happens underneath. Capacity advice stays one rule ("`make` with a capacity when you know the size"); growth tables, allocation counts, map size hints and `strings.Trim*` pitfalls live in post 11. Demo: `append` growth visualiser (usage level).

**4. Go structs and interfaces.** No classes: structs + methods. Value vs pointer receivers (one rule of thumb). Embedding as composition, not inheritance. Interfaces are satisfied implicitly; small interfaces (`io.Reader`, `fmt.Stringer`) as real stdlib cases. Type switches. Generics moved to post 12 (2026-11-23: posts 1–10 use no generics). Link forward to post 12. Demo: "which type satisfies which interface" interactive checker.

**5. Go errors.** Errors are values; `if err != nil` and why Go chose it (compare with exceptions). Creating errors, wrapping with `%w`, `errors.Is`/`errors.As`, `errors.Join`. Handle an error once (log or return, not both). Named results and the `err` they silently keep (100GM #43–#44) live here, since their trap is about errors. `defer` for cleanup, `panic`/`recover` and when panic is legitimate. Real case: a sourced incident where swallowed or duplicated errors hid a failure. Demo: error-wrap chain unwinder.

**6. Go testing.** `go test`, `_test.go`, table-driven tests, subtests `t.Run`, `t.Helper`, `t.Parallel`, test fixtures, `httptest`, coverage, `-race` first look (details in post 13). Test categories (build tags / `-short`). Demo: run a table test step by step.

**7. Goroutines and channels.** Concurrency vs parallelism. `go f()`, why a goroutine is cheap compared with an OS thread (one level, no scheduler internals). `sync.WaitGroup`. Unbuffered vs buffered channels, closing, `range` over a channel, `select`, notification channels (`chan struct{}`). Every goroutine needs a way to stop. Demo: animated producer/consumer.

**8. Context and locks.** `context.Context`: cancel, timeout, deadline, values (sparingly); passing it down; using the wrong context (HTTP request context in background work). `sync.Mutex`/`RWMutex`, protecting maps and slices, never copying a `sync` type, `WaitGroup` misuse. When to use a channel vs a mutex. Demo: timeout cascade through three calls.

**9. Go concurrency patterns.** Putting posts 7–8 to work on real shapes of work: worker pool with a fixed number of goroutines, fan-out/fan-in, pipeline stages with cancellation, bounding concurrency with a semaphore channel, rate limiting (`time.Ticker`, `golang.org/x/time/rate`), `errgroup` (first error cancels the rest, `SetLimit`). Each pattern: the problem it solves, the code, how it shuts down cleanly. Demo: worker-pool simulator where the reader changes worker count and sees throughput and queue length.

**10. Build a Go HTTP service.** Assemble levels 1–2 into one small JSON API with only the standard library: `net/http` with Go 1.22 method + path patterns, JSON encode/decode with validation, a middleware chain (logging, recover, request ID), `log/slog`, server timeouts set from the start (why: one line linking post 14), config from env, graceful shutdown with `signal.NotifyContext` + `Server.Shutdown`, shipping the binary in a `FROM scratch` container with `GOOS`/`GOARCH` cross-compiling (moved from post 1), handler tests with `httptest`. Project layout reuses post 1. This service becomes the running example that levels 3–4 reach for where it fits. Demo: animated request path through middleware → handler → JSON response.

**11. Go memory (kept slug).** Slice header (pointer, len, cap), shared backing arrays, `append` overwriting a neighbour, slice and substring memory leaks, maps never shrink, SwissTable maps (Go 1.24+), range copies and pointer elements, comparing values, how `append` grows capacity (growth table, allocation counts), map size hints, `strings.Trim*` vs `TrimSuffix`. Starts with a recap box linking posts 3 and 4.

**12. Go interfaces deep dive (kept slug).** Interface values as (type, data); the typed-nil trap; interface pollution; consumer-side interfaces; returning interfaces; `any`; generics at usage level (`[T any]`, a generic `Stack[T]`, `slices`, `maps`; moved from post 4) and when they fit and when they do not; functional options (#11); type-embedding hazards; using a filename as a function input; `init()` functions and getters/setters (moved from post 2).

**13. Go concurrency deep dive (kept slug).** GMP scheduler; why more goroutines can be slower; data race vs race condition; loop variables in goroutines (Go 1.22 change); `select` is random; nil channels; `append` races; `sync.Cond`; the etcd deadlock as the real case.

**14. Go in production (kept slug).** `http.DefaultClient` and missing timeouts, `time.After` leaks, JSON pitfalls, `database/sql` pools, closing resources, returning after `http.Error`, Go in containers (`GOMAXPROCS`, CFS throttling). Cache lines, escape analysis, GC and pprof leave this post.

**15. When to optimize (kept slug).** Why adding pods does not fix tail latency; efficiency vs speed; RAER budgets; the 5 optimization design levels; TFBO. Escape analysis leaves to post 16.

**16. Go hardware and GC (kept slug).** CPU caches and false sharing, struct alignment, inlining and BCE, stack vs heap and escape analysis (`-gcflags=-m`), virtual memory (VSS/RSS), the allocator, tri-color GC, `GOGC`/`GOMEMLIMIT` in Kubernetes.

**17. Go benchmarking (kept slug).** Metrics (RED/USE), container vs runtime memory, writing microbenchmarks that do not lie (dead-code elimination, `b.Loop`), `benchstat`, macrobenchmarks.

**18. Go profiling (kept slug).** `pprof` endpoints safely, Top and flame graphs (`Flat` vs `Cum`), heap `alloc_space` vs `inuse_space`, off-CPU with `fgprof`, continuous profiling and `-diff_base`.

**19. Go optimization patterns (kept slug).** Do less work, the Three Rs, the `Sum1` → `Sum6Reader` case study, streaming in fixed memory, sharding, `sync.Pool` trade-offs. Ends with a "you climbed the ladder" recap linking all four levels.

**20. Go interview prep.** Three parts, every answer short and linked to the post that teaches it:
1. **Concept questions by level** (1–4), e.g. slice vs array, what a typed nil is, how GMP schedules goroutines, when `GOMEMLIMIT` helps. Each with a model answer and what a weak answer misses.
2. **"Predict the output"**: short snippets (`append` on a shared slice, `defer` in a loop, `select` with several ready channels, closure over a loop variable before/after Go 1.22, nil map write). Answers hidden behind a reveal (`<details>` so it works without JS), with the run output captured from real Go.
3. **Live-coding tasks**: bounded parallel fetcher (builds on post 9), TTL cache safe for concurrent use, token-bucket rate limiter. For each: the task as an interviewer states it, a first working solution, the follow-up questions interviewers tend to add (cancellation, tests, race checks), and the final solution with tests.
Demo: "predict the output" interactive cards (reveal + explanation), still readable without JS.

## Writing rules for every post

- **Examples use only what earlier posts taught.** No `recover`, closures, `testing` helpers, structs, methods or `context` in a snippet before the post that teaches them; undefined helper functions are not allowed. If a snippet needs scaffolding to produce its output, show plain code and let the output carry the point. *(Added 2026-11-23 after a newcomer reader test of posts 1–3.)*

- **Explain plainly first, then detail.** Each section opens with a 2–3 sentence plain explanation before code or internals.
- **Real cases first** (memory `posts-prefer-real-cases`): sourced incidents, Go issues, engineering blogs; analogies only as a one-line aid.
- **No chapter framing** (memory `posts-no-chapter-framing`): state ideas directly; the books appear in `sources`.
- **No length cap.** Padding is still out.
- **At least one animated or interactive demo per post** (`<AnimatedFlow />` preset or a React island in `<DemoFrame>`); figures drawn on the page with CSS tokens, no generated infographic PNGs. Content stays readable without JS.
- Code runs on the Go version the series already uses (Go 1.27); outputs shown in posts are captured from real runs.
- Cover = Go gopher art or real Go tooling screenshot (the existing Go-Series Cover Convention); new posts pick from `src/assets/series/golang/`.

## URLs and rollout

- **Posts 11–19 keep their current slugs** (the old parts 4–12) and are rewritten in place, so existing links keep working. Their slugs no longer describe the content exactly; the title and description do. *(Claude's call: links matter more than slug accuracy.)*
- **Posts 1–10 and 20 are new files** with new slugs, `draft: true` until Khang flips them.
- The **3 old fundamentals posts stay live** until posts 1–10 are flipped. At cutover: delete the 3 old files and add redirects in `astro.config.mjs` (`redirects`): `go-fundamentals-toolchain-modules-packages-types` → post 1, `go-fundamentals-composite-types-structs-methods-interfaces` → post 4, `go-fundamentals-errors-concurrency-goroutines-channels-testing` → post 7. *(Claude's call.)*
- `src/data/series.ts` `golang` entry (20 parts, 5 acts, new reading paths, kicker "A 20-part series") switches at cutover, so the live series page never points at drafts. Post 20 is listed from cutover on and shows as "soon" until it is published (the series page already renders unpublished parts that way).
- Existing `src/components/mdx/Go*.astro` figures are reused where they fit; ones left unused after cutover are deleted then.

### Reading paths (new)

| id | Label | Order |
|---|---|---|
| `full` | Read it all (20 parts) | 1 → 20 |
| `new-to-go` | New to Go (1–10) | 1 → 10 |
| `review` | Catch the classic bugs (11–14) | 11 → 14 |
| `performance` | Make slow Go fast (15–19) | 15 → 19 |
| `oncall` | Leaks and latency spikes | 11, 14, 16, 18, 19 |
| `interview` | Preparing for a Go interview | 20, 11, 12, 13, 14 |

## Prerequisites

- The two books must be imported with `/book-to-skill` (slugs `100-go-mistakes`, `efficient-go`) so `book-to-post` can read them. Neither one is in `~/.claude/skills/` today (checked 2026-11-23).

## Order of work

*(Claude's call, after the builder check: no live post ever links to a draft.)*

1. Import both books with `/book-to-skill` (answer **no** to the GitHub push). This is the plan's first task.
2. Pilot: write post 1, then Khang checks the voice and depth, then these rules get adjusted.
3. Posts 2–10, one branch per post cut from `main`, merged as `draft: true`. Drafts may link to each other.
4. Khang flips posts 1–10 to published.
5. Cutover PR: the new `golang` entry in `series.ts`, redirects, deleting the 3 old fundamentals posts and unused figures, a CHANGELOG entry. For the short window before posts 11–19 are rewritten, the series page shows their old content under the new order. That is accepted.
6. Rewrite posts 11–19 in place, one PR per post. They can now link back to posts 1–10 freely. They stay published, because each rewrite replaces a live post.
7. Post 20 last, because its answers link to the final versions of posts 1–19.

### Details settled during the builder check

- **Every 100 Go Mistakes number has exactly one home.** Checked 2026-11-23 by script against the Book column: #1–#100 all assigned, no duplicates (#73 `errgroup` moved from post 8 to post 9 when the patterns post was added; after the reader test, #3/#4 moved 2→12, #43/#44 moved 2→5, #27/#38 moved 3→11). Posts 15 and 19 use only *Efficient Go*; posts 10 and 20 rely on official Go docs and the earlier posts.
- **Frontmatter for new posts:** `category: "backend"`, same as the current Go posts. `date` is the day each post is written. The series order comes from `series.ts`, not from dates. Covers are picked from `src/assets/series/golang/`.
- **`series.ts`** is switched only at step 5, in one PR. The current entry stays untouched until then.

## Left to the builder

- Exact section wording, demo design per post, which existing figures to reuse.
- Final wording of titles/descriptions (keep short topic-label titles like the current ones).
- Where in levels 3–4 the post-10 service is the better example than a standalone snippet.
- Moving a single mistake number between neighbouring posts if a post's flow needs it, as long as it keeps exactly one home.
