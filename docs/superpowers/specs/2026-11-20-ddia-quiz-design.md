# DDIA post 1: review quiz (design)

Date: 2026-11-20. Status: draft for review. Scope: post 1 only
(`reliable-scalable-maintainable-data-systems`); repeat for the other posts after the format is settled.

## Goal

Help working engineers understand the post, apply it in real work, and answer it in interviews,
with a focus on situations that come up when AI writes or suggests the code.

## Decisions (from Khang, 2026-11-20)

| Topic | Decision |
|---|---|
| Feedback mode | Grade immediately after each answer, then show the explanation |
| Language | Bilingual EN/VI, same pattern as the posts (`En`/`Vi`) |
| Source | Written from the content of post 1 |
| Page | Separate page: `/blog/<slug>/quiz` |
| Audience | People who already work (not students) |
| Format | Every question is multiple choice. Multi-select is allowed |
| Order | Easy to hard, in one straight line (see "Ordering") |
| Emphasis | More Apply and Evaluate than Remember |

## Focus (Khang, 2026-11-20, second message)

> **Amended 2026-11-24:** the AI track below applies to code posts only. Human-skill posts (stocks, UX/UI) use a `case` track instead. See `2026-11-24-quiz-ai-track-by-domain.md`.

Every question serves one of two tracks. Each item carries `track: interview | ai`. **The two tracks
are mixed freely in the 1 to 40 order (Khang, 2026-11-20); the only ordering rule is that difficulty
never goes down.** The track is a small tag, not a section.

1. **Interview** (20 questions): what an interviewer is likely to ask about this material, and
   the follow-up that separates a strong answer from a memorized one.
2. **Working with AI** (20 questions): reviewing, questioning, verifying and prompting AI that writes
   or suggests code for these topics. Each one names what to check in the AI's output.

Every explanation still ends with an "interview" line, so the AI questions also train spoken answers.

### Blueprint (topics and counts)

| Track | Topic | Qs | Source behind it |
|---|---|---|---|
| Interview | Design a timeline feed: fan-out read vs write, the celebrity case, hybrid with a follower threshold, how to pick the threshold | 5 | Post section "Social timelines"; interview-prep guides call the celebrity case the most-tested follow-up |
| Interview | Why not the mean; which percentiles you monitor; SLO wording | 4 | Post section "Why averages hide tail latency" |
| Interview | The 100-calls arithmetic (1 − 0.99ⁿ) and why the slowest call decides | 3 | Post: Dean and Barroso table |
| Interview | Cutting the tail: hedged and tied requests, when they help and when they do not | 3 | Post: hedged requests, BigTable case |
| Interview | Fault vs failure, fault tolerance, hardware vs software vs human faults | 3 | Post section "Faults, failures and human error" |
| Interview | Canary, rollback, chaos engineering; "tell me about an outage" framing | 2 | Post: "Designing for human error" |
| AI | AI picks the mean (or p50) for an alert or a report | 3 | Post: percentiles |
| AI | AI recommends one global design (fan-out on write) from the average ratio | 3 | Post: skew and hybrid |
| AI | AI-written cache code: every key gets the same TTL, so they expire together (thundering herd); how to spot it in review | 2 | Post: "Software faults" (thundering herd) |
| AI | AI-written retry and timeout code: no backoff, no jitter, no cap, retrying every error, non-idempotent retries (retry storms feed cascading failure) | 3 | Grows out of the post's cascading failure and thundering herd; interview-prep and practitioner write-ups |
| AI | AI-written failover logic: all traffic moves to one replica when another dies (cascading failure); what to ask before accepting it | 1 | Post: "Software faults" (cascading failure) |
| AI | AI proposes hedging or "add more workers" for an overloaded system | 2 | Post: hedging works on random per-server delays |
| AI | AI ships a big-bang config or schema change: no canary, no rollback, breaks old readers | 2 | Post: canary, rollback, compatibility |
| AI | AI tests and AI numbers: happy-path tests only; invented figures; how to verify a claim by running code | 2 | Post: load parameters, percentiles |
| AI | AI adds layers and abstractions nobody asked for (accidental complexity); how to prompt with the load data and constraints | 2 | Post: maintainability |

Total 40. **Rule (Khang, 2026-11-20, final): questions grow out of post 1's topics, but do not have
to stay inside the post's text.** The post is the starting point, not the boundary. Two guards keep
this honest:
- Every question has a `topic` (the post section it grows from) and a `ref`: either a place in the
  post, or an external source for anything the post does not say (a paper, official docs, or a runnable
  snippet whose output was checked).
