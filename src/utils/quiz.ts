// Pure helpers for the post quiz: validation, ordering, shuffling, grading, progress storage.
// No DOM and no Astro imports, so `node --test src/utils/quiz.test.ts` can run them.

import Slugger from 'github-slugger';
import type { L10n, Level, QuizDomain, QuizMedia, QuizQuestion, QuizSet } from '../data/quiz/types';

const LEVELS: Level[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate'];
const TRACKS = ['interview', 'ai', 'case'];
const QTYPES = ['single', 'scenario', 'diagram', 'code-output', 'ai-review', 'ai-advice', 'multi'];

// ---- validation

const blank = (s: unknown) => typeof s !== 'string' || s.trim() === '';

/** question types and tracks that only make sense when the reader writes or reviews code with AI */
const AI_TYPES = ['ai-review', 'ai-advice'];
const AI_WORDS = /\b(AI|A\.I\.|LLM|ChatGPT|GPT|Claude|Copilot|Gemini|Cursor|chatbot)\b|trí tuệ nhân tạo/i;

/**
 * every problem found in a set; [] when the set is valid. `postAnchors` = heading slugs of the post.
 * `domain` says what the post teaches: in a `human` post (investing, UX, ...) a question must not ask the reader
 * to judge AI output, and the second track is `case` instead of `ai`.
 */
export function validateSet(set: QuizSet, postAnchors: Set<string>, domain: QuizDomain = 'code'): string[] {
  const out: string[] = [];
  const add = (m: string) => out.push(m);

  const l10n = (where: string, v: L10n | undefined) => {
    if (!v || blank(v.en) || blank(v.vi)) add(`empty en/vi text at ${where}`);
  };

  const media = (where: string, list: QuizMedia[] | undefined) => {
    list?.forEach((m, i) => {
      if (m.kind === 'figure') {
        if (blank(m.component)) add(`empty figure component at ${where}.media[${i}]`);
        l10n(`${where}.media[${i}].alt`, m.alt);
      } else {
        if (blank(m.code) || blank(m.lang)) add(`empty code or lang at ${where}.media[${i}]`);
      }
    });
  };

  const setNo = /^set-(\d\d)$/.exec(set.id)?.[1];
  if (!setNo) add(`set id "${set.id}" should look like set-04`);
  l10n(`${set.id}.title`, set.title);
  l10n(`${set.id}.context.text`, set.context?.text);
  media(`${set.id}.context`, set.context?.media);

  if (set.questions.length !== 5) add(`${set.id}: expected 5 questions, found ${set.questions.length}`);

  let prev = 0;
  const answerPositions: number[] = [];

  set.questions.forEach((q: QuizQuestion, i) => {
    const w = q.id;
    const expectId = `s${setNo ?? 'XX'}q${i + 1}`;
    if (q.id !== expectId) add(`${w}: id should be ${expectId}`);

    if (!LEVELS.includes(q.level)) add(`${w}: unknown level "${q.level}"`);
    if (!TRACKS.includes(q.track)) add(`${w}: unknown track "${q.track}"`);
    if (!QTYPES.includes(q.type)) add(`${w}: unknown type "${q.type}"`);
    if (domain === 'human') {
      if (q.track === 'ai') add(`${w}: track "ai" is for code posts; use "case" (judge a real situation) in a human-skill post`);
      if (AI_TYPES.includes(q.type)) add(`${w}: type "${q.type}" judges AI output, which does not fit a human-skill post; use single, scenario, diagram or multi`);
      if (q.type === 'code-output') add(`${w}: a human-skill post has no code to run; use another type`);
      const text = [q.stem?.en, q.stem?.vi, ...q.options.flatMap((o) => [o.text?.en, o.text?.vi])].join(' ');
      if (AI_WORDS.test(text)) add(`${w}: the stem or an option mentions AI; a human-skill quiz asks about the skill, not about AI output`);
    } else if (q.track === 'case') {
      add(`${w}: track "case" is for human-skill posts; a code post uses "interview" or "ai"`);
    }
    if (![1, 2, 3, 4, 5].includes(q.difficulty)) add(`${w}: difficulty must be 1 to 5`);
    if (q.difficulty < prev) add(`${w}: difficulty ${q.difficulty} is lower than the question before (${prev})`);
    prev = Math.max(prev, q.difficulty);
    if (blank(q.topic)) add(`${w}: empty topic`);
    if (blank(q.ref)) add(`${w}: ref is empty (a post section, or a URL for anything beyond the post)`);

    l10n(`${w}.stem`, q.stem);
    media(w, q.media);

    const isMulti = q.type === 'multi';
    const wantOptions = isMulti ? 5 : 4;
    if (q.options.length !== wantOptions) add(`${w}: options should number ${wantOptions}, found ${q.options.length}`);
    const ids = q.options.map((o) => o.id);
    const wantIds = 'abcde'.slice(0, q.options.length).split('');
    if (ids.join('') !== wantIds.join('')) add(`${w}: option ids should be ${wantIds.join(',')} in order`);

    q.options.forEach((o) => {
      l10n(`${w}.option.${o.id}`, o.text);
      const text = `${o.text?.en ?? ''} | ${o.text?.vi ?? ''}`;
      if (/\b(all|none) of the above\b/i.test(text) || /tất cả (các )?(đáp án|phương án) trên|không (đáp án|phương án) nào/i.test(text)) {
        add(`${w}: option ${o.id} uses all/none of the above`);
      }
    });

    if (isMulti && q.answer.length !== 2) add(`${w}: a multi question must have exactly two answers`);
    if (!isMulti && q.answer.length !== 1) add(`${w}: a single-answer question must have exactly one answer`);
    for (const a of q.answer) if (!ids.includes(a)) add(`${w}: answer ${a} is not an option`);
    if (new Set(q.answer).size !== q.answer.length) add(`${w}: answer repeats an option`);

    const wrong = ids.filter((id) => !q.answer.includes(id));
    for (const id of wrong) l10n(`${w}.whyWrong.${id}`, q.explanation?.whyWrong?.[id]);
    for (const id of wrong) if (!q.explanation?.whyWrong?.[id]) add(`${w}: whyWrong missing for option ${id}`);
    for (const k of Object.keys(q.explanation?.whyWrong ?? {})) {
      if (!wrong.includes(k)) add(`${w}: whyWrong has an entry for ${k}, which is not a wrong option`);
    }
    l10n(`${w}.whyRight`, q.explanation?.whyRight);
    l10n(`${w}.say`, q.explanation?.say);
    l10n(`${w}.reread.label`, q.explanation?.reread?.label);
    const anchor = q.explanation?.reread?.anchor;
    if (!anchor || !postAnchors.has(anchor)) add(`${w}: reread anchor "${anchor}" is not a heading of the post`);

    // options are shuffled on the page, so "(a)" in an explanation would point at the wrong option
    const prose = [q.explanation?.whyRight, q.explanation?.say, ...Object.values(q.explanation?.whyWrong ?? {})];
    for (const t of prose) {
      if (/\((?:[a-e])\)|\boption [a-e]\b/i.test(`${t?.en ?? ''} ${t?.vi ?? ''}`)) {
        add(`${w}: an explanation refers to an option by letter; quote the option text instead`);
        break;
      }
    }

    if (/interviewer/i.test(q.stem?.en ?? '') || /người phỏng vấn/i.test(q.stem?.vi ?? '')) {
      add(`${w}: stem uses interviewer framing; ask the question directly`);
    }
    if (q.type === 'code-output' && blank(q.verifiedBy)) add(`${w}: a code-output question needs verifiedBy`);

    // the longest option should not be the right one by a visible margin: readers learn to pick it
    if (!isMulti) {
      const len = (id: string) => q.options.find((o) => o.id === id)?.text?.en?.length ?? 0;
      const longestOther = Math.max(0, ...q.options.filter((o) => o.id !== q.answer[0]).map((o) => o.text?.en?.length ?? 0));
      if (len(q.answer[0]) - longestOther > 10) add(`${w}: the correct option is ${len(q.answer[0]) - longestOther} characters longer than every other option; shorten it or lengthen the others`);
    }

    const pos = q.options.findIndex((o) => o.id === q.answer[0]);
    if (pos >= 0) answerPositions.push(pos);
  });

  const counts = new Map<number, number>();
  for (const p of answerPositions) counts.set(p, (counts.get(p) ?? 0) + 1);
  for (const [p, n] of counts) {
    if (n * 2 > set.questions.length) add(`${set.id}: ${n} of ${set.questions.length} answers sit at authored position ${p + 1}`);
  }
  return out;
}

// ---- ordering and shuffling

const meanDifficulty = (s: QuizSet) => s.questions.reduce((n, q) => n + q.difficulty, 0) / Math.max(1, s.questions.length);

/** easy sets first: by mean difficulty, then by id */
export function orderSets(sets: QuizSet[]): QuizSet[] {
  return [...sets].sort((a, b) => meanDifficulty(a) - meanDifficulty(b) || a.id.localeCompare(b.id));
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** same seed, same order; keeps every option */
export function shuffleOptions<T extends { id: string }>(options: T[], seed: string): T[] {
  const out = [...options];
  const rand = mulberry32(hash(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---- grading

export function gradeAnswer(q: Pick<QuizQuestion, 'answer'>, chosen: string[]): { correct: boolean; wrong: string[]; missed: string[] } {
  const picked = [...new Set(chosen)];
  const wrong = picked.filter((c) => !q.answer.includes(c));
  const missed = q.answer.filter((a) => !picked.includes(a));
  return { correct: wrong.length === 0 && missed.length === 0, wrong, missed };
}

export function scoreByLevel(results: { level: Level; correct: boolean }[]): Record<Level, { right: number; total: number }> {
  const out = Object.fromEntries(LEVELS.map((l) => [l, { right: 0, total: 0 }])) as Record<Level, { right: number; total: number }>;
  for (const r of results) {
    out[r.level].total += 1;
    if (r.correct) out[r.level].right += 1;
  }
  return out;
}

// ---- progress in localStorage (a convenience only: never throws)

export interface Store { getItem(k: string): string | null; setItem(k: string, v: string): void }

export function loadProgress(store: Store | null, key: string): Record<string, string[]> {
  try {
    const raw = store?.getItem(key);
    if (!raw) return {};
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    const out: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v) && v.every((x) => typeof x === 'string')) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveProgress(store: Store | null, key: string, p: Record<string, string[]>): void {
  try {
    store?.setItem(key, JSON.stringify(p));
  } catch {
    // storage blocked or full: the quiz still works, progress just is not kept
  }
}

// ---- post headings

/**
 * Heading slugs of a post file, split by language. A post holds <En> ... </En> and <Vi> ... </Vi> blocks, one
 * pair or many pairs alternating; a line starting with `<En>` or `<Vi>` switches language until the matching
 * closing line. Text before the first block counts as English (that is how a post with one big English block
 * reads), and a heading outside any block belongs to both languages. One slugger runs over the whole file in
 * order, the way the site's heading ids are made, so repeated headings get the same `-1` suffixes.
 */
function headingSlugs(mdx: string): { en: string[]; vi: string[] } {
  const slugger = new Slugger();
  const en: string[] = [];
  const vi: string[] = [];
  let lang: 'en' | 'vi' | 'both' = 'en';
  for (const l of mdx.split('\n')) {
    if (l.startsWith('<En>')) lang = 'en';
    else if (l.startsWith('<Vi>')) lang = 'vi';
    else if (l.startsWith('</En>') || l.startsWith('</Vi>')) lang = 'both';
    const m = l.match(/^#{2,3} (.*)/);
    if (!m) continue;
    const slug = slugger.slug(m[1].replace(/<[^>]+>/g, '').trim());
    if (lang !== 'vi') en.push(slug);
    if (lang !== 'en') vi.push(slug);
  }
  return { en, vi };
}

/** English heading slugs of a post file */
export function englishAnchors(mdx: string): Set<string> {
  return new Set(headingSlugs(mdx).en);
}

/** English heading slug -> Vietnamese heading slug: the n-th English heading pairs with the n-th Vietnamese one */
export function headingSlugPairs(mdx: string): Record<string, string> {
  const { en, vi } = headingSlugs(mdx);
  const out: Record<string, string> = {};
  en.forEach((slug, i) => { if (vi[i]) out[slug] = vi[i]; });
  return out;
}
