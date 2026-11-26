# Authoring brief: stocks-basics Wave C (one agent owns one whole post)

Posts 8, 9, 10 of `stocks-basics`. One agent per post, working end to end in the main worktree
`/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io`, branch `feat/stocks-basics-wave-c`.
Two other agents work in the same tree on the other posts at the same time.

## Your files (create ONLY these; N = your post number, two digits)

- `src/content/blog/<slug>.mdx` (`draft: true`, `category: "finance"`, tags `["stocks","investing-basics","stocks-basics"]`)
- `src/assets/blog/<slug>/*` (hero + real document images)
- `src/components/mdx/SbP<N>*.astro` (figures and the demo wrapper), `src/components/demos/SbP<N>*Demo.tsx`
- `src/data/quiz/<slug>/set-01.json` … (`set-08` for 40 questions, `set-04` for 20)
- `src/components/quiz/figures/Sbq<N>*.astro` (only where a picture helps, 2–3 per post)

Do NOT edit anything else (`domains.ts` already declares your post `human` and v2; `series.ts` already lists the slugs),
do not commit, stage, stash, checkout or reset, do not run `npm run build`, do not start a dev server
(one runs on port 4399 for this tree). The lead commits.

## Read first

1. `AGENTS.md`, `docs/superpowers/specs/2026-11-26-stocks-basics-posts-2-10-design.md` (per-post standard, truth tables;
   its quiz line is v1 and is replaced by the v2 rules below) and `docs/superpowers/plans/2026-11-26-stocks-basics-wave-c.md`.
2. The format model: Post 7 `src/content/blog/pe-pb-roe-valuation-ratios-in-context.mdx` in full, its `SbP07*` figures,
   `SbP07ValuationContextDemo.astro` + `.tsx`, and `Sbq07*` figures. Copy its structure: hero figure, epigraph, hook
   narrative, TL;DR callout, 5 numbered sections with identical heading hierarchy in `<En>` and `<Vi>`, Concepts blocks,
   Key takeaways, Review questions linking `/blog/<slug>/quiz/`, `sources` front matter. Also see how real document
   images are embedded and credited (Post 5, 6 and 7 use VSDC, HOSE and FPT filings).
3. Figures: `scripts/figures/README.md`, `docs/superpowers/plans/2026-11-23-backend-posts-2-12.md` recipe items 4–5,
   and the notes `~/Downloads/knowledge-personal/general/portfolio-blog-figures-drawn-on-page.md`,
   `portfolio-diagram-icon-kit.md`, `view-figure-screenshots-under-read-hook.md`.
4. Quiz: `docs/superpowers/specs/2026-11-26-quiz-matrix-v2.md`, `src/data/quiz/matrix.ts`, `src/data/quiz/types.ts`,
   and one finished stocks set as a format example: `src/data/quiz/pe-pb-roe-valuation-ratios-in-context/set-01.json`.
   Past stocks quizzes are v1: copy their JSON shape, not their mix.

## Content rules

- **Real cases first.** The hook and at least two sections rest on a real, sourced Vietnamese case or filing you opened
  (web search / fetch the source). Put a cropped image of the real document (notice, circular, filing table) where the post
  analyses it, with the source in `sources`. Real photos only from Wikimedia Commons / official pages with a licence you checked.
  Never invent a company event or number; if you cannot verify a fact, leave it out.
- **Rules and numbers** must be checked against the current Vietnamese regulation or exchange page (cite it in `sources`).
  Where you cannot confirm, say what the reader should check with their broker instead of asserting.
- **Humanizer voice:** plain, concrete, no "not X but Y" staging, no one-line closers, no sales words, no forced triads.
  VI is written natively, not translated word by word; keep market terms the post's siblings keep (T+2, ATO, margin, P/E...).
- No chapter framing, no comparison with other markets or languages, no investment advice: teach mechanics and judgement,
  and say plainly that nothing here is a recommendation.
