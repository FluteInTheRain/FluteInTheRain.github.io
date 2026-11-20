# DDIA Post 1 Review Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/blog/reliable-scalable-maintainable-data-systems/quiz/`: 8 case sets × 5 bilingual multiple-choice questions, graded immediately, easy to hard.

**Architecture:** Quiz content is JSON (one file per case set) validated by a Node test. A static Astro page renders every set and question in both languages (the site's existing `data-lang-en` / `data-lang-vi` spans do the switching), and a small client script turns it into a one-question-at-a-time player with immediate grading. Without JavaScript the page shows everything, answers included.

**Tech Stack:** Astro 7 (static), TypeScript, `node:test` run as `node --test <file>.ts` (Node 26 strips types; same as `src/utils/blog-index.test.ts`), `github-slugger` (already in `node_modules`), site CSS tokens in `src/styles/style.css`.

**Spec:** `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md` (rules, blueprint, the 8 sets, level and track table). Format example: `docs/superpowers/specs/2026-11-20-ddia-quiz-sample-case.md`.

## Global Constraints

- Branch `feat/ddia-quiz-ch2`, cut from `main`. Do not stage unrelated files: `src/data/series.ts`, `.claude/skills/**`, and the three `src/assets/blog/go-*` folders were already modified or untracked before this work.
- Every user-visible string is `{ en, vi }`. Code, file paths and shell commands are not translated.
- Colours come from CSS tokens (`var(--bg)`, `var(--text)`, `var(--border)`, ...), never hex. Both light and dark themes must work.
- Do not edit shared components (`AnimatedFlow`, `Figure`, `DemoFrame`, `DiagramIcon`). Icons come only from `src/data/diagram-icons.ts` through `DiagramIcon`.
- 8 sets × 5 questions = 40. Within a set, `difficulty` never decreases (1 to 5). Sets are shown sorted by average difficulty.
- Totals across the 40: Remember 3, Understand 7, Apply 14, Analyze 9, Evaluate 7; `track` interview 20, ai 20; `multi` type exactly 4 (sets 4, 6, 7, 8).
- Each question has 4 options (5 for `multi`), no "all/none of the above", no NOT-style negatives, one answer (two for `multi`), and a `whyWrong` entry for every wrong option naming the misconception.
- Calculation questions state every formula inside the question. Invented figures are labelled illustrative. Every computed answer is verified by running code, recorded in `verifiedBy`.
- A question must be answerable from its set's scenario alone; no stem may contain or imply another question's answer.
- Interview-style questions are asked directly. No "an interviewer asks…" framing in any stem.
- `localStorage` is only a convenience: every read and write is in try/catch and the page works without it.
- Facts beyond the post need an external source in `ref`, not a blog's unverified numbers.

## Review Focus

- A reader without JavaScript still sees the questions, options and explanations (progressive enhancement); the player must not hide content before the script runs.
- `localStorage` throws or is empty (private window): the quiz runs, progress is just not saved. Tested by passing a throwing storage object to the persistence functions.
- Multi-select: only an exact match of the chosen set is correct; one right plus one wrong is wrong.
- Switching language in the middle of a quiz keeps the selected answers and the open explanation (both languages are in the DOM; nothing re-renders).
- The correct answer must not sit at a predictable position: options are shuffled deterministically per question id, and the authored data is checked so that no single authored position holds more than half of the answers in a set.
- A post with no quiz data gets no `/quiz/` route and no link; a draft post gets neither in production.
- An unknown `media.component` name fails the build loudly instead of rendering nothing.

## File Structure

| File | Responsibility |
|---|---|
| `src/data/quiz/types.ts` | Types for sets, questions, media |
| `src/utils/quiz.ts` | Pure functions: `validateSet`, `orderSets`, `shuffleOptions`, `gradeAnswer`, `scoreByLevel`, storage wrapper |
| `src/utils/quiz.test.ts` | Unit tests for the pure functions plus the content validation over every JSON file |
| `src/data/quiz/_fixtures/sample-case.json` | The sample case set as a fixture (not published) |
| `src/data/quiz/<post-slug>/set-01.json` … `set-08.json` | The content, one file per set |
| `src/data/quiz/index.ts` | `loadQuizSets(slug)` with `import.meta.glob`, `hasQuiz(slug)` |
| `src/components/quiz/figures/*.astro` | One SVG figure per set, auto-registered by filename |
| `src/components/quiz/QuizMedia.astro` | Renders a `media` item (figure by name, or code block) |
| `src/components/quiz/QuizQuestion.astro`, `QuizSet.astro`, `QuizSummary.astro` | Markup |
| `src/pages/blog/[id]/quiz.astro` | The route |
| `src/scripts/quiz.ts` | Client player (DOM wiring only; logic lives in `utils/quiz.ts`) |
| `src/styles/style.css` | `.quiz-*` rules appended at the end |
| `src/components/quiz/QuizCta.astro` | Link card rendered by `blog/[id].astro` when `hasQuiz(post.id)` |

## Interfaces (shared by all tasks)

```ts
// src/data/quiz/types.ts
export interface L10n { en: string; vi: string }
export type Level = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate';
export type Track = 'interview' | 'ai';
export type QType = 'single' | 'scenario' | 'diagram' | 'code-output' | 'ai-review' | 'ai-advice' | 'multi';
export type QuizMedia =
  | { kind: 'figure'; component: string; alt: L10n }       // component = file name in components/quiz/figures, no extension
  | { kind: 'code'; lang: string; code: string; caption?: L10n };
export interface QuizOption { id: string; text: L10n }
export interface QuizQuestion {
  id: string;                       // "s04q3"
  level: Level; track: Track; type: QType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  topic: string;                    // post section it grows from
  stem: L10n;
  media?: QuizMedia[];
  options: QuizOption[];            // ids "a".."e"
  answer: string[];                 // option ids; length 1, or 2 for type "multi"
  explanation: {
    whyRight: L10n;
    whyWrong: Record<string, L10n>; // one key per wrong option id
    reread: { anchor: string; label: L10n };  // anchor = heading slug in the post
    say: L10n;                      // one spoken line, or a review habit for AI questions
  };
  ref: string;                      // post section name, or an external URL for anything beyond the post
  verifiedBy?: string;              // command run and its output, required when the question computes something
}
export interface QuizSet {
  id: string;                       // "set-04"
  title: L10n;
  context: { text: L10n; illustrative?: boolean; media?: QuizMedia[] };
  questions: QuizQuestion[];        // exactly 5
}
```

```ts
// src/utils/quiz.ts
export function validateSet(set: QuizSet, postAnchors: Set<string>): string[];   // returns problems; [] when valid
export function orderSets(sets: QuizSet[]): QuizSet[];                           // by mean difficulty, then id
export function shuffleOptions<T extends { id: string }>(options: T[], seed: string): T[];  // deterministic, same ids
export function gradeAnswer(q: Pick<QuizQuestion, 'answer'>, chosen: string[]): { correct: boolean; wrong: string[]; missed: string[] };
export function scoreByLevel(results: { level: Level; correct: boolean }[]): Record<Level, { right: number; total: number }>;
export interface Store { getItem(k: string): string | null; setItem(k: string, v: string): void }
export function loadProgress(store: Store | null, key: string): Record<string, string[]>;   // never throws
export function saveProgress(store: Store | null, key: string, p: Record<string, string[]>): void; // never throws
```

---

### Task 1: Types, pure functions and content validation

**Files:**
- Create: `src/data/quiz/types.ts`, `src/utils/quiz.ts`, `src/utils/quiz.test.ts`, `src/data/quiz/_fixtures/sample-case.json`

**Interfaces:**
- Produces: everything in the two blocks above.

- [ ] **Step 1: Write failing tests in `src/utils/quiz.test.ts`**
  - `gradeAnswer` single: chosen `['b']` vs answer `['b']` → `{correct:true, wrong:[], missed:[]}`; chosen `['a']` → `wrong:['a'], missed:['b']`.
  - `gradeAnswer` multi: answer `['a','c']`; chosen `['a']` → incorrect, `missed:['c']`; chosen `['a','c']` → correct; chosen `['a','c','d']` → incorrect, `wrong:['d']`; chosen `[]` → incorrect.
  - `shuffleOptions`: same seed gives the same order twice; the returned ids are a permutation of the input; two different seeds across 20 question ids produce at least 3 distinct orders.
  - `orderSets`: sets with mean difficulty 3.0, 2.0, 2.0 (ids `set-03`, `set-02`, `set-01`) come back as `set-01`, `set-02`, `set-03`.
  - `scoreByLevel`: counts right and total per level, all five keys present even when empty.
  - `loadProgress(null, 'k')` → `{}`; a store whose `getItem` throws → `{}`; a store holding invalid JSON → `{}`; round trip with `saveProgress`; `saveProgress` with a throwing `setItem` does not throw.
  - `validateSet` on the fixture returns `[]`; and returns a problem string for each of: 4 questions instead of 5, difficulty decreasing, answer id not in options, a wrong option with no `whyWrong`, empty `vi`, `multi` with one answer, `single` with two answers, option text containing "all of the above" / "none of the above", a stem starting with "An interviewer", `verifiedBy` missing when `type` is `code-output`, an unknown `reread.anchor`, more than half of a set's answers sharing one authored position.
  - Content test: for every file matching `src/data/quiz/*/set-*.json` (skip `_fixtures`), parse, `validateSet` against the heading slugs of `src/content/blog/<slug>.mdx` (collect `##`/`###` lines, slug with `github-slugger`), expect `[]`. When the folder has all 8 sets, also assert the totals in Global Constraints (levels, tracks, 4 multi).

- [ ] **Step 2: Run** `node --test src/utils/quiz.test.ts` → FAIL (module not found).

- [ ] **Step 3: Implement** `types.ts` as given; `quiz.ts` with the signatures above. `shuffleOptions` uses a string hash seeding a small PRNG (mulberry32) and a Fisher-Yates pass. `validateSet` collects all problems, it does not stop at the first. Create `sample-case.json` by converting `docs/superpowers/specs/2026-11-20-ddia-quiz-sample-case.md` (its 5 questions, illustrative numbers flagged, `verifiedBy` on Q3 with the simulation output `240 s`, `reread.anchor` values set to real slugs of the post, `media` figure `component: "SampleQueue"` is not needed: use `kind:'code'` or omit).

- [ ] **Step 4: Run** `node --test src/utils/quiz.test.ts` → PASS.

- [ ] **Step 5: Commit** `git add src/data/quiz src/utils/quiz.ts src/utils/quiz.test.ts && git commit -m "feat(quiz): types, grading and content validation"`

### Task 2: Loader, route, markup and styles (no script yet)

**Files:**
- Create: `src/data/quiz/index.ts`, `src/components/quiz/QuizMedia.astro`, `QuizQuestion.astro`, `QuizSet.astro`, `QuizSummary.astro`, `QuizCta.astro`, `src/components/quiz/figures/SampleFigure.astro`, `src/pages/blog/[id]/quiz.astro`
- Modify: `src/pages/blog/[id].astro` (render `<QuizCta>` after `<div class="prose">` when `hasQuiz(post.id)`), `src/styles/style.css` (append `.quiz-*`)

**Interfaces:**
- Consumes: Task 1 types and `orderSets`, `shuffleOptions`.
- Produces: `loadQuizSets(slug: string): QuizSet[]` (already ordered), `hasQuiz(slug: string): boolean`; the DOM contract used by Task 3 (below).

DOM contract: root `<main class="quiz" data-quiz data-post="<slug>">`; each set `<section class="quiz-set" data-set="set-04">`; each question `<article class="quiz-q" data-q="s04q3" data-type="single|multi" data-answer="b" data-level="apply">` (`data-answer="a,c"` for multi) holding `<ol class="quiz-options">` with `<li><button type="button" class="quiz-opt" data-opt="a">`; the explanation is `<div class="quiz-explain" hidden>`; a `<div class="quiz-summary">` after the last set. Every question and explanation is present in the HTML, visible by default; the class `js-quiz` on `<main>` (added by the script) is what hides future questions.

- [ ] **Step 1: Test** `src/utils/quiz.test.ts`: add `loadQuizSets` is not unit-tested (uses `import.meta.glob`); instead add the checks to Step 4.
- [ ] **Step 2: Implement** `index.ts` with `import.meta.glob('./*/set-*.json', { eager: true })`, grouped by folder name, ordered with `orderSets`. `QuizMedia.astro` resolves `figure` through `import.meta.glob('./figures/*.astro', { eager: true })`; an unknown `component` throws an `Error` naming the missing file.
- [ ] **Step 3: Implement** the route with `getStaticPaths` over published posts for which `hasQuiz(post.id)`; the page shows title, a "N of 40" progress area, then the sets via `QuizSet`. Rendering: option order from `shuffleOptions(q.options, q.id)`, all text via `<T>`-style spans (`data-lang-en` / `data-lang-vi`). Layout/Nav/Footer as in `src/pages/blog/[id].astro`.
- [ ] **Step 4: Verify** `npm run build` succeeds and `dist/blog/reliable-scalable-maintainable-data-systems/quiz/index.html` does not exist yet (no content), while a temporary copy of the fixture placed in `src/data/quiz/<slug>/set-01.json` produces the page; remove the temp copy after the check. Expected: HTML contains `data-quiz`, 5 `data-q` entries, both `data-lang-en` and `data-lang-vi`.
- [ ] **Step 5: Commit** `git commit -m "feat(quiz): route, markup and styles"` (stage only the files listed in this task).

### Task 3: Client player

**Files:**
- Create: `src/scripts/quiz.ts`
- Modify: `src/pages/blog/[id]/quiz.astro` (load the script)

**Interfaces:**
- Consumes: the DOM contract of Task 2; `gradeAnswer`, `scoreByLevel`, `loadProgress`, `saveProgress`.

Behaviour: on load add `js-quiz` to `<main>`, restore progress, show the first unanswered question. Click an option (single) grades at once: mark `is-right` / `is-wrong`, reveal the correct one, open `.quiz-explain`, lock the question. For `multi`, options toggle and a "Check" button grades. "Next" shows the following question and scrolls the scenario into view. A progress bar and per-set and total score, with the score by level, appear in `.quiz-summary` at the end, with "retry wrong ones" and "reset". Key `quiz:<slug>` in `localStorage` holds `{ [questionId]: chosenIds }`.

- [ ] **Step 1: Implement** `quiz.ts` (DOM wiring only).
- [ ] **Step 2: Verify in the browser** with `npx astro dev --port 4331` and a temp fixture copy: answer a single question wrong, then right in another; a multi with one right plus one wrong is marked wrong; reload keeps answers; toggle the site language mid-quiz (selected answers stay); block storage (DevTools → disable site data) and confirm the quiz still runs. Screenshot light EN, light VI and dark VI (`scripts/figures/figshot.sh` style) and read the crops.
- [ ] **Step 3: Verify without JS**: `curl` the built page and confirm every question and every explanation is in the HTML.
- [ ] **Step 4: Commit** `git commit -m "feat(quiz): client player with immediate grading"`

### Task 4: Authoring brief for the content tasks

**Files:**
- Create: `docs/superpowers/specs/2026-11-20-ddia-quiz-authoring-brief.md`

- [ ] **Step 1: Write the brief** (one page): the Global Constraints that matter to an author; the JSON shape with `sample-case.json` as the example; where to put files; how to verify (`node --test src/utils/quiz.test.ts`, then the figure screenshot via `scripts/figures/figshot.sh`); the numbers rule (compute with code, put the command and output in `verifiedBy`); the rule that a figure is drawn as an inline SVG Astro component with tokens only; the exact slots of the set from the spec's level/track table; the post's heading slugs as the allowed `reread.anchor` values (generate the list with the same slug code as the test and paste it in).
- [ ] **Step 2: Commit** `git commit -m "docs(quiz): authoring brief for the 8 case sets"`

### Tasks 5 to 12: Content sets 1 to 8

One owning agent per set, Sonnet, waves of at most 8. Each set is its own task with identical steps; only the scenario, topics and slots differ (all in the spec table "The 8 case sets").

| Task | Set | Files it creates |
|---|---|---|
| 5 | 1 The green dashboard | `set-01.json`, `figures/GreenDashboard.astro` |
| 6 | 2 Disk in rack 14 | `set-02.json`, `figures/DiskRack.astro` |
| 7 | 3 A page that calls 100 services | `set-03.json`, `figures/HundredServices.astro` |
| 8 | 4 The feed that melted the database | `set-04.json`, `figures/FeedJoinLoad.astro` |
| 9 | 5 The code nobody dares touch | `set-05.json`, `figures/DependencyTangle.astro` |
| 10 | 6 Friday config push | `set-06.json`, `figures/RolloutTimeline.astro` |
| 11 | 7 One slow server in a hundred | `set-07.json`, `figures/HedgeTimeline.astro` |
| 12 | 8 The second replica died too | `set-08.json`, `figures/FailoverCascade.astro` |

(all `set-0N.json` live in `src/data/quiz/reliable-scalable-maintainable-data-systems/`; all figures in `src/components/quiz/figures/`)

- [ ] **Step 1:** Read the authoring brief, the spec, `sample-case.json`, and the post sections the set cites.
- [ ] **Step 2:** Write `set-0N.json` following the slot table (level, track, type, difficulty per question) with a real `ref` for anything beyond the post. For every computed answer, run the code and paste the command and output into `verifiedBy`.
- [ ] **Step 3:** Draw the figure as `figures/<Name>.astro` (inline SVG, tokens only, light and dark).
- [ ] **Step 4:** Run `node --test src/utils/quiz.test.ts` → PASS for this set.
- [ ] **Step 5:** With `npx astro dev` running, screenshot the figure in light EN, light VI and dark VI; read the crops; fix what shows. Then commit `git commit -m "feat(quiz): set N <name>"` staging only this set's two files.

Review Focus tests owned by these tasks: the answer-position check (inside `validateSet`, Task 1), the no-"interviewer" stem check (Task 1), unknown figure name fails the build (Task 2).

### Task 13: Fact review and whole-quiz check

**Files:**
- Modify: whichever set files a finding touches

- [ ] **Step 1:** One reviewer agent (Sonnet) gets `git diff main...HEAD -- src/data/quiz` and the post. It checks facts only: every number in a stem or explanation against the post or its `ref`, each `verifiedBy` rerun, each wrong option really wrong, each `whyWrong` naming a real misconception, EN/VI meaning parity, independence inside each set, figures against their set's numbers. No pixel opinions.
- [ ] **Step 2:** Verify each finding yourself before changing anything (receiving-code-review). Fix confirmed ones.
- [ ] **Step 3:** Run `node --test src/utils/quiz.test.ts` (full totals: levels 3/7/14/9/7, tracks 20/20, 4 multi) and `npm run build`. Expected: both pass, `dist/blog/reliable-scalable-maintainable-data-systems/quiz/index.html` exists.
- [ ] **Step 4:** Walk the whole quiz in the browser once (`npx astro dev`), including the end summary, retry-wrong and reset.
- [ ] **Step 5: Commit** `git commit -m "fix(quiz): fact review corrections"`; then hand the branch to the user for review before merging to `main`.

### Task 14: Wrap-up notes

- [ ] **Step 1:** Add the work-log entry (`/Users/nguyennhatkhang/.claude/work-log/khang-work-log.md`, new project section if needed) and save the knowledge note with the `kb` skill (decision: case-set quiz format, calculation questions state formulas, no interviewer framing). Only after the user says the work is done.
