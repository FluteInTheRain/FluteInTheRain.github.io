# Authoring brief: backend series quizzes (one agent owns two posts)

Decided with Khang on 2026-11-25: the 12 backend posts get review quizzes in the DDIA format (8 case sets × 5 questions
per post), written cheaply: **6 agents, each owning two posts end to end** (no separate brief agents, no per-set
agents). Figures are **only where a picture really helps** (a timeline, a request flow, a pool, a rollout), about
3–4 per post, not one per set.

## Where you work

- The main worktree `/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io`, branch `feat/backend-quiz`.
  Five other agents work in the same tree on other posts at the same time.
- You create ONLY: `src/data/quiz/<slug>/set-01.json` … `set-08.json` for your two slugs, and new figures
  `src/components/quiz/figures/Bq<NN><Name>.astro` (NN = the post number, two digits, e.g. `Bq07TokenTamper`).
- Do not edit anything else (`src/data/quiz/domains.ts` already declares all 12 posts as `'code'`). Do not commit,
  stage, stash, checkout or reset; do not run `npm run build`; do not start a dev server (one runs on port 4399 for
  this tree). The lead commits per post.

## Read first

1. The generic rules: `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md` and
   `docs/superpowers/specs/2026-11-25-ddia-quiz-authoring-brief-stream.md`. In the stream brief, the sections
   **Hard rules**, **The figure**, **How to check your work**, **Lessons from earlier quizzes** and the
   **Slot table** all apply to you unchanged (replace the stream slug with yours). Its scenarios, figure names,
   jargon list and anchors do NOT apply.
2. `src/data/quiz/types.ts`, `src/components/quiz/QuizContext.astro`, and one finished set as a format example:
   `src/data/quiz/stream-processing-event-logs-cdc-windows-joins/set-01.json`.
3. Your two posts in full: `src/content/blog/<slug>.mdx` (one `<En>` block, then one `<Vi>` block: take facts from
   EN, exact Vietnamese terms from VI). Also skim the demo files the post shows (`demo/pNN_*.py`) and the post's
   terminal captures: they are the best source of concrete, checkable numbers and code for `code-output` and
   `scenario` questions.

## Rules specific to this series

- **Slot table:** use the stream brief's slot table as is for each of your posts (20 `interview` + 20 `ai`,
  `multi` in sets 04, 06, 07, 08, the same Bloom mix, rising difficulty).
- **Calculations are optional.** A set has a calculation only if its scenario really turns on a number.
- **Figures only when needed:** about 3–4 per post. A set without a figure has no `context.media` figure. Never redraw
  the post's own `BeP*` figures; quiz figures show the case's situation, never the answer.
- **Scenarios:** 8 per post, each a concrete backend situation the reader could meet at work (a FastAPI endpoint, a
  log line, a PR an AI assistant wrote, an on-call page). Real incidents need a source you opened; the post's own hook
  incident may be used for at most ONE set. Assumed numbers are stated in the sentence ("Suppose…", "Giả sử…").
- **Code in questions:** short FastAPI / Python snippets as `code` media. For `code-output` questions, actually run
  the code (`uv run --with fastapi --with httpx python …` in your scratchpad, never in `demo/`) and put the command and
  output in `verifiedBy`.
- **No overlap between your two posts**, and stay inside each post's scope (the post says which ideas belong to DDIA
  posts or to other backend posts; do not quiz those).
- **Anchors:** `reread.anchor` must be a real heading id of the post. Get the list with
  `curl -s http://localhost:4399/blog/<slug>/ | grep -o '<h[23] id="[^"]*"' | sed 's/.*id="//;s/"//'`;
  `reread.label` copies that heading's EN and VI text.
- **Jargon kept in English in VI:** endpoint, request, response, status code, header, query, path, payload, schema,
  router, middleware, dependency, session, connection pool, transaction, migration, worker, event loop, thread,
  cache, TTL, queue, retry, backoff, token, scope, log, metric, trace, span, p50/p95/p99, timeout, probe, rollout,
  pod, image, container, deploy (plus anything the post's VI block keeps in English).

## Checks (per set, then per post)

- `node scripts/quiz/validate.ts src/data/quiz/<slug>/set-NN.json` prints `ok`.
- Screenshots: `node scripts/quiz/shot.mjs 4399 <slug> set-NN <scratch-out> --questions`. To read them under the
  Read hook, crop 400 px tiles: `sips -c 400 1000 --cropOffset <y> 1 <png> --out t.png` (start y at 1, not 0) then
  `sips -s format jpeg -s formatOptions 16 -Z 680 t.png --out tile.jpg`; keep `wc -l tile.jpg` under ~330. Read the
  scenario + figure in light EN and dark VI for every set that has a figure, and at least q1 and the longest question
  of each set.
- When both posts are done: `node --test src/utils/quiz.test.ts` (other agents' unfinished files may fail it; report
  only failures in your own slugs).

## Report back (short, per post)

Files written; validator results; each `verifiedBy` command and output; figures made and which sets use them; any
external fact with its `ref` URL; loose or wrong claims you noticed in the post itself (do not edit the post).
