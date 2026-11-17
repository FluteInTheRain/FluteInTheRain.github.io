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
- Use Mermaid. Diagrams follow Khang's 4-tier strategy:
  1. **ByteByteGo Style (`ByteByteGoHq/system-design-101`)**: System architecture, data flow, distributed systems, and protocol lifecycles.
  2. **`mingrammer/diagrams` (Python)**: Cloud infrastructure, networking, and DevOps (AWS, GCP, Azure, K8s, Docker).
  3. **Excalidraw**: Brainstorming, mental models, conceptual explanations, and hand-drawn whiteboard clarity.
  4. **ReactFlow (`@xyflow/react`)**: Interactive diagrams where readers interact with system nodes, toggle states, or step through flows.
- Set `draft: false`. Khang reads the post and flips it himself.
- Invent Khang's experience, numbers or quotes. Use only what Khang said, the book, or a source you read.
- Add a `## References` section by hand. The post page renders one from `sources`.
- Touch files outside the post, its asset folder, and (with Khang's OK) `src/data/categories.ts`. No new dependencies.
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
- **Outline**: every `##` section with the visual/artifact planned for it (Excalidraw diagram, Real-world image / screenshot with its source, Timestamped `<YouTube />` talk or short `<Video />` clip, `<GitHubCode />`, `<QuoteCard />`, `<LinkCard />`, `<TerminalOutput />`, table, code block or `Callout`) and one line on what it shows. Aim to include at least 1–2 real-world sourced artifacts alongside Excalidraw diagrams so the post does not feel 100% AI-generated. Include the TL;DR, "Key takeaways" and "Review questions".
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
   - In the `<Vi>` version, write natural engineer-to-engineer Vietnamese ("mình"), keep common stack names (`React`, `Kafka`, `PostgreSQL`, `BFF`, `CI/CD`), and translate technical concepts into Vietnamese with the English keyword in parentheses on first use per section (e.g. `độ trễ sao chép (replication lag)`).
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

### B. Diagrams & Visuals (Khang's 4-Tier Strategy)

Select the right tool based on the scenario:

1. **System Architecture & Data Flows → ByteByteGo Style (`ByteByteGoHq/system-design-101`)**:
   - Use for: Distributed system topology, caching strategies, message broker routing, protocol lifecycles, and microservice workflows.
   - Design principles: Distinct component icons (Database, Cache, Queue, Load Balancer), numbered step badges (`①`, `②`, `③`), data payload callouts, and clean 3-tier color hierarchy. Render as clean SVG/PNG into `src/assets/blog/<post-slug>/`.

2. **Cloud Infrastructure & DevOps → `mingrammer/diagrams` (Python)**:
   - Use for: Cloud networking, VPCs, Kubernetes clusters, serverless pipelines, and provider architectures (AWS, GCP, Azure).
   - Execution: Write a short Python script using `diagrams` (`from diagrams import Diagram, Cluster...`), execute it to generate crisp PNGs with official vendor icons directly into `src/assets/blog/<post-slug>/`.

3. **Brainstorming & Mental Models → Excalidraw**:
   - Use for: Abstract concepts, algorithmic intuition, trade-off comparisons, brainstorming, and whiteboard-style human explanations.
   - Workflow: Use the `excalidraw-diagram` skill and site colors from `style-guide.md`. Save to `src/assets/blog/<post-slug>/<name>.excalidraw`, render via:
     ```bash
     cd ~/.claude/skills/excalidraw-diagram/references && uv run python render_excalidraw.py <absolute path to .excalidraw>
     ```
   - Embed via `<Figure src={imgImport} alt="..." caption="..." />`.

4. **Interactive System Exploration → ReactFlow (`@xyflow/react`)**:
   - Use for: Scenarios where readers benefit from interacting with components (clicking nodes to inspect state, toggling failover, stepping through packets, or dragging flows).
   - Workflow: Create an interactive demo component under `src/components/demos/<Name>Demo.tsx` wrapped in `<DemoFrame title="...">`. Embed in MDX with `client:load` or `client:visible`.

## Step 7: Humanize the prose

1. Copy the post first: `cp src/content/blog/<post-slug>.mdx "${TMPDIR:-/tmp}/<post-slug>.before.mdx"`.
2. Run `/humanizer:humanizer` (invoke it through the Skill tool) in file mode on `src/content/blog/<post-slug>.mdx`. Tell it: change prose only; leave the frontmatter, `import` lines, code blocks, inline code, JSX tags (`<En>`, `</En>`, `<Vi>`, `</Vi>`, `<Figure … />`, `<YouTube … />`, `<Video … />`, `<LinkCard … />`, `<GitHubCode …>`, `<QuoteCard …>`, `<TerminalOutput …>`, `<DemoFrame …>`, `<Callout …>`, and closing tags; keep self-closing tags on one line, wrapper open/close tags on their own lines, and every code fence at column 0), link targets and quotations untouched; keep every fact and number; keep the voice in `voice.md` (and keep the Vietnamese technical keyword parentheses intact). (If file mode misbehaves, give it the body paragraph by paragraph instead.)
3. Confirm none of those changed (the function reads stdin on purpose: a `$1` in a skill file gets replaced by the slash-command arguments). This must print `non-prose unchanged`:

```bash
keep() { awk '/^---$/ && fm<2 {fm++; print; next} fm==1 {print; next} /^```/ {code=!code; print; next} code || /^import / || /^[[:space:]]*<\/?[A-Z]/ {print}'; }
diff <(keep < "${TMPDIR:-/tmp}/<post-slug>.before.mdx") <(keep < src/content/blog/<post-slug>.mdx) && echo "non-prose unchanged"
```

   If anything differs, restore those lines from the copy. Also eyeball inline code and quotes in `diff "${TMPDIR:-/tmp}/<post-slug>.before.mdx" src/content/blog/<post-slug>.mdx`.

## Step 8: Build and hand over

1. Run `npm run build`. It must pass. Draft posts are skipped by the production build, so it only checks the frontmatter; also start `npm run dev` in the background, load `http://localhost:4321/blog/<post-slug>/` and confirm it returns 200 with the images showing, then stop the server you started (do not leave port 4321 taken; if a server is already running on 4321, use it and leave it alone), which catches MDX body errors and wrong image paths. Fix and re-run on failure (usual causes: description over 180 characters, a category not in `CATEGORY_IDS`, a bad `url`, `{` or `<` in prose, a wrong image path).
2. Tell Khang:
   - the file path `src/content/blog/<post-slug>.mdx` and the diagrams in `src/assets/blog/<post-slug>/`;
   - how to preview: `npm run dev`, then open `http://localhost:4321/blog/<post-slug>/` (drafts show in dev only);
   - the sources used, and anything you were unsure about;
   - that the post stays `draft: true` until **he** reads it and flips `draft` to `false`.
