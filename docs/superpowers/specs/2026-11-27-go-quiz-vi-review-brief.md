# Brief: Vietnamese review of one Go post's quiz (one agent owns one post)

The 20 `go-*` quizzes were written with English first and Vietnamese second by agents. Nobody has read the Vietnamese as a
reader would. You review ONE post's quiz and fix the Vietnamese. Repo: `/Users/nguyennhatkhang/Downloads/learning/FluteInTheRain.github.io`,
branch `fix/go-quiz-polish`. Other agents review other posts at the same time. Do not commit, stage, stash, checkout or reset; do not build.

## Your files (edit ONLY the `vi` strings of these)

`src/data/quiz/<slug>/set-*.json` (20 questions = 4 sets, 40 questions = 8 sets). Also the `alt.vi` of figure media.
Do not edit any `en` string, `id`, `level`, `kind`, `track`, `type`, `difficulty`, `answer`, option ids, `anchor`, `ref`, `verifiedBy`,
code in `media`, or any figure file. Do not add or remove questions or options.

## How to review

1. Read your post `src/content/blog/<slug>.mdx`, especially its Vietnamese spans (`data-lang-vi`), to learn the post's own Vietnamese terms. Reuse them.
2. For every `{ en, vi }` pair in every set (context text, stems, options, `whyRight`, each `whyWrong`, `reread.label`, `say`, set titles), read the `vi` on its own as a Vietnamese developer would, then compare with `en`.
3. Fix the `vi` when you find:
   - word-by-word calques or stiff English word order ("Cái nào sau đây là đúng nhất" style, passive overuse, "thực hiện việc ...")
   - meaning that was dropped, added or reversed against `en` (this matters most: a wrong `vi` explanation of a Go behaviour is a bug)
   - a technical claim in `vi` that is not what `en` says, or a number, unit or identifier that differs between `en` and `vi`
   - inconsistent terms inside the post (the same idea named two ways); follow the post
   - translated identifiers, keywords, package names, commands, error messages or code. These stay in English exactly as in `en` (goroutine, channel, slice, map, defer, `context`, `sync.WaitGroup`, `-race`, ...). Common loanwords developers say in English also stay English.
4. Leave a `vi` alone when it is already natural and faithful. Do not rewrite for taste; no format, reorder or rename churn. Most strings should need no change.
5. Voice: plain, concrete, direct. No "không phải X mà là Y" staging, no one-line closers, no filler. Same register as the post's own Vietnamese.

## Terms across posts

Each post uses its own Vietnamese terms (for example garbage collector may be "bộ dọn rác" in one post and kept as "garbage collector" in another). Follow YOUR post's own Vietnamese. When your post's Vietnamese has no term for a word, keep the English word (garbage collector, park, goroutine) rather than inventing a calque ("bộ gom rác", "đỗ"). Do not change a term only because another post spells it differently.

## Check before you report

- `node scripts/quiz/validate.ts src/data/quiz/<slug>/set-*.json` is clean.
- `node scripts/quiz/mix.ts <slug>` says "on target".
- `git diff --stat -- src/data/quiz/<slug>` shows only your post's files, and `git diff -U0 -- src/data/quiz/<slug> | grep '^[-+]' | grep -v '"vi"'` shows nothing except file headers (proves you touched only `vi`).
- Write JSON with the same 2-space indent and key order; if you use a script, keep the original formatting so the diff shows only changed `vi` lines.

## Report (short)

How many `vi` strings you changed and in which sets. Up to five representative before/after examples. Any place where `en` itself looks wrong or where `vi` and `en` disagreed on a technical fact (name the question id; do not change `en`).
