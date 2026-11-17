# Voice profile

> Khang edits this file freely. What he writes here overrides the defaults below.

Default profile (Khang has no writing samples yet). For the tone in practice, read the opening of `src/content/blog/event-sourced-order-view.mdx`.

## Who is talking

- An engineer explaining to another engineer: someone smart who has not read this book.
- First person where it helps: "I" for Khang's own view or experience, "we" for his team. Plain "you" for the reader. Do not force "I" into every paragraph.
- Khang's experience comes only from his answers in Step 3. If he gave none, write without it.

## How it sounds

- Plain words. "Use", not "leverage". "Help", not "facilitate". Write "a replica can lag a few seconds", not "replicas may exhibit eventual consistency characteristics".
- State opinions, and back each one with an example. "I'd pick a cursor over an offset here: a row inserted at the top shifts every offset page, so users see duplicates."
- Say when something depends, and on what. Do not hedge every sentence.
- No hype words: revolutionary, game-changer, seamless, robust, powerful, cutting-edge, leverage, unlock, delve, crucial, "in today's fast-paced world".
- Use concrete numbers only when they are sourced (the book, a listed article, or Khang). Otherwise describe the size in words ("a few hundred rows", "seconds, not minutes").
- Vary sentence length. Most sentences short; an occasional long one when it carries a chain of cause and effect.
- No throat-clearing openers ("In this post we will explore…"). Start with the problem.
- No sign-off lines that only repeat the point ("And that's the power of…").

## Vietnamese (`<Vi>`) technical tone

- Write like a senior Vietnamese engineer explaining to a peer: natural, direct, conversational first-person `"mình"` (or `"chúng ta"` for the team), `"bạn"` for the reader.
- **Dịch thoát ý, mượt mà (Natural, polished Vietnamese)**:
  - Tuyệt đối tránh giọng văn AI hoặc dịch thô cứng từ chữ sang chữ (word-by-word) như: *"trong bài viết này chúng ta sẽ khám phá..."*, *"nó là một giải pháp..."*, *"được thiết kế để..."*.
  - Dùng câu chủ động, gãy gọn, đúng khẩu ngữ kỹ thuật của lập trình viên Việt Nam.
  - `description_vi` trong frontmatter: Phải súc tích, tự nhiên, cuốn hút, nêu thẳng bài toán thực tế hoặc sự cố hệ thống (ví dụ: *"Không có giải pháp hoàn hảo, chỉ có sự đánh đổi. Giải thích dễ hiểu từ gốc rễ: tại sao Prime Video bỏ serverless, 37signals rời cloud, và chạy báo cáo làm sập thanh toán."*), tránh dịch máy móc.
- Keep common stack names, brands, and universally used English dev terms untranslated (`React`, `Kafka`, `PostgreSQL`, `BFF`, `CI/CD`, `Full-stack`, `Real-time`, `DOM`, `Serverless`, `Monolith`, `Cloud`).
- Translate technical concepts into clear Vietnamese and keep the original English keyword in parentheses on first appearance in a section: e.g., `độ trễ sao chép (replication lag)`, `phân trang bằng con trỏ (cursor pagination)`, `ghi đơn điệu (monotonic writes)`. Once introduced in a section, use the shorter term naturally instead of repeating parentheses in every sentence.

## Blog Structure & Constraints

- **Tác giả (Author)**: Trang blog này là blog kỹ thuật cá nhân của Khang. Tuyệt đối không thêm tác giả, byline card hay thẻ tác giả vào bài viết.
- **Tiêu đề mục (Headings & TOC)**: Giữ các tiêu đề `##` ngắn gọn, súc tích, đi thẳng vào bản chất vấn đề để mục lục (Table of Contents) ở thanh bên luôn thanh thoát, không bị dài dòng hay tràn chữ.
