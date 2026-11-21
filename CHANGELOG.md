# CHANGELOG

Running context cho AI agent, mới nhất trên đầu. Mỗi entry: **đã làm** / **ai quyết** / **chưa chốt**.
Không cần đọc lại toàn bộ chat history — file này là nguồn sự thật cho trạng thái repo.

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
