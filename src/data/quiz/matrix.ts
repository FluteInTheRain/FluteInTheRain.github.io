// Quiz matrix v2: target mix for NEW quiz posts (older posts stay on v1, see QUIZ_MATRIX in domains.ts).
// Two sizes: 40 questions (8 sets x 5) for big or important posts, 20 (4 sets x 5) for light, basic ones.
// Design and the evidence behind it: docs/superpowers/specs/2026-11-26-quiz-matrix-v2.md (or docs/quiz-design.md in kmm-study).
//
// level = how deep the thinking is; kind = what the question is for; the two are independent axes.
// Levels and tracks are checked (one question either way); kinds are checked at the kind total (one either way);
// the slot tables below are the recommended assignment, not enforced cell by cell.

import type { QKind, Level } from './types';

export type SlotTrack = 'interview' | 'second'; // `second` = ai in a code post, case in a human-skill post
export interface Slot { level: Level; kind: QKind; track: SlotTrack; multi?: boolean }
export interface MatrixV2 {
  sets: number;
  levels: Record<Level, number>;
  kinds: Record<QKind, number>;
  /** questions per track: interview and the second track are equal */
  perTrack: number;
  multi: number;
  slots: Slot[][];
}

const s = (level: Level, kind: QKind, track: SlotTrack, multi = false): Slot => (multi ? { level, kind, track, multi } : { level, kind, track });
const R = 'remember', U = 'understand', A = 'apply', N = 'analyze', E = 'evaluate';
const I = 'interview', X = 'second';

export const MATRIX_V2: Record<20 | 40, MatrixV2> = {
  40: {
    sets: 8,
    levels: { remember: 5, understand: 8, apply: 12, analyze: 9, evaluate: 6 },
    kinds: { basic: 7, why: 10, predict: 7, diagnose: 9, whatif: 7 },
    perTrack: 20,
    multi: 4,
    slots: [
      [s(R, 'basic', I), s(R, 'basic', I), s(U, 'why', I), s(A, 'predict', X), s(N, 'diagnose', X)],
      [s(R, 'basic', I), s(U, 'basic', I), s(U, 'why', X), s(A, 'predict', I), s(N, 'diagnose', X)],
      [s(R, 'basic', I), s(U, 'why', I), s(A, 'predict', I), s(A, 'diagnose', X), s(N, 'why', X)],
      [s(R, 'basic', I), s(U, 'whatif', I), s(A, 'predict', X), s(N, 'diagnose', X, true), s(E, 'whatif', X)],
      [s(U, 'basic', I), s(U, 'why', I), s(A, 'diagnose', X), s(N, 'why', X), s(E, 'whatif', X)],
      [s(U, 'whatif', I), s(A, 'predict', X), s(A, 'diagnose', I), s(N, 'diagnose', X, true), s(E, 'whatif', X)],
      [s(A, 'why', I), s(A, 'predict', X), s(N, 'predict', I), s(N, 'diagnose', X, true), s(E, 'why', I)],
      [s(A, 'why', I), s(A, 'diagnose', X), s(N, 'why', X), s(E, 'whatif', X), s(E, 'whatif', I, true)],
    ],
  },
  20: {
    sets: 4,
    levels: { remember: 3, understand: 4, apply: 6, analyze: 4, evaluate: 3 },
    kinds: { basic: 4, why: 4, predict: 3, diagnose: 5, whatif: 4 },
    perTrack: 10,
    multi: 2,
    slots: [
      [s(R, 'basic', I), s(R, 'basic', I), s(U, 'why', I), s(A, 'predict', X), s(N, 'diagnose', X)],
      [s(R, 'basic', I), s(U, 'basic', I), s(A, 'predict', I), s(A, 'diagnose', X), s(N, 'why', X)],
      [s(U, 'why', I), s(U, 'whatif', I), s(A, 'why', X), s(N, 'diagnose', X, true), s(E, 'whatif', X)],
      [s(A, 'predict', X), s(A, 'diagnose', I), s(N, 'diagnose', X), s(E, 'whatif', X), s(E, 'whatif', I, true)],
    ],
  },
};

/** which question types fit a slot: ai-review finds a flaw in AI work, ai-advice judges an AI's recommendation */
export function typeHint(slot: Slot, domain: 'code' | 'human' = 'code'): string {
  if (slot.multi) return 'multi';
  if (slot.track === 'interview') return slot.kind === 'basic' ? 'single' : 'single | scenario';
  if (domain === 'human') return 'single | scenario | diagram';
  return slot.kind === 'predict' || slot.kind === 'diagnose' ? 'ai-review' : 'ai-advice';
}
