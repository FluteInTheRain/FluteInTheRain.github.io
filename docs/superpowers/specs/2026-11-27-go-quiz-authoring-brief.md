# Authoring brief: Go series quizzes (one agent owns one post's quiz)

The 20 posts of the `golang` series get a review quiz (matrix v2, `code` domain). One Sonnet agent per post, working in
`/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io`, branch `feat/go-quiz`.
Up to nine other agents work in the same tree on other posts at the same time.

## Sizes (already declared in `src/data/quiz/domains.ts`)

| Slugs | Questions | Sets |
|---|---|---|
| `go-first-program-modules-packages`, `go-variables-types-pointers-functions`, `go-slices-maps-strings`, `go-structs-methods-interfaces`, `go-errors-defer-panic`, `go-testing-table-tests`, `go-goroutines-channels-select`, `go-context-timeouts-mutexes`, `go-concurrency-patterns-worker-pools-pipelines`, `go-http-service-net-http-json-middleware` | 20 | 4 x 5 |
| the other ten (`go-memory-...`, `go-abstractions-...`, `go-concurrency-scheduler-...`, `go-production-...`, `go-efficiency-workflow-...`, `go-hardware-...`, `go-observability-...`, `go-profiling-...`, `go-three-rs-...`, `go-interview-...`) | 40 | 8 x 5 |

## Your files (create ONLY these)

- `src/data/quiz/<slug>/set-01.json` ... (`set-08` for 40 questions, `set-04` for 20)
- `src/components/quiz/figures/Gq<NN><Name>.astro`, `<NN>` = your post's number in `src/data/series.ts` (order of `parts` in the `golang` series, two digits). Figures only where the question needs to be *seen* (goroutine timelines, slice header and backing array, memory layout, cache lines, a flamegraph, a benchmark table): 2-4 for a 40-question post, 0-2 for a 20-question post. Code questions use a `code` media block, not a drawing.

Do NOT edit anything else (`domains.ts` is done). Do not commit, stage, stash, checkout or reset. Do not run `npm run build` or start a dev server (the lead builds once at the end).

## Read first

1. `AGENTS.md` (quiz rules; `code` domain posts use tracks `interview` and `ai`; no "illustrative" or "minh hoa" labels; any invented number states its assumption in the sentence; `context.text` is short lines, one idea per line, bullets `• `, never one block).
2. `docs/superpowers/specs/2026-11-26-quiz-matrix-v2.md`, `src/data/quiz/matrix.ts` (targets for 20 or 40: levels, kinds, perTrack, multi; `typeHint` shows which question types fit a slot), `src/data/quiz/types.ts`.
3. Your post `src/content/blog/<slug>.mdx` in full. Questions grow out of what the post teaches, shows and measures. `reread.anchor` is a real English heading slug of the post; `ref` is a post section name.
4. Format examples (copy the JSON shape): `src/data/quiz/backend-http-request-lifecycle/set-01.json` and `set-02.json` (a code-domain quiz) and `src/data/quiz/margin-trading-risks-beginner-psychology/set-01.json` (a v2 40-question quiz). Figure media: `src/components/quiz/figures/Bq*.astro` pattern and how `media` refers to it (`{ "kind": "figure", "component": "<file name without .astro>", "alt": {en, vi} }`).

## Rules

- **Tracks.** Half the questions are `interview` (explain, predict, diagnose a concept as you would in an interview), half are `ai` (type `ai-review`: find the flaw in Go code an AI wrote; type `ai-advice`: judge an AI's recommendation). The slot table in `matrix.ts` and `typeHint` decide which type fits each slot. Show the AI's code in a `code` media block (`lang: "go"`). Never name a real AI product; say "an AI assistant".
- **Code must be real.** Every Go snippet that appears in a stem, option or media must compile and behave as the question says. Run it with Go 1.27 (`go run`, `go test -race`, `go vet`) in a scratch dir under the scratchpad. Questions about output, panics, races, allocations, benchmark numbers or sizes need `verifiedBy`: the exact command and its real output. Benchmarks are noisy: state in the question what is being compared, not an exact ns figure, unless the number is stable (allocs/op, B/op, `unsafe.Sizeof`, len/cap).
- **Real cases first** where the post gives one (a real Go issue, a real incident, a real benchmark). Never invent a company event. If a number is made up, say "assume" in the sentence.
- **Mix:** follow `MATRIX_V2[20|40]` (levels, kinds and tracks to one question either way; multi-select count per matrix; use the slot table as the starting assignment; `kind` on every question). Exactly 5 questions per set, difficulty never decreasing within a set. Single-answer questions have 4 options (3 only when a real third wrong idea does not exist), multi have 5 options and 2 answers.
- Wrong options are real misconceptions, each with `whyWrong`. The correct option is not visibly the longest (validator: at most 10 characters longer than the longest other). Vary the answer position. No "all/none of the above". No letter references like "(a)" in explanations. No interviewer framing in stems ("An interviewer asks...").
- Every string is `{ "en", "vi" }`. VI is written natively, not word by word; keep the post's own VI terms. Do not translate identifiers, keywords, package names, commands or code. Humanizer voice: plain, concrete, no "not X but Y" staging, no one-line closers.
- **Figures** (`Gq*.astro`): drawn on the page as inline SVG, colours only from CSS tokens (`var(--bg)`, `var(--text)`, `var(--border)`, `var(--accent)`; see `Bq*.astro`), light and dark both correct, bilingual labels with `<tspan data-lang-en>` / `<tspan data-lang-vi>`, width 100%, readable at 360px (viewBox near 600 wide, text 13+). No infographic PNGs.
  **The figure `alt` is printed on the page as a visible caption** (`QuizMedia.astro`). Write it as a neutral description of what is drawn ("Two goroutines and a shared counter, timeline of six steps"), never the answer or a verdict. The same goes for text labels inside the drawing and its `aria-label`: they name things, they do not say which option is right.

## Check before you report

- `node scripts/quiz/validate.ts src/data/quiz/<slug>/set-*.json` is clean.
- `node scripts/quiz/mix.ts <slug>` says "on target".
- `node --test src/utils/quiz.test.ts` passes (it checks every quiz folder; failures only in another agent's unfinished post can be ignored, say so).
- Re-run every `go` command behind a `verifiedBy` once more and confirm the output matches what you wrote.

## Report (short)

Per set: title and topic. Final mix numbers. Figures with the question ids that use them. Anything you could not verify, and any place the post itself looks wrong (do not edit the post).
