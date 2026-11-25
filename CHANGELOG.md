# CHANGELOG

Running context cho AI agent, mới nhất trên đầu. Mỗi entry: **đã làm** / **ai quyết** / **chưa chốt**.
Không cần đọc lại toàn bộ chat history — file này là nguồn sự thật cho trạng thái repo.

## 2026-11-25 — Quiz DDIA đợt 2: trouble, consensus, batch (3 bài × 8 bộ × 5 câu)

- **Đã làm (nhánh `feat/ddia-quiz-wave-2`):** 3 brief `docs/superpowers/specs/2026-11-25-ddia-quiz-authoring-brief-{trouble,consensus,batch}.md`, 24 bộ câu hỏi (120 câu), 24 figure SVG mới; khai báo 3 bài `code` trong `domains.ts`. Một phiên trước soạn xong nhưng chưa commit; phiên này kiểm, sửa và commit (mỗi bài 1 commit).
- **Lead review:** validator `ok` cả 24 bộ; chụp 72 ảnh (light EN, light VI, dark VI), đọc đủ 24 ảnh dark VI + vài ảnh light EN. Sửa 2 hình: `TimeoutSweep` (nhãn "100 ms" đè đường RTT rơi xuống ở giây 2,6 → dời vào giữa vùng nghẽn; icon node đè dòng chữ thứ hai → thu nhỏ, dời lên), `PipeSortSpill` (chữ `awk` / `sort -S 8M` sát icon → lùi 4px).
- **Ai quyết:** user ("làm hết luôn").
- **Kiểm tra:** `node --test` 65 pass, build 77 trang.
- **Chưa chốt / yếu:** chưa xem từng câu q1–q5 (`--questions`) và 360px; vài icon trong `RaftTermElection` hơi lấn mép ô (nhỏ, để nguyên). Lead chưa mở lại nguồn của từng hook (GitHub 21/10/2018, Cloudflare leap second 2017, Jepsen etcd 3.4.3, LinkedIn Venice...); dựa vào `ref` agent đã ghi. Đợt 3 (stream, unbundling, ethics) chưa bắt đầu.

## 2026-11-24 — Dọn nhãn "minh họa" khỏi hình và bài blog; sửa nút Next; thay 2 câu quiz trùng

