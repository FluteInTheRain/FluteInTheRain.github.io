# AI Trading series: 22 beginner posts, DDIA format — design

Date: 2026-11-21. Decided with Khang in conversation. Branch `feat/ai-trading-series` (worktree `~/.local/share/opencode/worktree/225f52/feat/ai-trading-series`).

## Intent

A new bilingual blog series, **"AI for Market Systems" / "AI trong chứng khoán"** (`id: ai-trading`), formatted exactly like the DDIA series: epigraph → real incidents → TL;DR → numbered sections → key takeaways → review questions, per-post diagram components, a series cover with a reading map, and 40 quiz questions per post. Content base: **51labs** (public curriculum PDF, public blog posts, public papers) plus classic public papers, threaded with Vietnamese-market cases throughout. The audience is **beginners**: no finance or ML background assumed; every term introduced before use, math kept at the level actually needed.

Outline approved by Khang on 2026-11-21 (4 acts, 22 posts, short DDIA-style titles). Titles and slugs below are fixed.

## Goals

- A `ai-trading` entry in `src/data/series.ts`: 4 acts, 22 parts (all slugs declared; unpublished parts show "soon" on the cover), builds-on edges, 4 reading paths, a series cover (`src/assets/series/`, landscape, free licence, credited).
- 22 posts in `src/content/blog/`, slug prefix `ai-trading-`, following `_TEMPLATE.md.txt` and the DDIA post pattern.
- Every post: quiz of 8 case sets × 5 questions (40 total) at `src/data/quiz/<slug>/set-NN.json`, same shape and rules as the DDIA quizzes (validated by `node --test src/utils/quiz.test.ts`).
- Beginner tone: glossary (`Concepts`) heavier than DDIA, intuition before math, every `##` section opens with what the reader needs to know, each post ends with a "go deeper" pointer (51labs course/blog/paper).
- Vietnamese market as the running backdrop: HOSE order types, limit up/down, VN30, retail dominance, margin cuts 2020–2025 (51labs paper), Metro Line 1 announcement effect (51labs paper), Thematic Narrative Engine Alpha 6.8 (51labs project).

## Non-goals

- No use of 51labs LMS-gated material (slides, labs, member data). Public pages/PDF/blog/papers only.
- No book framing ("the course says…"). Ideas stated directly; `sources` frontmatter credits 51labs and papers.
- No publishing in this batch: all posts stay `draft: true` until Khang reviews them.
- No changes to existing series (ddia, refactoring-ui, golang), shared MDX components, or layout.
- Quiz and post for a batch are done together, but later batches wait for the previous PR to merge.

## Anti-goals (failure even if it "works")

- Invented incidents, numbers or quotes. Every real case must be sourced (postmortem, paper, 51labs public post) and cited in `sources`.
- AI-looking infographic PNGs; simulated numbers presented as real (simulated demo data must be labelled).
- Hex colours in on-page components (CSS tokens only, dark mode must pass).
- Diagram text that collides, overflows or breaks at 360px or in Vietnamese.

## Constraints

- Site rules from `AGENTS.md`: bilingual strings everywhere (`<En>/<Vi>` full-body mirroring), CSS tokens, progressive enhancement, `npm run build` + `node --test` gate per step.
- New per-post components go in `src/components/mdx/`, named `At` + topic + name (e.g. `AtMarketOrderBookSim.astro`) so they cannot collide with existing prefixes (`Batch*`, `TradeOffs*`, `Replication*`, …). Shared components are off limits.
- Icons only via `src/data/diagram-icons.ts` / `DiagramIcon`; new flow icons under `public/icons/flow/` after a name check.
- Post agents (when used) run on Sonnet in their own worktrees; the lead verifies and commits.
- Real `node_modules` in the worktree (`cp -cR` clone, never a symlink — kb: `astro-worktree-symlinked-node-modules-no-hydration`).

## Series entry design

Acts (columns):

| id | EN | VI |
|---|---|---|
| `market` | The Market | Thị trường |
| `ml` | Machine Learning | Machine Learning |
| `dl` | Deep Learning | Học sâu |
| `agentic` | RL & Agents | RL & Agent |

Posts and slugs (title EN/VI, category, quiz):

