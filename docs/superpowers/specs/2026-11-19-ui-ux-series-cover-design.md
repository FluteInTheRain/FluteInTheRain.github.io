# UI/UX series cover page — design (short)

Date: 2026-11-19. Approved by Khang in conversation.

## Intent
The Refactoring UI series (9 posts) needs a "book cover + table of contents" page: it sells the series, links every post, shows how posts build on each other, and suggests reading orders. Separately, posts should state ideas directly instead of "Chapter N of the book is about…" (References already credit the book).

## Goals
- `/blog/series/refactoring-ui/` built from `src/data/series.ts` (already written: parts, acts, builds-on, 5 reading paths).
- Cover hero (kicker, title, tagline, 9-cell "spine" showing published vs soon, CTA to first published part, "N of 9 published"), outcomes, credit.
- Interactive map: 4 act columns, 9 nodes with "builds on" arrows; path picker numbers nodes in reading order; hover/focus a node highlights what it builds on and what builds on it. Real `<a>` links; works without JS.
- Contents list: part number, title link, hook, reading time; drafts show "soon", no link.
- Discovery: series bar at the top of each series post ("Part N of 9 · series map") and prev/next at the bottom (skip drafts in production); a series card on `/blog` and on the `ui-ux` category page.
- Bilingual via the site's `data-lang-en` / `data-lang-vi` spans; light/dark via site tokens.
- Remove chapter/book framing from the 9 UI/UX posts (EN + VI, body and descriptions).

## Non-goals
- No new series beyond Refactoring UI (the data model already supports more).
- No changes to DDIA files or to `.claude/skills/*` edits made by the parallel session.
- Draft posts 5–9 stay drafts; their text edits stay uncommitted with the rest of their draft work.

## Approaches
1. **Astro-rendered SVG/HTML + small inline script (picked).** Static links, SEO-friendly, no hydration; script only toggles classes for path/hover.
2. React island for the map. Consistent with demos, but ships React to a navigation page and links render only after hydration.
3. Static image/Excalidraw. Not interactive; rejected.

## Left to the builder
Exact layout breakpoints, arrow routing, and copy for the series bar / card.
