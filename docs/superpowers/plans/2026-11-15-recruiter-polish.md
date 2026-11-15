# Recruiter Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio home page read in seconds for a recruiter (Full-stack positioning,
proof up front, Projects higher), add AI-assisted engineering skills, and add a few subtle motion
touches — professional, not flashy.

**Architecture:** Content lives in `src/data/content.json`; components read it. Task 1 changes
content, page order and static layout (Hero, Experience, Skills, Blog, CTA). Task 2 adds motion
(one small reveal script + CSS) and fixes nav defects. Motion is screen-only, off under
`prefers-reduced-motion: reduce`, and never hides content without JS or in print.

**Tech Stack:** Astro 7, plain TS client scripts, CSS in `src/styles/style.css`. No new deps.

**Spec:** `docs/superpowers/specs/2026-11-15-recruiter-polish-design.md`

## Global Constraints

- No invented facts or numbers: every claim traces to `cv/Khang-Nguyen-CV.tex`, `content.json`, or
  the approved wording in the spec (Kafi bullets, AI section).
- No new npm dependencies. `npm run build` must pass (CI uses Node 24).
- Without JS and when printing, all content is visible.
- Motion only under `@media screen and (prefers-reduced-motion: no-preference)`; no count-up,
  parallax, typewriter or bouncing.
- Use existing design tokens for both themes; keep the existing fonts.
- Keep the hero photo (`assets/avatar.webp`) unchanged.
- Projects section (`Projects.astro`, `projects.ts`) behaviour must not regress: the scratchpad suite
  `/private/tmp/claude-502/-Users-nguyennhatkhang-Downloads-learning/2663b780-d64c-4cf0-957a-84c888237979/scratchpad/check-projects.mjs`
  (35 checks, expects a server on `http://localhost:4321/`) must still pass.

## Review Focus

1. Deep link `/#projects` or `/#contact` on load: target section visible immediately, not stuck at
   opacity 0 (Task 2).
2. Phone 390px: hero stats row wraps cleanly (2×2), no horizontal page scroll (Task 1).
3. Dark theme: stats, AI card and featured post readable (Task 1).
4. `prefers-reduced-motion: reduce`: nothing transforms or fades (Task 2).
5. Nav at 769px and 1024px: no horizontal page overflow; hamburger hidden ≥ 769px (Task 2).

---

### Task 1: Content, order and static layout

**Files:**
- Modify: `src/data/content.json` (meta, person.role, hero, remove `highlights`, experience item 0,
  skills, cta, nav.links order, footer.quickLinks order)
- Modify: `src/pages/index.astro` (order; drop `Highlights`)
- Delete: `src/components/Highlights.astro` (+ its CSS block `.highlights-*`, `.highlight*` if unused elsewhere — grep)
- Modify: `src/components/Hero.astro`, `src/components/Skills.astro`, `src/components/LatestPosts.astro`,
  `src/components/Cta.astro` (only if copy keys change), `src/styles/style.css`

**Content values (verbatim):**
- `meta.title`: `Khang Nguyen — Full-stack Software Engineer`;
  `meta.description`: `Portfolio of Khang Nguyen, a full-stack software engineer in Ho Chi Minh City building marketplace platforms and real-time trading systems.`
- `person.role`: `Full-stack Software Engineer`
- `hero.role`: `Full-stack Software Engineer`
- `hero.focus`: `React/Next.js · Node.js · Go · AWS — marketplace and real-time trading systems`
- `hero.bio`: `I build products end to end: React frontends, Node.js and Go services, and the AWS infrastructure behind them. I've helped deliver 10+ marketplace platforms and now work on real-time trading systems at Kafi Securities, while studying for a Master's in AI.`
- `hero.stats` (array of `{ value, label }`, in order):
  `~3 yrs` / `experience`; `10+` / `marketplace platforms delivered`;
  `AWS Certified` / `Developer – Associate`; `M.Sc. AI` / `GPA 9.07/10, in progress`
- Hero buttons: primary = `Download CV` (existing CV href/filename), secondary outline = `Email me` (mailto).
- `experience.items[0].bullets` (replace `desc`), in order:
  1. `Tech stack: Golang, Python, Kafka, Redis, NATS, FIX gateway, Jenkins, Elasticsearch, Kubernetes, React/Next.js.`
  2.–5. the four Kafi bullets from the spec section "Kafi bullets", verbatim.
- `skills.groups` (6, in order): Languages (unchanged); Web Development (unchanged);
  Data & Messaging (unchanged); `AI & LLM`: `OpenAI API`, `Embeddings & semantic search`, `RAG`,
  `QLoRA fine-tuning`, `vLLM`, `LLM evaluation`; Cloud & DevOps (unchanged); Tools: `Git`, `Sentry`, `Trello`.
