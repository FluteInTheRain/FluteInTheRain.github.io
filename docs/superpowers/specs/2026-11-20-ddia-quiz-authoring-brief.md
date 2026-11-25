# Authoring brief: one case set of the DDIA post 1 quiz

You write ONE case set: a scenario, a figure, and 5 bilingual multiple-choice questions. You own it end to end:
the JSON, the figure, the checks, the screenshots, the fixes. Nobody hands fixes back to you later.

Read first: this brief, `docs/superpowers/specs/2026-11-20-ddia-quiz-design.md`, `src/data/quiz/types.ts`,
`src/data/quiz/_fixtures/sample-case.json` (a finished set, your format example), and the post
`src/content/blog/reliable-scalable-maintainable-data-systems.mdx` (English block ends at `</En>`; the
Vietnamese block follows, use it for the exact Vietnamese terms the site already uses).

## What you create (and nothing else)

- `src/data/quiz/reliable-scalable-maintainable-data-systems/set-NN.json` (NN = your set number, two digits)
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
10. Calculation questions are optional: a set needs none unless its scenario really turns on a number. When
    you do write one, state EVERY formula the reader needs inside the stem; it tests applying the formulas, not
    remembering them. Invented figures are introduced in the sentence ("Suppose ...", "Giả sử ...") and must be
    internally consistent; no "illustrative" label.
11. Every computed answer is verified by running code (Python is fine). Put the command and its output in
    `verifiedBy`. A `code-output` question needs `verifiedBy`.
12. A question must be answerable from its scenario alone (plus general knowledge it teaches in the
    explanation). No stem may contain or imply another question's answer. Read each stem with the others hidden.
13. Facts beyond the post need an external source in `ref` (a URL you actually opened) and only well-established
    practice. If a point is contested or only from a blog, leave it out. Post-based questions use `ref` such as
    `"Post: Why averages hide tail latency"`.
14. `reread.anchor` must be one of the heading slugs listed at the end of this brief.
15. Vietnamese is natural technical Vietnamese. Keep code terms and common jargon (fan-out, p99, replica, canary,
    rollback, cache, queue, thundering herd, TTL) as they are, like the post's Vietnamese section does.
16. Scenario text and stems may use `\n` for line breaks and `- ` for list lines (the page shows line breaks).
17. `explanation.say`: for `interview` questions, a line a candidate could say aloud. For `ai` questions, a
    review habit ("when AI gives X, check Y").
18. Style: short sentences, plain words. Explain the idea before the detail. Do not copy the sample case's
    wording; copy its structure.

## The figure

One inline-SVG Astro component, a few KB, no images, no external fonts or libraries.
- Colours only through the site tokens (`var(--text)`, `var(--text-body)`, `var(--text-muted)`, `var(--bg-alt)`,
  `var(--border)`, `var(--red)`, `var(--red-tint-bg)`, `var(--gold)`, `var(--gold-tint-bg)`, `var(--act-2)`
  for good/healthy). Never a hex colour. It must read well in light and dark.
- Text inside SVG is bilingual: `<text><tspan data-lang-en>..</tspan><tspan data-lang-vi>..</tspan></text>`
  (the site CSS shows one). See `src/components/mdx/FaultVsFailure.astro` for the pattern.
- Scoped `<style>` with a class prefix unique to your figure (for example `.qfig-hundred`). Set `svg { width:100%; height:auto; display:block }`. The figure must work from 360 px to 1100 px wide; for wide drawings use a `viewBox` and short labels, not a horizontal scroll.
- Icons only through `DiagramIcon` (`src/components/mdx/DiagramIcon.astro`, keys in `src/data/diagram-icons.ts`) if you need one; do not edit that file or any shared component.
- The figure shows the mechanism the questions are about, with the real numbers of your scenario. It must not
  show the answer to a question. If the scenario has numbers, the figure's numbers must match them exactly.
