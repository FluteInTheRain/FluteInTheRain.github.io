# Brief: worked cases and code for the AI trading posts 4-22

Khang's feedback (2026-11-28): the 19 new posts read as pure theory. He wants a few code snippets that illustrate, or real-world cases
(real problems) and the thinking used to solve them. One agent per post edits **its own post in place**. A second instruction from Khang (same day) is Part A below and comes first.

Tree: `/Users/khang/Downloads/portfolio`, branch `feat/ai-trading-batch-2` (PR #88). Dev server on port 4399 is running.
Nineteen agents work at once, each on different files. Do not stage, commit, stash, checkout or reset. Do not run `npm run build`.

## Part A (do first): remove every mention of 51Labs

Khang: "xoa het may cai 51Labs di, no chi la tham khao va khong dua vao trong noi dung". The name and its material must not appear in anything a reader can see.

Scope for your post (`<slug>`): `src/content/blog/<slug>.mdx` (body, captions, alt text, `sources` frontmatter), `src/data/quiz/<slug>/set-*.json`
(every string, `ref`, `sources`, `verifiedBy`), the figures and demo of your post (`AtP<NN>*`, `Atq<NN>*`; for posts 1-3 the families `AtMarket*`, `AtSignals*`, `AtData*`,
`Signals*`/`Data*` quiz figures that your quiz sets use). Find them with `grep -rliE '51 ?labs' src | grep -i <your prefix or slug>`. Also drop the "go deeper" pointer to the 51Labs courses page.
Search case-insensitively for `51labs`, `51 labs`, `51Labs`, `Thematic Narrative`, `Alpha 6.8`, `51labs.vn`. Do not touch `src/data/series.ts` (the lead does it).

How to remove, so the post stays whole:
- A fact that also has a primary source (a journal paper, an exchange rule, official data, a company filing) stays, cited to that primary source only. A journal article by authors who happen to work at 51Labs
  may be cited as the journal article (title, journal, URL) without naming 51Labs.
- A claim, number, table, figure or quiz question that exists only because of a 51Labs blog post, project or report is **removed**, not re-attributed. Replace it with (a) a case from another real source you open and cite, or
  (b) an example you compute yourself from a stated assumption ("Say ..."), and say nothing about where the idea came from.
- Quiz: keep each question's `id`, `level`, `kind`, `track`, set size and the multi-select count so `npm run check:quiz-mix <slug>` stays "on target". Rewrite the affected questions and their explanations;
  update `verifiedBy` with a command you actually ran; keep `reread.anchor` valid. Then `node scripts/quiz/validate.ts src/data/quiz/<slug>/set-*.json` must print ok.
- Figures: edit labels, titles, source lines and comments in the existing files; if a figure only visualises a 51Labs result, change its data to your own computed example (check with figshot) or delete it and its `<Figure>` usage.
- Keep EN and VI in sync. Keep the prose natural afterwards (humanizer); no dangling sentence that referred to the removed text.
- Final check: `grep -rliE '51 ?labs' <your files>` returns nothing.

Part B follows (the worked case and code). Do them in one pass over the post. For posts 1-3 (`ai-trading-the-market`, `-signals`, `-data`) the posts are already published (`draft: false`; keep it) and the quiz is v1 (40 questions, the old mix): the same rules apply.

## Case ideas (a starting point; pick a better one if you find it, sourced or with stated assumptions)

| Post | Idea for the worked case and snippet |
|---|---|
| 01 the-market | Trace one limit order through the HOSE book step by step; snippet: a small price-time-priority matcher |
| 02 signals | A signal with a convincing in-sample story: compute its information coefficient and decide; snippet: IC on a seeded series |
| 03 data | A split / bonus-share adjusted price series done wrong then right; snippet: back-adjustment with a ratio |
| 04 statistics | Someone shows t = 2.3 after trying 40 ideas; snippet: Bonferroni / best-of-N on noise |
| 05 regime | Decide whether to trust a 2-state fit; snippet: HMM filter probability and a walk-forward rule |
| 06 factors | Is a factor premium still there in the recent half? snippet: subperiod t-stats |
| 07 portfolio | Estimation error: equal weight vs mean-variance on 5 years of data; snippet: min-variance with shrinkage |
| 08 prediction | A model "works" in random CV; find the leak; snippet: random vs walk-forward IC |
| 09 explainable-ai | Explain one ranking decision; snippet: exact Shapley values on a tiny model |
| 10 clustering | Group 12 assets and build HRP weights; snippet: linkage + inverse-variance split |
| 11 graphs | Spot the stress regime from a correlation network; snippet: MST length in calm vs crash |
| 12 backtest | Inherit a backtest with Sharpe 1.8: hunt the bug; snippet: the missing `shift(1)` |
| 13 production | Size a loss cap for a runaway strategy; snippet: a position-cap kill switch simulation |
| 14 deep-learning | Why a net with 513 weights memorises 60 rows; snippet: tiny MLP overfit vs early stop |
| 15 sequence-models | Window length and memory: what an LSTM/CNN can and cannot see; snippet: windowing + a decay table |
| 16 order-flow | Compute OFI from a 5-event book and read it; snippet: the OFI rule in 20 lines |
| 17 financial-nlp | A headline scored wrong by a general word list; snippet: dictionary sentiment with negation |
| 18 gnn | One message-passing step by hand; snippet: normalised adjacency times features in numpy |
| 19 reinforcement-learning | An agent that "learns" on noise; snippet: tabular Q-learning, train vs fresh paths |
| 20 alpha | Formula search finds a great rule on noise; snippet: random formula search with a held-out split |
| 21 agents | Compound error across an agent's steps and where a verifier helps; snippet: success = s^n table |
| 22 investment-os | A risk gate between an agent and the broker; snippet: a gate function with limits and a stop |

## What to add (per post)

One new section, **"Worked case"**, placed after the last numbered `##` section and before "Key takeaways", in both `<En>` and `<Vi>`.
Number it as the next number in the existing sequence (do NOT renumber or rename any existing heading: quiz `reread.anchor` values point at them).

The section walks through one concrete problem the way a practitioner would solve it:

1. **The problem**: a real situation, sourced (a real paper's data, a real incident, a real Vietnamese-market situation, a public 51labs result) or a stated-assumption
   scenario a reader could meet ("Say you inherit a backtest that shows Sharpe 1.8 ..."). Prefer a situation that differs from the post's hook case so it adds, not repeats.
2. **What I would check first**, and why that order.
3. **The steps**, each short, each with the number it produces.
4. **What the result tells you**, and **what would change my mind**.

Plus **code where it helps** (strongly preferred for posts 4-19, optional for 20-22 if the case is organisational):
- a short Python snippet in the post (about 15-40 lines, readable, numpy / pandas / scikit-learn / scipy allowed) that reproduces the key number of the case;
- its **real captured output** in `<TerminalOutput command={...} label="Python 3.x · numpy x.y · captured Nov 2026" caption="...">` (see `src/content/blog/backend-validation-schemas.mdx`
  for the exact syntax; tags on their own lines; import `TerminalOutput from '../../components/mdx/TerminalOutput.astro'`);
- the full script saved as `demo/ai-trading/p<NN>_<topic>.py` (create the folder if missing; header comment with the `uv run --with ...` line). The snippet in the post must be
  byte-identical to a contiguous part of that script, and the output must come from actually running it. Seeded, self-contained (no network at run time); small real data may be embedded with its source in a comment.
- Code blocks go inside both `<En>` and `<Vi>` (comments in the code may be English in both; the prose around it is translated).

## Rules

- Real facts only; everything not real is introduced as an assumption in the sentence ("Say ..."). No "illustrative / minh hoa" labels.
- Numbers must not contradict the post or its quiz (`src/data/quiz/<slug>/`). Do not edit the quiz or any other file than: your MDX, your new `demo/ai-trading/p<NN>_*.py`,
  and optionally ONE new figure `src/components/mdx/AtP<NN>Case*.astro` (same figure rules as before: tokens not hex, bilingual tspans, check with figshot in light EN / light VI / dark VI).
- Add any new source to the `sources` frontmatter (exact title and URL, opened by you). Keep `description` / `description_vi` within 180 / 220 characters. `draft: true` stays.
- Voice: `.claude/skills/book-to-post/voice.md`; run the `humanizer` skill on the new text. Plain, concrete, no "not X but Y" staging, no one-line closers. VI natural, not word-by-word.
- Add one line to the post's "Key takeaways" and one item to "Review questions" only if natural; do not remove existing ones.
- Checks: `scripts/figures/post-check.sh <slug> main 4399`; the page returns 200; every quiz `reread.anchor` of your slug still exists
  (`curl -s http://localhost:4399/blog/<slug>/ | grep -o '<h[23] id="[^"]*"'` vs `grep -h '"anchor"' src/data/quiz/<slug>/set-*.json`); the snippet runs and matches the printed output.
- No investment advice. Do not invent anything about Khang.

## Report back (short)

The case you chose and its source; the script path and the exact command you ran; what the output shows; sources opened; anything you left out because unverifiable.
