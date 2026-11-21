# Kế hoạch layout mới: trang chủ gọn + trang riêng cho từng mục

Trạng thái: **chỉ là kế hoạch, chưa có code nào được sửa.**
Ngày lập: 2026-11-08

## 1. Mục tiêu

Trang chủ hiện là một trang cuộn dài gồm 10 section (Hero, Highlights, Experience, Education, Skills, Projects, Research, LatestPosts, Cta, Footer). Người xem mất thời gian cuộn.

Layout mới:
- Trang chủ vừa khoảng một màn hình: giới thiệu ngắn, vài con số nổi bật, một lưới thẻ điều hướng.
- Mỗi mục lớn có trang riêng với URL riêng.
- Vẫn đẹp: thẻ có preview khi hover, chuyển trang mượt (View Transitions), có `⌘K`.

## 2. Quyết định đã chốt

| # | Quyết định |
|---|---|
| 1 | Số liệu và teaser của thẻ lấy từ `content.json` (xem mục 4) |
| 2 | Trang chủ **chỉ có thẻ**, không có dải Featured |
| 3 | Tách riêng Education, Certificates, Research (không gộp) |
| 4 | Làm cả View Transitions, hiệu ứng hover và `⌘K` |

## 3. Sơ đồ trang

| URL | Nội dung | Nguồn dữ liệu / component dùng lại |
|---|---|---|
| `/` | Hero rút gọn, Stats, lưới thẻ điều hướng, Footer | `Hero`, `Highlights` (viết lại thành Stats) |
| `/experience` | Timeline kinh nghiệm | `Experience.astro`, `content.experience` |
| `/projects` | Lưới thẻ project, lọc Company / Personal | `Projects.astro`, `ProjectCard.astro`, `content.projects` |
| `/projects/[slug]` | Chi tiết một project (bullets, video, links, tags) | `ProjectCard` tách phần chi tiết |
| `/skills` | Kỹ năng theo 6 nhóm | `Skills.astro`, `content.skills` |
| `/education` | Hai bằng cấp (Master AI, B.Sc.) | `Education.astro`, `content.education.degrees` |
| `/certificates` | AWS Developer Associate, TOEIC | `CredentialCard.astro`, `content.education.certificates` |
| `/research` | Nghiên cứu | `Research.astro`. **`content.research` hiện là `null`**, xem mục 8 |
| `/blog/...` | Giữ nguyên | không đổi |

`Cta.astro` bỏ khỏi trang chủ: nút "Get In Touch" đã có ở Hero, và Footer có liên hệ.

## 4. Trang chủ chi tiết

Bố cục từ trên xuống: Nav, Hero, Stats, lưới thẻ, Footer.

### Hero (rút gọn)
- Giữ heading, avatar, nút Get In Touch / Download CV, icon social.
- `hero.bio` hiện dài khoảng 90 từ. Thay bằng `hero.tagline` ngắn 1–2 dòng, ví dụ: "Software Engineer ~3 năm kinh nghiệm xây dựng marketplace platform, đang mở rộng sang AI/ML." Bio đầy đủ chuyển lên đầu trang `/experience`.

### Stats (thay cho `Highlights`)
Chọn 4 số, đều có căn cứ trong `content.json`:
1. **~3 năm** kinh nghiệm
2. **10+** marketplace platforms (JourneyHorizon, nền tảng Sharetribe)
3. **9** projects (4 company + 5 personal)
4. **9.07 / 10** GPA Master of AI (đang học)

Hai câu pitch hiện có trong `highlights` ("For Product Teams", "For AI-Driven Products") không bỏ: chuyển thành hai chip lọc ở đầu trang `/projects`.

### Lưới thẻ điều hướng (7 thẻ)
Mỗi thẻ gồm icon, tiêu đề, một dòng teaser, mũi tên. Teaser lấy từ dữ liệu, tính lúc build, không gõ tay:

| Thẻ | Teaser | Preview khi hover |
|---|---|---|
| Experience | "Kafi Securities · JourneyHorizon" | 2 công ty hiện ra dạng mini-timeline |
| Projects | "9 projects · 4 company, 5 personal" | Thumbnail/tên project xoay vòng |
| Skills | "37 công nghệ · 6 nhóm" | Hàng logo/tag công nghệ nổi bật |
| Education | "Master of AI · B.Sc. SE" | Tên trường + GPA |
| Certificates | "AWS Developer Associate · TOEIC" | Tên chứng chỉ |
| Research | Chỉ hiện khi có dữ liệu | (xem mục 8) |
| Blog | Tiêu đề bài mới nhất | Ngày đăng + category |

Số tính: Skills = 7+8+9+1+8+4 = 37 mục; Projects = 4 + 5 = 9.

Desktop: lưới 3–4 cột, các thẻ có kích thước đều nhau. Mobile: 1 cột, thẻ rộng hết bề ngang, cao khoảng 80px.

## 5. Nav, Footer, điều hướng chung

- `nav.links` đổi từ anchor (`#experience`...) sang đường dẫn thật. Bỏ link `Contact` kiểu anchor, thay bằng `mailto:` hoặc nhảy xuống Footer.
- Nav tô đậm mục đang xem (so khớp `Astro.url.pathname`).
- `footer.quickLinks` cũng đổi sang đường dẫn thật.
- `rootHref()` trong `src/utils/href.ts`: kiểm tra lại, có thể đơn giản hóa vì không còn anchor.
- Mỗi trang con có chung header: eyebrow + heading + subheading (dữ liệu đã có sẵn trong `content.json`) và link "← Trang chủ".
- Cuối mỗi trang con có thanh "Trước / Sau" để sang mục kế mà không cần về trang chủ.