- `skills.aiWorkflow`: `{ "category": "AI-assisted Engineering", "items": ["Claude Code", "Multi-agent workflows", "Context engineering", "MCP", "Agent hooks & skills"], "heading": "How I work with AI", "steps": [3 strings] }`
  — steps verbatim from the spec section "AI skills" (items 1–3).
- `cta.heading`: `Open to good conversations.`; `cta.subtext`: `Full-stack roles, product engineering, or just comparing notes on real-time systems.`; `cta.button.label`: `Say hello`.
- `nav.links` order: Experience, Projects, Skills, Education, Blog, Contact.
  `footer.quickLinks` order: Experience, Projects, Skills, Education.

**Layout decisions:**
- Page order: Nav, Hero, Experience, Projects, Skills, Education, LatestPosts, Cta, Footer.
- Hero: `h1` "Hi, I'm Khang"; then role line (`p.hero-role`, prominent, not an h-tag) and focus line
  (`p.hero-focus`, muted); bio left-aligned (remove `text-align: justify` and `white-space: pre-line`);
  stats as `dl.hero-stats` (4 columns desktop, 2×2 ≤ 768px), value bold, label muted, no icons.
- Skills: the 6 groups in the existing grid (3×2 desktop); below it one full-width card
  `div.ai-card` with the `aiWorkflow` tags and an ordered list of the 3 steps under its heading.
- LatestPosts: when exactly one post, render it as one wide featured card (`.post-card--featured`,
  full container width, title larger); with 2+ posts keep the grid.

- [ ] **Step 1:** Implement.
- [ ] **Step 2: Verify build + DOM.** `npm run build`, then a node check on `dist/index.html`:
  section order by id = `experience, projects, skills, education, blog, contact`-ish (CTA band and
  footer after blog); no `highlights-` class; `hero-stats` has 4 items; `ai-card` contains 5 tags
  and 3 `li`; Kafi item has 5 `li`; meta title equals the value above; no text `Let's talk about your next project`.
- [ ] **Step 3: Visual check.** Playwright (scratchpad, channel 'chrome') screenshots of hero, skills
  and blog at 1440 and 390, light and dark; read them; confirm Review Focus 2 and 3; and that
  `document.documentElement.scrollWidth <= innerWidth` at 390.
- [ ] **Step 4:** Run `check-projects.mjs` against `npm run preview -- --port 4321` → 35/35.
- [ ] **Step 5: Commit** `feat(home): full-stack positioning, stats, Kafi highlights, AI skills, reorder sections`.

### Task 2: Subtle motion + nav fixes

**Files:**
- Create: `src/scripts/reveal.ts`; Modify: `src/layouts/Layout.astro` (inline head script and import)
- Modify: `src/styles/style.css`

**Decisions:**
- Reveal: the inline head script (already at `Layout.astro` ~line 84) adds class `js` to `<html>`.
  CSS (screen + no-preference only): `html.js .section:not(.is-revealed), html.js .cta-band:not(.is-revealed)`
  → `opacity: 0; transform: translateY(12px)`; `.is-revealed` → `opacity:1; transform:none;
  transition: opacity 400ms ease-out, transform 400ms ease-out`. `reveal.ts` uses one
  IntersectionObserver (`threshold: 0.08`) to add `is-revealed` once and unobserve. Sections already
  intersecting at load and the section matching `location.hash` (plus every section above it) get
  `is-revealed` immediately without transition. If `IntersectionObserver` is missing, reveal all.
  The hero is not animated.
- Project detail cross-fade: `.projects.is-enhanced .proj-detail-panel.is-open` gets a 150ms
  opacity-only keyframe animation (screen + no-preference).
- Sticky list: **not implemented** (controller ruling: the list items are separate grid children so
  the accordion works with one markup; a sticky group would need a wrapper that breaks the phone
  accordion).
- Screenshot placeholder: `.project-shot img { background: var(--bg-alt) }`.
- Hamburger: hidden at ≥ 769px (cause: `.icon-btn { display:flex }` is declared after
  `.nav-hamburger { display:none }` with equal specificity — fix by raising specificity, e.g.
  `.nav-actions .nav-hamburger`).
- Nav 769–1024px: no horizontal overflow (tighten `.nav-links` gap/font and hide `.nav-role` in the
  existing `(max-width:1024px) and (min-width:769px)` block; measure, do not guess).

