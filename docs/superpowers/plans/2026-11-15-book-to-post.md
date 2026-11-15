# Book-to-post Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Khang drop a book into `books/`, import it with `/book-to-skill`, and run `/book-to-post` to get a readable, human-sounding, illustrated draft post that lists its references.

**Architecture:** The site gains one optional frontmatter field (`sources`) rendered as a References block, plus a `finance` category. The AI flow is a committed Claude Code project skill (`.claude/skills/book-to-post/`) that orchestrates three user-level skills: `book-to-skill` (import), `excalidraw-diagram` (visuals), `humanizer` (voice). Nothing runs on the server; books never reach git.

**Tech Stack:** Astro 7 content collections (zod via `astro/zod`), MDX, Claude Code skills, Excalidraw renderer (Python + Playwright via `uv`).

**Spec:** `docs/superpowers/specs/2026-11-15-book-to-post-design.md`

## Global Constraints

- Public repo: no book files, no near-verbatim chapter text, no figures copied from a book, no unlicensed skill code committed.
- Downloaded skills are installed at user level (`~/.claude/skills/` or via plugin), never vendored into the repo.
- No Mermaid anywhere (Khang rejected it). All diagrams are Excalidraw PNGs.
- No new runtime dependency on the site; `package.json` dependencies stay unchanged.
- Posts are written in English. Generated posts always start with `draft: true`; only Khang flips it.
- Quotes from a book: a sentence or two, quoted and attributed.
- No test framework exists in this repo; verification is `npm run build` plus checks on `dist/` HTML. Do not add vitest/jest.

## Review Focus

1. A source with only `title` (web article, no author/chapters/url) → renders as plain "Title", no stray " — ", "()" or empty link. Test in Task 1.
2. A source with a malformed field (missing `title`, `url` not a URL) → `npm run build` fails with a schema error, not a silent drop. Test in Task 1.
3. A book in a nested folder or with an upper-case extension (`books/ddia/DDIA.PDF`, `.epub`, `.mobi`) → still ignored by git. Test in Task 2.
4. `humanizer` run on the whole file rewrites frontmatter, code blocks or `<Figure>` tags → build breaks or meaning changes. The skill must scope it to prose and re-run the build. Pinned in Task 4 (skill text) and exercised in Task 5.
5. An Excalidraw PNG viewed in dark theme → still readable (light card with border, not transparent dark-on-dark). Checked in Task 3 render and Task 5 preview.

---

### Task 1: `sources` field, References block, `finance` category

**Files:**
- Modify: `src/content.config.ts:6-17` (blog schema)
- Modify: `src/data/categories.ts:3,6-13`
- Modify: `src/pages/blog/[id].astro:16,51` (destructure `sources`, render block after `.prose`)
- Modify: `src/styles/style.css` (append `.post-sources` rules after the `.figure` rules near line 1556)
- Modify: `src/content/blog/_TEMPLATE.md.txt`
- Test fixtures (temporary, deleted in Step 6): `src/content/blog/zz-fixture-sources.mdx`, `src/content/blog/zz-fixture-bad.mdx`

**Interfaces:**
- Produces: frontmatter `sources?: { title: string; author?: string; chapters?: string; url?: string (URL) }[]`, default `[]`. Category id `'finance'`, label `'Finance'`. HTML: `<section class="post-sources" aria-labelledby="references"><h2 id="references">References</h2><ul>…</ul></section>`, rendered only when `sources.length > 0`.

- [ ] **Step 1: Write the fixtures (the failing test)**

`zz-fixture-sources.mdx`: `draft: false`, `category: "finance"`, and
```yaml
sources:
  - { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", chapters: "Ch. 5, 7", url: "https://dataintensive.net/" }
  - { title: "Some web article" }
```
`zz-fixture-bad.mdx`: valid post except `sources: [{ author: "No Title", url: "not-a-url" }]`. Keep it out of the first build by naming it `_zz-fixture-bad.mdx` (the glob skips `_`-prefixed files) until Step 5.

- [ ] **Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL. `category` "finance" is not in the enum (and `sources` is unknown/stripped).

