# DDIA series: cover page, direct framing, more diagrams — design

Date: 2026-11-19. Decisions made with Khang in conversation; calls marked *(builder's call)* are mine.

## Intent

The 14 DDIA posts (Designing Data-Intensive Applications, 2nd ed.) are written but read as 14 separate articles. Khang wants:

1. **A series cover**, like the cover and contents page of a technical book: it sells the series, links every post, shows with an interactive map how the posts build on each other, and suggests reading orders.
2. **No chapter framing** in the posts ("Chapter 4 of the book is about…"). State the idea directly; the References block already credits the book.
3. **More visuals** so readers understand faster. Top priority: **architecture and request/data-flow diagrams**. Each post also gets **one real-world problem** worked through.
4. Subagents run on **Sonnet** to save tokens.

Why: the series should pull readers in and guide them through it, and each post should be understandable from its pictures, not only its text.

## Goals

- `/blog/series/ddia/`, built from a `ddia` entry in `src/data/series.ts`, using the series cover infrastructure already on `feat/ui-ux-series-cover` (cover hero, `SeriesMap`, `SeriesContents`, `SeriesBar`, `SeriesPager`, `SeriesCard`).
- All 14 posts: zero chapter/book framing outside the References (frontmatter `sources`) and the `ddia` tag.
- All 14 posts: **+2–3 new on-page architecture/flow diagrams** and **+1 real-world problem**, and every post meets the style guide's visual-density target.

## Non-goals

- No running example across posts. Khang picked option A: each post keeps its own examples and stays readable on its own.
- No rewrite of a post's argument, angle or section order beyond what the new visuals and the de-framing need.
- No changes to the UI/UX series data, its posts, or `.claude/skills/*`. Another session owns those.
- No publishing: draft flags stay as they are. Ch.3–4 publishing stays on `feat/ddia-publish-ch3-ch4`.
- No pushing or merging without Khang's approval.

## Anti-goals (failure even if it "works")

- AI-looking infographics: generated PNGs with banners, pills, card grids, gradients or emoji. Khang has rejected these before.
- Invented incidents or numbers. The real-world problem must be a sourced, real case (company postmortem, engineering blog, paper). Simulated numbers in demos must be labelled as simulated.
- Diagrams that only decorate, or that redraw a figure from the book.
- Diagrams where text overlaps lines or boxes, gets cut off, or breaks in Vietnamese, dark mode or at phone width.

## Constraints

- Follow `.claude/skills/book-to-post/style-guide.md` and SKILL.md Step 6 B (as of 2026-11-19) for visual tools, colours, the anti-collision rule, sentence-case labels and bilingual mirroring (`<En>`/`<Vi>`, `data-lang-en`/`data-lang-vi`).
- On-page diagrams use site CSS tokens so they follow dark mode.
- **One branch per post, cut from main.** Exception: ch.5–6 already live on older branches, which is fine.
- **Each worktree gets a real `node_modules`** via `cp -cR <main checkout>/node_modules`. A symlink breaks hydration: Vite returns 403 for the React renderer (kb: `astro-worktree-symlinked-node-modules-no-hydration`).
- **Shared files are off limits to post agents** (`AnimatedFlow.*`, `Figure.astro`, `DemoFrame.astro`, layouts, `public/icons/flow/README.md`), because 14 parallel branches would conflict. A post agent may only:
  - add new components named with the post's existing prefix (`Sharding*`, `Tx*`, `Dist*`, `Consensus*`, `Batch*`, `Stream*`, `Unbundled*`, `Ethics*`; ch.1–6 use their existing prefixes, e.g. `TradeOffs*`, `DataModels*`, `Storage*`);
  - add new icon SVGs under `public/icons/flow/`, checking first that the file name does not already exist on main;
  - add assets under `src/assets/blog/<slug>/`.
- Subagents: `model: sonnet`.

## Approaches

**Cover.** One sensible way, which Khang accepted: reuse the series infrastructure. The alternatives were a standalone DDIA page (duplicates the code) and a React island for the map (rejected in the UI/UX spec because its links only work after hydration).

**Posts.** Khang picked **(1): one Sonnet agent per post**, run in parallel batches of 4–5, each in that post's worktree and branch. The rejected alternative (2) was one agent per book part, working through 4–5 posts in a row: slower, and one failure would stall a whole part.

## Design

### A. Cover (`feat/ddia-series-cover`, cut from `feat/ui-ux-series-cover`, worktree `../FluteInTheRain-ddia-cover`)

1. **Generalise acts.**
   - Change `Series.acts` from `Record<ActId, …>` to an ordered array `{ id: string; label: L10n; blurb: L10n }[]`, and `SeriesPart.act` to `string`.
   - In `SeriesMap.astro`, derive the columns from `series.acts` instead of the hard-coded `ACTS`.
   - The aria text says "{n} groups" instead of "four groups".
   - Migrate the `refactoring-ui` entry; it must render unchanged.
2. **`ddia` entry.** Three acts, following the book's parts:

   | id | label | blurb | parts |
   |---|---|---|---|
   | `foundations` | Foundations | How one system stores and shapes data | 1–5 |
   | `distributed` | Distributed data | When data lives on many machines | 6–10 |
   | `derived` | Derived data | Systems built from other systems' data | 11–14 |

   Builds-on edges (part numbers):

   | Part | Builds on |
   |---|---|
   | 1 | — |
   | 2 | 1 |
   | 3 | 1 |
   | 4 | 3 |
   | 5 | 3 |
   | 6 | 2, 5 |
   | 7 | 4, 6 |
   | 8 | 4, 6 |
   | 9 | 6 |
   | 10 | 8, 9 |
   | 11 | 4, 7 |
   | 12 | 6, 11 |
   | 13 | 10, 12 |
   | 14 | 13 |

   Reading paths:

   | Path | Parts |
   |---|---|
   | Read it all | 1–14 |
   | System design interview | 2, 6, 7, 8, 9, 10, 12 |
   | My data is on more than one machine | 6, 7, 9, 10 |
   | I build data pipelines | 1, 5, 11, 12, 13 |
   | Picking a database | 3, 4, 8, 7 |

   - Credit: Martin Kleppmann & Chris Riccomini, *Designing Data-Intensive Applications*, 2nd ed., extended with real incidents, live demos and diagrams.
   - Title, tagline, pitch, outcomes, topics and hooks: *(builder's call)*. Write them from each post's `description`/`title`, in EN and VI, in the tone of the UI/UX entry. No hype words.
3. **Discovery.** The series bar and prev/next pager appear automatically on the 14 posts via `seriesOfPost`. The `SeriesCard` shows on `/blog` and on any category page whose posts belong to the series (the DDIA posts use `system-design` and `database`). Check this works for two series at once.
4. **Checks.**
   - `npm run build` passes.
   - Desktop light/dark, VI, 390px and no-JS screenshots of `/blog/series/ddia/` show no overlaps.
   - `/blog/series/refactoring-ui/` looks the same as before.
5. **Merge order.** `feat/ui-ux-series-cover` → main (owned by the other session, needs Khang's OK), then this branch. Until then, preview the cover by merging locally into the preview worktree.

### B. Post agents (one per post)

Branches and worktrees:

| Ch. | Branch | Worktree (`../`) | State before the agent runs |
|---|---|---|---|
| 1 | `feat/ddia-ch1-visuals` (new, from main) | `FluteInTheRain-ddia-ch1` | published |
| 2 | `feat/ddia-ch2-visuals` (new, from main) | `FluteInTheRain-ddia-ch2` | published |
| 3 | `feat/ddia-ch3-visuals` (new, from main) | `FluteInTheRain-ddia-ch3` | draft on main |
| 4 | `feat/ddia-ch4-visuals` (new, from main) | `FluteInTheRain-ddia-ch4v` (`-ch4` is taken by a stale folder) | draft on main |
| 5 | `feat/ddia-ch5-encoding-evolution` | `FluteInTheRain-ddia-ch5` (exists) | commit the current uncommitted draft first, as a baseline |
| 6 | `feat/ddia-ch6-replication` | `FluteInTheRain-ddia-ch6` (exists) | same as ch.5 |
| 7–14 | `feat/ddia-ch{7..14}-…` (exist, one commit each) | `FluteInTheRain-ddia-ch{N}` (new) | committed draft |

Agent brief (same for every post; only the slug, prefix, worktree path and port change):

1. **De-frame.** Remove "Chapter N…", "the book says/argues/calls…", "Kleppmann argues…" and their VI equivalents, in the body and in `description`/`description_vi`. State the idea directly. Leave frontmatter `sources` and the `ddia` tag alone. Check: `grep -v '^  - {' <file> | grep -ciE 'chapter [0-9]|chương [0-9]|the book|cuốn sách|của sách|sách (nói|khuyên|gọi|đề|cho|bảo|gợi)|kleppmann (says|argues|calls|writes|notes)|ddia (chapter|chương)'` → 0.
2. **Add 2–3 architecture or flow diagrams** where the text describes a system or a request/data path but shows no picture. Prefer:
   - `<AnimatedFlow />` (existing component, read its props and an existing use first) for request/data paths;
   - a new on-page Astro SVG component for static architecture or before/after comparisons.

   Each diagram is placed in both `<En>` and `<Vi>`, with labels in the matching language.
3. **Add one real-world problem.** A real, sourced case (postmortem, engineering blog, paper) that the post's concept explains. Write it as: setup → what went wrong or what was hard → which idea from the post resolves it → a diagram of the system involved. Add every new source to frontmatter `sources` with its `url`. If no suitable real case can be found, say so in the report. Do not invent one.
4. **Density target.** The post ends at or above the style guide target: 3–5 real images, 4–6 on-page figures, 1–2 interactive demos, and every `##` section except the two closing ones has a visual. Report before/after counts.
5. **Verify** with the worktree's own dev server on its assigned port (4341 + N):
   - The page returns 200 with no error overlay, and every island URL returns 200.
   - Headless Chrome screenshots of each new diagram in light, dark, VI and 390px. Read each screenshot and fix any collisions.
6. **Report:** files changed, new sources, before/after visual counts, screenshot paths, anything skipped and why. **Do not commit.**

### C. After each agent

1. Re-run the checks myself: grep, HTTP 200 and island URLs, and spot-check screenshots.
2. Commit on the post's branch:
   - `docs(blog): state ideas directly in the DDIA ch.N post`
   - `feat(blog): add architecture diagrams to the DDIA ch.N post`

   Split into two commits when the changes separate cleanly; otherwise use one commit.
3. Refresh the preview worktree (`preview/ddia-all`): merge all branches and the cover, then run the dev server on 4330 for Khang to review.

### D. Review

One Sonnet review agent per batch, given only that batch's diffs (`git -C <worktree> diff main...HEAD`, or `50dc207...HEAD` for ch.5–6). It checks diagram honesty, collisions, sources and leftover framing. Verify its findings before fixing anything.

## Answers to the builder check

1. **Slugs (fixed; file names in `src/content/blog/`):**

   | Part | Slug |
   |---|---|
   | 1 | `trade-offs-in-data-systems-architecture` |
   | 2 | `reliable-scalable-maintainable-data-systems` |
   | 3 | `data-models-and-query-languages` |
   | 4 | `storage-engines-logs-lsm-btree-columns` |
   | 5 | `encoding-and-schema-evolution` |
   | 6 | `replication-when-copies-disagree` |
   | 7 | `sharding-keys-ranges-hashes-hot-spots` |
   | 8 | `transactions-acid-isolation-anomalies-serializability` |
   | 9 | `trouble-with-distributed-systems-networks-clocks-fencing` |
   | 10 | `consistency-consensus-linearizability-logical-clocks-raft` |
   | 11 | `batch-processing-unix-pipes-shuffle-dataflow-lakehouse` |
   | 12 | `stream-processing-event-logs-cdc-windows-joins` |
   | 13 | `philosophy-of-streaming-systems-unbundling-end-to-end-correctness` |
   | 14 | `doing-the-right-thing-ethics-privacy-algorithmic-bias` |

   A slug with no post file on the branch is handled already. `getSeriesView` (`src/utils/series.ts`) marks it `published: false`, the cover shows it as "soon", and the build passes.
2. **Density target.** The numbers live in the **uncommitted** style guide in the main checkout, so worktrees cut from main do not have them. Paste the target into every agent brief: 3–5 real-world sourced visuals, 4–6 on-page figures, 1–2 interactive demos, a visual in every `##` section except the two closing ones. Also point agents at `/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io/.claude/skills/book-to-post/style-guide.md` and `SKILL.md`.
3. **Cover with many drafts.** This is expected and matches the UI/UX cover: unpublished parts show as "soon" and the pager skips them in production. The DDIA `SeriesCard` appears on `/blog` once the cover is merged, because ch.1–2 are already published.
4. **Two series at once.** No rework is needed. `/blog` maps over every series view, and the category page keeps a series when any of its published parts is in that category (`src/pages/blog/category/[category].astro`). The check is: `/blog` shows two cards; `system-design` shows the DDIA card; `ui-ux` shows only the UI/UX card.
5. **Post agents do not preview the series UI.** The series bar and pager are checked only in `preview/ddia-all`, after merging the cover branch.
6. The "Picking a database" order 3 → 4 → 8 → 7 is deliberate: model, then storage, then transactions, then sharding.
7. **Ch.1–2 are on main and published.** The old `feat/ddia-chapter-1-*` and `feat/ddia-chapter-2-*` branches are merged and stale; ignore them. The new `-visuals` branches are cut from main.
8. **Reuse `../FluteInTheRain-ddia-preview`** as the `preview/ddia-all` worktree.
9. **Icon name collisions** between parallel agents are acceptable. Each agent reports the icons it added, and I resolve duplicates at merge time (identical files are kept; otherwise one is renamed). Fallback when no colour icon fits: use an existing generic icon (`server`, `database`, `queue`, `log`, `storage`, …).

## Left to the builder

- Copy for the cover.
- Which sections get the new diagrams and which real cases to use. Agents propose; I verify.
- Batch composition and order.
- Exact diagram designs, within the style guide.