- Content beyond the post is limited to well-established practice (for example retry with backoff and
  jitter, idempotency). Anything contested or only from blogs is left out or marked "common practice".
- Where a question depends on an idea the post never explains, the explanation teaches it in two lines,
  so the quiz does not feel like a trap.

### Sources behind the blueprint (web research, 2026-11-20)

Interview-prep blogs and course notes (not primary sources) agree that the celebrity follow-up is the
most tested; typical follow-ups are the threshold, back-pressure on the fan-out queue, and storing IDs
so edits and deletes work. For retries, senior-level answers name several
parts together: retry only transient errors, idempotency, backoff with jitter, a maximum attempt
budget, and one layer owning the retries. For AI-written code, practitioner write-ups repeat the same
list of production mistakes (retries without backoff or jitter, missing timeouts, retrying
non-retryable errors, happy-path tests). The specific incident figures in those write-ups are
unverified and are not used.

## Level mix (40 questions, revised Bloom)

| Level | Count | What it checks |
|---|---|---|
| Remember | 3 | Terms: percentile, fan-out, fault vs failure, canary |
| Understand | 7 | Why the mean misleads, why p99 matters, why skew breaks one-size designs |
| Apply | 14 | Compute, read numbers, predict code output, pick a tool for a case |
| Analyze | 9 | Find the cause in an incident, read a diagram, spot the flaw in code |
| Evaluate | 7 | Judge a design or an AI suggestion, pick the best decision and defend it |

"Create" is not scored by multiple choice. It is folded into Evaluate ("choose the best design").

## Question types (all multiple choice)