- Reference it from the JSON: `"media": [{ "kind": "figure", "component": "<FigureName>", "alt": { "en": "...", "vi": "..." } }]`
  in `context.media`, or inside a question. The `alt` text describes the picture in one sentence and is also
  the caption.
- A `code` media item (`{ "kind": "code", "lang": "python", "code": "..." }`) is for short snippets in
  questions; the page shows it in a monospace block.

## How to check your work

1. `node scripts/quiz/validate.ts src/data/quiz/reliable-scalable-maintainable-data-systems/set-NN.json`
   Prints every problem; fix until it prints `ok`. (`node --test src/utils/quiz.test.ts` checks all sets
   together and can fail on someone else's unfinished file; use the validator for your own.)
2. Screenshot your set (the dev server on port 4321 is running):
   `node scripts/quiz/shot.mjs 4321 reliable-scalable-maintainable-data-systems set-NN /tmp/quiz-NN --questions`
   (use your scratchpad directory instead of `/tmp` if you were given one). It writes your scenario and figure in light EN, light VI and dark VI, and every question answered. Open the PNGs with the Read tool and fix
   what you see: overflowing or clipped labels, unreadable contrast in dark mode, a figure that contradicts
   the numbers, option text that wraps badly. Never judge widths from character counts, only from the images.
3. Re-read your questions one more time against rules 5 to 12 above. Rerun every verification command.

## Report back (short)

List: the files you wrote; the validator result; for each computed answer the command and output; anything you
could not verify or that goes beyond the post, with its `ref`; anything in the design or brief you think is
wrong. Do not paste the JSON back.

## The sets (slots: level / track / type / difficulty per question)

| Set | Title | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|---|
| 01 | The green dashboard | remember / interview / single / 1 | understand / ai / diagram / 2 | understand / interview / single / 2 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 |
| 02 | Disk in rack 14 | remember / interview / single / 1 | understand / interview / single / 2 | apply / ai / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / ai-review / 4 |
| 03 | A page that calls 100 services | understand / interview / single / 2 | apply / ai / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / ai-advice / 4 | evaluate / interview / scenario / 5 |
| 04 | The feed that melted the database | understand / ai / ai-advice / 2 | apply / interview / scenario / 3 | apply / interview / scenario / 3 | analyze / ai / multi / 4 | evaluate / ai / ai-review / 5 |
| 05 | The code nobody dares touch | remember / interview / single / 2 | understand / ai / ai-review / 2 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 | evaluate / ai / ai-advice / 5 |
| 06 | Friday config push | understand / interview / single / 2 | apply / ai / ai-review / 3 | apply / ai / scenario / 3 | analyze / interview / multi / 4 | evaluate / ai / ai-advice / 5 |
| 07 | One slow server in a hundred | apply / interview / scenario / 3 | apply / ai / scenario / 3 | analyze / interview / scenario / 4 | analyze / ai / multi / 4 | evaluate / interview / scenario / 5 |
| 08 | The second replica died too | apply / ai / ai-review / 3 | apply / interview / scenario / 4 | analyze / ai / multi / 4 | evaluate / interview / scenario / 5 | evaluate / ai / ai-advice / 5 |

Note the difficulty values already satisfy "never decreasing" inside each set. The set's own scenario, topics
and figure name come from your task message.

## Allowed `reread.anchor` values (English heading slugs of the post)

```
simple-code-meets-production-load
social-timelines-and-the-fan-out-problem
1-fan-out-on-read-join-when-the-feed-loads
2-fan-out-on-write-precompute-each-inbox
3-the-hybrid-that-runs-in-production
why-averages-hide-tail-latency
percentiles-show-what-users-actually-feel
why-amazon-cares-about-p999
dean-and-barroso-fan-out-makes-the-tail-worse
real-case-hedged-requests-on-a-100-server-bigtable-read
faults-failures-and-human-error
faults-vs-failures
three-places-faults-come-from
designing-for-human-error
maintainability-and-the-complexity-trap
1-operability-easy-to-run
2-simplicity-cut-accidental-complexity
3-evolvability-easy-to-change
key-takeaways
```
