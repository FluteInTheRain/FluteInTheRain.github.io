# CHANGELOG

Running context cho AI agent, mới nhất trên đầu. Mỗi entry: **đã làm** / **ai quyết** / **chưa chốt**.
Không cần đọc lại toàn bộ chat history — file này là nguồn sự thật cho trạng thái repo.

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
