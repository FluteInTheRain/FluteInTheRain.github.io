# Authoring brief: one case set of the DDIA "unbundling the database / end-to-end correctness" quiz

You write ONE case set: a scenario, a figure, and 5 bilingual multiple-choice questions. You own it end to end:
the JSON, the figure, the checks, the screenshots, the fixes. Nobody hands fixes back to you later.

Read first: this brief, `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md`, `src/data/quiz/types.ts`, `src/components/quiz/QuizContext.astro`, and the post
`src/content/blog/philosophy-of-streaming-systems-unbundling-end-to-end-correctness.mdx` (it alternates `<En>` and `<Vi>` blocks; read the English ones for the facts and the Vietnamese ones for the exact Vietnamese terms the site already uses). Format examples that are already finished and approved: `src/data/quiz/replication-when-copies-disagree/set-01.json` with `src/components/quiz/figures/LagOnRead.astro`, `src/data/quiz/reliable-scalable-maintainable-data-systems/set-03.json` with `HundredServices.astro`, and `src/data/quiz/what-is-a-stock-ownership-dividends/set-01.json` for `QuizContext.astro` bullet formatting and inline assumptions.
Copy their structure and level of care, not their wording or topics.

## What you create (and nothing else)

- `src/data/quiz/philosophy-of-streaming-systems-unbundling-end-to-end-correctness/set-NN.json` (NN = your set number, two digits)
- `src/components/quiz/figures/<FigureName>.astro` (the exact name your task gives you)

Do not edit any other file (`src/data/quiz/domains.ts` already registers this post as `'code'`; track `ai` means reviewing something an AI assistant produced). Existing quiz figure names are the files in `src/components/quiz/figures/`; the `Unbundled*` components in `src/components/mdx/` belong to the post, so do not copy their drawings (your figure shows YOUR scenario). Do not commit: the lead commits everything at the end, because several authors share one working tree and parallel commits collide. Do not start a dev server: one is already running on port 4399.

## The audience and the aim

Working engineers. The quiz helps them understand, apply, and answer in interviews, with emphasis on what happens when AI writes or suggests code. Two tracks: `interview` (the kind of thing commonly asked, asked directly) and `ai` (reviewing or questioning something an AI assistant produced). Both are mixed inside a set; your task lists the slot of each question.

## Hard rules (the validator enforces most of them)

1. 5 questions, ids `s<NN>q1` to `s<NN>q5`, `difficulty` never decreasing, following your slot table
   (level, track, type, difficulty).
2. 4 options (`a` to `d`); type `multi` has 5 (`a` to `e`) and exactly two answers.
3. Every wrong option has a `whyWrong` entry naming the misconception behind it.
4. Every string is `{ en, vi }`, both filled.
5. No "all of the above" or "none of the above". No NOT-style negatives. No trick questions.
6. All options of a question have a similar length and tone. The correct one must not be the longest, the most hedged, or the most detailed. Wrong options come from real misconceptions and sound reasonable.
7. Authored answer positions vary: no more than 2 of your 5 answers at the same position (`a` to `d`).
8. Never refer to an option by letter ("(a)", "option b") in any explanation or say-line. The page shuffles the options, so letters would point at the wrong text. Quote the idea instead.
9. Ask directly. No "an interviewer asks" or "a recruiter says" in any stem. The `interview` track is about the topic, not a staged conversation.
10. Calculation questions state EVERY formula the reader needs inside the stem. They test applying the formulas, not remembering them. Never add labels or disclaimers claiming numbers are invented or for demonstration; `context` only contains `{ text, media? }` (no extra flags). Instead, state every assumed figure directly inside the sentence (`"Suppose..."` / `"Giả sử..."`), keep all assumed numbers internally consistent, and never present assumed values as measured production telemetry.
11. Every computed answer is verified by running code (Python is fine). Put the command and its output in `verifiedBy`. A `code-output` question needs `verifiedBy`.
12. A question must be answerable from its scenario alone (plus general knowledge it teaches in the explanation). No stem may contain or imply another question's answer. Read each stem with the others hidden.
13. Facts beyond the post need an external source in `ref` (a URL you actually opened) and only well-established practice. If a point is contested or only from a blog, leave it out. Post-based questions use `ref` such as `"Post: Case: GitHub's 43 seconds"`.
14. `reread.anchor` must be one of the heading slugs listed at the end of this brief.
15. Vietnamese is natural technical Vietnamese. Keep code terms and common jargon (`dual write`, `system of record`, `derived data`, `CDC`, `log`, `offset`, `shard`, `consumer`, `stream join`, `replay`, `reprocessing`, `backfill`, `event time`, `processing time`, `2PC`, `idempotency key`, `request_id`, `retry`, `backoff`, `jitter`, `thundering herd`, `end-to-end`, `total order broadcast`, `consensus`, `Lamport timestamp`, `CRDT`, `materialized view`, `write path`, `read path`, `local-first`, `compensating transaction`, `timeliness`, `integrity`, `checksum`, `Merkle tree`, `scrubbing`) as they are, like the post's Vietnamese section does.
16. Scenario formatting (`QuizContext.astro`): write `context.text.en` and `context.text.vi` as **short paragraphs** (one paragraph per line separated by `\n`) and **`• ` bullet lines** (consecutive lines starting with `"• "`, **one number or fact per bullet**), never a single dense block of prose. `QuizContext.astro` turns `• ` lines into `<ul><li>` lists and formats backticked `` `...` `` spans as `<code class="quiz-formula">`. Stems and explanations may also use `\n` for line breaks and `- ` for formula lines.
17. `explanation.say`: for `interview` questions, a line a candidate could say aloud. For `ai` questions, a review habit ("when AI gives X, check Y").
18. Style: short sentences, plain words. Explain the idea before the detail. Do not copy the sample case's wording; copy its structure.

