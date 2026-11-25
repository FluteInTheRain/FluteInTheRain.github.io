# Authoring brief: one case set of the DDIA "consistency and consensus" quiz

You write ONE case set: a scenario, a figure, and 5 bilingual multiple-choice questions. You own it end to end:
the JSON, the figure, the checks, the screenshots, the fixes. Nobody hands fixes back to you later.

Read first: this brief, `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md`, `docs/superpowers/specs/2026-11-24-quiz-ai-track-by-domain.md`, `src/data/quiz/types.ts`, and the post
`src/content/blog/consistency-consensus-linearizability-logical-clocks-raft.mdx` (it alternates `<En>` and `<Vi>` blocks; read the English ones for the facts and the Vietnamese ones for the exact Vietnamese terms the site already uses). Format references:
- `src/data/quiz/what-is-a-stock-ownership-dividends/set-01.json` for `context.text` line/bullet formatting (`src/components/quiz/QuizContext.astro`),
- `src/data/quiz/replication-when-copies-disagree/set-01.json` with `src/components/quiz/figures/LagOnRead.astro`, and `src/data/quiz/reliable-scalable-maintainable-data-systems/set-03.json` with `src/components/quiz/figures/HundredServices.astro` for `code`-domain question structure (`interview` + `ai`) and inline-SVG quiz figures.

Copy their structure and level of care, not their wording or topics.

## What you create (and nothing else)

- `src/data/quiz/consistency-consensus-linearizability-logical-clocks-raft/set-NN.json` (NN = your set number, two digits)
- `src/components/quiz/figures/<FigureName>.astro` (the exact name assigned to your set)

Do not edit any other file. `src/data/quiz/domains.ts` already maps `consistency-consensus-linearizability-logical-clocks-raft` to `'code'`, so do not touch it. Existing figure names are in `src/components/quiz/figures/`; the `Consensus*` components in `src/components/mdx/` belong to the post, so do not copy their drawings or exact numbers (draw YOUR scenario). Do not commit: the lead commits everything at the end, because several authors share one working tree and parallel commits collide. Do not start a dev server: one is already running on port 4321.

## The audience and the aim

Working engineers. The quiz helps them understand, apply, and answer in interviews, with emphasis on what happens when AI writes or suggests code or distributed-systems architecture. Because this post is in the `code` domain, two tracks mix inside every set: `interview` (the kind of thing commonly asked, asked directly) and `ai` (reviewing or questioning code or architectural advice an AI assistant produced). Your task lists the slot of each question.

## Hard rules (the validator enforces most of them)

1. 5 questions, ids `s<NN>q1` to `s<NN>q5`, `difficulty` never decreasing, following your slot table
   (level, track, type, difficulty).
2. 4 options (`a` to `d`); type `multi` has 5 (`a` to `e`) and exactly two answers.
3. Every wrong option has a `whyWrong` entry naming the misconception behind it.
4. Every string is `{ en, vi }`, both filled.
5. No "all of the above" or "none of the above" (EN or VI). No NOT-style negatives. No trick questions.
6. All options of a question have a similar length and tone. The correct one must not be the longest, the most hedged, or the most detailed (`validate.ts` rejects a correct single-answer option that is more than 10 characters longer in `en` than every other option). Wrong options come from real misconceptions and sound reasonable.
7. Authored answer positions vary: no more than 2 of your 5 answers at the same position (`a` to `d`).
8. Never refer to an option by letter (`"(a)"`, `"option b"`) in any explanation or say-line. The page shuffles the options, so letters would point at the wrong text. Quote the idea instead.
9. Ask directly. No `"an interviewer asks"` or `"người phỏng vấn"` in any stem. The `interview` track is about the topic, not a staged conversation.
10. Invented parameters and assumptions: never add disclaimers claiming numbers are "for example only" or "invented" in `context.text`, stems, options, figure text, or `alt`. Whenever you introduce hypothetical cluster sizes, latencies, clock skews, or request rates, state the assumption directly inside the sentence (`"Suppose ..."` / `"Say ..."` in English, `"Giả sử ..."` in Vietnamese) so it cannot be misread as a measured production figure.
11. Calculation questions state EVERY formula the reader needs inside the stem. Put each formula in backticks, one per line starting with `- ` (for example ``- `overlap = w + r - n` ``). Text outside backticks stays plain. They test applying the formulas, not remembering them.
12. Every computed answer (and any `code-output` question) is verified by running code (Python is fine). Put the exact command and its output in `verifiedBy`.
13. A question must be answerable from its scenario alone (plus general knowledge it teaches in the explanation). No stem may contain or imply another question's answer, and neither the scenario nor any stem may name the technique that is the answer of another question in the same set. Read each stem with the others hidden.
14. Cross-set guard: each set owns distinct concepts and techniques (see the "Owns" column below). Do not spoil or leak another set's owned mechanism in your scenario or figure.
15. Facts beyond the post need an external source in `ref` (a URL you actually opened) and only well-established practice. If a point is contested or unverified, leave it out. Post-based questions use `ref` matching the post heading, e.g. `"Post: 3. ID generators and logical clocks"`.
16. `reread.anchor` must be one of the 20 exact heading slugs listed at the end of this brief, and `reread.label` must match the exact heading text of that post section (both EN and VI), not a paraphrase.
17. Vietnamese is natural technical Vietnamese. Keep code terms and common jargon (`linearizability`, `serializability`, `quorum`, `read repair`, `split brain`, `clock skew`, `NTP`, `Lamport`, `HLC`, `CAS`, `fetch-and-add`, `consensus`, `term`, `epoch`, `Pre-Vote`, `ReadIndex`, `lease`, `TTL`, `fencing token`, `watch`, `observer`, `p99`, `shard`, `leader`, `follower`, `replica`) as they are, matching the post's `<Vi>` section. Vietnamese set titles must read as natural Vietnamese phrases, not word-by-word translations.
18. Scenario formatting (`QuizContext.astro`): write `context.text` (`en` and `vi`) as short paragraphs separated by `\n`, with consecutive lines starting with `• ` for bullet lists (one fact, actor, or number per bullet; backticks `` `...` `` render as formula/code spans). Never write one dense wall of prose. In question stems (`QuizText.astro`), use `\n` for line breaks and `- ` for list lines.
    Example `context.text` shape:
    ```text
    "Suppose a key-value store spreads data across 5 replicas.\nCurrent state:\n• `n = 5`, `w = 3`, `r = 3`\n• `R1` and `R2` hold `x = 1`; `R3` to `R5` hold `x = 0`\n• round-trip latency per hop: `25 ms`"
    ```
