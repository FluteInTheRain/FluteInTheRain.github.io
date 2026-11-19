# DDIA Series Cover and Post Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a DDIA series cover at `/blog/series/ddia/`. Then remove chapter framing from all 14 DDIA posts and add 2–3 architecture/flow diagrams plus one sourced real-world problem to each.

**Architecture:** The cover reuses the series components on `feat/ui-ux-series-cover`; acts become a per-series ordered array. Each post is edited by one Sonnet agent in its own worktree and branch. The lead verifies each post, commits it, and reviews each batch. Everything is merged locally into `preview/ddia-all` for Khang to review.

**Tech Stack:** Astro 7, MDX, React islands, on-page SVG components, headless Chrome for screenshots.

**Spec:** `docs/superpowers/specs/2026-11-19-ddia-series-cover-and-visuals-design.md` (on `feat/ddia-series-cover`).

**Paths:** `L=/Users/nguyennhatkhang/Downloads/learning`, main checkout `$L/FluteInTheRain.github.io`, cover worktree `$L/FluteInTheRain-ddia-cover`.

## Global Constraints

- Subagents: `model: sonnet`.
- Every new worktree gets `cp -cR $L/FluteInTheRain.github.io/node_modules ./node_modules`. Never a symlink.
- Post agents must not modify `AnimatedFlow.*`, `Figure.astro`, `DemoFrame.astro`, layouts, or `public/icons/flow/README.md`. New components use the post's prefix.
- Density target: 3–5 real-world sourced visuals, 4–6 on-page figures, 1–2 interactive demos, and a visual in every `##` section except the two closing ones. Every visual appears in both `<En>` and `<Vi>`.
- No generated infographic PNGs, no invented incidents or numbers, no redrawn book figures.
- Draft flags stay unchanged. No push or merge to main without Khang.
- Commit trailer: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Vietnamese labels (~20% longer) overflow or collide inside a new SVG → check VI screenshots of every new diagram.
2. Dark mode: hard-coded colours in a new SVG become unreadable → grep new components for `#[0-9a-fA-F]{3,6}` outside comments; expect 0, CSS tokens only.
3. At 390px a wide diagram is cut off instead of scrolling → check the 390px screenshot.
4. The `refactoring-ui` cover changes when acts are generalised → diff its built HTML (Task 1).
5. A "real-world problem" cites a URL that does not support the claim → the batch reviewer opens every new source URL.

---

### Task 1: Per-series acts

**Files:**
- Modify: `src/data/series.ts` (types `ActId`, `Series.acts`, `SeriesPart.act`; the `refactoring-ui` entry)
- Modify: `src/components/series/SeriesMap.astro:6-33,91,103-105`

**Interfaces:**
- Produces: `interface SeriesAct { id: string; label: L10n; blurb: L10n }`; `Series.acts: SeriesAct[]` (column order); `SeriesPart.act: string`, which must match an `acts[].id`. `ActId` is removed.

- [ ] **Step 1:** Baseline. In the cover worktree, run `npm run build` and copy `dist/blog/series/refactoring-ui/index.html` to the scratchpad as `ui-before.html`.
- [ ] **Step 2:** Change the types and migrate `refactoring-ui` to `acts: [{id:'start',…},{id:'structure',…},{id:'surface',…},{id:'craft',…}]` with the same copy.
- [ ] **Step 3:** In `SeriesMap.astro`, replace `ACTS` with `series.acts.map(a => a.id)` and look acts up by id. The aria text reads `in ${acts.length} groups`. Throw at build time if a part's `act` matches no act.
- [ ] **Step 4:** Run `npm run build`, then `diff <(sed 's/four groups/4 groups/' ui-before.html) dist/blog/series/refactoring-ui/index.html`. Expected: no output, apart from build hashes if any (strip `?v=`/hash attributes before diffing if needed).
- [ ] **Step 5:** Commit: `refactor(blog): let each series define its own acts`.

### Task 2: DDIA series entry and cover

**Files:**
- Modify: `src/data/series.ts` (add `ddia`, register it in `SERIES`)

