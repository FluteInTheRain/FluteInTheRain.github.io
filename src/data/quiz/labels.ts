import type { L10n, Level, Track } from './types';

export const LEVEL_LABELS: Record<Level, L10n> = {
  remember: { en: 'Remember', vi: 'Nhớ' },
  understand: { en: 'Understand', vi: 'Hiểu' },
  apply: { en: 'Apply', vi: 'Vận dụng' },
  analyze: { en: 'Analyze', vi: 'Phân tích' },
  evaluate: { en: 'Evaluate', vi: 'Đánh giá' },
};

export const TRACK_LABELS: Record<Track, L10n> = {
  interview: { en: 'Interview-style', vi: 'Kiểu phỏng vấn' },
  ai: { en: 'Working with AI', vi: 'Làm việc với AI' },
};

export const LEVELS = Object.keys(LEVEL_LABELS) as Level[];
