// Pure helpers for the post quiz: validation, ordering, shuffling, grading, progress storage.
// No DOM and no Astro imports, so `node --test src/utils/quiz.test.ts` can run them.

import Slugger from 'github-slugger';
import type { L10n, Level, QuizMedia, QuizQuestion, QuizSet } from '../data/quiz/types';

const LEVELS: Level[] = ['remember', 'understand', 'apply', 'analyze', 'evaluate'];
const TRACKS = ['interview', 'ai'];
const QTYPES = ['single', 'scenario', 'diagram', 'code-output', 'ai-review', 'ai-advice', 'multi'];

// ---- validation

const blank = (s: unknown) => typeof s !== 'string' || s.trim() === '';

/** every problem found in a set; [] when the set is valid. `postAnchors` = heading slugs of the post. */
export function validateSet(set: QuizSet, postAnchors: Set<string>): string[] {
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

/** English heading slugs of a post file: the ##/### lines before the first `</En>` */
export function englishAnchors(mdx: string): Set<string> {
  const lines = mdx.split('\n');
  const end = lines.findIndex((l) => l.startsWith('</En>'));
  const slugger = new Slugger();
  const out = new Set<string>();
  for (const l of lines.slice(0, end === -1 ? lines.length : end)) {
    const m = l.match(/^#{2,3} (.*)/);
    if (m) out.add(slugger.slug(m[1].replace(/<[^>]+>/g, '').trim()));
  }
  return out;
}

/**
 * English heading slug -> Vietnamese heading slug for one post file. The post holds an English block
 * (`</En>` ends it) and a Vietnamese block (`<Vi>` ... `</Vi>`) with the headings in the same order, so
 * the n-th English heading pairs with the n-th Vietnamese one.
 */
export function headingSlugPairs(mdx: string): Record<string, string> {
  const lines = mdx.split('\n');
  const enEnd = lines.findIndex((l) => l.startsWith('</En>'));
  const viStart = lines.findIndex((l) => l.startsWith('<Vi>'));
  const viEnd = lines.findIndex((l) => l.startsWith('</Vi>'));
  const take = (from: number, to: number) => {
    const slugger = new Slugger();
    const slugs: string[] = [];
    for (const l of lines.slice(from, to)) {
      const m = l.match(/^#{2,3} (.*)/);
      if (m) slugs.push(slugger.slug(m[1].replace(/<[^>]+>/g, '').trim()));
    }
    return slugs;
  };
  const en = take(0, enEnd === -1 ? lines.length : enEnd);
  const vi = take(viStart === -1 ? lines.length : viStart, viEnd === -1 ? lines.length : viEnd);
  const out: Record<string, string> = {};
  en.forEach((s, i) => { if (vi[i]) out[s] = vi[i]; });
  return out;
}
