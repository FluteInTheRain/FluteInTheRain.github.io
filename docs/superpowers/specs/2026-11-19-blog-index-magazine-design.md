# Blog index: magazine layout

Date: 2026-11-19. Branch: `feat/blog-index-magazine` (worktree `../FluteInTheRain-blog-ui`).
Mockup (throwaway, local only): `.superpowers/brainstorm/84075-1795080199/content/blog-layout.html`, tab "A · Magazine".

## Why

Khang finds `/blog/` empty and too plain. Today it is a single 760px column of 27 identical text-only cards inside a 1200px container, so the right half of a wide screen is blank. Nothing leads the page, each card shows 6–8 tag pills that outweigh the title, and the two book series (DDIA, 14 posts; UI/UX, 9 posts) appear only as two horizontal cards above the list, while their parts are mixed into it by date. The posts are full of photos and diagrams, but the index shows none of them.

Success means the index fills the width, has a clear reading order (newest, then series, then topics, then everything), and shows each post's picture, in both light and dark themes and in EN and VI.

## Goals

1. Rebuild `/blog/` as the magazine layout from mockup A (structure below).
2. Give every post an optional `cover` image and show it on cards.
3. Use the same new post card on category pages (`/blog/category/<id>/`) and in the home page "Latest posts" section, so cards look the same everywhere.
4. A search box that filters posts by title, description and tags as you type.

## Non-goals

- The post page (`/blog/<id>/`). Its header polish is a separate, later change.
- The series cover pages (`/blog/series/<id>/`), the series map, and `BookCover` itself.
- Pagination. 27 posts fit; the archive list handles growth.
- Any new dependency (no search library, no UI kit).

## Anti-goals (would count as failure even if it works)

- A page that looks like a generic template or "AI-made" (stock gradients, emoji, glassmorphism, hype copy). It must keep the site's tokens, Noto Sans, red/gold accents and warm neutrals.
- Hard-coded hex colours in components. CSS tokens only (`--red`, `--gold-*`, `--border`, ...), with dark mode working through `[data-theme="dark"]`.
- English-only strings. Every visible string goes through `T`/`ui` with a Vietnamese version.
- Layout shift or horizontal scroll at 390px wide.

## Approaches considered

- **A. Magazine (chosen).** Featured post + "also new" column, a series shelf, one section per topic, then a compact archive. Fills the width, has hierarchy, scales as posts grow. Picked by Khang after comparing mockups.
- **B. Bento grid.** One mixed-size grid with image-overlay tiles. Strongest first screen, but below the fold it becomes an unordered wall of pictures and long titles crowd small tiles.
- **C. Dense list + sidebar.** Fills the width cheaply but stays plain, which is the complaint.

## Page structure (`/blog/`), top to bottom

1. **Intro row.** Eyebrow "Blog", `h1` "Writing", the existing lede on the left. On the right, three stats computed at build time: number of published posts, number of series with published parts, total reading time (sum of `readingTime`, shown in hours with one decimal, e.g. "9.5h").
2. **Filter row.** The existing category chips, now with a count per category ("System Design · 12"), and a search input aligned right. A thin border separates this row from the content.
3. **Featured row** (2fr / 1fr grid).
   - Left: the featured post as a wide card, image left and text right: kicker "Latest · <category>", title (~27px), description, meta (date, reading time, and "Part N of M" when the post belongs to a series), and a red "Read the post →" button.
   - Featured post = the post with `featured: true` in frontmatter if exactly one has it, else the newest post.
   - Right: "Also new", the next 3 newest posts as small rows (96×72 thumbnail, category, short title = text before the first colon).
4. **Book series shelf.** Section heading "Book series" with the hint "Read in order, or follow a path". A 2-column grid of series cards, one per series with published parts. Each card: the existing `BookCover` at about 150px wide on the left; on the right the kicker ("A 14-part series · all published" or "N of M published"), title, tagline, one pill per act (act label + part count, coloured by `actIndex` like the series map), the first 3 parts as a numbered list, and "Open the series →".
5. **Topic sections.** One section per category with at least 3 published posts, in `CATEGORY_IDS` order. Heading row: category name, post count, "View all →" linking to the category page, with a 2px rule under it. Body: a 3-column grid of the 3 newest posts in that category, excluding the featured post. Categories with fewer than 3 posts (today: Frontend) get no section; they are reachable through chips and the archive.
6. **Archive.** Heading "Archive", hint "Every post, newest first". Compact rows: date, category, title. The first 8 are shown; a "Show all N →" button reveals the rest (all rows are in the HTML; the button only toggles visibility, so it works for search and for no-JS readers who get all rows).

## New post card (replaces `PostCard`)

