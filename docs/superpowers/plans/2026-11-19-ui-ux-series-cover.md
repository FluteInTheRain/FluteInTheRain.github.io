# UI/UX Series Cover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A "book cover + contents" page at `/blog/series/refactoring-ui/` with an interactive reading map, series navigation inside each series post, series cards on `/blog` and the `ui-ux` category page, and chapter/book framing removed from the UI/UX posts.

**Architecture:** `src/data/series.ts` (exists, written by the parallel session) holds the series content. A new `src/utils/series.ts` joins it with the blog collection (published or not, title, reading time, URL). Astro components render everything statically with real `<a>` links; one small inline script on the map toggles CSS classes for path selection and hover.

**Tech Stack:** Astro 5 content collections, `.astro` components, inline SVG, vanilla JS, site CSS tokens (`--text`, `--text-body`, `--text-muted`, `--text-faint`, `--border`, `--bg`, `--bg-alt`, `--red`).

**Spec:** `docs/superpowers/specs/2026-11-19-ui-ux-series-cover-design.md`

## Global Constraints
- Only touch UI/UX series files. Never edit or stage DDIA files or `.claude/skills/*`.
- Commit path-scoped (`git add <paths>`), never `git add -A`. Draft posts 5–9 are not committed.
- Bilingual: every visible string uses `<T en vi>` or `data-lang-en`/`data-lang-vi` spans.
- Colours only from site tokens (green may use `var(--green, #10b981)` as existing figures do); must read in light and dark.
- Published = present in `getPublishedPosts()` (drafts count as published only in `astro dev`).
- No "Chapter N of the book…" / "The book suggests…" framing in post body or descriptions.
- Project has no test runner: verification is `npm run build` plus `grep` assertions on `dist/` HTML and screenshots.

## Review Focus
- Series with 0 published posts or a slug in `series.ts` with no file → cover still builds, part shows "soon"; CTA hidden. Pinned by Task 1 check (slug with no file).
- Prev/next on the first/last published part → only one link, no empty box. Task 3 check.
- A post not in any series → no series bar, no pager. Task 3 check (a DDIA post).
- JS disabled → map shows all nodes linked, contents list complete. Task 2 check (no-JS screenshot).
- Narrow screen (360px) → no horizontal page scroll; the map scrolls inside its own box. Task 2/5 screenshots.

---

### Task 1: Series view helpers

**Files:**
- Create: `src/utils/series.ts`

**Interfaces:**
- Consumes: `SERIES`, `Series`, `SeriesPart`, `seriesOfPost`, `seriesUrl` from `src/data/series.ts`; `getPublishedPosts`, `readingTime` from `src/utils/blog.ts`.
- Produces:
  - `interface PartView { part: SeriesPart; n: number /* 1-based */; published: boolean; url: string | null; title: string; titleVi?: string; mins: number | null }`
  - `interface SeriesView { series: Series; url: string; parts: PartView[]; publishedCount: number; first: PartView | null }`
  - `getSeriesView(id: string): Promise<SeriesView>` — title falls back to `part.topic.en` when the post file is missing.
  - `getSeriesNav(slug: string): Promise<{ view: SeriesView; current: PartView; prev: PartView | null; next: PartView | null } | null>` — prev/next are the nearest **published** parts in series order; `null` when the slug is in no series.

- [ ] **Step 1:** Implement both functions. Post URL is `/blog/${post.id}/`.
- [ ] **Step 2:** Verify with a temporary page is unnecessary; Task 2 exercises it. Run `npx astro check 2>&1 | tail -5` (or `npm run build` if `astro check` is not installed). Expected: no errors in `src/utils/series.ts`.

### Task 2: Cover page with map and contents

**Files:**
- Create: `src/pages/blog/series/[id].astro` (getStaticPaths over `SERIES_IDS`)
- Create: `src/components/series/SeriesCover.astro` — hero: kicker, title, tagline, pitch paragraphs, 9-cell spine (filled = published, each cell links to its part when published), CTA "Start with Part N" → `view.first` (hidden when null), "N of 9 published"; outcomes list; credit line.
- Create: `src/components/series/SeriesMap.astro` — props `{ view: SeriesView }`.
- Create: `src/components/series/SeriesContents.astro` — ordered list: two-digit number, title link (or plain text + "soon" badge), hook, `mins` min read.

