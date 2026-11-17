# Style guide: readable book-based posts

The reader is a developer new to the topic. They should understand each idea on the first read, and see it before they read the details. Every rule below is a check the draft must pass.

## Rules

- [ ] **Each concept: plain-language explanation first, then an everyday analogy, then a concrete example (code, numbers or a scenario), then the details.**
  Example: replication lag. Plain: "a replica can be a few seconds behind the leader." Analogy: "like a shared doc that syncs every few seconds: a colleague may still see the old line." Example: "you update your profile, refresh, and the old name comes back from a replica." Then the details: read-your-writes, monotonic reads.

- [ ] **Every `##` section carries at least one visual: a diagram, a table, a code block or a `Callout`.**
  The two closing sections ("Key takeaways", "Review questions") are lists by design and are exempt.

- [ ] **Which visual for what: a custom flow, sequence, or mental model → Excalidraw; a real benchmark chart, external architecture figure, live UI/docs screenshot, or real-world photograph → Real image (`fetch_real_image.py` + `sourceTitle`/`sourceUrl` on `Figure`); a conference talk explanation (`30s–5min`) → Timestamped `<YouTube start={...} end={...} />`; a short visual demo (`5–15s`, `< 2MB`) → `<Video autoplay loop />`; real open-source code → `<GitHubCode />`; community discussion or engineer insight → `<QuoteCard />`; external reference card → `<LinkCard />`; real local measurement/stdout → `<TerminalOutput />`; a comparison or trade-off → table; a warning or tip → `Callout`.**
  Example: "how a write travels from client to replicas" is a diagram; "Cloudflare's p99 latency spike during leader election" is a real chart extracted from their post with `sourceTitle`/`sourceUrl`; "Martin Kleppmann explaining write skew at QCon" is `<YouTube start={...} end={...} />`; "how Postgres implements it" is `<GitHubCode />`; "what engineers ran into on HN" is `<QuoteCard />`; "actual query plan timings" is `<TerminalOutput />`.
  Every visual must explain something. Mix at least 1–2 real-world sourced visuals or artifacts with Excalidraw diagrams so the post feels grounded in real engineering evidence. No decoration, no generic stock images, no AI-generated pictures.

- [ ] **Short paragraphs (≤ 4 sentences), short sentences, terms defined on first use.**
  Example: "An idempotent operation (one you can run twice with the same result as once) …". Define the term in the same sentence, not three sections later.

- [ ] **A one-paragraph "TL;DR" at the top; "Key takeaways" and "Review questions" at the end.**
  - TL;DR: a `<Callout type="note" title="TL;DR">` right after the imports, with the open and close tags each on their own line. One paragraph: the problem, the answer, why it matters.
  - `## Key takeaways`: 3–5 bullets, each a full sentence a reader could act on.
  - `## Review questions`: 3–5 numbered questions that test understanding, not recall ("Why would…", "What breaks if…"). Name the section that answers each one.

## Post shape

```
frontmatter (title, title_vi, description, description_vi, …)
imports (En, Vi, Callout, Figure, each PNG, …)
<En>

<Callout type="note" title="TL;DR">
One paragraph.
</Callout>
Opening: 1–2 short paragraphs. The problem, in concrete terms, and why the reader should care.
## One section per idea, in the order that answers the angle (not the chapter's order)
## Key takeaways
## Review questions

</En>

<Vi>

<Callout type="note" title="Tóm tắt nhanh (TL;DR)">
Một đoạn tóm tắt bằng tiếng Việt tự nhiên, giữ keyword tiếng Anh trong ngoặc cho các thuật ngữ kỹ thuật.
</Callout>
Mở đầu: 1–2 đoạn ngắn…
## Các mục tương ứng bằng tiếng Việt…
## Điểm rút ra (Key takeaways)
## Câu hỏi ôn tập (Review questions)

</Vi>
```

- The post page already shows the title as the `h1` and renders "References" from `sources`. Start body headings at `##`, and do not add a references section.
- Aim for 1,200–2,500 words. Cut anything that does not serve the angle.

## Components

All live in `src/components/mdx/`. Import what you use, right after the frontmatter.

```mdx
import Callout from '../../components/mdx/Callout.astro';
import Figure from '../../components/mdx/Figure.astro';
import writePath from '../../assets/blog/<post-slug>/write-path.png';

<Figure src={writePath} alt="A write goes to the leader, then copies to two replicas" caption="Replicas copy the leader, so they can lag behind it." />

<Figure src={realChart} alt="Latency distribution showing tail spikes during failover" caption="Tail latency jumps during leader election before replicas catch up." sourceTitle="Article or Docs Title" sourceUrl="https://example.com/article" />

<YouTube id="VIDEO_ID" title="Conference Talk Title" start={125} end={210} caption="What the speaker demonstrates in this segment." sourceTitle="Channel — Talk Title" />

<Video src="/assets/blog/<post-slug>/demo-clip.mp4" poster="/assets/blog/<post-slug>/demo-clip-poster.jpg" autoplay loop caption="Short visual demo of the behavior." sourceTitle="Channel — Talk Title" sourceUrl="https://www.youtube.com/watch?v=VIDEO_ID&t=125s" />

<Callout type="warning" title="Read-your-writes">
Reading from a replica right after a write can return the old value.
</Callout>
```