19. `explanation.say`: for `interview` questions, a crisp sentence a candidate could say aloud. For `ai` questions, a review habit (`"When AI suggests X, check Y"`).
20. Style: short sentences, plain words. Explain the idea before the detail.

## The figure

One inline-SVG Astro component at `src/components/quiz/figures/<FigureName>.astro`, no images, no external fonts or libraries. Follow `.claude/skills/book-to-post/SKILL.md` ("B. Diagrams & Visuals: drawn on the page") and `src/components/mdx/FaultVsFailure.astro`; icons only through `src/components/mdx/DiagramIcon.astro` using keys from `src/data/diagram-icons.ts` (never edit shared components).

- Placement: sits in the LEFT column under the scenario text (~600px wide on desktop, full width on mobile). Use `viewBox="0 0 580 <H>"`, labels `13` to `15px` at that width, `svg { display: block; width: 100%; height: auto; }`, no horizontal scroll (keep any `min-width` at or below `360px`). Root element is a `<div>` (not `<figure>`) with no `<figcaption>` (the page adds a centered caption from `context.media[0].alt`).
- Page font only, inherited. NO monospace, no `font-family`. Numbers use `font-variant-numeric: tabular-nums`.
- Colours only from site tokens (`var(--text)`, `var(--text-body)`, `var(--text-muted)`, `var(--bg-alt)`, `var(--border)`, `var(--red)`, `var(--red-tint-bg)`, `var(--gold)`, `var(--gold-tint-bg)`, `var(--act-2)`, `var(--bg)`), never a hex colour, so light and dark modes both work. Red marks only the problem; gold marks the safe path.
- Words in the figure: sentence case, plain words, no ALL CAPS, no emoji, no hype, no disclaimer notes. Vietnamese must read naturally.
- Bilingual text as `<text><tspan data-lang-en>..</tspan><tspan data-lang-vi>..</tspan></text>`.
- No `<marker>`, `<pattern>`, `<filter>`, `<clipPath>`, `<defs>`, or any `id`s (the page renders EN and VI copies together; draw arrowheads as plain `<polygon>`).
- Use colour icons through `DiagramIcon` for real things (`server`, `db`, `laptop`, `phone`, `user`, `lock`, `key`, `clock`, `stopwatch`, `etcd`, `kafka`, `mongodb`, `log`, `worker`, `network`, etc.), flat shapes otherwise. Make it a real teaching picture of the mechanism using the exact numbers of your scenario, not a generic box diagram.
- Scoped `<style>` with a class prefix unique to your figure (e.g., `qfig-lf-`, `qfig-qrc-`, ...).
- The figure and its `alt` must NEVER show or state the answer to a question or a computed result. Reference it in JSON `context.media`:
  `{ "kind": "figure", "component": "<FigureName>", "alt": { "en": "...", "vi": "..." } }`.