**SeriesMap decisions:**
- One inline SVG, `viewBox="0 0 900 H"`, `min-width: 640px` inside an `overflow-x:auto` wrapper (same pattern as `TypeDrift.astro`).
- 4 columns in `ActId` order (`start, structure, surface, craft`), header = act label + blurb. Nodes stacked in each column in `parts` order; node = rounded rect + "01" number + topic; published nodes wrapped in SVG `<a href>`; unpublished nodes dimmed with "soon".
- Edges: one curved path per `builds` entry, from prerequisite to dependent, with arrowhead marker; `data-from` / `data-to` slugs.
- Path picker: buttons above the SVG, one per `series.paths` (first = "Read it all", selected by default), plus the path's `who` line under the buttons. Selecting a path: nodes in `order` get class `is-on` and a circled step number badge (1..k); others get `is-dim`.
- Hover/focus a node: it, its prerequisites and dependents, and the edges between them get `is-hi`; everything else `is-fade`. Leaving restores the path view.
- Script reads path orders from a `data-paths` JSON attribute; scoped to the figure element (multiple maps safe). With no JS: no dimming, all nodes visible, buttons hidden via `.js` guard (`<figure class="smap" data-js="off">`, script sets `on`).

- [ ] **Step 1:** Build the page and components.
- [ ] **Step 2:** `npm run build`; then
  `grep -c 'class="smap' dist/blog/series/refactoring-ui/index.html` → ≥1;
  `grep -o 'href="/blog/[a-z0-9-]*/"' dist/blog/series/refactoring-ui/index.html | sort -u` lists every published UI/UX post and no draft slug.
- [ ] **Step 3:** Temporarily add a fake part slug `missing-post` to a local copy check: run `getSeriesView` path by adding it to `series.ts`, build, confirm the page builds and shows it as "soon", then revert. (Review Focus: missing file.)
- [ ] **Step 4:** Screenshots (Chrome headless, `npx astro preview`): desktop light, dark (`data-theme`), VI, 390px, and with `--blink-settings=scriptEnabled=false`. Read each; fix overlaps.
- [ ] **Step 5:** Commit `src/utils/series.ts src/data/series.ts src/pages/blog/series src/components/series` — `feat(blog): add series cover page with reading map`.

### Task 3: Series bar and pager in posts

**Files:**
- Create: `src/components/series/SeriesBar.astro` — props `{ nav }`; one line above the post title: "Part N of 9 · <series title> · See the series map →" linking `view.url`.
- Create: `src/components/series/SeriesPager.astro` — after the References section: prev (← Part N · title) and next (Part N · title →); render only the links that exist; nothing when both null.
- Modify: `src/pages/blog/[id].astro` — `const nav = await getSeriesNav(post.id)`; render bar inside `.post-header` before the title, pager after `post-sources`, both only when `nav`.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `npm run build`; check
  `grep -c 'series-bar' dist/blog/spacing-is-a-system/index.html` → 1;
  `grep -c 'series-bar' dist/blog/storage-engines-logs-lsm-btree-columns/index.html` → 0;
  first published part has no prev link, last published part has no next link (grep `series-pager-prev` / `-next`).
- [ ] **Step 3:** Commit — `feat(blog): link series posts to the cover and to each other`.

### Task 4: Series card on /blog and category page

**Files:**
- Create: `src/components/series/SeriesCard.astro` — props `{ view }`; compact cover: kicker, title, tagline, mini spine, "N of 9 published · Open the series →".
- Modify: `src/pages/blog/index.astro` (above the post grid), `src/pages/blog/category/[category].astro` (above the grid, only for categories that own a series: show when any `view.parts` post has that category).

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** Build; `grep -c 'series-card' dist/blog/index.html` → 1; `.../category/ui-ux/index.html` → 1; another category page → 0.
- [ ] **Step 3:** Commit — `feat(blog): surface the UI/UX series on the blog index`.

### Task 5: Remove chapter/book framing

**Files:**
- Modify: `src/content/blog/spacing-is-a-system.mdx` (committed post), and in the working tree only: `color-is-a-palette-not-a-picker.mdx`, `finishing-touches-that-make-ui-feel-real.mdx`, `leveling-up-your-design-eye.mdx`.

Rule: state the idea directly. "The book's 25% rule" → "the 25% rule"; "Chapter 3 of *Refactoring UI* is about…" → delete or restate as the post's own claim; "my own example, not the book's" → "an example". Keep named people (Wathan, Schoger) when quoting them or citing their talk. EN and VI together.

- [ ] **Step 1:** Edit.
- [ ] **Step 2:** `grep -v '^  - {' <file> | grep -ciE 'chapter [0-9]|chương [0-9]|the book|cuốn sách|của sách|sách (nói|khuyên|gọi|đề|cho|bảo|gợi)'` → 0 for all 9 UI/UX posts.
- [ ] **Step 3:** Build passes. Commit only the four already-tracked UI/UX posts (`design-before-you-prompt`, `visual-hierarchy-rank-before-you-style`, `spacing-is-a-system`, `typography-is-a-scale-not-a-slider`) — `docs(blog): state ideas directly instead of citing chapters`.

### Task 6: Review and merge
- [ ] Whole-branch review (`pr-review-toolkit:code-reviewer`, model sonnet) on `git diff main...HEAD`.
- [ ] Show Khang; on approval: `git switch main && git merge --ff-only feat/ui-ux-series-cover && git push origin main`.