1. Single best answer (Remember, Understand)
2. Short scenario: an incident or request, ask the cause or the first thing to do
3. Read a diagram or numbers (figure drawn on the page with site tokens, not an infographic image)
4. Predict code output (short script, answer can be checked by running it)
5. Find the flaw in AI-written code (wrong metric, unbounded retry, invented API)
6. Judge an AI suggestion (the AI's advice is half right; pick the most accurate verdict)
7. Interview question: pick the strongest answer
8. Multi-select: tick all that apply (used sparingly, mostly Analyze and Evaluate)

## Ordering

Questions are numbered 1 to 40 and sorted by difficulty, not by topic. Difficulty is the
author's rating `difficulty: 1..5`, set by: Bloom level, number of steps to reach the answer,
and whether a calculation or code reading is needed. Ties are broken by post section order.
Level and topic are shown as small tags so a reader can still filter. This is a plan to
validate: if the first readers find it jumpy, add a "by topic" order.

## Item-writing rules (from the research)

- One objective per question. Short stem. No extra facts.
- One correct or clearly best answer. State "choose the best answer" when it is a judgment.
- Distractors come from real misconceptions and are the same length and tone as the answer.
- No "all of the above". Avoid "none of the above". Avoid negatives ("NOT"). Trick questions are out.
- Shuffle the position of the correct answer. No pattern.

## Data shape (one file per post)

`src/data/quiz/<post-slug>.json`, an array of items:

```
id            "q01"
difficulty    1..5
level         remember | understand | apply | analyze | evaluate
type          single | scenario | diagram | code-output | ai-review | ai-advice | interview | multi
topic         slug of a post section (for "read again")
stem          { en, vi }
media         optional: { kind: "svg-component" | "code", ... }
options       [ { id, en, vi } ... ]          // 4 options, 5 for multi
answer        ["b"]                           // one id, or several for multi
explanation   {
  why_right   { en, vi },
  why_wrong   { a: { en, vi }, ... },         // names the misconception behind each distractor
  reread      "#anchor in the post",
  ref         post section, or external source URL for anything beyond the post,
  interview   { en, vi }                      // one line: how to say it in an interview
}
```

## Screen behavior

One question at a time. Pick an answer, it is graded at once, the explanation opens, then "Next".
Progress bar, level and topic tags, final score with a breakdown by level, answers kept in
`localStorage` (wrapped in try/catch; the page works without it), and a "retry wrong ones" button.

## Out of scope for now

Other posts, a question-bank backend, accounts, timers, and any image hosted outside the repo.

## Case sets (final structure; supersedes "Ordering" and "Data shape" above where they differ)

Decided with Khang, 2026-11-20. The quiz is about **8 case sets x 5 questions = 40**, not 40 loose
questions. A case set is one scenario (text, diagram, code or log) followed by several questions about it,
rising in difficulty. Interview and AI questions mix freely inside a set.

- **Inside a set**: difficulty rises 1 to 5 (Remember, Understand, Apply, Analyze, Evaluate is the usual path).
- **Between sets**: sorted by the set's average difficulty, easy sets first. Difficulty therefore is a
  sawtooth across the 40, with a rising trend. Splitting sets into rounds is rejected: it breaks the story.
- **Independence rule**: no stem may contain or imply the answer to another question in the same set,
  and every question must be answerable from the scenario alone. A wrong answer on Q1 must not make Q2
  unanswerable. Checked by reading each stem with the others hidden.
- **Calculation questions**: always state every formula the reader needs, inside the question. They test
  whether the reader can apply the formulas, not whether they remember them (Khang, 2026-11-20).
- **Numbers**: figures invented for a scenario are labelled "illustrative" and never presented as measured.
  Every computed answer is verified by running code.
- **Screen**: the scenario stays pinned (top or left) while questions appear one at a time and are
  graded immediately. Score shows per set and in total.
- **Data shape**: `src/data/quiz/<post-slug>.json` becomes an array of sets:
  `{ id, title {en,vi}, context {en, vi, media[]}, questions[] }`. Each question keeps the fields listed
  under "Data shape" (level, track, type, difficulty, stem, options, answer, explanation, ref).

## The 8 case sets (draft list, 2026-11-20)

The sample case ("The 30-million-write post") is a format example only and is not one of the 8.
Sets are sorted by average difficulty. Level path per set, with track in brackets (I = interview-style,
AI = working with AI). Totals checked: Remember 3, Understand 7, Apply 14, Analyze 9, Evaluate 7;
interview-style 20, AI 20; multi-select 4.

| # | Set | Scenario and medium | Topics (post sections) | Beyond the post |
|---|---|---|---|---|
| 1 | The green dashboard | Dashboard tile plus latency histogram | Mean vs percentiles, p50/p99/p99.9, SLO; Amazon's VIP-cart tail | none |
| 2 | Disk in rack 14 | Datacenter incident note | Fault vs failure, MTBF, redundancy, hardware vs software faults | none |
| 3 | A page that calls 100 services | Diagram of one page calling many backends, with a table | Tail amplification (1 − 0.99ⁿ), per-service target for a page-level target | none |
| 4 | The feed that melted the database | Query plan and load chart | Fan-out on read, JOIN cost, read/write ratio, load parameters, skew | none |
| 5 | The code nobody dares touch | Code and dependency sketch | Operability, essential vs accidental complexity, abstraction, evolvability, compatibility | schema compatibility examples |
| 6 | Friday config push | Rollout timeline chart | Human error, canary 1/10/100%, automatic rollback, chaos engineering | rollout gate metrics |
| 7 | One slow server in a hundred | Request-timeline diagram and latency table | Hedged and tied requests, the BigTable result, when hedging helps or hurts | load shedding basics |
| 8 | The second replica died too | Traffic-shift diagram and a code snippet | Cascading failure, thundering herd, retry storms | retry, backoff, jitter, idempotency |

| # | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|
| 1 | Remember (I) | Understand (AI) | Understand (I) | Apply (AI) | Analyze (I) |
| 2 | Remember (I) | Understand (I) | Apply (AI) | Apply (I) | Analyze (AI) |
| 3 | Understand (I) | Apply (AI) | Apply (I) | Analyze (AI) | Evaluate (I) |
| 4 | Understand (AI) | Apply (I) | Apply (I) | Analyze (AI, multi) | Evaluate (AI) |
| 5 | Remember (I) | Understand (AI) | Apply (AI) | Analyze (I) | Evaluate (AI) |
| 6 | Understand (I) | Apply (AI) | Apply (AI) | Analyze (I, multi) | Evaluate (AI) |
| 7 | Apply (I) | Apply (AI) | Analyze (I) | Analyze (AI, multi) | Evaluate (I) |
| 8 | Apply (AI) | Apply (I) | Analyze (AI, multi) | Evaluate (I) | Evaluate (AI) |

## Open points

- Whether the multi-select count (planned: about 4) feels right.
- Whether the straight easy-to-hard order should get a "by topic" switch.
- Where the entry link goes: `SeriesBar`, end of post, or both.
