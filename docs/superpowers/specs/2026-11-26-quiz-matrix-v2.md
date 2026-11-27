# Quiz matrix v2

Date: 2026-11-26. Status: decided with Khang (the direction), numbers researched and set by Claude.
Applies to **new** quiz posts and series. Existing quizzes (DDIA, backend, Go, stocks, AI trading) keep the original mix, called **v1**
(`2026-11-20-ddia-quiz-design.md`: 8 sets x 5, Remember 3 / Understand 7 / Apply 14 / Analyze 9 / Evaluate 7, interview 20 + ai or case 20).
A post opts in by an entry in `QUIZ_MATRIX` (`src/data/quiz/domains.ts`); no entry means v1. The data is in `src/data/quiz/matrix.ts`.

## What v2 changes

1. **Two sizes.** Big or important posts get **40 questions** (8 sets), light and basic ones **20** (4 sets). v1 had only 40.
2. **Kind is a separate axis from level.** Level is how deep the thinking is (Remember to Evaluate). Kind is what the question is for
   (`basic`, `why`, `predict`, `diagnose`, `whatif`). One kind appears at several levels: a *why* question can be easy (name the reason), harder
   (apply a reason to a new symptom) or hardest (judge whether the reason still holds in a new case).
3. **A retuned level mix** for a review quiz that working engineers use to study: more Remember and Understand than v1, a little less Evaluate.
4. **Longer scenario cards** and a rule for where facts come from (below).

## What the research says (and how far it is used)

Found by web search on 2026-11-26. I read the search summaries, not every page in full; the claims below are limited to what the summaries state.

