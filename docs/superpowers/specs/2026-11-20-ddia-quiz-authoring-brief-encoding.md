# Authoring brief: one case set of the DDIA "encoding and schema evolution" quiz

You write ONE case set: a scenario, a figure, and 5 bilingual multiple-choice questions. You own it end to end:
the JSON, the figure, the checks, the screenshots, the fixes. Nobody hands fixes back to you later.

Read first: this brief, `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md`, `src/data/quiz/types.ts`, and the post
`src/content/blog/encoding-and-schema-evolution.mdx` (it alternates `<En>` and `<Vi>` blocks; read the English ones for the
facts and the Vietnamese ones for the exact Vietnamese terms the site already uses). Format examples that are already
finished and approved: the sets of the first quiz, `src/data/quiz/reliable-scalable-maintainable-data-systems/set-03.json`
and `set-06.json`, and their figures `src/components/quiz/figures/HundredServices.astro` and `RolloutTimeline.astro`.
Copy their structure and level of care, not their wording or topics.

## What you create (and nothing else)

- `src/data/quiz/encoding-and-schema-evolution/set-NN.json` (NN = your set number, two digits)
- `src/components/quiz/figures/<FigureName>.astro` (the name your task gives you)

Do not edit any other file. Do not commit: the lead commits everything at the end, because several authors
share one working tree and parallel commits collide. Do not start a dev server: one is already running on
port 4321.

## The audience and the aim

Working engineers. The quiz helps them understand, apply, and answer in interviews, with emphasis on what
happens when AI writes or suggests code. Two tracks: `interview` (the kind of thing commonly asked, asked
directly) and `ai` (reviewing or questioning something an AI assistant produced). Both are mixed inside a set;
your task lists the slot of each question.

## Hard rules (the validator enforces most of them)

1. 5 questions, ids `s<NN>q1` to `s<NN>q5`, `difficulty` never decreasing, following your slot table
   (level, track, type, difficulty).
2. 4 options (`a` to `d`); type `multi` has 5 (`a` to `e`) and exactly two answers.
3. Every wrong option has a `whyWrong` entry naming the misconception behind it.
4. Every string is `{ en, vi }`, both filled.
5. No "all of the above" or "none of the above". No NOT-style negatives. No trick questions.
6. All options of a question have a similar length and tone. The correct one must not be the longest, the most
   hedged, or the most detailed. Wrong options come from real misconceptions and sound reasonable.
7. Authored answer positions vary: no more than 2 of your 5 answers at the same position (a to d).
8. Never refer to an option by letter ("(a)", "option b") in any explanation or say-line. The page shuffles the
   options, so letters would point at the wrong text. Quote the idea instead.
9. Ask directly. No "an interviewer asks" or "a recruiter says" in any stem. The `interview` track is about the
   topic, not a staged conversation.
10. Calculation questions state EVERY formula the reader needs inside the stem. They test applying the
    formulas, not remembering them. Invented figures are labelled illustrative (`context.illustrative: true`)
    and must be internally consistent.
11. Every computed answer is verified by running code (Python is fine). Put the command and its output in
    `verifiedBy`. A `code-output` question needs `verifiedBy`.
12. A question must be answerable from its scenario alone (plus general knowledge it teaches in the
    explanation). No stem may contain or imply another question's answer. Read each stem with the others hidden.
13. Facts beyond the post need an external source in `ref` (a URL you actually opened) and only well-established
    practice. If a point is contested or only from a blog, leave it out. Post-based questions use `ref` such as
    `"Post: Numbers: why X sends every ID twice"`.
14. `reread.anchor` must be one of the heading slugs listed at the end of this brief.
15. Vietnamese is natural technical Vietnamese. Keep code terms and common jargon (fan-out, p99, replica, canary,
    rollback, cache, queue, thundering herd, TTL) as they are, like the post's Vietnamese section does.
16. Scenario text and stems may use `\n` for line breaks and `- ` for list lines (the page shows line breaks).
17. `explanation.say`: for `interview` questions, a line a candidate could say aloud. For `ai` questions, a
    review habit ("when AI gives X, check Y").
18. Style: short sentences, plain words. Explain the idea before the detail. Do not copy the sample case's
    wording; copy its structure.

## The figure

One inline-SVG Astro component, no images, no external fonts or libraries. It follows the site's drawing rules (the project's
skill: `.claude/skills/book-to-post/SKILL.md`, section "B. Diagrams & Visuals: drawn on the page"; the reference figure is
`src/components/mdx/FaultVsFailure.astro`; icons only through `src/components/mdx/DiagramIcon.astro`, keys in
`src/data/diagram-icons.ts`, never edit shared components).
- Placement: the figure sits in the LEFT column under the scenario text, about 600px wide on desktop and full width on a phone.
  So: `viewBox` about 580 wide, labels 13 to 15px at that width, svg `width: 100%`, no horizontal scroll (keep any
  `min-width` at or below 360px). Root element is a `div` (not `<figure>`) with no `<figcaption>`: the page adds a centred
  caption from the `alt` text in the JSON.
