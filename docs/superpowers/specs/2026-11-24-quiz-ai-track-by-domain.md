# Review quiz: AI-output questions only in code posts

Date: 2026-11-24. Status: decided by Khang, implemented. Amends the "Focus" section of
`2026-11-20-ddia-quiz-design.md`, which asked every quiz for 20 "Working with AI" questions.

## Rule

A quiz may ask the reader to **judge, review or verify AI output** only when the post teaches a
skill where AI writes or suggests the work: code, data systems, backend, AI engineering.

When the skill is human judgement (investing, UX/UI design, and similar), no question asks about AI
output. Those quizzes replace the AI questions with **case questions**, not with fewer questions:
still 8 sets of 5, 40 in total.

| Post domain | Track A | Track B | Types allowed |
|---|---|---|---|
| `code` (DDIA, backend, Go, AI trading) | `interview` (20) | `ai` (20) | all current types |
| `human` (stocks basics, UI/UX) | `interview` (20) | `case` (20) | `single`, `scenario`, `diagram`, `multi` |

In a `human` quiz the validator rejects: `track: ai`, types `ai-review` / `ai-advice` / `code-output`,
and any stem or option that mentions AI, an LLM, ChatGPT, Claude, Copilot, Gemini or Cursor.
In a `code` quiz the validator rejects `track: case`.

## What a `case` question is

A real situation the reader has to judge with the skill itself. No AI in the story. Examples:

- **Stocks:** read a short income-statement excerpt and work out EPS, dividend yield or P/E; say what
  happens to the share price on the ex-dividend date; spot the mistake in an investor's reasoning
  (a person's, not an AI's); compare two companies from a small table and choose.
- **UI/UX:** look at a screen drawn as a figure and pick the fix; read a contrast ratio or a tap-target
  size and say whether it passes; pick the layout for a task flow; name the principle a design breaks;
  read a usability-test result and decide what to change first.

`case` questions keep the same shape as the others (level, difficulty, `reread` anchor, `say` line, `ref`).
For `case` the `say` line is a spoken line for an interview or a design review, not an AI-review habit.

## Where it is enforced

- `src/data/quiz/domains.ts`: one entry per quiz post, `code` or `human`. A quiz folder with no entry
  fails `node --test`, so the author has to decide when adding a quiz.
- `src/utils/quiz.ts`: `validateSet(set, anchors, domain)` applies the rule above.
- `src/utils/quiz.test.ts`: unit tests for the rule, and the 8-set totals check follows the domain
  (`interview 20 + ai 20`, or `interview 20 + case 20`).

## Pending

`what-is-a-stock-ownership-dividends` was written before this rule and still has 20 `ai` questions.
It is listed in `PENDING_REWRITE` in `quiz.test.ts` and checked as a `code` post until its 20 AI
questions are replaced with `case` questions. Remove it from that list in the same change.
The AI trading series is treated as `code`: it is about building AI and data systems.
