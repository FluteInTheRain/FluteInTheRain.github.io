# Book-to-post: write blog posts with books as references — design

Date: 2026-11-15 · Status: approved by Khang (2026-11-15), with Excalidraw-only diagrams and web research

## Intent
Khang wants to put books (PDF/EPUB) into the project and run an AI flow that writes blog posts
using them as references. The posts may bring in material from outside the book. They do three
jobs: other people read them, Khang learns and reviews a topic by writing about it, and recruiters
see a site with more on it. Topics vary: Frontend, Backend, AI, Finance, and so on. This task only
sets up the folders and the flow. Khang uploads the books later.

Two quality bars from Khang: the posts must **read like a person wrote them**, and they must be
**easy to understand, with plenty of diagrams, illustrations and tables**.

## Goals / non-goals / anti-goals
- Goals: a place to drop book files; a one-command flow in Claude Code that turns a book chapter or
  topic into a draft post; each post lists the books and web articles it used; a `finance` category;
  posts that read as human-written and explain with visuals.
- Non-goals: a books collection or a `/books/` page (Khang: a note in the post is enough); an upload
  button on the site; batch generation; the Claude API or an API key; AI-generated photos;
  Mermaid (Khang: the diagrams look bad).
- Anti-goals: book files, near-verbatim chapter text, or figures copied from the book in the public
  repo; posts that are a chapter summary with the words shuffled; long quotes; posts published
  without Khang reading them; text that reads as AI-written; walls of text; decorative visuals that
  explain nothing; a heavier home page (Lighthouse is 100 today).

## Constraints
- The site is static Astro on GitHub Pages (`.github/workflows/deploy.yml`, `withastro/action`).
  It has no server, so everything runs locally in Claude Code with Khang's subscription.
- The repo is public, so books and anything derived from them close to verbatim stay gitignored.
  Skills without a licence are installed at user level, never copied into the repo.
- Posts must pass the existing `blog` schema in `src/content.config.ts`. A wrong frontmatter field
  breaks `npm run build`.
- The site switches theme with `html[data-theme]` (`src/scripts/ui.ts`). Excalidraw PNGs sit in a
  bordered `.figure` card on a light background, which reads fine in both themes.
- Tables (`.prose table`) and images (`Figure.astro`, `.figure`) are already styled in
  `src/styles/style.css`; reuse them.

## Approaches considered
- **A. A Claude Code skill in the repo (chosen by Khang, 2026-11-15).** Runs on the subscription,
  and Khang shapes the angle and outline while it writes, which serves the learning goal.
- B. A Node script that calls the Claude API. Rejected: needs an API key and per-token cost, and
  writes in one pass, so Khang does less of the thinking.
- C. A GitHub Action. Rejected: the book would have to sit in the public repo or in extra storage.

Diagrams: **Excalidraw only (Khang, 2026-11-15).** Mermaid was proposed and rejected by Khang
("it draws ugly"). Flows and sequences are drawn in Excalidraw too.

