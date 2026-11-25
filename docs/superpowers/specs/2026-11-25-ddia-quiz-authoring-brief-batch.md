# Authoring brief: one case set of the DDIA "batch processing" quiz

You write ONE case set: a scenario, a figure, and 5 bilingual multiple-choice questions. You own it end to end:
the JSON, the figure, the checks, the screenshots, the fixes. Nobody hands fixes back to you later.

Read first: this brief, `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md`, `src/data/quiz/types.ts`, and the post
`src/content/blog/batch-processing-unix-pipes-shuffle-dataflow-lakehouse.mdx` (it alternates `<En>` and `<Vi>` blocks; read the English ones for the
facts and the Vietnamese ones for the exact Vietnamese terms the site already uses). Format examples that are already
finished and approved: `src/data/quiz/replication-when-copies-disagree/set-01.json` with `src/components/quiz/figures/LagOnRead.astro`,
`src/data/quiz/reliable-scalable-maintainable-data-systems/set-03.json` with `HundredServices.astro`, and
`src/data/quiz/what-is-a-stock-ownership-dividends/set-01.json` for short-paragraph + `• ` bullet formatting in `context.text`.
Copy their structure and level of care, not their wording or topics.

## What you create (and nothing else)

- `src/data/quiz/batch-processing-unix-pipes-shuffle-dataflow-lakehouse/set-NN.json` (NN = your set number, two digits)
- `src/components/quiz/figures/<FigureName>.astro` (the name your task gives you)

Do not edit any other file (`batch-processing-unix-pipes-shuffle-dataflow-lakehouse` is already registered as `'code'` in `src/data/quiz/domains.ts`). Existing quiz figure names live in `src/components/quiz/figures/`; the `Batch*` components (`BatchBroadcastJoin`, `BatchConditionalWrite`, `BatchDfsBlocks`, `BatchExternalSort`, `BatchGangDeadlock`, `BatchHotKey`, `BatchHumanFault`, `BatchLaptopVsCluster`, `BatchOltpMelt`, `BatchOrchestratorLayers`, `BatchOutputBuckets`, `BatchPipeBackpressure`, `BatchRamBars`, `BatchS3Rename`, `BatchShuffle`, `BatchShuffleSortMerge`, `BatchSpotRetry`, `BatchUnixVsDataflow`, `BatchVeniceFlow`) in `src/components/mdx/` belong to the post, so do not copy their drawings (your figure shows YOUR scenario). Do not commit: the lead commits everything at the end, because several authors share one working tree and parallel commits collide. Do not start a dev server: one is already running on port 4321.

## The audience and the aim

Working engineers. The quiz helps them understand, apply, and answer in interviews, with emphasis on what
happens when AI writes or suggests code. Because this is a `code` post, two tracks apply: `interview` (what is
commonly asked directly) and `ai` (reviewing or questioning something an AI assistant produced). Both are mixed
inside every set; your task lists the slot of each question.

## Hard rules (the validator enforces most of them)

1. 5 questions, ids `s<NN>q1` to `s<NN>q5`, `difficulty` never decreasing, following your slot table
   (level, track, type, difficulty).
2. 4 options (`a` to `d`); type `multi` has 5 (`a` to `e`) and exactly two answers.
3. Every wrong option has a `whyWrong` entry naming the misconception behind it.
4. Every string is `{ en, vi }`, both filled.
5. No "all of the above" or "none of the above". No NOT-style negatives. No trick questions.
6. All options of a question have a similar length and tone. The correct one must not be the longest, the most
   hedged, or the most detailed (the validator rejects a correct option more than 10 characters longer than every other option). Wrong options come from real misconceptions and sound reasonable.
7. Authored answer positions vary: no more than 2 of your 5 answers at the same position (a to d).
8. Never refer to an option by letter ("(a)", "option b") in any explanation or say-line. The page shuffles the
   options, so letters would point at the wrong text. Quote the idea instead.
9. Ask directly. No "an interviewer asks" or "a recruiter says" in any stem. The `interview` track is about the
   topic, not a staged conversation.
10. Calculation questions state EVERY formula the reader needs inside the stem. They test applying the
    formulas, not remembering them. Put each formula in backticks, one per line starting with `- `, for example
    ``- `bytes read = row_count × row_width` ``.