| # | Slug | EN | VI | Cat. |
|---|---|---|---|---|
| 1 | `ai-trading-the-market` | The Market | Thị trường | finance |
| 2 | `ai-trading-signals` | Signals | Tín hiệu | ai |
| 3 | `ai-trading-data` | Data | Dữ liệu | ai |
| 4 | `ai-trading-statistics` | Statistics | Thống kê | ai |
| 5 | `ai-trading-regime` | Regime | Chu kỳ thị trường | finance |
| 6 | `ai-trading-factors` | Factors | Factor | finance |
| 7 | `ai-trading-portfolio` | Portfolio | Danh mục | finance |
| 8 | `ai-trading-prediction` | Prediction | Dự đoán | ai |
| 9 | `ai-trading-explainable-ai` | Explainable AI | AI giải thích được | ai |
| 10 | `ai-trading-clustering` | Clustering | Phân cụm | ai |
| 11 | `ai-trading-graphs` | Graphs | Đồ thị | ai |
| 12 | `ai-trading-backtest` | Backtest | Backtest | ai |
| 13 | `ai-trading-production` | Production | Triển khai | ai |
| 14 | `ai-trading-deep-learning` | Deep Learning | Học sâu | ai |
| 15 | `ai-trading-sequence-models` | Sequence Models | Mô hình chuỗi | ai |
| 16 | `ai-trading-order-flow` | Order Flow | Dòng lệnh | finance |
| 17 | `ai-trading-financial-nlp` | Financial NLP | NLP tài chính | ai |
| 18 | `ai-trading-gnn` | GNN | GNN | ai |
| 19 | `ai-trading-reinforcement-learning` | Reinforcement Learning | Học tăng cường | ai |
| 20 | `ai-trading-alpha` | Alpha | Alpha | ai |
| 21 | `ai-trading-agents` | Agents | Agent | ai |
| 22 | `ai-trading-investment-os` | Investment OS | Hệ thống đầu tư | ai |

Builds-on edges (no edge spans two map columns; column = act):

| Part | Builds on | | Part | Builds on |
|---|---|---|---|---|
| 1 | — | | 12 | 8 |
| 2 | 1 | | 13 | 12 |
| 3 | 1 | | 14 | 8 |
| 4 | 2 | | 15 | 14 |
| 5 | 4 | | 16 | 15 |
| 6 | 3 | | 17 | 14 |
| 7 | 5, 6 | | 18 | 11, 15 |
| 8 | 3, 4 | | 19 | 14, 16 |
| 9 | 8 | | 20 | 19 |
| 10 | 4 | | 21 | 17 |
| 11 | 10, 5 | | 22 | 19, 21 |

Reading paths:

| id | EN | VI | order |
|---|---|---|---|
| `full` | Read it all | Đọc hết series | 1–22 |
| `beginner` | New to markets & AI | Chưa biết gì, đi từ đầu | 1–7 |
| `ml` | ML engineer entering quant | ML engineer chuyển sang quant | 3, 4, 8, 12, 13, 14, 15, 16 |
| `quant` | Traditional quant learning AI | Quant truyền thống học AI | 2, 4, 5, 6, 7, 8, 9, 10, 12 |

Cover: landscape photo, free licence (candidate: HOSE / Vietnamese trading floor on Wikimedia; fallback a general trading-floor photo), credited in the entry.

## Batch plan

| Batch | Scope | Branch |
|---|---|---|
| 1 (this branch) | Series entry + cover, posts 1–3, 24 quiz sets (8 × 3 posts) | `feat/ai-trading-series` → PR |
| 2+ | Posts 4–7, then 8–13, 14–18, 19–22 in later batches | fresh `feat/ai-trading-*` branches from main after merge |

Each post must meet the DDIA density target: 3–5 sourced real-world visuals, 4–6 on-page figures (CSS-token SVG), 1–2 interactive demos, a visual in every `##` section except the last two, glossary `Concepts` at top and bottom, review questions pointing back at sections.

## Quiz rules (same as DDIA, from `portfolio-blog-post-quiz-case-sets`)

8 sets × 5 questions; difficulty never drops inside a set; sets sorted by mean difficulty; ask directly (no interviewer framing); calculation questions state every formula; content beyond the post needs an opened external `ref`; options shuffled per question id (explanations never reference letters); every wrong option gets `whyWrong`; beginner weighting: early-series sets test intuition, formulas appear from act 2 topics.

## Left to the builder

- Exact cover copy (tagline, pitch, outcomes, hooks) from the outline.
- Cover image choice and licence check.
- Which real cases land in which section (agents propose, lead verifies against sources).
- Quiz set difficulty curve details.
