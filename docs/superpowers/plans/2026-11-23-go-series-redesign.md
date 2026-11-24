# Go Series Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `golang` blog series as a 20-post ladder (basics → concurrency → internals → performance → interview) for developers who know another language but have never written Go.

**Architecture:** Each post is one bilingual MDX file in `src/content/blog/` written with the `book-to-post` skill from the outline in the spec. New posts (1–10, 20) ship as `draft: true` on their own branch; a single cutover PR swaps the `golang` entry in `src/data/series.ts`, adds redirects for the 3 retired posts and deletes them; posts 11–19 are then rewritten in place on their existing slugs.

**Tech Stack:** Astro 7 (static) + MDX + React 19 islands, `node:test`, Go 1.27 for every code sample and captured output.

**Spec:** `docs/superpowers/specs/2026-11-23-go-series-redesign-design.md` — the post map, per-post outlines, writing rules and rollout order live there. Read it before any task; this plan does not repeat the outlines.

## Global Constraints

- Reader: "a developer who already writes another language … and has **never written Go**." Posts do not explain what a variable or a loop is.
- One home post per concept; other posts link to it instead of re-teaching it. Each 100 Go Mistakes item is covered only in the post the spec's Book column assigns it to.
- Book rules from `.claude/skills/book-to-post/SKILL.md` "Never": no book text beyond short attributed quotes, no redrawn book figures, no Mermaid, no generated infographic PNGs, never commit anything under `books/`.
- Structure per post: hero, hook, Concepts box, sections, Key takeaways, Review questions, `<En>`/`<Vi>` blocks, `sources` frontmatter (books + chapters used + web sources). No post has a "Coming from Java / Python / JS" section or comparison table (removed 2026-11-23, Khang).
- Real sourced cases before analogies; no "chapter N" framing; no length cap, no padding.
- At least one `<AnimatedFlow />` preset or React island in `<DemoFrame>` per post; figures drawn on the page with CSS tokens (`var(--text)` …), correct in light and dark; content readable without JS.
- Go code and outputs are run on Go 1.27 and captured from real runs, not typed by hand.
- Frontmatter for new posts: `category: "backend"`, `date` = the day written, `draft: true`, cover from `src/assets/series/golang/`, short topic-label `title` (the spec's "Topic label" column).
- Do not modify shared MDX components (`AnimatedFlow`, `DemoFrame`, `DiagramIcon`, …); new figures are new files `src/components/mdx/Go<Name>.astro` or `src/components/demos/Go<Name>Demo.tsx`. No new dependencies.
- Gate after every task: `npm run build` clean and `node --test src/utils/*.test.ts` clean.
- Git: one branch per post cut from up-to-date `main` (`feat/go-post-NN-<short>`), commit messages in English (`content: ...`), open a PR to `main`, Khang merges. CHANGELOG entry (Vietnamese) per merged task.
- Never set `draft: false`; Khang flips posts himself.

## Review Focus

1. **A published post links to a draft slug** → the link 404s on the live site. Pinned by the cross-link check in Task 13 Step 3 and in each Task 14–22 post check.
2. **An old URL is visited after cutover** (`/blog/go-fundamentals-…/`, with and without trailing slash) → the reader lands on the new post. Pinned by Task 13 Step 4.
3. **JS disabled** → every demo still shows its content, and post 20's "predict the output" answers are reachable via `<details>`. Pinned by the no-JS check in the per-post checklist (step "No-JS").
4. **Dark mode and 360 px width** → new comparison tables and code blocks neither overflow nor lose contrast. Pinned by the per-post checklist step "Visual".
5. **An En block without its Vi pair** → the VI toggle shows a gap. Pinned by the parity count in the per-post checklist.

---

## Per-post checklist (referenced by Tasks 2–11 and 14–23)

Run on the post file `F=src/content/blog/<slug>.mdx` before the commit step:

- **Parity:** `[ "$(grep -c '^<En>' $F)" = "$(grep -c '^<Vi>' $F)" ]` → exit 0.
- **Demo present:** `grep -c -E '<AnimatedFlow|<DemoFrame' $F` → ≥ 1.
- **Sources:** frontmatter `sources` lists the book(s) and chapters from the spec's Book column for this post, plus every web source cited.
- **Levels 1–2 only (posts 1–10) — no expert terms:** `grep -n -i -E 'SSA|minimal version selection|\biface\b|\beface\b|\bGMP\b|escape analysis|write barrier|cache line|SwissTable' $F` → no hits, except inside a single "go deeper" sentence linking to that term's home post (11, 12, 13 or 16).
- **One home:** for each 100 Go Mistakes item assigned to another post, the topic gets at most one sentence plus a link. Check against the spec's Post map.
- **Draft links:** every `/blog/<slug>/` link in the file points either to a published post or (for drafts) to another post of this series.
- **No-JS:** `npm run build && npx astro preview`, open the post with JavaScript disabled → all text, tables and the demo's static fallback are visible.
- **Visual:** same preview, light and dark theme, 360 px wide → no horizontal scroll, no unreadable figure.
- **Gate:** `npm run build` (no errors) and `node --test src/utils/*.test.ts` (all pass).

---

### Task 1: Import the two Go books

**Files:**
- Create (outside the repo): `~/.claude/skills/100-go-mistakes/`, `~/.claude/skills/efficient-go/`

**Interfaces:**
- Produces: book skills `100-go-mistakes` and `efficient-go` with `SKILL.md` + `chapters/ch<NN>-<slug>.md`, read by every later task through `book-to-post` Step 1.

- [ ] **Step 1:** Run `/book-to-skill "books/100 Go Mistakes and How to Avoid Them (Teiva Harsanyi) (z-library.sk, 1lib.sk, z-lib.sk).pdf" 100-go-mistakes`, answer **no** to the GitHub push.
- [ ] **Step 2:** Run `/book-to-skill "books/Efficient Go Data-Driven Performance Optimization (Bartlomiej Plotka) (z-library.sk, 1lib.sk, z-lib.sk).pdf" efficient-go`, answer **no** to the GitHub push.
- [ ] **Step 3: Verify:** `ls ~/.claude/skills/100-go-mistakes/chapters | wc -l` → 12; `ls ~/.claude/skills/efficient-go/chapters | wc -l` → 11; `git status --porcelain books/` → empty (nothing under `books/` tracked).

No repo commit for this task.

### Task 2: Pilot — post 1 "Go basics"

**Files:**
- Create: `src/content/blog/go-first-program-modules-packages.mdx`
- Create: `src/assets/blog/go-first-program-modules-packages/` (captured terminal outputs, hero)
- Create as needed: `src/components/mdx/GoBuild*.astro` (or reuse the existing build-pipeline figure from the old part 1 if it reads at beginner level)

**Interfaces:**
- Consumes: book skills from Task 1 (EG ch2; 100GM ch2 #12–#16).
- Produces: the voice and depth reference for every later post. Khang's feedback is folded into the spec's "Writing rules" before Task 3 starts.

- [ ] **Step 1:** Branch `feat/go-post-01-basics` from `main`.
- [ ] **Step 2:** Run `/book-to-post 100-go-mistakes "post 1 of the Go series redesign"` with the spec's outline 1 as the approved Step 4 plan; also use `efficient-go` ch2.
- [ ] **Step 3:** Capture real outputs on Go 1.27: `go mod init`, `go build` binary size, `go vet` on a planted mistake.
- [ ] **Step 4:** Run the per-post checklist.
- [ ] **Step 5:** Commit `content: Go series post 1 (Go basics) as draft`, push, open PR.
- [ ] **Step 6:** Khang reviews the draft in full. Apply feedback; if it changes a rule, edit the spec's "Writing rules" section in the same PR. Stop here until Khang approves.

### Tasks 3–11: Posts 2–10 (new, draft)

One task per post, each on its own branch from `main` after the previous PR merged. Each task follows Task 2 Steps 1–5 with the slug, outline and Book column from the spec, and skips Step 6 (Khang reads the finished draft before flipping it).

| Task | Post | Slug | Branch | Notes the outline does not already say |
|---|---|---|---|---|
| 3 | 2 | `go-variables-types-pointers-functions` | `feat/go-post-02-types` | Pass-by-value stepper is a React island in `<DemoFrame>` with a static fallback |
| 4 | 3 | `go-slices-maps-strings` | `feat/go-post-03-collections` | Capacity numbers in the growth visualiser come from a real Go 1.27 run, not a formula |
| 5 | 4 | `go-structs-methods-interfaces` | `feat/go-post-04-structs` | Generics only at usage level; link to post 12 for design questions |
| 6 | 5 | `go-errors-defer-panic` | `feat/go-post-05-errors` | The real incident must have a public source URL |
| 7 | 6 | `go-testing-table-tests` | `feat/go-post-06-testing` | `-race` gets one short section linking to post 13 |
| 8 | 7 | `go-goroutines-channels-select` | `feat/go-post-07-goroutines` | No scheduler internals |
| 9 | 8 | `go-context-timeouts-mutexes` | `feat/go-post-08-context` | `errgroup` is not taught here (post 9 owns 100GM #73) |
| 10 | 9 | `go-concurrency-patterns-worker-pools-pipelines` | `feat/go-post-09-patterns` | Every pattern shows its shutdown path; sources include the Go blog "Pipelines and cancellation" post |
| 11 | 10 | `go-http-service-net-http-json-middleware` | `feat/go-post-10-http` | Keep the full runnable service in the post (single `main.go` + `_test.go`), standard library only; its timeouts link to post 14 |

- [ ] **Task 3** · [ ] **Task 4** · [ ] **Task 5** · [ ] **Task 6** · [ ] **Task 7** · [ ] **Task 8** · [ ] **Task 9** · [ ] **Task 10** · [ ] **Task 11**

### Task 12: Khang publishes posts 1–10

- [ ] **Step 1:** Ask Khang to read and flip posts 1–10 (`draft: false`). Wait. Cutover starts only when all ten are published on `main`.

### Task 13: Cutover

**Files:**
- Modify: `src/data/series.ts` (the `G` slug map and the `golang` object, currently lines ~590–860; find by `const golang: Series`)
- Modify: `astro.config.mjs` (add `redirects`)
- Delete: `src/content/blog/go-fundamentals-toolchain-modules-packages-types.mdx`, `src/content/blog/go-fundamentals-composite-types-structs-methods-interfaces.mdx`, `src/content/blog/go-fundamentals-errors-concurrency-goroutines-channels-testing.mdx`, their asset folders, and every `src/components/mdx/Go*.astro` / `src/components/demos/Go*Demo.tsx` no longer imported anywhere
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: the 10 published slugs from Tasks 2–11 and the 9 kept slugs.
- Produces: `golang` series with 20 parts, acts `basics`, `concurrency`, `internals`, `performance`, `interview`, paths `full`, `new-to-go`, `review`, `performance`, `oncall`, `interview` (orders from the spec's Reading paths table), kicker `{ en: 'A 20-part series', vi: 'Series 20 bài' }`. `builds` of each part = the earlier posts its outline links back to.

- [ ] **Step 1:** Branch `feat/go-series-cutover`. Rewrite the `golang` entry per the spec (titles, act labels/blurbs from the ladder table; pitch, outcomes and credit rewritten for the new ladder, both `en` and `vi`).
- [ ] **Step 2:** Add to `astro.config.mjs`:
  `redirects: { '/blog/go-fundamentals-toolchain-modules-packages-types/': '/blog/go-first-program-modules-packages/', '/blog/go-fundamentals-composite-types-structs-methods-interfaces/': '/blog/go-structs-methods-interfaces/', '/blog/go-fundamentals-errors-concurrency-goroutines-channels-testing/': '/blog/go-goroutines-channels-select/' }`. Delete the 3 old posts, then the components that `grep -rl "<Name>" src/content src/components` no longer finds.
- [ ] **Step 3: Draft-link check:** for every published Go post, every `/blog/go-…/` link resolves to a built page: `for u in $(grep -ho '/blog/go-[a-z0-9-]*/' src/content/blog/go-*.mdx | sort -u); do [ -f "dist${u}index.html" ] || echo MISSING $u; done` → no output (post 20 may be listed in `series.ts` as "soon", but no post links to it yet).
- [ ] **Step 4: Redirect check:** `npm run build`, then for each of the 3 old slugs `grep -c 'http-equiv="refresh"' dist/blog/<old-slug>/index.html` → 1 and the target URL appears in the file; `npx astro preview` and open each old URL with and without trailing slash → lands on the new post.
- [ ] **Step 5: Series page check:** `/blog/series/golang/` shows 20 parts in 5 acts, parts 1–19 linked, part 20 "soon"; each reading path renders.
- [ ] **Step 6:** Gate, CHANGELOG entry, commit `content: Go series cutover to the 20-post ladder`, PR.

### Tasks 14–22: Rewrite posts 11–19 in place

One task per post, branch `feat/go-post-NN-rewrite` from `main`, slug and URL unchanged, `draft` stays `false` (the post is live). Each: rewrite the file to the spec's outline, **remove** the sections the spec moves elsewhere (replace with one sentence + link to the home post), add the recap/links back to posts 1–10, use the post-10 service as the example where it fits, run the per-post checklist, commit `content: rewrite Go series post NN (<title>)`, PR.

| Task | Post | Slug (kept) | Must remove (moved elsewhere) |
|---|---|---|---|
| 14 | 11 | `go-memory-data-types-slices-maps-strings` | receiver choice (§4 "choosing receivers" → post 4) |
| 15 | 12 | `go-abstractions-interfaces-generics-errors` | error flow §4 (→ post 5); `defer` timing (→ post 2); `init()` / package layout (→ post 1/2) |
| 16 | 13 | `go-concurrency-scheduler-channels-context-mutexes` | context basics (→ post 8) |
| 17 | 14 | `go-production-stdlib-cpu-cache-gc-kubernetes` | cache lines, false sharing, escape analysis, GC (→ post 16); pprof and test accuracy (→ posts 17/18) |
| 18 | 15 | `go-efficiency-workflow-raer-tfbo-hardware-memory` | stack vs heap and escape analysis §4–5 (→ post 16) |
| 19 | 16 | `go-hardware-cpu-caches-virtual-memory-gc-allocator` | nothing; absorbs the moved material above and struct alignment from the retired part 1 |
| 20 | 17 | `go-observability-metrics-microbenchmarks-benchstat` | nothing; absorbs test accuracy from the old part 7 §4 |
| 21 | 18 | `go-profiling-pprof-flamegraphs-off-cpu-continuous` | nothing |
| 22 | 19 | `go-three-rs-optimization-patterns-streaming-pooling` | nothing; ends with the ladder recap linking all levels |

Order: a post that **absorbs** material is rewritten before the post that **removes** it, so the material is never missing from the live site. Posts 16, 17 and 18 go before posts 14 and 15. Run order: Task 14, 15, 16, 19, 20, 21, 17, 18, 22.

- [ ] **Task 14** · [ ] **Task 15** · [ ] **Task 16** · [ ] **Task 19** · [ ] **Task 20** · [ ] **Task 21** · [ ] **Task 17** · [ ] **Task 18** · [ ] **Task 22**

### Task 23: Post 20 "Go interview prep"

**Files:**
- Create: `src/content/blog/go-interview-questions-output-live-coding.mdx`
- Create: `src/components/demos/GoPredictOutputDemo.tsx` (cards with reveal + explanation; renders all answers inside `<details>` when JS is off)

- [ ] **Step 1:** Branch `feat/go-post-20-interview` from `main` (after Task 22 merged).
- [ ] **Step 2:** Write the three parts per the spec. Every model answer links to its home post (1–19). The 3 live-coding solutions ship with tests that pass under `go test -race` on Go 1.27; paste the real run output.
- [ ] **Step 3:** Every "predict the output" snippet's answer is the captured output of `go run` on Go 1.27; the loop-variable snippet shows both `go 1.21` and `go 1.22+` module behaviour.
- [ ] **Step 4:** No sentence claims a company asks a question unless a source URL in `sources` backs it.
- [ ] **Step 5:** Per-post checklist (No-JS step: all answers visible via `<details>`), commit `content: Go series post 20 (interview prep) as draft`, PR, CHANGELOG entry.