**Interfaces:**
- Consumes: `SeriesAct` and `Series` from Task 1.

- [ ] **Step 1:** Add the `ddia` entry. It needs:
  - acts `foundations` / `distributed` / `derived`, with labels and blurbs from spec A.2;
  - the 14 slugs from spec "Answers 1", in order;
  - builds-on edges and the 5 paths from spec A.2;
  - path ids `full`, `interview`, `distributed`, `pipelines`, `database`;
  - EN/VI copy written from each post's `title`/`description`; the credit names Kleppmann & Riccomini, 2nd ed.
- [ ] **Step 2:** Run `npm run build`, then confirm:
  - `/blog/series/ddia/index.html` exists;
  - `grep -c 'series-card' dist/blog/index.html` → 2;
  - `dist/blog/category/system-design/index.html` → 1;
  - `dist/blog/category/ui-ux/index.html` → 1.
- [ ] **Step 3:** Run `npx astro preview` and take headless Chrome screenshots of `/blog/series/ddia/`: desktop light, dark (`data-theme`), VI, 390px, and `--blink-settings=scriptEnabled=false`. Read each one. Expected: 3 columns, 14 nodes, no overlapping text or arrows, links work without JS.
- [ ] **Step 4:** Commit: `feat(blog): add DDIA series cover`.

### Task 3: Post worktrees

- [ ] **Step 1:** For ch.1–4, create branches from main and their worktrees:

  | Ch. | Branch | Worktree |
  |---|---|---|
  | 1 | `feat/ddia-ch1-visuals` | `$L/FluteInTheRain-ddia-ch1` |
  | 2 | `feat/ddia-ch2-visuals` | `$L/FluteInTheRain-ddia-ch2` |
  | 3 | `feat/ddia-ch3-visuals` | `$L/FluteInTheRain-ddia-ch3` |
  | 4 | `feat/ddia-ch4-visuals` | `$L/FluteInTheRain-ddia-ch4v` |

  For ch.7–14, create worktrees `$L/FluteInTheRain-ddia-ch{N}` on the existing branches. Each worktree gets a cloned `node_modules`.
- [ ] **Step 2:** In `-ch5` and `-ch6`, commit the current uncommitted draft as the baseline: `feat(blog): add DDIA ch.N post on <topic>`. Ch.6 also includes its changes to `AnimatedFlow` and `public/icons/flow/` (these predate the "no shared files" rule).
- [ ] **Step 3:** Run `git worktree list`. Expected: 14 post worktrees, each on its own branch, plus the cover and preview worktrees. Record each post's base commit for its diff: `main` for ch.1–4 and 7–14, `50dc207` for ch.5–6.

### Task 4–6: Post batches

Batches:

| Batch | Posts |
|---|---|
| 4 | ch.6, 11, 12, 13, 7 (fewest visuals first) |
| 5 | ch.8, 9, 10, 14, 3 |
| 6 | ch.1, 2, 4, 5 |

For each batch:

- [ ] **Step 1:** Dispatch one Sonnet agent per post, all in one message, using the Appendix brief. Port = 4340 + N.
- [ ] **Step 2:** As each agent returns, verify its post:
  - the de-framing grep → 0;
  - `curl` the page → 200 with no error overlay, and every island URL → 200;
  - the hex-colour grep on new components → 0;
  - read 2 of the agent's screenshots (VI and 390px).

  Fail → send the agent the specific problem (SendMessage) and re-verify.
- [ ] **Step 3:** Commit on the post's branch: `docs(blog): state ideas directly in the DDIA ch.N post`, then `feat(blog): add architecture diagrams to the DDIA ch.N post`. Use one commit if the changes do not separate cleanly.
- [ ] **Step 4:** Batch review: one Sonnet `pr-review-toolkit:code-reviewer` agent, given the batch's worktree paths and diff commands. It checks the Review Focus items 1–3 and 5, and leftover framing. Verify each finding before fixing, then commit any fixes.
- [ ] **Step 5:** Stop the batch's dev servers (`npx astro dev stop` in each worktree).

### Task 7: Preview and hand-off

