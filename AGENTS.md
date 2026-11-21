# AGENTS.md — Quy ước làm việc cho AI agent trong repo portfolio

File này là mặc định cho mọi AI agent (OpenCode, Claude Code, ...) làm việc trong repo.
Trạng thái công việc đang chạy: xem `CHANGELOG.md` (authoritative) và `docs/*.md` (kế hoạch).

## Project

- Portfolio cá nhân (Khang Nguyen). Astro 7 + React 19 + MDX, deploy GitHub Pages qua `.github/workflows/deploy.yml` — push vào `main` là tự động lên site.
- Toàn bộ nội dung nằm trong `src/data/content.json`. Component chỉ render từ data, không hardcode nội dung.
- Không thêm thư viện UI/animation mới. Không đổi palette, font, nội dung CV, cấu trúc blog.
- React chỉ dùng cho phần cần interactivity thật (vd `src/components/demos/GridStreamingDemo.tsx`), còn lại dùng Astro.

## Flow làm việc mặc định (chuẩn Superpowers-style)

1. **Đọc context đầu session:** `CHANGELOG.md` → `docs/*.md` → `git log --oneline -10`. Không hỏi lại user những gì đã ghi trong các file này.
2. **Brainstorm:** yêu cầu chưa rõ → hỏi user trước khi code (đưa option kèm recommendation).
3. **Branch mới cho việc mới:** `feat/*`, `fix/*`, `chore/*` cắt từ `main`. Không commit thẳng vào `main`.
4. **Plan trước khi code:** với thay đổi lớn, viết kế hoạch vào `docs/<tên>-plan.md` (tiếng Việt): mục tiêu, bảng quyết định đã chốt, các bước (mỗi bước 1 commit độc lập), rủi ro. Chỉ code sau khi user chốt.
5. **Implement theo bước:** commit nhỏ, chạy `npm run build` sạch sau mỗi bước. Repo chưa có test framework — `build` + kiểm tra thủ công là gate, không tự ý thêm framework test.
6. **Review trước PR:** build sạch, dark mode, mobile 360px, accessibility, không console error. Có thể dùng subagent review.
7. **Kết thúc nhánh:** commit + push, mở PR vào `main`, **đợi user merge** (user tự merge). Merge xong dọn nhánh.
8. **Ghi `CHANGELOG.md`:** mỗi quyết định/thay đổi đáng kể → 1 entry (mới nhất trên đầu): đã làm gì, ai quyết (user/AI), còn gì chưa chốt.

## Quy ước giao tiếp

- Nói với user bằng tiếng Việt, ngắn gọn, có ví dụ cụ thể, ưu tiên sơ đồ/bảng hơn văn dài.
- Commit message tiếng Anh, kiểu `Add/Build/Fix ...` (xem git log hiện tại để bấm tone).
- Mọi trang mới phải có `title`/`description` riêng truyền qua `Layout.astro`, canonical đúng.
