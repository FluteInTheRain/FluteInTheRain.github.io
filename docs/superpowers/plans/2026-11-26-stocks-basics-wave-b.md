# Stocks Basics Wave B (Posts 5–7) Implementation Plan

**Goal:** Ship Posts 5, 6, and 7 of `stocks-basics` — complete bilingual MDX posts, real-world Wikimedia photos, 6 on-page Astro SVG diagrams (`SbP05*`–`SbP07*`), 1 interactive React demo island per post, and 8×5 `human` domain quizzes with quiz figures (`Sbq05*`–`Sbq07*`).

**Branch:** `feat/stocks-basics-wave-b` (cut from `main` after PR #76).

**Spec:** `docs/superpowers/specs/2026-11-26-stocks-basics-posts-2-10-design.md`

## Tasks

- [x] **Step 1:** Merge PR #76 (`feat/stocks-basics-wave-a`), cut branch `feat/stocks-basics-wave-b`, and write Wave B plan (`2026-11-26-stocks-basics-wave-b.md`) + Wave B truth table in spec.
- [x] **Step 2:** Download, resize (`<= 1600px` wide), and inspect 9 Wikimedia Commons photos across Posts 5–7; commit Phase 0 assets + docs.
- [ ] **Step 3:** Post 5 (`shareholder-rights-dividends-corporate-actions`): 6 SVG diagrams (`SbP05*`), 1 React demo (`SbP05ExDateCalculatorDemo`), bilingual MDX (`draft: true`), `domains.ts` + 8-set 40Q `human` quiz + quiz figures (`Sbq05*`). Verify `node --test src/utils/quiz.test.ts && npm run build`.
- [ ] **Step 4:** Post 6 (`reading-financial-statements-investors-5-minutes`): 6 SVG diagrams (`SbP06*`), 1 React demo (`SbP06StatementScannerDemo`), bilingual MDX (`draft: true`), `domains.ts` + 8-set 40Q `human` quiz + quiz figures (`Sbq06*`). Verify `node --test src/utils/quiz.test.ts && npm run build`.
- [ ] **Step 5:** Post 7 (`pe-pb-roe-valuation-ratios-in-context`): 6 SVG diagrams (`SbP07*`), 1 React demo (`SbP07ValuationContextDemo`), bilingual MDX (`draft: true`), `domains.ts` + 8-set 40Q `human` quiz + quiz figures (`Sbq07*`). Verify `node --test src/utils/quiz.test.ts && npm run build`.
- [ ] **Step 6:** Visual QA (`post-check.sh` + `figshot.sh` light EN / light VI / dark VI across all 18 Wave B SVG figures + inspect screenshots), update `CHANGELOG.md`, push branch and open PR to `main`.
