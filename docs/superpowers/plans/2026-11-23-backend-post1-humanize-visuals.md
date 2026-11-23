# Backend post 1: humanize VI + five diagrams (Implementation Plan)

**Goal:** Two changes to the draft pilot post `src/content/blog/backend-http-request-lifecycle.mdx`, from Khang's read on 2026-11-23 ("giọng nên human thêm; hình/sơ đồ demo hơi ít"):

1. Humanize the **Vietnamese body only** per `.claude/skills/book-to-post/voice.md`. The English body stays untouched so Khang can compare the voice before/after.
2. Add **five new on-page SVG diagrams** to both bodies, matching the Go-series "medium" density (4–6 per post, approved for Go as "vừa").

Khang picked exactly 5 of the 6 proposed diagram subjects (TLS 1.2-vs-1.3 rejected: prose already covers it).

**References:**
- Series spec: `docs/superpowers/specs/2026-11-21-backend-series-design.md`
- Drawing rules: `.claude/skills/book-to-post/SKILL.md` §B + `scripts/figures/README.md`
- Voice rules: `.claude/skills/book-to-post/voice.md`
- Convention source: `docs/superpowers/specs/2026-11-23-go-posts-visuals-design.md` (Go "medium" density, `GoP<NN><Name>.astro` pattern)

**Tech Stack:** Astro 7 static SVG components (`BeP01<Name>.astro`, mirroring `GoP<NN>`), MDX, site CSS tokens.

**Architecture:** Five new files under `src/components/mdx/`, each one figure per file, used symmetrically inside `<En>` and `<Vi>`. The existing `BackendLifecycleDiagram.astro` (§2 red box) is **not** edited — the post ends up with 6 on-page SVGs + 2 metaphor photos + 2 real terminal captures. No shared-component edits.

## The five figures

| File | What it shows | Placement |
|---|---|---|
| `BeP01Stations.astro` | The six-station journey as a timeline mirroring the post's real curl trace: resolved `172.66.46.235:443` → Connected → TLSv1.3 → `GET / HTTP/2 200` → your code (red box) → `Connection #0 left intact`. | §1, after the station-by-station paragraphs. |
| `BeP01DnsWalk.astro` | Resolver walk: cache → router → the hierarchy, each answer cached for its TTL. Detail matches the prose ("cache, router, then the hierarchy") — no recursion-depth teaching. | §1, next to the DNS paragraph. |
| `BeP01TcpHandshake.astro` | `SYN` → `SYN-ACK` → `ACK`: one RTT to open the pipe, bytes flow both ways after. | §1, next to the TCP paragraph. |
| `BeP01ReuseCost.astro` | First vs second request budget on a 40 ms RTT link: DNS 40 + TCP 40 + TLS 40 + app 2 ≈ 122 ms fresh connection vs ≈ 2 ms reused. Caption marks the numbers as the post's illustrative budget. | §3, next to the budget paragraph. |
| `BeP01TraceFirst.astro` | The three-step discipline: where does `curl -v` pause → access log receipt (did it arrive, whose time) → profiler only if the receipt says the time is yours. | §4, after the numbered list. |

## Global Constraints

- Only site CSS tokens (`--text`, `--text-body`, `--text-muted`, `--border`, `--bg-alt`, `--red`, `--red-tint-bg`), page font, sentence-case labels, bilingual `<tspan data-lang-en>` / `<tspan data-lang-vi>` on every label, unique SVG ids per instance (draw arrowheads as plain polygons, no `<marker>` ids).
- Editorial look: thin lines, plain-text annotations, one accent (`--red`) for the thing that matters (the red box / the owned part). No pills, badges, gradients, emoji.
- Figures show only what the post has taught; every name and number must match the traces shown beside it (curl lines, `0.73 ms`, the 122 ms budget, RTT counts). Illustrative numbers say so in the caption.
- VI humanize = prose inside `<Vi>` only: keep every fact, number, code block, inline code, JSX tag, link target, quotation and technical-keyword parenthesis; keep the post's structure (4 sections). EN prose untouched.
- No edits to shared components, `series.ts`, or anything under `books/`. Post stays `draft: true` — Khang re-reads before any flip.
- Gate each step: `npm run build` clean + `node --test` pass; dev server on :4321 is already running (use it, leave it alone).
- Note: the `/humanizer:humanizer` slash-command from SKILL.md Step 7 is not available in this harness — do a careful manual pass per `voice.md`, then run the SKILL.md Step 7 `keep`-diff which must print `non-prose unchanged`.

## Tasks

- [ ] Task 1: Cut branch `feat/backend-post1-visuals` from `main`.
- [ ] Task 2: Humanize the VI body per `voice.md` (senior dev talking to a peer, "mình"/"bạn", short sentences mixed with occasional long cause-effect ones, no AI-translation stiffness, no throat-clearing). Verify with the SKILL.md Step 7 `keep`-diff (`non-prose unchanged` must print; EN must be byte-identical). `npm run build` + `node --test`.
- [ ] Task 3: Draw the five `BeP01*.astro` components per SKILL.md §B (viewBox ~900 wide, `min-width: 640px` scroll wrapper, centered figcaption 14px `--text-muted`).
- [ ] Task 4: Fact review — every label/number against the post's own traces; EN and VI labels must say the same thing; nothing taught the post hasn't taught.
- [ ] Task 5: Place the five figures symmetrically in `<En>` and `<Vi>` right after the paragraph that sets up the question, with a one-sentence lead-in each; no EN prose rewrites.
- [ ] Task 6: Screenshot review via `scripts/figures/figshot.sh` (or the SKILL.md tmp-prev trick): light + dark, VI labels, 375 px phone width. Fix any clipped/overlapping text.
- [ ] Task 7: Final gate (`npm run build` + `node --test`), Khang eyeballs on the running dev server, `CHANGELOG.md` entry, commit, push, open PR → **wait for Khang's verdict on the voice** (only he flips `draft: false`).

## Review Focus

- A figure that shows a concept the post has not taught (e.g. DNS recursion internals, TLS message contents).
- Numbers in figures that differ from the traces/output shown next to them.
- EN/VI labels that say different things; VI labels that read as word-by-word translation.
- Text clipped or overlapping in VI (labels ~20% longer) or in dark mode.
- Duplicate SVG ids between the EN and VI copies of a figure.
- Humanize that changed a fact, number, code block or the EN body.