- Short code snippets inside questions use `{ "kind": "code", "lang": "go", "code": "...", "caption": { "en": "...", "vi": "..." } }`.

## How to check your work

1. Validate your JSON on its own:
   `node scripts/quiz/validate.ts src/data/quiz/consistency-consensus-linearizability-logical-clocks-raft/set-NN.json`
   Fix every reported problem until it prints `ok`. (`node --test src/utils/quiz.test.ts` runs across all sets and can fail on someone else's unfinished set; use `validate.ts` while working.)
2. Screenshot your set (the dev server on port 4321 is already running):
   `node scripts/quiz/shot.mjs 4321 consistency-consensus-linearizability-logical-clocks-raft set-NN /tmp/quiz-NN --questions`
   (Use your scratchpad directory instead of `/tmp` if you were given one; retry once if it says the set is missing while Astro reloads.) Inspect every generated PNG (`light-en`, `light-vi`, `dark-vi`, and `q1`–`q5`) with `read_file` and fix overflowing/clipped labels, unreadable dark-mode contrast, inconsistent numbers, or badly wrapping options. Never judge widths from character counts.
3. Re-read your questions against rules 5 to 16 above and re-run every `verifiedBy` Python command.

## Report back (short)

List: the files you wrote; the validator result; for each computed answer the Python command and output; anything you could not verify or that goes beyond the post with its `ref`; any flaw you spotted in the post. Do not paste the JSON back.

---

## The sets

### Slot table (level / track / type / difficulty per question)

Difficulty never decreases inside a set; `multi` appears only in sets 04, 06, 07, 08. Across all 8 sets: 20 `interview` + 20 `ai`; 3 `remember`, 7 `understand`, 14 `apply`, 9 `analyze`, 7 `evaluate`.

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

### Scenarios and figure names (one per set; your task names yours)

Keep every set distinct. Do not leak another set's owned concepts or answers in your scenario, figure, or stems. Use the exact figure component name assigned to your set.

| Set | Title (EN) | Scenario & focus | Grows from (post sections) | `verifiedBy` needed | Figure | Owns (keep out of other sets) |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Before and after the flip | Suppose a feature-flag register `maintenance_mode` starts `"off"` and four clients log request intervals on a millisecond axis: `Writer` runs `Write(maintenance_mode, "on")` during `[100, 420] ms` (`OK`), `Client M` reads `"off"` during `[80, 150] ms`, `Client N` reads `"on"` during `[210, 290] ms`, and `Client P` reads `"off"` during `[310, 390] ms`. Q1 defines linearizability; Q2 (`diagram`) asks why an AI reading `LinearizableFlip` is wrong to say `P` is valid because `Writer` has not replied until `420 ms` (`N` already finished with `"on"` at `290 ms`); Q3 contrasts linearizability vs serializability vs strict serializability (CockroachDB vs Spanner/FoundationDB); Q4 checks valid flip timestamps / interval inequalities for a concurrent `Read`/`CAS` trace; Q5 analyzes why an async lagging replica breaks linearizability and why `SERIALIZABLE` isolation on stale replicas does not restore it. | `1-linearizability-the-single-copy-illusion`, `operation-bars-and-atomic-flip-points`, `linearizability-vs-serializability` | Yes: Python interval check verifying valid non-decreasing linearization points inside `[start, end]` bars (Q4) | `LinearizableFlip` | Operation bars, atomic flip/linearization points, register (`Read`/`Write`/`CAS`) semantics, linearizability vs serializability vs strict serializability |
| 02 | The quorum that still read stale | Suppose a leaderless store holds `n = 5` replicas (`R1` to `R5`) with `w = 3`, `r = 3`, and `25 ms` per network hop. `Writer` starts `Write(x = 1, v1)`: `R1` and `R2` update immediately while `R3..R5` still hold `x = 0 (v0)`. `Client A` reads `{R1, R2, R3}` (`r = 3`) and sees `1` without synchronous repair; `Client B` starts after `A` returns, reads `{R3, R4, R5}`, and sees stale `0`. Also bring in the post's cross-channel video upload + fast job queue race and the `MongoDB 4.2.6` Jepsen finding (`w: 1`/local defaults vs `majority`). Q1 covers which replication designs can stay linearizable (`Single-leader`, `Consensus`, `Multi-leader`, `Dynamo`); Q2 explains why `w + r > n` still lets `B` read `0`; Q3 computes minimum `r` for overlap or read latency when synchronous read repair runs before returning; Q4 applies cross-channel race or `MongoDB 4.2.6` `majority` fixes; Q5 (`ai-review`) spots why an AI building `CAS` on Dynamo `w + r > n` fails without consensus. | `when-two-clocks-disagree`, `2-when-linearizability-matters--and-its-cost`, `which-replication-setups-actually-stay-linearizable` | Yes: Python check of `w + r > n` minimum quorum and sync read-repair round-trip latency (Q3) | `QuorumReadCost` | `w + r > n` stale-read race, synchronous read repair, pre-write timestamp read, replication-architecture table, `MongoDB 4.2.6` defaults (`w: 1`/local vs `majority`), cross-channel storage + queue race |
| 03 | When the fiber between regions snaps | Suppose a ticketing platform serves users from `DC-West` (`65%` of traffic, majority side) and `DC-East` (`35%` of traffic, minority side) across a WAN link with one-way delay between `20 ms` and `60 ms` (delay uncertainty `40 ms`). It handles two endpoints: claiming the last numbered seat (`unique seat_id`) and awarding promo loyalty points (compensatable). A fiber cut isolates `DC-East`. Q1 explains Kleppmann's CAP critique (partitions are a fault, not a dial; healthy networks get both C and A); Q2 computes the share of requests rejected on the minority side (`35%`) and healthy-network round-trip / delay-uncertainty latency; Q3 maps hard invariants (`CAS`/unique seat) vs soft compensatable rules (overbooking/points); Q4 (`ai-advice`) refutes the AI claim that choosing "AP" or skipping partitions avoids linearizability latency on healthy days (Attiya-Welch lower bound + CPU L1/L2 memory fences); Q5 evaluates separating hard coordination invariants from high-availability local endpoints. | `2-when-linearizability-matters--and-its-cost`, `beyond-the-cap-theorem-meme` | Yes: Python check of minority-partition request rejection share and Attiya-Welch latency / RTT formulas stated in stem (Q2) | `CapPartitionChoice` | CAP critique (fault vs setting), Attiya-Welch delay-uncertainty lower bound on healthy networks, CPU cache memory fence analogy, hard invariants vs soft compensatable rules |
| 04 | The photo stamped before the lock | Suppose a social app shards accounts (`Shard A`) and photos (`Shard B`) separately, stamping MVCC rows using each shard's local NTP clock (with NO causality token passed between laptop and phone). At real time `400 ms`, the user sets `account = private` on `Shard A` (`NTP on time`, stamped `400 ms`). `50 ms` later (`t_real = 450 ms`), the user uploads a private photo on `Shard B`, whose NTP clock lags `130 ms` behind real time (`ts = 320 ms`). A stranger runs an MVCC snapshot read at `ts = 360 ms`. Q1 (`ai-advice`) explains why AI's suggestion of random `UUIDv4` hurts B-tree index locality and ordering; Q2 traces what the `360 ms` MVCC snapshot exposes; Q3 computes `ts(photo)` and the exposed snapshot window width `[320, 400)` ms; Q4 (`multi`) selects TWO reasons why `UUIDv7`/`Snowflake` AND sharded `AUTO_INCREMENT` blocks both break causal ordering; Q5 (`ai-review`) rejects AI's proposal to swap in HLC without passing causality tokens across shards (contrasting with replicated Timestamp Oracle or Spanner TrueTime `~7 ms` commit wait). | `3-id-generators-and-logical-clocks`, `how-non-causal-ids-leak-a-private-photo` | Yes: Python computation of `ts_B = t_real_B - lag` and exposed snapshot window `[ts_B, ts_A)` (Q3) | `CausalPhotoLeak` | ID scheme trade-offs (`AUTO_INCREMENT`, sharded blocks, `UUIDv4`, `UUIDv7`/`ULID`/`Snowflake`, `Timestamp Oracle`, `TrueTime ~7 ms`), NTP skew/backward jump causal reversal, MVCC photo leak mechanism |
| 05 | When physical clocks stand still | Suppose two nodes (`acct` and `photo`) run both Lamport clocks `(counter, nodeId)` and Hybrid Logical Clocks `(WallTime, Logical)` and pass causality tokens on messages. Both start at Lamport `0` and HLC `(0, 0)`. Event 1 on `acct` (`physicalClock = 500 ms`) runs locally and sends its token to `photo`; Event 2 on `photo` (`physicalClock = 380 ms`) receives the token and writes a row; Event 3 on `photo` (`physicalClock = 381 ms`, still behind `500 ms`) writes another row. Include CockroachDB's real Go `NowAsClockTimestamp()` code (`pkg/util/hlc/hlc.go#L417-L437`) in Q2. Q1 defines what **vector clocks** detect that Lamport clocks cannot (concurrent vs causally ordered uncommunicating events); Q2 (`ai-review`) spots a broken AI HLC update (failing to reset `Logical = 0` or letting `WallTime` step backward) against CockroachDB's code; Q3 computes exact Lamport and HLC timestamps for Events 1–3; Q4 analyzes why pure Lamport fails date-range queries (`"orders from Tuesday"`) and how HLC reacts when NTP steps backward or breaches drift bounds; Q5 (`ai-advice`) evaluates why HLC with RPC tokens still cannot match TrueTime strict serializability across unrelated uncommunicating clients. | `3-id-generators-and-logical-clocks`, `lamport-clocks-and-hybrid-logical-clocks-hlc` | Yes: Python trace simulating Lamport `(counter, nodeId)` and CockroachDB HLC `(WallTime, Logical)` across Events 1–3 (Q3) | `LamportHlcTick` | Lamport update rules + `nodeId` tie-breaker, Vector clocks vs Lamport clocks, HLC `(WallTime, Logical)` algorithm, CockroachDB `NowAsClockTimestamp()` Go snippet, HLC vs TrueTime across unrelated clients |
| 06 | The ticket dispenser that stalls at three | Suppose a 5-node cluster (`N1` to `N5`, quorum `3`) originally tried leader election by having nodes draw tickets from a linearizable `fetch-and-add` counter (`0` wins) or waiting for all 5 nodes' timestamps, and froze whenever one peer stalled. The team replaced it with Raft. During `Term 4`, leader `N1` is partitioned into `{N1, N2}` while `{N3, N4, N5}` use randomized election timers to elect `N3` in `Term 5`; when the partition heals, `N3` replicates entry `#42` via `{N2, N3, N4}` while `N1` sends a stale `Term 4` append. Q1 explains why `fetch-and-add` stops at consensus number `2` while `CAS` and shared logs reach `∞`; Q2 (`ai-review`) spots the flaw in an AI `fetch-and-add` / wait-for-all election snippet; Q3 computes quorum size `q`, crash tolerance `f`, and minimum intersection `2q - n` for `n = 5`, `n = 4`, and `n = 7`; Q4 (`multi`) identifies TWO Raft/FLP mechanisms (partial-synchrony timeouts + randomness for liveness, monotonic terms + overlapping quorums for safety); Q5 (`ai-advice`) rejects the AI claim that FLP impossibility means long network delays break Raft's safety (confusing liveness with safety). | `4-consensus-and-the-flp-impossibility-boundary`, `why-flp-didnt-stop-raft-and-paxos`, `the-many-faces-of-consensus-and-why-fetch-and-add-stops-at-2`, `5-how-raft-paxos-and-zab-build-a-shared-log` | Yes: Python check of `q = n // 2 + 1`, `f = (n - 1) // 2`, and `2*q - n >= 1` for `n = 3, 4, 5, 7` (Q3) | `RaftTermElection` | FLP impossibility (`1985`), safety vs liveness, timeouts + jitter bypass, 4 consensus properties, `fetch-and-add` (`2`) vs `CAS`/shared log (`∞`), State Machine Replication, terms + two overlapping quorum rounds |
| 07 | The lagging candidate and the ping-pong link | A 5-node Raft cluster (`N1..N5`) has committed log entry `[T3@3]` on `{N3, N4, N5}`, while `N1` holds only `[T2@1, T2@2]` and flaky node `N5` sits behind an intermittent link that keeps timing out. Ops also weighs resizing from 3 to 5 nodes in one uncoordinated jump, serving local reads on the leader without quorum checks (`etcd 0.4.1`), and setting `unclean.leader.election.enable=true` on Kafka. Include `etcd-io/raft`'s real `becomePreCandidate()` Go snippet (`raft.go#L916-L931`) in Q3. Q1 applies Raft's up-to-date log election check (`lastLogTerm`, `lastLogIndex`) vs Multi-Paxos tail repair; Q2 verifies `2f + 1` write-quorum growth vs crash tolerance and shows why jumping 3 -> 5 in one step creates disjoint majorities (`{1,2}` vs `{3,4,5}`); Q3 analyzes why `becomePreCandidate()` stops flaky-link term ping-pong without advancing `r.Term`; Q4 (`multi`) diagnoses two outcomes of AI enabling Kafka `unclean.leader.election.enable=true` (default flipped to `false` in `0.11.0.0`) and skipping `ReadIndex`/lease checks on Raft reads (`etcd 0.4.1`); Q5 evaluates why a 15-node cross-WAN Raft group for 500 shards plus unclean election fails both latency and safety. | `when-two-clocks-disagree`, `5-how-raft-paxos-and-zab-build-a-shared-log`, `subtleties-that-break-naive-implementations` | Yes: Python check of `(lastLogTerm, lastLogIndex)` comparison and disjoint-majority overlap when jumping 3 -> 5 without joint consensus (Q2) | `SplitVoteLog` | Raft log-completeness restriction vs Multi-Paxos repair, `ReadIndex` / drift-bounded lease vs `etcd 0.4.1` stale leader reads, `Pre-Vote` (`becomePreCandidate`), dynamic membership reconfiguration (joint consensus / single-server step), `2f + 1` cluster sizing, Kafka `unclean.leader.election.enable` (`0.11.0.0`) |
| 08 | The lease expired while paused | Real incident: Jepsen's January 2020 analysis of `etcd 3.4.3`. `etcd` binds a worker lock to a lease kept alive by heartbeats (`2-second` TTL, `5` concurrent processes, process pause every `5 seconds`), where Jepsen measured about `18%` of acknowledged updates lost (and `1, 2, 3s` TTLs failed mutual exclusion within minutes), compounded by an `etcd` bug failing to re-check expired leases after waiting in the queue. Meanwhile, the same platform stores `4 TB` of user orders and handles `20,000` service-discovery lookups/s (with `200` workers considering `50 ms` polling vs watches). Q1 (`ai-review`) spots missing fencing tokens (`revision`) in AI's `etcd`-lock write flow; Q2 contrasts Jepsen's internal `etcd` `Txn` check (`version > 0`, protecting a single guarded write inside `etcd` only) with monotonic fencing tokens (`revision`, `zxid`, `ModifyIndex`) checked by external storage; Q3 (`multi`) picks two reasons against storing `4 TB` in `etcd` and routing `20,000/s` discovery lookups through linearizable quorum reads, pointing to metadata-only sizing and TTL caches / ZooKeeper observers / `Serializable` reads; Q4 compares `ZooKeeper` (`Zab`, linearizable writes, local default reads, observers) vs `etcd v3` (`Raft`, linearizable default reads, `Serializable` opt-out) across lock vs discovery workloads; Q5 (`ai-advice`) evaluates AI's advice to cut lock TTL to `1s`, replace watches with `50 ms` polling, and read lock state with `Serializable`. | `6-coordination-services-zookeeper-etcd-and-consul`, `case-when-an-etcd-lock-did-not-keep-the-second-writer-out`, `service-discovery-doesnt-need-linearizability--use-observers` | Optional (if Q5 calculates `200 workers / 0.05 s = 4,000 reads/s` polling load vs watches, verify in Python; otherwise none) | `EtcdLeaseBarrier` | Coordination service role & metadata-only sizing (`3` or `5` nodes, Google Chubby model), 4 primitives (`CAS` leases, monotonic fencing tokens `zxid`/`revision`/`ModifyIndex`, ephemeral sessions, watches vs polling), Jepsen `etcd 3.4.3` lock incident (`18%`, `version > 0` `Txn`), ZooKeeper observers & `etcd v3` `Serializable` service discovery |

Coverage check: sets 01 to 08 cover all 6 sections of the post plus the intro cases (`etcd 0.4.1`, `MongoDB 4.2.6`, `etcd 3.4.3`, Kafka `0.11.0.0`, CockroachDB `hlc.go`, `etcd-io/raft` `raft.go`, TrueTime, FLP, Herlihy's consensus number, Attiya-Welch, CAP).

---

## Verified facts and exact numbers from the post (and opened sources)

Keep these numbers exact whenever cited (all verified against the post and primary sources on 2026-11-25):

- **`etcd 0.4.1` (Jepsen, 2014, cited in Jepsen `etcd 3.4.3`):** partitioned old leaders answered `GET` reads locally without checking with a quorum whether a newer leader existed, causing stale reads by default. `etcd` later added an optional quorum flag and in API `v3.0+` made linearizable quorum/`ReadIndex` reads the default for all operations except watches.
- **`MongoDB 4.2.6` (Jepsen, May 2020):** default write concern (`w: 1`) and uncommitted local reads silently rolled back writes on primary failover and broke causal sessions unless applications opted into `majority` on both read concern and write concern (note: Jepsen 2020 also found multi-document transactions needed `writeConcern: "majority"` even for read-only transactions, and fixed retry bugs in `4.2.8` — stick to what the post states unless you reopen `https://jepsen.io/analyses/mongodb-4.2.6`).
- **`etcd 3.4.3` locks (Jepsen, January 2020):** locks with **1, 2, or 3-second** lease TTLs generally failed to maintain mutual exclusion within a few minutes even on a healthy cluster with synchronized clocks. In a shared-set test with **2-second** TTLs, **5** concurrent processes, and a process pause every **5 seconds**, about **18%** of acknowledged updates were lost. A server bug failed to re-check a waiting client's lease after expiration before granting the lock. Jepsen's recommended `Txn` check (`version > 0` on the lock key) isolates a single guarded write inside `etcd` (not multi-step updates), while external storage needs a monotonic fencing token (`revision`).
- **Apache Kafka `unclean.leader.election.enable`:** promotes a lagging out-of-sync replica when all ISRs fail, permanently overwriting committed messages when the old leader returns; Kafka flipped the default from `true` to **`false`** in **`0.11.0.0`**.
- **Google Spanner TrueTime:** GPS + atomic clocks bound clock uncertainty to **~7 ms** (typically 1–7 ms) and wait out the uncertainty interval (`commit wait`) before committing for strict serializability.
- **CockroachDB HLC:** `pkg/util/hlc/hlc.go` (`NowAsClockTimestamp`) keeps `WallTime` monotonic when `physicalClock <= WallTime` by incrementing `Logical++`, resetting `Logical = 0` only when `physicalClock > WallTime`. Provides serializable transactions (and single-key linearizability), not strict serializability across unrelated uncommunicating keys.
- **Herlihy consensus hierarchy & FLP:** FLP impossibility (**1985**, Fischer, Lynch, Paterson) proves no deterministic async consensus guarantees termination if even **1** node can crash; `fetch-and-add` has **consensus number `2`** (breaks at 3+ nodes on silent winner crash); single-value consensus, linearizable `CAS`, shared log / total order broadcast, and non-blocking atomic commit all have **consensus number `∞`**.
- **Cluster fault tolerance & coordination sizing:** **3** nodes survive **1** crash; **5** nodes survive **2** crashes; coordination services (`ZooKeeper`, `etcd`, `Consul`, modeled on Google Chubby) run **3 or 5 nodes** holding **megabytes** of slow-changing metadata (never 1,000 shards in one Raft group or terabytes of user rows).

### Claims in the post to handle with care (do NOT build fragile questions on them)

1. **"Google production data puts [network partitions] at under 8% of incidents" (Section 2, `beyond-the-cap-theorem-meme`):** The post places this right after citing Kleppmann's 2015 CAP blog, whereas the 7.6% figure comes from Eric Brewer's 2017 whitepaper (*Spanner, TrueTime and the CAP Theorem*, not in the post's `sources:` list) and measures network-related Spanner outages over Google's private WAN rather than public internet partitions. Do not quiz `"under 8%"` unless you open and cite Brewer's 2017 whitepaper.
2. **Consul `default` read consistency in the Section 6 table:** The post table writes `"default allows bounded staleness"`. In HashiCorp Consul HTTP API docs, `default` uses leader leasing (leader-routed reads, briefly vulnerable only during a narrow election window), whereas `stale` mode (also Consul DNS default) reads locally from followers with optional `max_stale` bounded staleness, and `consistent` forces a quorum check. Do not quiz Consul's `default` mode unless you open HashiCorp's Consul docs and cite them in `ref`; focus comparisons on `ZooKeeper` vs `etcd v3` (whose defaults are unambiguous).
3. **ZooKeeper `sync()` linearizability in the Section 6 table:** The table implies `sync()` makes ZooKeeper reads linearizable (`reads may hit a lagging follower unless sync() runs`). Historically (e.g., `ZOOKEEPER-2911` / Jepsen commentary), `sync()` is asynchronous and routes to the follower's current leader without a full Zab quorum round-trip, so a recently deposed leader in a minority partition can briefly answer `sync()` until heartbeat timeout. Keep questions on the clear rule: ZooKeeper writes are linearizable via Zab while default reads hit local followers and may be stale (sequentially consistent); do not write a trick question asserting `sync()` guarantees linearizability under every partition.
4. **`etcd` `revision` vs `version`:** In `etcd`, `revision` is the global monotonically increasing counter across cluster mutations (used as an external fencing token), while `version` is per-key (`version > 0` inside an `etcd` `Txn` checks that the lock key currently exists). Keep the two terms clearly separated in Set 08.
5. **Actor and node names in the post:** Section 1 prose uses **Aaliyah and Bryce** while Kleppmann's diagram caption and Section 2 (`w=2, r=2`) use **Alice and Bob**; Section 3 uses `(1, "acct") < (2, "photo")` while the interactive React demo uses `node-2 (acct)` and `node-1 (photo)`. Keep names consistent within your own set.
6. **Basic Paxos vs Multi-Paxos:** Single-decree Paxos has no long-lived leader per ballot, whereas Multi-Paxos/Raft/VR/Zab keep at most one leader per ballot/term/view. Keep Section 5 questions anchored on Raft, Multi-Paxos, and Zab as presented in the post.

---

## Allowed `reread.anchor` values (English heading slugs of the post)

Pair each English slug with the exact EN/VI heading text from the post when filling `explanation.reread`:

| `reread.anchor` (exact) | `label.en` (exact) | `label.vi` (exact) |
| --- | --- | --- |
| `when-two-clocks-disagree` | `When two clocks disagree` | `Khi hai chiếc đồng hồ nói khác nhau` |
| `1-linearizability-the-single-copy-illusion` | `1. Linearizability: the single-copy illusion` | `1. Tính khả tuyến tính: ảo giác chỉ có một bản sao` |
| `operation-bars-and-atomic-flip-points` | `Operation bars and atomic flip points` | `Thanh thời gian và điểm lật nguyên tử` |
| `linearizability-vs-serializability` | `Linearizability vs. serializability` | `Khả tuyến tính khác gì tuần tự hoá?` |
| `2-when-linearizability-matters--and-its-cost` | `2. When linearizability matters — and its cost` | `2. Khi nào cần tính khả tuyến tính — và cái giá phải trả` |
| `which-replication-setups-actually-stay-linearizable` | `Which replication setups actually stay linearizable?` | `Mô hình sao chép nào thực sự giữ được?` |
| `beyond-the-cap-theorem-meme` | `Beyond the CAP theorem meme` | `Phía sau câu thần chú của định lý CAP` |
| `3-id-generators-and-logical-clocks` | `3. ID generators and logical clocks` | `3. Sinh ID phân tán và đồng hồ logic` |
| `how-non-causal-ids-leak-a-private-photo` | `How non-causal IDs leak a private photo` | `ID lệch nhân quả làm lộ ảnh riêng tư thế nào?` |
| `lamport-clocks-and-hybrid-logical-clocks-hlc` | `Lamport clocks and Hybrid Logical Clocks (HLC)` | `Đồng hồ Lamport và Đồng hồ Logic Lai (HLC)` |
| `4-consensus-and-the-flp-impossibility-boundary` | `4. Consensus and the FLP impossibility boundary` | `4. Đồng thuận và ranh giới bất khả thi FLP` |
| `why-flp-didnt-stop-raft-and-paxos` | `Why FLP didn't stop Raft and Paxos` | `Vì sao định lý FLP không cản được Raft và Paxos` |
| `the-many-faces-of-consensus-and-why-fetch-and-add-stops-at-2` | `The many faces of consensus (and why Fetch-and-Add stops at 2)` | `Nhiều bộ mặt của đồng thuận (và vì sao Fetch-and-Add dừng ở 2)` |
| `5-how-raft-paxos-and-zab-build-a-shared-log` | `5. How Raft, Paxos, and Zab build a shared log` | `5. Raft, Paxos và Zab dựng nhật ký chung ra sao` |
| `subtleties-that-break-naive-implementations` | `Subtleties that break naive implementations` | `Những cái bẫy thực tế phá vỡ cài đặt ngây thơ` |
| `6-coordination-services-zookeeper-etcd-and-consul` | `6. Coordination services: ZooKeeper, etcd, and Consul` | `6. Dịch vụ điều phối: ZooKeeper, etcd và Consul` |
| `case-when-an-etcd-lock-did-not-keep-the-second-writer-out` | `Case: when an etcd lock did not keep the second writer out` | `Tình huống thật: khi khoá etcd không chặn nổi người ghi thứ hai` |
| `service-discovery-doesnt-need-linearizability--use-observers` | `Service discovery doesn't need linearizability — use observers` | `Service discovery không cần khả tuyến tính — hãy dùng observer` |
| `key-takeaways` | `Key takeaways` | `Điểm rút ra` |
| `review-questions` | `Review questions` | `Câu hỏi ôn tập` |

Exact `reread.anchor` slugs (must match one of these strings verbatim):

```
when-two-clocks-disagree
1-linearizability-the-single-copy-illusion
operation-bars-and-atomic-flip-points
linearizability-vs-serializability
2-when-linearizability-matters--and-its-cost
which-replication-setups-actually-stay-linearizable
beyond-the-cap-theorem-meme
3-id-generators-and-logical-clocks
how-non-causal-ids-leak-a-private-photo
lamport-clocks-and-hybrid-logical-clocks-hlc
4-consensus-and-the-flp-impossibility-boundary
why-flp-didnt-stop-raft-and-paxos
the-many-faces-of-consensus-and-why-fetch-and-add-stops-at-2
5-how-raft-paxos-and-zab-build-a-shared-log
subtleties-that-break-naive-implementations
6-coordination-services-zookeeper-etcd-and-consul
case-when-an-etcd-lock-did-not-keep-the-second-writer-out
service-discovery-doesnt-need-linearizability--use-observers
key-takeaways
review-questions
```
