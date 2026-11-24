# System diagram icons

Used by `src/components/mdx/DiagramIcon.astro` (`<DiagramIcon name="db" ... />` inside an SVG figure). The list of keys and meanings is `src/data/diagram-icons.ts`; do not reference these files by path.

Extracted from Iconify JSON packages (body + viewBox only, no package installed):

- `logos`: Gil Barbara, CC0-1.0 (https://github.com/gilbarbara/logos). The `gopher` drawing follows the Go gopher by Renee French (CC BY 4.0).
- `fluent-emoji-flat`: Microsoft Fluent UI Emoji, MIT (https://github.com/microsoft/fluentui-emoji)
- `flat-color-icons`: Icons8, MIT (https://github.com/icons8/flat-color-icons)
- `fluent-color`: Microsoft Fluent UI System Color Icons, MIT (https://github.com/microsoft/fluentui-system-icons)
- `drawn`: drawn for this site (`server`, `log`, `db`)

| file | set | icon | meaning |
|---|---|---|---|
| `server.svg` | drawn | — | server / node / service instance |
| `log.svg` | drawn | — | append-only log / topic partition |
| `db.svg` | drawn | — | any database |
| `laptop.svg` | fluent-emoji-flat | laptop | client / app user |
| `desktop.svg` | fluent-emoji-flat | desktop-computer | desktop client, operator console |
| `phone.svg` | fluent-emoji-flat | mobile-phone | mobile client |
| `user.svg` | fluent-emoji-flat | bust-in-silhouette | one person |
| `users.svg` | flat-color-icons | conference-call | many people / tenants |
| `cloud.svg` | fluent-color | cloud-48 | cloud provider / region |
| `disk.svg` | fluent-emoji-flat | computer-disk | disk / SSD / file on disk |
| `file.svg` | fluent-emoji-flat | page-facing-up | a file, record or document |
| `folder.svg` | flat-color-icons | folder | directory / bucket prefix |
| `backup.svg` | flat-color-icons | data-backup | backup / snapshot |
| `sync.svg` | flat-color-icons | synchronize | replication / sync |
| `lock.svg` | fluent-emoji-flat | locked | lock / lease |
| `key.svg` | fluent-emoji-flat | key | key, token, encryption key |
| `clock.svg` | fluent-emoji-flat | alarm-clock | clock / time |
| `stopwatch.svg` | fluent-emoji-flat | stopwatch | timeout / latency |
| `hourglass.svg` | fluent-emoji-flat | hourglass-not-done | waiting / pause |
| `network.svg` | fluent-emoji-flat | globe-with-meridians | network / internet |
| `warning.svg` | fluent-emoji-flat | warning | warning / risk |
| `ok.svg` | fluent-emoji-flat | check-mark-button | success |
| `fail.svg` | fluent-emoji-flat | cross-mark | failure / rejected |
| `retry.svg` | fluent-emoji-flat | repeat-button | retry / replay |
| `worker.svg` | fluent-emoji-flat | gear | worker / job / processor |
| `model.svg` | fluent-emoji-flat | robot | ML model / automated decision |
| `search.svg` | fluent-emoji-flat | magnifying-glass-tilted-left | search / lookup / index |
| `index.svg` | fluent-emoji-flat | card-index | index |
| `chart.svg` | fluent-emoji-flat | bar-chart | analytics / dashboard |
| `money.svg` | fluent-emoji-flat | money-bag | money / balance |
| `card.svg` | fluent-emoji-flat | credit-card | payment card |
| `receipt.svg` | fluent-emoji-flat | receipt | receipt / order |
| `bank.svg` | fluent-emoji-flat | bank | bank / institution |
| `mail.svg` | fluent-emoji-flat | envelope | email / message |
| `bell.svg` | fluent-emoji-flat | bell | notification / alert |
| `package.svg` | fluent-emoji-flat | package | package / batch output |
| `shield.svg` | fluent-emoji-flat | shield | security / protection |
| `eye.svg` | fluent-emoji-flat | eye | tracking / observation |
| `scale.svg` | fluent-emoji-flat | balance-scale | law / fairness / decision |
| `car.svg` | fluent-emoji-flat | automobile | car / vehicle |
| `link.svg` | fluent-emoji-flat | link | reference / pointer |
| `calendar.svg` | flat-color-icons | calendar | date / schedule |
| `postgres.svg` | logos | postgresql | PostgreSQL |
| `mysql.svg` | logos | mysql-icon | MySQL |
| `cassandra.svg` | logos | cassandra | Cassandra |
| `mongodb.svg` | logos | mongodb-icon | MongoDB |
| `elasticsearch.svg` | logos | elasticsearch | Elasticsearch |
| `redis.svg` | logos | redis | Redis |
| `kafka.svg` | logos | kafka-icon | Kafka |
| `rabbitmq.svg` | logos | rabbitmq-icon | RabbitMQ |
| `spark.svg` | logos | apache-spark | Apache Spark |
| `flink.svg` | logos | apache-flink-icon | Apache Flink |
| `hadoop.svg` | logos | hadoop | Hadoop |
| `snowflake.svg` | logos | snowflake-icon | Snowflake |
| `s3.svg` | logos | aws-s3 | Amazon S3 / object store |
| `dynamodb.svg` | logos | aws-dynamodb | DynamoDB |
| `rds.svg` | logos | aws-rds | Amazon RDS |
| `lambda.svg` | logos | aws-lambda | AWS Lambda |
| `docker.svg` | logos | docker-icon | Docker / container |
| `kubernetes.svg` | logos | kubernetes | Kubernetes |
| `etcd.svg` | logos | etcd | etcd |
| `nginx.svg` | logos | nginx | nginx / load balancer |
| `sqlite.svg` | logos | sqlite | SQLite |
| `vitess.svg` | logos | vitess | Vitess |
| `github.svg` | logos | github-icon | GitHub |
| `gitlab.svg` | logos | gitlab-icon | GitLab |
| `bitbucket.svg` | logos | bitbucket | Bitbucket |
| `discord.svg` | logos | discord-icon | Discord |
| `stripe.svg` | logos | stripe | Stripe |
| `shopify.svg` | logos | shopify | Shopify |
| `notion.svg` | logos | notion-icon | Notion |
| `slack.svg` | logos | slack-icon | Slack |
| `figma.svg` | logos | figma | Figma |
| `linkedin.svg` | logos | linkedin-icon | LinkedIn |
| `netflix.svg` | logos | netflix-icon | Netflix |
| `cloudflare.svg` | logos | cloudflare-icon | Cloudflare |
| `google-cloud.svg` | logos | google-cloud | Google Cloud |
| `go.svg` | logos | go | Go itself: the toolchain, the runtime or a Go program |
| `gopher.svg` | logos | gopher | one goroutine |
| `cpu.svg` | flat-color-icons | electronics | CPU core / processor |
| `heap.svg` | fluent-emoji-flat | card-file-box | heap / memory region |
| `stack.svg` | fluent-emoji-flat | books | call stack / goroutine stack |
| `chan-in.svg` | fluent-emoji-flat | inbox-tray | channel / queue, receive side |
| `chan-out.svg` | fluent-emoji-flat | outbox-tray | send into a channel / queue |
| `gc.svg` | fluent-emoji-flat | broom | garbage collector |
| `garbage.svg` | fluent-emoji-flat | wastebasket | garbage / freed memory |
| `recycle.svg` | fluent-emoji-flat | recycling-symbol | reuse / sync.Pool |
| `test.svg` | fluent-emoji-flat | test-tube | test / experiment |
| `bug.svg` | fluent-emoji-flat | lady-beetle | bug / data race / defect |
| `hot.svg` | fluent-emoji-flat | fire | hot path / CPU hot spot / flame graph |
| `slow.svg` | fluent-emoji-flat | snail | slow path / high latency |
| `fast.svg` | fluent-emoji-flat | rabbit | fast path / low latency |
| `panic.svg` | fluent-emoji-flat | collision | panic / crash |
| `stop.svg` | fluent-emoji-flat | stop-sign | cancel / stop signal |
| `signal.svg` | fluent-emoji-flat | satellite-antenna | broadcast signal (ctx.Done, closed channel) |
| `interface.svg` | fluent-emoji-flat | electric-plug | interface: anything that fits the socket |
| `generic.svg` | fluent-emoji-flat | puzzle-piece | type parameter / pluggable piece |
| `struct.svg` | fluent-emoji-flat | card-index | struct / record with fields |
| `doc.svg` | fluent-emoji-flat | page-facing-up | JSON / response body / document |
| `web.svg` | fluent-emoji-flat | globe-with-meridians | HTTP / public endpoint / the internet |
| `loop.svg` | fluent-emoji-flat | repeat-button | loop / iteration |
| `stream.svg` | fluent-emoji-flat | water-wave | byte stream / streaming |
| `config.svg` | fluent-emoji-flat | gear | setting / runtime knob |
| `build.svg` | fluent-emoji-flat | hammer-and-wrench | build / compile / tooling |
| `measure.svg` | fluent-emoji-flat | straight-ruler | measure / size / alignment |
| `idea.svg` | fluent-emoji-flat | light-bulb | rule of thumb / takeaway |
| `ladder.svg` | fluent-emoji-flat | ladder | learning ladder / levels |
| `question.svg` | fluent-emoji-flat | speech-balloon | interview question / conversation |
| `goal.svg` | fluent-emoji-flat | trophy | goal met / budget passed |
| `idle.svg` | fluent-emoji-flat | zzz | idle / parked / blocked goroutine |
| `timer.svg` | fluent-emoji-flat | timer-clock | timer / ticker |
| `deadlock.svg` | fluent-emoji-flat | chains | deadlock / stuck together |
| `random.svg` | fluent-emoji-flat | game-die | random choice (select, map order) |
| `speedup.svg` | fluent-emoji-flat | rocket | speed-up / optimized result |
| `throttle.svg` | fluent-emoji-flat | thermometer | CPU throttling / pressure |
| `label.svg` | fluent-emoji-flat | label | tag / metric label |
| `terminal.svg` | flat-color-icons | command-line | terminal / go command |
| `code.svg` | fluent-color | code-24 | source code |
| `tree.svg` | flat-color-icons | tree-structure | call tree / package tree |
| `parallel.svg` | flat-color-icons | parallel-tasks | parallel work |
