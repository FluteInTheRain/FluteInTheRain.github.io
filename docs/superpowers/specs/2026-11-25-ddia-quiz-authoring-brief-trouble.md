# Authoring brief: one case set of the DDIA "distributed system failures" quiz

You write ONE case set: a scenario, a figure, and 5 bilingual multiple-choice questions. You own it end to end:
the JSON, the figure, the checks, the screenshots, the fixes. Nobody hands fixes back to you later.

Read first: this brief, `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md`, `src/data/quiz/types.ts`, `src/components/quiz/QuizContext.astro`, and the post
`src/content/blog/trouble-with-distributed-systems-networks-clocks-fencing.mdx` (it alternates `<En>` and `<Vi>` blocks; read the English ones for the facts and the Vietnamese ones for the exact Vietnamese terms the site already uses). Format examples that are already finished and approved: `src/data/quiz/replication-when-copies-disagree/set-01.json` with `src/components/quiz/figures/LagOnRead.astro`, `src/data/quiz/reliable-scalable-maintainable-data-systems/set-03.json` with `HundredServices.astro`, and `src/data/quiz/what-is-a-stock-ownership-dividends/set-01.json` for `QuizContext.astro` bullet formatting and inline assumptions.
Copy their structure and level of care, not their wording or topics.

## What you create (and nothing else)

- `src/data/quiz/trouble-with-distributed-systems-networks-clocks-fencing/set-NN.json` (NN = your set number, two digits)
- `src/components/quiz/figures/<FigureName>.astro` (the exact name your task gives you)

Do not edit any other file (`src/data/quiz/domains.ts` already registers this post as `'code'`). Existing quiz figure names are the files in `src/components/quiz/figures/`; the `Dist*` components in `src/components/mdx/` and `DistLeaseFencingDemo.tsx` in `src/components/demos/` belong to the post, so do not copy their drawings (your figure shows YOUR scenario). Do not commit: the lead commits everything at the end, because several authors share one working tree and parallel commits collide. Do not start a dev server: one is already running on port 4321.

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
15. Vietnamese is natural technical Vietnamese. Keep code terms and common jargon (`timeout`, `heartbeat`, `quorum`, `split-brain`, `lease`, `fencing token`, `GC pause`, `wall clock`, `monotonic clock`, `skew`, `drift`, `jitter`, `LWW`, `seed`, `replay`) as they are, like the post's Vietnamese section does.
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