## 6. Làm đẹp (phần 4 đã chốt)

### View Transitions
- Bật `<ClientRouter />` (Astro) trong `Layout.astro`.
- Thẻ trang chủ và header trang con dùng `transition:name` để thẻ "mở rộng" thành trang đích.
- **Rủi ro cần xử lý:** `src/scripts/ui.ts` (theme toggle, hamburger, copy-code) hiện gắn sự kiện lúc tải trang. Với View Transitions phải gắn lại sau `astro:after-swap` / `astro:page-load`. Theme (dark mode) phải được áp ngay trước khi vẽ để không bị nháy.
- `GridStreamingDemo.tsx` (React, blog) cần kiểm tra chạy đúng khi vào trang bằng điều hướng client-side.
- Tôn trọng `prefers-reduced-motion`: tắt hiệu ứng nếu người dùng chọn giảm chuyển động.

### Hover và xuất hiện
- Thẻ nâng lên nhẹ, viền nhấn màu đỏ của palette hiện tại, preview trượt vào (CSS thuần, không thêm thư viện).
- Thẻ hiện lần lượt khi vào trang (stagger ngắn, dưới 400ms tổng).
- Trên thiết bị cảm ứng không có hover: preview luôn hiện dạng teaser, không phụ thuộc hover.

### Command palette `⌘K`
- Phím tắt `⌘K` / `Ctrl+K` mở bảng tìm nhanh; nút kính lúp trên Nav cho mobile.
- Chỉ mục tạo lúc build: các trang chính, từng project, từng bài blog, từng nhóm skill.
- Làm bằng component Astro + một script nhỏ (không dùng framework); dữ liệu chỉ mục là JSON tĩnh. Điều hướng bằng phím mũi tên và Enter, `Esc` để đóng, có `aria` đầy đủ.

## 7. Các bước triển khai

Mỗi bước là một commit riêng, có thể merge độc lập. Làm trên nhánh mới từ `main` (ví dụ `feat/layout-v2`).

1. **Layout trang con + chuyển section thành trang.**
   Tạo `src/layouts/PageLayout.astro` (header chung, nav, footer, trước/sau). Tạo `src/pages/{experience,projects,skills,education,certificates,research}.astro`, dùng lại component hiện có.
   Kiểm tra: `npm run build` thành công, mỗi trang mở đúng.
2. **Dữ liệu và trang chủ mới.**
   Thêm `hero.tagline`, viết lại `Highlights` thành `Stats`, tạo `NavCard.astro` và `src/components/HomeCards.astro`. Teaser tính từ `content.json` và collection blog. Sửa `src/pages/index.astro`.
3. **Nav / Footer sang đường dẫn thật.**
   Sửa `content.json` (`nav.links`, `footer.quickLinks`), `Nav.astro`, `Footer.astro`, `href.ts`. Thêm trạng thái "mục đang xem".
4. **Chi tiết project.**
   Tạo `src/pages/projects/[slug].astro`. Danh sách `/projects` chỉ hiện thẻ ngắn (tiêu đề, mô tả một dòng, tags). Chip lọc Product / AI, tab Company / Personal.
5. **View Transitions.**
   Thêm `ClientRouter`, `transition:name`, sửa `ui.ts` cho đúng vòng đời, thêm `prefers-reduced-motion`.
   Kiểm tra: dark mode, hamburger, copy-code, demo AG Grid vẫn chạy sau khi chuyển trang.
6. **Hover/preview và hiệu ứng xuất hiện.**
7. **Command palette `⌘K`.**
8. **Rà soát cuối:** Lighthouse (mục tiêu Performance và Accessibility ≥ 90), mobile ở 360px, dark mode, `sitemap` có đủ trang mới, `rss.xml` không đổi.

Gợi ý chia PR: PR 1 = bước 1–3 (đã dùng được), PR 2 = bước 4, PR 3 = bước 5–7, PR 4 = bước 8 và dọn dẹp.

## 8. Điểm cần lưu ý / quyết định sau

- **Research đang rỗng.** `content.research` là `null`, nên `Research.astro` hiện không hiển thị gì. Đề xuất: tạo trang `/research` và thẻ ở trang chủ **chỉ khi có dữ liệu**; nếu chưa có thì ẩn cả hai. Cần bạn xác nhận có muốn thêm nội dung nghiên cứu không.
- **Resume:** `nav.resumeUrl` đang là `#`. Nên trỏ tới `assets/Khang-Nguyen-CV.pdf` (đã dùng ở nút Download CV).
- **Link cũ:** các URL dạng `/#projects`, `/#experience` có thể đã được chia sẻ. Thêm một đoạn script nhỏ ở trang chủ: nếu `location.hash` khớp một mục, chuyển sang trang tương ứng.
- **SEO:** mỗi trang con cần `title` và `description` riêng (truyền qua `Layout`), canonical đúng; JSON-LD `Person` chỉ giữ ở trang chủ.
- **Dung lượng ảnh preview:** thumbnail project dùng ảnh đã tối ưu (webp) và `loading="lazy"`.
- **File mockup cũ** (`Dark.dc.html`, `Main.dc.html`, `Mobile.dc.html`, `portfolio-mockup.html`, `canvas.json`) ở thư mục gốc không dùng cho kế hoạch này; có thể làm mockup mới cho trang chủ nếu muốn xem trước.

## 9. Ngoài phạm vi

- Không đổi nội dung chữ trong CV, không đổi palette hay font.
- Không đổi cấu trúc blog.
- Không thêm thư viện UI/animation mới.
