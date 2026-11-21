# Go Series Native Covers (Gopher Art + Real Tooling Heroes) Implementation Plan

**Goal:** Replace the metaphor photos in all 12 `golang` series posts with Go-native imagery. Each post's frontmatter `cover` (blog index cards, featured post, thumbnails, category pages) becomes an official Renee French gopher artwork (CC BY 3.0, Wikimedia Commons). Each post's in-post hero `<Figure>` (first figure under the title) becomes a genuine screenshot of Go tooling output captured locally with Go 1.27.1. DDIA, UI/UX, and standalone posts are untouched (possible follow-up if Khang wants the same direction there).

**Why:** the golang series currently opens with historical metaphor photos (switchboard, Babbage gears, centrifugal governor, PDP-11, watermill…). Khang wants title images that are about Go itself. The series cover page already uses gopher art (`go-gopher-five-years.jpg`), so gopher covers give the series one coherent identity, and real tooling screenshots keep the site's "real, sourced, no AI imagery" philosophy.

**Architecture:**
- Covers: 11 artworks stored in a new `src/assets/series/golang/` folder (series-level identity, like the existing `src/assets/series/` images; avoids duplicating files across 12 post folders). Each post references its artwork via the existing relative `cover:` frontmatter path. The 12th post (Go profiling) uses a real pprof flame graph screenshot as its cover — on-topic and wide-format.
- Heroes: for each post, run a small scratch Go program on this machine (Go 1.27.1), capture the raw output of a specific command (`go build -gcflags=-m`, `go run -race`, `go tool pprof -top`, `benchstat`, `go test -bench -benchmem`, `go mod graph`…), render the captured text in a terminal-styled HTML page (JetBrains Mono, dark terminal palette), and screenshot it with headless Chrome at 2x. Output PNG goes to `src/assets/blog/<slug>/`. The text is genuine captured output — no invented numbers; the caption states the command and Go version.
- Mirroring: each hero `<Figure>` appears in both `<En>` and `<Vi>` with captions rewritten per language to explain the artifact (no metaphor sentences remain).
- Drafts: the 8 draft posts stay `draft: true`. Draft pages exist only under `astro dev`, so draft verification uses the dev server; published posts verify via `npm run build`.

**Tech stack:** Astro 7 MDX, `astro:assets` `<Image>`, headless Chrome `--screenshot --force-device-scale-factor=2`, local Go 1.27.1.

## Cover mapping (Khang reviews the links before approving; swaps are one-line edits)

