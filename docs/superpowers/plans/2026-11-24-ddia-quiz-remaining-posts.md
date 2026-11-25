# DDIA quiz for the 9 remaining posts

**Goal:** every DDIA series post has a review quiz of 8 case sets x 5 questions (40 questions), same format as the five finished posts (nfr, models, storage, encoding, replication).

**Architecture:** content only. Per post: `src/data/quiz/<slug>/set-01..08.json` + one figure per set in `src/components/quiz/figures/<Name>.astro`. No code change: `loadQuizSets` globs the folder, `hasQuiz` turns the quiz page on. Format and rules: `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md` and `2026-11-20-ddia-quiz-authoring-brief.md` (generic), plus one `2026-11-24-ddia-quiz-authoring-brief-<post>.md` per post (scenarios, figure names, anchors).

## Global constraints

- Every string `{ en, vi }`; colours via CSS tokens; figures inline SVG, bilingual `tspan`s, unique class prefix, unique figure names across the repo.
- Shared files are not edited (`DiagramIcon`, `AnimatedFlow`, mdx components, `diagram-icons.ts`).
- Authors write only their `set-NN.json` + figure; the lead commits (one commit per post).
- Facts beyond the post need an opened source in `ref`; the post itself may be wrong, authors report it.
- Gate per wave: `node --test`, `npm run build`, validator `ok` on every set, light/dark/VI screenshots read by the lead.

## Waves (one branch + one PR each, user merges)

- [x] **Wave 1** `feat/ddia-quiz-wave-1`: `trade-offs-in-data-systems-architecture`, `sharding-keys-ranges-hashes-hot-spots`, `transactions-acid-isolation-anomalies-serializability`
- [x] **Wave 2** `feat/ddia-quiz-wave-2`: `trouble-with-distributed-systems-networks-clocks-fencing`, `consistency-consensus-linearizability-logical-clocks-raft`, `batch-processing-unix-pipes-shuffle-dataflow-lakehouse`
- [x] **Wave 3** `feat/ddia-quiz-wave-3`: `stream-processing-event-logs-cdc-windows-joins`, `philosophy-of-streaming-systems-unbundling-end-to-end-correctness`, `doing-the-right-thing-ethics-privacy-algorithmic-bias`

## Steps per wave

- [ ] Brief agents (1 per post, read-only on code) write `specs/2026-11-24-ddia-quiz-authoring-brief-<post>.md`: 8 scenarios with a real incident or concrete case, figure names, slot table, allowed `reread.anchor` list. Calculations are optional per set: the "Calculations" column may say "none" (Khang, 2026-11-25). Lead reads them for overlap and invented facts.
- [ ] Author agents (1 per set, parallel) write set + figure, run validator + screenshots, report.
- [ ] Lead: full `node --test`, `npm run build`, read screenshots (light EN, dark VI), fact-check risky claims, fix.
- [ ] One commit per post (`content: review quiz for the <post> post (8 cases, 40 questions)`), CHANGELOG entry, push, PR, wait for merge.
