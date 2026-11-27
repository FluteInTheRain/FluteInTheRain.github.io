// Which kind of skill each quiz post teaches. This decides whether its quiz may carry
// "judge the AI's output" questions (track `ai`, types `ai-review` / `ai-advice`).
//
//   code   the reader writes or reviews code, often with AI help: AI-output questions fit.
//   human  the skill is human judgement (investing, UX/UI design, ...): no AI-output questions;
//          the second track is `case` (judge a real situation) instead.
//
// Every quiz folder in src/data/quiz must have an entry here; src/utils/quiz.test.ts fails otherwise.
// Rule decided with Khang on 2026-11-24, see docs/superpowers/specs/2026-11-24-quiz-ai-track-by-domain.md.

import type { QuizDomain } from './types';

export const QUIZ_DOMAIN: Record<string, QuizDomain> = {
  // Backend series (Python FastAPI): the reader writes and reviews service code
  'backend-http-request-lifecycle': 'code',
  'backend-rest-api-design': 'code',
  'backend-validation-schemas': 'code',
  'backend-layered-architecture': 'code',
  'backend-database-access-layer': 'code',
  'backend-async-concurrency-workers': 'code',
  'backend-auth-oauth2-jwt': 'code',
  'backend-caching-queues': 'code',
  'backend-testing-strategy': 'code',
  'backend-observability': 'code',
  'backend-performance-p99': 'code',
  'backend-production-deploy': 'code',
  // DDIA series
  'stream-processing-event-logs-cdc-windows-joins': 'code',
  'philosophy-of-streaming-systems-unbundling-end-to-end-correctness': 'code',
  'doing-the-right-thing-ethics-privacy-algorithmic-bias': 'code',
  'reliable-scalable-maintainable-data-systems': 'code',
  'trade-offs-in-data-systems-architecture': 'code',
  'data-models-and-query-languages': 'code',
  'storage-engines-logs-lsm-btree-columns': 'code',
  'encoding-and-schema-evolution': 'code',
  'replication-when-copies-disagree': 'code',
  'sharding-keys-ranges-hashes-hot-spots': 'code',
  'transactions-acid-isolation-anomalies-serializability': 'code',
  'trouble-with-distributed-systems-networks-clocks-fencing': 'code',
  'consistency-consensus-linearizability-logical-clocks-raft': 'code',
  'batch-processing-unix-pipes-shuffle-dataflow-lakehouse': 'code',
  // AI trading series: about building AI/data systems, so AI-output questions still fit
  'ai-trading-the-market': 'code',
  'ai-trading-data': 'code',
  'ai-trading-signals': 'code',
  // UI/UX series (Refactoring UI): design judgement, so no AI-output questions
  'design-before-you-prompt': 'human',
  'visual-hierarchy-rank-before-you-style': 'human',
  'spacing-is-a-system': 'human',
  'typography-is-a-scale-not-a-slider': 'human',
  'color-is-a-palette-not-a-picker': 'human',
  'depth-is-light-not-drop-shadow': 'human',
  'images-need-containers-not-hope': 'human',
  'finishing-touches-that-make-ui-feel-real': 'human',
  'leveling-up-your-design-eye': 'human',
  // Stocks basics series: investing judgement
  'what-is-a-stock-ownership-dividends': 'human',
  'vietnam-stock-market-venues-open-account': 'human',
  'vietnam-order-types-order-book-ato-atc': 'human',
  'stock-fees-taxes-settlement-t2-vsd': 'human',
  'shareholder-rights-dividends-corporate-actions': 'human',
  'reading-financial-statements-investors-5-minutes': 'human',
  'pe-pb-roe-valuation-ratios-in-context': 'human',
  'macro-industry-what-moves-stock-prices': 'human',
  'margin-trading-risks-beginner-psychology': 'human',
  'portfolio-dca-first-investment-plan': 'human',
};

// Which target mix a quiz follows. Absent = 'v1' (the original DDIA mix: 8 sets, Remember 3 / Understand 7 / Apply 14 / Analyze 9 / Evaluate 7).
// 'v2' = src/data/quiz/matrix.ts: 40 questions (8 sets) for big posts or 20 (4 sets) for light ones, every question tagged with a `kind`.
// New series use v2. Spec: docs/superpowers/specs/2026-11-26-quiz-matrix-v2.md
export const QUIZ_MATRIX: Record<string, 'v1' | 'v2'> = {
  'design-before-you-prompt': 'v2', // 20 questions
  'visual-hierarchy-rank-before-you-style': 'v2', // 40 questions
  'spacing-is-a-system': 'v2', // 40 questions
  'typography-is-a-scale-not-a-slider': 'v2', // 40 questions
  'color-is-a-palette-not-a-picker': 'v2', // 40 questions
  'depth-is-light-not-drop-shadow': 'v2', // 40 questions
  'images-need-containers-not-hope': 'v2', // 40 questions
  'finishing-touches-that-make-ui-feel-real': 'v2', // 20 questions
  'leveling-up-your-design-eye': 'v2', // 20 questions
  'what-is-a-stock-ownership-dividends': 'v2', // 40 questions
  'vietnam-stock-market-venues-open-account': 'v2', // 40 questions
  'vietnam-order-types-order-book-ato-atc': 'v2', // 40 questions
  'stock-fees-taxes-settlement-t2-vsd': 'v2', // 40 questions
  'shareholder-rights-dividends-corporate-actions': 'v2', // 40 questions
  'reading-financial-statements-investors-5-minutes': 'v2', // 40 questions
  'pe-pb-roe-valuation-ratios-in-context': 'v2', // 40 questions
  'macro-industry-what-moves-stock-prices': 'v2', // 40 questions
  'margin-trading-risks-beginner-psychology': 'v2', // 40 questions
  'portfolio-dca-first-investment-plan': 'v2', // 40 questions
};
