# Real-World Post Media & Human Content Enrichment — Design & Roadmap

Date: 2026-11-16 · Status: completed (Phases 1–4 + Interactive `<DemoFrame>` Playgrounds implemented & verified on 2026-11-16)

## Intent
Khang wants blog posts on this site to feel genuinely crafted by a software engineer rather than 100% synthesized by AI. While Excalidraw diagrams and Markdown tables explain abstract concepts well, human-written engineering posts also bring in **real-world artifacts**:
- Real images, benchmark charts, and architecture figures from engineering blogs, official docs, or Wikimedia/Google Images (with proper source attribution).
- Live screenshots of documentation, DevTools, or web apps captured directly from the browser.
- YouTube tech talks (referenced via transcripts, embedded at specific `start`/`end` timestamps, or clipped into short 5–15s looping `.mp4` demos).
- Real open-source code permalinks, community quotes (Hacker News / GitHub issues), link previews, and real terminal/benchmark outputs.

## Phased Rollout Plan (Agreed with Khang, 2026-11-16)

- **Phase 1 (Completed — Real Images & Screenshots):**
  1. Upgrade `Figure.astro` and `.figure` styles to support `sourceTitle` and `sourceUrl` attribution on captions.
  2. Build `.claude/skills/enrich-post/scripts/fetch_real_image.py` (powered by the existing Playwright + Python environment in `~/.claude/skills/excalidraw-diagram/references`, plus `ffmpeg`) supporting:
     - `extract <url>`: harvest real figures/diagrams/charts and their captions from reference web articles.
     - `search "<query>"`: search Wikimedia Commons and web images (Google/DuckDuckGo Images via headless Chromium) for real-world technical visuals.
     - `screenshot <url>`: capture clean element or viewport screenshots from official docs, demos, or GitHub pages.
     - `download <image_url>`: download and normalize web images (`.png`/`.webp`/`.jpg`) into `src/assets/blog/<post-slug>/`.
  3. Create standalone skill `.claude/skills/enrich-post/SKILL.md` (`/enrich-post <post-slug>`) so Khang can enrich **any** post (book-based or standalone).
  4. Update `.claude/skills/book-to-post/SKILL.md` and `style-guide.md` so new book-based posts automatically harvest and propose 1–2 real-world visuals alongside Excalidraw diagrams.

- **Phase 2 (Completed — YouTube & Video Clips):**
  1. Upgrade `YouTube.astro` to support `start?: number`, `end?: number`, and `caption?: string` (wrapped in `<figure class="figure">`), plus `sourceTitle`/`sourceUrl` on both `YouTube.astro` and `Video.astro`.
  2. Add `.claude/skills/enrich-post/scripts/youtube_helper.py` using `yt-dlp` and `ffmpeg`:
     - Search YouTube tech talks and fetch timestamped transcripts (`json3` / `vtt`) to extract real speaker insights/case studies.
     - Cut short visual segments (5–15 seconds, muted, compressed `< 2MB` + poster frame) into `public/assets/blog/<post-slug>/` for `<Video autoplay loop />`, while using `<YouTube start={...} end={...} />` for longer explanations so the GitHub Pages repo stays lightweight.

- **Phase 3 (Completed — Authentic Engineering Artifacts):**
  1. `<GitHubCode />` (`src/components/mdx/GitHubCode.astro`): quote real production code from open-source repositories with a header bar linking to the exact commit-pinned GitHub permalink (`repo`, `path`, `lines`, `url`).
  2. `<QuoteCard />` (`src/components/mdx/QuoteCard.astro`): cite real engineering discussions (Hacker News threads, GitHub PRs/issues, RFCs, postmortems) with author, context, and source link.
  3. `<LinkCard />` (`src/components/mdx/LinkCard.astro`): rich bookmark preview card with domain, title, description, and optional tag.
  4. `.claude/skills/enrich-post/scripts/artifact_helper.py`: `hn-search`, `github-snippet`, and `link-meta` subcommands.

- **Phase 4 (Completed — Live Local Benchmarks & Interactive Playgrounds):**
  1. `<TerminalOutput />` (`src/components/mdx/TerminalOutput.astro`): styled command + real stdout/benchmark output block.
  2. Skill workflow step to run micro-benchmarks, SQL `EXPLAIN QUERY PLAN`, or CLI reproduction scripts locally and capture real numbers instead of theoretical estimates.
  3. Interactive React mini-playgrounds under `src/components/demos/` wrapped in `<DemoFrame title="...">` (e.g., `OrderBookViewDemo.tsx` reusing `.sd-*` styles).

---

## Phase 1 Detailed Design: Real Images & Screenshots

### 1. Constraints & Copyright Guardrails
- **Never copy figures from copyrighted books in `books/`.** Book figures remain strictly off-limits.
- **Always attribute web images.** Every image fetched or screenshotted from an external article, documentation page, or Wikimedia/web search must pass `sourceTitle` and `sourceUrl` to `<Figure />` AND include the source article in the post's `sources` frontmatter.
- **No decorative stock photos or AI-generated filler art.** Every real image must explain something concrete: a real benchmark chart, an architecture diagram from a cited engineering blog, a UI/DevTools/documentation screenshot, or a real hardware/system photograph.
- **Zero new npm dependencies.** `fetch_real_image.py` runs via `uv run --project ~/.claude/skills/excalidraw-diagram/references python ...`, reusing the Playwright Chromium runtime already installed for Excalidraw rendering.

