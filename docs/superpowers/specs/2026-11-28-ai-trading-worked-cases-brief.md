# Brief: worked cases and code for the AI trading posts 4-22

Khang's feedback (2026-11-28): the 19 new posts read as pure theory. He wants a few code snippets that illustrate, or real-world cases
(real problems) and the thinking used to solve them. One agent per post edits **its own post in place**.

Tree: `/Users/khang/Downloads/portfolio`, branch `feat/ai-trading-batch-2` (PR #88). Dev server on port 4399 is running.
Nineteen agents work at once, each on different files. Do not stage, commit, stash, checkout or reset. Do not run `npm run build`.

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
