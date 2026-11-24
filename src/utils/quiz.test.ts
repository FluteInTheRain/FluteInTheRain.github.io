import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateSet, orderSets, shuffleOptions, gradeAnswer, scoreByLevel,
  loadProgress, saveProgress, headingSlugPairs, englishAnchors, type Store,
} from './quiz.ts';
import type { QuizSet, QuizQuestion, Level, Track, QuizDomain } from '../data/quiz/types.ts';
import { QUIZ_DOMAIN } from '../data/quiz/domains.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');
const QUIZ_DIR = path.join(ROOT, 'src/data/quiz');
const read = (f: string) => JSON.parse(fs.readFileSync(f, 'utf8')) as QuizSet;
const fixture = () => read(path.join(QUIZ_DIR, '_fixtures/sample-case.json'));
const POST = 'reliable-scalable-maintainable-data-systems';

const postAnchors = (slug: string) => englishAnchors(fs.readFileSync(path.join(ROOT, 'src/content/blog', `${slug}.mdx`), 'utf8'));

const anchors = () => postAnchors(POST);
const clone = <T,>(x: T): T => structuredClone(x);
const problems = (s: QuizSet) => validateSet(s, anchors());
const has = (ps: string[], re: RegExp) => ps.some((p) => re.test(p));

// ---- gradeAnswer
test('gradeAnswer single', () => {
  assert.deepEqual(gradeAnswer({ answer: ['b'] }, ['b']), { correct: true, wrong: [], missed: [] });
  assert.deepEqual(gradeAnswer({ answer: ['b'] }, ['a']), { correct: false, wrong: ['a'], missed: ['b'] });
});

test('gradeAnswer multi needs an exact match', () => {
  const q = { answer: ['a', 'c'] };
  assert.deepEqual(gradeAnswer(q, ['a']), { correct: false, wrong: [], missed: ['c'] });
  assert.deepEqual(gradeAnswer(q, ['c', 'a']), { correct: true, wrong: [], missed: [] });
  assert.deepEqual(gradeAnswer(q, ['a', 'c', 'd']), { correct: false, wrong: ['d'], missed: [] });
  assert.deepEqual(gradeAnswer(q, ['a', 'd']), { correct: false, wrong: ['d'], missed: ['c'] });
  assert.equal(gradeAnswer(q, []).correct, false);
});

// ---- shuffleOptions
test('shuffleOptions is deterministic and keeps every option', () => {
  const opts = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
  const one = shuffleOptions(opts, 's01q1').map((o) => o.id);
  assert.deepEqual(one, shuffleOptions(opts, 's01q1').map((o) => o.id));
  assert.deepEqual([...one].sort(), ['a', 'b', 'c', 'd']);
});

test('shuffleOptions differs between questions', () => {
  const opts = ['a', 'b', 'c', 'd'].map((id) => ({ id }));
  const orders = new Set<string>();
  for (let i = 1; i <= 20; i++) orders.add(shuffleOptions(opts, `s0${i}q1`).map((o) => o.id).join(''));
  assert.ok(orders.size >= 3, `only ${orders.size} distinct orders`);
});

// ---- orderSets
test('orderSets sorts by mean difficulty, then id', () => {
  const mk = (id: string, d: number): QuizSet => {
    const s = fixture();
    s.id = id;
    s.questions.forEach((q) => { q.difficulty = d as QuizQuestion['difficulty']; });
    return s;
  };
  assert.deepEqual(orderSets([mk('set-03', 3), mk('set-02', 2), mk('set-01', 2)]).map((s) => s.id), ['set-01', 'set-02', 'set-03']);
});

// ---- scoreByLevel
test('scoreByLevel counts per level and keeps all five keys', () => {
  const r = scoreByLevel([
    { level: 'apply', correct: true }, { level: 'apply', correct: false }, { level: 'remember', correct: true },
  ]);
  assert.deepEqual(r.apply, { right: 1, total: 2 });
  assert.deepEqual(r.remember, { right: 1, total: 1 });
  assert.deepEqual(r.evaluate, { right: 0, total: 0 });
  assert.deepEqual(Object.keys(r).sort(), ['analyze', 'apply', 'evaluate', 'remember', 'understand']);
});

// ---- progress storage never throws
test('progress storage survives missing, throwing and corrupt storage', () => {
  assert.deepEqual(loadProgress(null, 'k'), {});
  const throwing: Store = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(loadProgress(throwing, 'k'), {});
  assert.doesNotThrow(() => saveProgress(throwing, 'k', { s01q1: ['a'] }));
  assert.doesNotThrow(() => saveProgress(null, 'k', {}));
  const mem = new Map<string, string>();
  const store: Store = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v) };
  mem.set('bad', '{not json');
  assert.deepEqual(loadProgress(store, 'bad'), {});
  mem.set('arr', '[1,2]');
  assert.deepEqual(loadProgress(store, 'arr'), {});
  saveProgress(store, 'ok', { s01q1: ['b'], s01q2: ['a', 'c'] });
  assert.deepEqual(loadProgress(store, 'ok'), { s01q1: ['b'], s01q2: ['a', 'c'] });
});

