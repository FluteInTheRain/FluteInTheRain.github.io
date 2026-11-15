# Projects Tabs + Master-Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the long single-column Projects section with Company/Personal tabs and a
list-left / detail-right layout, and rewrite the GitHub profile README to mirror the CV.

**Architecture:** Server-render everything in `Projects.astro` (both tab panels, every project
button and every detail panel, all visible). A small client script adds `.is-enhanced` to the
section, then hides unselected tabs/panels and wires clicks + keyboard. Layout is pure CSS grid:
list items in column 1, each detail panel in column 2 spanning all list rows, so no DOM moving is
needed and on phone the same markup becomes an accordion.

**Tech Stack:** Astro 7, plain TypeScript client script, CSS in `src/styles/style.css`. No new deps.

**Spec:** `docs/superpowers/specs/2026-11-15-projects-master-detail-design.md`

## Global Constraints

- No change to `src/data/content.json` schema or content.
- No new npm dependencies. Build must pass with `npm run build` (CI uses Node 24).
- Without JS, and when printing, every project's full detail is visible.
- Existing `#projects` anchors keep working (section id stays `projects`).
- Use existing design tokens (`--red`, `--border`, `--card-bg`, `--text-faint`...) for both themes.
- Phone breakpoint: `max-width: 768px` (matches existing media query at `style.css:950`).

## Review Focus

1. Only one group has items (e.g. no personal projects): no tab bar, list+detail still works.
2. A tab with a single project: list shows one row, detail shows it, nothing breaks.
3. Detail much taller than the list (Vennu, WhyLoop with video): list rows stay compact at the top,
   they must not stretch to fill the panel height.
4. Switching away from WhyLoop while its video plays: the video pauses.
5. Theme toggle dark/light while a project is selected: selected-row styling stays readable.

Each is pinned in Task 3's verification steps.

---

### Task 1: Branch and baseline

**Files:** none changed.

- [ ] **Step 1:** `git switch -c feat/projects-master-detail` (from `main`).
- [ ] **Step 2:** `npm ci` then `npm run build`. Expected: build succeeds, `dist/index.html` exists.

### Task 2: Server-rendered markup

**Files:**
- Modify: `src/components/Projects.astro` (rewrite)
- Modify: `src/components/ProjectCard.astro` (becomes detail body only: drop outer `.card`
  wrapper class `project-card` → `project-detail`; content unchanged)

**Interfaces — Produces (DOM contract used by Task 3 script and CSS):**
- `section#projects.projects` with `data-projects` attribute.
- Tab bar (only when both groups non-empty): `div.proj-tabs[role=tablist]` containing
  `button.proj-tab[role=tab][id=proj-tab-{group}][aria-controls=proj-panel-{group}][aria-selected]`,
  label `"{label} · {count}"` where label is `p.company.label` / `p.personal.label`.
  `{group}` ∈ `company | personal`. Company tab first and selected.
- Per group: `div.proj-panel[role=tabpanel][id=proj-panel-{group}][aria-labelledby=proj-tab-{group}]`
  containing `div.proj-grid` with inline style `--rows: {N}` where N = count of column-1 children.
- Column-1 children of `.proj-grid`, in order:
  - `p.proj-org-heading` before the first project of each distinct `org` (company group only);
  - `button.proj-item[type=button][id=proj-item-{group}-{i}][aria-controls=proj-detail-{group}-{i}][aria-selected]`
    with `span.proj-item-title` (= `title`) and `span.proj-item-meta` (= first 3 `tags` joined `" · "`);
  - each button is immediately followed by its `div.proj-detail-panel[id=proj-detail-{group}-{i}][role=region][aria-labelledby=proj-item-{group}-{i}]`
    wrapping `<ProjectCard p={item} />`.
- First item of each group has `aria-selected="true"`, others `"false"`.

- [ ] **Step 1: Implement the markup above.** Group headings: iterate items, emit heading when
  `item.org` differs from previous. Personal group gets no headings (all "Open Source").
- [ ] **Step 2: Verify build output.**

Run:
```bash
npm run build && node -e '
const h=require("fs").readFileSync("dist/index.html","utf8");
const c=(re)=>(h.match(re)||[]).length;
const ok=[
 ["tabs",c(/role="tab"/g)===2],
 ["panels",c(/role="tabpanel"/g)===2],
 ["items",c(/class="proj-item"/g)===9],
 ["details",c(/class="proj-detail-panel"/g)===9],
 ["selected",c(/class="proj-item"[^>]*aria-selected="true"/g)===2],
 ["orgHeading",c(/class="proj-org-heading"/g)===1],
 ["bulletsInHtml",h.includes("Off-session payments")&&h.includes("Pixel-level layout lint")],
];console.log(ok);process.exit(ok.every(x=>x[1])?0:1)'
```
Expected: all `true`, exit 0. (If attribute order differs, adjust the regexes, not the contract.)