## Existing skills reused (checked on GitHub, 2026-11-15)
| Skill | Stars | Licence | Role here |
|---|---|---|---|
| [virgiliojr94/book-to-skill](https://github.com/virgiliojr94/book-to-skill) | ~38k | MIT | **Import.** PDF/EPUB → skill with `SKILL.md`, one file per chapter, glossary, patterns, cheatsheet. User level, so `/<book-slug> ch05` also works for study. Its docs say skills from copyrighted books must stay private. |
| [blader/humanizer](https://github.com/blader/humanizer) | ~69k | MIT | **Human voice, final pass.** Rewrites 26 AI-writing patterns (from Wikipedia's "Signs of AI writing") without changing meaning. Won 16/16 blind comparisons in its own test. |
| [coleam00/excalidraw-diagram-skill](https://github.com/coleam00/excalidraw-diagram-skill) | ~5.3k | none | **Every diagram** (concepts, flows, sequences, architecture). Hand-drawn style; renders to PNG with Playwright and checks its own layout. No licence, so installed at user level only. |

Considered and not used:
- [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) (~19k): same job as humanizer;
  running both adds little.
- Voice-cloning skills ([writing-voice](https://github.com/FishMan2341/writing-voice),
  [personal-voice-capture](https://github.com/eranshir/personal-voice-capture),
  [ghostwriter](https://github.com/angelarose210/ghostwriter),
  [content-skills](https://github.com/artemnovitckii/content-skills)): all under 150 stars. The idea is
  good, but Khang has no writing samples to feed them; the skill uses web research plus a default
  voice profile instead (items 9 and 11).
- [AgriciDaniel/claude-blog](https://github.com/AgriciDaniel/claude-blog) (~2.7k): SEO/marketing,
  32 skills, web research. Too heavy, and it pulls toward generic posts.

## Design
1. **`books/` folder (repo root).** Khang drops raw PDF/EPUB files here. Everything in it is
   gitignored except `books/README.md`, which explains the flow in a few lines.
2. **Install at user level** (not vendored): `book-to-skill` (`npx skills add virgiliojr94/book-to-skill`),
   `humanizer` (Claude Code plugin), `excalidraw-diagram` (git clone into `~/.claude/skills/` and run
   its renderer setup). `books/README.md` lists these commands so the setup can be repeated.
3. **Import a book:** `/book-to-skill books/<file>.pdf <book-slug>`. The book skill lands in
   `~/.claude/skills/<book-slug>/` and is never pushed (the converter offers a GitHub push; answer no).
4. **Schema:** add an optional `sources` field to the `blog` collection:
   `sources: [{ title, author?, chapters?, url? }]`, default `[]`. A book has `author` and usually
   `chapters`; a web article has `url`.
5. **Post page** (`src/pages/blog/[id].astro`): when `sources` is not empty, render a
   "References" block after the post body: "Title — Author (chapters)", linked when `url` is set.
   Books and web articles share the one list.
6. **Category:** add `finance` ("Finance") to `src/data/categories.ts`.
7. **No new site dependency for diagrams.** Excalidraw output is a plain PNG.
8. **Illustrations:** Excalidraw PNGs go in `src/assets/blog/<post-slug>/` with their `.excalidraw`
   source beside them (so they can be edited), and are shown with `Figure.astro` (Astro optimises
   them). Diagrams are redrawn in Khang's own words; nothing is copied from the book's figures.
9. **Voice profile:** `.claude/skills/book-to-post/voice.md`, a short default profile: an engineer
   explaining to another engineer, first person where it helps, plain words, opinions stated and
   backed by an example. Khang has no samples yet (Khang, 2026-11-15); he can edit the file any time
   and the skill reads it before drafting.
10. **Readability guide:** `.claude/skills/book-to-post/style-guide.md`. Rules the draft must meet:
    - Each concept: plain-language explanation first, then an everyday analogy, then a concrete
      example (code, numbers or a scenario), then the details.
    - Every `##` section carries at least one visual: a diagram, a table, a code block or a `Callout`.
    - Which visual for what: a flow, sequence, mental model or architecture → Excalidraw;
      a comparison or trade-off → table; a warning or tip → `Callout`.
    - Short paragraphs (≤ 4 sentences), short sentences, terms defined on first use.
    - A one-paragraph "TL;DR" at the top; "Key takeaways" and "Review questions" at the end.
11. **Project skill `.claude/skills/book-to-post/SKILL.md`** (committed). Usage:
    `/book-to-post <book-slug> [chapter or topic]`. Steps:
    1. Read the book skill's `SKILL.md` and the relevant chapter files.
    2. Search the web for 3–5 well-regarded articles on the same topic (official docs, known
       engineering blogs). Use them for extra facts, examples and how good writers explain it.
       Paraphrase, never copy; each one used goes into `sources` with its `url`.
    3. Ask Khang 2–3 short questions: what stood out, where it met his own work, what he disagrees
       with or wants to add from outside the book.
    4. Propose a title, an angle, and an outline that marks the visual planned for each section.
       Wait for Khang's OK.
    5. Write `src/content/blog/<post-slug>.mdx` following `voice.md` and `style-guide.md`, with
       `draft: true`, the right `category`, and `sources` filled in. Quotes stay short (a sentence or
       two, quoted and attributed).
    6. Make the visuals with the excalidraw skill.
    7. Run `/humanizer` on the prose (not on code blocks or diagrams).
    8. Run `npm run build`, then tell Khang the file path and how to preview it (`npm run dev`).
       Khang reads it and flips `draft` to `false` himself.
12. **Template:** update `src/content/blog/_TEMPLATE.md.txt` to show `sources`, the new category,
    and a `Figure` with an Excalidraw PNG.

## Calls made by Claude (Khang can override)
- Posts are written in English, like the existing posts.
- Downloaded skills are installed at user level, not in the repo.
- One human-voice skill (humanizer) plus a default voice profile, instead of a low-star
  voice-cloning skill.
- Web research is limited to 3–5 articles per post, and only ones actually used are listed.
- "TL;DR", "Key takeaways" and "Review questions" are part of every book-based post.

## Left to the builder
- Exact wording of the skill prompts, voice profile and style guide.
- References block styling (reuse tokens in `src/styles/style.css`).
- Excalidraw colour palette tuned to the site's tokens (`references/color-palette.md` in that skill).
