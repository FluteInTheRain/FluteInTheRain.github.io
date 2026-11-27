# Authoring brief: UI/UX series quizzes (one agent owns one post's quiz)

Nine posts of the `refactoring-ui` series get a review quiz (matrix v2, `human` domain). One Sonnet agent per post,
working in `/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io`, branch `feat/uiux-quiz`.
Eight other agents work in the same tree on the other posts at the same time.

## Sizes (already declared in `src/data/quiz/domains.ts`)

| Slug | Questions | Sets |
|---|---|---|
| `visual-hierarchy-rank-before-you-style`, `spacing-is-a-system`, `typography-is-a-scale-not-a-slider`, `color-is-a-palette-not-a-picker`, `depth-is-light-not-drop-shadow`, `images-need-containers-not-hope` | 40 | 8 x 5 |
| `design-before-you-prompt`, `finishing-touches-that-make-ui-feel-real`, `leveling-up-your-design-eye` | 20 | 4 x 5 |

## Your files (create ONLY these)

- `src/data/quiz/<slug>/set-01.json` ... (`set-08` for 40 questions, `set-04` for 20)
- `src/components/quiz/figures/Uxq<NN><Name>.astro`, `<NN>` = your post's number in `src/data/series.ts` (order of `parts`, two digits). Pictures only where the question needs one: 4-6 for a 40-question post, 2-3 for a 20-question post.

Do NOT edit anything else (`domains.ts` and `series.ts` are done). Do not commit, stage, stash, checkout or reset. Do not run `npm run build` or start a dev server (the lead builds once at the end).

## Read first

1. `AGENTS.md` (quiz rules: human-skill posts use tracks `interview` and `case` only, no AI questions; no "illustrative" or "minh hoa" labels; any invented number states its assumption in the sentence; `context.text` is short lines, one idea per line, bullets `• `, never one block).
2. `docs/superpowers/specs/2026-11-26-quiz-matrix-v2.md`, `src/data/quiz/matrix.ts` (targets for 20 or 40: levels, kinds, perTrack, multi), `src/data/quiz/types.ts`.
3. Your post `src/content/blog/<slug>.mdx` in full. Questions grow out of what the post teaches and shows. `reread.anchor` is a real English heading slug of the post; `ref` is a post section name.
4. Format examples: `src/data/quiz/margin-trading-risks-beginner-psychology/set-01.json` and `set-02.json` (a v2 human 40-question quiz) and `src/data/quiz/portfolio-dca-first-investment-plan/set-01.json` (20 -> 40). Copy the JSON shape. Figure media example: `src/components/quiz/figures/Sbq08BandRuler.astro` and how `media` refers to it (`{ "kind": "figure", "component": "<file name without .astro>", "alt": {en, vi} }`).

## Rules

- **Design questions must be about seeing.** The series' point is that every idea is shown. A question about spacing, hierarchy, type, colour, depth or images should usually put the two options in front of the reader as a drawn mock (a figure) or describe the mock precisely with real values (px, rem, hex written as numbers in text is fine, hue/saturation/lightness, line-height ratios, contrast ratios you computed). Do not ask "which sounds better" without something to look at.
- **Real cases first** for `case` sets where the post gives one (a real product screen, a real redesign, a real number). Never invent a company event. If a number is made up, say "assume" in the sentence.
- **Calculations** (type scales, contrast ratios, spacing steps, line-height, shadow offsets) need `verifiedBy`: the exact command you ran (node or python, in the scratchpad dir `/private/tmp/claude-502/-Users-nguyennhatkhang-Downloads-learning-FluteInTheRain-github-io/bd48f502-4863-4cc3-b8ee-2fe4fab2ef45/scratchpad`) and its real output.
- **Mix:** follow `MATRIX_V2[20|40]` (levels, kinds and tracks to one question either way; multi-select count per matrix; use the slot table as the starting assignment; `kind` on every question; `track` is `interview` or `case`). Exactly 5 questions per set, difficulty never decreasing within a set. Single-answer questions have 4 options (3 allowed only when a real third wrong idea does not exist), multi have 5 options and 2 answers.
- Wrong options are real misconceptions, each with `whyWrong`. The correct option is not visibly the longest (validator: at most 10 characters longer than the longest other). Vary the answer position. No "all/none of the above". No letter references like "(a)" in explanations. No interviewer framing in stems ("An interviewer asks...").
- Every string is `{ "en", "vi" }`. VI is written natively, not word by word; keep the post's own VI terms. Humanizer voice: plain, concrete, no "not X but Y" staging, no one-line closers.
- **Figures** (`Uxq*.astro`): drawn on the page as inline SVG, colours only from CSS tokens (`var(--bg)`, `var(--text)`, `var(--border)`, `var(--accent)` ... see `Sbq08BandRuler.astro` for the pattern), light and dark both correct, bilingual labels with `<tspan data-lang-en>` / `<tspan data-lang-vi>`, no hardcoded hex for chrome (a swatch in a colour question may use its real colour via inline style, since the colour is the subject), width 100%, readable at 360px (min text about 11px at rendered size, so keep the viewBox near 600 wide and text 13+). A figure must not print the answer. No infographic PNGs.

## Check before you report

- `node scripts/quiz/validate.ts src/data/quiz/<slug>/set-*.json` is clean.
- `node scripts/quiz/mix.ts <slug>` says "on target".
- `node --test src/utils/quiz.test.ts` passes (it checks every quiz folder; if the only failures are in another agent's unfinished post, ignore those and say so).
- Re-run every `verifiedBy` command once more and confirm the output matches what you wrote.

## Report (short)

Per set: title and topic. Final mix numbers. List of figures with the question ids that use them. Anything you could not verify or any place the post itself looks wrong (do not edit the post).
