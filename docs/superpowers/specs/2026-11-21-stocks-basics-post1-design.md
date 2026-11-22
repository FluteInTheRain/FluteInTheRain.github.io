# Post 1 design: what-is-a-stock-ownership-dividends

Date: 2026-11-21 · Series: `stocks-basics` (spec: `2026-11-21-stocks-basics-series-skeleton-design.md`)
Status: draft (user to approve)

## Intent

First post of the series: convince a Vietnamese beginner that one share is a real slice
of a real company — a claim on earnings and dividends — and undo the two reflexes that
make beginners lose money: treating price tags like lottery tickets ("10k rẻ hơn 100k")
and thinking stock prices are pure gambling noise.

## Decisions made with the user

- **Quiz: yes, shipped with the post** — 8 case sets × 5 questions (40), same JSON shape
  and `/quiz/` page as the DDIA posts, validated by `node --test src/utils/quiz.test.ts`.
- **Examples: real HOSE companies with real numbers** (annual reports / official filings),
  each number attributed in `sources`. No invented companies.
- **One small interactive demo** (React island, `client:visible`) for the reader to click.

## Approach

Follow the existing post pipeline exactly (this is the only sensible way; the alternatives
— a leaner blog-style post, or no demo/quiz — would break series consistency, which the
user cares about):

- MDX in `src/content/blog/what-is-a-stock-ownership-dividends.mdx`, `<En>/<Vi>` bilingual
  spans, frontmatter per `_TEMPLATE.md.txt`, `category: "finance"`, ~700–900 lines.
- Per-post hero: a real metaphor photo (Wikimedia Commons, credited in `sources`) —
  the "slice of something" image, chosen during implementation.
- One per-post demo component pair (`src/components/mdx/`): **"Your slice" calculator** —
  pick FPT or Vinamilk (real shares outstanding, one year of profit, one year of dividends,
  hardcoded with sources), a slider for "how many shares do you buy", and the island shows
  your ownership %, your share of that year's profit, and your dividend in VND. No-JS
  fallback: static text stating the answer for the default slider value
  (progressive enhancement rule).
- Diagrams: reuse `DiagramIcon` + CSS-token colours; no edits to shared mdx components.

## Post outline (sections, each EN + VI)

1. **Hook** — the 1892 certificate from the series cover: paper became a number, but the
   meaning never changed. Opening quote from Graham.
2. **What a share legally is** — ownership claim on earnings and assets, not a bet; what
   a shareholder can and cannot do (receive dividends, vote, trade; no claim on "your
   money back").
3. **Slices in numbers** — shares outstanding, market cap = price × shares, EPS = profit ÷
   shares. Real math with FPT and Vinamilk (latest audited year).
4. **Dividends** — cash vs stock dividends, yield vs "lãi cao", one-line on the ex-date
   price adjustment (deep dive deferred to post 5).
5. **Why prices move** — prices follow expectations, not last year's report; short-term
   noise vs long-term earnings; why the same company can be "cheap" at two prices.
6. **Two beginner traps** — "10k rẻ hơn 100k" (price vs value, share count differs);
   "cổ phiếu là sổ số" (edge over a casino: the underlying earns money).
7. **Key takeaways + review questions** — standard tail of the house format.

## Quiz scope

8 case sets × 5 questions on the post's concepts: ownership vs lottery, market-cap math,
EPS, dividend cash vs stock, ex-date price adjustment (light), expectations vs earnings,
price-vs-value trap. Case contexts use the same real companies as the post; illustrative
numbers flagged `illustrative: true`, real numbers carry sources.

## Sources to cite (verify numbers at implementation time)

- FPT Corporation annual report (latest audited: net profit, cash dividend per share,
  shares outstanding) — fptcorp.com investor relations.
- Vinamilk annual report (same metrics) — vinamilk.com investor relations.
- HOSE/VSDC rule references for the ex-date adjustment (one line only).
- The Intelligent Investor (Graham) for the opening quote; The Psychology of Money
  (Housel) or One Up on Wall Street (Lynch) for one supporting idea.
- Wikimedia Commons hero photo credit.

## Constraints

- Every reader-facing string `{ en, vi }`; MDX inside `<En>`/`<Vi>` spans.
- No edits to shared mdx components (`AnimatedFlow`, `DemoFrame`, `DiagramIcon`…).
- CSS tokens only for the demo styling; light + dark both correct.
- Progressive enhancement: quiz and demo usable without JS where the house format demands.
- Gate: `npm run build` + `node --test` clean; `post-check.sh` / figure checks per
  `scripts/figures/README.md`.

## Out of scope

- Publishing order: post ships as `draft: false` (first series post, so the series card
  appears on the blog index — intended).
- Post 2+ (`vietnam-stock-market-venues-open-account` …) — separate batches.
- Cover art changes to the series page.