11. Never add "illustrative", "minh họa", "số bịa", or "made-up" labels or disclaimers anywhere in `context.text`, stems, figures, or captions. State every workload assumption or scenario number directly inside its sentence ("Suppose a job processes 40 GB across 4 reducers...", "Giả sử container bị giới hạn RAM 128 MiB...") and keep all numbers internally consistent.
12. Every computed answer is verified by running code (Python is fine). Put the command and its output in
    `verifiedBy`. A `code-output` question needs `verifiedBy`.
13. A question must be answerable from its scenario alone (plus general knowledge it teaches in the
    explanation). No stem may contain or imply another question's answer, and a stem or scenario must not name the technique that is the answer of another question in the same set. Read each stem with the others hidden.
14. Facts beyond the post need an external source in `ref` (a URL you actually opened) and only well-established
    practice. If a point is contested or only from a blog, leave it out. Post-based questions use `ref` matching the heading text, such as `"Post: 4. From MapReduce to dataflow and the shuffle"`.
15. `reread.anchor` must be one of the heading slugs listed verbatim at the end of this brief, and `reread.label` must be the exact heading text of that post section, not a paraphrase.
16. Vietnamese is natural technical Vietnamese. Keep code terms and common jargon (`pipe`, `backpressure`, `OOMKilled`, `spill`, `shuffle`, `hot key`, `skew`, `broadcast join`, `AQE`, `spot instance`, `preemption`, `DAG`, `lineage`, `checkpoint`, `p99`, `snapshot`, `manifest`, `SSTable`, `rollback`) as they are, like the post's Vietnamese section does. The Vietnamese set title must read as a natural short phrase, not a word-by-word translation.
17. Format `context.text` (`en` and `vi`) for `src/components/quiz/QuizContext.astro`: use short paragraphs (one paragraph per `\n`-separated line) and consecutive `• ` bullet lines with one number or fact per bullet (e.g., `• raw log size: 107 MiB`, `• container RAM limit: 128 MiB`). Do NOT write a dense wall of text, and do NOT use `- ` bullets inside `context.text` (`QuizContext.astro` only turns lines starting with `• ` into `<ul><li>` lists; backticked spans `` `...` `` render as formula/code chips). Inside question `stem`s, `\n` and `- ` list lines are fine.
18. `explanation.say`: for `interview` questions, a line a candidate could say aloud. For `ai` questions, a
    review habit ("when AI gives X, check Y").
19. Style: short sentences, plain words. Explain the idea before the detail. Do not copy the sample case's
    wording; copy its structure.

## The figure

One inline-SVG Astro component, no images, no external fonts or libraries. It follows the site's drawing rules (`.claude/skills/book-to-post/SKILL.md`, section "B. Diagrams & Visuals: drawn on the page"; reference figures: `src/components/quiz/figures/LagOnRead.astro` and `src/components/mdx/FaultVsFailure.astro`; icons only through `src/components/mdx/DiagramIcon.astro`, keys in `src/data/diagram-icons.ts`, never edit shared components).

- Placement: the figure sits in the LEFT column under the scenario text, about 600px wide on desktop and full width on a phone.
  So: `viewBox` about 580 wide, labels 13 to 15px at that width, svg `width: 100%`, no horizontal scroll (keep any
  `min-width` at or below 360px). Root element is a `div` (not `<figure>`) with no `<figcaption>`: the page adds a centred
  caption from the `alt` text in the JSON.
- Page font only, inherited. NO monospace, no `font-family`. Numbers use `font-variant-numeric: tabular-nums`.
- Colours only from site tokens (`var(--text)`, `--text-body`, `--text-muted`, `--bg-alt`, `--border`, `--red`, `--red-tint-bg`,
  `--gold`, `--gold-tint-bg`, `--gold-icon`, `--act-2`, `--bg`), never a hex colour, so light and dark both work. Red marks only the
  problem, gold marks the safe path.
- Words in the figure: sentence case, plain words, no ALL CAPS, no emoji, no hype. Vietnamese must read as natural Vietnamese,
  not word by word.
- Bilingual text as `<text><tspan data-lang-en>..</tspan><tspan data-lang-vi>..</tspan></text>`.
- No `<marker>`, `<pattern>`, `<filter>`, `<clipPath>` or any `id`s (the page renders each figure in two languages; draw
  arrowheads as plain polygons).
