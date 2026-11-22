# Plan: stocks-basics series skeleton

Date: 2026-11-21 · Spec: `docs/superpowers/specs/2026-11-21-stocks-basics-series-skeleton-design.md`

## Goal

Register the fourth blog series `stocks-basics` (Vietnamese first-time investors) as a
complete skeleton — series entry, cover art, cover page — with no posts yet.

## Architecture

- Single data change: one new `Series` constant + export in `src/data/series.ts`.
  The type `Series` already carries everything (acts, parts, paths, cover, credit).
- One new asset: `src/assets/series/stock-certificate-1892.jpg` (Wikimedia Commons scan,
  CC BY-SA 3.0 — credit recorded in the series entry).
- No new pages or components: `/blog/series/[id].astro` already builds a page per
  `SERIES_IDS` entry and the blog index auto-filters empty series.

## Global constraints

- Every reader-facing string is `{ en, vi }` (site is bilingual).
- Cover image is a real photo/scan with a recorded license — no AI imagery.
- CSS tokens for any styling (none expected in this batch).
- Gate every step: `npm run build` + `node --test` clean.

## Steps

- [ ] 1. Branch `feat/stocks-basics-series` off `main`.
- [ ] 2. Download the cover image to `src/assets/series/stock-certificate-1892.jpg`
       (original resolution from Wikimedia Commons).
- [ ] 3. Add the `stocksBasics: Series` constant to `src/data/series.ts` per the spec
       (title/kicker/tagline/pitch/credit/cover/outcomes, 4 acts, 10 parts with builds,
       3 paths) and export it in `SERIES` / `SERIES_IDS`.
- [ ] 4. Verify on a build:
  - `npm run build` picks up `/blog/series/stocks-basics/` (page count +1, i.e. 47).
  - The cover page renders with all 10 parts as "soon" and no prev/next links.
  - The blog index still shows 3 series cards (empty series filtered out).
  - `node --test` clean.
- [ ] 5. Visual check in dev (dark + light, 360px and desktop) of the cover page;
       adjust `cover.position` if the plate crop is poor.
- [ ] 6. CHANGELOG entry (newest on top), then push, open PR, wait for user merge.

## Risks

- Cover page template may assume at least one published post (e.g. a "start reading"
  CTA). If so, guard it for the zero-post case in a follow-up commit within this PR.
- The cover plate may crop the certificate poorly at its default `object-position`;
  tune by eye and record the final value.
