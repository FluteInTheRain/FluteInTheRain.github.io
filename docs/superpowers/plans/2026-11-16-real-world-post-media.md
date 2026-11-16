# Real-World Post Media (Phase 1: Real Images & Screenshots) Implementation Plan

**Goal:** Enable blog posts to incorporate real-world images (figures/charts extracted from cited engineering articles, Wikimedia/web search images, and live Playwright screenshots of docs/tools) with clean source attribution, available both in `/book-to-post` and as a standalone `/enrich-post` skill.

**Spec & Full 4-Phase Roadmap:** `docs/superpowers/specs/2026-11-16-real-world-post-media-design.md`

---

### Task 1: Upgrade `Figure.astro`, `.figure` styles, and `_TEMPLATE.md.txt` for source attribution

**Files:**
- Modify: `src/components/mdx/Figure.astro`
- Modify: `src/styles/style.css`
- Modify: `src/content/blog/_TEMPLATE.md.txt`

**Steps:**
- [x] Add optional `sourceTitle?: string` and `sourceUrl?: string` props to `Figure.astro`.
- [x] Render `<figcaption>` whenever `caption` or `sourceTitle` is provided, appending `· Source: <a href={sourceUrl} ...>{sourceTitle}</a>` (or plain text if no `sourceUrl`).
- [x] Add `.figure-source` and `.figure figcaption a` rules in `src/styles/style.css`.
- [x] Update `src/content/blog/_TEMPLATE.md.txt` with an example of a sourced `<Figure />`.
- [x] Verify with `npm run build`.

---

### Task 2: Build `.claude/skills/enrich-post/scripts/fetch_real_image.py`

**Files:**
- Create: `.claude/skills/enrich-post/scripts/fetch_real_image.py`

**Steps:**
- [x] Implement `extract <url>`: uses Playwright Chromium to load an article, scroll lazy images into view, and return JSON of candidate figures (`src`, `alt`, `caption`, `context`, `width`, `height`, `pageTitle`).
- [x] Implement `search "<query>" [--source wikimedia|web] [--limit 8]`:
  - `wikimedia`: queries Wikimedia Commons API for open-licensed technical photos/diagrams.
  - `web`: searches Bing Images via headless Chromium for real-world diagrams/screenshots.
- [x] Implement `download <image_url> --out <path> [--referer <url>]`: downloads an image to `src/assets/blog/<slug>/...` (with HTTP fetch + Playwright fallback for hotlink/Cloudflare-protected images, converting SVG/AVIF if needed so Astro `Image` can optimize it).
- [x] Implement `screenshot <url> --out <path> [--selector "<css>"] [--width 1280] [--height 800]`: captures high-DPI screenshots of specific DOM elements or pages using Playwright Chromium.
- [x] Test `extract`, `search`, `download`, and `screenshot` end-to-end using `uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py ...`.

---

### Task 3: Create `.claude/skills/enrich-post/SKILL.md` and update `.claude/skills/book-to-post/`

**Files:**
- Create: `.claude/skills/enrich-post/SKILL.md`
- Modify: `.claude/skills/book-to-post/SKILL.md`
- Modify: `.claude/skills/book-to-post/style-guide.md`

**Steps:**
- [x] Write `.claude/skills/enrich-post/SKILL.md` with clear instructions for enriching any existing or draft post with real-world images, screenshots, and proper source attribution.
- [x] Update `.claude/skills/book-to-post/SKILL.md` (Steps 2, 4, 6) and `.claude/skills/book-to-post/style-guide.md` so book-based posts mix real-world sourced visuals with Excalidraw diagrams.
- [x] Verify `npm run build` passes cleanly.

---

### Completed Follow-up Phases
- [x] **Phase 2:** YouTube timestamp embeds (`start`/`end`/`caption`/`sourceTitle` in `YouTube.astro` and `Video.astro`), YouTube transcript search & short `.mp4` clip cutter (`youtube_helper.py` via `yt-dlp` + `ffmpeg` `< 2MB` for `<Video autoplay loop />`).
- [x] **Phase 3:** Authentic engineering MDX components (`<GitHubCode />`, `<QuoteCard />`, `<LinkCard />`) + `artifact_helper.py` (`hn-search`, `github-snippet`, `link-meta`).
- [x] **Phase 4 & 5:** Live local benchmark & `<TerminalOutput />` runner + Interactive React mini-playground (`<DemoFrame>` + `OrderBookViewDemo.tsx`).
