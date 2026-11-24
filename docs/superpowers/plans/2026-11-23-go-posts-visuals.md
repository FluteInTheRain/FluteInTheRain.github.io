# Go posts 1–10 visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4–6 on-page figures to each of Go posts 1–10.

**Architecture:** One owning Sonnet agent per post works in that post's worktree, adds `GoP<NN>*.astro` static SVG figures, checks them with `figshot.sh` and `post-check.sh`, and commits. A fact reviewer checks each wave's diffs.

**Tech Stack:** Astro 7 static SVG components, MDX, site CSS tokens.

**Spec:** docs/superpowers/specs/2026-11-23-go-posts-visuals-design.md

## Global Constraints

- 4–6 new figures per post; at most 1 extra real-world image.
- Only site CSS tokens, page font, sentence case, bilingual `data-lang-en` / `data-lang-vi` labels, unique SVG ids per instance.
- No edits to existing components, `series.ts`, `CHANGELOG.md` (added at PR time) or anything under `books/`.
- Gate per post: `npm run build` clean, `node --test src/utils/*.test.ts` 47 pass, `post-check.sh` all zero.

## Review Focus

- A figure that shows a concept the post has not taught yet.
- A figure whose names or numbers differ from the code and output shown next to it.
- EN/VI labels that say different things.
- Text clipped or overlapping in VI (longer labels) or dark mode.
- Duplicate SVG ids between the EN and VI copies.

## Tasks

- [ ] Task 1–5: wave A, posts 1–5 (one agent each, parallel worktrees)
- [ ] Task 6: fact review wave A, fixes
- [ ] Task 7–11: wave B, posts 6–10
- [ ] Task 12: fact review wave B, fixes
- [ ] Task 13: controller screenshot check, CHANGELOG entry, PRs (only when Khang says)
