# books/ — drop folder for source books

Put book files here (PDF, EPUB, MOBI). Claude reads them so it can write blog posts from them.

**Never commit anything in this folder.** Books are copyrighted. `.gitignore` ignores everything in `books/` except this README.

## Contents

- [What this folder is for](#what-this-folder-is-for)
- [The flow](#the-flow)
- [Where the drafts go](#where-the-drafts-go)
- [Setup (once per machine)](#setup-once-per-machine)

## What this folder is for

```
books/
├── README.md          <- this file (committed)
├── ddia/
│   └── DDIA.PDF       <- your book (never committed)
└── b.epub             <- your book (never committed)
```

You can put files straight in `books/` or in a sub-folder. Use a short **book slug** (for example `ddia`) to refer to a book later.

## The flow

Three steps, in order:

| Step | Command | What it does |
|------|---------|--------------|
| 1. Import | `/book-to-skill books/<file> <book-slug>` | Turns the book into a study skill. When it asks to push to GitHub, answer **no**. |
| 2. Study | `/<book-slug> ch05` | Asks the book skill about a chapter or topic. |
| 3. Draft | `/book-to-post <book-slug> [chapter or topic]` | Writes a blog post draft from the book. |

In short, the order is:

1. Put the book file in `books/`.
2. Run `/book-to-skill` once to make the book skill.
3. Use `/<book-slug>` to study, and `/book-to-post` to draft.

## Where the drafts go

Drafts are saved to `src/content/blog/<post-slug>.mdx` with `draft: true`, so they do not show on the site until you turn that off. Each post lists the books it used in its `sources` frontmatter, shown as a **References** block.

## Setup (once per machine)

Install three user-level skills. Nothing is copied into this repo.

```bash
# 1. book-to-skill (imports a book as a skill into ~/.claude/skills/book-to-skill)
npx skills add virgiliojr94/book-to-skill --global --agent claude-code -y

# 2. humanizer (Claude Code plugin; the command is /humanizer:humanizer)
claude plugin marketplace add blader/humanizer
claude plugin install humanizer@humanizer

# 3. excalidraw-diagram (diagrams + PNG renderer, needs uv)
git clone https://github.com/coleam00/excalidraw-diagram-skill.git ~/.claude/skills/excalidraw-diagram
cd ~/.claude/skills/excalidraw-diagram/references && uv sync && uv run playwright install chromium
```

Check the renderer: `uv run python render_excalidraw.py <file>.excalidraw` (run inside `references/`) writes a PNG next to the file.

Known issue: the renderer loads Excalidraw from esm.sh, and the latest version (0.18.1) was broken on 2026-11-15. Pin the import with this macOS command (on Linux drop the `''` after `-i`):

```bash
sed -i '' 's#https://esm.sh/@excalidraw/excalidraw[^"]*#https://esm.sh/@excalidraw/excalidraw@0.18.0?bundle#' ~/.claude/skills/excalidraw-diagram/references/render_template.html
```

The diagram colours come from the book-to-post style guide (`.claude/skills/book-to-post/style-guide.md`), so the skill's default palette file does not need editing.
