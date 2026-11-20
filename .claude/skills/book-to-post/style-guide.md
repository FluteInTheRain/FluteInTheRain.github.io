# Style guide: readable book-based posts

The reader is a developer new to the topic. They should understand each idea on the first read, and see it before they read the details. Every rule below is a check the draft must pass.

## Rules

- [ ] **Each concept: plain-language explanation first, then an everyday analogy, then a concrete example (code, numbers or a scenario), then the details.**
  Example: replication lag. Plain: "a replica can be a few seconds behind the leader." Analogy: "like a shared doc that syncs every few seconds: a colleague may still see the old line." Example: "you update your profile, refresh, and the old name comes back from a replica." Then the details: read-your-writes, monotonic reads.

- [ ] **Every `##` section carries at least one visual: a diagram, a table, a code block or a `Callout`.**
- [ ] **Every `##` section that introduces new terms ends with a `<Concepts>` box explaining them in plain words (EN and VI).**
  The two closing sections ("Key takeaways", "Review questions") are lists by design and are exempt.

- [ ] **Which visual for what: a chart, distribution, formula or timeline → on-page Astro SVG component; an architecture or request flow → on-page SVG component or `<AnimatedFlow />`; a parameter the reader should play with → React island; a hand-drawn mental model → Excalidraw (no generated infographic PNGs, see SKILL.md Step 6 B); a real benchmark chart, external architecture figure, live UI/docs screenshot, or real-world photograph → Real image (`fetch_real_image.py` + `sourceTitle`/`sourceUrl` on `Figure`); a conference talk explanation (`30s–5min`) → Timestamped `<YouTube start={...} end={...} />`; a short visual demo (`5–15s`, `< 2MB`) → `<Video autoplay loop />`; real open-source code → `<GitHubCode />`; community discussion or engineer insight → `<QuoteCard />`; external reference card → `<LinkCard />`; real local measurement/stdout → `<TerminalOutput />`; a comparison or trade-off → table; a warning or tip → `Callout`.**
  Example: "how a write travels from client to replicas" is a diagram; "Cloudflare's p99 latency spike during leader election" is a real chart extracted from their post with `sourceTitle`/`sourceUrl`; "Martin Kleppmann explaining write skew at QCon" is `<YouTube start={...} end={...} />`; "how Postgres implements it" is `<GitHubCode />`; "what engineers ran into on HN" is `<QuoteCard />`; "actual query plan timings" is `<TerminalOutput />`.
  Every visual must explain something. Mix **3–5 real-world sourced visuals** (4–5 for `ui-ux` / `frontend`: 1 hero metaphor + live production UI/docs screenshots + physical-world analogies) with **4–6 on-page diagrams/before-after UI examples** and **1–2 interactive React playgrounds** (`2` for `ui-ux` / `frontend`) so readers can see and test every core idea by eye. Mirror every visual symmetrically in both `<En>` and `<Vi>`. No decoration, no generic stock images, no AI-generated pictures.

- [ ] **Short paragraphs (≤ 4 sentences), short sentences, terms defined on first use.**
  Example: "An idempotent operation (one you can run twice with the same result as once) …". Define the term in the same sentence, not three sections later.

- [ ] **A one-paragraph "TL;DR" at the top; "Key takeaways" and "Review questions" at the end.**
  - TL;DR: a `<Callout type="note" title="TL;DR">` right after the imports, with the open and close tags each on their own line. One paragraph: the problem, the answer, why it matters.
  - `## Key takeaways`: 3–5 bullets, each a full sentence a reader could act on.
  - `## Review questions`: 3–5 numbered questions that test understanding, not recall ("Why would…", "What breaks if…"). Name the section that answers each one.

## Post shape

