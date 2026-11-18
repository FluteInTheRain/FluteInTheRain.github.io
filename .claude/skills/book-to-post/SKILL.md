---
name: book-to-post
description: Draft a blog post for this site from a book Khang imported with /book-to-skill, plus web research, with Excalidraw diagrams and a human voice. Use for "/book-to-post <book-slug> [chapter or topic]", "write a post from <book>", "viết bài từ sách".
---

# book-to-post

Turn a book chapter or topic into a draft post at `src/content/blog/<post-slug>.mdx` (`draft: true`), with diagrams in `src/assets/blog/<post-slug>/`.

Usage: `/book-to-post <book-slug> [chapter or topic]`. No book slug given: ask for it.

The post has to do three jobs: teach other readers, help Khang learn and review the topic, and show recruiters how he thinks. It must read as written by a person and explain with diagrams and tables, not walls of text.

Do the 8 steps in order. Steps 3 and 4 wait for Khang. Do not skip ahead.

## Never

- Commit anything under `books/`, or copy a book skill (`~/.claude/skills/<book-slug>/`) into this repo. The repo is public and books are copyrighted.
- Copy book text beyond short quotes (a sentence or two, in quotation marks, attributed). This includes the chapter files of the book skill: they are close to the book's wording.
- Reproduce a figure or table from the book, even redrawn with the same layout and labels.
- Use Mermaid, or generate "infographic" PNGs (HTML/Python rendered dashboards with title banners, pill/badge labels, card grids, gradients, emoji). Khang rejected them as AI-looking. Diagrams are drawn on the page; see Step 6 B for the tiers.
- Set `draft: false`. Khang reads the post and flips it himself.
- Invent Khang's experience, numbers or quotes. Use only what Khang said, the book, or a source you read.
- Add a `## References` section by hand. The post page renders one from `sources`.
- Touch files outside the post, its asset folder, new figure components for this post (`src/components/mdx/<Name>.astro`, `src/components/demos/<Name>.tsx`), and (with Khang's OK) `src/data/categories.ts`. No new dependencies. New icons are SVG files added to `public/icons/flow/` (see below), not a package.
- Commit the post. Leave it uncommitted for Khang to review unless he asks.

## Step 1: Read the book skill

1. Find the book skill: `~/.claude/skills/<book-slug>/SKILL.md`. (`/book-to-skill` may store it in `~/.agents/skills/<book-slug>/` and symlink it here; either path is fine.)
2. If neither exists, **stop**. Tell Khang the book is not imported and point him to `books/README.md` (`/book-to-skill books/<file> <book-slug>`, answer **no** to the GitHub push).
3. Read the book skill's `SKILL.md`. Use its chapter table and topic index to pick the chapter files for the requested chapter or topic, then read those `chapters/ch<NN>-<slug>.md` files. Check `glossary.md` for terms you will define, and `patterns.md` / `cheatsheet.md` when the topic is a technique or a decision.
4. No chapter or topic given: list the chapters with one line each and ask Khang which one.
5. Note the book's exact title, author(s) and the chapter numbers you used. They go into `sources`.

## Step 2: Research the web

1. Use WebSearch to find 3–5 well-regarded articles on the same topic: official docs, specs, known engineering blogs, recognised authors. Skip SEO listicles, content farms and AI-written roundups.
2. Read each one (WebFetch). Use them for extra facts, newer practice, examples, and how good writers explain the idea.
3. Also scan for **real-world visuals, YouTube talks, and engineering artifacts** using `.claude/skills/enrich-post/scripts/`:
   ```bash
   uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py extract "<article-url>"
   python3 .claude/skills/enrich-post/scripts/youtube_helper.py search "<topic> conference talk" --limit 5
   python3 .claude/skills/enrich-post/scripts/youtube_helper.py transcript "<video-id>" --query "<keyword>"
   python3 .claude/skills/enrich-post/scripts/artifact_helper.py hn-search "<topic>" --limit 5
   ```
   Or search web/Wikimedia images (`fetch_real_image.py search`), fetch real open-source examples (`artifact_helper.py github-snippet`), or run a local micro-benchmark for `<TerminalOutput />`. Note 1–2 strong real-world visuals, talk segments, or authentic artifacts (with `sourceTitle` and `sourceUrl`) to propose in Step 4 alongside Excalidraw diagrams.
4. Paraphrase prose only. Never copy sentences.
5. Keep a list of the articles you actually use: title and `url` (and author when clear). Every one of them goes into `sources`; articles you read but did not use do not.
6. Where an article disagrees with the book or shows the book is dated, note it for Step 4.

## Step 3: Ask Khang (then wait)

Ask 2–3 short questions in one message, then **wait for his answers**:

- What stood out to you in this chapter or topic?
- Where did it meet your own work? (a system, a bug, a decision)
- What do you disagree with, or want to add from outside the book?

If he has no answer to one, write without it. Never make up a personal story for him.

## Step 4: Propose the plan (then wait)

Send one proposal and **wait for Khang's OK** before writing:

- **Title**: specific; says what the reader gets. No clickbait.
- **Angle**: one sentence on the question the post answers and for whom. The post is built around this angle, Khang's answers and the research, not around the chapter's order. A chapter summary with the words shuffled is a failure.
- **Category**: one of `CATEGORY_IDS` in `src/data/categories.ts` (read the file; today: frontend, backend, database, devops, ai, system-design, finance). If none fits, say so and propose adding one (in non-interactive `claude -p` runs where you cannot ask, pick the closest and flag it in the hand-over; interactive runs wait for an answer at Steps 3–4) to `categories.ts` (and the category list comment in `src/content/blog/_TEMPLATE.md.txt`).
- **Tags** and **post slug** (kebab-case; it becomes the URL `/blog/<post-slug>/`).
- **Outline**: every `##` section with the visual/artifact planned for it. Keep `##` headings short and concise for a clean Table of Contents sidebar. **Mandatory: Start with a single Hero Visual Metaphor (`<Figure src={heroVisual} ... />`) at the very top without preamble announcement, followed by an irresistible Intro Hook (Quote + Paradox / Production Incident).** Then outline each section with its visual from Step 6 B (on-page SVG figure, `<AnimatedFlow />`, interactive island, Excalidraw, `mingrammer/diagrams`) alongside real-world verified artifacts, and list the new terms each section will explain in its `<Concepts>` box. Include "Key takeaways" and "Review questions".
- **Sources**: the book (chapters) and the articles you plan to cite. Mention any book-vs-web conflict from Step 2.

Apply his changes. If he changes the angle a lot, re-propose.

## Step 5: Write the MDX

1. Read `.claude/skills/book-to-post/voice.md` and `.claude/skills/book-to-post/style-guide.md`. Follow both.
2. Write `src/content/blog/<post-slug>.mdx` bilingually (English in `<En>…</En>` and Vietnamese in `<Vi>…</Vi>`, with `title_vi` and `description_vi` in frontmatter). Frontmatter must pass the `blog` schema in `src/content.config.ts`, or `npm run build` fails:

```yaml
---
title: "…"
title_vi: "…"               # Vietnamese title keeping technical English keywords where helpful
description: "…"            # max 180 characters: count them
description_vi: "…"         # max 220 characters
date: YYYY-MM-DD            # today
category: "system-design"   # one of CATEGORY_IDS
tags: ["…", "…"]
draft: true
sources:
  - { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", chapters: "Ch. 5, 7" }
  - { title: "Exact article title", url: "https://…" }
---
```

   - Import `En from '../../components/mdx/En.astro'` and `Vi from '../../components/mdx/Vi.astro'`. Always put `<En>`, `</En>`, `<Vi>`, `</Vi>` on their own lines with blank lines before and after the Markdown content inside so MDX parses headings, lists, and code blocks properly.
   - **Hero Visual Placement**: Place exactly ONE hero visual metaphor at the very top under `<En>` and `<Vi>` before the opening quote or intro text. Never add clumsy announcement text before it (*"Trước khi đi sâu vào..."*).
   - **Natural Vietnamese**: In the `<Vi>` version, write fluid, natural engineer-to-engineer Vietnamese ("mình"), never word-by-word machine translation. Craft `description_vi` as an engaging, authentic sentence reflecting real-world engineering dilemmas. Keep common stack names (`React`, `Kafka`, `PostgreSQL`, `BFF`, `CI/CD`), and translate technical concepts with the English keyword in parentheses on first use per section (e.g. `độ trễ sao chép (replication lag)`).
   - **No Author Cards**: Khang is the sole author of this blog; do not add author bylines or author cards.
   - **Concepts box at the end of every `##` section** that introduces new terms (also the intro): `import Concepts from '../../components/mdx/Concepts.astro'`, then a Markdown list `- **Term**: plain explanation` inside `<Concepts>` … `</Concepts>` (blank lines around the list; tags on their own lines; place it just before the section's `---`). Write for someone who has never heard the term: one or two short sentences, an everyday comparison when it helps. In `<Vi>` use `<Concepts title="Giải thích nhanh mấy thuật ngữ ở trên">` (the EN default title is "The terms above, in plain words") and keep the English term with the Vietnamese meaning in parentheses, e.g. `**Cascading failure (sập dây chuyền)**`.
   - The book entry has `author` and `chapters`. Add a `url` only for the publisher's or the book's official page.
   - Each web article you used has `title` and `url`.
3. Quotes stay short: a sentence or two, in quotation marks, attributed in the text (for example "as Kleppmann puts it in chapter 5").
4. MDX traps: `{`, `}` and `<` in prose are parsed as JSX, so put them in inline code or code blocks. HTML comments (`<!-- -->`) do not work; leave them out.
5. Run the self-check at the end of `style-guide.md` and fix every miss before Step 7.

## Step 6: Make the diagrams and fetch real-world images / videos

### A. Real-world images, screenshots & YouTube clips (from web articles, docs, Wikimedia, or talks)

For each visual planned as a real-world image, screenshot, or video:

1. **Images & screenshots** — use `.claude/skills/enrich-post/scripts/fetch_real_image.py` (see `.claude/skills/enrich-post/SKILL.md` for `extract`, `search`, `download`, `screenshot`):
   ```bash
   uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py download "<imageUrl>" --referer "<pageUrl>" --out "src/assets/blog/<post-slug>/<name>.png"
   # or capture a live screenshot of official docs / interactive page:
   uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py screenshot "<pageUrl>" --selector "<css>" --out "src/assets/blog/<post-slug>/<name>.png"
   ```
   **Open every downloaded or screenshotted PNG with `Read`** to confirm it is sharp, legible, and relevant. Never copy figures from the copyrighted book in `books/`.
   Embed on **one single line** with `sourceTitle` and `sourceUrl` attribution, and list the source page in frontmatter `sources`:
   ```mdx
   <Figure src={realChart} alt="What the image shows, in one sentence" caption="The one point the reader should take from it" sourceTitle="Article or Site Title" sourceUrl="https://…" />
   ```

2. **YouTube talks & short video clips** — use `.claude/skills/enrich-post/scripts/youtube_helper.py`:
   - For longer explanations (`30s–5min`), embed a timestamped YouTube facade (keeps repo lightweight):
     ```mdx
     <YouTube id="VIDEO_ID" title="Talk title" start={125} end={210} caption="What the speaker explains here" sourceTitle="Channel — Talk Title" />
     ```
   - For short visual demos (`5–15s`, `< 2MB`), cut a silent looping `.mp4` + poster into `public/assets/blog/<post-slug>/` via `youtube_helper.py clip` and inspect the poster with `Read`:
     ```mdx
     <Video src="/assets/blog/<post-slug>/clip.mp4" poster="/assets/blog/<post-slug>/clip-poster.jpg" autoplay loop caption="What the demo clip shows" sourceTitle="Channel — Talk Title" sourceUrl="https://www.youtube.com/watch?v=VIDEO_ID&t=125s" />
     ```
   - Keep `<YouTube />` and `<Video />` on **one single line**, and add the video's URL to frontmatter `sources`.

3. **Authentic engineering artifacts & live benchmarks** — use `.claude/skills/enrich-post/scripts/artifact_helper.py` (or run a local benchmark script) for `<GitHubCode />`, `<QuoteCard />`, `<LinkCard />`, and `<TerminalOutput />`, or add an interactive React mini-playground under `src/components/demos/<Name>Demo.tsx` inside `<DemoFrame title="...">` reusing `.sd-*` classes (see `.claude/skills/enrich-post/SKILL.md` for syntax). Keep `<LinkCard />` on one single line, and put opening/closing tags of `<GitHubCode>`, `<QuoteCard>`, `<TerminalOutput>`, and `<DemoFrame>` on their own lines.

### B. Diagrams & Visuals: drawn on the page

**No AI-looking generated infographics.** Khang rejected PNGs built from HTML/Python that look like dashboards: a big title banner, pill/badge labels, colored card grids, gradients, emoji, "63.4% PENALTY" boxes. Draw diagrams and charts on the page instead, so they use the site's font and colors and follow light/dark theme. Reference components (copy their structure):

- `src/components/mdx/PercentileStrip.astro`: static chart computed at build time (seeded data, log axis, percentile markers).
- `src/components/mdx/FaultVsFailure.astro`: static architecture-style diagram (boxes, load bars, hand-made arrows).
- `src/components/mdx/DiskFailures.astro`: large grid via one SVG `<pattern>` instead of thousands of nodes.
- `src/components/mdx/CanaryRollout.astro`: timeline chart with a stage lane and a threshold line.
- `src/components/mdx/TailAmplification.astro` + `src/components/demos/TailAmplification.tsx`: interactive React island (slider, re-roll, simulate).
- `src/components/demos/AnimatedFlow.tsx` (`<AnimatedFlow preset=… scenarioId=… />`): step-by-step request flows with colour icons on nodes and edge weight (thick = heavy load, thin = light load, red = bottleneck). Add a preset for a new post.

Pick the tool:

1. **Charts, numbers, distributions, formulas, timelines → static Astro SVG component** (default). Compute the data in the frontmatter (seeded PRNG so every build is identical); never hard-code a picture of numbers.
2. **Architecture / data-flow diagrams → static Astro SVG component, or `<AnimatedFlow />`** when the point is the order of steps or where it gets congested. Give every component a **colour icon**, not a monochrome line icon: the real product logo when the node is a real product (Redis, PostgreSQL, Kafka, NGINX, AWS S3/Lambda/EC2...), a flat colour pictogram otherwise (people, phone, star, gear...). Icons are SVG files in `public/icons/flow/<key>.svg`, rendered with `<image href>`; `public/icons/flow/README.md` lists each file's source. To add one, take it from the Iconify JSON packages `@iconify-json/logos` (CC0), `@iconify-json/fluent-emoji-flat` (MIT) or `@iconify-json/flat-color-icons` (MIT), write `<svg viewBox="left top width height">body</svg>`, add a row to the README and the key to `NODE_ICONS` in `AnimatedFlow.tsx`. Check dark mode: a black logo needs the light disc behind it (`.flow-node-icon-bg`).
3. **"Try it" explanations → React island** (`client:visible`) when moving a parameter teaches more than a still picture. First render must be deterministic (seeded) to avoid hydration mismatch.
4. **Hand-drawn mental models → Excalidraw** (`excalidraw-diagram` skill, site colors from `style-guide.md`), rendered to PNG and embedded with `<Figure />`. Use sparingly.
5. **Cloud infrastructure with vendor icons → `mingrammer/diagrams` (Python)** PNG via `<Figure />`, only when official AWS/GCP/K8s icons are the point.

Rules for every on-page figure:

- **Words inside figures and on Callout / Concepts titles**: write like a person, in sentence case ("So how do teams fight the tail?", "Merged in 2 ms"), never Title Case Labels, ALL CAPS, emoji, or hype ("Blistering Performance", "Cơn bão khuếch đại", "Thảm họa", "siêu việt", "🔥 100% CPU CRASH"). Vietnamese titles must read as natural Vietnamese, not a word-by-word translation ("Vậy làm sao bớt độ trễ đuôi?", not "Phòng thủ độ trễ đuôi"). No uppercase + letter-spacing label styling.
- **Look**: editorial chart, not a dashboard. Thin axes and gridlines, plain-text annotations next to what they explain, one accent color (`--red`) for the thing that matters, everything else `--text` / `--text-muted` / `--border`. No pills, badges, gradients, glows, emoji, shaking or pulsing animation.
- **Colors and fonts**: only site CSS tokens (`--text`, `--text-body`, `--text-muted`, `--text-faint`, `--border`, `--bg-alt`, `--red`, `--red-tint-bg`); every label uses the page font (Noto Sans, inherited), including numbers, axes and edge labels: no monospace in figures (Khang wants the same font as the text); use `font-variant-numeric: tabular-nums` where digits should line up. `--border-strong` does not exist; do not use it.
- **Size**: `width: 100%` of the column with a centered `figcaption` (14px, `--text-muted`), like `<Figure />`. Wrap the `<svg>` in a `div` with `overflow-x: auto` and give the svg `min-width: 640px`, so phones scroll the figure sideways instead of shrinking text to 7px. Pick a `viewBox` about 900 wide so 14–16px text stays 14–16px on desktop.
- **Bilingual**: every label as `<tspan data-lang-en>…</tspan><tspan data-lang-vi>…</tspan>` (HTML: `<span data-lang-…>`); Vietnamese numbers use `.` for thousands (`toLocaleString('vi-VN')`). Leave room: Vietnamese labels run ~20% longer.
- **IDs**: the post renders each figure twice (EN and VI, one hidden with `display:none`). Any `<marker>`, `<pattern>`, `<filter>`, `<clipPath>` id must be unique per instance (React `useId()`, or a random suffix in Astro frontmatter), or draw arrowheads as plain polygons with no ids at all.
- **Honesty**: simulated or illustrative numbers say so in the caption, with the assumption used (e.g. "average disk lifetime ~27 years"). Cite the source of a model (paper, docs) with a link in the caption.
- **Placement**: right after the paragraph that sets up the question the figure answers; replace any ASCII-art code block that tries to draw the same idea. Inside a numbered list, put the figure at column 0 after the item; the next item keeps its number.

## Step 7: Humanize the prose

1. Copy the post first: `cp src/content/blog/<post-slug>.mdx "${TMPDIR:-/tmp}/<post-slug>.before.mdx"`.
2. Run `/humanizer:humanizer` (invoke it through the Skill tool) in file mode on `src/content/blog/<post-slug>.mdx`. Tell it: change prose only; leave the frontmatter, `import` lines, code blocks, inline code, JSX tags (`<En>`, `</En>`, `<Vi>`, `</Vi>`, `<Figure … />`, `<YouTube … />`, `<Video … />`, `<LinkCard … />`, `<GitHubCode …>`, `<QuoteCard …>`, `<TerminalOutput …>`, `<DemoFrame …>`, `<Callout …>`, `<Concepts …>`, and closing tags; keep self-closing tags on one line, wrapper open/close tags on their own lines, and every code fence at column 0), link targets and quotations untouched; keep every fact and number; keep the voice in `voice.md` (and keep the Vietnamese technical keyword parentheses intact). (If file mode misbehaves, give it the body paragraph by paragraph instead.)
3. Confirm none of those changed (the function reads stdin on purpose: a `$1` in a skill file gets replaced by the slash-command arguments). This must print `non-prose unchanged`:

```bash
keep() { awk '/^---$/ && fm<2 {fm++; print; next} fm==1 {print; next} /^```/ {code=!code; print; next} code || /^import / || /^[[:space:]]*<\/?[A-Z]/ {print}'; }
diff <(keep < "${TMPDIR:-/tmp}/<post-slug>.before.mdx") <(keep < src/content/blog/<post-slug>.mdx) && echo "non-prose unchanged"
```

   If anything differs, restore those lines from the copy. Also eyeball inline code and quotes in `diff "${TMPDIR:-/tmp}/<post-slug>.before.mdx" src/content/blog/<post-slug>.mdx`.

## Step 8: Build and hand over

1. Run `npm run build`. It must pass. Draft posts are skipped by the production build, so it only checks the frontmatter; also start `npm run dev` in the background, load `http://localhost:4321/blog/<post-slug>/` and confirm it returns 200 with the images showing, then stop the server you started (do not leave port 4321 taken; if a server is already running on 4321, use it and leave it alone), which catches MDX body errors and wrong image paths. Fix and re-run on failure (usual causes: description over 180 characters, a category not in `CATEGORY_IDS`, a bad `url`, `{` or `<` in prose, a wrong image path).
2. **Look at every on-page figure** before handing over. Chrome headless cannot scroll to a figure and will not open a window narrower than ~500px, so render the figures on a temporary page and delete it right after:
   ```bash
   mkdir -p src/pages/tmp-prev   # inner.astro: <Layout><main class="prose" style="max-width:890px;margin:0 auto;padding:0 16px"> …figures… </main></Layout>
   # outer.astro: <iframe src="/tmp-prev/inner/" width="375"> for phone width, and a second iframe whose onload sets
   #   contentDocument.documentElement.setAttribute('data-lang','vi') to check the Vietnamese labels
   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
   "$CHROME" --headless=new --hide-scrollbars --window-size=1000,1600 --virtual-time-budget=5000 --screenshot="$TMPDIR/fig.png" http://localhost:4321/tmp-prev/inner/
   "$CHROME" --headless=new --hide-scrollbars --window-size=1000,1600 --virtual-time-budget=5000 --force-dark-mode --blink-settings=preferredColorScheme=0 --screenshot="$TMPDIR/fig-dark.png" http://localhost:4321/tmp-prev/inner/
   rm -r src/pages/tmp-prev
   ```
   Open each PNG with `Read` and fix: labels cut at the edge, text over lines or other text, text too small, wrong colors in dark mode, Vietnamese overflow.
3. Tell Khang:
   - the file path `src/content/blog/<post-slug>.mdx`, the diagrams in `src/assets/blog/<post-slug>/`, and any new figure components;
   - how to preview: `npm run dev`, then open `http://localhost:4321/blog/<post-slug>/` (drafts show in dev only);
   - the sources used, and anything you were unsure about;
   - that the post stays `draft: true` until **he** reads it and flips `draft` to `false`.