| Post | Title | Cover |
|---|---|---|
| `go-fundamentals-toolchain-modules-packages-types` | Go basics | [Go gopher mascot bw.png](https://commons.wikimedia.org/wiki/File:Go_gopher_mascot_bw.png) (3861×3861) — the canonical gopher for the intro post |
| `go-fundamentals-composite-types-structs-methods-interfaces` | Go types and structs | [Go gopher model sheet.jpg](https://commons.wikimedia.org/wiki/File:Go_gopher_model_sheet.jpg) (1280×719) — one character drawn from many angles = one type, many values |
| `go-abstractions-interfaces-generics-errors` | Go interfaces and errors | [Go gopher pencil hat.jpg](https://commons.wikimedia.org/wiki/File:Go_gopher_pencil_hat.jpg) (887×1122) — same head, different hat = concrete type behind an interface |
| `go-concurrency-scheduler-channels-context-mutexes` | Go concurrency | [Go gopher pencil running.jpg](https://commons.wikimedia.org/wiki/File:Go_gopher_pencil_running.jpg) (892×829) — goroutines in flight |
| `go-fundamentals-errors-concurrency-goroutines-channels-testing` | Goroutines and testing | [Go gopher bumper.png](https://commons.wikimedia.org/wiki/File:Go_gopher_bumper.png) (1920×1080) — the runtime at work (content to eyeball) |
| `go-memory-data-types-slices-maps-strings` | Go memory | [Go gopher app engine color.jpg](https://commons.wikimedia.org/wiki/File:Go_gopher_app_engine_color.jpg) (1431×901) — the classic colored gopher (content to eyeball) |
| `go-efficiency-workflow-raer-tfbo-hardware-memory` | Go efficiency workflow | [Go gopher biplane.jpg](https://commons.wikimedia.org/wiki/File:Go_gopher_biplane.jpg) (1875×1477) — flying by instruments = measurement-driven optimization |
| `go-hardware-cpu-caches-virtual-memory-gc-allocator` | Go hardware and GC | [Go gopher pencil helmet.jpg](https://commons.wikimedia.org/wiki/File:Go_gopher_pencil_helmet.jpg) (1009×1393) — hard hat for hardware-level work |
| `go-observability-metrics-microbenchmarks-benchstat` | Go benchmarking | [Go gopher pencil megaphone.jpg](https://commons.wikimedia.org/wiki/File:Go_gopher_pencil_megaphone.jpg) (1326×1095) — announcing measurements |
| `go-profiling-pprof-flamegraphs-off-cpu-continuous` | Go profiling | real pprof flame graph screenshot (wide 16:10-friendly) |
| `go-three-rs-optimization-patterns-streaming-pooling` | Go optimization patterns | [Go gopher pencil swim.jpg](https://commons.wikimedia.org/wiki/File:Go_gopher_pencil_swim.jpg) (1143×1152) — streaming |
| `go-production-stdlib-cpu-cache-gc-kubernetes` | Go in production | [Go gopher pencil wrench.jpg](https://commons.wikimedia.org/wiki/File:Go_gopher_pencil_wrench.jpg) (1953×1156) — fixing in production |

All 11 artworks are by Renee French, CC BY 3.0, per their Commons file pages. Every post using one adds a `sources` entry (`title: "Go gopher <name> (CC BY 3.0)", author: "Renee French", url: <Commons file page>`).

## Hero artifact mapping (all output captured for real on this machine)

| Post | Hero artifact |
|---|---|
| Go memory | `go build -gcflags=-m` escape analysis: which values escape to the heap |
| Go interfaces and errors | `go run` of the typed-nil trap printing `err != nil → true` |
| Go concurrency | `go run -race` output: WARNING: DATA RACE + two goroutine stacks |
| Go in production | `go tool pprof -top` over a real locally captured CPU profile |
| Go efficiency workflow | `go test -bench -benchmem` raw output (the "measure first" step) |
| Go types and structs | `go run` printing `unsafe.Sizeof`/offsets of struct layouts |
| Goroutines and testing | `go test -v` output with PASS lines |
| Go basics | `go mod graph` (or `go list -m all`) on a small real module |
| Go hardware and GC | `go test -bench` comparing adjacent vs padded struct fields (cache-line effect in ns/op) |
| Go benchmarking | `benchstat` delta table between two real benchmark runs |
| Go profiling | `go tool pprof -top` terminal output (cover already shows the flame graph) |
| Go optimization patterns | `go test -bench -benchmem` showing allocs/op drop from pooling |

## Global constraints

- No AI-generated imagery. 12 covers = Renee French originals + 1 real flame graph; 12 heroes = genuine captured output.
- No edits to shared components (`Figure.astro`, `AnimatedFlow`, `DemoFrame`, layouts), `src/data/series.ts` (series cover already gopher-based), quiz files, or non-Go posts.
- Hero PNGs are artifacts with their own terminal palette (like existing photos); no site CSS changes.
- Bilingual mirroring: every hero `<Figure>` in both `<En>` and `<Vi>`; VI captions typically ~20% longer. `cover_alt` stays a single English string per current convention.
- Old metaphor photos are deleted only when no reference remains anywhere (grep per file before deleting).
- Draft flags unchanged. No push or merge to main without Khang.

## Review focus

1. 16:10 card crop (`object-fit: cover`) decapitates a square gopher → check `/blog/` cards at desktop and 360px.
2. White-paper pencil JPGs on dark-mode cards → confirm they read intentionally, not broken.
3. VI hero captions overflow or wrap badly → check one VI post page at 360px.
4. Draft-only pages cannot be checked in `npm run build` → verify the 8 drafts via `astro dev`.
5. Every artwork credited exactly once per post (sources list); no metaphor filename left referenced.

---

### Task 1: Baseline

**Files:** none.

- [ ] **Step 1:** Create branch `feat/go-gopher-covers` from `main`; run `npm run build` + `node --test src/utils/quiz.test.ts` → clean baseline.

### Task 2: Download the 11 gopher artworks

**Files:**
- Create: `src/assets/series/golang/` (11 files, kebab-case names matching the Commons titles)

- [ ] **Step 1:** Download each file from Wikimedia Commons (standard `Special:FilePath` URL); verify with `sips -g pixelWidth -g pixelHeight` that dims match the table above; discard any file that fails or comes back tiny.
- [ ] **Step 2:** Confirm no post or component references these paths yet (they are new). Commit: `assets(blog): add the 11 Go gopher artworks (CC BY 3.0, Renee French)`.

### Task 3: Build the hero capture pipeline and produce 12 hero PNGs

**Files:**
- Create: scratch programs + captured outputs under the session temp dir (not committed)
- Create: `src/assets/blog/<slug>/go-<tool>-hero.png` for each of the 12 slugs
- Create: `src/assets/blog/go-profiling-pprof-flamegraphs-off-cpu-continuous/pprof-flamegraph-cover.png`

- [ ] **Step 1:** For each post, write the small Go program / command from the hero table in a scratch dir; run it with Go 1.27.1; save raw captured output to a text file. No invented numbers — if a capture fails, fix the program, never hand-edit output.
- [ ] **Step 2:** Render each captured output as terminal-styled HTML (JetBrains Mono, terminal window chrome, wrapped lines only where the real terminal wrapped); screenshot with headless Chrome `--screenshot --force-device-scale-factor=2 --window-size=1200,760` (size adapted per output length).
- [ ] **Step 3:** For the profiling post: capture a real CPU profile from a scratch benchmark, run `go tool pprof -http`, and screenshot the flame graph view at a wide window for the cover PNG; capture `pprof -top` text for the hero PNG.
- [ ] **Step 4:** Sanity-check every PNG (file size, dims, not blank) and keep the raw text captures for caption writing. No commit yet (files land with their posts).

### Task 4: Edit the 12 posts (one commit per post)

**Files:**
- Modify: `src/content/blog/go-*.mdx` (12 files)
- Delete: orphaned metaphor images under `src/assets/blog/go-*/` (only those with zero remaining references)

Per post:

- [ ] **Step 1:** Frontmatter: point `cover` at the artwork (or flame graph) from the mapping, rewrite `cover_alt` to describe the artwork, add the artwork `sources` entry.
- [ ] **Step 2:** Body: replace the hero `<Figure src={heroX} …>` in `<En>` and `<Vi>` with the new hero import + bilingual captions that explain the artifact (command + what the reader is seeing; no metaphor framing). Remove the old hero import.
- [ ] **Step 3:** Grep the post folder for now-unused metaphor files; delete a file only if zero references remain repo-wide.
- [ ] **Step 4:** Commit: `feat(blog): <slug> gopher cover + real <tool> hero`.

### Task 5: Verify

- [ ] **Step 1:** `npm run build` + `node --test` → clean. Published post pages 200, no error overlay.
- [ ] **Step 2:** Greps: every old metaphor filename → 0 references; each new cover path → exactly 1 frontmatter + 1 hero import; `golang` artwork credits → 12 posts each have one.
- [ ] **Step 3:** `npx astro preview`: screenshot `/blog/` light + dark + 360px (gopher cards + featured post + thumbnails); read for crop problems.
- [ ] **Step 4:** `npx astro dev`: screenshot all 8 draft post pages (light, and VI at 360px for at least two); read for caption overflow and hero legibility.
- [ ] **Step 5:** Fix anything found; per-fix commits.

### Task 6: Docs + hand-off

**Files:**
- Modify: `.claude/skills/book-to-post/style-guide.md` (hero section), `.claude/skills/enrich-post/SKILL.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1:** Document the Go-series hero exception: golang-series posts open with a real Go tooling artifact (captured output), not a real-world metaphor; gopher covers are credited via `sources`.
- [ ] **Step 2:** CHANGELOG entry (VI): what changed, who decided (Khang — "ảnh liên quan đến golang thay vì ảnh thực tế ẩn dụ"), open questions (DDIA/UI-UX covers intentionally untouched).
- [ ] **Step 3:** Push branch, open PR into `main`, wait for Khang's merge.
