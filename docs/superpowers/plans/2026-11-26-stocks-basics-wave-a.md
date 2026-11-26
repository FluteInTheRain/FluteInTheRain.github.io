# Stocks Basics Wave A (Posts 2–4) Implementation Plan

**Goal:** Ship Posts 2, 3, and 4 of `stocks-basics` — complete bilingual MDX posts, real-world Wikimedia photos, 6 on-page Astro SVG diagrams (`SbP02*`–`SbP04*`), 1 interactive React demo island per post, and 8×5 `human` domain quizzes with quiz figures (`Sbq02*`–`Sbq04*`).

**Branch:** `feat/stocks-basics-wave-a` (cut from `main`).

**Spec:** `docs/superpowers/specs/2026-11-26-stocks-basics-posts-2-10-design.md`

## Tasks

- [x] **Step 1:** Branch `feat/stocks-basics-wave-a`, spec (`2026-11-26-stocks-basics-posts-2-10-design.md`), and Wave A plan (`2026-11-26-stocks-basics-wave-a.md`).
- [ ] **Step 2:** Post 2 (`vietnam-stock-market-venues-open-account`): 3 real images, 6 SVG diagrams (`SbP02*`), 1 React demo (`SbP02VenueExplorerDemo`), bilingual MDX, `domains.ts` + 8 quiz sets + quiz figures (`Sbq02*`). Verify `npm run build` + `node --test`.
- [ ] **Step 3:** Post 3 (`vietnam-order-types-order-book-ato-atc`): 3 real images, 6 SVG diagrams (`SbP03*`), 1 React demo (`SbP03OrderBookDemo`), bilingual MDX, `domains.ts` + 8 quiz sets + quiz figures (`Sbq03*`). Verify `npm run build` + `node --test`.
- [ ] **Step 4:** Post 4 (`stock-fees-taxes-settlement-t2-vsd`): 3 real images, 6 SVG diagrams (`SbP04*`), 1 React demo (`SbP04TradeCostDemo`), bilingual MDX, `domains.ts` + 8 quiz sets + quiz figures (`Sbq04*`). Verify `npm run build` + `node --test`.
- [ ] **Step 5:** Visual QA (`post-check.sh` + `figshot.sh` light EN / light VI / dark VI + inspect screenshots), update `CHANGELOG.md`, push branch and open PR to `main`.