- [ ] **Step 3: Implement**

- `categories.ts`: append `'finance'` to `CATEGORY_IDS`, add `finance: 'Finance'` to `CATEGORY_LABELS`.
- `content.config.ts`: add `sources: z.array(z.object({ title: z.string(), author: z.string().optional(), chapters: z.string().optional(), url: z.url().optional() })).default([])`. If `z.url` is unavailable in this zod version, use `z.string().url()`.
- `[id].astro`: each item renders as `<li>` → title (wrapped in `<a href={url} rel="noopener">` only when `url` is set, in `<cite>`), then ` — {author}` only if author, then ` ({chapters})` only if chapters.
- `style.css`: `.post-sources` gets a top border (`var(--border)`), muted heading size matching `.prose h2` scale down, list without bullets; reuse existing tokens only.
- `_TEMPLATE.md.txt`: add `finance` to the category comment, a commented `sources:` example (one book, one web article), and an example `<Figure>` import/use with an image from `src/assets/blog/<post-slug>/`.

- [ ] **Step 4: Run build and check the HTML**

Run: `npm run build && node -e "const h=require('fs').readFileSync('dist/blog/zz-fixture-sources/index.html','utf8'); const s=h.slice(h.indexOf('post-sources')); const ok=[s.includes('href=\"https://dataintensive.net/\"'), s.includes('Martin Kleppmann'), s.includes('(Ch. 5, 7)'), /Some web article<\/cite>\s*<\/li>/.test(s), require('fs').existsSync('dist/blog/category/finance/index.html'), !require('fs').readFileSync('dist/blog/ag-grid-realtime-streaming/index.html','utf8').includes('post-sources')]; console.log(ok); process.exit(ok.every(Boolean)?0:1)"`
Expected: build passes, prints `[ true, true, true, true, true, true ]`. (Adjust the 4th regex only if Astro inserts whitespace/attributes; the assertion is "no ' — ' or '()' after a title-only source".)

- [ ] **Step 5: Verify a bad source fails the build**

Rename `_zz-fixture-bad.mdx` → `zz-fixture-bad.mdx`, run `npm run build`.
Expected: FAIL with a schema error naming `sources` (`title` required / invalid url).

- [ ] **Step 6: Remove fixtures, final build, commit**

Delete both fixtures, run `npm run build` (PASS), then:
```bash
git add src/content.config.ts src/data/categories.ts "src/pages/blog/[id].astro" src/styles/style.css src/content/blog/_TEMPLATE.md.txt
git commit -m "feat(blog): sources frontmatter with References block, finance category"
```

---

### Task 2: `books/` drop folder

**Files:**
- Create: `books/README.md`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `books/` path convention used by Task 4's skill and `books/README.md` (the human entry point; Task 3 appends the install commands to it).

- [ ] **Step 1: Write the failing check**

Run: `mkdir -p books/ddia && touch books/a.pdf books/ddia/DDIA.PDF books/b.epub books/c.mobi && git check-ignore -q books/a.pdf books/ddia/DDIA.PDF books/b.epub books/c.mobi; echo $?`
Expected: `1` (not ignored yet).

- [ ] **Step 2: Implement**

`.gitignore`: add a block `# Books are copyrighted: never commit them (see books/README.md)` with `books/*` and `!books/README.md`.
`books/README.md` (English, short): what the folder is for; the three commands of the flow (`/book-to-skill books/<file> <book-slug>` → answer **no** to the GitHub push offer; `/<book-slug> ch05` to study; `/book-to-post <book-slug> [chapter or topic]`); that drafts land in `src/content/blog/` with `draft: true`; a "Setup (once per machine)" heading that Task 3 fills.

- [ ] **Step 3: Verify**

Run: `git check-ignore -q books/a.pdf books/ddia/DDIA.PDF books/b.epub books/c.mobi; echo $?; git check-ignore -q books/README.md; echo $?; rm -rf books/a.pdf books/b.epub books/c.mobi books/ddia`
Expected: `0` then `1`.

- [ ] **Step 4: Commit**

