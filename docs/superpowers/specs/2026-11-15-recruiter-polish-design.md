# Recruiter polish (content, layout, subtle motion) — design

Date: 2026-11-15 · Status: approved by Khang (2026-11-15)

## Intent
Visitors are recruiters and engineers who find the site on their own (Khang is not actively applying).
Target role: **Full-stack**. Goal: in the first few seconds a visitor knows who Khang is, what he is
strong at, and sees proof — professional, calm, not flashy.

## Goals / non-goals / anti-goals
- Goals: clear hero headline + short bio + a row of verifiable stats; current job (Kafi) shows
  achievements, not just a stack; Projects higher on the page; passive, confident tone; a few subtle
  motion touches; fix known small defects.
- Non-goals: case-study pages (approach C, later); new colour palette or fonts; new sections.
- Anti-goals: invented numbers or claims; motion that is noticeable for its own sake (bouncing,
  parallax, count-up numbers, typewriter); anything that hides content without JS or when printing;
  confidential Kafi details (client names, internal system names, figures).

## Approaches considered
- A. Content + layout only. Fixes everything that hurts the impression; no motion.
- **B. A + subtle motion (chosen by Khang, 2026-11-15).**
- C. A + case-study pages for 1–2 flagship projects. Biggest impact on tech leads, needs much more
  content from Khang; separate project.

## Design
1. **Hero** (`Hero.astro`, `content.json → hero`):
   - Keep "Hi, I'm Khang". Add a role line "Full-stack Software Engineer" and a one-line focus:
     "React/Next.js · Node.js · Go · AWS — marketplace and real-time trading systems".
   - Bio cut to 2–3 sentences, left-aligned (no `text-align: justify`).
   - Stats row (4 items, all from the CV): "~3 yrs · experience", "10+ · marketplace platforms
     shipped", "AWS Certified · Developer – Associate", "M.Sc. AI · GPA 9.07/10 (in progress)".
   - CTAs: "Download CV" (primary) + "Email me"; socials unchanged.
2. **Remove the two "For Product Teams / For AI-Driven Products" cards** (`Highlights.astro` removed
   from the page; `highlights` removed from `content.json`).
3. **Kafi experience**: stack line + 4 bullets (see "Kafi bullets" below) — Khang approves the text.
4. **Section order**: Hero → Experience → Projects → Skills → Education → Blog → Contact. Nav and
   footer link order follow.
5. **Skills**: see "AI skills" below.
6. **Blog**: with a single post, show it as one wide "featured" card instead of a sparse grid.
7. **CTA band**: "Let's talk about your next project." → heading "Open to good conversations.",
   sub "Full-stack roles, product engineering, or just comparing notes on real-time systems." Button
   "Say hello".
8. **Subtle motion** (all disabled under `prefers-reduced-motion: reduce`; content visible without JS
   and in print):
   - Sections fade in + move up 12px once when first scrolled into view (IntersectionObserver,
     ~400ms ease-out). Hero is visible immediately (no animation above the fold).
   - Project detail cross-fades (150ms opacity) when switching projects.
   - Desktop: project list is `position: sticky` (below the nav) while a long detail scrolls.
   - Existing card hover lift stays; nothing else moves.
9. **Small fixes**: hamburger hidden on desktop; nav no longer overflows at 769–950px; project
   screenshot shows a neutral background while loading.

## Kafi bullets (drafted from Khang's work-log and generalized interview notes; needs Khang's OK)
Public wording only: no internal product/system names, client names, ticket IDs or figures.
- Built a real-time trading workspace in React/TypeScript (dockable and pop-out panels, per-user saved
  layouts, a wide AG Grid quote sheet) backed by a Go BFF and a Python pricing engine.
- Moved the order book off full reads of the upstream core system to a PostgreSQL + Kafka
  event-sourced view, with cursor-paginated APIs and virtualized React tables, so the console shows
  the full day book.
- Made the console stay truthful under failure: reconnect-safe market depth (snapshot epochs, back-off
  with jitter), confirmed bulk cancels with the true order count, and plain-language reasons for
  rejected orders.
- Kept a high-frequency market-data UI responsive (batched updates, row-level memoization, throttled
  redraws) and verified fixes end to end on a local FIX/Kafka trading rig with Playwright.
Keep the existing "Tech stack:" line as the first bullet.

## AI skills (Khang, 2026-11-15: add AI-assisted engineering skills)
- Skills group "AI" (currently only "OpenAI API") becomes **"AI & LLM"**: OpenAI API, Embeddings &
  semantic search, RAG, LLM fine-tuning (QLoRA), vLLM, LLM evaluation. (Each backed by a project:
  GearShare semantic search, Internal Knowledge Chatbot, LLM C++ autograder coursework.)
- New group **"AI-assisted Engineering"**: Claude Code, Multi-agent workflows, Context engineering,
  MCP, Agent hooks & skills. "Claude" moves here from Tools.
- One full-width card under the skills grid, "How I work with AI" (3 short lines, no hype):
  1. Plan first: design doc and task plan reviewed before any code.
  2. Parallel agents in isolated git worktrees, each task checked by an independent reviewer, then a
     whole-branch review; fixes verified with tests and Playwright, not by the agent's word.
  3. Built my own knowledge-base hooks so agents recall project context in under 100 ms and save
     what they learn.
- Trello stays in Tools (Khang did not ask to remove it).

## Left to the builder
Exact spacing/typography of the stats row within existing tokens; IntersectionObserver thresholds;
which elements inside a section animate (section as a whole is fine).
