# Authoring brief: one case set of the DDIA "transactions" quiz

You write ONE case set: a scenario, a figure, and 5 bilingual multiple-choice questions. You own it end to end:
the JSON, the figure, the checks, the screenshots, the fixes. Nobody hands fixes back to you later.

Read first: this brief, `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md`, `src/data/quiz/types.ts`, and the post
`src/content/blog/transactions-acid-isolation-anomalies-serializability.mdx` (it alternates `<En>` and `<Vi>` blocks; read the English ones for the
facts and the Vietnamese ones for the exact Vietnamese terms the site already uses). Format examples that are already
finished and approved: the sets of the first quiz, `src/data/quiz/reliable-scalable-maintainable-data-systems/set-03.json`
and `set-06.json`, and their figures `src/components/quiz/figures/HundredServices.astro` and `RolloutTimeline.astro`.
Copy their structure and level of care, not their wording or topics.

## What you create (and nothing else)

- `src/data/quiz/transactions-acid-isolation-anomalies-serializability/set-NN.json` (NN = your set number, two digits)
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
    `"Post: 4. Write skew and phantoms"` (the heading text, as the post prints it).
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

1. `node scripts/quiz/validate.ts src/data/quiz/transactions-acid-isolation-anomalies-serializability/set-NN.json`
   Prints every problem; fix until it prints `ok`. (`node --test src/utils/quiz.test.ts` checks all sets
   together and can fail on someone else's unfinished file; use the validator for your own.)
2. Screenshot your set (the dev server on port 4321 is running):
   `node scripts/quiz/shot.mjs 4321 transactions-acid-isolation-anomalies-serializability set-NN /tmp/quiz-NN --questions`
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

Your set number, slot row and scenario row come from this section; your task message names the set.

### Slot table (level / track / type / difficulty per question)

| Set | Title | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|---|
| 01 | The green dashboard | remember / interview / single / 1 | understand / ai / diagram / 2 | understand / interview / single / 2 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 |
| 02 | Disk in rack 14 | remember / interview / single / 1 | understand / interview / single / 2 | apply / ai / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / ai-review / 4 |
| 03 | A page that calls 100 services | understand / interview / single / 2 | apply / ai / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / ai-advice / 4 | evaluate / interview / scenario / 5 |
| 04 | The feed that melted the database | understand / ai / ai-advice / 2 | apply / interview / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / multi / 4 | evaluate / ai / ai-review / 5 |
| 05 | The code nobody dares touch | remember / interview / single / 2 | understand / ai / ai-review / 2 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 | evaluate / ai / ai-advice / 5 |
| 06 | Friday config push | understand / interview / single / 2 | apply / ai / ai-review / 3 | apply / ai / scenario / 3 | analyze / interview / multi / 4 | evaluate / ai / ai-advice / 5 |
| 07 | One slow server in a hundred | apply / interview / scenario / 3 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 | analyze / ai / multi / 4 | evaluate / interview / scenario / 5 |
| 08 | The second replica died too | apply / ai / ai-review / 3 | apply / interview / scenario / 4 | analyze / ai / multi / 4 | evaluate / interview / scenario / 5 | evaluate / ai / ai-advice / 5 |

The "Title" column above is the slot table's name from the generic brief (post 1); IGNORE those titles. Only the level / track / type /
difficulty of each row applies here. The titles and scenarios of this post are in the next table. Difficulty never decreases inside a set.

### Scenarios and figure names

Each scenario is a starting point. Real incidents are described only as far as the post or a source the lead opened supports
(Mihalcea on Flexcoin, Murdoch on Horizon, Jepsen on MySQL 8.0.34, the post's own text). You may not add details about them
(database product, isolation level, code) that those sources do not state: when a case needs the mechanism spelled out, say "a
reconstruction" or make that part an illustrative table (`context.illustrative: true`). Do not let a set's scenario or figure give away
another set's answers (for example only set 05 names write skew as such, only set 06 names SSI by name).

| Set | Title (EN) | Scenario | Questions grow from (post sections) | Calculations needing `verifiedBy` | Figure |
|---|---|---|---|---|---|
| 01 | The balance that went negative | Flexcoin, March 2014: an attacker sent thousands of simultaneous transfers between accounts, the sending account was overdrawn before balances updated, and 896 BTC left the hot wallet. The scenario shows the owner's account and a simplified check-then-act transfer (labelled as a reconstruction, since Flexcoin's code is not public). Easy questions: what a transaction is, why `BEGIN ... COMMIT` did not help, what a race condition is. | When a database transaction still loses money; 1. What ACID actually guarantees; 3. Preventing lost updates (atomic write only) | none (ids and a simple read-read-write trace at most) | `OverdrawnTransfers` |
| 02 | Four letters on the datasheet | A vendor datasheet says "fully ACID". Illustrative case: an order service with `orders`, `order_items` and an unread-count badge row. A crash hits between the second and third statement; a `CHECK`-less table accepts a negative stock; an ORM turns a deadlock into HTTP 500. Questions map each letter to what the database does and what stays with the application. Optionally mention Horizon's duplicate receipts as an atomicity failure (Murdoch; PEAK 0195561: crash during a GBP 4,000 transfer, two receipts with one session number, the source unit out by GBP 4,000). | 1. What ACID actually guarantees; Single-object vs. multi-object writes | none | `FourLettersOrder` |
| 03 | Two reads, one total | Illustrative bank page: accounts A and B hold 500 each and a transfer of 100 commits between the page's two reads. A report job runs for 20 minutes on the same data. Questions: dirty read versus dirty write under Read Committed, why read skew still happens, why a long report needs a snapshot, what readers and writers wait for. | Read Committed: stopping dirty reads and dirty writes; Read skew and consistent snapshots | the total the page shows when reads straddle the transfer (small, verify with Python) | `SplitReadTotal` |
| 04 | Which tuple does transaction 50 see? | Illustrative PostgreSQL-style MVCC table with `inserted_by`/`deleted_by` columns, several txids, one aborted writer, and one transaction that started while others were open. Questions apply the visibility rules row by row, then ask what vacuum may remove and why a long-open transaction bloats the table. Stays on the post's rules (txid ordering, open transactions hidden, aborted writes hidden). | Inside MVCC and the `REPEATABLE READ` naming trap; Read skew and consistent snapshots | which rows are visible for given txids (write the rules as a Python function and run it) | `TupleVisibility` |
| 05 | One name, four meanings | A team ports a service from PostgreSQL to MySQL (InnoDB) and from Oracle to Db2, and an AI assistant says "just keep `REPEATABLE READ` / `SERIALIZABLE`, same guarantees". Uses the post's table plus the Jepsen result on MySQL 8.0.34 (opened by the lead: at Repeatable Read, lost updates, G-single and monotonic-atomic-view violations were observed on a healthy single node; Serializable passed on a single node). Questions: what each name really gives, which anomalies survive, how to test it (Hermitage). | Inside MVCC and the `REPEATABLE READ` naming trap; 3. Preventing lost updates (automatic detection) | none | `LevelNameMatrix` |
| 06 | The sixth confirm | Starbucks gift cards, 2015 (Homakov; open https://sakurity.com/blog/2015/05/21/starbucks.html before citing details beyond the post): two sessions, same prepared transfer, two confirms at once, a card with 5 USD funded two 5 USD transfers; the first five attempts failed and the sixth worked. Questions: why the session check is not a lock, which of the four fixes closes the gap (atomic `UPDATE ... WHERE balance >= 5`, `FOR UPDATE`, automatic detection, CAS), what an ORM read-modify-write does, what changes with multi-leader/LWW. | 3. Preventing lost updates; A real case: Starbucks gift cards; What changes under multi-leader and leaderless replication | final balances and total created for N overlapping confirms in an illustrative interleaving (Python) | `ConfirmRace` |
| 07 | The last doctor on call | Illustrative hospital roster (the post's doctors example, new numbers: three shifts, two doctors each on call) plus a meeting-room booking check that returns `COUNT = 0`. Questions: why Snapshot Isolation lets this commit, why `FOR UPDATE` helps for the doctors and not for the empty booking range, materializing conflicts, why `UNIQUE` fixes usernames. Do NOT name SSI or 2PL here (set 08 does). | 4. Write skew and phantoms; Why `SELECT ... FOR UPDATE` misses phantoms | the number of doctors on call after each interleaving (Python simulation of two snapshot transactions) | `OnCallSkew` |
| 08 | Serializable at what price | Illustrative payments service picking a serializable strategy for three workloads: a single-shard hot counter (serial execution, VoltDB style), a mixed read-heavy ledger with long reports (2PL versus SSI, PostgreSQL SIREAD, abort 40001 and retry), and a cross-database write plus queue message (XA versus database-internal 2PC over Raft versus `message_id` deduplication). Uses the post's cross-shard figure of about 1,000 writes per second and Brooker's Dec 2024 argument for Snapshot Isolation as framing only. Hardest: judge trade-offs, in-doubt locks, retries. | 5. Three ways to get serializability (all three); 6. Distributed transactions and 2PC; Exactly-once processing without 2PC | throughput of serial execution with a given cross-shard share, and retry cost, from stated formulas (Python) | `SerializablePrice` |

Difficulty ramp: set 01 is entry level (vocabulary, one incident), 02-03 add mechanism, 04-06 apply and diagnose, 07-08 analyze and
evaluate across several techniques, as the slot table requires.

## Known issues in the post (do not build a question that relies on them; report others you find)

- The comparison table says SSI read-only queries "never block writers and never abort". In PostgreSQL a read-only transaction can still
  be aborted when it is part of a dangerous structure (only `READ ONLY DEFERRABLE` waits for a safe snapshot instead). Do not ask it.
- The post's examples of the double-spending write-skew pattern cite Flexcoin and Poloniex, but the sources describe overdrawing one
  account by racing check-then-debit, and do not say which anomaly or isolation level was involved. Treat them as race conditions.
- Python 3.15 appears in the benchmark caption; do not build on that detail.

## Allowed `reread.anchor` values (English heading slugs of the post)

```
when-a-database-transaction-still-loses-money
1-what-acid-actually-guarantees
single-object-vs-multi-object-writes
2-weak-isolation-read-committed-and-mvcc
read-committed-stopping-dirty-reads-and-dirty-writes
read-skew-and-consistent-snapshots
inside-mvcc-and-the-repeatable-read-naming-trap
3-preventing-lost-updates
what-changes-under-multi-leader-and-leaderless-replication
a-real-case-starbucks-gift-cards
4-write-skew-and-phantoms
why-select--for-update-misses-phantoms
5-three-ways-to-get-serializability
1-actual-serial-execution-single-threaded--stored-procedures
2-two-phase-locking-2pl--ss2pl
3-serializable-snapshot-isolation-ssi
6-distributed-transactions-and-2pc
two-phase-commit-a-system-of-promises
heterogeneous-xa-vs-homogeneous-raft-backed-2pc
exactly-once-processing-without-2pc
key-takeaways
review-questions
```