| Question | Finding | Used for |
|---|---|---|
| How many options? | A meta-analysis of 27 studies concluded three options are optimal in most settings: going from five or four to three changed difficulty, discrimination and reliability little or not at all, and extra distractors often go unused ([Haladyna, Downing and Rodriguez 2002](https://cpl.health.unm.edu/AssetListing/Writing-Questions-for-Learning-and-Assessment-2573/Rules-for-Multiple-Choice-Items-Haladyna-et-al-2002-5943); [checklist citing Rodriguez 2005](https://www.trentu.ca/teaching/sites/trentu.ca.teaching/files/documents/Optimizing%20Multiple%20Choice%20Assessment%20Checklist.pdf)) | Every wrong option must be a real misconception. Padding a fourth option with filler is worse than having three. Open point: allow 3-option questions (see the end) |
| How do exams weight cognitive levels? | Blueprints set a percentage per level and lean towards application: one published example gives application 54%, comprehension 25%, knowledge 12%, analysis 9%; programs often condense Bloom into recall / application / analysis ([PSI](https://www.psiexams.com/knowledge-hub/cognitive-levels-and-simplification/); the 54% figure comes from a third-party prep site and is unverified) | Apply stays the biggest bucket (30%) |
| Is recall worth testing? | Retrieval practice is well supported for retention; evidence that it transfers to new questions is real but thinner ([Karpicke 2025 review](https://learninglab.psych.purdue.edu/downloads/2025/2025_Karpicke_Retrieval_Based_Learning_Review.pdf); [CMU summary](https://www.cmu.edu/teaching/resources/instructionalstrategies/activelearningstrategies/retrievalpractice/)). Short-answer beats multiple choice for learning in some studies, but this site only supports multiple choice | Remember rises from 7.5% to 12.5% and Understand to 20%: later questions depend on the basics, and this is a study tool |
| Can multiple choice test higher-order thinking? | Apply, Analyze and Evaluate can be assessed, but such items are harder to write, take longer, and graders often disagree about which level an item is; question clusters built on one scenario cut the reader's load ([Vanderbilt CFT](https://cft.vanderbilt.edu/?p=40325); [Scully 2017](https://openpublishing.library.umass.edu/pare/article/1628/galley/1579/view); [caveat paper](https://link.springer.com/article/10.1007/s40670-024-02140-7)) | Keep the 5-question case sets; Evaluate drops from 17.5% to 15%; level totals are checked to one question, cells are advisory (levels are fuzzy) |
| How long should a quiz be? | By the Spearman-Brown formula doubling comparable items raises reliability (for example 0.70 to about 0.82); it assumes the new items are as good as the old ([Spearman-Brown](https://www.wikipedia.org/wiki/Spearman%E2%80%93Brown_prediction_formula); [JALT worked example](https://teval.jalt.org/test/bro_9.htm)) | 40 only where a post has enough distinct ideas to deserve it; a padded 40 is worse than a sharp 20 |

## The matrix

Levels (questions per quiz). Each is checked to one question either way.

| Level | 40 questions | 20 questions | Share |
|---|---|---|---|
| Remember | 5 | 3 | 12.5-15% |
| Understand | 8 | 4 | 20% |
| Apply | 12 | 6 | 30% |
| Analyze | 9 | 4 | 20-22.5% |
| Evaluate | 6 | 3 | 15% |

Tracks: half and half. A code post: `interview` and `ai` (AI-output questions fit); a human-skill post: `interview` and `case`. 20 + 20 for 40 questions, 10 + 10 for 20.
Multi-select: 4 in a 40, 2 in a 20, in Analyze or Evaluate. Every question carries a `kind`.

Kind totals: basic 7 / why 10 / predict 7 / diagnose 9 / whatif 7 (of 40), and 4 / 4 / 3 / 5 / 4 (of 20). Each is checked to one question either way.

| Kind | What the question is for | Wrong options are |
|---|---|---|
| **basic** | A plain fact the rest depends on: a path, a term, who owns what. Not trivia | Neighbouring facts of the same system |
| **why** | Why the system is built this way: the reason behind a gate, a lane, a retry rule | Tempting reasons that are not in the system |
| **predict** | Follow a scenario through the real flow: what is stored, what the user sees, which step says no | Results that belong to another path or moment |
| **diagnose** | From a symptom, which steps to check first, or the cause; some multi-select | Plausible causes the flow rules out |
| **whatif** | A situation not in the post (a new button, a failed deploy, a feed that goes quiet): what to do and why. The stem states it | Shortcuts that remove a safeguard the post explains |

In the second track the kinds appear as `ai-review` (find the flaw in AI-written work; fits predict and diagnose) or `ai-advice` (judge an AI's recommendation; fits why and whatif).

### 40 questions: kind x level, and the recommended slots

| Kind \ Level | Remember | Understand | Apply | Analyze | Evaluate | Total |
|---|---|---|---|---|---|---|
| basic | 5 | 2 |  |  |  | 7 |
| why |  | 4 | 2 | 3 | 1 | 10 |
| predict |  |  | 6 | 1 |  | 7 |
| diagnose |  |  | 4 | 5 |  | 9 |
| whatif |  | 2 |  |  | 5 | 7 |
| **Total** | **5** | **8** | **12** | **9** | **6** | **40** |

Slots (Rem = Remember, Und = Understand, App = Apply, Ana = Analyze, Eval = Evaluate; I = interview, AI/case = second track). Sets run easy to hard; inside a set the level never goes down; every set mixes at least three kinds.

| Set | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|
| 1 | Rem basic I | Rem basic I | Und why I | App predict AI/case | Ana diagnose AI/case |
| 2 | Rem basic I | Und basic I | Und why AI/case | App predict I | Ana diagnose AI/case |
| 3 | Rem basic I | Und why I | App predict I | App diagnose AI/case | Ana why AI/case |
| 4 | Rem basic I | Und whatif I | App predict AI/case | Ana diagnose AI/case multi | Eval whatif AI/case |
| 5 | Und basic I | Und why I | App diagnose AI/case | Ana why AI/case | Eval whatif AI/case |
| 6 | Und whatif I | App predict AI/case | App diagnose I | Ana diagnose AI/case multi | Eval whatif AI/case |
| 7 | App why I | App predict AI/case | Ana predict I | Ana diagnose AI/case multi | Eval why I |
| 8 | App why I | App diagnose AI/case | Ana why AI/case | Eval whatif AI/case | Eval whatif I multi |

### 20 questions

| Kind \ Level | Remember | Understand | Apply | Analyze | Evaluate | Total |
|---|---|---|---|---|---|---|
| basic | 3 | 1 |  |  |  | 4 |
| why |  | 2 | 1 | 1 |  | 4 |
| predict |  |  | 3 |  |  | 3 |
| diagnose |  |  | 2 | 3 |  | 5 |
| whatif |  | 1 |  |  | 3 | 4 |
| **Total** | **3** | **4** | **6** | **4** | **3** | **20** |

| Set | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|
| 1 | Rem basic I | Rem basic I | Und why I | App predict AI/case | Ana diagnose AI/case |
| 2 | Rem basic I | Und basic I | App predict I | App diagnose AI/case | Ana why AI/case |
| 3 | Und why I | Und whatif I | App why AI/case | Ana diagnose AI/case multi | Eval whatif AI/case |
| 4 | App predict AI/case | App diagnose I | Ana diagnose AI/case | Eval whatif AI/case | Eval whatif I multi |

The slot tables are tested to add up exactly (`matrix v2 ... slot tables add up`). Authors may swap a kind or two between slots to fit the post, as long as the totals above hold.

## Choosing 40 or 20

Count how many of these are true for the post. Three or more: **40**. Fewer: **20**.

1. **Breadth:** about eight or more substantial sections, or more than 2,000 words of prose per language.
2. **Consequence:** the topic is risky or hard to get right (money, safety, data loss, many ways to be wrong).
3. **Dependency:** three or more other posts build on it.
4. **Several distinct things to judge:** multiple flows, decisions, failure cases or designs to compare.
5. **Work relevance:** the reader will act on it directly (debug, review, ship, operate).

A glossary, an introduction or a short overview post is normally 20. The choice is recorded in the plan for the series, not in the data.

## Scenario cards and facts (unchanged from the KMM proposal)

- 5-9 short lines in `context.text`; facts as `• ` bullets, never one block. Start from a real case or a believable working day built on one. Assumptions are said inside the sentence; no "illustrative" labels.
- A short **verbatim** code or log excerpt (`media: code`) when a question turns on it. A figure per set is optional.
- Every question is answerable from the card plus what the post teaches (independence).
- Facts come from the post. A *why* question has its reason in the post's text, or the explanation says it is a reading. A *whatif* question uses only the post's rules; if the right handling is a judgement, the explanation says so and names the rule it follows from.
- No filler tails on options; the correct option is not the longest; each wrong option names a misconception; long text goes in the card and the stem, not in the options.
- All v1 item-writing rules still apply (portfolio brief rules 1-18).

## Enforcement

- `src/data/quiz/matrix.ts`: the targets and slot tables. `src/data/quiz/domains.ts`: `QUIZ_MATRIX` opts a post in.
- `src/utils/quiz.test.ts`: for a v2 post checks 20 or 40 questions, levels, kinds and tracks to one either way, multi-select count, and that every question has a `kind`.
- `npm run check:quiz-mix [slug]`: prints level, track and kind counts and what is off target.

## Open point

The research favours three options. A question with only two plausible wrong ideas should not have to pad a fourth. Since 2026-11-27, `validateSet` takes an `allowThreeOptions` flag, set for posts that opt in through `QUIZ_MATRIX` (v2): a single-answer question there may have 3 or 4 options. v1 posts stay at 4, and multi questions stay at 5. No existing question was changed; use 3 options only when a real third wrong idea does not exist.
