import type { L10n, Level } from './types';

export const LEVEL_LABELS: Record<Level, L10n> = {
  remember: { en: 'Remember', vi: 'Nhớ' },
  understand: { en: 'Understand', vi: 'Hiểu' },
  apply: { en: 'Apply', vi: 'Vận dụng' },
  analyze: { en: 'Analyze', vi: 'Phân tích' },
  evaluate: { en: 'Evaluate', vi: 'Đánh giá' },
};

export const LEVELS = Object.keys(LEVEL_LABELS) as Level[];