- Image on top at 16:10, `object-fit: cover`, from the post's `cover`. Without a cover: a neutral panel (`--bg-alt`) with the category label, not an empty box.
- Body: category kicker, title (18px, 3 lines max), description clamped to 2 lines, meta (date · reading time) pinned to the bottom so cards in a row align.
- No tags on cards; tags stay on the post page. (My call: the mockup reads cleaner without them, and two "top" tags would need a ranking nobody maintains.)
- Hover: the existing `--shadow-hover` and a 2px lift, as in the mockup.
- Images go through Astro's `<Image>` with explicit widths so the page does not ship full-size photos.

## `cover` frontmatter

- Add `cover: image().optional()` and `cover_alt: z.string().optional()` to the blog schema in `src/content.config.ts` (the `schema` becomes `({ image }) => z.object({...})`).
- Fill `cover` for every post that has an opening image: use the post's hero image (the first image the reader sees under the header), not just the first `import` in the file. Example: in `replication-when-copies-disagree.mdx` the hero is the Jean Miélot miniature, while the first imported image is a Bitbucket diagram.
- `ag-grid-realtime-streaming` has no image; it uses the no-cover panel.

## Search

- Client-side, no library. Each card and archive row carries `data-search` with lowercased title, `title_vi`, description and tags.
- Typing hides the featured row, series shelf and topic sections, and shows the archive filtered to matches, all rows expanded. Clearing the input restores the page.
- Empty result: a short "No posts match" line in the archive area.
- The input has a visible label (visually hidden text is fine) and works with keyboard only.

## Category pages and home page

- `/blog/category/<id>/`: same intro style (category as `h1`), chips with counts, the series shelf filtered to series with parts in this category (as today), then all posts in the 3-column new-card grid.
- Home "Latest posts" (`LatestPosts.astro`): uses the new card in a 3-column grid; same number of posts as today.

## Responsive

- ≥1024px: as described. 640–1023px: featured row stacks (featured card full width, "Also new" below as a 3-column row), series shelf and topic grids become 2 columns, stats move under the lede. <640px: everything single column; the featured card stacks image above text; archive rows show date and category on one line above the title.
- Check at 390, 768, 1024 and 1440 px, light and dark, EN and VI.

## Bilingual

New strings ("Also new", "Book series", "Read in order, or follow a path", "View all", "Archive", "Every post, newest first", "Show all", "Search posts", "No posts match", "Read the post", stat labels, "Latest") are added to `ui` in `src/data/content.ts` with Vietnamese versions. Titles and descriptions use the existing `title_vi`/`description_vi`.

## Constraints

- Astro 7 + MDX, deployed to GitHub Pages. No new npm dependencies.
- Reuse `BookCover`, `actIndex`, `getSeriesView`, `readingTime`, `formatDate*`, `categoryUrl`, `usedCategories`.
- The old `PostCard`, `.post-grid-list` and series card styles that end up unused are deleted, not left behind.
- Work happens in the worktree; the main worktree has another session's uncommitted skill edits that must not be touched.

## Left to the builder

- Exact component split (e.g. `PostCard`, `FeaturedPost`, `SeriesShelfCard`, `TopicSection`, `ArchiveList`) and file names.
- Exact spacing values, as long as they follow the site's existing spacing steps and the mockup's proportions.
- Whether search lives in a small `src/scripts/blog-search.ts` or an inline script.

## Calls made after the builder check

These were open after the first draft; each is a call made without Khang, marked so he can overrule it.

1. **Covers are picked in this task**, for all 27 posts. The hero is the first image rendered in the post body (the first `<Figure>`/`<Image>`/`<img>` element in reading order), not the first `import` line. All current heroes are local files under `src/assets/blog/<slug>/`, so `image()` accepts them. A post whose hero is not a local file gets no `cover` and uses the no-cover panel.
2. **`featured` is added to the schema** as `featured: z.boolean().default(false)`. No post sets it now. If several posts set it, the newest of them is featured; the build does not fail.
3. **No duplicates on the page.** Topic sections take the newest posts of the category that are not already in the featured card or "Also new". If fewer than 3 remain, they are topped up with the newest already-shown posts of that category, so every topic row is full. The "at least 3" threshold counts all published posts in the category.
4. **Home "Latest posts"** already reads `getPublishedPosts()`, so it has `cover` and the body for `readingTime`. It shows the 3 newest posts in the new card grid. The old single-post "featured" variant goes away.
5. **"Part N of M"**: M is the number of parts declared in the series, published or not, matching `SeriesBar`.
6. **Series card list**: the first 3 declared parts in reading order. An unpublished part shows as plain text with a "soon" mark, as elsewhere in the series components.
7. **Stats** count only what `getPublishedPosts()` returns, so drafts are excluded in production builds.
8. **Verification**: the repo has no test runner. Verification is `npm run build` passing, plus headless-Chrome screenshots of `/blog/`, one category page and the home page at 390, 768, 1024 and 1440 px, light and dark, EN and VI, compared against the mockup.