- [ ] **Step 1:** Implement.
- [ ] **Step 2: Verify** with a scratchpad Playwright script against `npm run preview -- --port 4321`:
  (a) after scrolling to bottom, every `.section` has `is-revealed` and computed opacity 1;
  (b) load `/#projects` and `/#contact`: target section opacity 1 within 100ms of load;
  (c) `reducedMotion: 'reduce'` context: no `.section` has a transform/transition and all opacity 1;
  (d) JS disabled: all sections opacity 1; (e) `emulateMedia({media:'print'})`: all opacity 1;
  (f) at 769, 900, 1024, 1440 widths: `scrollWidth <= innerWidth` and hamburger `display` is `none`;
  at 390 hamburger visible; (g) `check-projects.mjs` 35/35.
- [ ] **Step 3: Commit** `feat(home): subtle section reveal and project cross-fade; fix desktop hamburger and tablet nav overflow`.

### Task 3: Finish

- [ ] Whole-branch review of `git diff feat/projects-master-detail...HEAD`, then
  superpowers:finishing-a-development-branch. No push without Khang's OK.

### Task 4: CV, OG image and profile README match the site (added 2026-11-15, Khang: "Cập nhật luôn cả CV")

**Files:**
- Modify: `src/data/content.json` (GPA only), `cv/Khang-Nguyen-CV.tex`; regenerate `cv/Khang-Nguyen-CV.pdf` and copy to `public/assets/Khang-Nguyen-CV.pdf` (byte-identical).
- Regenerate: `public/assets/og-image.png` (1200×630).
- Modify (separate repo, branch main): `/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain/README.md`.

**Source of truth:** the final `src/data/content.json` on this branch (hero, Kafi bullets, skills, aiWorkflow).

**CV changes (only these):**
- Header role line: `Full-stack Software Engineer`.
- Summary: `Full-stack software engineer with nearly 3 years of experience building products end to end: React frontends, Node.js and Go services, and AWS infrastructure. Helped deliver 10+ online marketplace platforms; now building real-time trading systems at Kafi Securities while studying for a Master's in AI. Strong focus on reliability, performance and long-term maintainability.`
- Core Skills rows: replace `AI & OpenAI API` with `AI \& LLM & OpenAI API, embeddings \& semantic search, RAG, QLoRA fine-tuning, vLLM, LLM evaluation`; add row `AI-assisted Eng. & Claude Code, multi-agent workflows, context engineering, MCP, agent hooks \& skills`; Tools: `Git, Sentry, Trello`.
- Kafi entry: the stack line + the 4 Kafi bullets, text identical to `content.json` (LaTeX-escaped).
- **Master's GPA update (Khang, 2026-11-15, new transcript):** `9.07/10` → `8.71/10` everywhere it appears — CV education line (`Current average: 8.71/10`), `content.json` `education.degrees[0].gpa` and the hero stat label (`GPA 8.71/10, in progress`), README Education. (8.71 = credit-weighted average of the 8 major courses, 278.8 / 32 credits, Philosophy excluded per Khang.) Grep the whole repo and the README for `9.07` afterwards — zero hits.
- Nothing else changes. **Must stay 1 page.** If it overflows: first tighten spacing (`\sect` vspace, itemsep, `\linespread`, margins by ≤0.05in); if still 2 pages, stop and report BLOCKED with the overflow amount — do not cut content on your own.

**OG image:** same look as today (dark navy background, round avatar from `public/assets/avatar.webp`, name, role, location), role text `Full-stack Software Engineer`. Render an HTML template with Playwright at 1200×630 (template and script in the scratchpad, not the repo).

**README (other repo):** mirror the CV changes: title/role line, Summary, Core Skills (AI & LLM badges plain where no Simple Icons logo, new AI-assisted Engineering group, Claude moves there; check every `logo=` slug renders with `curl -s "https://img.shields.io/badge/x-black?logo=<slug>" | grep -c '<image'`), Kafi experience bullets. Commit there separately.

- [ ] **Step 1:** Implement CV, build PDF in the scratchpad (`latexmk -pdf -outdir=$SCRATCH/cv`), copy to both paths.
- [ ] **Step 2: Verify:** `pdfinfo` Pages: 1; `pdftotext` contains the new role, summary, AI rows and all 4 Kafi bullets; `pdfinfo -url` still lists the 3 links; `cmp` of the two PDFs silent; view a PNG render of the PDF (`pdftoppm -png -r 80`) and the new OG image with Read.
- [ ] **Step 3: Commit** in the portfolio repo: `cv: full-stack positioning, Kafi highlights, AI skills; refresh OG image`.
- [ ] **Step 4:** README: write, check links (200; LinkedIn may be blocked) and badge logos, grep that no stale `Fullstack|Robotics|YOUR_PORTFOLIO` text exists; commit `docs: sync profile README with updated CV`.
