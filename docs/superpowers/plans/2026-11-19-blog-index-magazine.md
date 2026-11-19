# Blog index magazine layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/blog/` as a magazine layout (featured + also new, series shelf, topic sections, archive, search) with cover images on a shared post card.

**Architecture:** The choice of which post goes where is a pure TypeScript module (`src/utils/blog-index.ts`) tested with `node --test`. Astro components only render what it returns. Covers come from a new optional `cover` frontmatter field using Astro's `image()` schema helper. Search is a small client script over `data-search` attributes.

**Tech Stack:** Astro 7, MDX, `astro:assets` `<Image>`, plain CSS with the site tokens in `src/styles/style.css`, Node 26 built-in test runner (native TypeScript stripping).

**Spec:** `docs/superpowers/specs/2026-11-19-blog-index-magazine-design.md` (read it first, including "Calls made after the builder check").

**Worktree:** `/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain-blog-ui`, branch `feat/blog-index-magazine`, base `main`. Never touch the main worktree `/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io` (another session has uncommitted edits there).

**Mockup to match:** `/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io/.superpowers/brainstorm/84075-1795080199/content/blog-layout.html` (tab A). Its CSS is `/private/tmp/claude-502/-Users-nguyennhatkhang-Downloads-learning-FluteInTheRain-github-io/f2a27b99-d1bb-4160-9e2d-b45882c5f22a/scratchpad/ui/mock.css`; reuse its proportions, but rewrite with site tokens (`--text`, `--text-body`, `--text-muted`, `--border`, `--card-bg`, `--bg-alt`, `--shadow`, `--shadow-hover`, `--red`, `--btn-primary-bg`, `--gold-*`), never its hex values.

## Global Constraints

- No new npm dependencies.
- No hex colours in components or new CSS; tokens only. Dark mode must work via `[data-theme="dark"]`.
- Every visible string goes through `T` with an `en` and a `vi` value. New shared strings live in `ui` in `src/data/content.ts`.
- No horizontal scroll at 390px.
- No AI-looking decoration: no gradients on text, no emoji, no glass effects.
- Old styles and components that become unused are deleted (`.post-grid-list`, `.post-grid--featured`, `.post-card--featured`, the old `.series-card*` rules).
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Vietnamese mode:** VI titles are longer. Card titles clamp at 3 lines, and descriptions at 2. The featured title must not overflow at 1024px. Check by screenshot with `html[data-lang='vi']`.
2. **Search with Vietnamese diacritics:** typing `ban sao` must match "bản sao", and `BẢN` must match too. Normalise both sides with NFD, strip combining marks, map `đ` to `d`, and lowercase. Test this in Task 1 (`normalizeSearch`).
3. **No JS:** the archive must show every row when scripts do not run. Rows past 8 are hidden only by a class that the script adds (fail open).
4. **Post with no cover** (`ag-grid-realtime-streaming`): it shows the neutral panel with its category label, in light and dark, in the card and in the "Also new" thumbnail.
5. **Few posts:** if a filter or a future change leaves 0–3 posts, the page must not crash or render empty headed sections. Test this in Task 1 (`buildIndexLayout([])`, and 2 posts).

---

### Task 0: Worktree setup

- [ ] **Step 1:** `cp -cR /Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io/node_modules /Users/nguyennhatkhang/Downloads/learning/FluteInTheRain-blog-ui/node_modules`. Use a real APFS clone, not a symlink: with a symlink, Vite returns 403 for the React renderer.
- [ ] **Step 2:** Run `npm run build` in the worktree. Expected: it completes with no errors. Record the build time.

### Task 1: Layout selection module

**Files:**
- Create: `src/utils/blog-index.ts`
- Test: `src/utils/blog-index.test.ts`

**Interfaces:**
- Produces:
  - `interface IndexPost { id: string; date: Date; category: string; featured?: boolean }`
  - `interface TopicSection<T> { category: string; total: number; posts: T[] }`
  - `interface IndexLayout<T> { featured: T | null; alsoNew: T[]; topics: TopicSection<T>[]; archive: T[] }`
  - `buildIndexLayout<T extends IndexPost>(posts: T[], categoryOrder: readonly string[]): IndexLayout<T>`. The input may be in any order; sort by date, newest first, inside the function.
  - `shortTitle(title: string): string`. Returns the text before the first `:`, trimmed, or the whole title if there is no colon.
  - `normalizeSearch(s: string): string`. Applies NFD, strips `\p{M}`, maps `đ`/`Đ` to `d`, lowercases, and collapses whitespace.
  - `formatHours(totalMinutes: number): string`. Examples: 570 gives `"9.5h"`, 60 gives `"1h"`, 25 gives `"0.4h"`.
  - The module imports nothing (so `node --test` can load it).

