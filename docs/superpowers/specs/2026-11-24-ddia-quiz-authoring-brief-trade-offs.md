# Authoring brief: one case set of the DDIA "data system trade-offs" quiz

You write ONE case set: a scenario, a figure, and 5 bilingual multiple-choice questions. You own it end to end:
the JSON, the figure, the checks, the screenshots, the fixes. Nobody hands fixes back to you later.

Read first: this brief, `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md`, `src/data/quiz/types.ts`, and the post
`src/content/blog/trade-offs-in-data-systems-architecture.mdx` (the English text is in `<En>` blocks and the Vietnamese in `<Vi>` blocks; read the English ones for the
facts and the Vietnamese ones for the exact Vietnamese terms the site already uses). Format examples that are already
finished and approved: `src/data/quiz/replication-when-copies-disagree/set-01.json` and its figure `src/components/quiz/figures/LagOnRead.astro`, and `src/data/quiz/reliable-scalable-maintainable-data-systems/set-03.json` with `HundredServices.astro`.
Copy their structure and level of care, not their wording or topics.

## What you create (and nothing else)

- `src/data/quiz/trade-offs-in-data-systems-architecture/set-NN.json` (NN = your set number, two digits)
- `src/components/quiz/figures/<FigureName>.astro` (the name your task gives you)

Do not edit any other file. Existing figure names are the files in `src/components/quiz/figures/`; the `TradeOffs*` and `CloudExitSavings`, `CostOfScaleOut`, `CryptoShredding` components in `src/components/mdx/` belong to the post, so do not copy their drawings (your figure shows YOUR scenario). Do not commit: the lead commits everything at the end, because several authors
share one working tree and parallel commits collide. Do not start a dev server: one is already running on
port 4321.

## The audience and the aim

Working engineers. The quiz helps them understand, apply, and answer in interviews, with emphasis on what
happens when AI writes or suggests code. Two tracks: `interview` (the kind of thing commonly asked, asked
directly) and `ai` (reviewing or questioning something an AI assistant produced). Both are mixed inside a set;
your task lists the slot of each question.

## Hard rules (the validator enforces most of them)

1. 5 questions, ids `s<NN>q1` to `s<NN>q5`, `difficulty` never decreasing, following your slot table
   (level, track, type, difficulty).
2. 4 options (`a` to `d`); type `multi` has 5 (`a` to `e`) and exactly two answers.
3. Every wrong option has a `whyWrong` entry naming the misconception behind it.
4. Every string is `{ en, vi }`, both filled.
5. No "all of the above" or "none of the above". No NOT-style negatives. No trick questions.
6. All options of a question have a similar length and tone. The correct one must not be the longest, the most
   hedged, or the most detailed. Wrong options come from real misconceptions and sound reasonable.
7. Authored answer positions vary: no more than 2 of your 5 answers at the same position (a to d).
8. Never refer to an option by letter ("(a)", "option b") in any explanation or say-line. The page shuffles the
   options, so letters would point at the wrong text. Quote the idea instead.
9. Ask directly. No "an interviewer asks" or "a recruiter says" in any stem. The `interview` track is about the
   topic, not a staged conversation.
10. Calculation questions state EVERY formula the reader needs inside the stem. They test applying the
    formulas, not remembering them. Invented figures are labelled illustrative (`context.illustrative: true`)
    and must be internally consistent.
11. Every computed answer is verified by running code (Python is fine). Put the command and its output in
    `verifiedBy`. A `code-output` question needs `verifiedBy`.
12. A question must be answerable from its scenario alone (plus general knowledge it teaches in the
    explanation). No stem may contain or imply another question's answer. Read each stem with the others hidden.
13. Facts beyond the post need an external source in `ref` (a URL you actually opened) and only well-established
    practice. If a point is contested or only from a blog, leave it out. Post-based questions use `ref` such as
    `"Post: Photoroom: the replica that filled the primary"`.