- **Đã làm (3 PR, mỗi việc một nhánh):** (1) `fix/quiz-next-button` (#64): nút Next trên trang quiz không còn `sticky`, hết đè lên dòng "Correct answer". (2) `fix/quiz-duplicate-cases` (#65): thay s02q4 (giờ hỏi vốn hóa không phải tiền mặt công ty đang giữ) và s08q3 (tiền đi từ người mua sang người bán, lợi nhuận FPT không đổi) vì trùng s03q5 và s03q3. (3) `chore/drop-illustrative-labels`: bỏ các nhãn "illustrative / minh họa / số bịa / made-up" trong chữ hiển thị của ~115 file (hình SVG, demo, 6 bài blog); số bịa thì nêu giả định trong câu ("Giả sử ..."). Không sửa comment code, không đụng AnimatedFlow / DemoFrame / DiagramIcon, giữ EN và VI đồng bộ. Hai hình bị xóa phần tử chú thích (`StorageBVectorSpace`, `MarketLimitQueue`; `StorageBitcask` bỏ nhãn "example values"); `MarketLimitQueue` thu viewBox 430 → 400.
- **Ai quyết:** user ("Làm đi" sau khi AI nêu 3 việc tồn đọng). AI chia 7 nhóm file cho 7 agent Sonnet, lead tự grep kiểm lại và bắt thêm 4 chỗ cùng kiểu (`TxSsiFlow`, `GoP09Semaphore`, `StorageBitcask`, dòng EN của bài replication).
- **Kiểm tra:** `node --test` 59 pass, build 74 trang. Chụp thật: hình MarketLimitQueue (quiz ai-trading set 07), set-08 stocks. Chưa chụp lại từng hình trong ~100 component; chưa kiểm dark mode / 360px.
- **Chưa chốt:** giữ lại những chỗ "minh họa" là danh từ thường (ảnh minh họa, "Minh họa UI") và câu nói rõ nguồn ("Panel dưới minh hoạ cách sửa đó; bài gốc không cho thấy code nội bộ của Starbucks"). `GoContextCancelDemo` và `GoGenericsStencilDemo` bản VI giờ là "Code Go" còn EN là "Go Source Trace" (hai ngôn ngữ lệch nhẹ). Các brief quiz cũ trong `docs/superpowers/specs/*authoring-brief*` vẫn nhắc `context.illustrative` (lịch sử, cờ đó đã bị xóa).

## 2026-11-24 — Quiz: câu hỏi đánh giá kết quả AI chỉ cho bài về code

- **Đã làm (nhánh `chore/quiz-ai-track-by-domain`, spec `docs/superpowers/specs/2026-11-24-quiz-ai-track-by-domain.md`):** thêm `QuizDomain` (`code` | `human`) và `src/data/quiz/domains.ts` (mỗi bài có quiz phải khai báo). `validateSet(set, anchors, domain)`: bài `human` cấm `track: ai`, type `ai-review` / `ai-advice` / `code-output` và mọi stem/đáp án nhắc AI/LLM/ChatGPT/Claude...; bài `code` cấm `track: case`. Track mới `case` = tình huống thật tự đánh giá bằng kỹ năng đó (đọc số liệu, chọn cách xử lý, chỉ ra lỗi suy luận của người). Test tổng 8 bộ theo lĩnh vực: `interview 20 + ai 20` (code) hoặc `interview 20 + case 20` (human). Thêm dòng quy ước vào `AGENTS.md`, ghi chú sửa đổi vào spec thiết kế quiz.
- **Ai quyết:** user (bài về kỹ năng con người như cổ phiếu, UX/UI không nên có câu đánh giá kết quả AI; thay bằng loại câu hỏi khác). AI chọn tên track `case` và danh sách lĩnh vực.
- **Quiz cổ phiếu viết lại:** `what-is-a-stock-ownership-dividends` thay 20 câu `ai` bằng 20 câu `case` (8 agent Sonnet, mỗi bộ 1 agent; phép tính đều có `verifiedBy` chạy bằng Python; context set-08 bỏ "AI factories"). Giờ 20 `interview` + 20 `case`, 4 câu `multi`, không còn chữ AI. Bỏ `PENDING_REWRITE`. Validator khớp "AI" phân biệt hoa thường vì tiếng Việt "ai" nghĩa là "who" (lỗi này agent phát hiện và đã sửa).
- **Tình huống quiz (user, 24/11):** thẻ "Tình huống" quá dày chữ và cột trái trống. Thêm `QuizContext.astro` (mỗi dòng một đoạn, `• ` thành danh sách có thụt lề); viết lại 8 context quiz cổ phiếu thành case thật / vấn đề người đọc gặp ngoài đời, mỗi con số một dòng (không thêm sự thật mới); quy tắc ghi vào spec + AGENTS.md. Quiz DDIA/AI trading chưa viết lại context theo định dạng này (vẫn hiển thị được, là một khối chữ).
- **Ai quyết:** user chốt series ai-trading giữ `code`, và bảo viết lại quiz cổ phiếu; không hiển thị domain/track lên UI.
- **Kiểm tra:** `node --test` 59 pass, build 74 trang. Chưa xem các câu mới trên trang thật (light/dark, EN/VI, 360px).
- **Chưa chốt / yếu:** vài câu `case` gần trùng nhau giữa các bộ vì mỗi agent chỉ thấy bộ của mình: s03q3 và s08q3 cùng phép tính "2.000 cổ phiếu Vinamilk × lợi nhuận mỗi cổ phiếu"; s02q4 và s03q5 cùng lỗi "Vinamilk lãi nhiều hơn nên mỗi cổ phiếu lãi nhiều hơn". Ý lỏng trong bài gốc: "cổ tức cao nhất từ 2018" của Vinamilk không kiểm chứng được từ bài. Series UI/UX và stocks-basics bài sau chưa có quiz; khi làm phải khai báo `human` trong `domains.ts`.

## 2026-11-24 — Quiz DDIA đợt 1: trade-offs, sharding, transactions (3 bài × 8 bộ × 5 câu)

- **Đã làm (nhánh `feat/ddia-quiz-wave-1`, plan `docs/superpowers/plans/2026-11-24-ddia-quiz-remaining-posts.md`):** 3 agent Sonnet soạn brief riêng từng bài (8 kịch bản, tên figure, danh sách anchor), rồi 24 agent Sonnet song song, mỗi agent 1 bộ + 1 figure SVG. 120 câu, 24 figure mới, 24 `verifiedBy` chạy bằng Python. Mỗi bài 1 commit.
- **Ai quyết:** user ("hoàn thành bộ câu hỏi cho tất cả các bài" DDIA; chọn 8 bộ/bài, chia 3 đợt, mỗi đợt 1 PR). Chủ đề từng bộ do agent soạn brief chọn.
- **Kiểm tra:** validator `ok` cả 24 bộ, `node --test` 53 pass, build 74 trang. Agent tự xem ảnh light EN / dark VI / từng câu; lead không xem lại từng ảnh (tiết kiệm token). Một số ảnh chụp trước lần sửa cuối của agent: sharding 04 (light VI, q1–q4), sharding 05 (q5), trade-offs 06 (nhãn VI), sharding 08 (cách xuống dòng đáp án).
- **Lỗi/ý lỏng trong bài gốc phát hiện khi soạn quiz (chưa sửa bài):** trade-offs: Hex ngày 7/11 vs 11/11 và "2 giờ 40 phút" mâu thuẫn nguồn; Photoroom "set `max_slot_wal_keep_size`" nguồn chỉ khuyến nghị; "tiết kiệm $1,9 triệu/năm" là chênh run-rate, bỏ qua tiền phần cứng và S3 còn lại. Sharding: Discord "static 10-day windows" và khóa chính chính xác không có trong nguồn; `@everyone` chỉ là giả định; Slack không nhắc VTGate, "thousands of idle hosts" không có trong nguồn; Notion "zero downtime" lỏng hơn nguồn; Bieber 3% và Meta Shard Manager không nguồn; EN "Cyber Monday" vs VI "Black Friday"; EN/VI khác nhau ở dải `T–Z`; consistent hashing "chuyển ~25%" chỉ gần đúng (mô phỏng 21%). Transactions: bảng SSI nói read-only "không bao giờ abort" (PostgreSQL vẫn có thể, trừ `READ ONLY DEFERRABLE`); bullet double-spending gán write skew cho Flexcoin/Poloniex nhưng nguồn chỉ nói racing check-then-debit; Starbucks 15 + 5 USD không giải thích cơ chế; chú thích benchmark "Python 3.15" cần kiểm.
- **Chưa chốt:** PR chờ user merge. Nút "Next" dính đáy có thể che dòng kết quả ở Q4/Q5 (2 agent độc lập thấy) — chưa xác minh là lỗi trang chung. Đợt 2 (trouble, consensus, batch) và đợt 3 (stream, unbundling, ethics) chưa bắt đầu.

## 2026-11-23 — Wave B series backend: viết bài 5–7 (draft)

- **Đã làm (branch `feat/backend-wave-b`, 3 agent Sonnet song song mỗi bài 1 worktree):** **Bài 5** `backend-database-access-layer`: hook Val Town post-mortem (31/12/2024, pool không timeout, 6 giờ 49 phút); `SqlCaseRepository` sau seam bài 4 (service không đổi), session-per-request bằng dependency `yield` (commit/rollback), `scope="function"`, pool cạn → `QueuePool` timeout, N+1 21 vs 2 query, `create_all` không phải migration; DDIA split khai báo 1 lần. **Bài 6** `backend-async-concurrency-workers`: hook Cloudflare 2/7/2019; `time.sleep` trong `async def` 10,05 s vs 1,06 s, bẫy `requests` trong async, GIL + `ProcessPoolExecutor`, `--workers 3` mỗi process một bộ đếm, `BackgroundTasks` mất khi `kill -9`. **Bài 7** `backend-auth-oauth2-jwt`: hook USPS/Krebs 2018 (60 triệu user); Argon2id vs sha256, session vs JWT khi logout, `OAuth2PasswordBearer` + PyJWT (401/expired/tampered/`alg=none`), scope → 403, BOLA → 404. 20 file demo `p05–p07_*` (thêm vào `demo/README.md`), 18 sơ đồ `BeP05–07*`, ảnh bìa chụp thật, hero ảnh public domain.
- **Controller review:** agent không đọc được ảnh (hook `rtk`) → lead tự xem từng lát figshot (JPEG nhỏ). Bắt và sửa: bài 6 hình workers ghi pid `48989` **bịa** (không có trong capture) → đổi thành "never answered"; bài 6 2 nhãn VI chưa dịch trong cây quyết định; bài 5 chú thích "ô nhỏ ở 0 s" mà ô không nhìn thấy → bỏ; alt ảnh hero của cả 3 bài mô tả sai ảnh (tả theo tiêu đề Commons, không theo ảnh) → viết lại theo ảnh thật. Kiểm nguồn 3 hook khớp (Val Town kể đúng nguyên nhân đã đính chính). Sửa thêm dấu `>>>>>>>` sót trong `public/icons/flow/README.md` từ lần merge wave A.
- **Ai quyết:** user ("làm 3 bài tiếp theo"); chọn nội dung từng bài do agent theo brief.
- **Kiểm tra:** build + 47 test sạch; mọi fence python khớp byte `demo/*.py`; không link gãy; `post-check.sh` sạch cả 3 bài; secret JWT trong demo là giá trị giả đọc từ env.
- **Chưa chốt:** 3 bài `draft: true` chờ user đọc; PR #55 (publish bài 2–4) chờ user merge (lệnh merge của AI bị chặn); wave C (8–10) sau khi user duyệt wave B.

## 2026-11-23 — Xuất bản bài 2–4 series backend

- **Đã làm (branch `content/publish-backend-2-4`):** flip `draft: true` → `false` cho `backend-rest-api-design`, `backend-validation-schemas`, `backend-layered-architecture`. Build 68 → 71 pages, 47 test pass; không bài nào link tới bài backend chưa xuất bản.
- **Ai quyết:** user ("Public các bài còn lại").
- **Chưa chốt:** wave B (bài 5–7) bắt đầu ngay sau entry này.

## 2026-11-22 — Sửa bài stocks post 1 sau khi PR #20 đã merge: cơ chế EPS kiểm toán sai

- **Bối cảnh:** PR #20 (nhánh `feat/stocks-basics-post1`) được merge vào main trong lúc session còn đang chạy fix wave — main lên live với bản sai ở mục 2: bài giải thích EPS kiểm toán FPT 5,216 thấp hơn phép chia đơn giản ≈5,504 là do "weighted-average share count + cổ tức cổ phần 15% phát hành giữa năm" — **sai chiều** (weighted-average 1,699,740,091 thấp hơn end-count 1,703,507,121 nên chỉ làm EPS cao hơn ≈5,516). Cơ chế thật (Note 25 BCTN FPT 2025): EPS = (9,376,127,629,501 − 510,167,707,669 trích quỹ khen thưởng và phúc lợi) ÷ weighted-average 1,699,740,091 ≈ 5,216.
- **Đã làm (fix `8eb3869`, đã qua re-review scoped):** sửa parenthetical mục 2 EN+VI về cơ chế trích quỹ khen thưởng & phúc lợi; thêm note đối xứng cho EPS kiểm toán Vinamilk (generic, không bịa số); quiz set-03 context + `s03q2.whyRight` EN+VI theo cơ chế đúng; quiz set-01 s01q4 đổi claim bịa "55,000 VND" → "≈5,500 VND" để framing "sai 1,000x, rơi 3 số 0" đúng chính xác cả hai chiều. Gate: build sạch (59 trang sau khi sync main — 8 bài Go publish + backend series từ PR #18/#19), `node --test` 41 pass, post-check 0 lỗi.
- **Ai quyết:** final whole-branch review bắt fix (Critical/Important); user đã tự merge PR #20 ngoài session (cùng lúc đó một session khác cũng mở PR #18, #19).
- **Chưa chốt:** `demo/__pycache__/trace_demo.cpython-313.pyc` bị track nhầm theo PR backend series — nên gitignore + untrack (việc riêng); `.nav-actions` tràn ~44px ở 360px (site-wide, cũ); bài 2 series stocks-basics.

## 2026-11-23 — Mang fix EPS mồ côi từ phiên 22/11 lên main

- **Bối cảnh:** sau khi bài 1 đã publish (entry 2026-11-22), nhánh local `feat/stocks-basics-post1` còn sót 1 commit fix `8eb3869` (23:06 ngày 22/11) chưa lên main — server restart giữa phiên nên không kịp push. Fix sửa: giải thích EPS kiểm toán (EN+VI) — thấp hơn phép chia đơn giản vì tính trên lợi nhuận sau khi trích quỹ khen thưởng/phúc lợi + weighted-average share count nhỏ hơn (bản cũ chỉ nêu weighted-average + cổ tức 15%, thiếu trích quỹ); bổ sung chú thích cùng loại cho EPS kiểm toán của Vinamilk; chỉnh framing độ lớn số trong quiz set-01/set-03.
- **Đã làm (nhánh `fix/stocks-post1-eps-framing`, cherry-pick `8eb3869` → `5e9eccb`):** cherry-pick sạch, không conflict với các commit review đã merge.
- **Ai quyết:** AI (AGENTS flow: công việc đã commit nhưng chưa merge → đưa lên PR, đợi user merge).
- **Kiểm tra:** `npm run build` 60 pages sạch, `node --test` 47/47 pass, fix xuất hiện trong trang build (2 chỗ EN/VI).
- **Chưa chốt:** viết tiếp bài 2 `vietnam-stock-market-venues-open-account`.

## 2026-11-24 — Bìa sách series v2: ảnh thật, tiêu đề lớn, màu nhấn theo series

- **Quyết định (user, sau nhiều vòng dựng mẫu HTML → PNG, tham khảo bìa Kurose & Ross):** một layout cho cả 6 series — ảnh thật phủ kín bìa, tiêu đề lớn ở đầu bìa (Noto Sans 600, **từ chủ đề** như "AI", "Go", "Backend" tô màu series), một đường kẻ mảnh, phụ đề một dòng, tên "Khang Nguyen" góc dưới bên phải (cùng font/cỡ/độ đậm với phụ đề). Chữ trên mặt bìa **chỉ tiếng Anh** (user yêu cầu) — ngoại lệ so với quy tắc `{ en, vi }`, chỉ áp cho mặt bìa; credit/pitch vẫn song ngữ. Chọn kiểu nhấn bằng màu, không phải cỡ chữ.
- **Ảnh (đều thật, từ Wikimedia Commons, ghi đủ credit):** UI Design = cầu thang xoắn Bauhaus Weimar (CC BY-SA 3.0); Data Systems = ổ cứng mở nắp (PD); Go = quân cờ vây (CC BY-SA 4.0); Stock Basics = sàn NYSE đen trắng (PD); Backend = rack IBM cáp xanh/vàng (CC BY 3.0); AI Trading = Robonaut đối mặt phi hành gia (PD). Tên bìa Data Systems đổi thành "Data Systems Under Pressure" (chỉ trên bìa, `series.title` giữ nguyên).
- **Đã làm (nhánh `feat/series-covers-v2`, plan `docs/superpowers/plans/2026-11-24-series-covers-v2.md`):** 6 ảnh vào `src/assets/series/cover-*.jpg` (max 1600px); `SeriesCoverArt` thêm `title {lead?, accent, rest?}`, `tagline`, `hue`, bỏ `subtitle`/`imprint`, khai báo `credit.origin?`; `BookCover.astro` viết lại (giữ gáy, mép trang, nghiêng phối cảnh; thumbnail `sm` chỉ hiện tiêu đề); xóa 6 ảnh bìa cũ không còn dùng.
- **Kiểm tra:** `npm run build` 60 pages sạch, `node --test` 47/47 pass; xem mắt 6 trang `/blog/series/<id>/` và thumbnail ở blog index (desktop, light).
- **Chưa chốt / chưa kiểm:** chưa kiểm 360px thật và dark mode bằng trình duyệt thật (headless không ép được viewport hẹp; bìa là vật thể giữ nguyên màu ở cả 2 theme); ảnh Backend/UI dọc 1600×2400 khá nặng (0.8–1.4MB), có thể nén thêm nếu cần; số `position` từng ảnh có thể tinh lại.

## 2026-11-23 — Series Go: bỏ mục "Coming from Java, Python or JavaScript"; sửa review đợt 4 (bài 11, 12, 13, 16, 17)

- **Đã làm (branch `fix/go-drop-language-comparison`):** xoá mục so sánh với Java/Python/JS (bảng + đoạn "khác biệt lớn nhất", cả EN lẫn VI) ở 10 bài Go 1–10, tổng 20 mục. Giữ lại 3 đoạn ngắn chỉ nói về Go: hướng dẫn đọc của bài concurrency patterns, "goroutine không cần `await`, không có handle" (bài goroutines), "Go không có `assert`, `go test` có sẵn" (bài testing). Description bài 4 bỏ cụm "coming from Java, Python or JavaScript". Spec + plan series Go và 2 brief agent (`.superpowers/sdd/.../common-post-context.md`, `rewrite-common-context.md`) đổi quy ước: người đọc chỉ cần biết lập trình căn bản, không bài nào có mục/bảng so sánh ngôn ngữ.
- **Sửa review đợt 4 (commit trên từng nhánh `feat/go-post-NN-rewrite`, chưa push):** bài 17: `httpDur :=` ở package scope (không compile), `popcnt(0xdeadbeef)` fold ra 24 chứ không phải 46, dòng `benchmark.go` L480–L491, `r.Pattern` từ Go 1.23, `HeapInuse = objects + unused`, issue #14813 chạy 2e9 lượt. Bài 16: bảng tần suất GC chuẩn hoá theo `GOGC=100` (2x/1x/0.25x), output BCE chạy lại đúng đoạn code trong bài, giải thích RAER/TFBO và nhãn `#9x`. Bài 13: nhãn demo "etcd String() deadlock" → "String() self-deadlock", đoạn `append` race thành chương trình đầy đủ (chạy lại `-race`, khớp dòng 14/19), giải thích deadlock khi `RLock` lồng nhau. Bài 11, 12: thêm giải thích `range` số nguyên, `testing.B`, `maps.Keys` iterator, GCShape.
- **Ai quyết:** user quyết bỏ mục so sánh ở mọi series ("chỉ cần biết người này đã có kiến thức lập trình căn bản"). Chỉ có series Go có mục này; Backend, DDIA không có. Giữ 3 đoạn Go-only và câu nhắc ngôn ngữ khác thoáng qua trong thân bài là AI quyết. Hai finding của reviewer bị bác: "diff xoá file docs" (do so diff hai chấm) và "icon `ok` là emoji" (icon hợp lệ trong `diagram-icons.ts`).
- **Kiểm tra:** build + `node --test` sạch trên cả 5 worktree bài và trên nhánh này.
- **Viết lại bài 14, 15, 18, 19 và viết mới bài 20 (user: "ok làm đi"):** 5 agent Sonnet, mỗi bài 1 worktree/nhánh, brief `task-17/18/21/22/23-brief.md` (quy tắc mới: không nhắc ngôn ngữ khác ở đâu cả, giải thích thuật ngữ lần đầu, giao đúng những gì bài 1–17 đã hứa). Bài 14: timeout client/server, body, `return` sau `http.Error`, `time.After` (không còn rò từ Go 1.23, đo 199 MB vs 0,2 MB), JSON, pool `database/sql`, `GOMAXPROCS` + CFS (đo bằng Docker `--cpus=2`); giữ nguyên heading anchor mà bài 17 trỏ tới. Bài 15: Tail at Scale, RAER cho `GET /todos`, 5 tầng tối ưu, TFBO. Bài 18: pprof trên service Todo, Flat/Cum, alloc/inuse, fgprof, `-diff_base`; cover đổi sang thẻ gopher. Bài 19: Three Rs, Sum1→Sum6, sharding, `sync.Pool`, bậc thang ôn tập 5 cấp. Bài 20 (`draft: true`): 19 câu khái niệm, 6 thẻ đoán output, 3 bài live-coding có test `-race`.
- **Review đợt 5:** 3 agent fact-check chạy lại code trên Go 1.27.1. Lỗi thật đã sửa: demo pool bài 14 có số bịa (thay bằng số đo 5 vs 1 connection), số `select` bài 20 lệch giữa bài/hình/demo, bài 18 ghi "cố định 2.000 req/s" (thực tế ~1.400/s) và lệnh pprof thiếu `-unit`, bài 19 mô tả sai `(*pp).free` của `fmt` (chỉ bỏ buffer, vẫn trả printer về pool). Controller sửa thêm ở các PR cũ: bài 13 `GOMAXPROCS` theo quota container từ Go 1.25; bài 17 bỏ các câu hứa sai về bài 15. Bác 3 finding do reviewer đọc nhầm bản cũ trên main.
- **Làm lại hình cho sinh động (user: "cập nhật toàn bộ các cái sơ đồ hình vẽ cho nó sinh động dễ hiểu và có icon"; chọn icon + chuyển động nhẹ, làm luôn trên các nhánh PR):** nhánh kit `feat/go-figure-kit` (`a8e8963`, đã merge vào cả 11 nhánh PR) thêm 43 icon (gopher, channel, cpu, heap, stack, gc, recycle, bug, hot, slow/fast, panic, stop, timer, deadlock…) và `src/styles/fig-motion.css` (nạp ở `Layout.astro`): `fm-flow`, `fm-dot`, `fm-pulse`, `fm-glow`, `fm-bob`, `fm-spin`, tất cả đứng yên khi người đọc bật reduce motion, không cần JS. Hình mẫu `GoP07Unbuffered` do controller làm; 10 agent Sonnet làm 104 hình còn lại (mỗi agent 2 bài), mỗi hình icon cỡ 24–30 + tối đa 2 điểm chuyển động có ý nghĩa, không đổi chữ/số/màu. Controller xem ảnh chụp cả 20 bài, sửa thêm: icon nhiệt kế ở token bucket → đồng hồ bấm giờ, early return ở HappyPath dùng `warning` thay ✗ đỏ, icon 400 ở Decode dính chữ, câu "the book's version" ở bài 16 (vướng luật không nhắc sách).
- **Thứ tự merge (quan trọng):** #50 (bài 16), #51 (bài 17) và PR bài 18 phải merge **trước** #52 (bài 14) và #53 (bài 15), vì 14/15 bỏ phần đã chuyển sang 16/17/18.
- **Rà chéo cả series (user: "rà hết từ đầu rồi update lại", chọn phạm vi 15 bài đã viết lại 1–13, 16, 17 và bỏ hết mọi câu nhắc ngôn ngữ khác):** 4 agent Sonnet đọc theo thứ tự như người mới, sửa tại chỗ: bỏ 24 câu nhắc Java/Python/JS/C/Rust + 3 nhãn demo/hình; dữ liệu mẫu "java/python/rust" ở bài 3–4 đổi thành `vet/fmt/lint` (chạy lại trên Go 1.27.1); thêm giải thích ở lần dùng đầu (`:=`, `os.Args`, `errors.New`, `unsafe`, `runtime.KeepAlive`, `//go:noinline`, `range` số nguyên, `EAGAIN`/`epoll`, SSA...); thêm ghi chú/hiện code cho helper trước đó không có trong bài (`merge`, `sumDown`/`sumUp`, `buildTodoIndex`...); sửa các câu "bài X nói về Y" không đúng (bài 5→7, 3→11, 7 "deep dive named above", 10 "level 3"); rút đoạn "Channel or mutex?" ở bài 7 về 2 câu + link bài 8. Bài 17 thay script `k6` viết bằng JS bằng một lệnh `vegeta` (chưa chạy thử). Controller kiểm: quét lại 0 câu nhắc ngôn ngữ, 0 link/anchor gãy, EN/VI cân, `sumDown`/`sumUp` khớp code đã đo, build + 47 test sạch trên 6 worktree.
- **Chưa chốt:** push + PR cho 5 nhánh bài 11–17 và nhánh này, chờ user. Bài 14, 15, 18, 19, 20 chưa viết lại. Link anchor từ bài 17 sang heading CFS của bài 14 sẽ phải kiểm lại khi viết lại bài 14.

## 2026-11-23 — Series backend: lồng ví dụ FastAPI chạy thật vào bài 1–4

- **Đã làm (branch `content/backend-fastapi-framing`):** spec v3 + plan recipe mục 1 ghi quy tắc mới; 4 agent Sonnet (mỗi bài 1 worktree cắt từ nhánh này) viết lại bài 1–4: FastAPI lồng trong bài, **ý nào đụng code thì có ví dụ FastAPI chạy được trong `demo/pNN_*.py` + capture thật**, phần chữ giải thích chính code đó (không có section "In FastAPI" riêng). File demo mới: `p01_raw_asgi.py`, `p02_idempotency.py`, `p02_versions.py`, `p03_boundary.py`, `p04_depends.py`, `p04_override.py` (đã thêm vào `demo/README.md`). Tiêu biểu: bài 2 dựng `Idempotency-Key` bằng `Header()` + `/v1` vs `/v2`; bài 3 handler 422 + `extra="forbid"` + trích `/openapi.json`; bài 4 `Depends` + `dependency_overrides`/`TestClient`.
- **Controller review:** bài 1 output 422 bị cắt 3 header (`date`/`server`/`content-length`) → chạy lại thật và thay bản đầy đủ; bài 4 chạy lại `p04_override.py` khớp từng dòng; bài 3 kiểm nhãn Pydantic 2.14 đúng (2.14.4).
- **Ai quyết:** user ("lồng ghép fastAPI vào trong nội dung… thay vì tách section riêng"; "phần nào đụng code thì cứ dựng ví dụ code bằng fastAPI và giải thích ra"). Lần chạy đầu (section "In FastAPI" riêng) user dừng giữa chừng, không commit gì.
- **Kiểm tra:** build 68 pages + 47 test sạch; mọi fence python trong 4 bài có nguyên văn trong `demo/*.py`; `post-check.sh` cả 4 bài sạch (http=200).
- **Chưa chốt:** bài 1 đã xuất bản nên merge là lên site ngay; bài 2–4 vẫn `draft: true` chờ user đọc; chưa chạy vision QA vì không thêm hình.

## 2026-11-23 — Trang series: Mục lục dùng nhãn của sơ đồ, bỏ dòng mô tả lộ trình "Đọc hết", đổi tên series backend

- **Đã làm (branch `fix/series-page-contents-topics`):** `SeriesContents.astro` lấy tiêu đề mỗi dòng từ `part.topic` (đúng nhãn ô trong sơ đồ đọc phía trên) thay vì title bài viết — áp dụng cho mọi series vì component dùng chung. Xoá `who` của path `full` ở cả 6 series (vd. "Từ byte đầu tiên của request tới bản deploy không downtime."); `SeriesPath.who` thành optional, `SeriesMap.astro` chỉ render dòng `who` khi có.
- **Ai quyết:** user yêu cầu (title Mục lục khớp sơ đồ; xoá dòng mô tả, áp dụng mọi series). Mở rộng việc đổi tiêu đề Mục lục sang mọi series là AI quyết, vì component dùng chung.
- **Đổi tên series backend:** "How backend actually works" → **"Backend with Python FastAPI"** / "Backend với Python FastAPI". Tagline, pitch đoạn 2 và credit viết lại: series dạy **cả** nền tảng backend **lẫn** FastAPI (trước đây ghi FastAPI "chỉ là demo"). User quyết; câu chữ tagline/pitch do AI viết.
- **Kiểm tra:** build 68 pages + 47 test sạch.
- **Chưa chốt:** spec `docs/superpowers/specs/2026-11-21-backend-series-design.md` vẫn dùng tên cũ và hướng "knowledge-first"; các bài draft 2–4 chưa rà lại theo hướng mới. Title bài viết (frontmatter) giữ nguyên, vẫn hiện ở trang bài, blog index, series card, pager.

## 2026-11-23 — Wave A series backend: viết bài 2–4 (draft) theo công thức pilot

- **Đã làm (branch `feat/backend-wave-a`, 3 agent song song mỗi bài 1 worktree):** viết 3 bài draft theo plan `docs/superpowers/plans/2026-11-23-backend-posts-2-12.md`. **Bài 2** `backend-rest-api-design`: 5 quyết định REST + audit 2 phút; demo `rest_api.py` (router `/v1/cases`, 201+Location, 404, 204, 405+allow); 6 sơ đồ `BeP02*`; cover Swagger /docs thật; 13 terminal block capture thật. **Bài 3** `backend-validation-schemas`: hook Heartbleed; **DDIA split rule khai báo đúng 1 lần ở intro** + link `/blog/encoding-and-schema-evolution/`, không dạy lại evolution; demo `schemas.py` (Pydantic v2 constraints, 422 có loc/type/msg, response_model filter) + minh chứng 422 sinh ra **trước** handler bằng log; 6 sơ đồ `BeP03*`; cover 422 Swagger thật; hero Ellis Island (NYPL, no known copyright). **Bài 4** `backend-layered-architecture`: fat router vs web→service→data; demo 5 file additive (`fat_router` + `layered_data/service/app/smoke`), log trace theo tầng, 409 byte-đôi giữa hai kiến trúc; 5 sơ đồ `BeP04*`; hero bếp nhà hàng 1942. Sách Lubanovic không còn trong repo → cite chapter theo map spec, nội dung bám primary docs (MDN/FastAPI/Pydantic/OWASP/12factor/Fowler). 2 icon mới theo convention flow (robot, swagger).
- **Review của controller:** fact review tay từng bài bắt 4 lỗi thật — bài 2: caption log đếm sai (7 request / 4 status code, PATCH không nằm trong log) + typo VI "đố" + gloss "implementations change" dịch lệch; bài 4: wordmark FastAPI dính chữ "web" ở 2 hình (Direction, OneTrace); bài 3: icon scissors chìm nền tối thiếu đĩa sáng — tất cả đã fix trên nhánh wave. Vision review (claude-haiku, 3 ảnh sáng EN/VI + tối VI mỗi bài, figshot height đủ) PASS cả 17 sơ đồ + 5 ảnh cover/in-body/hero.
- **Kèm theo:** dọn `demo/__pycache__/*.pyc` bị track nhầm từ pilot (untrack + `.gitignore`); các bài VI viết thuần Việt ngay từ đầu (không phải dịch), code trong bài khớp byte file demo (verify script), mọi số liệu là capture thật hôm nay (stack ghi trong nhãn).
- **Ai quyết:** user chốt plan PR #42 ("merge luôn đi") → wave A chạy tự động theo plan; các lựa chọn nội dung từng bài do agent owning quyết theo brief.
- **Kiểm tra:** build 68 pages + 47 test sạch trên nhánh wave; 3 trang draft render 200 trên dev.
- **Chưa chốt:** 3 bài vẫn `draft: true` chờ user duyệt từng bài trên dev; wave B (bài 5–7) chỉ chạy sau khi user chốt wave A; 3 worktree agent giữ nguyên tới khi PR merge.

## 2026-11-23 — Xuất bản pilot backend: bài 1 series "How backend actually works" lên sóng

- **Đã làm (branch `feat/publish-backend-pilot`, sau khi merge PR #40 vào main):** flip `draft: true` → `false` cho `backend-http-request-lifecycle` — bài đầu tiên của series backend lên production, deploy GitHub Pages tự chạy sau khi merge. Merge PR #40 trước đó cần resolve conflict `CHANGELOG.md` với PR #39 (cutover Go, main chạy trước) — giữ cả ba entry cùng ngày theo thứ tự thời gian. Build 63 → 68 pages (trang post + trang `/blog/category/backend/` build lần đầu; phần còn lại từ delta cutover Go đã theo merge vào nhánh), 47 test pass.
- **Ai quyết:** user duyệt xong vòng 2 (icon + demo) — "OKE" cho cả flow: merge PR #40 → flip `draft: false` → viết plan 11 bài còn lại.
- **Hiệu ứng kèm theo:** bài publish khiến series card `backend` xuất hiện trên blog index (filter `publishedCount > 0`), và part 1 trên trang cover `/blog/series/backend/` thành link "Bắt đầu từ Bài 1".
- **Chưa chốt:** plan triển khai 11 bài còn lại (việc tiếp theo ngay sau entry này); quiz defer theo pattern DDIA.

## 2026-11-23 — Backend pilot vòng 2: icon thật + thiết kế lại 5 sơ đồ + demo Python

- **Đã làm (cộng thêm vào PR #40):** vẽ lại 5 sơ đồ `BeP01*` theo nguyên tắc excalidraw (khoảng trắng thoáng, chữ tự do không đè hình) + **icon màu thật** vào node: tải 12 icon mới từ Iconify theo đúng convention `public/icons/flow/` (`python`/`fastapi`/`curl` từ logos CC0 + pictogram fluent-emoji-flat MIT), icon tối (curl) và icon chìm nền tối (plug) được che bằng đĩa sáng chỉ hiện ở dark mode (pattern `AnimatedFlow` dùng `.disc` + `:global([data-theme='dark'])`). `BackendLifecycleDiagram` (red box) cũng gắn icon đồng bộ — không phá layout cũ, chỉ dịch chữ xuống. Thêm **3 demo Python thật**: `demo/station_timing.py` (đo từng trạm bằng raw socket — capture thật 53.4/52.8/69.9/157.5 ms), show luôn middleware 16 dòng của `trace_demo.py` ở mục 2, `demo/reuse_timing.py` (httpx 2 GET — capture thật 293.7 vs 131.2 ms). Code trong bài diff-khớp 100% file demo (script verify), số liệu là capture thật hôm nay.
- **Ai quyết:** user sau khi đọc vòng 1 — "dùng mấy cái skill vẽ đã cài, icon thật vào, tránh đè chữ lên hình, chỗ nào demo code được thì demo". Chốt qua question: **SVG trên trang + icon thật** thay vì Excalidraw PNG (nền trắng phá dark mode, phải ×2 bản EN/VI, renderer không nhúng được icon, sai font site) — nhưng giữ nguyên *nguyên tắc thiết kế* của skill excalidraw.
- **Kiểm tra:** 3 vòng vision review subagent (claude-haiku) trên screenshot sáng EN/VI + tối VI: vòng 1 5/6 sơ đồ sạch, red box 2 defect (đĩa curl đè chữ "URL" ở dark, nhãn VI "callable của bạn, cuối cùng" tràn biên ô) → sửa nhãn thành "app của bạn, cuối cùng" (khớp giọng body VI) + dịch đĩa; vòng 2 còn 2 defect dark nhỏ (đĩa chạm viền trên, plug tím chìm) → thu đĩa + thêm đĩa cho plug; vòng 3 **PASS 0 defect** (2 observation nhỏ không block: wordmark curl nhỏ ở light, nhãn EN "headers in, bytes out" sát biên nhưng không tràn). Gate: build 63 pages + 47 test + trang dev 200, đủ 56 icon render ×2 bản EN/VI.
- **Chưa chốt:** bài vẫn `draft: true` chờ user duyệt lại trên dev (`/blog/backend-http-request-lifecycle/`). Working tree vẫn còn thay đổi chưa commit của session khác (`src/components/series/*`, việc cutover Go) — không đụng, không stage.

## 2026-11-23 — Xuất bản bài 4–10 và cutover series Go sang lộ trình 20 bài

- **Đã làm:** bật xuất bản (`draft: false`) cho bài 4–10 của series Go mới. Cutover `golang` trong `src/data/series.ts` từ 12 bài cũ sang lộ trình 20 bài, 5 cấp (`Write Go`, `Run things at once`, `Under the hood & traps`, `Measure, then optimize`, `Check yourself`) và 6 lộ trình đọc (`full`, `new-to-go`, `review`, `performance`, `oncall`, `interview`), đồng thời bổ sung token màu `--act-4` và hỗ trợ 5 cột cho `SeriesMap`/`SeriesCover`/`SeriesCard`/`BookCover`. Thêm `redirects` trong `astro.config.mjs` cho 3 bài fundamentals cũ về bài 1, 4, 7; xoá 3 bài cũ, thư mục ảnh của chúng và 30 component `GoFund*`/demo cũ không còn dùng. Theo góp ý trang series: bỏ khối credit và credit ảnh bìa ở `SeriesCover.astro`, bỏ dòng chú thích hover dưới `SeriesMap.astro`, bỏ giới hạn `65ch` để tiêu đề phụ và mô tả mục lục nằm gọn trên một dòng desktop, nối sơ đồ đọc thành chuỗi mũi tên dọc–ngang gọn (`SeriesMap.astro` vẽ mũi tên thẳng cho bước kế tiếp cùng cột).
- **Ai quyết:** user duyệt bật xuất bản bài 4–10 và chạy cutover.
- **Chưa chốt:** bài 11–19 giữ slug cũ chờ viết lại tại chỗ (Task 14–22); bài 20 phỏng vấn (`go-interview-questions-output-live-coding`) đang hiển thị "Sắp có" trên trang series, sẽ viết ở Task 23 sau khi xong bài 11–19.

## 2026-11-23 — Backend pilot: humanize giọng VI + 5 sơ đồ SVG mới

- **Đã làm (branch `feat/backend-post1-visuals`, plan `docs/superpowers/plans/2026-11-23-backend-post1-humanize-visuals.md`):** humanize toàn bộ body VI của bài 1 series backend (`backend-http-request-lifecycle.mdx`) theo `voice.md` — **EN giữ nguyên để so giọng trước/sau**; kiểm bằng keep-diff SKILL.md Step 7 ("non-prose unchanged": mọi fact, số liệu, code block, JSX, link, cấu trúc 4 mục, EN byte-identical). Thêm 5 sơ đồ SVG vẽ trên trang kiểu `GoP01*` (`BeP01Stations/DnsWalk/TcpHandshake/ReuseCost/TraceFirst`), đặt đối xứng EN/VI mỗi mục: timeline 6 trạm khớp đúng trace curl trong bài, đường resolver (cache→router→hierarchy + TTL), TCP bắt tay 3 gói 1 RTT, ngân sách request đầu ~122ms vs request hai ~2ms (caption ghi rõ illustrative theo luật honesty), flow trace-trước-đoán-sau 3 bước. Bài giờ có 6 sơ đồ SVG (kèm red box cũ) + 2 ảnh ẩn dụ + 2 terminal capture.
- **Ai quyết:** user đọc pilot trên dev — "giọng nên human thêm, hình/sơ đồ hơi ít"; chốt qua question: **5 sơ đồ** (bỏ phương án TLS 1.2 vs 1.3 vì prose đã nói) + **humanize chỉ VI**.
- **Kiểm tra:** 2 vòng review bằng subagent vision (claude-haiku) trên 3 screenshot sáng EN/VI + tối VI (`figshot.sh`). Vòng 1 bắt 2 defect thật: Stations clip chữ "response back" ở mép phải; ReuseCost bar-2 dùng nhầm tọa độ bar-1 (sliver đỏ lệch sang phải, ghost rect width âm không render, label đè "≈ 2 ms" + tràn mép) — sửa cả hai, vòng 2 PASS 0 defect. Gate: `npm run build` 63 pages sạch, `node --test` 47 pass, trang dev 200, 5 component render đủ 2 bản EN/VI.
- **Chưa chốt:** bài vẫn `draft: true` chờ user duyệt lại giọng + sơ đồ trên dev (`/blog/backend-http-request-lifecycle/`, server :4321 đang chạy). Duyệt xong mới flip `draft: false` + viết plan 11 bài còn lại theo map trong spec.
- **Lưu ý:** working tree đang có thay đổi **chưa commit của session khác** (các file `src/components/series/*` + `src/pages/blog/series/[id].astro`, việc cutover series Go) — bản PR này không đụng, không stage các file đó.

## 2026-11-23 — Series Go: bài 4–10 (draft) và sơ đồ cho bài 1–10

- **Đã làm:** viết bài 4–10 của series Go mới (`draft: true`): structs/interfaces, errors, testing, goroutines/channels, context/mutex, concurrency patterns, HTTP service. Mỗi bài có fact review, test người đọc mới và một vòng sửa. Thêm 51 sơ đồ SVG vẽ trên trang (`src/components/mdx/GoP01*`…`GoP10*`, khoảng 5 sơ đồ mỗi bài) cho cả bài 1–10. Mỗi sơ đồ được kiểm tra sự thật và chụp màn hình sáng/tối. Spec redesign sửa phân bổ sách: post 4 không giữ mục 100GM nào; #11 (functional options) và generics (`Stack[T]`) chuyển sang post 12.
- **Ai quyết:** user chọn mật độ "vừa" (khoảng 4–6 sơ đồ mỗi bài) và bảo merge; AI chọn nội dung từng sơ đồ.
- **Chưa chốt:** bài 4–10 vẫn là draft, chờ user bật xuất bản. `series.ts` vẫn là bản cũ tới khi cutover. Bài 11–20 chưa viết lại. Spec/plan sơ đồ ở `docs/superpowers/{specs,plans}/2026-11-23-go-posts-visuals*`.

## 2026-11-23 — Bật xuất bản bài 1–3 series Go mới

- **Đã làm:** đổi `draft: false` cho `go-first-program-modules-packages`, `go-variables-types-pointers-functions`, `go-slices-maps-strings`.
- **Ai quyết:** user — "bật luôn đi".
- **Chưa chốt:** `series.ts` vẫn là bản 12 bài cũ tới khi cutover, nên 3 bài mới hiện như bài lẻ trên /blog; bài 1 mới trùng tiêu đề "Go basics" với bài cũ `go-fundamentals-toolchain-modules-packages-types` (sẽ redirect khi cutover); link sang bài 4, 5, 7, 10, 11 (chưa viết) tạm 404.

## 2026-11-23 — Series Go: viết bài 1–3 (draft) và chỉnh lại theo bài test người đọc

- **Đã làm:** 3 agent Sonnet viết bài 1–3 trên 3 nhánh `feat/go-post-01-basics`, `feat/go-post-02-types`, `feat/go-post-03-collections` (chưa push). Mỗi bài qua review nội dung + 1 vòng sửa, rồi 1 lượt humanizer. Bài test người đọc (agent đóng vai dev Java chưa viết Go) chấm cả 3 bài "Mostly easy": ví dụ dùng thứ chưa học (`recover`, closure, struct, `context`), bài 2 ôm ~8 chủ đề, bài 3 đi sâu vào tăng capacity/benchmark.
- **Ai quyết:** user chọn phương án A — sửa mọi ví dụ chỉ dùng thứ đã học và dời phần sâu sang bài sau. Spec cập nhật: #3/#4 (`init`, getter) 2→12, #43/#44 (named results) 2→5, #27/#38 (size hint map, Trim) 3→11, Docker `FROM scratch` 1→10; thêm luật viết "ví dụ chỉ dùng thứ bài trước đã dạy". Sách đọc qua text tách sẵn trong `books/_extract/` thay vì `/book-to-skill` (tiết kiệm token, AI quyết).
- **Chưa chốt:** (cập nhật) đã merge PR #24–#27 (main `cf5fdfa`) và bật xuất bản 3 bài.

## 2026-11-23 — Thiết kế lại series Go: 20 bài, từ cơ bản đến phỏng vấn

- **Đã làm:** spec `docs/superpowers/specs/2026-11-23-go-series-redesign-design.md` (nhánh `chore/go-series-redesign-spec`). Series `golang` 12 bài chia lại thành 20 bài, 5 cấp: Viết Go (1–6) → Chạy song song (7–10) → Bên trong & bẫy (11–14) → Đo & tối ưu (15–19) → Phỏng vấn (20). Mỗi chủ đề chỉ có một bài "nhà"; 100 lỗi của *100 Go Mistakes* được phân đủ, mỗi lỗi đúng một bài (kiểm bằng script).
- **Ai quyết:** user — người đọc là dev đã biết ngôn ngữ khác nhưng chưa viết Go; chọn phương án A (một series, một lộ trình); bài được viết dài; sách là nguồn tham khảo chính; thêm 3 bài (concurrency patterns, HTTP service, phỏng vấn); dàn ý trong spec coi như đã duyệt, chỉ duyệt kỹ bài 1 (pilot). AI quyết: bài 11–19 giữ slug cũ và viết lại tại chỗ; 3 bài fundamentals cũ redirect khi cutover; thứ tự làm sao cho bài live không bao giờ link tới draft.
- **Chưa chốt:** plan triển khai (bước tiếp theo). Hai cuốn *100 Go Mistakes* và *Efficient Go* chưa import bằng `/book-to-skill`.

## 2026-11-22 — Bài 1 series stocks-basics: "Cổ phiếu thật ra là gì"

- **Đã làm:** publish bài 1 series `stocks-basics` (`/blog/what-is-a-stock-ownership-dividends/`, `draft: false`): body song ngữ EN/VI (5 mục + key takeaways + 5 câu ôn tập), hero chứng khoán 1863 (Wikimedia CC0), demo island "Your slice" (Task 3), quiz 8 bộ câu hỏi (`/quiz/`, Task 4), số liệu thật FPT/VNM tài chính 2025 từ 2 báo cáo thường niên đã kiểm toán + VSDC (cổ tức) + HOSE (ex-date) — đủ nguồn trong frontmatter `sources`. Bài publish khiến series card `stocks-basics` hiện trên blog index (thứ 4) và part 1 trên trang cover chuyển thành link "Bắt đầu từ Bài 1 →".
- **Sửa kèm theo (4 fix nhỏ từ review Task 2, controller gộp vào task này):** (1) nhãn dòng bảng lợi nhuận bỏ qualifier "(thuộc về cổ đông)" vì 9.376 của FPT là LNST thuộc cổ đông công ty mẹ còn 9.414 của Vinamilk là LNST hợp nhất — basis từng công ty đã nói rõ ở bullet phía trên; (2) claim "65 quốc gia" đã kiểm chứng được — IR Vinamilk + Corporate Presentation 5/2026 + Vietnam News 12/2025 đều xác nhận "65 countries and territories", thêm nguồn Corporate Presentation vào `sources`, đồng thời sửa câu cho đúng (doanh thu đến từ VN + 65 thị trường xuất khẩu, không chỉ 65 quốc gia); (3) credit figure `profit-slices-fpt-vnm` đổi sang link BCTN Vinamilk (trước chỉ link BCTN FPT trong khi title nhắc cả hai) — title/URL khớp nhau ở cả EN và VI; (4) `scripts/figures/README.md` thêm 1 dòng ghi cách render SVG → PNG bằng sharp `{density:144}` (2x).
- **Ai quyết:** user — "OK bạn làm cái stock post đi".
- **Kiểm tra:** `npm run build` 47 → 50 pages sạch (+3: trang post, trang quiz, và trang `/blog/category/finance/` — lần đầu tiên series này có bài published mang category `finance` nên trang category được build; brief dự đoán +1 là thiếu), `node --test` sạch; blog index hiện 4 series card + card bài mới; part 1 trang cover `/blog/series/stocks-basics/` clickable ("Bắt đầu từ Bài 1 →", spine + map + contents đều link).
- **Chưa chốt:** bài 2 của series (còn 9 slug trong khung). Các fix parked khác từ review Task 2 nếu có ngoài 4 mục trên chưa xử lý — coi task brief Task 5 là danh sách cuối.

## 2026-11-22 — Publish 8 bài draft của series Go

- **Quyết định (user):** "Publish toan bo di" — sau khi hỏi vì sao GitHub Pages chỉ hiện 4 bài Go (nguyên nhân: 8 bài còn lại `draft: true`, thiết kế draft chỉ xem trong dev).
- **Đã làm:** branch `feat/publish-go-drafts` — flip `draft: true` → `false` cho 8 bài Go (efficiency/hardware, composite-types, errors-concurrency, toolchain, hardware-cpu-caches, observability, profiling, three-rs). Build 56 pages (+8), 39 test pass.
- **Lưu ý:** series Go giờ 12/12 published; pilot backend vẫn `draft: true` chờ duyệt giọng.

## 2026-11-22 — Ảnh trong bài render nhỏ gọn dạng chữ nhật (điều chỉnh display, không đổi file)

- **Yêu cầu (user, đang xem dev server):** các ảnh trong bài "nên nhỏ lại 1 xíu và dạng chữ nhật" — trước đó figure render full cột ~990px (hero ảnh dọc 1048×1224 thành khối 990×1157, ảnh gần vuông trông như ô to).
- **Đã làm (`src/styles/style.css`, commit `b3e836c`):** `.prose .figure` max-width 860px căn giữa; `.prose .figure > img` `width: auto` + `max-height: 560px` (ảnh cao/vuông tự co, không cắt nội dung, zoom lightbox vẫn xem đủ ảnh gốc); hero (figure đầu tiên trong post) crop display 16:10 `object-fit: cover` như card (ảnh gốc nguyên vẹn khi zoom). Tránh đụng embed YouTube bằng selector `.figure > img` (yt img không phải con trực tiếp).
- **Chưa chốt:** user chưa xem lại trên dev — số 860/560/16:10 có thể cần tinh theo phản hồi; các trang khác dùng `.prose` (nếu có) hưởng rule mới cùng lúc.

## 2026-11-22 — Chuẩn hoá kích thước ảnh thật: max width 1600px

- **Quyết định (user chốt qua question):** mọi ảnh trong `src/assets/` (tải từ mạng lẫn capture local) phải resize về **max width 1600px**, giữ tỉ lệ, không upscale ảnh nhỏ; áp cho toàn project hiện tại + ghi quy ước cho ảnh tương lai (không thêm script gate).
- **Cơ sở:** `Figure.astro` chỉ serve srcset tới 1600px và lightbox zoom dùng `currentSrc` (≤1600) — file gốc to hơn không bao giờ tới người đọc, chỉ làm nặng repo + build. Trước resize: 19/144 ảnh vượt chuẩn (to nhất 1.7MB, 2560–3861px).
- **Đã làm (branch `feat/python-series`):** `sips --resampleWidth 1600` trên 19 file (cùng format, giữ tỉ lệ); thêm mục **Real-image size convention** vào `.claude/skills/book-to-post/style-guide.md` (mục Diagram Strategy & Visual Standards); build 47 pages + 39 test pass; commits `4e6aa39`, `04d459f`.
- **Lưu ý:** ảnh <1600px giữ nguyên; aspect ratio giữ nguyên nên crop cover card không đổi; sau khi merge nhánh này về `main` là quy ước áp toàn site.

## 2026-11-22 — Pilot post 1 hoàn tất, chờ user duyệt giọng văn

- **Quyết định (user):** "OK bạn làm cái backend pilot đi" — approval cho map 12 bài + pilot post 1.
- **Đã làm (branch `feat/python-series`):** fix 1 chữ Cyrillic lọt vào body VI ("hai факт" → "hai thực tế"); tạo `demo/` (service `clue.api` tái dùng suốt series): `trace_demo.py` (endpoint `/cases/{case_id}` + middleware in ASGI scope, dispatch chain, thời gian round trip) + README; chạy thật bằng `uv run --with 'fastapi==0.165.0'` (Python 3.13) trên port 4324, curl `/cases/42`, thay block output trong bài bằng capture thật (0.73 ms, PID 30852) — block cũ trong draft không phải capture thật dù nội dung gần khớp. Build 47 pages + 39 test pass. Commits `63f45b7`, `3217bba`; branch pushed.
- **Xác minh:** version "FastAPI 0.165" trong label terminal = đúng bản mới nhất trên PyPI (0.165.0); trace `curl -v https://fastapi.tiangolo.com/` trong bài khớp trace thật chạy lại hôm nay.
- **Chưa chốt:** giọng văn pilot — chờ Khang đọc (`npm run dev` trong worktree, mở `/blog/backend-http-request-lifecycle/`); 11 bài còn lại + plan doc làm sau khi chốt giọng; quiz defer theo DDIA pattern.

## 2026-11-21 — Khởi động series `backend` "How backend actually works" (12 phần, Python demo)

- **Quyết định (user):** series mới về backend, **kiến thức backend là chính, Python/FastAPI chỉ là demo**, sách Lubanovic (đã vào `books/fastapi/FastAPI.pdf`, gitignored) chỉ là reference kèm MDN/OWASP/12factor. Map 12 bài knowledge-first đã chốt sau khi đối chiếu overlap với DDIA: **0 bài trùng, 4 bài chạm khái niệm chung** có rule "state the split, link DDIA, never re-teach" ghi trong spec.
- **Đã làm (worktree `python-series`, branch `feat/python-series`):** spec `docs/superpowers/specs/2026-11-21-backend-series-design.md` (commit `5ed8ac4`); series.ts thêm series `backend` (12 parts, 3 acts foundations/building/operating, 3 paths full/ai-review/oncall); trang cover `/blog/series/backend/` build OK (12 hàng "Soon"); plate = screenshot Swagger UI thật từ demo service FastAPI/uvicorn chạy local (`src/assets/series/backend-plate.png`); SeriesCover.astro + type thêm `credit.origin?` (mặc định 'Wikimedia Commons', tương thích ngược).
- **Chưa chốt:** bài pilot (post 1 `backend-http-request-lifecycle`) đang soạn — chờ user duyệt giọng; 11 bài còn lại làm sau khi chốt giọng; quiz defer theo DDIA pattern.

## 2026-11-21 — Series thứ 4: `stocks-basics` (Chứng khoán cơ bản) — khung trống

- **Quyết định (user chốt qua question):** nguồn nội dung = **kết hợp nhiều nguồn** (không bám 1 cuốn sách như 3 series cũ; credit ghi cơ chế thị trường Việt HOSE/HNX/VSDC + kinh điển Graham/Lynch/Housel); góc nhìn = **người Việt mới vào thị trường** (mở tài khoản, ATO/ATC/LO, T+2, cổ tức, margin); đợt này **chỉ khung series trống** — 10 slug đặt tên trước, viết bài dần từng đợt; cover = **chứng chỉ cổ phiếu 1892** (Wikimedia, CC BY-SA 3.0, quy ước không ảnh AI). Title rút gọn theo yêu cầu user: "Stock market basics" / "Chứng khoán cơ bản".
- **Đã làm:** spec `2026-11-21-stocks-basics-series-skeleton-design.md` + plan `2026-11-21-stocks-basics-series-skeleton.md`; branch `feat/stocks-basics-series`; entry `stocksBasics` trong `src/data/series.ts` (4 acts: Nền tảng / Dòng tiền / Đọc số / Trụ lại trên thị trường; 10 parts có builds; 3 paths: đọc trọn bộ / đặt lệnh đầu tiên / đầu tư chậm); ảnh `src/assets/series/stock-certificate-1892.jpg`.
- **Kiểm tra:** build 47 pages sạch (+1 trang cover mới), 39 test pass; `/blog/series/stocks-basics/` render đủ với 0 bài (mọi part "Sắp có"); blog index vẫn đúng 3 series card (lọc `publishedCount > 0`); duyệt mắt `.shots/` (dark VI desktop, light VI 360px, blog index) không thấy lỗi layout.
- **Chưa chốt:** chưa viết bài nào của series; khi viết bài đầu sẽ cần xem lại `position` của ảnh cover theo crop thật ở trang card.
- **Lưu ý:** series rỗng không xuất hiện ngoài blog index cho đến khi bài đầu publish.

## 2026-11-21 — Thu hẹp: hero đầu bài quay về ảnh ẩn dụ, chỉ giữ cover gopher

- **Quyết định (user, sau khi xem trực tiếp trên dev):** "Các cái hero đầu bài vẫn giữ như cũ. Chỉ có trên cái cover photo mới đổi thôi."
- **Đã làm (commit revert trên PR #16):** 12 bài Go: hero `<Figure>` En/Vi + import + credit nguồn ẩn dụ cũ khôi phục nguyên trạng (lấy từ git parent-commit, chỉ chèn lại cover gopher + credit gopher vào frontmatter); 12 ảnh ẩn dụ cũ restore về assets; 12 hero PNG tooling xóa bỏ; cover card 11 tranh gopher + 1 flame graph pprof (bài profiling) giữ nguyên. Fix bug `GoMethodDispatchDemo` (escape ngoặc JSX) vẫn giữ. Style-guide đổi note "Go-Series Exception" → "Go-Series Cover Convention" (chỉ áp cho cover, hero vẫn theo luật metaphor).
- **Kiểm tra:** build 46 pages sạch, 24 test pass, grep: 12 bài đều import hero cũ, 11 cover gopher, 0 hero PNG sót.
- **Đã xong:** PR #16 merged vào main (`b377141`) — cover card 11 tranh gopher + 1 flame graph, hero giữ ảnh ẩn dụ, fix `GoMethodDispatchDemo` kèm theo.

## 2026-11-21 — Series Go: cover gopher + hero tooling thật (thay ảnh ẩn dụ)

- **Bối cảnh:** 12 bài series `golang` (4 published + 8 draft) đều mở đầu bằng ảnh thực tế ẩn dụ (tổng đài điện thoại, bánh răng Babbage, thống tốc Watt, PDP-11, thước loga…). User muốn "ảnh liên quan đến golang hơn là các ảnh thực tế ẩn dụ".
- **Quyết định (user chốt qua question):** cover card = tranh gopher chính chủ Renee French (CC BY 3.0, Wikimedia Commons, lưu ở `src/assets/series/golang/`, credit từng bài trong `sources`); hero đầu bài = screenshot **thật** chạy tooling Go 1.27.1 trên máy (escape analysis, `-race`, `GODEBUG=gctrace=1`, pprof `-top`, benchstat, `go mod graph`, `go test -v`…). Bài Go profiling dùng flame graph pprof thật làm cover. Không dùng ảnh AI-generated (giữ quy ước skill enrich-post).
- **Đã làm:** plan `docs/superpowers/plans/2026-11-21-go-gopher-native-covers.md` → branch `feat/go-gopher-covers`, 12 commit per-post + 1 commit assets + 1 fix. Hero pipeline: chạy Go thật → render terminal HTML (JetBrains Mono) → headless Chrome @2x. Style-guide + enrich-post SKILL có note "Go-Series Exception".
- **Fix kèm theo:** `GoMethodDispatchDemo.astro` render chết trang draft composite-types do `{tab, data}` trong figcaption bị Astro hiểu là biểu thức JSX (`ReferenceError: tab is not defined`) — bug có sẵn từ batch 8 draft bên máy kia, escaped bằng HTML entity. Lỗi này chỉ hiện khi mở draft trong dev vì draft không vào prod build.
- **Kiểm tra:** build 46 pages sạch + 24 test pass; 8 trang draft render đủ body + 4 islands trong dev (sau fix); grep: 0 tham chiếu ảnh ẩn dụ cũ, 12 hero PNG + 11 cover gopher + 1 flame graph đúng chỗ. Ảnh duyệt mắt ở `.shots/` (không commit): crop 16:10 của tranh gopher trên card, dark mode, caption VI 360px.
- **Chưa chốt:** DDIA + UI/UX vẫn dùng ảnh ẩn dụ — user có nói "mở rộng luôn series khác" rồi chuyển hướng sang chuyện đếm bài Go; để follow-up riêng nếu muốn.
- **Lưu ý:** 8 bài draft vẫn `draft: true` như cũ.

## 2026-11-21 (sau sync remote) — Cập nhật AGENTS.md cho khớp thực tế

- **Bối cảnh:** local từng tụt ~2 tuần so với remote. Remote đã có (từ các session Claude Code khác): series DDIA ~30 bài viết từ sách + quiz review 4 bộ, blog magazine index + trang series/archive, projects master-detail, site song ngữ EN/VI (`content-vi.json` + `ui` dict), `@xyflow/react`, fonts mới. Đã pull + `npm install` (22 packages).
- **Đã làm:** PR #14 merged (`21510e2`) đưa AGENTS.md + CHANGELOG.md + `docs/layout-redesign-plan.md` vào main. Bản cập nhật này sửa lại AGENTS.md cho khớp thực tế: plan/spec nằm ở `docs/superpowers/{plans,specs}/` (tiếng Anh, format checkbox), test gate = `node --test` (không thêm framework), chuỗi UI bắt buộc song ngữ `{ en, vi }`, màu từ CSS token, progressive enhancement.
- **Ai quyết:** user — "Cập nhật lại hết".
- **Mục cũ trong CHANGELOG mà remote đã tự giải quyết:** `resumeUrl` giờ trỏ `/assets/Khang-Nguyen-CV.pdf`; Highlights đã bị xóa khỏi trang chủ.
- **Vẫn treo:**
  - **Layout v2** (`docs/layout-redesign-plan.md`): CHƯA làm — trang chủ vẫn one-page, nav vẫn anchor (`#experience`...), chưa có `/experience`, `/projects/[slug]`, không có ClientRouter. Lưu ý: plan viết ngày 08/11, trước giai đoạn remote thay đổi nhiều — rà lại trước khi làm.
  - `content.research` vẫn `null` (Research render rỗng) — chờ user cung cấp nội dung.
  - Nhánh `fix/whyloop-public-default` (commit `88bee2b`) vẫn chưa merge vào main.
  - `npm audit`: 2 vulnerabilities (1 low, 1 moderate).

## 2026-11-21 — Chuẩn hóa flow AI agent

- **Đã làm:** thêm `AGENTS.md` (flow làm việc mặc định: đọc CHANGELOG trước, plan-doc trước khi code, branch + PR, review trước PR, ghi CHANGELOG) và tạo `CHANGELOG.md` này.
  Quy ước lấy từ setup Claude Code của user (Superpowers-style cycle, convention CHANGELOG, giải thích ngắn gọn tiếng Việt).
  *Ai quyết:* user — "sau này cứ flow theo mấy cái setup cho Claude đó mà làm".
- **Có sẵn từ 2026-11-08:** `docs/layout-redesign-plan.md` — kế hoạch layout v2 (trang chủ gọn + trang riêng cho từng mục, View Transitions, hover preview, `⌘K`). **Chưa có code nào được sửa.**
- **Chưa chốt:**
  - Có triển khai layout v2 không, bắt đầu từ đâu (plan gợi ý: PR 1 = bước 1–3).
  - `content.research` đang `null` → đang ẩn Research, chờ user cung cấp nội dung.
  - `nav.resumeUrl` đang `#` → nên trỏ tới `assets/Khang-Nguyen-CV.pdf`.
  - Nhánh `fix/whyloop-public-default` có 1 commit chưa merge vào `main`.
