---
name: enrich-post
description: Enrich an existing or draft blog post with real-world images, YouTube tech talks/clips, open-source GitHub code permalinks, Hacker News discussions, rich link cards, and live local benchmark outputs with proper source attribution. Use for "/enrich-post <post-slug>", "thêm ảnh thực tế vào bài viết", "thêm video vào bài viết", "enrich post".
---

# enrich-post

Add authentic, real-world technical artifacts to a blog post at `src/content/blog/<post-slug>.mdx`:
- Real images & screenshots (`src/assets/blog/<post-slug>/` + `<Figure />`)
- Single Hero Visual Metaphor right at the top of the post (capturing the philosophical essence or core theme without text clutter or preamble announcements).
- Interactive animated flow simulators (`<AnimatedFlow />`) to visualize packets/events moving between services over time.
- YouTube talks & short `.mp4` clips (`<YouTube />` & `<Video />` under `public/assets/blog/<post-slug>/`)
- Real open-source code snippets (`<GitHubCode />`), community quotes (`<QuoteCard />`), link previews (`<LinkCard />`), and real local benchmark outputs (`<TerminalOutput />`).

Attribute every external artifact via `sourceTitle` / `sourceUrl` (or component `url`) and list it in frontmatter `sources`.

Usage: `/enrich-post <post-slug> [optional instructions or section focus]`. If `<post-slug>` is omitted, list the `.mdx` files in `src/content/blog/` and ask Khang which one to enrich.

## Why this skill exists

Posts with 100% AI-drawn diagrams can still feel synthetic. Real engineers mix their own mental-model diagrams (Excalidraw) with **real-world evidence**:
- Benchmark charts, architecture figures, or flamegraphs extracted from authoritative engineering blog posts (Cloudflare, Uber, Netflix, Confluent, Martin Fowler, official docs).
- Live screenshots of documentation pages, browser DevTools, GitHub repos/issues, or interactive tools captured via Playwright.
- Open-licensed technical photographs, hardware photos, or classic CS diagrams from Wikimedia Commons or web search.
- Real conference talks or deep-dives from YouTube — either embedded at the exact timestamp range (`<YouTube start={...} end={...} />`) or clipped into a short, silent looping `.mp4` (`<Video autoplay loop />`).

## Never

- Add a cluttered, multi-box text-heavy diagram as the hero image. The hero visual must be exactly ONE artistic, philosophical, or real-world metaphor (e.g. balance scale, solo face-off), placed directly at the top with NO preamble announcement.
- Overlap text with boxes, nodes, or arrows in diagrams (keep labels in empty space next to what they explain, and set `nodesep: 0.9` / `ranksep: 1.2` in Python diagrams).
- Add generated "infographic" PNGs (title banner, pill/badge labels, card grids, gradients, emoji). Diagrams and charts are drawn on the page; see `.claude/skills/book-to-post/SKILL.md` Step 6 B.
- Copy a figure from a copyrighted book in `books/`.
- Use generic decorative stock photos, unsourced memes, or AI-generated illustrations. Every image or video must explain a concrete technical point.
- Embed an external image without inspecting it first using `Read` (to verify it is crisp, legible, and actually shows what the caption claims).
- Self-host long videos in `public/`. Keep `<Video>` `.mp4` clips short (5–15 seconds, `<= 25s` max, `< 2MB`). Use `<YouTube start={...} end={...} />` for longer speaker explanations (`30s–5min`).
- Embed an external image or video without `sourceTitle` (and `sourceUrl` where applicable) AND an entry in frontmatter `sources`.

## Helper CLI (`fetch_real_image.py`)

Run all commands from the repo root using the Playwright Python environment already installed for `excalidraw-diagram`:

1. **Extract figures from a reference article or docs URL:**
   ```bash
   uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py extract "https://martinfowler.com/eaaDev/EventSourcing.html"
   ```
   Returns JSON with `pageTitle`, `pageUrl`, and `images` (`src`, `alt`, `caption`, `sectionHeading`, `width`, `height`).

2. **Search Wikimedia Commons or Web Images:**
   ```bash
   # Wikimedia Commons (open-licensed diagrams, hardware, CS structures)
   uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py search "B-tree index" --source wikimedia --limit 6

   # Web images (engineering blogs, system diagrams, charts)
   uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py search "Kafka consumer group partition rebalancing diagram" --source web --limit 6
   ```

3. **Download a chosen image into the post's asset folder (auto-converts SVG/WebP/hotlink-protected images):**
   ```bash
   uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py download "<imageUrl>" --referer "<pageUrl>" --out "src/assets/blog/<post-slug>/<kebab-name>.png"
   ```

