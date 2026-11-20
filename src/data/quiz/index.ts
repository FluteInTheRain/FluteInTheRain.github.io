// Loads the quiz content of a post: src/data/quiz/<post-slug>/set-NN.json, ordered easy to hard.

import type { QuizSet } from './types';
import { orderSets } from '../../utils/quiz';

const files = import.meta.glob<QuizSet>('./*/set-*.json', { eager: true, import: 'default' });

export function loadQuizSets(slug: string): QuizSet[] {
  const sets = Object.entries(files)
    .filter(([path]) => path.startsWith(`./${slug}/`))
    .map(([, set]) => set);
  return orderSets(sets);
}

export function hasQuiz(slug: string): boolean {
  return loadQuizSets(slug).length > 0;
}

export function questionCount(sets: QuizSet[]): number {
  return sets.reduce((n, s) => n + s.questions.length, 0);
}
