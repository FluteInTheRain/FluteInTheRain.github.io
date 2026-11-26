# Stocks Basics Wave C (Posts 8–10) Implementation Plan

**Goal:** Finish `stocks-basics`: Posts 8, 9 and 10 as complete bilingual MDX posts built on real cases and real document images from the start, on-page SVG diagrams, one demo island per post, and `human` quizzes in **quiz matrix v2**.

**Branch:** `feat/stocks-basics-wave-c` (cut from `main` after PR #78).
**Spec:** `docs/superpowers/specs/2026-11-26-stocks-basics-posts-2-10-design.md` (per-post standard, truth tables).
**Quiz spec:** `docs/superpowers/specs/2026-11-26-quiz-matrix-v2.md` (levels, kinds, tracks, slots). Wave C uses v2, not the v1 mix the posts 2–10 spec still names.
**Authoring brief (agents):** `docs/superpowers/specs/2026-11-26-stocks-basics-wave-c-brief.md`.

## Global constraints

- Site tokens only (no hex), light + dark, bilingual `{en, vi}`, works without JS.
- Real cases with a source the agent opened; real document images (filings, circulars, exchange notices) cropped to the lines that matter. No "illustrative" labels; invented numbers state their assumption in the sentence.
- Figures: about 1 on-page diagram per 200–250 words of English prose; code/terminal/photos do not count.
- Quiz size by the v2 five-criteria rule: Post 8 = 40, Post 9 = 40, Post 10 = 20 (judgement call: a capstone with few dependants; it scores 3 of 5 on the rule, so 40 is defensible. Khang can raise it).
- `human` domain: `track: case`, no AI questions. No file other than the post's own may be edited by its agent.
- Posts stay `draft: true` until Khang reviews.

## Tasks

- [x] **Step 1:** Branch, plan, brief, `domains.ts` (`human` + `QUIZ_MATRIX` v2 entries).
- [x] **Step 2:** Post 8 `macro-industry-what-moves-stock-prices` (act `read`): MDX, `SbP08*` figures, demo, 40-question quiz (`Sbq08*`).
- [x] **Step 3:** Post 9 `margin-trading-risks-beginner-psychology` (act `discipline`): MDX, `SbP09*`, demo, 40-question quiz (`Sbq09*`).
- [x] **Step 4:** Post 10 `portfolio-dca-first-investment-plan` (act `discipline`): MDX, `SbP10*`, demo, 20-question quiz (`Sbq10*`).
- [x] **Step 5:** QA (`post-check.sh`, `figshot.sh`, quiz screenshots, `npm run check:quiz-mix <slug>`, `node --test`, `npm run build`), CHANGELOG, PR; wait for Khang.