```bash
git add .gitignore books/README.md
git commit -m "chore(books): gitignored drop folder for source books"
```

---

### Task 3: Install user-level skills (machine setup, nothing vendored)

**Files:**
- Modify: `books/README.md` ("Setup (once per machine)" section)
- Outside repo: `~/.agents/skills/book-to-skill` (+ symlink in `~/.claude/skills/`), humanizer plugin, `~/.claude/skills/excalidraw-diagram/`

**Interfaces:**
- Produces: slash commands `/book-to-skill`, `/humanizer`, and the `excalidraw-diagram` skill with renderer `~/.claude/skills/excalidraw-diagram/references/render_excalidraw.py` (takes a `.excalidraw` path, writes a PNG). Task 4 references these exact names; if any name differs after install, record the real one in this task's commit message and use it in Task 4.

- [ ] **Step 1: Install book-to-skill**

Run: `npx skills add virgiliojr94/book-to-skill` (choose Claude Code, global). Then `ls ~/.claude/skills/book-to-skill/SKILL.md || ls ~/.agents/skills/book-to-skill/SKILL.md`.
Expected: the file exists; if only in `~/.agents/skills`, `ln -s ~/.agents/skills/book-to-skill ~/.claude/skills/book-to-skill`.

- [ ] **Step 2: Install humanizer**

Claude Code ≥ 2.1.142 is installed (2.1.323), so in Claude Code: `/plugin marketplace add blader/humanizer` then `/plugin install humanizer@humanizer`. If the plugin command cannot be run non-interactively, use `npx skills add blader/humanizer --global --agent claude-code`.
Expected: `/humanizer` is listed by Claude Code.

- [ ] **Step 3: Install excalidraw-diagram and its renderer**

Run: `git clone https://github.com/coleam00/excalidraw-diagram-skill.git ~/.claude/skills/excalidraw-diagram && cd ~/.claude/skills/excalidraw-diagram/references && uv sync && uv run playwright install chromium`
Then tune `references/color-palette.md` toward the site: read the colour tokens in `src/styles/style.css` (`:root`) and set the palette's primary/accent/text colours to them; background stays white/light so PNGs read in both themes.

- [ ] **Step 4: Verify the renderer end to end**

Write a 3-box flow `.excalidraw` into the scratchpad (or ask the skill for "three boxes: Book → Draft → Post") and render it with `uv run python render_excalidraw.py <file>` from `references/`.
Expected: a PNG is produced; open it with Read and confirm text is legible and on a light background.

- [ ] **Step 5: Document and commit**

Fill `books/README.md` "Setup (once per machine)" with the exact commands from Steps 1–3 that worked.
```bash
git add books/README.md
git commit -m "docs(books): one-time setup for book-to-skill, humanizer, excalidraw"
```

---

### Task 4: Project skill `book-to-post`

**Files:**
- Create: `.claude/skills/book-to-post/SKILL.md`
- Create: `.claude/skills/book-to-post/style-guide.md`
- Create: `.claude/skills/book-to-post/voice.md`

**Interfaces:**
- Consumes: `sources` schema and `finance` category (Task 1); `books/` (Task 2); `/book-to-skill` output at `~/.claude/skills/<book-slug>/{SKILL.md,chapters/*.md,glossary.md}`, `excalidraw-diagram` renderer, `/humanizer` (Task 3); `src/components/mdx/{Figure,Callout}.astro`; `src/data/categories.ts` `CATEGORY_IDS`.
- Produces: `/book-to-post <book-slug> [chapter or topic]` → `src/content/blog/<post-slug>.mdx` (`draft: true`) + `src/assets/blog/<post-slug>/*.png` and `*.excalidraw`.

- [ ] **Step 1: Write `SKILL.md`**