14. `reread.anchor` must be one of the heading slugs listed at the end of this brief.
15. Vietnamese is natural technical Vietnamese. Keep code terms and common jargon (fan-out, p99, replica, canary,
    rollback, cache, queue, thundering herd, TTL) as they are, like the post's Vietnamese section does.
16. Scenario text and stems may use `\n` for line breaks and `- ` for list lines (the page shows line breaks).
17. `explanation.say`: for `interview` questions, a line a candidate could say aloud. For `ai` questions, a
    review habit ("when AI gives X, check Y").
18. Style: short sentences, plain words. Explain the idea before the detail. Do not copy the sample case's
    wording; copy its structure.

## The figure

One inline-SVG Astro component, no images, no external fonts or libraries. It follows the site's drawing rules (the project's
skill: `.claude/skills/book-to-post/SKILL.md`, section "B. Diagrams & Visuals: drawn on the page"; the reference figure is
`src/components/mdx/FaultVsFailure.astro`; icons only through `src/components/mdx/DiagramIcon.astro`, keys in
`src/data/diagram-icons.ts`, never edit shared components).
- Placement: the figure sits in the LEFT column under the scenario text, about 600px wide on desktop and full width on a phone.
  So: `viewBox` about 580 wide, labels 13 to 15px at that width, svg `width: 100%`, no horizontal scroll (keep any
  `min-width` at or below 360px). Root element is a `div` (not `<figure>`) with no `<figcaption>`: the page adds a centred
  caption from the `alt` text in the JSON.
- Page font only, inherited. NO monospace, no `font-family`. Numbers use `font-variant-numeric: tabular-nums`.
- Colours only from site tokens (`var(--text)`, `--text-body`, `--text-muted`, `--bg-alt`, `--border`, `--red`, `--red-tint-bg`,
  `--gold`, `--gold-tint-bg`, `--act-2`, `--bg`), never a hex colour, so light and dark both work. Red marks only the
  problem, gold marks the safe path.
- Words in the figure: sentence case, plain words, no ALL CAPS, no emoji, no hype. Vietnamese must read as natural Vietnamese,
  not word by word.
- Bilingual text as `<text><tspan data-lang-en>..</tspan><tspan data-lang-vi>..</tspan></text>`.
- No `<marker>`, `<pattern>`, `<filter>`, `<clipPath>` or any `id`s (the page renders each figure in two languages; draw
  arrowheads as plain polygons).
- Use colour icons through `DiagramIcon` for real things (database, server, laptop, users, phone, cloud, ...), flat shapes
  otherwise. Make it a real teaching picture of the mechanism with the numbers of your scenario, not a plain box diagram.
- Scoped `<style>` with a class prefix unique to your figure.
- The figure and its `alt` must never show or state the answer to a question or a computed result. Reference it from the
  JSON in `context.media`: `{ "kind": "figure", "component": "<FigureName>", "alt": { "en": "...", "vi": "..." } }`; the `alt`
  is one clear sentence in both languages describing the picture.
- A `code` media item (`{ "kind": "code", "lang": "sql", "code": "..." }`) is for short snippets inside questions.

## How to check your work

