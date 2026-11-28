# Authoring brief: AI trading batch 2 (one agent owns one whole post)

Posts 4–11 of `ai-trading`. One agent per post, all working end to end in the same tree
(`/Users/khang/Downloads/portfolio`, branch `feat/ai-trading-batch-2`), eight agents at once on disjoint files.

## Your files (create ONLY these; NN = two-digit post number)

- `src/content/blog/<slug>.mdx` (`draft: true`)
- `src/assets/blog/<slug>/*` (hero photo and any real document images)
- `src/components/mdx/AtP<NN>*.astro` (figures and the demo wrapper), `src/components/demos/AtP<NN>*Demo.tsx`
- `src/data/quiz/<slug>/set-01.json` … `set-08.json`
- `src/components/quiz/figures/Atq<NN>*.astro` (only where a picture helps, 3–5 per post)

Do NOT edit anything else (`domains.ts` and `series.ts` already declare your post). Do not commit, stage, stash, checkout or reset.
Do not run `npm run build`. A dev server runs on port 4399 for this tree; do not start another.

## Read first

1. `AGENTS.md`, `docs/superpowers/specs/2026-11-21-ai-trading-series-design.md` (non-goals and anti-goals apply), your entry in `src/data/series.ts`
   (topic, hook, `builds`), and `~/Downloads/51labs/curriculum.txt` (what the public curriculum teaches on your topic).
2. Format model: `src/content/blog/ai-trading-signals.mdx` and `ai-trading-data.mdx` in full with their `AtSignals*` / `AtData*` figures and demo.
   Copy structure: hero figure, epigraph, hook narrative, TL;DR callout, numbered sections with identical heading hierarchy in `<En>` and `<Vi>`,
   Concepts blocks (beginner tone, intuition before math), Key takeaways, Review questions linking `/blog/<slug>/quiz/`, `sources` frontmatter, a "go deeper" pointer.
3. Figures: `scripts/figures/README.md` and `~/Downloads/knowledge-personal/general/portfolio-blog-figures-drawn-on-page.md`, `portfolio-diagram-icon-kit.md`,
   `view-figure-screenshots-under-read-hook.md`. Voice: `.claude/skills/book-to-post/voice.md`, `style-guide.md`. Run the `humanizer` skill on all prose.
4. Quiz: `docs/superpowers/specs/2026-11-26-quiz-matrix-v2.md`, `src/data/quiz/matrix.ts`, `src/data/quiz/types.ts`; format example of a v2 code-domain quiz:
   `src/data/quiz/go-testing-table-tests/set-01.json` (40 questions with `interview` + `ai` tracks) and the AI-trading sets for house style.

## Content rules

- **Real cases first.** The hook and at least two sections rest on a real, sourced case you opened (paper, regulator or company postmortem, public 51labs post,
  dataset documentation). Cite each in `sources` with the exact title and URL; put a cropped image of a real document or chart only where the post analyses it.
  Photos only from Wikimedia Commons or official pages with a licence you checked. If you cannot verify a fact, leave it out.
- **Vietnamese market as backdrop** where it fits (HOSE, VN30, price limits, retail share, T+2); check any market rule against an official page.
- **Maths and demo numbers** are computed in Python by you; record command and output (quiz: `verifiedBy`). Simulated data is introduced in the sentence ("Say a strategy ...").
- Humanizer voice: plain, concrete, no "not X but Y" staging, no one-line closers, no sales words, no forced triads. VI written natively, keep terms the siblings keep.
- No investment advice; say plainly that nothing here is a recommendation. Do not invent anything about Khang.
- **Figures:** about one per 200–250 words of English prose (8–11), CSS tokens not hex, light and dark, bilingual `tspan data-lang-en/vi`, `DiagramIcon` from
  `src/data/diagram-icons.ts`, no overlap or overflow at 360px. Check each with `FIGSHOT_TAG=<tag> scripts/figures/figshot.sh 4399 <scratch-out> <Figure>...`
  (light EN, light VI, dark VI) and read the crops. `scripts/figures/post-check.sh <slug> main 4399` at the end.
- **Demo:** one React island in `<DemoFrame>` with a static bilingual no-JS fallback; its numbers match a Python run.

## Quiz rules (v2, code domain)

40 questions = 8 sets x 5, following `MATRIX_V2[40]` (levels, kinds, 20 `interview` + 20 `ai`, 4 multi-select). `ai` questions use `ai-review` / `ai-advice`
(judge or find the flaw in AI-written work on this topic: e.g. a backtest an AI summarised, a feature it proposed). Every question carries `kind`.
Each set is one scenario card: `context.text` 5–9 short lines, facts as `• ` bullets, starting from a real case. Wrong options are real misconceptions;
the correct option is not the longest. All maths verified with python and recorded in `verifiedBy`. `reread.anchor` = a real heading id of your post
(`curl -s http://localhost:4399/blog/<slug>/ | grep -o '<h[23] id="[^"]*"'`). Per set: `node scripts/quiz/validate.ts src/data/quiz/<slug>/set-NN.json` prints `ok`;
look at it with `node scripts/quiz/shot.mjs 4399 <slug> set-NN <scratch-out> --questions` (crop screenshots as in `view-figure-screenshots-under-read-hook`).
At the end: `npm run check:quiz-mix <slug>` and `node --test src/utils/quiz.test.ts` (report only failures in your slug).

## The eight posts

| NN | Slug | Curriculum cue | Scope |
|---|---|---|---|
| 04 | `ai-trading-statistics` | Statistical analysis for investment | From the series entry: significance, multiple testing, how a backtest result can be luck. Builds on Signals. |
| 05 | `ai-trading-regime` | Regime detection, Hidden Markov Model | Market states and how to detect them; builds on Statistics. |
| 06 | `ai-trading-factors` | Quantitative momentum and value portfolio | Factors (momentum, value, ...) and why they decay; builds on Data. |
| 07 | `ai-trading-portfolio` | Portfolio optimization, margin optimization | Turning signals into weights; builds on Regime and Factors. |
| 08 | `ai-trading-prediction` | Supervised learning, tree ensembles, predict-then-rank | Prediction as ranking; leakage; builds on Data and Statistics. |
| 09 | `ai-trading-explainable-ai` | Explainable AI | Why a model ranked a stock; builds on Prediction. |
| 10 | `ai-trading-clustering` | Clustering, hierarchical risk parity | Grouping assets; builds on Statistics. |
| 11 | `ai-trading-graphs` | Graph-based methods, financial networks | Assets as a network; builds on Clustering and Regime. |

## Report back (short)

Files written; each external fact with its URL; every `verifiedBy` command and output; figures made; `post-check.sh` result; the demo's Python cross-check;
claims you left out because unverifiable; anything in sibling posts that looks wrong (do not edit them).