4. **Capture a clean Retina screenshot of a live webpage or specific DOM element:**
   ```bash
   # Screenshot a specific element (table, chart, docs section, code block)
   uv run --project ~/.claude/skills/excalidraw-diagram/references python .claude/skills/enrich-post/scripts/fetch_real_image.py screenshot "https://postgresql.org/docs/current/mvcc-intro.html" --selector "main" --out "src/assets/blog/<post-slug>/pg-mvcc-docs.png"
   ```

## Helper CLI 2 (`youtube_helper.py`)

Uses `yt-dlp` and `ffmpeg` directly via `python3`:

1. **Search YouTube talks or technical demos:**
   ```bash
   python3 .claude/skills/enrich-post/scripts/youtube_helper.py search "Event Sourcing CQRS Confluent" --limit 5
   ```
   Returns JSON with `id`, `title`, `url`, `channel`, `duration`, `viewCount`.

2. **Read timestamped transcript & chapters to find real insights and exact start/end times:**
   ```bash
   python3 .claude/skills/enrich-post/scripts/youtube_helper.py transcript lg6aF5PP4Tc --query "read model"
   ```
   Returns video metadata, `chapters`, and timestamped `segments` (`start`, `time`, `text`). Use this to pick the exact segment where the speaker explains a key point or shares a production war story.

3. **Cut a short silent looping clip (`5–15s`, `< 2MB`) + poster frame:**
   ```bash
   python3 .claude/skills/enrich-post/scripts/youtube_helper.py clip <video_id_or_url> --start 02:15 --end 02:27 --out "public/assets/blog/<post-slug>/<kebab-name>.mp4"
   ```
   Outputs `<name>.mp4` and `<name>-poster.jpg` (automatically compressed `< 2MB`, stripped of audio).

## Helper CLI 3 (`artifact_helper.py`)

Uses Python 3 stdlib only:

1. **Search real practitioner discussions on Hacker News:**
   ```bash
   python3 .claude/skills/enrich-post/scripts/artifact_helper.py hn-search "keyset cursors not offsets Postgres pagination" --limit 5
   ```
   Returns JSON with `id`, `author`, `storyTitle`, `url`, `createdAt`, `points`, and cleaned `text`.

2. **Fetch real open-source code snippets with commit permalinks from GitHub:**
   ```bash
   python3 .claude/skills/enrich-post/scripts/artifact_helper.py github-snippet apache/kafka clients/src/main/java/org/apache/kafka/clients/consumer/ConsumerRecords.java --start-line 1 --end-line 35
   ```
   Returns JSON with `repo`, `path`, `lines`, `url` (commit-pinned permalink), and `snippet`.

3. **Fetch webpage title & description metadata for `<LinkCard />`:**
   ```bash
   python3 .claude/skills/enrich-post/scripts/artifact_helper.py link-meta "https://use-the-index-luke.com/no-offset"
   ```

## Live Local Benchmarks (`<TerminalOutput />`)

Instead of quoting theoretical numbers, run a quick local reproduction script (Node.js, Python `sqlite3`, Go benchmark, `EXPLAIN QUERY PLAN`, or CLI measurement) on real data and wrap the real stdout in `<TerminalOutput command="..." label="..." caption="...">`! Keep reproduction scripts temporary (`/tmp/`) unless they belong in the repo.

## Workflow

1. **Read the post:**
   Read `src/content/blog/<post-slug>.mdx`. Note which `##` sections currently have visuals and which sections would be stronger with a real-world chart, article figure, live screenshot, or YouTube talk/clip.

2. **Find candidate visuals & videos:**
   - Check the URLs already in the post's `sources` frontmatter with `fetch_real_image.py extract "<url>"`.
   - If the post has no `sources` yet (or needs better visuals), use WebSearch to find 2–3 authoritative articles or official docs on the topic, then run `fetch_real_image.py extract "<url>"` or `screenshot "<url>" --selector "..."`, or run `search "<query>" --source web|wikimedia`.
   - For video references, run `youtube_helper.py search "<topic>"` and `youtube_helper.py transcript <id>` to inspect speaker explanations and pick exact timestamps.

3. **Download / clip and visually verify (Mandatory):**
   - Download 1–3 top image candidates to `src/assets/blog/<post-slug>/<name>.png`.
   - **Open every downloaded PNG (and any generated `-poster.jpg`) with `Read`** to inspect it yourself. If an image is blurry, cropped badly, unreadable in a 760px column, or looks like marketing fluff, delete it (`rm`) and pick another.

