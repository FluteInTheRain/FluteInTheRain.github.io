# AGENTS.md — Quy ước làm việc cho AI agent trong repo portfolio

File này là mặc định cho mọi AI agent (OpenCode, Claude Code, ...) làm việc trong repo.
Trạng thái công việc đang chạy: xem `CHANGELOG.md` (authoritative) và `docs/superpowers/{plans,specs}/`.

## Project

- Portfolio cá nhân (Khang Nguyen). Astro 7 (static) + React 19 + MDX, deploy GitHub Pages qua `.github/workflows/deploy.yml` — push vào `main` là tự động lên site.
- **Site song ngữ EN/VI:** nội dung ở `src/data/content.json` (EN) + `src/data/content-vi.json` (VI); chuỗi UI ở object `ui` trong `src/data/content.ts`. Mỗi chuỗi hiện ra người đọc phải có cả `{ en, vi }` — sửa content là sửa cả hai file. Blog MDX chuyển ngôn ngữ qua span `data-lang-en` / `data-lang-vi`.
- Blog có series theo sách (DDIA, UI/UX, Go...), quiz review (`/blog/<post>/quiz/`), archive, RSS. Portfolio section vẫn là one-page ở `/`.
- Test dùng `node:test` (chạy thẳng file `.ts`: `node --test src/utils/quiz.test.ts`), không thêm framework test khác. Gate mỗi bước: `npm run build` + `node --test` sạch.
- Không tự thêm dependency khi không có lý do rõ (đã có sẵn `@xyflow/react`, AG Grid, fonts noto-sans / be-vietnam-pro / jetbrains-mono).

## Quy ước code (đang được enforce trong các plan gần đây)

- Màu lấy từ CSS token (`var(--bg)`, `var(--text)`, `var(--border)`...), không hardcode hex. Light + dark phải đều đúng.
- Progressive enhancement: trang phải dùng được không cần JavaScript (ví dụ quiz không JS vẫn hiện đủ câu hỏi + đáp án).
- Không sửa component mdx dùng chung (`AnimatedFlow`, `DemoFrame`, `DiagramIcon`...). Icon chỉ lấy từ `src/data/diagram-icons.ts` qua `DiagramIcon`.
- Không stage file không liên quan tới việc đang làm (hạn chế của một số branch cũ).
- **Quiz ôn tập:** câu hỏi đánh giá kết quả AI (`track: ai`, type `ai-review` / `ai-advice`) chỉ dành cho bài về code / hệ thống. Bài về kỹ năng của con người (cổ phiếu, UX/UI...) không có câu nào về AI; thay bằng 20 câu `track: case` (tình huống thật, tự đánh giá bằng kỹ năng đó). Mỗi bài có quiz phải khai báo `code` hoặc `human` trong `src/data/quiz/domains.ts`; `node --test` kiểm tra. Chi tiết: `docs/superpowers/specs/2026-11-24-quiz-ai-track-by-domain.md`.

## Flow làm việc mặc định (chuẩn Superpowers)

1. **Đọc context đầu session:** `CHANGELOG.md` → `docs/superpowers/{plans,specs}/` (mới nhất trước) → `git log --oneline -10`. Không hỏi lại user những gì đã ghi trong các file này.
2. **Brainstorm:** yêu cầu chưa rõ → hỏi user trước khi code (đưa option kèm recommendation). Việc lớn cần spec trước: `docs/superpowers/specs/YYYY-MM-DD-<slug>-design.md`.
3. **Branch mới cho việc mới:** `feat/*`, `fix/*`, `chore/*` cắt từ `main`. Không commit thẳng vào `main`.
4. **Plan trước khi code:** viết `docs/superpowers/plans/YYYY-MM-DD-<slug>.md` (tiếng Anh, theo format plan hiện có: goal, architecture, global constraints, các bước dạng checkbox `- [ ]`). Chỉ code sau khi user chốt.
5. **Implement theo bước:** mỗi bước 1 commit nhỏ độc lập, chạy `npm run build` + `node --test` sau mỗi bước.
6. **Review trước PR:** build sạch, dark mode, mobile 360px, accessibility, không console error. Có thể dùng subagent review.
7. **Kết thúc nhánh:** commit + push, mở PR vào `main`, **đợi user merge** (user bảo merge thì merge bằng `gh pr merge --merge --delete-branch` rồi dọn nhánh).
8. **Ghi `CHANGELOG.md`:** mỗi quyết định/thay đổi đáng kể → 1 entry (mới nhất trên đầu): đã làm gì, ai quyết (user/AI), còn gì chưa chốt.

## Quy ước giao tiếp

- Nói với user bằng tiếng Việt, ngắn gọn, có ví dụ cụ thể, ưu tiên sơ đồ/bảng hơn văn dài.
- Plan/spec viết tiếng Anh; CHANGELOG tiếng Việt.
- Commit message tiếng Anh, xem git log để bấm tone (`content: ...`, `fix: ...`, `Add/Build ...`).
- Mọi trang mới phải có `title`/`description` riêng truyền qua `Layout.astro`, canonical đúng.