- `Callout` `type` is `note`, `tip` or `warning`; `title` is optional.
- Keep each `<Figure … />`, `<YouTube … />`, `<Video … />`, and `<LinkCard … />` on one line, and keep `<GitHubCode>`, `<QuoteCard>`, `<TerminalOutput>` open/close tags on their own lines (the Step 7 check relies on it).
- `alt` says what the picture shows; `caption` says the point. They are not the same sentence.
- Tables are plain Markdown; the site styles them. Keep cells short; 2–5 columns.

## Diagram Strategy & Visual Standards

Always choose the appropriate diagram tool according to Khang's 4-tier decision matrix:

1. **System Architecture & Data Flows → ByteByteGo Style (`ByteByteGoHq/system-design-101`)**:
   - Visual identity: Explicit system component icons, numbered step badges (`①`, `②`, `③`), data payload callouts, clear directional arrows, and high-contrast 3-level color depth.
2. **Cloud Infrastructure & DevOps → `mingrammer/diagrams` (Python)**:
   - Visual identity: Official AWS / GCP / Azure / Kubernetes / Docker icons, structured network clusters, clean modern vector output.
3. **Brainstorming & Mental Models → Excalidraw**:
   - Visual identity: Organic hand-drawn strokes (Rough.js), hand-drawn typography (Virgil/Cascadia), human intuition and mental models.
4. **Interactive System Demos → ReactFlow (`@xyflow/react`)**:
   - Visual identity: Live interactive graph inside `<DemoFrame>`, allowing readers to drag, click, inspect node metadata, or step through simulated request lifecycles.

## Diagram colours (Excalidraw & ByteByteGo SVG)

Use only these colors. They match the site, so a fresh machine needs no edit to the excalidraw skill's palette.

| Role | Colour |
|---|---|
| Accent / primary stroke (main shapes, arrows, timeline lines, marker dots) | `#B3402F` (red) |
| Secondary stroke (the second kind of thing, the alternative path) | `#A9821E` (gold) |
| Fill for primary shapes | `#F6E4DF` (red tint) |
| Fill for secondary shapes | `#F7EFD6` (gold tint) |
| Neutral fill (background groups, code or data boxes) | `#FAFAF8` |
| Title text, text inside shapes | `#262421` |
| Body text | `#55524B` |
| Muted text, annotations, neutral strokes | `#6B665F` |
| Canvas (`appState.viewBackgroundColor`) | `#ffffff` |

- The background is always white, so the PNG reads in both site themes.
- Code or data snippets inside a diagram: a `#FAFAF8` box with a `#6B665F` stroke and `#262421` text, not a dark box.
- Need a third meaning? Use a dashed stroke or a thicker line, not a new colour.
- The figure shows at most about 760px wide. Keep the drawing under about 1,200px wide and text at 16px or larger, so it stays readable once scaled down.

## Self-check (run before Step 7)

Go through the draft and fix every "no":

- [ ] The angle from Step 4 is clear in the opening, and the sections follow it, not the chapter's order.
- [ ] Each concept goes plain → analogy → example → details.
- [ ] Every `##` section (except the two closing ones) has a diagram, table, code block or `Callout`.
- [ ] Each visual is the right kind: System Design → ByteByteGo style, Cloud/Infra → `mingrammer/diagrams`, Mental models/Brainstorming → Excalidraw, Interactive exploration → ReactFlow, comparison → table, warning/tip → `Callout`.
- [ ] No paragraph is over 4 sentences. No sentence needs a second read.
- [ ] Every term is defined where it first appears.
- [ ] TL;DR at the top; "Key takeaways" and "Review questions" at the end.
- [ ] No quote is longer than two sentences; each is in quotation marks and attributed.
- [ ] Nothing reads like the chapter file reworded. Nothing redraws a book figure.
- [ ] Every claim with a number comes from the book, a listed source, or Khang.
- [ ] `description` is 180 characters or fewer; `draft: true`; `category` is in `CATEGORY_IDS`; every used article is in `sources` with its `url`; the book has `author` and `chapters`.
- [ ] Every `Figure` imports a PNG that exists, and sits on one line.
- [ ] The voice matches `voice.md`.