4. **Embed and attribute (always on one line per tag):**
   - **Image (`<Figure />`):**
     ```mdx
     import Figure from '../../components/mdx/Figure.astro';
     import kafkaGroup from '../../assets/blog/<post-slug>/kafka-consumer-group.png';

     <Figure src={kafkaGroup} alt="Four partitions mapped across two consumers in a consumer group" caption="Each partition is read by at most one consumer in the group, bounding parallelism to the partition count." sourceTitle="Confluent Blog — Getting Started with Apache Kafka" sourceUrl="https://www.confluent.io/blog/getting-started-with-apache-kafka-in-python/" />
     ```
   - **Timestamped YouTube talk (`30s–5min` explanation — keeps repo lightweight):**
     ```mdx
     import YouTube from '../../components/mdx/YouTube.astro';

     <YouTube id="lg6aF5PP4Tc" title="Event Sourcing 101: CQRS" start={125} end={210} caption="Between 2:05 and 3:30, the speaker walks through projecting an event log into a separate read-optimized database." sourceTitle="Confluent — Event Sourcing 101 (CQRS)" />
     ```
   - **Short self-hosted looping demo clip (`5–15s`, `< 2MB` visual motion):**
     ```mdx
     import Video from '../../components/mdx/Video.astro';

     <Video src="/assets/blog/<post-slug>/demo-clip.mp4" poster="/assets/blog/<post-slug>/demo-clip-poster.jpg" autoplay loop caption="Visual walkthrough of the rebalancing animation." sourceTitle="Channel — Talk Title" sourceUrl="https://www.youtube.com/watch?v=...&t=135s" />
     ```
   - **Real Open-Source Code (`<GitHubCode />`), Practitioner Quote (`<QuoteCard />`), Link Preview (`<LinkCard />`), & Live Benchmark (`<TerminalOutput />`):**
     ```mdx
     import GitHubCode from '../../components/mdx/GitHubCode.astro';
     import QuoteCard from '../../components/mdx/QuoteCard.astro';
     import LinkCard from '../../components/mdx/LinkCard.astro';
     import TerminalOutput from '../../components/mdx/TerminalOutput.astro';

     <GitHubCode repo="owner/repo" path="src/file.ts" lines="L10-L24" url="https://github.com/owner/repo/blob/sha/src/file.ts#L10-L24" caption="Why this real implementation matters">
     ```ts
     // exact lines fetched via artifact_helper.py github-snippet
     ```
     </GitHubCode>

     <QuoteCard author="hn-author" sourceTitle="Hacker News discussion on ..." sourceUrl="https://news.ycombinator.com/item?id=...">
     Exact practitioner insight fetched via artifact_helper.py hn-search.
     </QuoteCard>

     <LinkCard url="https://example.com/article" title="Authoritative Article" description="Metadata fetched via link-meta." tag="Reference" />

     <TerminalOutput command="python3 /tmp/bench.py" label="SQLite EXPLAIN & Timing" caption="Real timing measured locally across 100k rows.">
     ```text
     actual command stdout here
     ```
     </TerminalOutput>
     ```
   - **Interactive React Mini-Playground (`<DemoFrame />`):**
     When a concept is best understood by clicking through states or comparing two modes (like out-of-order event merging or pagination drift), build a lightweight React component under `src/components/demos/<Name>Demo.tsx` reusing the `.sd`, `.sd-controls`, `.sd-group`, `.sd-btn`, `.sd-stats`, `.sd-stat` classes in `src/styles/style.css`, and embed it with `client:only="react"`:
     ```mdx
     import DemoFrame from '../../components/mdx/DemoFrame.astro';
     import MyTopicDemo from '../../components/demos/MyTopicDemo.tsx';

     <DemoFrame title="Short title of what the reader is testing">
       <MyTopicDemo client:only="react" />
     </DemoFrame>
     ```
   - Keep `<Figure />`, `<YouTube />`, `<Video />`, `<LinkCard />`, and the opening/closing tags of `<En>`, `<Vi>`, `<GitHubCode>`, `<QuoteCard>`, `<TerminalOutput>`, and `<DemoFrame>` on **their own single lines** (so `humanizer` and build checks preserve them cleanly).
   - If the post is bilingual (`<En>…</En>` and `<Vi>…</Vi>`), add the new visual/artifact caption in both the English block and the Vietnamese block (translating technical concepts with English keywords in parentheses), and ensure any shared `<DemoFrame>` includes `titleVi`.
   - Ensure every source article, video, GitHub permalink, or HN thread (`{ title: "…", url: "https://…" }`) is listed in the post's `sources` frontmatter array.

5. **Verify build:**
   - Run `npm run build` and confirm it passes with zero errors.
   - Report the added media, their sources, and the preview URL (`http://localhost:4321/blog/<post-slug>/`) to Khang.
