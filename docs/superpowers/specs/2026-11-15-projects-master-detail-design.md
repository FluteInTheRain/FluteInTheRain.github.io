# Projects section: tabs + master-detail — design

Date: 2026-11-15 · Status: approved by Khang (2026-11-15)

## Intent

The Projects section is one long column of full cards (4 company + 5 personal today, each with 3–4
long bullets, one with a video). It already takes ~6–8 screens and grows with every new project
(Kafi projects coming). Readers are **recruiters**: they want to see quickly which projects exist,
at which company, with which stack, and open detail only for what catches their eye.

Goal: the whole Projects section fits in roughly one screen on desktop, regardless of project count.

## Goals / non-goals / anti-goals

- Goals: one tab visible at a time (Company / Personal); list of project names on the left, detail
  of the selected project on the right; works on phone; no content change in `content.json`.
- Non-goals: per-project pages, filtering by tech, changing other sections (Experience, Skills...).
- Anti-goals: content hidden from search engines or no-JS readers; layout jumping when switching
  project; breaking the existing `#projects` anchors in nav, footer and Highlights.

## Approaches considered

- A. Tabs + compact 2-column cards with collapsible "Key work". Keeps scanning, but still grows
  in height with project count.
- B. Whole page as tabs. Breaks recruiters' scroll-scan habit, anchors and printing.
- **C. Tabs + master-detail (chosen by Khang).** Fixed-size section; one project visible at a time.

## Design (C)

```
Projects
[ Company · 4 ]  [ Personal · 5 ]
┌──────────────────┬─────────────────────────────────────┐
│ JOURNEYHORIZON   │ GearShare                 View →    │
│ ▌Localmingo      │ JourneyHorizon                      │
│  GearShare  ◀sel │ AI-powered B2B marketplace for ...  │
│  Boldly          │ • AI-powered semantic search: ...   │
│  Vennu           │ • Event-driven async processing: ...│
│                  │ [TS][Express][pgvector][RabbitMQ]   │
└──────────────────┴─────────────────────────────────────┘
```

- **Tabs** (`Company`, `Personal`), with item counts. Only shown if both groups have items.
- **List (left, ~280px)**: each row = project title + one-line meta (org, or first 2–3 tags).
  Company list is grouped by `org` with a small heading, so Kafi and JourneyHorizon separate
  naturally. First project of each tab is selected by default.
- **Detail (right)**: reuses today's card content (title, org, desc, video, bullets, tags, links).
  Panel min-height = list height, so switching projects does not jump the page much.
- **Phone (< 768px)**: list collapses into an accordion; tapping a project opens its detail
  right under it (one open at a time). Tabs stay.
- **Accessibility**: tabs use `role="tablist"`/`tab`/`tabpanel`, arrow keys move between tabs;
  project list uses buttons with `aria-selected` + `aria-controls`; arrow up/down moves selection.
- **No JS / print**: all panels are rendered in HTML; JS hides the unselected ones. Print shows all.
- **Video**: stays `preload="none"`; pause it when its project is deselected.

Data: no schema change. `content.projects.company/personal.items` as today.

Files touched: `src/components/Projects.astro` (rewrite), `src/components/ProjectCard.astro`
(becomes the detail panel body), `src/styles/style.css` (projects block), a small script
(`src/scripts/projects.ts` or inline in the component).

## README (separate small task)

Rewrite `FluteInTheRain/README.md` to mirror the CV (`cv/Khang-Nguyen-CV.tex`) and `content.json`:
summary, core skills (as badges, same groups as the CV), experience (Kafi Securities, JourneyHorizon),
selected projects (company + personal, one line each, linked), education, certifications, contact
with the real portfolio link `https://fluteintherain.github.io` and the CV PDF.
Drop (Khang, 2026-11-15): research interests (DL/CV/RL/Robotics), the `KhangNguyen` Python class,
"Fun facts", the closing quote — anything not in the CV.

## Left to the builder

Exact breakpoints, spacing, list-row styling (within the existing design tokens), how tags are
truncated in list rows.