1. `node scripts/quiz/validate.ts src/data/quiz/trade-offs-in-data-systems-architecture/set-NN.json`
   Prints every problem; fix until it prints `ok`. (`node --test src/utils/quiz.test.ts` checks all sets
   together and can fail on someone else's unfinished file; use the validator for your own.)
2. Screenshot your set (the dev server on port 4321 is running):
   `node scripts/quiz/shot.mjs 4321 trade-offs-in-data-systems-architecture set-NN /tmp/quiz-NN --questions`
   (use your scratchpad directory instead of `/tmp` if you were given one; retry once if it says the set is missing, the dev server reloads slowly). It writes your scenario and figure in light EN, light VI and dark VI, and every question answered. Open the PNGs with the Read tool and fix
   what you see: overflowing or clipped labels, unreadable contrast in dark mode, a figure that contradicts
   the numbers, option text that wraps badly. Never judge widths from character counts, only from the images.
3. Re-read your questions one more time against rules 5 to 12 above. Rerun every verification command.

## Report back (short)

List: the files you wrote; the validator result; for each computed answer the command and output; anything you
could not verify or that goes beyond the post, with its `ref`; anything in the design or brief you think is
wrong. Do not paste the JSON back.


## Lessons from the first quiz (they are rules here)

- Formulas in the stem are written as formulas: put each in backticks, one per line starting with `- `, for example
  ``- `rows touched = reads per second × rows per read` ``. Text outside backticks stays plain. The page shows backticked
  text as a formula block (also fine for short code names inside options and explanations).
- The validator rejects a correct option that is more than 10 characters longer than every other option. Aim for options of
  nearly equal length; it is fine for a wrong option to be the longest.
- Do not write a sentence saying the numbers are made up: when `context.illustrative` is true the page already adds that
  note. Say it in the scenario only if the sentence carries other information.
- A stem or the scenario must not name the technique that is the answer of another question of the same set.
- Facts beyond the post need a source you opened. In the first quiz the fact review found a wrong "answer" (a distractor that
  was correct in real practice) and two errors in the source post; check your distractors against real practice, and say in
  your report if the post itself looks wrong anywhere.
- `reread.label` is the heading text of the post section, not a paraphrase.
- The Vietnamese set title must read as natural Vietnamese (a short phrase, not a word-by-word translation).

## The sets

Slot table (level / track / type / difficulty per question). Difficulty never decreases inside a set, and sets rise in
difficulty from 01 to 08. The slot table is the same generic one every DDIA quiz uses; titles and topics are in the next table.

| Set | Q1 | Q2 | Q3 | Q4 | Q5 |
| --- | --- | --- | --- | --- | --- |
| 01 | remember / interview / single / 1 | understand / ai / diagram / 2 | understand / interview / single / 2 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 |
| 02 | remember / interview / single / 1 | understand / interview / single / 2 | apply / ai / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / ai-review / 4 |
| 03 | understand / interview / single / 2 | apply / ai / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / ai-advice / 4 | evaluate / interview / scenario / 5 |
| 04 | understand / ai / ai-advice / 2 | apply / interview / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / multi / 4 | evaluate / ai / ai-review / 5 |
| 05 | remember / interview / single / 2 | understand / ai / ai-review / 2 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 | evaluate / ai / ai-advice / 5 |
| 06 | understand / interview / single / 2 | apply / ai / ai-review / 3 | apply / ai / scenario / 3 | analyze / interview / multi / 4 | evaluate / ai / ai-advice / 5 |
| 07 | apply / interview / scenario / 3 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 | analyze / ai / multi / 4 | evaluate / interview / scenario / 5 |
| 08 | apply / ai / ai-review / 3 | apply / interview / scenario / 4 | analyze / ai / multi / 4 | evaluate / interview / scenario / 5 | evaluate / ai / ai-advice / 5 |

### Scenarios (one per set; your task message names yours)

Sets differ in topic. Each scenario may be used for its set only: a stem or the scenario text of one set must not name or
imply the answer of another set. Real cases must be checked against the source (see "Verified facts" below) before you use
any number; the post alone is enough for the numbers it prints. Illustrative cases need `context.illustrative: true`.

| Set | Title | Scenario | Questions grow from (anchors) | verifiedBy needed | Figure |
|---|---|---|---|---|---|
| 01 | The month-end report | Illustrative. A shop runs orders on one Postgres. On the last day of the month finance runs "revenue per store per month for 3 years" and checkout pages slow to seconds. The team can add a read replica, or copy data into a warehouse with a nightly job. A table of 50 columns and 200 million rows is given with byte widths so a row store and a column store can be compared. | `1-checkout-and-the-monthly-report`, `why-the-report-reads-so-much-more`; OLTP vs OLAP, point query vs scan, ETL, row vs column, HTAP | Yes: bytes read by a one-column sum on a row store vs a column store (state the formulas in the stem) | `CheckoutReportScan` |
| 02 | Two stores, one order | Illustrative. An app writes each new order to Postgres and, in the same request, to a search index. One write to the index fails after the Postgres commit; support finds orders that customers can see but search cannot. The team asks which store is right, and whether to rebuild or patch. | `2-where-the-truth-lives` (system of record, derived data, dual write, CDC, materialized view, "derived data can always be rebuilt") | No | `DualWriteDrift` |
| 03 | Four days of silence | Real: Hex, 3 to 7 November 2022 (post section 2, source `https://hex.tech/blog/we-took-down-production/`). A rebuilt tunnel changes a host fingerprint, Fivetran fails silently, Postgres keeps unread WAL, the disk fills, about 2 h 40 min down. Use the post's figures (free disk about 0.85 TiB on 3 Nov, zero around noon on 7 Nov); the muted free-disk alert and the missing sync-failure alert are the lessons. | `2-where-the-truth-lives` (the Hex paragraphs after the heading), the checklist paragraph after the chart | Yes: days of runway left at a constant fill rate (illustrative rate, label it) | `SilentWalFill` |
| 04 | The replica that held 31.7 TB | Real: Photoroom (post section 2, `photoroom-the-replica-that-filled-the-primary`, source `https://www.photoroom.com/inside-photoroom/how-a-read-replica-almost-took-down-its-primary-database`). A backfill produces changes faster than the replica applies them; WAL on the primary goes from about 5 GB to 31.7 TB; disk about 43 TB of a 60 TB limit; 5 to 7 days left. Fixes: pause the job, give the replica room, cap retained WAL, restartable backfills. Do NOT name the Hex case or the stalled-reader cause of set 03 in this set. | `photoroom-the-replica-that-filled-the-primary` and the paragraph after the figures about `max_slot_wal_keep_size` and its price (replica may need a rebuild) | Yes: how long until a 60 TB limit at a stated daily growth, or catch-up time when apply rate < produce rate (illustrative rates, label them) | `RetainedWalClimb` |
| 05 | Rent, own, or half-way | Real: 37signals (post section 3, sources in the post: DHH 2022 and 2023 posts). HEY launches with 300,000 sign-ups in 3 weeks against a forecast of 30,000 in 6 months; by 2022 load is steady and managed databases and search cost over half a million dollars a year; cloud bill 3.2 M to 1.3 M, about 700,000 USD of Dell hardware, same team. Plus the storage and compute separation idea (Snowflake) as a design that suits spiky load. | `3-rent-or-own`, `storage-and-compute-split-up`, `ops-does-not-go-away` | Yes: yearly saving and payback time from the post's numbers (3.2 M, 1.3 M, 700 k) | `RentOwnSteps` |
| 06 | One hundred forty services | Real: Segment, 2017 (post section 4, `microservices-solve-a-people-problem`, source `https://www.twilio.com/en-us/blog/developers/best-practices/goodbye-microservices`). 140+ services, one per destination, 3 engineers busy keeping them alive, a test suite up to an hour, shared-library fixes touching dozens of repos; merged into one service. Questions ask when microservices pay off (a people problem) and what the merge did not remove. | `microservices-solve-a-people-problem`, `4-one-machine-or-many` (what the network costs, when distribution pays off) | No | `ServiceSprawl` |
| 07 | Every frame took a trip | Real: Prime Video audio/video monitoring, 2023 (post section 4, `prime-video-and-the-serverless-bill`, archived source in the post). Serverless version hits a hard limit at about 5% of expected load: Step Functions state transitions per second of stream, S3 round trips to pass frames; moving to one process on ECS/EC2 cut infrastructure cost over 90%. Add the COST idea (a laptop thread beating 128-core systems) as a second lens: is the distribution earning its place? | `prime-video-and-the-serverless-bill`, `4-one-machine-or-many` (COST, single-node databases, the "When does going distributed pay off" callout) | Yes: per-run cost with illustrative per-transition and per-call prices (state them), compared before and after | `FrameTripBill` |
| 08 | Forget one user | Real: Spotify, 2018 (post section 5, source `https://engineering.atspotify.com/2018/09/scalable-user-privacy`). Over a thousand microservices; a delete endpoint per service is "simply not viable"; personal data is stored encrypted under per-user keys, a central key service (Padlock) hands keys out, built for one million lookups per second; deleting the keys makes every copy unreadable. Hardest set: questions weigh what the technique fixes (copies in immutable logs, warehouse, caches) and what it adds (a central key service as a single point of failure, key backup, the key store itself must forget), plus data minimisation. | `5-data-about-people`, `key-takeaways` | No | `KeyShredLedger` |

Coverage check: sets 01 to 08 cover all five sections of the post, the four trade-offs and the people-data trade-off, and use
six real cases (Hex, Photoroom, 37signals, Segment, Prime Video, Spotify) plus two illustrative cases (sets 01 and 02).

### Verified facts (opened sources, 2026-11-24; re-open before relying on more detail)

- Photoroom: WAL "from around 5 GB to 31.7 TB"; replica lag growing about 0.7 days per day; disk about 43 TB against a 60 TB hard limit; 5 to 7 days left; backfill expected to run several more weeks; afterwards about 13 TB in use. `max_slot_wal_keep_size` is listed as guidance in the source; do not state it was applied during the incident. Postgres enforces it at checkpoints, and removed WAL the replica still needs forces a rebuild.
- Hex: tunnel recreated on Thu 3 Nov 2022; Fivetran failed (host fingerprint changed); free-disk alert had been muted as noisy; RDS grew the disk once (to 1.8 TB), then ran an optimisation step (75% after 12 hours); recovery by promoting the read replica; fixes: alerts back on, Fivetran failure alert, plan to use Postgres 13 WAL size limit. The source's own dates and durations are inconsistent (see below), so avoid questions that hinge on the exact outage clock.
- Spotify: "over a thousand (micro)services"; endpoint-per-service "simply not viable"; per-user keys, also split by data category; Padlock designed for "one million lookups per second"; reads served via Cassandra with memcached, a few seconds of staleness tolerated; the post itself names a central single point of failure.
- 37signals, Segment, Prime Video, COST, Snowflake: numbers as printed in the post; open the source in `sources:` before using any extra number.

### Claims in the post that look wrong or loose (do not build a question on them without checking)

- Hex: the source says "about 2 hours 40 minutes" and also describes more than 12 hours waiting on the RDS optimisation, and its own header and body disagree on the date (7 vs 11 November). The post uses 7 November and 2 h 40 min; avoid asking for either.
- Post, Photoroom callout: it lists `max_slot_wal_keep_size` among what they "set", while the source presents it as a recommendation not clearly applied in the incident.
- Post key takeaway: "saved about $1.9 million a year" is 3.2 M minus 1.3 M, a run-rate difference, and ignores the hardware spend and the S3 remainder; fine for arithmetic, loose as a claim about total saving.

## Allowed `reread.anchor` values (English heading slugs of the post)

```
what-real-teams-actually-did
1-checkout-and-the-monthly-report
why-the-report-reads-so-much-more
2-where-the-truth-lives
photoroom-the-replica-that-filled-the-primary
3-rent-or-own
storage-and-compute-split-up
ops-does-not-go-away
4-one-machine-or-many
microservices-solve-a-people-problem
prime-video-and-the-serverless-bill
5-data-about-people
key-takeaways
review-questions
```