- [ ] **Step 1: Write the failing tests** with `import { test } from 'node:test'`, `import assert from 'node:assert/strict'` and `import { ... } from './blog-index.ts'`. Use the helper `p(id, isoDate, category, featured?)`.
  - `featured is newest when none flagged`: given posts a(2026-11-19), b(11-18), c(11-17), `featured.id === 'a'`.
  - `featured flag wins, newest flagged if several`: b and c are flagged, so the result is `'b'`.
  - `alsoNew is next 3 newest excluding featured`: with 6 posts, the ids are positions 2–4.
  - `topics skip categories under 3 posts and follow categoryOrder`: categoryOrder `['frontend','database','ui-ux']`; frontend has 1 post, ui-ux has 4, database has 3. The topics come out as `['database','ui-ux']`.
  - `topic posts avoid featured and alsoNew, topped up when short`: build a case where database has 3 posts, 2 of them in featured/alsoNew. The section still has 3 posts, the unshown one comes first, then the newest of the already-shown ones.
  - `topic total counts all published posts of the category`.
  - `archive holds every post newest first`.
  - `empty input`: the result is `{ featured: null, alsoNew: [], topics: [], archive: [] }`.
  - `two posts`: featured is set, alsoNew has length 1, topics is empty.
  - `shortTitle`: `'Replication: what users see'` gives `'Replication'`, and `'No colon'` gives `'No colon'`.
  - `normalizeSearch`: `'Bản SAO  đúng'` gives `'ban sao dung'`.
  - `formatHours`: 570 gives `'9.5h'`, 60 gives `'1h'`, 25 gives `'0.4h'`.
