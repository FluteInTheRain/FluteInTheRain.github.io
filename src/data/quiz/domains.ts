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
  // Stocks basics series: investing judgement
  'what-is-a-stock-ownership-dividends': 'human',
};