```
frontmatter (title, title_vi, description, description_vi, …)
imports (En, Vi, Callout, Figure, heroVisual, each PNG, …)
<En>

<Figure src={heroVisual} alt="Visual metaphor capturing the core dilemma" caption="The core trade-off: In software engineering, there are no silver bullets, only deliberate trade-offs." />

> "Compelling opening quote." — *Author*

### The Hook & The Paradox
Opening: 1–2 short paragraphs. Real-world incident (e.g. Prime Video, 37signals), the central trade-off, and the 4 dilemmas answered.

## Concise H2 Title (One section per idea)
## Next Concise H2 Title
## Key takeaways
## Review questions

</En>

<Vi>

<Figure src={heroVisual} alt="Hình ảnh ẩn dụ trực quan về bản chất kỹ thuật" caption="Bản chất của ngành kỹ thuật: Không có viên đạn bạc, chỉ có sự đánh đổi." />

> "Câu trích dẫn ngắn truyền cảm hứng." — *Tác giả*

### Mở đầu & Đặt vấn đề
Mở đầu: 1–2 đoạn ngắn kịch tính (sự cố sập hệ thống, quyết định quay xe), bản chất đánh đổi, và 4 câu hỏi cốt lõi được giải quyết.

## Tiêu đề H2 ngắn gọn (Mục tương ứng tiếng Việt)
## Tiêu đề H2 tiếp theo
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
- Tables are plain Markdown; the site styles them (full column width on desktop, sideways scroll on phones). Keep cells short; 2–5 columns.

## Diagram Strategy & Visual Standards

Diagrams are drawn on the page as Astro SVG components or React islands, using the site's CSS tokens and font. Which tool for what, the reference components, and the rules (size, bilingual labels, unique SVG ids, phone scrolling, honesty about simulated numbers) are in `SKILL.md` Step 6 B. Never generate "infographic" PNGs (title banner, pill/badge labels, card grids, gradients, emoji): Khang rejected them as AI-looking.

- **Showdown / solo comparisons**: when contrasting two paradigms (Row-Store vs. Column-Store, a contained fault vs. a cascading failure), draw them as a direct visual face-off, top/bottom or left/right, showing the tangible difference rather than a wall of text boxes.
- **No collisions**: no label crosses a line, box or other label; nothing is cut at the figure edge; Vietnamese labels (~20% longer) fit too. Place labels in empty space next to what they explain instead of boxing them.
- **Motion only when it teaches**: `<AnimatedFlow />` packets moving along edges are fine; shaking, pulsing or blinking to signal "danger" is not. A static red outline says it.
- **`mingrammer/diagrams` (Python)** stays for cloud infrastructure with official vendor icons: set `"nodesep": "0.9"` and `"ranksep": "1.2"` in `graph_attr` and break long labels with `\n`.

## The Hero Intro Hook & Centerpiece Visual

Every post must feature a high-impact intro that instantly hooks the reader before Section 1:
1. **The Single Hero Visual Metaphor (`<Figure src={heroVisual} ... />`)**:
   - **Placement**: Placed at the VERY TOP of the post body (right under `<En>` and `<Vi>`), immediately before the quote or opening narrative.
   - **Zero Preamble**: Do NOT write clumsy announcement text before it (e.g., *"Trước khi đi sâu vào từng ngóc ngách, đây là hình ảnh..."* or *"Below is an overview diagram..."*). Let the image speak for itself as the article's visual header.
   - **Single Metaphor Rule**: Exactly ONE striking hero visual per post. It is NOT an engineering manual or a cluttered multi-box diagram full of tiny text. It is an artistic, conceptual, or real-world metaphor (e.g. a precision mechanical balance scale weighing trade-offs, two storage formats facing off in a duel, or physical server hardware vs an ethereal cloud) that sparks curiosity and anchors the central theme.
2. **The Lead Hook (Quote + The Paradox / War Story)**:
   - Open with an attributed quote and a gripping, counter-intuitive real-world incident (e.g., Prime Video collapsing microservices back to a monolith, 37signals saving $3.2M leaving cloud, or an analyst query crashing checkout).
   - Reject generic intros or AI-sounding summaries.
3. **The 4 Key Takeaways Preview**:
   - Explicitly list the 3–4 core engineering dilemmas the post resolves so readers and hiring managers know the exact depth of knowledge to expect.
4. **Concise Section Headings (Clean TOC)**:
   - Keep all `##` headings punchy, short, and clear.
   - The sidebar Table of Contents (TOC) shows `##` sections and the `###` sub-sections under them (indented). It cuts each title at the first `:` or `—`, except a generic "Approach 1: …" / "Cách tiếp cận 1: …" prefix, where it shows the part after the colon without a trailing `(…)`. So keep `##` and `###` headings short, and put the meaningful words before the colon.

