// Types for the post quiz: case sets of multiple-choice questions, every string bilingual.
// Content lives in src/data/quiz/<post-slug>/set-NN.json and is checked by src/utils/quiz.test.ts.

export interface L10n { en: string; vi: string }

export type Level = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate';
/** `ai` = review or verify AI-written code (code posts only); `case` = judge a real situation (human-skill posts) */
export type Track = 'interview' | 'ai' | 'case';
/** `code`: the skill is writing or reviewing code, so AI-output questions fit. `human`: judgement skills (investing, UX), so they do not. */
export type QuizDomain = 'code' | 'human';
export type QType = 'single' | 'scenario' | 'diagram' | 'code-output' | 'ai-review' | 'ai-advice' | 'multi';

export type QuizMedia =
  /** `component` is a file name in src/components/quiz/figures, without the extension */
  | { kind: 'figure'; component: string; alt: L10n }
  | { kind: 'code'; lang: string; code: string; caption?: L10n };

export interface QuizOption { id: string; text: L10n }

export interface QuizQuestion {
  /** "s04q3": set 4, question 3 */
  id: string;
  level: Level;
  track: Track;
  type: QType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** the post section this question grows from */
  topic: string;
  stem: L10n;
  media?: QuizMedia[];
  /** ids "a".."d" (".."e" for multi) in authored order; the page shuffles them */
  options: QuizOption[];
  /** option ids: one, or two for type "multi" */
  answer: string[];
  explanation: {
    whyRight: L10n;
    /** one entry per wrong option id, naming the misconception behind it */
    whyWrong: Record<string, L10n>;
    /** anchor = a heading slug of the post (English) */
    reread: { anchor: string; label: L10n };
    /** a spoken line for interviews, or a review habit for questions about AI */
    say: L10n;
  };
  /** a post section name, or an external URL for anything the post does not say */
  ref: string;
  /** the command that was run and its output; required when the question computes something */
  verifiedBy?: string;
}

export interface QuizSet {
  /** "set-04" */
  id: string;
  title: L10n;
  context: { text: L10n; illustrative?: boolean; media?: QuizMedia[] };
  /** exactly 5, difficulty never decreasing */
  questions: QuizQuestion[];
}
