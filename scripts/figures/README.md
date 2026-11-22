# Figure check scripts

These scripts check blog figures cheaply. Run each one from the repo root, or from the root of a worktree.

| Script | What it answers | Typical use |
|---|---|---|
| `visual-audit.py <post.mdx>` | How visual is the post? It reports words per visual, the longest run of prose with no visual, and the sections that have no picture. | Before work: to find where pictures are missing. After work: to confirm the targets are met. |
| `post-check.sh <slug> <base-ref> <port>` | Does the post still work? It checks for leftover "chapter N" framing, hex colours added since `<base-ref>`, HTTP 200, an error overlay, and island URLs. | After every edit. It exits non-zero on failure. |
| `figshot.sh <port> <out-dir> <Comp> [...]` | What do these figures look like in light EN, light VI and dark VI? | After drawing or editing a figure. Read the PNGs. |

`post-check.sh` and `figshot.sh` both need `npx astro dev --port <port>` running in the same folder. In a git worktree, copy `node_modules` (`cp -cR ../<main>/node_modules .`) instead of symlinking it. With a symlink, Vite refuses to serve the React renderer, so the demos never hydrate.

## Rules that keep multi-agent figure work cheap

These rules come from the DDIA series run (Nov 2026). It used 60 Sonnet agents, about 7.9M reported tokens and about 1,900 tool calls. About a third of those tokens went to reviews whose overflow findings turned out to be mostly wrong.

1. **Use one agent per post, and it owns the whole job.** The same agent adds the figures, runs `post-check.sh` and `figshot.sh`, and fixes what the screenshots show. Do not hand fixes back later. Every time an agent is resumed, it re-reads its whole context.
2. **Never estimate label width from character counts.** Reviewers that used 0.55em per character flagged overflows that were not there. Only screenshots count.
3. **Reviews check facts, not pixels.** A reviewer opens the sources, checks numbers, mechanisms and arrow direction, checks that each icon or logo matches its box (a product logo goes only on a box that is that product), checks colour meaning (red = problem, gold = safe path), and checks EN/VI parity. Give it the diff file, not the worktree.
4. **Start from the audit.** Run `visual-audit.py` first and put the sections it lists into the brief. Agents then work where pictures are missing instead of sweeping the whole post.
5. **Share building blocks.** Icons come only from `src/data/diagram-icons.ts` through `DiagramIcon`. Extend that catalogue on its own branch, never inside a post branch. Do not edit the shared components (`AnimatedFlow`, `Figure`, `DemoFrame`, `DiagramIcon`) from a post agent.
6. **Read cropped screenshots.** For the lead, a whole-page screenshot costs far more context than a crop of the one figure being checked.
7. **Stay under the usage cap.** Run waves of at most about 8 to 10 agents. A 5-hour usage cap stopped 14 agents mid-run in one go.

SVG figures in `src/assets/blog/**` are rasterized to PNG in place with a plain sharp call, at double the SVG's logical size: `node -e "require('sharp')('src/assets/blog/<post>/<fig>.svg',{density:144}).png().toFile('src/assets/blog/<post>/<fig>.png')"` (sharp's default SVG density is 72 dpi = 1x; 144 dpi = 2x).