## The figure

One inline-SVG Astro component, no images, no external fonts or libraries. It follows the site's drawing rules (`.claude/skills/book-to-post/SKILL.md`, section "B. Diagrams & Visuals: drawn on the page"; the reference figure is `src/components/mdx/FaultVsFailure.astro`; icons only through `src/components/mdx/DiagramIcon.astro`, keys in `src/data/diagram-icons.ts`, never edit shared components).

- Placement: the figure sits in the LEFT column under the scenario text, about 600px wide on desktop and full width on a phone. So: `viewBox` about 580 wide, labels 13 to 15px at that width, svg `width: 100%`, no horizontal scroll (keep any `min-width` at or below 360px). Root element is a `div` (not `<figure>`) with no `<figcaption>`: the page adds a centred caption from the `alt` text in the JSON.
- Page font only, inherited. NO monospace, no `font-family`. Numbers use `font-variant-numeric: tabular-nums`.
- Colours only from site tokens (`var(--text)`, `--text-body`, `--text-muted`, `--bg-alt`, `--border`, `--red`, `--red-tint-bg`, `--gold`, `--gold-tint-bg`, `--act-2`, `--bg`), never a hex colour, so light and dark both work. Red marks only the problem, gold marks the safe path.
- Words in the figure: sentence case, plain words, no ALL CAPS, no emoji, no hype. Vietnamese must read as natural Vietnamese, not word by word. Never put labels saying numbers are example/sample values inside the figure or `alt`.
- Bilingual text as `<text><tspan data-lang-en>..</tspan><tspan data-lang-vi>..</tspan></text>`.
- No `<marker>`, `<pattern>`, `<filter>`, `<clipPath>` or any `id`s (the page renders each figure in two languages; draw arrowheads as plain polygons).
- Use colour icons through `DiagramIcon` for real things (`server`, `db`, `network`, `clock`, `stopwatch`, `hourglass`, `lock`, `key`, `cloud`, `disk`, `laptop`, `warning`, `ok`, `fail`, `retry`, `worker`, `shield`, `github`, `cloudflare`, etc.), flat shapes otherwise. Make it a real teaching picture of the mechanism with the numbers of your scenario, not a plain box diagram.
- Scoped `<style>` with a class prefix unique to your figure.
- The figure and its `alt` must never show or state the answer to a question or a computed result. Reference it from the JSON in `context.media`: `{ "kind": "figure", "component": "<FigureName>", "alt": { "en": "...", "vi": "..." } }`; the `alt` is one clear sentence in both languages describing the picture.
- A `code` media item (`{ "kind": "code", "lang": "java", "code": "..." }`) is for short snippets inside questions.

## How to check your work

