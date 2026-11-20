// Loads the quiz content of a post: src/data/quiz/<post-slug>/set-NN.json, ordered easy to hard.

import type { QuizSet } from './types';
import { orderSets } from '../../utils/quiz';
import sampleCase from './_fixtures/sample-case.json';

const files = import.meta.glob<QuizSet>('./*/set-*.json', { eager: true, import: 'default' });

// While the real sets are being written, `astro dev` shows the sample case on this one post so the page
// can be tried in a browser. A production build never uses it. Delete these two lines once all 8 sets exist.
const DEV_PREVIEW_SLUG = 'reliable-scalable-maintainable-data-systems';
const DEV_PREVIEW = import.meta.env.DEV ? [sampleCase as unknown as QuizSet] : [];

export function loadQuizSets(slug: string): QuizSet[] {
  const sets = Object.entries(files)
    .filter(([path]) => path.startsWith(`./${slug}/`))
    .map(([, set]) => set);
  if (sets.length === 0 && slug === DEV_PREVIEW_SLUG) return DEV_PREVIEW;
  return orderSets(sets);
}

export function hasQuiz(slug: string): boolean {
  return loadQuizSets(slug).length > 0;
}

export function questionCount(sets: QuizSet[]): number {
  return sets.reduce((n, s) => n + s.questions.length, 0);
}
