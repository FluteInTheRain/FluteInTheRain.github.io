# Go series posts 1–10: diagrams and images (design)

Approved by Khang on 2026-11-23 ("ok, vừa").

## Intent

Posts 1–10 of the redesigned Go series run 830–1,470 lines with one hero photo and one interactive demo each. A newcomer reads long stretches of prose and code with nothing to look at. Add pictures so the mechanisms (memory layout, control flow, timelines, request paths) can be understood by eye.

## Goals

- 4–6 new on-page figures per post ("medium" density, option a), placed in the `##` sections that explain a mechanism and have no picture yet.
- Every real-case opener section with no visual gets a small timeline or before/after figure.
- At most one extra real-world image per post (real screenshot or licensed photo, no identifiable people), only where it clearly helps.

## Non-goals

- Posts 11–19 (they get visuals when they are rewritten).
- Prose rewrites. Only a one-sentence lead-in per figure, or removing an ASCII drawing a figure replaces.
- New interactive demos, or edits to shared components (`AnimatedFlow`, `Figure`, `DemoFrame`, `DiagramIcon`).

## Approaches

| Approach | Trade-off |
|---|---|
| **Chosen:** reuse old Go components where they meet current rules, draw the rest as static Astro SVG | cheapest; most old components (GoFund*, GoArch*) use the older card-grid style, so most figures will be new |
| One figure per idea, like the UI/UX series (option b) | about twice the cost; Go is code, so not every idea needs a picture |
| Generated PNG infographics | rejected earlier: they look AI-made |

## Rules

- Drawing rules: `.claude/skills/book-to-post/SKILL.md` section "B. Diagrams & Visuals" and `scripts/figures/README.md`.
- Figures use only what posts up to that one have taught; identifiers match the post's code; numbers come from shown output or are labelled illustrative.
- New components are named `GoP<NN><Name>.astro`, one figure per file. Old components are never edited (old posts still use them until cutover).

## Rollout

- Posts 4–10: commits on their open branches `feat/go-post-NN-*` (not yet pushed).
- Posts 1–3 (live): branches `feat/go-visuals-01..03` from `main`.
- One Sonnet agent per post, waves of 5, one fact review per wave, controller checks screenshots.