- Use colour icons through `DiagramIcon` for real things (e.g., `nginx`, `disk`, `file`, `folder`, `s3`, `dynamodb`, `server`, `kubernetes`, `etcd`, `hadoop`, `spark`, `flink`, `kafka`, `postgres`, `worker`, `model`, `package`, `backup`, `log`, `linkedin`, `ok`, `fail`, `warning`), flat shapes otherwise. Make it a real teaching picture of the mechanism with the numbers of your scenario, not a plain box diagram.
- Scoped `<style>` with a class prefix unique to your figure (e.g. `.qfig-pss-` for `PipeSortSpill`).
- The figure and its `alt` must never show or state the answer to a question or a computed result. Reference it from the
  JSON in `context.media`: `{ "kind": "figure", "component": "<FigureName>", "alt": { "en": "...", "vi": "..." } }`; the `alt`
  is one clear sentence in both languages describing the picture.
- A `code` media item (`{ "kind": "code", "lang": "python" | "sql" | "bash", "code": "..." }`) is for short snippets inside questions.

## How to check your work

1. `node scripts/quiz/validate.ts src/data/quiz/batch-processing-unix-pipes-shuffle-dataflow-lakehouse/set-NN.json`
   Prints every problem; fix until it prints `ok`. (`node --test src/utils/quiz.test.ts` checks all sets
   together and can fail on someone else's unfinished file; use the validator for your own.)
2. Screenshot your set (the dev server on port 4321 is running):
   `node scripts/quiz/shot.mjs 4321 batch-processing-unix-pipes-shuffle-dataflow-lakehouse set-NN /tmp/quiz-NN --questions`
   (use your scratchpad directory instead of `/tmp` if you were given one; retry once if it says the set is missing, the dev server reloads slowly). It writes your scenario and figure in light EN, light VI and dark VI, and every question answered. Open the PNGs with `read_file` and fix what you see: overflowing or clipped labels, unreadable contrast in dark mode, a figure that contradicts the numbers, option text that wraps badly. Never judge widths from character counts, only from the images.
3. Re-read your questions one more time against rules 5 to 14 above. Rerun every verification command.

## Report back (short)

List: the files you wrote; the validator result; for each computed answer the command and output; anything you
could not verify or that goes beyond the post, with its `ref`; anything in the design or brief you think is
wrong. Do not paste the JSON back.

## The sets

Slot table (level / track / type / difficulty per question). Difficulty never decreases inside a set. Totals across the 8 sets:
3 remember, 7 understand, 14 apply, 9 analyze, 7 evaluate; 20 `interview` + 20 `ai`; `multi` in sets 04, 06, 07, 08.

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

*(Ordering note: `loadQuizSets` calls `orderSets`, which sorts sets by mean difficulty then id: `01` (2.4), `02` (2.6), `05` (3.2), `03` (3.4), `04` (3.4), `06` (3.4), `07` (3.8), `08` (4.2). Because set 05 actually renders before set 04 on the quiz page, cross-set guards between sets 04 and 05 apply in BOTH directions.)*

### Scenarios (one per set; your task message names yours)

Sets do not overlap. A stem, scenario, or figure in one set must not name or imply the technique owned by another set.
Remember: NEVER label any invented number or assumption as "illustrative" / "minh họa" — state it plainly ("Suppose a container has a `128 MiB` memory limit...").

| Set | Title (EN) | Scenario & facts | Grows from (post sections) | Calculations needing `verifiedBy` | Figure | Owns (technique/idea) & cross-set guard |
|---|---|---|---|---|---|---|
| 01 | Pipes, spills, and 191 MiB | Uses the post's local Apple M2 NGINX log measurements (`1,000,000` lines, `107 MiB` raw text) plus a stated container memory ceiling: suppose the pipeline runs inside a `128 MiB` cgroup RAM cap. At `500` unique URLs, Python `defaultdict` uses `14.2 MiB` (`0.51 s`) vs `sort -S 8M \| uniq -c` at `17.7 MiB` (`4.53 s`). When query strings push unique URLs to `1,000,000`, Python RSS swells to `191.6 MiB` (`1.14 s`) while the bounded sort pipeline stays at `13.8 MiB` (`3.00 s`). Also covers why read-only input logs keep bad deploys reversible (human fault tolerance) and how kernel pipe ring buffers create backpressure. | `a-laptop-pipeline-vs-a-seven-node-cluster`, `1-unix-pipes-and-human-fault-tolerance`, `sorting-on-disk-vs-hashing-in-ram` | RAM growth ratio (`191.6 / 14.2`), headroom vs `128 MiB` limit, or minimum sorted runs spilled (`ceil(107 / 8)` with formula in stem) | `PipeSortSpill` | Human fault tolerance, kernel pipe backpressure, cardinality vs RAM hash table, `sort -S` external merge spill. Do not quiz why `unix_pipeline` wall time dropped `4.53 s -> 3.00 s`, and do not build math on Adam Drake's `1.75 GB / 12 s` (see Loose Claims). |
| 02 | No folders on S3 | A team migrates a Hadoop/HDFS job (`128 MB` blocks, real POSIX directories, `3×` replication vs `~1.5×` erasure coding) onto Amazon S3. Suppose an output step tries to move `10,000` Parquet files from `output/_tmp/` to `output/` while downstream Trino readers scan `output/`, and two job retries race to write `metadata/v7.json` using S3 conditional writes (`If-None-Match: *`). | `2-distributed-filesystems-and-object-stores`, `the-cloud-shift-hdfs-vs-object-stores-s3-gcs` | HTTP requests for S3 "folder rename" (`2 × 10,000 = 20,000` copy+delete calls vs `1` atomic HDFS rename) and storage footprint (`3×` vs `1.5×` on a stated raw TB size) | `ObjectStoreCommit` | HDFS block/metadata model vs S3 flat keys, non-atomic rename (`copy + delete`), slow prefix `list`, conditional write `If-None-Match: *` (`200 OK` vs `412 Precondition Failed`), erasure coding ratio. Do NOT explain Iceberg manifest trees here (owned by Set 07). |
| 03 | Reclaimed at 95% | A data platform runs a `6-hour` Spark enrichment job on cheap EC2 Spot workers under Kubernetes (`kubelet`, `etcd`, Linux `cgroups`), scheduled as one node in an Airflow DAG (`50`–`100` jobs across Spark, Trino, Python writing between S3/Iceberg steps). An engineer adds a webhook/email call inside the `map` step; suppose Task 42 processes `50,000` records and is preempted at `95%` (`47,500` records sent) right before finishing, so Kubernetes restarts it elsewhere. Meanwhile, an ML team shares the cluster with a `64-GPU` gang-scheduled training job. | `3-orchestrators-spot-retries-and-dags`, `job-orchestrators-vs-workflow-orchestrators`, `surviving-spot-instances-and-task-preemption` | Duplicate external calls caused by mid-task preemption (`47,500 + 50,000 = 97,500` calls on `50,000` records with formula in stem) or GPU deadlock/waste count (`32 + 32` held of `64`) | `SpotPreemptDag` | Cluster orchestrator (K8s/YARN) vs workflow orchestrator (Airflow/Dagster), Linux `cgroups`, gang scheduling deadlock vs starvation, why spot retries require pure tasks with zero external side effects. |
| 04 | One star, four reducers | A team replaces three chained MapReduce jobs (separate JVMs + `3×` HDFS barriers between stages) with a Spark dataflow job joining a large sharded `clicks` table (suppose `40 GB` across `4` reducers) with a large `users` profile table (suppose `8 GB`, partitioned across workers) by `user_id`. Using secondary sort (`0_prof` vs `1_<timestamp>`), mappers hash-partition with `hash(user_id) % 4` and spill sorted runs. A campaign launches for celebrity `@star`, who drives `70%` of all clicks (`10%` on Reducers 1–3, `70%` on Reducer 4). | `4-from-mapreduce-to-dataflow-and-the-shuffle`, `the-shuffle-distributed-sorting-and-secondary-sort-joins`, `when-the-shuffle-breaks-hot-keys-and-broadcast-joins` (skew diagnosis only) | Skewed reducer load (`0.70 × 40 GB = 28 GB` on Reducer 4 vs `4 GB` each on Reducers 1–3; `7×` imbalance, state formula in stem) | `ShuffleHotKey` | MapReduce flaws vs Dataflow fusion + lineage/checkpointing, secondary sort (`O(1)` per-key state, zero DB RPCs), why `hash(key) % N` fails on hot keys (and why simply raising `N` does not cure `@star`). Cross-set guard: do NOT name Broadcast Hash Join or Spark AQE skew splitting as the fix in stems/scenario (owned by Set 05). |
| 05 | Broadcast or split the skew | A Spark SQL pipeline joins a `500 GB` `events` table against a `users` dimension table after filtering active accounts, running across `20` executors (`200` shuffle partitions). Before filtering, `users` is `45 MB`; suppose after filtering, `users` shrinks to `6 MB` (under Spark's `10 MB` `autoBroadcastJoinThreshold`), while in a second full-join stage without a small side, one skewed partition swells to `640 MB` when the median partition is `80 MB` (Spark 3.0 AQE defaults: `5×` median and `256 MB`). An AI assistant forces `SortMergeJoin` everywhere and suggests "disable AQE so plans stay predictable". | `when-the-shuffle-breaks-hot-keys-and-broadcast-joins`, `5-sql-optimizers-dataframes-and-lakehouses` (CBO join strategy choice only) | Network bytes transferred under Sort-Merge (`500 GB + 6 MB`) vs Broadcast (`20 × 6 MB = 120 MB` broadcast to executors, `0` bytes of `events` shuffled), plus checking both AQE skew rules (`640 > 5 × 80` and `640 > 256`) | `BroadcastVsShuffle` | Broadcast Hash Join (`10 MB` `autoBroadcastJoinThreshold`), zero fact-table shuffle, Spark 3.0 AQE runtime switch to broadcast and skew splitting (`5×` median AND `256 MB`). Cross-set guard: do NOT re-teach secondary sort tags `0_prof`/`1_<ts>` (owned by Set 04). |
| 06 | Arrow batches across engines | A multimodal AI/analytics team prepares `200 GB` of Parquet event + image-metadata files (`30` columns) for feature engineering and PyTorch training. An AI assistant drafts a single-node Pandas script using `.iterrows()` and Pickle/JSON serialization between Python workers. The team compares **Pandas**, **Spark DataFrame** (lazy DAG + Catalyst CBO), and **Daft / Ray Data** (streaming distributed **Apache Arrow** batches on Rust/Ray workers), alongside Catalyst predicate pushdown and Parquet column projection. | `5-sql-optimizers-dataframes-and-lakehouses`, `the-convergence-dataframes-arrow-and-iceberg` (DataFrames, CBO, Arrow) | Bytes scanned when reading `3` equal-width columns of `30` after pruning `80%` of row groups (`200 × (3/30) × 0.20 = 4 GB`), or copy overhead vs zero-copy Arrow handoff (state formula in stem) | `ArrowColumnarScan` | Catalyst CBO & predicate pushdown into Parquet row groups; Pandas (eager, ordered index, single node) vs Spark DataFrame (lazy DAG, JVM, unordered) vs Daft/Ray Data (lazy/streaming Arrow, multimodal AI); Apache Arrow zero-copy columnar memory. Do NOT quiz Iceberg snapshot/manifest trees here (owned by Set 07). |
| 07 | Snapshot tree without `list` | A lakehouse stores a multi-terabyte `orders` table on S3 as `50,000` immutable Parquet files managed by **Apache Iceberg**. Suppose the latest snapshot `s2` tracks `50` manifest files (`1,000` Parquet data files each) holding per-column `min`/`max` bounds (`order_date`, `customer_id`), while a bad deploy in `s2` corrupted pricing columns compared to yesterday's `s1`. An engineer runs `WHERE order_date = '2026-11-18' AND customer_id = 42`, and two writers race to commit `s3` via the Catalog atomic pointer. | `the-convergence-dataframes-arrow-and-iceberg`, `2-distributed-filesystems-and-object-stores` (S3 `list` vs metadata lookup) | Files skipped vs read from manifest `min`/`max` bounds (e.g., `2` of `50` manifests match `order_date`, and `3` of `2,000` files hold `customer_id = 42` in `[min, max]`, saving `49,997` Parquet opens) | `IcebergSnapshotManifest` | Iceberg metadata hierarchy (Catalog atomic CAS pointer -> metadata file -> manifest list -> manifest files with column `min`/`max` bounds -> immutable Parquet files), avoiding recursive S3 `list`, ACID optimistic commit, and zero-rewrite time-travel rollback (`s2 -> s1`). |
| 08 | Serving without melting OLTP | Built around LinkedIn's **Venice** production case (`~500` production use cases moved off Voldemort Read-Only by 2018, `>1,400` automated push jobs/day, `>200` hybrid datasets) contrasted with an AI-written Spark pipeline that opens Postgres connections from `200` parallel tasks to `UPSERT` product recommendations row by row into the live checkout database (suppose Postgres `max_connections = 300`, checkout needs `120`, and each Spark task opens `2` connections). Compares direct OLTP writes vs Kafka DMZ + commit signal vs bulk-built immutable SSTables / Venice Full Push + nearline Kafka replay per data center with backup rollback. | `6-serving-batch-outputs-without-breaking-oltp`, `two-safe-ways-to-serve-batch-outputs`, `a-real-case-how-linkedin-serves-batch-built-data-with-venice` | Connection exhaustion (`200 × 2 = 400` batch connections vs `300 - 120 = 180` available) and batch write RPC wall time vs sequential bulk push (with stated assumptions + formulas in stem) | `VeniceDualRead` | Why row-by-row batch->OLTP writes saturate pools, spike live `p99`, and leak partial retries; Kafka DMZ + commit signal; bulk SSTable ingestion (RocksDB/Pinot) and LinkedIn Venice Full Push + hybrid nearline replay + atomic DC swap & instant rollback. |

Coverage check: sets 01 to 08 cover all six numbered sections of the post, include the post's measured Apple M2 benchmark (Set 01), AWS S3 conditional writes (Set 02), EC2 Spot & K8s/Airflow orchestration (Set 03), MapReduce->Dataflow & Secondary Sort & Skew (Set 04), Spark AQE & Broadcast Join (Set 05), Catalyst/Arrow/Daft/Ray Data (Set 06), Apache Iceberg snapshot trees (Set 07), and LinkedIn Venice + OLTP decoupling (Set 08).

## Verified facts & exact numbers in the post (against opened/checked sources)

- **Post local Apple M2 NGINX benchmark** (`1,000,000` synthetic lines, `107 MiB` raw text, `sort -S 8M`):
  - `500` unique URLs: `python_hash` `0.51 s`, peak RSS `14.2 MiB`; `unix_pipeline` `4.53 s`, peak RSS `17.7 MiB`.
  - `1,000,000` unique URLs: `python_hash` `1.14 s`, peak RSS `191.6 MiB` (`~13.5×` growth); `unix_pipeline` `3.00 s`, peak RSS `13.8 MiB` (under `18 MiB`).
- **Filesystems & Object Stores**:
  - `ext4` block size `4,096` bytes (`4 KB`) via Linux VFS; HDFS block size `128 MB`, default `3×` replication vs erasure coding `~1.5×` (e.g., Reed-Solomon parity shards); JuiceFS flushes `4 MB` chunks/blocks to S3/GCS with metadata in Redis/PostgreSQL/TiKV/FoundationDB; DeepSeek `3FS` stores transactional metadata in `FoundationDB` over NVMe and RDMA networks.
- **Google MapReduce retirement**:
  - Original paper **2004**; **September 2019** Urs Hölzle announced Google removed its remaining internal MapReduce codebase (verified).
- **Spark 3.0 Broadcast & AQE defaults** (Apache Spark docs):
  - `spark.sql.autoBroadcastJoinThreshold`: `10 MB` default (`10MB`).
  - `spark.sql.adaptive.skewJoin.skewedPartitionFactor`: `5` (`5×` median partition size); `spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes`: `256 MB` default (`256MB`). Both conditions must hold for AQE to split a skewed partition.
- **LinkedIn Venice** (`https://www.linkedin.com/blog/engineering/open-source/open-sourcing-venice-linkedin-s-derived-data-platform`):
  - Post cites: around `500` production use cases moved onto Venice by **2018** (replacing Voldemort Read-Only), `>1,400` automated push jobs/day, `>200` hybrid datasets; per-DC atomic version swap after background load + replay of recent nearline writes + previous version retained for rollback. Reopen the LinkedIn blog URL before adding any detail beyond what the post prints (later Venice docs cite `1,800+` datasets).

## Claims in the post that look wrong or loose (do NOT build fragile questions on them)

1. **Adam Drake's 235× Hadoop vs Unix pipeline comparison (Intro)**:
   - The post writes that Hadoop processed ~`1.75 GB` of chess games in `26 minutes` (`~1.14 MB/s`), and Drake took *"the same dataset"* onto his laptop and finished in `12 seconds` (`~270 MB/s`) — `235` times faster.
   - Checked against the source (`adamdrake.com`): Tom Hayden's 7-node EMR `c1.medium` Hadoop job processed `1.75 GB` in `26 min` (`1.14 MB/s`), while Adam Drake's laptop script processed **`3.46 GB`** of PGN data in `12 s` (`~270 MB/s`, giving `270 / 1.14 ≈ 235×` throughput speedup, whereas `1.75 GB / 12 s` would be `~149 MB/s` and `26 min / 12 s = 130×`).
   - **Rule for authors:** Do NOT write calculation questions dividing `1.75 GB` by `12 s` or `26 min` by `12 s` expecting `235×` or `270 MB/s`. If you mention Drake's case, stick to the qualitative lesson (startup/JVM/coordination tax on small data) or quote the throughput numbers (`1.14 MB/s` vs `270 MB/s`) only after reopening Drake's post.
2. **Amazon S3 conditional writes timeline & status codes (Section 2)**:
   - The post groups `If-None-Match: *` and `If-Match` under August 2024 and mentions `412 Precondition Failed`.
   - Checked against AWS announcements: S3 added `If-None-Match: *` (write-if-not-exists) in **August 2024**, and added `If-Match` (ETag compare-and-swap) later in **November 2024**. When a condition evaluates to false (key already exists or ETag mismatches), S3 returns `412 Precondition Failed`; when two concurrent conditional writes collide mid-flight, S3 can return `409 ConditionalRequestConflict`.
   - **Rule for authors:** Do not test the exact release month of `If-Match`, and do not claim `412` is the sole HTTP error code S3 can ever emit under concurrent contention (use `412 Precondition Failed` cleanly for key-already-exists on `If-None-Match: *` after an earlier commit succeeded, or say retry on precondition/conflict errors).
3. **Apple M2 `unix_pipeline` wall-clock anomaly (Section 1)**:
   - In the post's `TerminalOutput`, `unix_pipeline` (`sort -S 8M | uniq -c`) took `4.53 s` on `500` unique URLs and `3.00 s` on `1,000,000` unique URLs. Do NOT write a question claiming `sort` inherently runs faster on high-cardinality inputs; test the **peak RSS crossover** (`14.2 -> 191.6 MiB` vs `< 18 MiB`) and spill-to-disk behavior instead.
4. **Interactive simulator numbers (`BatchShuffle.astro`)**:
   - The post's interactive demo caption mentions a `10M-row` log, `128 MiB` cgroup cap, `32 MiB` sort buffer, and a `1M-event` join with an `8 MB` user table across `4` workers. Those are simulated demo parameters, not hardware benchmarks — if you use similar numbers in a set, introduce them explicitly as scenario assumptions ("Suppose...").
5. **Unelaborated scale/system mentions**:
   - `"10,000-node scale"` (Section 5) and `"OpenAI runs Ray"` (Section 6) are brief mentions without operational numbers in the post; do not extrapolate benchmarks around them.

## Allowed `reread.anchor` values (English heading slugs of the post)

```
a-laptop-pipeline-vs-a-seven-node-cluster
1-unix-pipes-and-human-fault-tolerance
sorting-on-disk-vs-hashing-in-ram
2-distributed-filesystems-and-object-stores
the-cloud-shift-hdfs-vs-object-stores-s3-gcs
3-orchestrators-spot-retries-and-dags
job-orchestrators-vs-workflow-orchestrators
surviving-spot-instances-and-task-preemption
4-from-mapreduce-to-dataflow-and-the-shuffle
the-shuffle-distributed-sorting-and-secondary-sort-joins
when-the-shuffle-breaks-hot-keys-and-broadcast-joins
5-sql-optimizers-dataframes-and-lakehouses
the-convergence-dataframes-arrow-and-iceberg
6-serving-batch-outputs-without-breaking-oltp
two-safe-ways-to-serve-batch-outputs
a-real-case-how-linkedin-serves-batch-built-data-with-venice
key-takeaways
review-questions
```