- Page font only, inherited. NO monospace, no `font-family`. Numbers use `font-variant-numeric: tabular-nums`.
- Colours only from site tokens (`var(--text)`, `--text-body`, `--text-muted`, `--bg-alt`, `--border`, `--red`, `--red-tint-bg`,
  `--gold`, `--gold-tint-bg`, `--act-2`, `--bg`), never a hex colour, so light and dark both work. Red marks only the
  problem, gold marks the safe path.
- Words in the figure: sentence case, plain words, no ALL CAPS, no emoji, no hype. Vietnamese must read as natural Vietnamese,
  not word by word.
- Bilingual text as `<text><tspan data-lang-en>..</tspan><tspan data-lang-vi>..</tspan></text>`.
- No `<marker>`, `<pattern>`, `<filter>`, `<clipPath>` or any `id`s (the page renders each figure in two languages; draw
  arrowheads as plain polygons).
- Use colour icons through `DiagramIcon` for real things (database, server, laptop, users, phone, cloud, ...), flat shapes
  otherwise. Make it a real teaching picture of the mechanism with the numbers of your scenario, not a plain box diagram.
- Scoped `<style>` with a class prefix unique to your figure.
- The figure and its `alt` must never show or state the answer to a question or a computed result. Reference it from the
  JSON in `context.media`: `{ "kind": "figure", "component": "<FigureName>", "alt": { "en": "...", "vi": "..." } }`; the `alt`
  is one clear sentence in both languages describing the picture.
- A `code` media item (`{ "kind": "code", "lang": "sql", "code": "..." }`) is for short snippets inside questions.

## How to check your work

1. `node scripts/quiz/validate.ts src/data/quiz/encoding-and-schema-evolution/set-NN.json`
   Prints every problem; fix until it prints `ok`. (`node --test src/utils/quiz.test.ts` checks all sets
   together and can fail on someone else's unfinished file; use the validator for your own.)
2. Screenshot your set (the dev server on port 4321 is running):
   `node scripts/quiz/shot.mjs 4321 encoding-and-schema-evolution set-NN /tmp/quiz-NN --questions`
   (use your scratchpad directory instead of `/tmp` if you were given one; retry once if it says the set is missing, the dev server reloads slowly). It writes your scenario and figure in light EN, light VI and dark VI, and every question answered. Open the PNGs with the Read tool and fix
   what you see: overflowing or clipped labels, unreadable contrast in dark mode, a figure that contradicts
   the numbers, option text that wraps badly. Never judge widths from character counts, only from the images.
3. Re-read your questions one more time against rules 5 to 12 above. Rerun every verification command.

## Report back (short)

List: the files you wrote; the validator result; for each computed answer the command and output; anything you
could not verify or that goes beyond the post, with its `ref`; anything in the design or brief you think is
wrong. Do not paste the JSON back.


## Lessons from the first quiz (they are rules here)

- Formulas in the stem are written as formulas: put each in backticks, one per line starting with `- `, for example
  ``- `rows touched = reads per second × rows per read` ``. Text outside backticks stays plain. The page shows backticked
  text as a formula block (also fine for short code names inside options and explanations).
- The validator rejects a correct option that is more than 10 characters longer than every other option. Aim for options of
  nearly equal length; it is fine for a wrong option to be the longest.
- Do not write a sentence saying the numbers are made up: when `context.illustrative` is true the page already adds that
  note. Say it in the scenario only if the sentence carries other information.
- A stem or the scenario must not name the technique that is the answer of another question of the same set.
- Facts beyond the post need a source you opened. In the first quiz the fact review found a wrong "answer" (a distractor that
  was correct in real practice) and two errors in the source post; check your distractors against real practice, and say in
  your report if the post itself looks wrong anywhere.
- `reread.label` is the heading text of the post section, not a paraphrase.
- The Vietnamese set title must read as natural Vietnamese (a short phrase, not a word-by-word translation).

## The sets

Your slot table (level / track / type / difficulty per question) and the scenario come from your task message. Difficulty never decreases inside a set.

## Allowed `reread.anchor` values (English heading slugs of the post)

```
what-happened-at-knight-capital
1-old-and-new-code-at-the-same-time
2-your-languages-built-in-format
the-java-deserialization-bug-nobody-patched-for-months
pythons-pickle-does-the-same-by-design
3-json-and-its-blind-spots
numbers-why-x-sends-every-id-twice
other-gaps-in-json
ubers-encoding-test-the-schema-decided-it
4-binary-formats-with-a-schema
how-does-an-avro-reader-know-the-writers-schema
5-changing-a-schema-safely
6-data-outlives-code
gitlab-three-releases-to-drop-one-column
7-apis-you-cannot-take-back
stripe-every-api-version-since-2011-still-working
why-a-remote-call-is-not-a-function-call
8-workflows-replay-your-code
9-messages-through-a-broker
key-takeaways
```