// ---- headingSlugPairs
test('headingSlugPairs maps English heading slugs to the Vietnamese ones by position', () => {
  const src = '## One\n### Two\n</En>\n<Vi>\n## Một\n### Hai\n</Vi>\n';
  assert.deepEqual(headingSlugPairs(src), { one: 'một', two: 'hai' });
});

test('headings are found in posts that alternate <En> and <Vi> blocks', () => {
  const src = '---\ntitle: x\n---\n<En>\n## One\n</En>\n<Vi>\n## Một\n</Vi>\n<En>\n### Two\n</En>\n<Vi>\n### Hai\n</Vi>\n';
  assert.deepEqual([...englishAnchors(src)].sort(), ['one', 'two']);
  assert.deepEqual(headingSlugPairs(src), { one: 'một', two: 'hai' });
});

test('a heading outside any language block counts for both languages', () => {
  const src = '## Shared\n<En>\n## Only en\n</En>\n<Vi>\n## Chỉ vi\n</Vi>\n';
  assert.deepEqual([...englishAnchors(src)].sort(), ['only-en', 'shared']);
});

test('headingSlugPairs on the real post covers every English anchor', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/content/blog', `${POST}.mdx`), 'utf8');
  const pairs = headingSlugPairs(src);
  for (const a of anchors()) assert.ok(pairs[a], `no Vietnamese slug for ${a}`);
});

// ---- validateSet
test('the sample case is valid', () => {
  assert.deepEqual(problems(fixture()), []);
});

test('validateSet reports each kind of problem', () => {
  const cases: [string, (s: QuizSet) => void, RegExp][] = [
    ['4 questions', (s) => { s.questions.pop(); }, /5 questions/],
    ['difficulty drops', (s) => { s.questions[2].difficulty = 1; }, /difficulty/],
    ['answer not in options', (s) => { s.questions[0].answer = ['z']; }, /answer/],
    ['missing whyWrong', (s) => { delete s.questions[0].explanation.whyWrong[Object.keys(s.questions[0].explanation.whyWrong)[0]]; }, /whyWrong/],
    ['empty vi', (s) => { s.questions[0].stem.vi = ' '; }, /empty/],
    ['multi with one answer', (s) => { s.questions[3].answer = [s.questions[3].answer[0]]; }, /multi/],
    ['single with two answers', (s) => { s.questions[0].answer = ['a', 'b']; }, /single|answer/],
    ['all of the above', (s) => { s.questions[0].options[0].text.en = 'All of the above'; }, /all\/none/],
    ['none of the above', (s) => { s.questions[0].options[1].text.en = 'None of the above'; }, /all\/none/],
    ['interviewer framing', (s) => { s.questions[4].stem.en = 'An interviewer asks: ' + s.questions[4].stem.en; }, /interviewer/],
    ['code-output without verifiedBy', (s) => { s.questions[2].type = 'code-output'; delete s.questions[2].verifiedBy; }, /verifiedBy/],
    ['unknown anchor', (s) => { s.questions[0].explanation.reread.anchor = 'no-such-heading'; }, /anchor/],
    ['bad question id', (s) => { s.questions[1].id = 's00q9'; }, /id/],
    ['wrong option count', (s) => { s.questions[0].options.pop(); }, /options/],
    ['letter reference in explanation', (s) => { s.questions[0].explanation.whyRight.en = '(a) is right because it names the idea.'; }, /letter/],
    ['letter reference in say line', (s) => { s.questions[1].explanation.say.vi = 'Chọn (b) vì nó đúng.'; }, /letter/],
    ['correct option much longer than the others', (s) => { const q = s.questions[0]; q.options.find((o) => o.id === q.answer[0])!.text.en = 'Fan-out is one action that spreads into many writes, one for each follower of the account'; }, /longer/],
    ['ref missing', (s) => { s.questions[0].ref = ''; }, /ref/],
    ['position bias', (s) => {
      for (const q of s.questions) if (q.type !== 'multi') {
        const right = q.answer[0];
        const i = q.options.findIndex((o) => o.id === right);
        const [o] = q.options.splice(i, 1);
        q.options.splice(1, 0, o);
        q.answer = [o.id];
      }
    }, /position/],
  ];
  for (const [name, mutate, re] of cases) {
    const s = clone(fixture());
    mutate(s);
    const ps = problems(s);
    assert.ok(has(ps, re), `${name}: expected ${re}, got ${JSON.stringify(ps)}`);
  }
});

test('position bias check looks at the order options are written in', () => {
  const s = clone(fixture());
  // make three single questions all authored with the right answer in position 2
  for (const q of s.questions.slice(0, 3)) {
    const right = q.answer[0];
    const i = q.options.findIndex((o) => o.id === right);
    const [o] = q.options.splice(i, 1);
    q.options.splice(1, 0, o);
  }
  assert.ok(has(problems(s), /position/));
});