### 2. `Figure.astro` Attribution Upgrade
Extend `src/components/mdx/Figure.astro` props:
```ts
interface Props {
  src: ImageMetadata | string;
  alt: string;
  caption?: string;
  width?: number;
  sourceTitle?: string;
  sourceUrl?: string;
}
```
Rendering rules:
- Renders `<figcaption>` whenever `caption` or `sourceTitle` is present.
- When both `caption` and `sourceTitle` are provided:
  `{caption} <span class="figure-source">· Source: {sourceUrl ? <a href={sourceUrl} rel="noopener" target="_blank">{sourceTitle}</a> : sourceTitle}</span>`
- When only `sourceTitle` is provided:
  `<span class="figure-source">Source: {sourceUrl ? <a href={sourceUrl} rel="noopener" target="_blank">{sourceTitle}</a> : sourceTitle}</span>`
- Keep `<Figure ... />` on a single line in `.mdx` files so Step 7 (`humanizer` diff check in `book-to-post`) continues to work without changes.

### 3. CLI Tool: `.claude/skills/enrich-post/scripts/fetch_real_image.py`
A standalone Python CLI script invoked via:
```bash
uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py <command> [args]
```
Subcommands:
1. `extract <url> [--min-width 280] [--min-height 140]`
   - Loads `<url>` in headless Chromium, scrolls through the article so lazy-loaded images populate, and inspects all `<img>` elements inside `article, main, [role="main"], body`.
   - Filters out avatars, icons, tracking pixels, data URIs, and tiny images below `min-width`/`min-height`.
   - Extracts `src` (resolved absolute URL), `alt`, surrounding `<figcaption>` or nearest heading context, natural `width` and `height`, and page `<title>`.
   - Prints JSON to stdout so the agent can pick the best figure(s).
2. `search "<query>" [--source wikimedia|web] [--limit 8]`
   - `wikimedia`: queries Wikimedia Commons API (`https://commons.wikimedia.org/w/api.php`) for images matching `<query>`, returning `title`, `imageUrl`, `pageUrl`, `author`, `license`, `width`, `height`.
   - `web`: uses headless Chromium to search Google Images / DuckDuckGo Images for technical diagrams/photos matching `<query>`, returning candidate image URLs, source page URLs, and titles.
3. `download <image_url> --out <path> [--referer <page_url>]`
   - Downloads `<image_url>` (using realistic headers and optional `--referer`, falling back to Playwright browser context fetch if blocked by Cloudflare/hotlink protection).
   - If the downloaded image is SVG or an unsupported format for Astro's `Image` optimizer (or if `--format png` is requested), converts/rasterizes cleanly to `.png` or `.webp` via Playwright/ffmpeg.
   - Prints JSON `{ "path": "...", "width": ..., "height": ..., "size_bytes": ... }`.
4. `screenshot <url> --out <path> [--selector "<css>"] [--width 1280] [--height 800] [--full-page]`
   - Opens `<url>` in headless Chromium at `device_scale_factor=2` (Retina clarity), hides common cookie/consent popups, and screenshots either the matched CSS `--selector` (with optional padding) or the viewport to `<path>`.
   - Prints JSON `{ "path": "...", "url": "...", "title": "..." }`.

### 4. Skill `.claude/skills/enrich-post/SKILL.md`
Usage: `/enrich-post <post-slug> [optional focus or instructions]`
Workflow:
1. Read `src/content/blog/<post-slug>.mdx` and check existing visuals.
2. Identify sections that lack visuals or where a real-world image (benchmark chart from a cited source, live screenshot, or real-world photo/diagram) would make the post feel more authentic.
3. Use `fetch_real_image.py` (`extract` on articles in `sources` or new web search results, `search` on Wikimedia/web, or `screenshot` on live docs/sites).
4. Download candidate images to `src/assets/blog/<post-slug>/` and **always inspect each image using `Read`** to verify legibility, relevance, and quality. Delete any blurry, irrelevant, or watermarked image immediately.
5. Embed via `<Figure src={...} alt="..." caption="..." sourceTitle="..." sourceUrl="..." />` (single line) and add any newly cited web page to frontmatter `sources`.
6. Run `npm run build` to verify schema and asset imports.

### 5. Integration into `.claude/skills/book-to-post/`
- Update `SKILL.md` Step 2 (Research the web): while reading 3–5 articles, also run `fetch_real_image.py extract <article-url>` on strong engineering articles to see if they contain real benchmark charts, system screenshots, or historical/real-world visuals worth citing.
- Update `SKILL.md` Step 4 (Propose the plan): the outline now marks whether each section's visual is an **Excalidraw diagram**, a **Real image / Screenshot** (with its source), a **Table**, or a **Callout**.
- Update `SKILL.md` Step 6 & `style-guide.md`: document how to use `fetch_real_image.py` and `<Figure ... sourceTitle="..." sourceUrl="..." />` alongside Excalidraw.