- [ ] **Step 1:** In `$L/FluteInTheRain-ddia-preview`:
  - reset `preview/ddia-all` to main;
  - merge `feat/ui-ux-series-cover`, `feat/ddia-series-cover`, `feat/ddia-publish-ch3-ch4`, all 14 post branches, and `feat/ddia-ch5-encoding-evolution` / `feat/ddia-ch6-replication`;
  - resolve duplicate icons (identical files are kept; otherwise rename one);
  - replace its `node_modules` symlink, if any, with a clone.
- [ ] **Step 2:** Run the dev server on 4330. Check that `/blog/series/ddia/` and all 14 posts return 200, that each post shows the series bar, and that the island crawl shows no failures.
- [ ] **Step 3:** Send Khang the URLs and a per-post table: visuals before/after, real-world case added. Add a work-log entry and save the kb note.

---

## Appendix: post agent brief (fill `{…}`)

```
You are improving one bilingual (EN/VI) blog post in an Astro 7 + MDX site. Work ONLY in {WORKTREE}
(branch {BRANCH}). Do not commit, push, or touch other worktrees.

Post: {WORKTREE}/src/content/blog/{SLUG}.mdx. Its own components use the prefix "{PREFIX}"
(src/components/mdx/{PREFIX}*.astro, src/components/demos/{PREFIX}*Demo.tsx).

Read first: /Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io/.claude/skills/book-to-post/style-guide.md
and its SKILL.md Step 6 B (visual tools, colour tokens, anti-collision, sentence-case labels,
bilingual mirroring). Read src/components/mdx/AnimatedFlow.astro and one existing <AnimatedFlow />
use in another post before using it.

Do, in order:
1. De-frame. Remove "chapter N", "the book says/argues/calls", "Kleppmann argues" and their
   Vietnamese equivalents, in the body and in description/description_vi. State ideas directly.
   Do not touch frontmatter `sources` or the `ddia` tag. This must print 0:
   grep -v '^  - {' {FILE} | grep -ciE 'chapter [0-9]|chương [0-9]|the book|cuốn sách|của sách|sách (nói|khuyên|gọi|đề|cho|bảo|gợi)|kleppmann (says|argues|calls|writes|notes)|ddia (chapter|chương)'
2. Add 2–3 architecture or request/data-flow diagrams where the text describes a system or path
   but shows no picture. Use <AnimatedFlow /> for paths, and new Astro SVG components
   ({PREFIX}<Name>.astro) for static architecture or before/after. Use CSS tokens only, no hex
   colours. Put each diagram in both <En> and <Vi>, with labels in that language.
3. Add one real-world problem: a real, sourced case (postmortem, engineering blog, paper) that
   this post's idea explains. Structure: setup → what broke or was hard → which idea resolves it
   → a diagram of the system involved. Add the source to frontmatter `sources` with its url. If you
   cannot find a fitting real case, say so; never invent one.
4. Density target after your edits: 3–5 real-world sourced visuals, 4–6 on-page figures, 1–2
   interactive demos, and a visual in every ## section except the last two. Count before and after.
5. Forbidden: editing AnimatedFlow.*, Figure.astro, DemoFrame.astro, layouts,
   public/icons/flow/README.md; generated infographic PNGs; invented numbers; redrawing book
   figures. You MAY add icons to public/icons/flow/ (check the name is free) and assets under
   src/assets/blog/{SLUG}/.
6. Verify. In {WORKTREE}, run `npx astro dev --port {PORT}` (it daemonises; stop it with
   `npx astro dev stop`). The page http://localhost:{PORT}/blog/{SLUG}/ must return 200 with no
   error overlay, and every astro-island component-url/renderer-url must return 200 (curl -g).
   Take headless Chrome screenshots of each new diagram in light, dark, VI and 390px width
   (see the style guide for flags). Read them and fix collisions or cut-offs. Save them under
   {WORKTREE}/.shots/ (do not commit them).
7. Leave the dev server running. Report in under 300 words: files changed, new sources, visual
   counts before → after, new icons added, screenshot paths, and anything skipped and why.
```
