# Plan: series book covers v2

Date: 2026-11-24 · Branch: `feat/series-covers-v2` · Decided with Khang over a long mock-up session
(HTML mocks rendered to PNG, reference: Kurose & Ross "Computer Networking" cover shelf).

## Goal

Replace the current flat "paper face + tipped-in photo plate" `BookCover.astro` with a modern
photo cover: full-bleed real photo, large title at the top over a tinted fade, a hairline,
a one-line subtitle, and the author name bottom-right. One layout for all six series, one
accent colour per series. Covers are English-only (user decision: "bìa bằng tiếng Anh luôn").

## Final design (all decided)

Layout, in `cqw` units so the same cover scales from the 320px hero to the 92px thumbnail:

- Photo fills the face (`object-fit: cover`, per-series `object-position`).
- Top-to-transparent gradient tinted with the series hue (`oklch(.13 .05 h / .95)` → transparent
  at ~66%) so the title stays readable on any photo; a weaker bottom scrim for the author.
- Title block at `left 10cqw / top 9cqw`: Noto Sans **600**, `11.4cqw`, line-height 1.08,
  letter-spacing -0.02em, `text-wrap: balance`. The **topic word** (e.g. "AI", "Go", "Backend")
  is coloured with the series accent `oklch(.86 .12 h)`; everything else white.
- Hairline under the title (0.35cqw, accent at 55% alpha), then the subtitle: Noto Sans 400,
  `3.7cqw`, white at 88%.
- Author "Khang Nguyen" bottom-right (`right 7cqw / bottom 6cqw`): **same font, size, weight and
  colour as the subtitle** (user asked for it to match), with a soft text-shadow.
- Keep the existing book effect: hinge gradient on the left, page-edge block on the right,
  perspective tilt + drop shadow (`.book`, `.bk-pages` from today's component).
- Small size (`size="sm"`, series cards): hide subtitle and author, keep title + accent.
- Font: Noto Sans (already loaded in `Layout.astro`, weights 400/600/700/800 — no new font).

Per-series content (cover-only strings, English):

| Series | Cover title (accent word in **bold**) | Subtitle | hue | Photo (Wikimedia Commons) | Licence |
|---|---|---|---|---|---|
| `refactoring-ui` | **UI Design** for Developers | Ship interfaces that don't look generated | 265 | Bauhaus-Universität Weimar spiral staircase, `Weimar Bauhaus-Universität Hauptgebäude 406.jpg`, GFreihalter | CC BY-SA 3.0 |
| `ddia` | **Data** Systems Under Pressure | Explained by the outages that shaped them | 35 | Open hard drive, `Open hard-drive.jpg`, Zzubnik | Public domain |
| `golang` | How **Go** Actually Works | From the scheduler to the cache line | 205 | Go game stones, `Go -- 2021 -- 6732.jpg`, Dietmar Rabich | CC BY-SA 4.0 |
| `stocks-basics` | **Stock Market** Basics | Own a slice of a company, safely | 75 | NYSE trading floor, `NY stock exchange traders floor LC-U9-10548-6.jpg`, Thomas J. O'Halloran (LoC) | Public domain |
| `backend` | How **Backend** Actually Works | What happens after the request lands | 150 | IBM Portable Modular Data Center rack, `IBMPortableModularDataCenter3.jpg`, Raysonho @ Open Grid Scheduler | CC BY 3.0 |
| `ai-trading` | **AI** for Market Systems | From the first order to the agent that decides | 285 | Robonaut 2 facing an astronaut, `Face-Off Robonaut.jpg`, Robert Markowitz (NASA) | Public domain |

Note: "Data Systems Under Pressure" is the *cover* title only; `series.title` stays as is.

## Architecture

- `src/data/series.ts`: extend `SeriesCoverArt` with
  `title: { lead?: string; accent: string; rest?: string }`, `tagline: string` (English cover
  subtitle), `hue: number`. Keep `image`, `alt`, `position`, `credit`. Drop `subtitle: L10n` and
  `imprint` from the cover once no component reads them (check `SeriesCard`, `SeriesCover`).
- `src/components/series/BookCover.astro`: rewrite the face per the design above. No new
  dependency, no JS. Colours use `oklch()` from `--h`; these are the cover object itself
  (like the existing hard-coded paper face), identical in light and dark theme.
- `src/assets/series/`: add 6 new JPEGs (max width 1600px, repo convention); remove old
  cover-only assets once unreferenced (`drafting-set.jpg`, `ibm-305-ramac.jpg`,
  `stock-certificate-1892.jpg`, `backend-plate.png`, `ai-trading/hose-building.jpg`;
  `go-gopher-five-years.jpg` only if nothing else imports it — grep before deleting).
- Credit line on the cover page (`SeriesCover.astro`) already reads `cover.credit`; update each
  entry (title, author, url, licence). Keep the `origin` default (Wikimedia Commons).

## Global constraints

- Real photos only, licence recorded in `credit` — no AI imagery.
- Cover text is English-only by explicit user decision. This is an exception to the
  "every string `{ en, vi }`" rule and applies to the cover face only; credit/pitch text stays
  bilingual.
- Progressive enhancement: pure HTML/CSS, no JS. `alt` text kept on every cover image.
- Do not touch shared mdx components. Do not stage unrelated files.
- Gate every step: `npm run build` + `node --test` clean.

## Steps

- [ ] 1. Download the 6 photos from Commons (`Special:FilePath?width=1600`), resize with
       `sips --resampleWidth 1600` if wider, save into `src/assets/series/` with stable names
       (`cover-ui-bauhaus-stair.jpg`, `cover-data-hard-drive.jpg`, `cover-go-stones.jpg`,
       `cover-stocks-nyse-floor.jpg`, `cover-backend-rack.jpg`, `cover-ai-robonaut.jpg`).
- [ ] 2. Update the `SeriesCoverArt` type and all six series entries in `src/data/series.ts`
       (title parts, tagline, hue, image, alt, position, credit). Build must stay green with the
       old component still reading unchanged fields.
- [ ] 3. Rewrite `BookCover.astro` to the final design; `size="sm"` hides subtitle + author.
- [ ] 4. Remove now-unused cover fields (`subtitle`, `imprint`) and orphaned assets; grep first.
- [ ] 5. Verify: `npm run build`, `node --test`; open `/blog/`, each `/blog/series/<id>/`
       in dark + light, 360px + desktop; thumbnail in `SeriesCard`; accent word readable on all
       six; no console errors. Tune each `position` against the real crop.
- [ ] 6. CHANGELOG entry (Vietnamese): what changed, user decided the design, open items.
- [ ] 7. Commit per step, push, open PR into `main`, wait for Khang to merge.

## Open items

- Backend photo was chosen from three options; AI Trading from three (Sophia robot, Frankfurt
  bull and bear, Robonaut) — Robonaut chosen.
- The "topic word" per series lives in `cover.title.accent`; revisit if a series is renamed.
- Photos are bilingual-neutral, but `alt` stays English only (as today).
