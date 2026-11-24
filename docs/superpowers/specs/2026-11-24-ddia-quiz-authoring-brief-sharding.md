# Authoring brief: one case set of the DDIA "sharding" quiz

You write ONE case set: a scenario, a figure, and 5 bilingual multiple-choice questions. You own it end to end:
the JSON, the figure, the checks, the screenshots, the fixes. Nobody hands fixes back to you later.

Read first: this brief, `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md`, `src/data/quiz/types.ts`, and the post
`src/content/blog/sharding-keys-ranges-hashes-hot-spots.mdx` (it alternates `<En>` and `<Vi>` blocks; read the English ones for the
facts and the Vietnamese ones for the exact Vietnamese terms the site already uses). Format examples that are already
finished and approved: the sets of the first quiz, `src/data/quiz/reliable-scalable-maintainable-data-systems/set-03.json`
and `set-06.json`, and their figures `src/components/quiz/figures/HundredServices.astro` and `RolloutTimeline.astro`.
Copy their structure and level of care, not their wording or topics.

## What you create (and nothing else)

- `src/data/quiz/sharding-keys-ranges-hashes-hot-spots/set-NN.json` (NN = your set number, two digits)
- `src/components/quiz/figures/<FigureName>.astro` (the name your task gives you)

Do not edit any other file. Do not commit: the lead commits everything at the end, because several authors
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
    `"Post: Four tools for cooling a hot key"`.
14. `reread.anchor` must be one of the heading slugs listed at the end of this brief.
15. Vietnamese is natural technical Vietnamese. Keep code terms and common jargon (fan-out, p99, shard, replica, hot key, scatter/gather,
    rollback, cache, queue, cascading failure, TTL) as they are, like the post's Vietnamese section does.
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