- [ ] **Step 3: Commit** `feat(projects): server-render tabs and project list/detail markup`.

### Task 3: Layout CSS + client behaviour

**Files:**
- Create: `src/scripts/projects.ts`
- Modify: `src/layouts/Layout.astro:99-101` (import `../scripts/projects.ts` next to `ui.ts`)
- Modify: `src/styles/style.css` — replace the `/* ---------- Projects ---------- */` block
  (`.projects-grid`, `.project-card` rules ~line 697) and its phone overrides (~line 1181);
  keep `.project-title/-org/-desc/-video/-bullets/-tags/-links` rules for the detail body.

**Interfaces — Consumes:** Task 2 DOM contract.

**CSS decisions (only under `.projects.is-enhanced`; un-enhanced = plain stacked flow):**
- `.proj-grid`: `display:grid; grid-template-columns: 280px 1fr; grid-template-rows: repeat(var(--rows), auto) 1fr; column-gap: 28px; align-items: start`.
- Column-1 children: `grid-column: 1`. `.proj-detail-panel`: `grid-column: 2; grid-row: 1 / span calc(var(--rows) + 1)`
  — if `calc()` in `span` is not supported in the build, emit the span inline from Astro instead
  (`style="grid-row: 1 / span {N+1}"`). The trailing `1fr` row absorbs extra detail height so list
  rows stay compact (Review Focus 3).
- `.proj-detail-panel:not(.is-open)` and `.proj-panel:not(.is-active)`: `display:none`.
- `.proj-item[aria-selected=true]`: left border 3px `var(--red)`, background `var(--red-tint-bg)`
  (check the dark-theme value exists; add one under the dark token block if not).
- `@media (max-width: 768px)`: `.proj-grid { grid-template-columns: 1fr; grid-template-rows: none }`,
  panel `grid-column: auto; grid-row: auto` → panel flows under its button (accordion).
- `@media print`: show all `.proj-panel` and `.proj-detail-panel`, hide `.proj-tabs`.

**Script `src/scripts/projects.ts` (no exports; runs on load):**
- For each `[data-projects]` section: add `is-enhanced`; mark first tab panel `is-active` and the
  `aria-selected=true` item's panel `is-open`.
- Tab click → `selectTab(group)`: set `aria-selected`, `tabindex` (roving, 0 on selected / -1 others),
  toggle `is-active`. ArrowLeft/ArrowRight/Home/End on tabs move + select + focus.
- Item click → `selectItem(button)` within its panel: deselect others, open its detail, pause any
  `video` inside panels being closed. On phone (`matchMedia('(max-width: 768px)')`), clicking the
  already-open item collapses it (sets `aria-selected=false`, removes `is-open`); on desktop it is a no-op.
- ArrowUp/ArrowDown on `.proj-item` moves focus + selection to previous/next item in the same panel.