Frontmatter: `name: book-to-post`, `description:` one line that triggers on "write a post from <book>", "/book-to-post", "viết bài từ sách". Body = the 8 steps of spec item 11, in order, each with its concrete rule:
1. Read `~/.claude/skills/<book-slug>/SKILL.md` + the matching chapter files; if the slug is missing, stop and point to `books/README.md`.
2. WebSearch for 3–5 well-regarded articles (official docs, known engineering blogs); paraphrase only; every article actually used goes into `sources` with `url`.
3. Ask Khang 2–3 short questions (what stood out; where it met his own work; what to add or disagree with). Wait.
4. Propose title, angle, `category` (one of `CATEGORY_IDS`; if none fits, say so and propose adding one to `categories.ts`), outline with the planned visual per `##` section. Wait for OK.
5. Read `voice.md` and `style-guide.md`, then write the MDX: `draft: true`, `sources` filled (book with `author` and `chapters`), description ≤ 180 chars, quotes ≤ 2 sentences.
6. Make each Excalidraw visual with the excalidraw skill; save `.excalidraw` + PNG under `src/assets/blog/<post-slug>/`; embed with `<Figure src={img} alt="…" caption="…" />` via an `import img from '../../assets/blog/<post-slug>/<name>.png'`. Never reproduce a figure from the book.
7. Run `/humanizer` on prose only: give it the body paragraph by paragraph or tell it to leave frontmatter, imports, code fences and JSX tags untouched; then diff to confirm none of those changed.
8. `npm run build` must pass; report the file path and `npm run dev` preview URL `/blog/<post-slug>/`; remind Khang that he flips `draft: false`.
Also a "Never" list: commit anything under `books/`; copy book text beyond short quotes; use Mermaid; set `draft: false`.

- [ ] **Step 2: Write `style-guide.md`**

The readability rules from spec item 10 verbatim as a checklist (plain → analogy → example → details; ≥ 1 visual per `##`; visual-to-content mapping: flow/sequence/mental model/architecture → Excalidraw, comparison → table, warning/tip → `Callout`; paragraphs ≤ 4 sentences; define terms on first use; TL;DR at top; "Key takeaways" and "Review questions" at the end). End with a self-check list the skill runs before step 7.

- [ ] **Step 3: Write `voice.md`**

Default profile from spec item 9: engineer to engineer; first person where it helps ("I", "we" for the team); plain words; state opinions and back each with an example; no hype words; prefer concrete numbers only when sourced. A header line says Khang edits this file freely and it overrides the defaults.

- [ ] **Step 4: Verify the skill loads**

Run: `claude -p "List the project skills you can see in this repo, names only." --max-turns 1` from the repo root.
Expected: output includes `book-to-post`. Also `grep -ri mermaid .claude/skills/book-to-post` returns only the "Never" line.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/book-to-post
git commit -m "feat(skills): book-to-post skill with style guide and voice profile"
```

---

### Task 5: End-to-end smoke run (nothing from it is committed)

**Files:**
- Temporary only: a public-domain book in `books/`, the generated draft and assets (deleted at the end)

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Import a public-domain book**

Download a short public-domain text (e.g. Strunk's *The Elements of Style* from Project Gutenberg, EPUB) into `books/`, then `/book-to-skill books/<file>.epub elements-of-style`, answering **no** to the GitHub push.
Expected: `~/.claude/skills/elements-of-style/chapters/` exists; `git status` shows nothing under `books/`.

- [ ] **Step 2: Run the flow**

`/book-to-post elements-of-style "omit needless words"`; answer the questions briefly; approve the outline.
Expected: an `.mdx` with `draft: true`, ≥ 1 Excalidraw PNG, a table, TL;DR, Key takeaways, Review questions, `sources` with the book and ≥ 1 web article; `npm run build` passes.

- [ ] **Step 3: Check in the browser**

`npm run dev`, open `/blog/<post-slug>/` in light and dark theme (Playwright screenshot from the scratchpad).
Expected: References block renders; PNG readable in both themes (Review Focus 5); no `<pre>` or `<Figure>` mangled by humanizer (Review Focus 4).

- [ ] **Step 4: Clean up**

Delete the draft, its `src/assets/blog/<post-slug>/` folder and the book file; keep the user-level book skill only if Khang wants it. `git status` must be clean. Note any skill-text fixes found here and apply them in a follow-up commit to Task 4's files (`fix(skills): …`).
