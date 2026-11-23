# CHANGELOG

Running context cho AI agent, mới nhất trên đầu. Mỗi entry: **đã làm** / **ai quyết** / **chưa chốt**.
Không cần đọc lại toàn bộ chat history — file này là nguồn sự thật cho trạng thái repo.

## 2026-11-23 — Mang fix EPS mồ côi từ phiên 22/11 lên main

- **Bối cảnh:** sau khi bài 1 đã publish (entry 2026-11-22), nhánh local `feat/stocks-basics-post1` còn sót 1 commit fix `8eb3869` (23:06 ngày 22/11) chưa lên main — server restart giữa phiên nên không kịp push. Fix sửa: giải thích EPS kiểm toán (EN+VI) — thấp hơn phép chia đơn giản vì tính trên lợi nhuận sau khi trích quỹ khen thưởng/phúc lợi + weighted-average share count nhỏ hơn (bản cũ chỉ nêu weighted-average + cổ tức 15%, thiếu trích quỹ); bổ sung chú thích cùng loại cho EPS kiểm toán của Vinamilk; chỉnh framing độ lớn số trong quiz set-01/set-03.
- **Đã làm (nhánh `fix/stocks-post1-eps-framing`, cherry-pick `8eb3869` → `5e9eccb`):** cherry-pick sạch, không conflict với các commit review đã merge.
- **Ai quyết:** AI (AGENTS flow: công việc đã commit nhưng chưa merge → đưa lên PR, đợi user merge).
- **Kiểm tra:** `npm run build` 60 pages sạch, `node --test` 47/47 pass, fix xuất hiện trong trang build (2 chỗ EN/VI).
- **Chưa chốt:** viết tiếp bài 2 `vietnam-stock-market-venues-open-account`.

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