- [ ] **Step 1: Implement CSS and script.**
- [ ] **Step 2: Build check.** `npm run build` succeeds; Task 2 Step 2 command still exits 0.
- [ ] **Step 3: Rendered-DOM check with JS.** `npm run preview -- --port 4321` in background, then
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --dump-dom http://localhost:4321/ \
 | node -e 'const h=require("fs").readFileSync(0,"utf8");
 const ok=[["enhanced",/class="[^"]*projects[^"]*is-enhanced/.test(h)],
 ["oneActivePanel",(h.match(/proj-panel[^"]*is-active/g)||[]).length===1],
 ["twoOpenDetails",(h.match(/proj-detail-panel[^"]*is-open/g)||[]).length===2]];
 console.log(ok);process.exit(ok.every(x=>x[1])?0:1)'
```
Expected: all `true` (one open detail per group, one active tab).
- [ ] **Step 4: Visual check** (headless screenshots at 1440×900 and 390×844, light + dark):
  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --window-size=1440,900 --screenshot="$SCRATCH/desk.png" http://localhost:4321/#projects
  ```
  (`$SCRATCH` = the session scratchpad directory; never write screenshots into the repo). Confirm by eye: Review Focus 3 (list rows compact beside the
  tall Vennu/Localmingo detail), selected-row style readable in dark (Review Focus 5), phone layout
  shows button-then-detail.
- [ ] **Step 5: Interaction check in a real browser** (`npm run dev`): switch tabs with mouse and
  arrow keys; arrow up/down through items; play WhyLoop video then select another project → video
  paused (Review Focus 4); at 390px width tap open item → collapses. Temporarily empty
  `personal.items` in a scratch copy is NOT needed: instead verify Review Focus 1–2 by reading the
  conditional in `Projects.astro` (tab bar rendered only when both groups non-empty; single-item grid
  has `--rows` = 1 or 2). Do not commit any content change.
- [ ] **Step 6: Commit** `feat(projects): tabbed master-detail layout with phone accordion`.

### Task 3b: Fix the bachelor's degree in the CV

The CV disagrees with the website; the website is correct (Khang, 2026-11-15).

**Files:**
- Modify: `cv/Khang-Nguyen-CV.tex` — the `\subentry{Bachelor's Degree in Information Technology -- Grade: 8.90/10}{Sep 2020 -- Sep 2024}`
  line becomes `\subentry{B.Sc. in Software Engineering -- Grade: 8.90/10}{Sep 2020 -- Jul 2024}`. Nothing else.
- Regenerate: `cv/Khang-Nguyen-CV.pdf` and copy it to `public/assets/Khang-Nguyen-CV.pdf`
  (the two files are byte-identical today and must stay so).

- [ ] **Step 1:** Edit the line.
- [ ] **Step 2:** Build in a scratch dir so aux files never land in the repo:
  `latexmk -pdf -interaction=nonstopmode -outdir="$SCRATCH/cv" cv/Khang-Nguyen-CV.tex`, then copy
  `$SCRATCH/cv/Khang-Nguyen-CV.pdf` to both PDF paths.
- [ ] **Step 3: Verify:** `pdftotext` (or `mdls`/`strings` fallback) shows "B.Sc. in Software
  Engineering" and "Jul 2024"; PDF is still 1 page (`pdfinfo` Pages: 1 if available);
  `cmp cv/Khang-Nguyen-CV.pdf public/assets/Khang-Nguyen-CV.pdf` is silent; `git status` shows only
  the .tex and two .pdf files changed.
- [ ] **Step 4: Commit** `fix(cv): correct bachelor's degree title and end date`.

### Task 4: Profile README mirrors the CV

**Files:**
- Modify: `/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain/README.md` (separate repo
  `FluteInTheRain/FluteInTheRain`, branch `main`; ask before pushing).

**Content (in this order; facts copied from `cv/Khang-Nguyen-CV.tex` and `content.json` only):**
1. `# Hi, I'm Khang Nguyen` + "Software Engineer · Web Engineer at Kafi Securities" + one-line
   location; links row: Portfolio `https://fluteintherain.github.io`, CV
   `https://fluteintherain.github.io/assets/Khang-Nguyen-CV.pdf`, LinkedIn, Email.
2. **Summary** — CV summary paragraph verbatim.
3. **Core Skills** — the CV's 6 groups (Languages, Web Development, Data & Messaging, AI,
   Cloud & DevOps, Tools) as shields.io badges (`style=flat-square`, `logo=` where one exists,
   plain badge otherwise). Every CV item appears exactly once.
4. **Experience** — Kafi Securities (Web Engineer, Oct 2026 – Present, tech stack line);
   JourneyHorizon (Associate Software Engineer, Mar 2024 – Sep 2026, 4 bullets verbatim).
5. **Selected Projects** — table: Project | What | Stack | Link. Company: Localmingo, GearShare,
   Boldly, Vennu. Personal: WhyLoop, AI-Powered Automated Grading, Internal Knowledge Chatbot,
   Real vs. Fake Face Detection, Document Scanner. "What" = the `desc` shortened to one sentence;
   Stack = first 4 tags; link = first `links[].href`. End with "Details on my portfolio →".
6. **Education** — Master of Artificial Intelligence (VNUHCM – University of Science,
   Dec 2025 – Present, 9.07/10); B.Sc. in Software Engineering (VNUHCM – University of Science,
   Sep 2020 – Jul 2024, 8.90/10). The website wording is correct (Khang, 2026-11-15); Task 3b fixes the CV.
7. **Certifications** — AWS Certified Developer – Associate (Jul 2025, Credly link from
   `content.json`); TOEIC L&R 860 (Jul 2025), S&W 290 (Sep 2023).

Remove everything else (research interests, Python class block, fun facts, closing quote).

- [ ] **Step 1:** Write the README.
- [ ] **Step 2: Verify** every link returns 200 and no stale terms remain:
```bash
cd ../FluteInTheRain && grep -nE 'Robotics|Reinforcement|YOUR_PORTFOLIO|Fullstack|matcha' README.md; \
grep -oE 'https://[^) ]+' README.md | sort -u | grep -v img.shields.io | while read u; do echo "$(curl -s -o /dev/null -w '%{http_code}' -L "$u") $u"; done
```
Expected: grep prints nothing; every URL `200` (LinkedIn may return `999` to bots — acceptable).
- [ ] **Step 3: Commit** in that repo: `docs: update profile README to match CV and portfolio`.

### Task 5: Finish

- [ ] Whole-branch review of the portfolio diff (`git diff main...HEAD`), then
  superpowers:finishing-a-development-branch. Push/PR for both repos only after Khang confirms.
