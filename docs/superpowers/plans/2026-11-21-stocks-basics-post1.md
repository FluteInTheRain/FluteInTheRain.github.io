# Stocks-basics post 1 ("What is a stock: ownership & dividends") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first `stocks-basics` post — MDX body, hero metaphor photo, one "your slice" demo island, and an 8×5 quiz — published from its branch.

**Architecture:** One MDX post + one Astro/React demo component pair + eight quiz JSON files, all following the existing DDIA/UI-UX house format. Quiz loads automatically from `src/data/quiz/<slug>/set-NN.json`; no wiring code. Demo follows `GoStringRunesDemo` pattern (`.astro` wrapper + `DemoFrame` + React island `client:visible`).

**Tech Stack:** Astro 7 + MDX, React 19 islands, `node:test` quiz tests, no new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-21-stocks-basics-post1-design.md` (plus series spec `2026-11-21-stocks-basics-series-skeleton-design.md`)

## Global Constraints

- Branch `feat/stocks-basics-post1` off `main`; never commit to `main` directly.
- Every reader-facing string bilingual: frontmatter `title`/`title_vi`, body inside `<En>`/`<Vi>` spans.
- Real numbers only for named companies; every number carries a source in frontmatter `sources`. No invented figures for FPT/Vinamilk.
- No edits to shared mdx components (`AnimatedFlow`, `DemoFrame`, `DiagramIcon`, `Figure`, `Callout`…). Demo icon colours via `src/data/diagram-icons.ts` only.
- Demo styling from CSS tokens (`var(--bg)`, `var(--text)`…), correct in light + dark.
- Progressive enhancement: no-JS fallback for the demo (static default answer) and the quiz page (house format handles this).
- Gate every task: `npm run build` + `node --test` clean (build 47 → 48 after publish; +1 quiz page).

## Review Focus

1. **Real numbers drift between prose and demo** — demo constants must equal the numbers the prose states (same company, same fiscal year). Expect: a reader computing the demo's % by hand gets the prose's number. Pinned by Task 6's cross-check step.
2. **Number without source** — any FPT/Vinamilk figure missing a `sources` entry blocks publish. Pinned by Task 6 grep.
3. **Untranslated string** — any English-only text leaking into VI view (figcaption spans, demo labels, quiz options). Pinned by Task 3/4 VI-360 screenshot.
4. **Price-vs-value trap stated wrong** — the "10k rẻ hơn 100k" section must say price × nothing / share count differs, not imply cheap absolute price is good. Pinned by quiz set on this topic (Task 5).
5. **Demo hard-fails without JS** — must render the static fallback line, not a blank frame. Pinned by Task 4's no-JS check.

---

### Task 1: Scaffold the post (hero image + frontmatter + skeleton)

**Files:**
- Create: `src/content/blog/what-is-a-stock-ownership-dividends.mdx`
- Create: `src/assets/blog/what-is-a-stock-ownership-dividends/hero.jpg`

**Interfaces:**
- Consumes: frontmatter pattern of `src/content/blog/reliable-scalable-maintainable-data-systems.mdx`; `_TEMPLATE.md.txt`.
- Produces: the MDX file all later tasks extend; `sources` frontmatter list.

- [ ] **Step 1: Branch** `feat/stocks-basics-post1` off `main`.

- [ ] **Step 2: Pick + download the hero image.** Wikimedia Commons real photo, "one slice of something" metaphor (e.g. a land/property deed, a single share-certificate detail, or a pie-cut into marked slices). Record title/author/license/URL — they go into `sources`. Save as `hero.jpg`.

- [ ] **Step 3: Write the MDX skeleton.** Frontmatter per template: `title: "What a share really is"`, `title_vi: "Cổ phiếu thật ra là gì"`, `description`/`description_vi` ≤180/≤220 chars, `date: 2026-11-21`, `category: "finance"`, `tags: ["stocks", "investing-basics", "stocks-basics"]`, `cover: "../../assets/blog/what-is-a-stock-ownership-dividends/hero.jpg"`, `cover_alt`, `draft: true`, `sources` with: FPT IR, Vinamilk IR, HOSE/VSDC rule page, Graham quote source, Wikimedia hero credit. Imports: `En`, `Vi`, `Callout`, `Figure`. Body: the 7 section headings from the spec (EN + VI spans), each section empty except a placeholder comment.

- [ ] **Step 4: Verify** `npm run build` clean (still 47 pages — draft). Then commit:
  `git add src/content/blog/what-is-a-stock-ownership-dividends.mdx src/assets/blog/what-is-a-stock-ownership-dividends/hero.jpg && git commit -m "content(stocks): scaffold what-is-a-stock post with hero and sources"`

### Task 2: Write the post body (EN + VI, all 7 sections)

**Files:**
- Modify: `src/content/blog/what-is-a-stock-ownership-dividends.mdx`

**Interfaces:**
- Consumes: Task 1's MDX file and `sources`.
- Produces: the exact FPT/Vinamilk numbers (fiscal year, net profit, dividend/share, shares outstanding) and the HOSE ex-date rule line that Task 3's demo must match.

- [ ] **Step 1: Research the real numbers.** Latest audited annual figures, each with URL: FPT — net profit after tax, cash dividend per share (VND), shares outstanding; Vinamilk (VNM) — same three; the HOSE/VSDC ex-date price-adjustment rule (reference page URL); a Graham quote for the hook. Prefer fptcorp.com IR and vinamilk.com IR PDFs; cross-check one source per number minimum.

- [ ] **Step 2: Write sections 1–4** (hook + certificate; what a share legally is; slices-in-numbers math with both companies; dividends cash vs stock + one-line ex-date adjustment). Numbers formatted like the house posts (thousand separators, VND). Add 1–2 `Figure`s (metaphor or diagram) with `data-lang-en`/`data-lang-vi` captions.

- [ ] **Step 3: Write sections 5–7** (why prices move — expectations vs last year's report; the two beginner traps; key takeaways + review questions). Include the `YourSliceDemo` placeholder marker where the demo will sit (section 3).

- [ ] **Step 4: Verify.** `npm run build` clean; run `scripts/figures/post-check.sh what-is-a-stock-ownership-dividends` per `scripts/figures/README.md` and fix what it flags; eyeball `.shots/` light EN, dark VI, VI-360 (no untranslated leaks, no overflow). Commit:
  `git commit -am "content(stocks): write what-is-a-stock body with real FPT/VNM numbers"`

### Task 3: Build the "your slice" demo island

**Files:**
- Create: `src/components/mdx/YourSliceDemo.astro`
- Create: `src/components/demos/YourSliceDemo.tsx`

**Interfaces:**
- Consumes: `DemoFrame.astro` (unmodified); numbers pinned in Task 2.
- Produces: `<YourSliceDemo />` placed at the Task 2 marker in section 3.

- [ ] **Step 1: Write the demo.** React island, TypeScript. Constants: `{ company, sharesOutstanding, netProfit, cashDividendPerShare, sourceLabel }` for FPT and Vinamilk, copied from Task 2's prose (same year). UI: company toggle (two buttons), shares slider (1 → 1,000,000, log-ish step), three result tiles computed live: ownership %, your slice of that year's net profit (VND), your annual dividend (VND). All styling from CSS tokens; slug-prefixed global classes (`yourslice-*`), `figcaption` bilingual spans per the `GoStringRunesDemo.astro` pattern.

- [ ] **Step 2: No-JS fallback.** In the `.astro` wrapper inside `DemoFrame`, render a static bilingual line with the default answer (e.g. 100 FPT shares = x% of the company, y VND of profit, z VND dividend), replaced by the island when JS loads.

- [ ] **Step 3: Verify.** `npm run build` clean; dev screenshot light+dark of the demo frame; hand-compute one slider value against the prose numbers. Commit:
  `git add src/components/mdx/YourSliceDemo.astro src/components/demos/YourSliceDemo.tsx && git commit -m "content(stocks): your-slice demo island for what-is-a-stock"`

### Task 4: Quiz — 8 case sets × 5 questions

**Files:**
- Create: `src/data/quiz/what-is-a-stock-ownership-dividends/set-01.json` … `set-08.json`

**Interfaces:**
- Consumes: `src/data/quiz/types.ts`, existing set JSON as shape template (e.g. `reliable-scalable-maintainable-data-systems/set-01.json`).
- Produces: `/blog/what-is-a-stock-ownership-dividends/quiz/` (auto-wired by `src/data/quiz/index.ts`).

- [ ] **Step 1: Write set-01…set-08.** Case contexts reuse the post's real companies and concepts (ownership vs lottery; market-cap math; EPS; dividend cash vs stock; ex-date adjustment light; expectations vs earnings; price-vs-value trap; casino fallacy). Bilingual `en`/`vi` everywhere; invented illustrative numbers flagged `illustrative: true`; real numbers keep their source in the set context text. 5 questions per set across `remember` → `apply` difficulty, `type` single/multi as in `types.ts`.

- [ ] **Step 2: Verify.** `node --test src/utils/quiz.test.ts` clean (it validates structure). Dev: open the quiz page, play set-01 and set-08 once, screenshot dark VI. Commit:
  `git add src/data/quiz/what-is-a-stock-ownership-dividends && git commit -m "quiz(stocks): 8 case sets for what-is-a-stock"`

### Task 5: Publish + CHANGELOG

**Files:**
- Modify: `src/content/blog/what-is-a-stock-ownership-dividends.mdx` (`draft: false`)
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: everything above.

- [ ] **Step 1: Flip `draft: false`.** Verify `npm run build`: 47 → 48 pages (+quiz page); blog index now shows 4 series cards and the new post card; series cover page part 1 becomes clickable ("Đọc ngay") instead of "Sắp có".

- [ ] **Step 2: CHANGELOG entry** (newest on top, tiếng Việt): what shipped, real-number sources, demo/quiz, chưa chốt (bài 2).

- [ ] **Step 3: Commit:**
  `git commit -am "content(stocks): publish what-is-a-stock post 1"`

### Task 6: Review + PR

**Files:**
- Modify: anything Task 6 review flags.

- [ ] **Step 1: Cross-check numbers.** Grep prose vs demo constants: same company, same fiscal year, same values; every real number has a `sources` entry (`grep -c` against frontmatter).
- [ ] **Step 2: Full gate.** `npm run build` + `node --test` clean; grep MDX for `data-lang` coverage on every figcaption; 360px screenshots of post + demo + quiz.
- [ ] **Step 3: Fresh reviewer subagent** on the branch (superpowers:requesting-code-review); fix findings.
- [ ] **Step 4: Push, open PR to `main`, report URL, wait for merge.**