// ---- domain rule: AI-output questions only in code posts
test('a human-skill quiz rejects the ai track, ai question types and AI wording', () => {
  const s = clone(fixture());
  s.questions[1].type = 'ai-review'; // the fixture has no ai-review question of its own
  const ps = validateSet(s, anchors(), 'human');
  assert.ok(has(ps, /track "ai" is for code posts/), JSON.stringify(ps));
  assert.ok(has(ps, /judges AI output/), JSON.stringify(ps));
});

test('a human-skill quiz is clean once questions use the case track and non-AI types', () => {
  const s = clone(fixture());
  for (const q of s.questions) {
    if (q.track === 'ai') q.track = 'case';
    if (q.type === 'ai-review' || q.type === 'ai-advice') q.type = 'scenario';
  }
  const ps = validateSet(s, anchors(), 'human').filter((p) => /track "ai"|judges AI output|code to run/.test(p));
  assert.deepEqual(ps, []);
});

test('a human-skill quiz rejects an option or stem that mentions AI', () => {
  const s = clone(fixture());
  for (const q of s.questions) { q.track = 'case'; q.type = 'scenario'; }
  s.questions[0].stem.en = 'An AI assistant says the dividend yield is 12%. What do you check first?';
  assert.ok(has(validateSet(s, anchors(), 'human'), /mentions AI/));
});

test('a human-skill quiz allows the Vietnamese word "ai" (who)', () => {
  const s = clone(fixture());
  for (const q of s.questions) { q.track = 'case'; q.type = 'scenario'; }
  s.questions[0].stem.en = 'Who receives more cash?';
  s.questions[0].stem.vi = 'Ai là người nhận được nhiều tiền mặt hơn?';
  for (const o of s.questions[0].options) { o.text.en = 'Minh'; o.text.vi = 'Minh'; }
  const id = s.questions[0].id;
  assert.ok(!validateSet(s, anchors(), 'human').some((p) => p.startsWith(`${id}:`) && /mentions AI/.test(p)));
});

test('a code quiz keeps the ai track and rejects the case track', () => {
  const s = clone(fixture());
  assert.ok(!has(validateSet(s, anchors(), 'code'), /track "ai"|track "case"/));
  s.questions[0].track = 'case';
  assert.ok(has(validateSet(s, anchors(), 'code'), /track "case" is for human-skill posts/));
});

// ---- content on disk
const contentDirs = fs.existsSync(QUIZ_DIR)
  ? fs.readdirSync(QUIZ_DIR, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name)
  : [];

const domainOf = (slug: string): QuizDomain => QUIZ_DOMAIN[slug];

test('every quiz folder declares its domain', () => {
  for (const slug of contentDirs) assert.ok(QUIZ_DOMAIN[slug], `${slug}: add it to src/data/quiz/domains.ts (code or human)`);
});

for (const slug of contentDirs) {
  const dir = path.join(QUIZ_DIR, slug);
  const files = fs.readdirSync(dir).filter((f) => /^set-\d\d\.json$/.test(f)).sort();

  test(`content ${slug}: every set is valid`, () => {
    const a = postAnchors(slug);
    for (const f of files) {
      const s = read(path.join(dir, f));
      assert.equal(`${s.id}.json`, f, `${f}: id does not match the file name`);
      assert.deepEqual(validateSet(s, a, domainOf(slug)), [], f);
    }
  });

  if (files.length === 8) {
    test(`content ${slug}: totals across the 8 sets`, () => {
      const qs = files.flatMap((f) => read(path.join(dir, f)).questions);
      const count = <K extends string>(get: (q: QuizQuestion) => K) => {
        const m: Record<string, number> = {};
        for (const q of qs) m[get(q)] = (m[get(q)] ?? 0) + 1;
        return m;
      };
      assert.equal(qs.length, 40);
      // the mix is a design target; one question either way in a group is fine
      const near = (got: Record<string, number>, want: Record<string, number>) => {
        for (const [k, w] of Object.entries(want)) assert.ok(Math.abs((got[k] ?? 0) - w) <= 1, `${k}: ${got[k] ?? 0} questions, target ${w}`);
      };
      near(count((q) => q.level as Level), { remember: 3, understand: 7, apply: 14, analyze: 9, evaluate: 7 });
      // code posts: 20 interview + 20 AI-output questions; human-skill posts: 20 interview + 20 real-case questions
      near(count((q) => q.track as Track), domainOf(slug) === 'human' ? { interview: 20, case: 20 } : { interview: 20, ai: 20 });
      assert.equal(qs.filter((q) => q.type === 'multi').length, 4);
      const multiSets = files.filter((f) => read(path.join(dir, f)).questions.some((q) => q.type === 'multi')).map((f) => f.slice(4, 6));
      assert.deepEqual(multiSets, ['04', '06', '07', '08']);
    });
  }
}
