# AI Trading Series — Batch 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `ai-trading` series entry (4 acts, 22 parts, cover), then write batch 1: posts 1–3 (`ai-trading-the-market`, `ai-trading-signals`, `ai-trading-data`) with 8 quiz sets each.

**Architecture:** One branch (`feat/ai-trading-series`), one worktree already created. Series entry first so the cover page renders with "soon" placeholders. Posts follow the DDIA pattern (template + series conventions). Quiz data is JSON validated by `node --test src/utils/quiz.test.ts`.

**Tech Stack:** Astro 7, MDX, Astro SVG components, `node:test`, headless Chrome screenshots.

**Spec:** `docs/superpowers/specs/2026-11-21-ai-trading-series-design.md`

**Paths:** `W = /Users/khang/.local/share/opencode/worktree/225f52/feat/ai-trading-series` (branch `feat/ai-trading-series`, cut from main `111eff6`).

## Global Constraints

- All copy bilingual: full `<En>/<Vi>` mirroring; every UI string `{ en, vi }`.
- Colours from CSS tokens only. `grep -rE '#[0-9a-fA-F]{6}'` on new components → 0.
- Shared files off limits: `AnimatedFlow.*`, `Figure.astro`, `DemoFrame.astro`, `En/Vi/Callout/Concepts`, layouts, `series/*` components, `public/icons/flow/README.md`.
- New components named `At<Name>.astro` in `src/components/mdx/`; icons via `DiagramIcon` / `src/data/diagram-icons.ts`; new flow icons in `public/icons/flow/` only after a name check.
- No invented incidents/numbers; every case cited in frontmatter `sources`. Only 51labs public material + public papers.
- Posts stay `draft: true` until Khang approves publishing.
- Gate per task: `npm run build` + `node --test src/utils/quiz.test.ts` clean.
- Commit tone per `git log` (`feat(blog): …`, `content: …`, `docs: …`). No push/merge to main without Khang.

## Review Focus

1. VI text ~20% longer overflows SVG boxes or labels → VI screenshots of every new diagram.
2. Dark mode unreadable → hex grep must be 0; check dark screenshots.
3. 360px width: diagram cut off instead of scrolling.
4. Series map with 22 parts (13 "soon") renders without breaking the 4-column layout.
5. Quiz: 5 questions per set, difficulty never drops, no letter references, no all/none-of-above; validator passes.

---

### Task 0: Worktree ready

- [ ] **Step 1:** `ls W/node_modules` → missing. Clone it: `cp -cR /Users/khang/Downloads/portfolio/node_modules W/node_modules` (clone, not symlink).
- [ ] **Step 2:** Baseline: `npm run build` and `node --test src/utils/quiz.test.ts` in `W` → both clean.

### Task 1: Series entry `ai-trading`

**Files:** Modify `src/data/series.ts`; add `src/assets/series/ai-trading/<cover>.jpg`.

- [ ] **Step 1:** Find a landscape, free-licence cover photo (HOSE / Vietnamese trading floor preferred; Wikimedia for licensing). Record author + licence for the credit.
- [ ] **Step 2:** Add the `ai-trading` Series entry from spec: 4 acts (`market`, `ml`, `dl`, `agentic`), 22 slugs in order (13 unpublished → "soon"), builds-on edges, 4 paths (`full`, `beginner`, `ml`, `quant`), title/kicker/tagline/pitch/outcomes/cover EN+VI, credit line naming 51labs curriculum + papers as content base.
- [ ] **Step 3:** `npm run build` → `/blog/series/ai-trading/index.html` exists, 22 nodes, 3 published-soon states render; `/blog/` shows the series card once ≥1 post is published (fine to stay 1 card until posts land); `refactoring-ui` and `ddia` covers unchanged (spot-check HTML).
- [ ] **Step 4:** Dev-server screenshots of `/blog/series/ai-trading/`: light, dark, VI, 360px, no-JS. Fix collisions.
- [ ] **Step 5:** Commit: `feat(blog): add ai-trading series entry and cover`.

### Task 2: Post 1 — The Market (`ai-trading-the-market`)

**Files:** `src/content/blog/ai-trading-the-market.mdx`; `src/components/mdx/AtMarket*.astro`; `src/assets/blog/ai-trading-the-market/*`; `src/data/quiz/ai-trading-the-market/set-0{1..8}.json`.

Content (from 51labs Module 1 W1–2 + spec): order book and matching (demo `AtMarketOrderBookSim`), candles, order types, limit up/down HOSE, brokers/exchange/clearing, who is in the market (retail vs institution VN), hero image (sourced real photo), cases: limit-up queues on HOSE, retail dominance numbers. Beginner: every term in `Concepts`.

- [ ] **Step 1:** Write the post per `_TEMPLATE.md.txt` + DDIA pattern (epigraph → real incidents → TL;DR → numbered sections → takeaways → review questions), bilingual, density target met.
- [ ] **Step 2:** Build 2–3 `AtMarket*` diagrams/demos (order book sim + matching flow), CSS tokens, both languages.
- [ ] **Step 3:** Hero + supporting real images under `src/assets/blog/ai-trading-the-market/`, alt text, credits.
- [ ] **Step 4:** Quiz: 8 sets × 5 questions per DDIA rules (difficulty rises in set, sets sorted by mean difficulty, no letter refs, beginner intuition weighting), figures in `src/components/quiz/figures/` if needed. `node --test src/utils/quiz.test.ts` clean; `QuizCta` shows.
- [ ] **Step 5:** Dev server: page 200, islands 200, screenshots light/dark/VI/360px per new diagram, read them, fix.
- [ ] **Step 6:** Commit: `content: add ai-trading post 1 — The Market` (+ quiz in the same commit).

### Task 3: Post 2 — Signals (`ai-trading-signals`)

**Files:** same pattern, prefix `AtSignals*`.

Content: why markets are hard for AI — low signal-to-noise, non-stationarity, reflexivity, adversarial competitors; 51labs blog (time-series momentum, regime detection) as public anchors; cases: factor decay/quant winter (sourced), Soros reflexivity framing. Demo: `AtSignalsNoiseSim` (same signal, different noise realisations) labelled simulated.

- [ ] Steps 1–6 as Task 2. Commit: `content: add ai-trading post 2 — Signals`.

### Task 4: Post 3 — Data (`ai-trading-data`)

**Files:** same pattern, prefix `AtData*`.

Content: financial data structure — candles vs ticks vs fundamentals, point-in-time data, survivorship bias, corporate actions, data contracts (51labs Module 1 W2), SQL/database basics; cases: survivorship-bias studies (sourced), a wrong-corporate-action incident (sourced). Demo: `AtDataPointInTime` (what you'd have seen on a given date).

- [ ] Steps 1–6 as Task 2. Commit: `content: add ai-trading post 3 — Data`.

### Task 5: Series wiring check

- [ ] **Step 1:** `npm run build` + `node --test` clean.
- [ ] **Step 2:** Dev server: series cover lists posts 1–3 as published (bars, pager between them), 19 "soon"; `/blog` series card state correct; posts 1–3 prev/next work.
- [ ] **Step 3:** Subagent review of the batch diff (diagram honesty, collisions, sources, VI/dark/360px) — verify findings, fix, commit `fix(blog): …` as needed.

### Task 6: Hand-off

- [ ] **Step 1:** Update `CHANGELOG.md` (top entry, Vietnamese).
- [ ] **Step 2:** Push `feat/ai-trading-series`, open PR to `main`. **Wait for Khang to merge.**
- [ ] **Step 3:** Update the kb note `portfolio-ai-trading-series-plan` (outline v4, 22 posts, batch 1 status).
