# CHANGELOG

Running context cho AI agent, mới nhất trên đầu. Mỗi entry: **đã làm** / **ai quyết** / **chưa chốt**.
Không cần đọc lại toàn bộ chat history — file này là nguồn sự thật cho trạng thái repo.

## 2026-11-23 — Series Go: bỏ mục "Coming from Java, Python or JavaScript"; sửa review đợt 4 (bài 11, 12, 13, 16, 17)

- **Đã làm (branch `fix/go-drop-language-comparison`):** xoá mục so sánh với Java/Python/JS (bảng + đoạn "khác biệt lớn nhất", cả EN lẫn VI) ở 10 bài Go 1–10, tổng 20 mục. Giữ lại 3 đoạn ngắn chỉ nói về Go: hướng dẫn đọc của bài concurrency patterns, "goroutine không cần `await`, không có handle" (bài goroutines), "Go không có `assert`, `go test` có sẵn" (bài testing). Description bài 4 bỏ cụm "coming from Java, Python or JavaScript". Spec + plan series Go và 2 brief agent (`.superpowers/sdd/.../common-post-context.md`, `rewrite-common-context.md`) đổi quy ước: người đọc chỉ cần biết lập trình căn bản, không bài nào có mục/bảng so sánh ngôn ngữ.
- **Sửa review đợt 4 (commit trên từng nhánh `feat/go-post-NN-rewrite`, chưa push):** bài 17: `httpDur :=` ở package scope (không compile), `popcnt(0xdeadbeef)` fold ra 24 chứ không phải 46, dòng `benchmark.go` L480–L491, `r.Pattern` từ Go 1.23, `HeapInuse = objects + unused`, issue #14813 chạy 2e9 lượt. Bài 16: bảng tần suất GC chuẩn hoá theo `GOGC=100` (2x/1x/0.25x), output BCE chạy lại đúng đoạn code trong bài, giải thích RAER/TFBO và nhãn `#9x`. Bài 13: nhãn demo "etcd String() deadlock" → "String() self-deadlock", đoạn `append` race thành chương trình đầy đủ (chạy lại `-race`, khớp dòng 14/19), giải thích deadlock khi `RLock` lồng nhau. Bài 11, 12: thêm giải thích `range` số nguyên, `testing.B`, `maps.Keys` iterator, GCShape.
- **Ai quyết:** user quyết bỏ mục so sánh ở mọi series ("chỉ cần biết người này đã có kiến thức lập trình căn bản"). Chỉ có series Go có mục này; Backend, DDIA không có. Giữ 3 đoạn Go-only và câu nhắc ngôn ngữ khác thoáng qua trong thân bài là AI quyết. Hai finding của reviewer bị bác: "diff xoá file docs" (do so diff hai chấm) và "icon `ok` là emoji" (icon hợp lệ trong `diagram-icons.ts`).
- **Kiểm tra:** build + `node --test` sạch trên cả 5 worktree bài và trên nhánh này.
- **Rà chéo cả series (user: "rà hết từ đầu rồi update lại", chọn phạm vi 15 bài đã viết lại 1–13, 16, 17 và bỏ hết mọi câu nhắc ngôn ngữ khác):** 4 agent Sonnet đọc theo thứ tự như người mới, sửa tại chỗ: bỏ 24 câu nhắc Java/Python/JS/C/Rust + 3 nhãn demo/hình; dữ liệu mẫu "java/python/rust" ở bài 3–4 đổi thành `vet/fmt/lint` (chạy lại trên Go 1.27.1); thêm giải thích ở lần dùng đầu (`:=`, `os.Args`, `errors.New`, `unsafe`, `runtime.KeepAlive`, `//go:noinline`, `range` số nguyên, `EAGAIN`/`epoll`, SSA...); thêm ghi chú/hiện code cho helper trước đó không có trong bài (`merge`, `sumDown`/`sumUp`, `buildTodoIndex`...); sửa các câu "bài X nói về Y" không đúng (bài 5→7, 3→11, 7 "deep dive named above", 10 "level 3"); rút đoạn "Channel or mutex?" ở bài 7 về 2 câu + link bài 8. Bài 17 thay script `k6` viết bằng JS bằng một lệnh `vegeta` (chưa chạy thử). Controller kiểm: quét lại 0 câu nhắc ngôn ngữ, 0 link/anchor gãy, EN/VI cân, `sumDown`/`sumUp` khớp code đã đo, build + 47 test sạch trên 6 worktree.
- **Chưa chốt:** push + PR cho 5 nhánh bài 11–17 và nhánh này, chờ user. Bài 14, 15, 18, 19, 20 chưa viết lại. Link anchor từ bài 17 sang heading CFS của bài 14 sẽ phải kiểm lại khi viết lại bài 14.

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