1. `node scripts/quiz/validate.ts src/data/quiz/philosophy-of-streaming-systems-unbundling-end-to-end-correctness/set-NN.json`
   Prints every problem; fix until it prints `ok`. (`node --test src/utils/quiz.test.ts` checks all sets together and can fail on someone else's unfinished file; use the validator for your own.)
2. Screenshot your set (the dev server on port 4399 is running):
   `node scripts/quiz/shot.mjs 4399 philosophy-of-streaming-systems-unbundling-end-to-end-correctness set-NN /tmp/quiz-NN --questions`
   (use your scratchpad directory instead of `/tmp` if you were given one; retry once if it says the set is missing, the dev server reloads slowly). It writes your scenario and figure in light EN, light VI and dark VI, and every question answered. Open the PNGs with the Read tool and fix what you see: overflowing or clipped labels, unreadable contrast in dark mode, a figure that contradicts the numbers, option text that wraps badly. Never judge widths from character counts, only from the images.
3. Re-read your questions one more time against rules 5 to 12 above. Rerun every verification command.

## Report back (short)

List: the files you wrote; the validator result; for each computed answer the command and output; anything you could not verify or that goes beyond the post, with its `ref`; anything in the design or brief you think is wrong. Do not paste the JSON back.

## Lessons from earlier quizzes (they are rules here)

- Formulas in the stem are written as formulas: put each in backticks, one per line starting with `- `, for example
  ``- `added DB wait = calls × (remote RTT − local RTT)` ``. Text outside backticks stays plain.
- Format `context.text` cleanly with short lines and `• ` bullets (one number or fact per bullet) so `QuizContext.astro` renders readable lists instead of a wall of prose.
- State any invented numbers directly in the sentence (`"Suppose..."` / `"Giả sử..."`). Never add any note or label saying values are hypothetical or for demonstration.
- The validator rejects a correct option that is more than 10 characters longer than every other option. Aim for options of nearly equal length; it is fine for a wrong option to be the longest.
- A stem or the scenario must not name the technique that is the answer of another question of the same set.
- Cross-set guard: each technique or incident below is owned by one set (see the **Owns** column). Do not explain or reveal a later set's mechanism inside an earlier set's scenario, figure, or stems.
- Facts beyond the post need a source you opened (`https://...`). Check your distractors against real practice, and avoid building answers or distractors on any loose claims flagged below.
- `reread.label` must match the heading text of the post section (EN in `label.en`, VI in `label.vi`), not a paraphrase.
- The Vietnamese set title must read as natural Vietnamese (a short phrase, not a word-by-word translation).

- The site owner's two extra rules: no labels such as "illustrative", "minh họa" or "example values" anywhere (assumed numbers go inline with "Suppose" / "Giả sử"), and no comparison with other programming languages.


## The sets

### Slot table (level / track / type / difficulty per question)

Difficulty never decreases inside a set. Total across the 8 sets: 20 `interview` + 20 `ai`; `multi` in sets 04, 06, 07, 08 (4 total); Bloom levels: `remember` 3, `understand` 7, `apply` 14, `analyze` 9, `evaluate` 7.

| Set | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|
| 01 | remember / interview / single / 1 | understand / ai / diagram / 2 | understand / interview / single / 2 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 |
| 02 | remember / interview / single / 1 | understand / interview / single / 2 | apply / ai / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / ai-review / 4 |
| 03 | understand / interview / single / 2 | apply / ai / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / ai-advice / 4 | evaluate / interview / scenario / 5 |
| 04 | understand / ai / ai-advice / 2 | apply / interview / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / multi / 4 | evaluate / ai / ai-review / 5 |
| 05 | remember / interview / single / 2 | understand / ai / ai-review / 2 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 | evaluate / ai / ai-advice / 5 |
| 06 | understand / interview / single / 2 | apply / ai / ai-review / 3 | apply / ai / scenario / 3 | analyze / interview / multi / 4 | evaluate / ai / ai-advice / 5 |
| 07 | apply / interview / scenario / 3 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 | analyze / ai / multi / 4 | evaluate / interview / scenario / 5 |
| 08 | apply / ai / ai-review / 3 | apply / interview / scenario / 4 | analyze / ai / multi / 4 | evaluate / interview / scenario / 5 | evaluate / ai / ai-advice / 5 |


### Scenarios and figure names

Real incidents below were checked against sources opened on 2026-11-25. Do not add undocumented internal details to real cases (Stripe). Whenever a scenario introduces assumed numbers or traces, phrase them explicitly with `"Suppose..."` / `"Giả sử..."` inside short paragraphs and `• ` bullets. The post names none of the other real incidents (the railway story is context only, do not build questions on it).

| Set | Title (EN / VI) | Scenario | Grows from (anchors) | Calculations needing `verifiedBy` | Figure | Owns (concept/fix guard) |
|---|---|---|---|---|---|---|
| 01 | Two stores, two orders / Hai kho, hai thứ tự | Assumed shop (`"Suppose an app writes each product edit to PostgreSQL and then to Elasticsearch..."`): two concurrent edits to the same price land PostgreSQL as `9` then `12` but Elasticsearch as `12` then `9`; search shows `9`, orders show `12`, forever. Team debates dual write vs distributed transaction (XA / 2PC) vs a single log fed by CDC, and what happens when the search cluster is down for five minutes. | `why-safe-databases-still-fail-users` (only the dual-write idea), `1-data-integration-without-total-order`, `funnel-writes-through-one-log` | none | `OrderSwapLedger` | Dual write and why it diverges permanently, system of record, derived data, CDC, one ordered log, fault isolation (log buffers while a consumer is down), why 2PC across heterogeneous tools is a poor fit. Must NOT mention total order broadcast / consensus, causal dependency, Lambda/Kappa, `request_id`. |
| 02 | The unfriend race / Cuộc đua sau khi hủy kết bạn | Post's Alice and Bob case (the post presents it as a "Suppose" story, keep it that way) plus an assumed sharded log: friendships service and messages service log to different shards; the notification worker reads the post event first and joins stale friend data. Suppose one log leader handles `40,000` events/s while the product emits `130,000` events/s. | `why-total-ordering-breaks-down`, `the-ex-partner-notification-race` | Yes: shards needed `ceil(130,000 / 40,000) = 4`; per-shard load `130,000 / 4 = 32,500` events/s (verified with python; no order is defined between events in different shards) | `UnfriendRaceLanes` | Four reasons a global line breaks (shards, regions, microservices, offline clients), total order broadcast = consensus through one leader, causal dependency, three tools (Lamport timestamps, explicit causal reference ids, CRDTs useless once an email/push left), "eventual consistency is not an excuse". Must NOT reveal idempotency keys, replay/reprocessing, or timeliness-vs-integrity vocabulary. |
| 03 | Two gauges, one log / Hai khổ ray, một log | Assumed analytics team (`"Suppose a team rebuilds its order summary view under a new schema from a log of 1.2 billion events..."`): old view keeps serving; new consumer replays from offset `0` at `50,000` events/s while `2,000` new events/s keep arriving; traffic shifted `1%` then more; a Lambda-style batch + stream pair has drifted (two code paths compute daily revenue differently); last year's events replayed today land in today's time windows. | `2-gradual-evolution-by-reprocessing`, `two-derived-views-side-by-side`, `from-lambda-to-unified-reprocessing` | Yes: replay catch-up time `1,200,000,000 / (50,000 - 2,000) = 25,000 s` (about `6.94 h`; the naive `1.2e9 / 50,000 = 24,000 s` ignores arrivals) | `DualViewCutover` | Reprocessing, running old and new views side by side, gradual 1% to 100% shift and instant rollback, Lambda vs unified (Kappa) and logic drift, event time vs processing time, exactly-once output (crashed tasks discard partial writes). Must NOT mention `CREATE INDEX` bootstrap, federated vs unbundled, or `request_id` dedup. |
| 04 | Building an index while writes keep coming / Dựng index khi lệnh ghi vẫn đổ vào | Assumed table (`"Suppose CREATE INDEX scans a consistent snapshot for 600 s while the table receives 300 writes/s..."`): backlog after the scan, then the engine applies the backlog at `3,000` changes/s while `300` changes/s keep arriving. Same three steps used to add a follower replica and to bootstrap Debezium CDC into Kafka. Then federated reads (Postgres FDW, Trino) vs unbundled writes (log as pipe, stream operators as filters, idempotent consumers). | `3-unbundling-the-database`, `unix-pipes-vs-monolithic-engines` | Yes: backlog `300 * 600 = 180,000` changes; catch-up `180,000 / (3,000 - 300) = 66.7 s` (python) | `IndexBootstrapPhases` | Snapshot + replay backlog + ongoing change stream, the same dance for followers and CDC, federated (unifies reads) vs unbundled (unifies writes), Unix-pipe analogy, `multi` `s04q4` on what a federated layer does and does not give. Must NOT discuss stream joins vs RPC, time-dependent joins, or the write/read boundary. |
| 05 | Checkout without the phone call / Thanh toán không cần gọi điện cho dịch vụ tỷ giá | Post's euro-to-dollar checkout: synchronous RPC to an exchange-rate service vs a local stream-table join fed by a rate stream. Suppose `2,500` euro purchases of `€40` are replayed a month later; rate then `1.08`, rate today `1.12`. Also offline-first: a phone reconnects and resumes from its last log offset, and read requests treated as events (data provenance of what the shopper saw). | `replacing-microservice-rpcs-with-stream-joins`, `4-shifting-the-writeread-boundary`, `extending-the-write-path-onto-user-devices`, `reads-are-events-too` | Yes: replay error if today's rate is used: `2,500 * 40 * 1.12 = 112,000` vs correct `2,500 * 40 * 1.08 = 108,000`, so `4,000` dollars wrong (python) | `RateLookupTimeline` | RPC stall vs local join, stream-table join, time-dependent join, write path vs read path (eager vs lazy), resume from log offset, reads as events and provenance, "unbundle only when one engine no longer covers your access patterns". Must NOT mention `request_id`, double charge, TCP, or integrity/timeliness vocabulary. |
| 06 | The $22 charge / Khoản trừ 22 đô | Post's SQL transfer of `$11.00` between accounts `4321` and `1234` in one serializable transaction; the phone loses signal after `COMMIT` leaves the server and before HTTP `200 OK` arrives; the SDK opens a new connection and retries. Assumed volume: `"Suppose 50,000 payments a day and 0.4% lose the response after COMMIT..."`. Saltzer, Reed and Clark (1984) end-to-end argument. | `5-end-to-end-correctness-without-2pc`, `saltzer-reed-and-clarks-end-to-end-argument` | Yes: retried without a key, `50,000 * 0.004 = 200` double charges, `200 * $11 = $2,200` extra (python) | `LostReplyRetry` | Why TCP sequence numbers only protect one connection, why serializable and 2PC do not reach the browser, end-to-end argument (lower layers are optimizations, only endpoints guarantee correctness), application-level duplicates look like new messages, `multi` `s06q4` on which lower-layer mechanisms cannot guarantee application-level correctness. Must NOT name the fix (`Idempotency-Key`, `UNIQUE(request_id)`, partitioned log, backoff/jitter); that belongs to set 07. |
| 07 | One key from tap to table / Một mã duy nhất từ cú chạm tới bảng | Real: Stripe idempotency keys (`https://stripe.com/blog/idempotency`; client sends `Idempotency-Key` on `POST`, server returns the saved result if the first attempt succeeded but the reply was lost, clients use exponential backoff with jitter against thundering herd). Plus the post's `UNIQUE(request_id)` table, and a two-shard payment (`4321` on Shard A, `1234` on Shard B, request `req-7f9a`): append to Shard A's log is the single commit point, processor keeps `seen_ids`, crash then replay re-emits and Shard B drops duplicates. Suppose `10,000` clients retry. | `a-real-case-stripes-idempotency-keys`, `multishard-atomicity-using-partitioned-logs`, `5-end-to-end-correctness-without-2pc` (the `request_id` part) | Yes: backoff waits `100, 200, 400, 800 ms` total `1,500 ms`; `10,000` clients retrying at once vs spread over a `2 s` jitter window `10,000 / 2 = 5,000` per second on average (python) | `RequestIdTrail` | Idempotency key generated by client per user intent, same id all the way to a `UNIQUE` insert, retry gets the cached result, backoff + jitter vs thundering herd, partitioned log by key, atomic commit point, deterministic replay with `seen_ids`, `multi` `s07q4` on what a correct key design needs. Must NOT reopen why TCP/serializable fail (set 06) or discuss apologies/audits (set 08). |
| 08 | Overbooked on purpose / Cố tình bán dư | Post's airline overbooking and Pat Helland's memories, guesses and apologies, with timeliness vs integrity (stale read heals, `$22` instead of `$11` does not), a nightly reconciliation job, disk scrubbing, backup restore drills, Certificate Transparency (Merkle trees, single log leaders). Assumed flight (`"Suppose a flight has 180 seats, sells 189 tickets, and each ticket holder shows up independently with probability 0.92..."`). | `6-timeliness-integrity-and-audits`, `memories-guesses-and-apologies`, `trust-but-verify` | Yes: `P(shows > 180)` with `Binomial(189, 0.92)` is about `0.030`, so about `30` of `1,000` such flights need an apology (python) | `LedgerReconcile` | Timeliness vs integrity and why waiting heals one but not the other, loosely interpreted constraints vs strict uniqueness needing coordination on that key, compensating transaction, nightly sum-of-inputs vs derived balances, scrubbers and restore tests, Merkle tree and Certificate Transparency as scaled audit, `multi` `s08q3` on which checks belong in a self-audit. Must NOT re-teach idempotency keys or TCP scope. |

Use each figure only for its own scenario; the figure must show the scenario, not copy the post's `Unbundled*` diagrams (for example `UnbundledADualWrite`, `UnbundledARace`, `UnbundledBDoubleCharge`). All 8 names were checked with `ls` and do not exist in `src/components/quiz/figures/` or `src/components/mdx/` (checked 2026-11-25). Slot table note: the calculation of set 08 must be a single-step comparison computed in python, `verifiedBy` stores the command and output.

## Real incidents, verified facts, and claims in the post to handle with care

### Verified facts (checked in the post and in a source opened on 2026-11-25)

- **Stripe idempotency** (`https://stripe.com/blog/idempotency`, opened): "accidentally calling it twice would lead to the customer being double-charged"; keys apply to mutating endpoints ("anything under `POST`"), sent in the `Idempotency-Key` header; if the operation succeeded but the response was lost the server "simply replies with a cached result"; clients should use exponential backoff plus random jitter against the thundering herd problem. The page does NOT state a maximum key length or recommend UUIDs (the example key is a random string), and does not say a dropped connection is the exact trigger.
- **End-to-end argument** (`https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf`, opened as PDF text): "The function in question can completely and correctly be implemented only with the knowledge and help of the application standing at the end points of the communication system." and a "sometimes an incomplete version ... may be useful as a performance enhancement" caveat. The duplicate message suppression section says application-level duplicates "look like different messages to the communication system" so the application must suppress them itself.
- **Life Beyond Distributed Transactions** (`https://www.cidrdb.org/cidr2007/papers/cidr07p15.pdf`, opened as PDF text): states most applications use at-least-once messaging and that recipients must be idempotent; discusses avoiding distributed transactions. Do not attribute "memories, guesses, apologies" to it.
- **Building on Quicksand** (`https://arxiv.org/abs/0909.1788`, abstract opened): the abstract mentions probabilistic promises and eventual consistency, not apologies or overbooking. The apology / overbooking framing in the post is Helland's separate "Memories, Guesses, and Apologies" writing, which the post does not list in `sources:` and which I could not open.
- **MySQL bug 73170** (`https://bugs.mysql.com/bug.php?id=73170`, opened): titled "Duplicates in Unique Secondary Index Because of Fix of Bug#68021"; fix for the earlier bug broke InnoDB locking and allowed duplicates in a unique secondary index; fixed in 5.5.40, 5.6.21, 5.7.5. Matches the post's "MySQL once shipped a bug (`#73170`)".
- **Certificate Transparency** (`https://www.rfc-editor.org/info/rfc9162`, opened): RFC 9162 is CT version 2.0 (Dec 2021, Laurie, Messeri, Stradling), obsoletes RFC 6962, status Experimental, append-only logs achieved with Merkle trees.
- **CREATE INDEX = consistent snapshot plus changes since** (`https://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/`, opened): the article says the index is built from "a consistent snapshot at one point in time" and tracks "all the changes that occurred since that snapshot"; also "A materialized view is just a cached subset of the log." That page does NOT contain the "separation of Church and state" phrase or the "fastest network request is no request" line.
- **Local-first essay** (`https://www.inkandswitch.com/essay/local-first/`, opened): has a world map captioned "Server-to-server round-trip times between AWS datacenters in various locations worldwide" citing Bailis et al., "Highly Available Transactions: Virtues and Limitations", VLDB 2014. The `84 ms` to `363 ms` range is only in the image, I could not confirm it as text.
- **Post-only facts** (use `ref` such as `"Post: 5. End-to-end correctness without 2PC"`): the `$11.00` transfer SQL, `$22.00` double charge, `UNIQUE(request_id)` snippet, req-7f9a / `seen_ids` replay, the `$6` short-funds interactive demo, 1% to 100% traffic shift, the Alice and Bob race.

Not verified (could not open): Jay Kreps, *The Log* (archive.org blocked) and *Questioning the Lambda Architecture* (HTTP 403); Kleppmann, Beresford and Svingen, *Online Event Processing* (CACM page returned 403); Pat Helland, *Memories, Guesses, and Apologies*; the Gauge Act 1846 / 1892 / BART railway facts. Do not list these as verified; keep questions on the post's own wording or well-known general practice with the post as `ref`.

### Claims in the post that look loose or unverified (do not build fragile questions on them)

- **EN/VI mismatch, stream-join section**: EN says "Like VisiCalc spreadsheets updating a total cell" while VI says "Giống bảng tính Excel tự tính lại ô tổng". VI also adds a quoted line, *"request mạng nhanh và đáng tin nhất là không gửi request mạng nào cả"*, that the EN text lacks (and the Samza article I opened does not contain it). Do not quote either.
- **EN/VI mismatch, Saltzer quote**: EN presents a direct quote in italics; VI paraphrases it with no quotation marks. The EN wording matches the paper except for "end points" vs "endpoints" (paper: "end points"). Quote only the paper's wording and never test exact punctuation.
- **Stripe overstatement**: EN: Stripe "requires clients to generate an immutable `Idempotency-Key` (a UUID per user action)". The opened Stripe page does not say UUID or "requires"; it is any unique key and idempotency is opt-in. The post's own "A real case" section is more careful: "Stripe's own write-up warns that calling it twice would double-charge". Use the second form; do not claim Stripe mandates UUIDs.
- **Stripe trigger**: the post says the connection "drops before the response arrives"; Stripe's page says the key helps after "a network error" and covers three cases (never arrived, failed midway, succeeded but reply lost). Only the third returns a cached result.
- **"UNIQUE constraints ... enforced safely even below serializable isolation"** (section 5): plausible and DDIA-style, but the post gives no source and real behavior depends on the engine and on the unique index being on the same shard. Do not make it the deciding fact of a question; the MySQL #73170 bug in section 6 shows unique indexes can be buggy.
- **Unsourced engine claims in "Trust, but verify"**: "PostgreSQL once fixed a subtle edge case in serializable isolation" (no version, no link); "Amazon S3 and HDFS ... run background scrubbers" (stated as fact, no S3 source). Use the idea (scrub, compare checksums, restore tests) not the product claims.
- **Helland attribution**: "(and *Building on Quicksand*)" is cited for apologies; the arXiv abstract does not mention apologies. The `Memories, Guesses, and Apologies` source is not in `sources:`.
- **Certificate Transparency**: the post cites RFC 9162 (v2.0, Experimental, obsoletes RFC 6962). Real deployments use the v1 design of RFC 6962 (I did not open it). Test the idea (Merkle-tree append-only logs, single log operator) and never say RFC 9162 is the deployed standard. "Single log leaders" and "immediately catch forged certificates" are not backed by an opened source; "immediately" is too strong.
- **Total order claim**: "Almost all consensus algorithms funnel the stream through one leader, so you cannot scale a single totally ordered line horizontally" is stated without a source in the post (standard DDIA material, not opened here). Fine as general practice; do not assert exact throughput limits.
- **Railway story**: "ran side by side ... for decades until ... 1892", "7-foot broad gauge", BART nonstandard gauge are not sourced beyond the photo; the caption says "for years", the VI body says "hàng chục năm". Avoid.
- **Lambda / Kappa naming**: "Kappa ... a term coined by Jay Kreps" and "Lambda ... Nathan Marz" are standard but I could not open the sources (403). Use the architecture contrast, avoid attribution questions.
- **Heading and table consistency**: section numbering in the EN text jumps because the EN and VI blocks alternate (EN "4. Shifting..." appears before VI "3." finishes). Quiz `reread` links go to EN slugs, so no impact, but do not refer to section numbers in stems.
- **Interactive and figure numbers** (`UnbundledPayment` demo `$6` scenario, `req-7f9a`, `4321` / `1234`, `0286FDB8-...` UUID, `84 ms` to `363 ms`): teaching values, not measured production data. Introduce any reuse with `"Suppose..."` / `"Giả sử..."`.

## Allowed `reread.anchor` values (English heading slugs of the post)

Slugs were read from `dist/blog/philosophy-of-streaming-systems-unbundling-end-to-end-correctness/index.html` (built 2026-11-25 10:45). Use the exact English slug in `reread.anchor`, and the exact EN and VI heading text in `reread.label`. Note: the EN heading is the heading text, with the typographic apostrophe in the two headings that contain one.

| `reread.anchor` | `reread.label.en` | `reread.label.vi` |
|---|---|---|
| `why-safe-databases-still-fail-users` | Why safe databases still fail users | Vì sao database an toàn vẫn làm hỏng dữ liệu |
| `1-data-integration-without-total-order` | 1. Data integration without total order | 1. Tích hợp dữ liệu không cần thứ tự toàn phần |
| `funnel-writes-through-one-log` | Funnel writes through one log | Đưa mọi lệnh ghi qua một file log chung |
| `why-total-ordering-breaks-down` | Why total ordering breaks down | Vì sao thứ tự toàn phần đụng trần |
| `the-ex-partner-notification-race` | The ex-partner notification race | Lỗi race condition khi hủy kết bạn |
| `2-gradual-evolution-by-reprocessing` | 2. Gradual evolution by reprocessing | 2. Tiến hoá dần bằng cách xử lý lại dữ liệu |
| `two-derived-views-side-by-side` | Two derived views side by side | Chạy song song hai khung nhìn suy xuất |
| `from-lambda-to-unified-reprocessing` | From Lambda to unified reprocessing | Từ kiến trúc Lambda sang xử lý lại hợp nhất |
| `3-unbundling-the-database` | 3. Unbundling the database | 3. Tháo rời các mảnh của database |
| `unix-pipes-vs-monolithic-engines` | Unix pipes vs. monolithic engines | Ống dẫn Unix hay database nguyên khối |
| `replacing-microservice-rpcs-with-stream-joins` | Replacing microservice RPCs with stream joins | Thay lời gọi RPC giữa các microservice bằng stream join |
| `4-shifting-the-writeread-boundary` | 4. Shifting the write/read boundary | 4. Dịch ranh giới giữa đường ghi và đường đọc |
| `extending-the-write-path-onto-user-devices` | Extending the write path onto user devices | Đẩy đường ghi vươn tới tận thiết bị người dùng |
| `reads-are-events-too` | Reads are events too | Coi cả lệnh đọc như sự kiện trên stream |
| `5-end-to-end-correctness-without-2pc` | 5. End-to-end correctness without 2PC | 5. Tính đúng đắn đầu-cuối không cần 2PC |
| `saltzer-reed-and-clarks-end-to-end-argument` | Saltzer, Reed, and Clark’s end-to-end argument | Lập luận đầu-cuối (End-to-End Argument) |
| `a-real-case-stripes-idempotency-keys` | A real case: Stripe’s idempotency keys | Ca thực tế: idempotency key của Stripe |
| `multishard-atomicity-using-partitioned-logs` | Multishard atomicity using partitioned logs | Giao dịch nguyên tử liên shard không cần khóa 2PC |
| `6-timeliness-integrity-and-audits` | 6. Timeliness, integrity, and audits | 6. Tính kịp thời, toàn vẹn và tự kiểm toán |
| `memories-guesses-and-apologies` | Memories, guesses, and apologies | Ký ức, phỏng đoán và lời xin lỗi |
| `trust-but-verify` | Trust, but verify | Tin tưởng, nhưng phải kiểm chứng |
| `key-takeaways` | Key takeaways | Điểm rút ra |
| `review-questions` | Review questions | Câu hỏi ôn tập |

Exact slug list:

```
why-safe-databases-still-fail-users
1-data-integration-without-total-order
funnel-writes-through-one-log
why-total-ordering-breaks-down
the-ex-partner-notification-race
2-gradual-evolution-by-reprocessing
two-derived-views-side-by-side
from-lambda-to-unified-reprocessing
3-unbundling-the-database
unix-pipes-vs-monolithic-engines
replacing-microservice-rpcs-with-stream-joins
4-shifting-the-writeread-boundary
extending-the-write-path-onto-user-devices
reads-are-events-too
5-end-to-end-correctness-without-2pc
saltzer-reed-and-clarks-end-to-end-argument
a-real-case-stripes-idempotency-keys
multishard-atomicity-using-partitioned-logs
6-timeliness-integrity-and-audits
memories-guesses-and-apologies
trust-but-verify
key-takeaways
review-questions
```