1. `node scripts/quiz/validate.ts src/data/quiz/sharding-keys-ranges-hashes-hot-spots/set-NN.json`
   Prints every problem; fix until it prints `ok`. (`node --test src/utils/quiz.test.ts` checks all sets
   together and can fail on someone else's unfinished file; use the validator for your own.)
2. Screenshot your set (the dev server on port 4321 is running):
   `node scripts/quiz/shot.mjs 4321 sharding-keys-ranges-hashes-hot-spots set-NN /tmp/quiz-NN --questions`
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
- Cross-set guard (sharding quiz): each technique is "owned" by one set (see the owner column below). Its name and
  mechanism may not appear in the scenario or stems of any set that comes before its owner, and in later sets only as an
  option or a passing mention, never explained as the fix. Read the other 7 scenario rows before you write.
- Post facts that are not confirmed by the source the post cites (see "Claims in the post to handle with care") must not
  be used as the answer or as a distractor that is "wrong because of" that fact.


## The sets

Slots (level / track / type / difficulty per question). Difficulty never decreases inside a set. Same table as the generic brief.

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

(The generic brief lists the set titles of the post 1 quiz; ignore those, use the titles below. In the generic table the
type names of rows 1-8 are as above; `diagram` in 01 means a question that needs the figure.)

### Scenarios

Real cases below were checked against the opened sources on 2026-11-24 (Notion, Discord, Slack posts; AWS DynamoDB
write-sharding page). Numbers marked illustrative are invented: set `context.illustrative: true` and keep them consistent.
Authors must reopen the source they cite in `ref`.

| Set | Title (EN) | Scenario (2-3 sentences) | Grows from sections | Calculations needing `verifiedBy` | Figure | Owns (technique/idea) |
|---|---|---|---|---|---|---|
| 01 | The VACUUM that never finished | Real: Notion, 2021. One RDS Postgres held everything; background `VACUUM` stalled, dead tuples piled up and TXID wraparound (Postgres stops accepting writes) became a real threat, and a bigger instance had run out of headroom. The team chose `workspace_id` as the partition key and split into 480 logical shards over 32 hosts, 15 per host. Source: https://www.notion.com/blog/sharding-postgres-at-notion | When one database node stops being enough; 1. When to shard; Notion's wall, and why multitenant SaaS shards by tenant | `32 x 15 = 480` and a check that a query for one workspace touches 1 shard (small python) | `WorkspaceWall` | when to shard (and when not: read replicas), tenant as partition key, cell idea |
| 02 | Orders keyed by date | Illustrative, modelled on the documented HBase/DynamoDB "today's date as key" trap. A shop stores orders in a key-range sharded table keyed by `order_date, order_id`; 8 shards, 4,000 writes/s, almost all writes carry today's date. Reports filter `order_date BETWEEN ...` and per-customer history is also needed. Ref the AWS page https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-sharding.html (date key example) and the post. | 2. Key-range vs hash; Key-range sharding; Hash sharding and compound keys; the comparison table | writes per shard under range (4,000 on one) vs hash (500 each); python | `TodayRangeHot` | key-range vs hash trade-off, compound `(partition, sort)` key; must not name salting |
| 03 | One more cache node | Illustrative. A 3-node cache cluster routes with `hash(key) % N`; the team adds a fourth node on a quiet afternoon and the database behind it falls over. A 10,000-key sample and the 31 to 32 case let readers compute how many keys move. (Real background for the post: its own benchmark output, "Keys relocated".) | 4. Rebalancing shards; Why `hash(key) % N` fails fatally; Three rebalancing strategies | exact fraction moved 3 to 4 and 31 to 32 (code-output; python over 10,000 integer keys, state hash as the integer itself so it is reproducible); fraction for jump/consistent hashing 1/N | `ModuloShuffle` | `% N` relocation arithmetic, consistent hashing / vnodes as an idea; must not name Notion's 480 or fixed logical shards as the fix in stems |
| 04 | The viral counter | Illustrative, pattern from the AWS write-sharding page. A flash-sale product's view counter takes 60,000 writes/s on one key while the cluster has 20 shards; an AI assistant suggests salting every key in the table with `#00..#99`. Reads of the total are 2,000/s. | 3. Skewed workloads; Four tools for cooling a hot key; the salting callout; hot-key table | write rate per salted key; read fan-out `reads/s x salts` (python) | `SaltedCounter` | key salting, tracked hot-key directory, dedicated shard; must not describe request coalescing as the fix |
| 05 | Search by email | Illustrative, but DynamoDB GSI behaviour is documented. Orders sharded by `order_id`; a new search page filters by `customer_email`. Option A: local index in 100 shards, each answers in 5 ms with 1% of requests to a shard taking 92 ms; option B: async global index. Source for async GSI: AWS DynamoDB docs (open and cite https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html). | 6. Secondary indexes across shards; Local indexes; Global indexes | `1 - 0.99^100` probability a scatter query waits on a slow shard; 1 insert with 3 indexed columns touches 4 shards (python) | `ScatterWaits` | local vs global index, scatter/gather tail latency, async-index staleness |
| 06 | The router that kept the old map | Real: Slack on Vitess (https://slack.engineering/scaling-datastores-at-slack-with-vitess/): app stays unaware of topology, a lock server tracks servers, Vitess handles 99% of query load, 2.3M QPS peak. Scenario (illustrative detail on top): a shard moves from host A to host B; a routing tier caches the shard map, two controllers briefly disagree, and in-flight requests hit A. The article does not mention VTGate, so call it "a routing tier". | 5. Request routing and service discovery; Keeping the shard map consistent; cutover window; DNS remark | none (optional small code-output of a stale-map lookup, then `verifiedBy`) | `StaleShardMap` | routing patterns, split-brain, consensus store vs gossip, cutover window |
| 07 | Tripling the fleet | Real: Notion's re-shard (https://www.notion.com/blog/the-great-re-shard): some shards above 90% CPU at peak, IOPS near the limit, 32 hosts tripled to 96, each host from 15 schemas to 5 and the hash function untouched; PgBouncer split into 4 groups of 24 databases. Zero perceived downtime (about one second of a "saving" spinner in the worst case; do not say "no downtime at all"). | 4. Rebalancing (fixed number of shards, Notion mapping figure); 5. callout on PgBouncer | `480 / 96`, `15 -> 5`, why 512 shards cannot reach 96 hosts evenly (`512 % 96`), connections per proxy group `96 / 4` (python) | `SchemaMove` | fixed number of logical shards, why a highly composite count; reserved for this set (do not name before set 07) |
| 08 | The ping that slowed the cluster | Real: Discord (https://discord.com/blog/how-discord-stores-trillions-of-messages): messages partitioned by channel and a time bucket, 177 Cassandra nodes to 72 ScyllaDB nodes, a big server announcing to `@everyone` sends many reads to one hot partition, Rust data services coalesce identical reads and route by channel ID with consistent hashing, historical-read p99 from 40-125 ms to 15 ms. The article gives the `@everyone` case as a hypothetical; say "can", not "did", unless a source you opened says it happened. Add an illustrative operator decision: an AI suggests adding nodes and enabling automatic rebalance during the spike. | 3. Skewed workloads; A real case: Discord; 4. Automatic vs manual rebalancing (cascade); 5. routing | coalescing arithmetic: 12,000 same-row reads/s become 1 query per coalescing round (python), copy of the quorum wait; no invented p99 | `PingStorm` | request coalescing in front of the DB, why salting does not fix a read storm, cascade from auto-rebalance |

Set order is by rising difficulty: 01 and 02 are easy topics (why and how to cut a key), 03 and 04 compute and judge fixes,
05 and 06 reason about indexes and routing, 07 and 08 combine several ideas and judge real decisions.

### Claims in the post to handle with care

Found while reading the post against the sources opened on 2026-11-24. Do not use the unverified ones as the correct
answer; leave them out or add a source you open.

- Discord "static 10-day windows" and the exact `PRIMARY KEY ((channel_id, bucket), message_id)`: the 2022 article only says
  channel plus a static time window and shows the schema as an image. Say "a time bucket" unless you open Discord's older
  post that states 10 days.
- Discord `@everyone` ping: the article presents it as a hypothetical, not as a recorded incident.
- Slack: the article does not mention VTGate, and the post's "thousands of idle hosts" (Vietnamese text only) is not in
  the source. The source says hotspots plus under-used fleet, 99% of load on Vitess, 50% rise in one week (March 2020).
- Notion: "zero downtime" is "no perceived user downtime, worst case about a second of a saving spinner". The PgBouncer
  detail in the post is looser than the source (4 groups of 24 databases, plus separate clusters for unsharded databases).
  The post says the TXID problem was on a "single giant" DB in 2021; the source's date is October 2021.
- "Early Twitter spent about 3% of its server fleet on Justin Bieber": a repeated anecdote, no source opened; do not use.
- Meta Shard Manager isolating a single hot key on its own shard: not verified; do not use.
- Post says "Cyber Monday" in English and "Black Friday" in Vietnamese; harmless, do not rely on either.
- Table of systems (for example YugabyteDB as key-range; TiDB as a global-index system): defaults vary by version; avoid
  quizzing a product's default unless you open its docs.

## Allowed `reread.anchor` values (English heading slugs of the post)

Generated from the `<En>` headings with github-slugger (note the em dash headings: no hyphen where the dash was).

```
when-one-database-node-stops-being-enough
1-when-to-shardand-sharding-for-multitenancy
notions-wall-and-why-multitenant-saas-shards-by-tenant
2-key-range-vs-hash-sharding
key-range-sharding-fast-scans-dangerous-timestamps
hash-sharding-and-compound-keys
3-skewed-workloads-and-celebrity-hot-spots
four-tools-for-cooling-a-hot-key
a-real-case-discord-and-the-everyone-ping
4-rebalancing-shards
why-hashkey--n-fails-fatally
three-rebalancing-strategies-that-actually-work
automatic-vs-manual-rebalancing-watch-out-for-cascades
5-request-routing-and-service-discovery
keeping-the-shard-map-consistent-without-split-brain
6-secondary-indexes-across-shards
local-indexes-fast-writes-tail-amplified-reads
global-indexes-fast-index-lookups-cross-shard-writes
key-takeaways
review-questions
```