- **Figures:** 1 per 200–250 words of English prose (about 8–11), none of them redrawing a document image; tokens not hex,
  light and dark, bilingual `tspan data-lang-en/vi`, `DiagramIcon` (x, y = icon centre) from `src/data/diagram-icons.ts`,
  plain polygon arrowheads, no overlap. A figure may chart numbers from a source you cite. Check every figure with
  `FIGSHOT_TAG=<your slug-based tag> scripts/figures/figshot.sh <port 4399> <scratch-out> <FigureName>...` in light EN,
  light VI and dark VI, and `scripts/figures/post-check.sh <slug> main 4399`.
- **Demo:** one React island in `<DemoFrame>` with a static bilingual no-JS fallback; the numbers it computes are checked
  against a Python run you record in the plan notes of your report.

## Quiz rules (v2, human post)

- Size: Post 8 and Post 9 = 40 questions (8 sets x 5); Post 10 = 20 (4 sets x 5). Follow `MATRIX_V2` totals (to one
  question) and use the slot table as the starting assignment. `track` is `interview` or `case` (no `ai` at all);
  every question carries `kind`. Multi-select count per the matrix.
- Each set is one scenario card: `context.text` 5–9 short lines, facts as `• ` bullets, starting from a real case or a
  believable working day built on one. Assumed numbers are stated in the sentence. A short verbatim excerpt (a notice line,
  a margin statement line) as `code` media when a question turns on it. A figure only when it helps.
- Item rules: every wrong option is a real misconception; the correct option is not the longest; no filler tails; answerable
  from the card plus the post; a *why* has its reason in the post; a *whatif* uses only the post's rules and the explanation names the rule.
- All maths verified with `python3` and the command + output recorded in `verifiedBy`.
- `reread.anchor` = a real heading id of your post: `curl -s http://localhost:4399/blog/<slug>/ | grep -o '<h[23] id="[^"]*"' | sed 's/.*id="//;s/"//'`;
  `reread.label` copies that heading's EN and VI text.
- Checks per set: `node scripts/quiz/validate.ts src/data/quiz/<slug>/set-NN.json` prints `ok`; screenshots with
  `node scripts/quiz/shot.mjs 4399 <slug> set-NN <scratch-out> --questions`. To read screenshots under the Read hook, crop
  400 px tiles `sips -c 400 1000 --cropOffset <y from 1> 1 <png> --out t.png`, then
  `sips -s format jpeg -s formatOptions 16 -Z 680 t.png --out tile.jpg` (keep `wc -l` under ~330).
  At the end: `npm run check:quiz-mix <slug>` and `node --test src/utils/quiz.test.ts` (report only failures in your slug).

## The three posts

| N | Slug | Act | Quiz | Scope (from the series skeleton) |
|---|---|---|---|---|
| 08 | `macro-industry-what-moves-stock-prices` | read | 40 | Interest rates, FX and cycles move whole sectors: read the current, not the noise. Builds on Post 7 (cyclical P/E, bank P/B). Real anchor candidates: the 2022 policy-rate hikes by SBV and the VN-Index drawdown that year; VND/USD pressure and exporters; sector rotation. You choose cases you can source. |
| 09 | `margin-trading-risks-beginner-psychology` | discipline | 40 | Margin cuts both ways; herd behaviour, FOMO, how beginners actually lose money. Builds on Posts 4 (settlement, `.6` margin sub-account) and 8. Real anchor candidates: a real margin-call / forced-sale episode with sourced numbers (2022 sell-off), the broker's margin contract terms, HOSE/SSC margin-list or margin-rate rules. Maths: equity, maintenance ratio, margin-call and force-sell prices. |
| 10 | `portfolio-dca-first-investment-plan` | discipline | 20 | A first-year plan: position sizing, DCA and written rules for when to sell. Builds on Post 9. Real anchor candidates: a DCA run on real VN-Index or a named stock's monthly closes you can source (compute it, show the numbers), the cost of fees and the PIT 0.1% on every sale from Post 4. The capstone: link back to Posts 2–9 where each rule comes from. |

## Report back (short)

Files written; each external fact with its `ref` URL; every `verifiedBy` command and output; figures made (file, what it shows,
which section or set); `post-check.sh` result; the demo's Python cross-check; loose or unverifiable claims you left out;
anything in sibling posts you noticed that looks wrong (do not edit them).