1. `node scripts/quiz/validate.ts src/data/quiz/trouble-with-distributed-systems-networks-clocks-fencing/set-NN.json`
   Prints every problem; fix until it prints `ok`. (`node --test src/utils/quiz.test.ts` checks all sets together and can fail on someone else's unfinished file; use the validator for your own.)
2. Screenshot your set (the dev server on port 4321 is running):
   `node scripts/quiz/shot.mjs 4321 trouble-with-distributed-systems-networks-clocks-fencing set-NN /tmp/quiz-NN --questions`
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

Real incidents below were checked against the post's cited sources; do not add undocumented internal details to real incidents. Whenever a scenario introduces assumed numbers or traces, phrase them explicitly with `"Suppose..."` / `"Giả sử..."` inside short paragraphs and `• ` bullets.

| Set | Title (EN / VI) | Scenario | Grows from (anchors) | Calculations needing `verifiedBy` | Figure | Owns (concept/fix guard) |
|---|---|---|---|---|---|---|
| 01 | Silence on the wire / Sự im lặng trên đường dây | Assumed payment call trace (`"Suppose an order service on Host A calls a payment service on Host B over TCP..."`): `charge($45)` written to socket, TCP `ACK` arrives at `12 ms`, then `5,000 ms` timeout fires with no app reply. Also notes Host C hitting a one-way port drop (receives inbound pings, drops outbound replies) and a medium datacenter study measuring ~12 network faults/month (half isolating 1 machine, half 1 rack). | `1-faults-and-partial-failures`, `2-unreliable-networks` | Yes: if `1,000` requests time out after TCP `ACK`, and suppose `40%` executed before reply loss, `35%` stalled before `read()`, and `25%` crashed Host B before `read()`, how many double-charges (`$18,000`) happen when an AI retries all `1,000` without an idempotency key | `PartialFailureMap` | Partial failure vs total stop, shared-nothing, why rolling upgrades rely on partial failure, TCP `ACK` (kernel buffer) vs app reply, asymmetric fault, idempotency on retry. Must NOT name TrueTime, GC lease pauses, fencing tokens, or DST. |
| 02 | Forty-three seconds across the country / Bốn mươi ba giây xuyên nước Mỹ | Real: GitHub, October 21, 2018 (`22:52 UTC`), `https://github.blog/news-insights/company-news/oct21-post-incident-analysis/`. 100G optical maintenance cuts link between US East hub and primary US East DC for `43 s`. Orchestrator Raft nodes in US West DC and East public cloud form a majority quorum and promote West MySQL primaries. East keeps a short stretch of unreplicated writes; link returns, app tier writes to West over a cross-country link (`60 ms` shown on GitHub's Invalid Topology diagram), both sides diverge, fail-back is unsafe, recovery from backups takes `24 hours and 11 minutes`. | `case-githubs-43-seconds`, `5-knowledge-truth-and-fencing-tokens` (majority quorum rule only) | Yes: suppose an East page makes `8` sequential DB calls, cross-region RTT is `60 ms` and local RTT is `1 ms`; apply `added wait = calls × (remote RTT − local RTT)` (`472 ms` added, `480 ms` total vs `8 ms` local) to refute an AI claiming `60 ms` is harmless | `Github43sFailover` | Why two majority quorums cannot exist at once, valid Raft quorum harming app latency, divergent writes blocking fail-back, blocking cross-region leader promotion. Do NOT introduce fencing tokens or process pauses here. |
| 03 | Fixed timeout vs. jitter / Timeout cố định trước nhịp giật của mạng | Assumed shared-cloud cluster (`"Suppose a 6-node service cluster shares cloud hosts where QoS like L4S or Linux tc is disabled..."`): calm RTT `25 ms` (p99 `60 ms`), noisy neighbor causes `240 ms` queueing bursts for `2 s`. Team weighs `100 ms` vs `5,000 ms` fixed timeouts against Phi Accrual failure detection (Cassandra, Akka), contrasts ISDN circuits (`16 bits` per `250 µs` frame) vs shared packet-switched queues, and evaluates UDP vs TCP for real-time VoIP audio (`150 ms` frame usefulness cutoff). | `timeout-trade-offs`, `2-unreliable-networks` | Yes: suppose 6 nodes handle `8,400 req/s` total (`1,400 req/s` each, `2,000 req/s` max capacity = `70%`); a `100 ms` timeout falsely marks 2 noisy-neighbor nodes dead, shifting `8,400 ÷ 4 = 2,100 req/s` (`105%`) onto the 4 survivors -> cascading failure | `TimeoutSweep` | Timeout trade-off (false-positive cascade vs slow crash detection), circuit-switched ISDN vs packet queueing, UDP vs TCP for real-time audio, cloud QoS limits, Phi Accrual failure detector. |
| 04 | Two clocks and a lost update / Hai chiếc đồng hồ và lệnh ghi biến mất | Real + Assumed LWW trace: Cloudflare, Jan 1, 2017 (`00:00 UTC`), `https://blog.cloudflare.com/how-and-why-the-leap-second-affected-cloudflare-dns/` — 1-s leap second stepped `time.Now()` backward (pre-monotonic Go), `time.Now().Sub(start)` went negative, `rand.Int63n()` panicked on CNAME lookups (~`0.2%` DNS / `<1%` HTTP across `102` data centers until `06:45 UTC` rollout). Plus assumed LWW trace (`"Suppose Client A writes x = 1 on Node 1 (+2 ms fast, 42.004 s), then Client B reads x = 1 and writes x = 2 on Node 3 (-3 ms slow, 42.003 s)..."`). Includes `200 ppm` quartz drift, `0.05%` NTP slew cap, and NTP smearing. | `3-unreliable-clocks`, `point-timestamps-vs-truetime-intervals` (LWW & logical clocks only) | Yes: suppose a quartz crystal runs `200 ppm` fast and NTP stalls for `12 hours` (`43,200 s`), compute clock drift (`8.64 s`) and minimum time for NTP slewing at `0.05%` (`4.8 hours`) | `ClockDriftSplit` | Wall clock (`CLOCK_REALTIME`) vs monotonic (`CLOCK_MONOTONIC`), Cloudflare 2017 leap-second panic, quartz drift & NTP slew vs step, why point wall-clock LWW silently drops causally newer writes, NTP smearing limits, multi-select (`s04q4`) on why monotonic clocks cannot replace all clocks. Must NOT explain TrueTime `commit-wait` (owned by Set 05). |
| 05 | Intervals instead of points / Khoảng tin cậy thay cho một điểm giờ | Real context + Assumed interval trace: Spanner TrueTime (`https://research.google/pubs/spanner-googles-globally-distributed-database/`, GPS + atomic clocks, `200 ppm` drift, `30 s` poll -> `1–7 ms` uncertainty) & AWS ClockBound on EC2 Nitro (`https://aws.amazon.com/blogs/compute/its-about-time-microsecond-accurate-clocks-on-amazon-ec2-instances/`, usable by YugabyteDB) vs CockroachDB HLC. Assumed trace (`"Suppose Tx A receives [100.0 ms, 107.0 ms] and Tx B starts right after..."`). Also includes the local-vs-remote clock bug in the post's 8-line Java lease loop (`lease.expiryTimeMillis - System.currentTimeMillis() < 10000`). | `point-timestamps-vs-truetime-intervals`, `4-process-pauses` (cross-host wall-clock lease bug only) | Yes: given `drift rate = 200 ppm`, `poll interval = 30 s`, `master delay = 1 ms`, `ε = (drift × poll) + delay` (`7 ms`) and `commit-wait = 2 × ε` (`14 ms`), vs public-internet NTP at `ε = 100 ms` (`200 ms` stall per write) | `TrueTimeWindow` | Confidence intervals `[earliest, latest]`, TrueTime `commit-wait` (`A.latest < B.earliest`), GPS/atomic clocks vs AWS ClockBound vs HLC, and why subtracting remote `expiryTimeMillis` from local `System.currentTimeMillis()` fails. Must NOT cover GC pauses after `lease.isValid()` (owned by Set 06). |
| 06 | Frozen mid-function / Đóng băng ngay giữa hàm | Real backdrop + Assumed pause trace: cites HBase historical GC-pause split-brain and Netflix/LinkedIn draining before full GC (`4-process-pauses`), plus an assumed cloud JVM shard leader (`"Suppose a shard leader uses CLOCK_MONOTONIC to check a 10 s lease..."`): passes `lease.isValid()` at `t = 8 s`, then stalls `15 s` in a stop-the-world GC + swap thrashing (`vm.swappiness` enabled) while another node acquires the lease at `t = 10.5 s` and writes `v2`. Covers all 5 pause sources (GC, VM migration/steal time, sync disk `fsync`/EBS, swap thrashing vs `OOM killer`, `SIGSTOP`) and hard real-time RTOS vs server throughput. | `4-process-pauses` | Yes: lease granted `t = 0 s` (`10 s` TTL), check passes at `t = 8 s`, thread freezes `15 s` until `t = 23 s`; how many seconds after expiry (`13 s`) does the stale write run (or check retry/OOM vs swap math) | `GcPauseZombie` | Why `CLOCK_MONOTONIC` cannot stop post-check pauses (TOCTOU gap), all 5 pause causes, non-GC freezes (`multi` `s06q4`: VM steal + sync `fsync`/swap in Rust/Zig), why swap thrashing is worse than `OOM killer`, why ZGC/draining cut tail latency without guaranteeing safety. Must NOT name or solve with fencing tokens (owned by Set 07). |
| 07 | The storage gatekeeper / Người gác cổng ở tầng lưu trữ | Assumed lock/storage trace (`"Suppose etcd/ZooKeeper issues strictly increasing tokens..."`): Client 1 receives lease + `token = 33`, emits write packet, and gets killed by STONITH (`kill -9` / power cut), yet a congested switch buffers that packet for `45 s`. Client 2 gets `token = 34` and commits `v2` to storage (`maxToken = 34`). Also covers S3 `If-Match` / ETag conditional writes (Azure Blob / GCS preconditions), packing tokens into high bits of leaderless LWW timestamps, majority vs Byzantine quorum (`N = 7` cluster), and 4 NTP servers (`10:00:42.003/.004/.005` vs `10:03:17.000`). | `5-knowledge-truth-and-fencing-tokens`, `why-fencing-tokens-close-the-zombie-loop`, `byzantine-faults-when-nodes-can-lie` | Yes (`multi` `s07q4`): for `N = 7` nodes, compute crash-fault majority (`7 // 2 + 1 = 4`, tolerates `3`) vs BFT honest requirement (`> 2N/3` -> `>= 5` honest, tolerates at most `f = 2` lying nodes) | `FencingLedger` | Why STONITH cannot stop in-flight packets, monotonic fencing tokens (`zxid`/`revision`/`term`/`epoch`) checked by storage, client-only checks failing, S3 `If-Match` & LWW high-bit packing, Byzantine `> 2/3` threshold & cheap weak-lying defenses (app checksums, TLS, multi-NTP outlier voting). |
| 08 | Replaying the 3 a.m. storm / Phát lại cơn bão lúc 3 giờ sáng | Assumed storage team (`"Suppose a storage engine team builds a Raft metadata store in Go/Rust for cloud VMs..."`): targets `partially synchronous + crash-recovery`, hit in production by a NIC dropping to `1 Kb/s` while `/health` returns `200 OK` and firmware forgetting flushed blocks on reboot. Team pairs TLA+ (`Newcombe et al.`), Jepsen, and seeded DST (`seed = 481516`, citing FoundationDB `Flow` `18 months` in 1 thread, TigerBeetle `VOPR` safety vs liveness modes, `MadSim`, `FrostDB`, `Antithesis`), yet two runs of `seed = 481516` diverge on random hash-map iteration / OOM limits. | `6-system-models-and-proving-correctness`, `testing-with-tla-jepsen-and-dst`, `key-takeaways` | none (protocol, model classification, and verification evaluation) | `DstSeedReplay` | Timing models (`Synchronous` / `Partially synchronous` / `Asynchronous`), fault models (`crash-stop`, `crash-recovery`, `fail-slow / gray failure`, `Byzantine`), firmware storage amnesia, Safety vs Liveness (Alpern & Schneider 1985), TLA+ vs Jepsen vs DST (`multi` `s08q3`), `VOPR` liveness mode, hidden nondeterminism in hash-map order / memory limits. |

## Real incidents, verified facts, and claims in the post to handle with care

### Verified facts (from the post and opened/checked sources)

- **Cloudflare, Jan 1, 2017** (`https://blog.cloudflare.com/how-and-why-the-leap-second-affected-cloudflare-dns/`): at `00:00 UTC`, a leap second stepped wall clocks backward. RRDNS (written in Go, before Go 1.9 added monotonic clock readings to `time.Time`) computed upstream DNS RTT using `time.Now()`, yielding negative durations. After rolling smoothing, negative values reached `rand.Int63n()`, triggering panics (`recover()` caught process death, but CNAME lookups failed). Peaked at ~`0.2%` of DNS queries and `<1%` of HTTP requests across `102` data centers; full patch rollout finished around `06:45 UTC`.
- **GitHub, Oct 21, 2018** (`https://github.blog/news-insights/company-news/oct21-post-incident-analysis/`): at `22:52 UTC`, maintenance on 100G optical equipment cut connectivity between the US East Coast hub and primary US East DC for `43 seconds`. Orchestrator's Raft nodes in US West DC and an East Coast public cloud formed a majority quorum and promoted West Coast MySQL primaries. East DC held a few seconds of unreplicated writes; once the link returned, apps wrote to West primaries across a cross-country link (`Latency 60ms` on GitHub's Invalid Topology diagram), diverging both sides. GitHub preserved data integrity, rebuilt/restored East clusters from backups, and ran degraded for `24 hours and 11 minutes`. Fix: configure Orchestrator not to fail over across regional boundaries.
- **Datacenter & physical faults (DDIA Ch. 8 / Coda Hale 2010)**: medium datacenter study counted ~`12` network faults per month (half isolating one server, half isolating an entire rack). Coda Hale (2010) documented switch failures, whole-rack power cycles, datacenter partitions, and a driver crashing a Ford pickup into a datacenter HVAC unit. ISDN reserves `16 bits` per `250 µs` frame end-to-end (`64 kbps` deterministic circuit).
- **Clocks & TrueTime**: NTP slewing nudges clock frequency by at most `0.05%` (`500 ppm`); leap seconds are scheduled to be retired by/before `2035` (CGPM 2022). In Google Spanner (Corbett et al. 2012), oscillator drift is budgeted at `200 ppm` (`6 ms` over `30 s`, or `17.28 s/day` unsynced), polled every `30 s`, yielding TrueTime uncertainty `ε` of `1–7 ms` (`~4 ms` average, `2ε` commit-wait). AWS `ClockBound` exposes `[earliest, latest]` intervals using microsecond-accurate EC2 Nitro hardware clocks (integrated by systems such as YugabyteDB); CockroachDB uses Hybrid Logical Clocks without atomic clocks. Cassandra/ScyllaDB LWW uses wall-clock timestamps by default and can silently discard causally later writes under clock skew.
- **Fencing & conditional storage**: ZooKeeper `zxid`/`cversion`, etcd `revision`, Chubby sequencer, Raft `term`, and Kafka epoch issue strictly monotonic tokens. Amazon S3 added native conditional writes via `If-Match` / ETag in 2024 alongside GCS preconditions and Azure Blob conditional headers.
- **Byzantine & verification**: Byzantine consensus tolerates `f` lying/arbitrary nodes only when `n >= 3f + 1` (`> 2/3` honest). Alpern & Schneider (1985) formalized Safety vs Liveness. AWS (Newcombe et al. 2015) used TLA+ on DynamoDB, S3, EBS, and internal lock managers. FoundationDB built its `Flow` runtime and ran simulated multi-node clusters in a single thread for `18 months` before sending a real packet; TigerBeetle's `VOPR` splits Safety and protocol-aware Liveness modes; `MadSim`, `FrostDB`, and `Antithesis` bring DST to Rust/Go/containers.

### Claims in the post that look loose or unverified (do not build fragile questions on them)

- **GitHub `60 ms` ambiguity (one-way vs RTT) and restore scope**: GitHub's `Invalid Topology` PNG labels the US West–East link `"Latency 60ms"` without stating whether it is one-way or round-trip, while the post prose says `"cross-country round trip"`. Do NOT assert whether `60 ms` in the real incident was one-way or RTT; when using `60 ms` in Set 02 arithmetic, explicitly state `"Suppose cross-region round-trip latency is 60 ms..."`. Also avoid claiming *every* GitHub database was wiped from scratch (GitHub restored/rebuilt affected East MySQL servers from cloud backups alongside reconciliation).
- **Cloudflare exact snippet**: The post prints `rtt := time.Now().Sub(start)` as a condensed summary; Cloudflare's actual bug involved computing upstream latency with `time.Now()` and subtracting it inside `rand.Int63n(max - ...)` after smoothing. Test the mechanism (wall-clock backward jump -> negative duration -> `rand.Int63n` panic, fixed when Go added monotonic clocks in Go 1.9), not memorized line syntax.
- **HBase GC pause details**: The post mentions HBase split-brain from a Java GC pause without incident dates, durations, or internal component names (RegionServer / ZooKeeper / HDFS lease). Do NOT invent historical dates or metrics for HBase; use `"Suppose..."` assumptions for concrete pause timings.
- **Spanner `~7 ms` bound**: `1–7 ms` (`~7 ms` max) is specifically from the 2012 Spanner OSDI paper (`200 ppm × 30 s + 1 ms`), not a permanent universal hardware constant across newer Spanner/AWS ClockBound generations.
- **TLA+ Viewstamped Replication attribution**: The post's sentence pairing AWS (`DynamoDB`, `S3`) with Kafka/CockroachDB/TiDB and a `"Viewstamped Replication data-loss edge case hidden in prose"` conflates two separate stories — AWS Newcombe et al. (2015) vs later TLA+ analyses of *Viewstamped Replication Revisited* (e.g., Jack Vanlightly). Do NOT write a question saying AWS found the Viewstamped Replication bug.
- **Netflix & LinkedIn GC draining**: Mentioned in prose without a cited source URL in `sources:`; use it only for the general engineering lesson ("draining traffic before full GC cuts tail latency, not split-brain correctness"), never as an assertion about Netflix/LinkedIn's current production stack.
- **Numbers inside the post's teaching diagrams (`DistTimeoutTradeoff`, `DistTwoClocks`, `DistTrueTimeIntervals`, `DistFencingTokens`, `DistNtpOutlier`)**: Figures such as `120 ms` / `800 ms` timeouts, `42.004 s` / `42.003 s`, `token 33` / `34`, `15 s` freeze, and `10:03:17.000` are teaching examples in the post's diagrams, NOT real production measurements. If used in a quiz scenario, introduce them with `"Suppose..."` / `"Giả sử..."`.

## Allowed `reread.anchor` values (English heading slugs of the post)

Use the exact English slug in `reread.anchor`, and match the post's exact EN/VI heading text in `reread.label`:

| `reread.anchor` | `reread.label.en` | `reread.label.vi` |
|---|---|---|
| `when-one-in-a-million-happens-every-tuesday` | When one-in-a-million happens every Tuesday | Khi chuyện một phần triệu xảy ra vào mỗi thứ Ba |
| `1-faults-and-partial-failures` | 1. Faults and partial failures | 1. Lỗi toàn phần và lỗi một phần |
| `2-unreliable-networks` | 2. Unreliable networks | 2. Mạng không đáng tin |
| `case-githubs-43-seconds` | Case: GitHub's 43 seconds | Ca thực tế: 43 giây của GitHub |
| `timeout-trade-offs` | Timeout trade-offs | Đánh đổi khi đặt timeout |
| `3-unreliable-clocks` | 3. Unreliable clocks | 3. Đồng hồ cũng biết nói dối |
| `point-timestamps-vs-truetime-intervals` | Point timestamps vs. TrueTime intervals | Timestamp một điểm hay khoảng tin cậy |
| `4-process-pauses` | 4. Process pauses | 4. Khi tiến trình bị đóng băng giữa chừng |
| `5-knowledge-truth-and-fencing-tokens` | 5. Knowledge, truth, and fencing tokens | 5. Sự thật, đa số và fencing token |
| `why-fencing-tokens-close-the-zombie-loop` | Why fencing tokens close the zombie loop | Vì sao chỉ fencing token mới bịt kín lỗ hổng zombie |
| `byzantine-faults-when-nodes-can-lie` | Byzantine faults: when nodes can lie | Lỗi Byzantine: khi các node biết nói dối |
| `6-system-models-and-proving-correctness` | 6. System models and proving correctness | 6. Mô hình hệ thống và kiểm chứng trước khi sập |
| `testing-with-tla-jepsen-and-dst` | Testing with TLA+, Jepsen, and DST | Kiểm chứng bằng TLA+, Jepsen và DST |
| `key-takeaways` | Key takeaways | Điểm rút ra |
| `review-questions` | Review questions | Câu hỏi ôn tập |

Exact slug list:

```
when-one-in-a-million-happens-every-tuesday
1-faults-and-partial-failures
2-unreliable-networks
case-githubs-43-seconds
timeout-trade-offs
3-unreliable-clocks
point-timestamps-vs-truetime-intervals
4-process-pauses
5-knowledge-truth-and-fencing-tokens
why-fencing-tokens-close-the-zombie-loop
byzantine-faults-when-nodes-can-lie
6-system-models-and-proving-correctness
testing-with-tla-jepsen-and-dst
key-takeaways
review-questions
```