## Diagram colours (Excalidraw PNGs)

On-page SVG figures use the CSS tokens instead (`--red`, `--text`, `--text-muted`, `--border`, ...) so they follow dark mode; the hex values below are the light-theme values of those tokens, for PNG tools that cannot read CSS.

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

- [ ] Exactly ONE hero visual metaphor is placed right at the top under `<En>` and `<Vi>` (before the quote or text), with NO clumsy lead-in sentences ("Trước khi đi sâu vào...").
- [ ] The intro visual is NOT a cluttered diagram full of boxes and text; it is an artistic, philosophical, or real-world metaphor (e.g. balance scale, face-off duel).
- [ ] All `##` section headings are concise, short, and focused (to ensure the Table of Contents sidebar stays clean and elegant).
- [ ] No author cards or bylines added (this is Khang's personal blog).
- [ ] The angle from Step 4 is clear in the opening, and the sections follow it, not the chapter's order.
- [ ] Each concept goes plain → analogy → example → details.
- [ ] Comparisons between two architectures/paradigms (e.g. Row vs Column Store) are structured as direct visual showdowns ("solo"), focusing on tangible differences with minimal text clutter.
- [ ] All diagrams pass the **Anti-Collision Rule**: no text over boxes, lines or other text, nothing cut at the edge, in EN and VI; Python/Graphviz diagrams have `nodesep: 0.9` and `ranksep: 1.2`.
- [ ] Callout titles, Concepts titles and every label inside figures are sentence case, plain and human: no Title Case, ALL CAPS, emoji or hype words, and the Vietnamese reads naturally. Flow nodes use colour icons (logos / colour pictograms), not line icons.
- [ ] No generated infographic PNGs; every chart/diagram is an on-page component (or Excalidraw / mingrammer where SKILL.md Step 6 B allows), checked by screenshot in light, dark, VI and phone width.
- [ ] Every `##` section (except the two closing ones) has a visual (real-world `<Figure />`, on-page Astro SVG before/after, interactive `<DemoFrame>`, `<AnimatedFlow />`, table, code block, or `Callout`), and the post meets the visual-density target (**3–5 real-world images/screenshots/metaphors**, **4–6 on-page figures**, **1–2 interactive demos** — upper end for `ui-ux` / `frontend`), mirrored symmetrically in both `<En>` and `<Vi>`.
- [ ] No paragraph is over 4 sentences. No sentence needs a second read.
- [ ] Every term is defined where it first appears.
- [ ] "Key takeaways" and "Review questions" at the end.
- [ ] No quote is longer than two sentences; each is in quotation marks and attributed.
- [ ] Nothing reads like the chapter file reworded. Nothing redraws a book figure.
- [ ] Every claim with a number comes from the book, a listed source, or Khang.
- [ ] Frontmatter includes both `description` (<= 180 chars) and `description_vi` (<= 220 chars), with `description_vi` written in natural, engaging Vietnamese.
- [ ] `draft: true`; `category` is in `CATEGORY_IDS`; every used article is in `sources` with its `url`; the book has `author` and `chapters`.
- [ ] Every `Figure` imports a PNG/JPG that exists, and sits on one line.
- [ ] The voice matches `voice.md` (Vietnamese is natural and colloquial engineer-to-engineer, not robotic AI translation).