- [ ] **Step 2:** `node --test src/utils/blog-index.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3:** Implement the five exports in `src/utils/blog-index.ts`.
- [ ] **Step 4:** `node --test src/utils/blog-index.test.ts`. Expected: all pass.
- [ ] **Step 5:** Commit `feat(blog): pure layout selection for the blog index`.

### Task 2: `cover` and `featured` frontmatter, filled for all posts

**Files:**
- Modify: `src/content.config.ts` (the schema becomes `({ image }) => z.object({...})`; add `cover: image().optional()`, `cover_alt: z.string().optional()` and `featured: z.boolean().default(false)`)
- Modify: every `src/content/blog/*.mdx` that has a hero image (26 of 27)
- Modify: `src/content/blog/_TEMPLATE.md.txt` (document the three fields)

- [ ] **Step 1:** Add the schema fields.
- [ ] **Step 2:** For each post, open the MDX and find the first image a reader sees under the header, in reading order (the first `<Figure>`, `<Image>`, `<img>` or Markdown image in the body). Do not use the first `import` line. Example: in `replication-when-copies-disagree.mdx` the hero is the Jean Miélot miniature. Set `cover` to its path relative to the MDX file (for example `"../../assets/blog/<slug>/<file>.jpg"`). Set `cover_alt` to that figure's existing alt text. `ag-grid-realtime-streaming` gets no cover.
- [ ] **Step 3:** Add this check to the test file from Task 1. Name it `every post except ag-grid has a cover`. It reads each `src/content/blog/*.mdx` with `node:fs`, parses the `cover:` line, and asserts that the file exists on disk relative to the MDX. Run `node --test src/utils/blog-index.test.ts`. Expected: pass.
- [ ] **Step 4:** Run `npm run build`. Expected: success, with no `image()` errors.
- [ ] **Step 5:** Commit `feat(blog): cover images and featured flag in post frontmatter`.

### Task 3: New post card everywhere

**Files:**
- Modify: `src/components/PostCard.astro` (rewrite)
- Modify: `src/components/LatestPosts.astro` (always a 3-column grid; drop the `featured` variant)
- Modify: `src/pages/blog/category/[category].astro` (grid instead of `.post-grid-list`)
- Modify: `src/styles/style.css` (new `.post-card` rules; delete `.post-grid-list`, `.post-grid--featured`, `.post-card--featured`, old `.post-card` padding rules)

**Interfaces:**
- Produces: `PostCard` props `{ post: CollectionEntry<'blog'>; headingLevel?: 2 | 3 }`. Markup root: `<article class="post-card" data-search={...}>`. `data-search` is `normalizeSearch` of title, `title_vi`, description, `description_vi` and tags joined by spaces.
- Also produces: `.post-grid` as 3 columns at ≥1024px, 2 columns from 640px, and 1 column below that.

- [ ] **Step 1:** Rewrite `PostCard` following the "New post card" part of the spec:
  - Cover via `<Image src={cover} alt={cover_alt ?? ''} widths={[400, 720]} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />` in a 16:10 `.post-card-media`.
  - Without a cover: `.post-card-media.is-empty`, showing the category label.
  - Then the category kicker, the title linked to `/blog/<id>/` (3-line clamp), the description (2-line clamp), and the meta (date · `readingTime` + `ui.minRead`) pinned to the bottom.
  - No tags.
- [ ] **Step 2:** Update `LatestPosts` and the category page to the grid.
- [ ] **Step 3:** Run `npm run build`. Expected: success. Then `grep -n "post-grid-list\|post-card--featured\|post-grid--featured" -r src`. Expected: no matches.
- [ ] **Step 4:** Screenshot the home page and `/blog/category/database/` at 1440px and 390px, light and dark (see Task 7 for the command). Expected: the cards align, images are cropped not stretched, there is no horizontal scroll, and the ag-grid card shows the empty panel.
- [ ] **Step 5:** Commit `feat(blog): image post card shared by blog, category and home`.

### Task 4: Series shelf card

**Files:**
- Modify: `src/components/series/SeriesCard.astro` (rewrite into the shelf card; it stays the single series entry used on list pages)

**Interfaces:**
- Consumes: `SeriesView` from `src/utils/series.ts`; `actIndex(series, actId)` from `src/data/series.ts`; `BookCover` with `size="sm"`.
- Produces: `SeriesCard` props `{ view: SeriesView }`. It renders as a grid item, so the parent supplies `.series-shelf` (2 columns at ≥900px, 1 column below).

- [ ] **Step 1:** Rewrite following spec section 4:
  - Book on the left at about 150px.
  - Kicker: `series.kicker` plus "all published" when `publishedCount === parts.length`, else "N of M published".
  - Then the title, the tagline, and one pill per act: `label` + the count of parts in that act, with the colour class `act-${actIndex(...)}` reusing the act colour tokens the series map uses.
  - Then the first 3 `parts` as an `<ol>` with numbers `01`–`03`. A published part is a link; an unpublished part is text plus "soon".
  - Then "Open the series →" linking to `view.url`.
  - The card is not one big `<a>`, because it now contains links. Use an `<article>`, with the title linked.
- [ ] **Step 2:** Put `.series-shelf` around the series cards on the blog index and the category page.
- [ ] **Step 3:** Run `npm run build` and take a 1440px screenshot of `/blog/`. Expected: two cards side by side, act pills coloured the same as on `/blog/series/ddia/`.
- [ ] **Step 4:** Commit `feat(blog): series shelf cards with acts and first parts`.

### Task 5: Blog index page

**Files:**
- Modify: `src/pages/blog/index.astro`
- Modify: `src/components/CategoryNav.astro` (add an optional `counts?: Record<string, number>` prop; when it is given, a chip reads `Label · N`)
- Create: `src/components/blog/FeaturedPost.astro`, `src/components/blog/AlsoNew.astro`, `src/components/blog/TopicSection.astro`, `src/components/blog/ArchiveList.astro`
- Modify: `src/data/content.ts` (new `ui` strings, listed in the spec's "Bilingual" section; Vietnamese wording is your call, keep it natural)
- Modify: `src/styles/style.css` (index layout rules)

**Interfaces:**
- Consumes: `buildIndexLayout`, `shortTitle` and `formatHours` from Task 1; `PostCard` from Task 3; `SeriesCard` and `.series-shelf` from Task 4; `getSeriesNav(slug)` for the featured post's "Part N of M"; `readingTime`.
- Produces: `ArchiveList` props `{ posts: CollectionEntry<'blog'>[]; initial?: number }` (default 8). Every row is rendered; a row with index ≥ `initial` carries `data-extra`. A `<button class="archive-more" hidden>` is shown by the script (Task 6). Each row has `data-search` like the card.

- [ ] **Step 1:** Build the page in spec order:
  - intro and stats: posts count, series with `publishedCount > 0`, and `formatHours` of the summed `readingTime`;
  - chips with counts;
  - featured row with `FeaturedPost` and `AlsoNew`;
  - the series shelf;
  - a `TopicSection` for each `layout.topics` entry: heading, count, "View all →" to `categoryUrl`, and 3 `PostCard`s;
  - `ArchiveList` with all posts;
  - the RSS link stays at the bottom.

  Wrap everything above the archive in `<div data-index-sections>` so search can hide it.
- [ ] **Step 2:** Make it responsive per the spec's "Responsive" section. Also give `/blog/category/<id>/` the same intro style (category as `h1`) and chips with counts.
- [ ] **Step 3:** Run `npm run build`, then screenshot `/blog/` at 1440 and 390, light EN and dark VI. Expected: it matches mockup A's structure; no post appears twice above the archive; no horizontal scroll.
- [ ] **Step 4:** Commit `feat(blog): magazine layout for the blog index`.

### Task 6: Search and "Show all"

**Files:**
- Create: `src/scripts/blog-index.ts`
- Modify: `src/pages/blog/index.astro` (the search input inside the chips row: `<label class="sr-only" for="blog-search">`, `<input id="blog-search" type="search">`; plus a `<p class="archive-empty" hidden>` element; import the script)

**Interfaces:**
- Consumes: `normalizeSearch` from Task 1; `data-search`, `data-extra`, `.archive-more` and `[data-index-sections]` from Task 5.

- [ ] **Step 1:** Script behaviour:
  - On load, add the class `is-collapsed` to the archive. CSS hides `[data-extra]` only under `.is-collapsed`. Show `.archive-more` with the text "Show all N →".
  - Clicking the button removes `is-collapsed` and hides the button.
  - On `input`, compute `q = normalizeSearch(value)`.
    - If `q` is empty, restore the initial state.
    - Otherwise, hide `[data-index-sections]`, remove `is-collapsed`, and show only the rows whose `data-search` includes every word of `q`. Toggle `.archive-empty` when nothing matches.
  - `Escape` clears the input.
  - On load, if the URL has `?q=`, fill the input with it and apply it. Typing updates `?q=` with `history.replaceState`, so a search can be shared.
- [ ] **Step 2:** Run `npm run build`, then check by headless Chrome against `npm run preview`:
  - `--blink-settings=scriptEnabled=false --dump-dom` on `/blog/`. Expected: every archive row is present and none is collapsed or hidden.
  - `--dump-dom` on `/blog/?q=ban%20sao`. Expected: the replication row is visible, unrelated rows are hidden, and `[data-index-sections]` is hidden.
  - `--dump-dom` on `/blog/?q=zzzz`. Expected: `.archive-empty` is visible.
- [ ] **Step 3:** Commit `feat(blog): instant search and show-all for the archive`.

### Task 7: Final verification and cleanup

- [ ] **Step 1:** Run `npm run build` (must pass) and `node --test src/utils/blog-index.test.ts` (must pass).
- [ ] **Step 2:** Take screenshots with headless Chrome against `npm run preview` (pick a free port, e.g. 4361):
  - Pages: `/blog/`, `/blog/category/ui-ux/` and `/`.
  - Widths: 390, 768, 1024 and 1440.
  - Command: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=W,H --virtual-time-budget=4000 --screenshot=out.png URL`.
  - For dark and VI: the site reads `data-theme` and `data-lang` from localStorage (see `src/layouts/Layout.astro`). Use a temporary wrapper page or the `scripts/figures/figshot.sh` approach of an iframe that sets them, and delete it afterwards.
  - Save the screenshots in `/private/tmp/claude-502/-Users-nguyennhatkhang-Downloads-learning-FluteInTheRain-github-io/f2a27b99-d1bb-4160-9e2d-b45882c5f22a/scratchpad/ui/final/`.
- [ ] **Step 3:** Check `grep -nE "#[0-9a-fA-F]{3,6}\b" src/components/blog src/components/PostCard.astro src/components/series/SeriesCard.astro src/scripts/blog-index.ts`. Expected: no matches.
- [ ] **Step 4:** Check that `git status` is clean apart from intended changes, and that no temporary pages remain under `src/pages` or `public`.
- [ ] **Step 5:** Commit any fixes, with the message `fix(blog): polish from final checks`.
