import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildIndexLayout, shortTitle, normalizeSearch, formatHours } from './blog-index.ts';

const p = (id: string, iso: string, category: string, featured = false) => ({ id, date: new Date(iso), category, featured });
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

test('featured is newest when none flagged', () => {
  const l = buildIndexLayout([p('b', '2026-11-18', 'x'), p('a', '2026-11-19', 'x'), p('c', '2026-11-17', 'x')], []);
  assert.equal(l.featured?.id, 'a');
});

test('featured flag wins, newest flagged if several', () => {
  const l = buildIndexLayout(
    [p('a', '2026-11-19', 'x'), p('b', '2026-11-18', 'x', true), p('c', '2026-11-17', 'x', true)],
    [],
  );
  assert.equal(l.featured?.id, 'b');
});

test('alsoNew is next 3 newest excluding featured', () => {
  const posts = ['a', 'b', 'c', 'd', 'e', 'f'].map((id, i) => p(id, `2026-11-${20 - i}`, 'x'));
  const l = buildIndexLayout(posts, []);
  assert.deepEqual(ids(l.alsoNew), ['b', 'c', 'd']);
});

test('alsoNew skips a flagged featured that is not newest', () => {
  const posts = ['a', 'b', 'c', 'd', 'e'].map((id, i) => p(id, `2026-11-${20 - i}`, 'x', id === 'c'));
  const l = buildIndexLayout(posts, []);
  assert.equal(l.featured?.id, 'c');
  assert.deepEqual(ids(l.alsoNew), ['a', 'b', 'd']);
});

test('topics skip categories under 3 posts and follow categoryOrder', () => {
  const posts = [
    p('f1', '2026-01-01', 'frontend'),
    ...['u1', 'u2', 'u3', 'u4'].map((id, i) => p(id, `2026-02-0${i + 1}`, 'ui-ux')),
    ...['d1', 'd2', 'd3'].map((id, i) => p(id, `2026-03-0${i + 1}`, 'database')),
  ];
  const l = buildIndexLayout(posts, ['frontend', 'database', 'ui-ux']);
  assert.deepEqual(l.topics.map((t) => t.category), ['database', 'ui-ux']);
});

test('topic posts avoid featured and alsoNew, topped up when short', () => {
  // d3 is featured, d2 is in alsoNew (with two fillers); d1 is the only unshown one
  const posts = [
    p('d3', '2026-11-19', 'database'),
    p('d2', '2026-11-18', 'database'),
    p('o1', '2026-11-17', 'other'),
    p('o2', '2026-11-16', 'other'),
    p('d1', '2026-11-01', 'database'),
  ];
  const l = buildIndexLayout(posts, ['database']);
  assert.equal(l.featured?.id, 'd3');
  const t = l.topics[0];
  assert.equal(t.posts.length, 3);
  assert.deepEqual(ids(t.posts), ['d1', 'd3', 'd2']);
});

test('topic prefers unshown posts', () => {
  const posts = [
    ...['a', 'b', 'c', 'd'].map((id, i) => p(id, `2026-11-${20 - i}`, 'other')),
    ...['u1', 'u2', 'u3', 'u4'].map((id, i) => p(id, `2026-10-${20 - i}`, 'ui')),
  ];
  const l = buildIndexLayout(posts, ['ui']);
  assert.deepEqual(ids(l.topics[0].posts), ['u1', 'u2', 'u3']);
});

test('topic total counts all published posts of the category', () => {
  const posts = ['a', 'b', 'c', 'd', 'e'].map((id, i) => p(id, `2026-11-${20 - i}`, 'db'));
  assert.equal(buildIndexLayout(posts, ['db']).topics[0].total, 5);
});

test('archive holds every post newest first', () => {
  const l = buildIndexLayout([p('b', '2026-11-18', 'x'), p('a', '2026-11-19', 'x'), p('c', '2026-11-17', 'x')], []);
  assert.deepEqual(ids(l.archive), ['a', 'b', 'c']);
});

test('empty input', () => {
  assert.deepEqual(buildIndexLayout([], ['x']), { featured: null, alsoNew: [], topics: [], archive: [] });
});

test('two posts', () => {
  const l = buildIndexLayout([p('a', '2026-11-19', 'x'), p('b', '2026-11-18', 'x')], ['x']);
  assert.ok(l.featured);
  assert.equal(l.alsoNew.length, 1);
  assert.deepEqual(l.topics, []);
});

test('shortTitle', () => {
  assert.equal(shortTitle('Replication: what users see'), 'Replication');
  assert.equal(shortTitle('No colon'), 'No colon');
});

test('normalizeSearch', () => {
  assert.equal(normalizeSearch('Bản SAO  đúng'), 'ban sao dung');
  assert.equal(normalizeSearch('BẢN'), 'ban');
});

test('formatHours', () => {
  assert.equal(formatHours(570), '9.5h');
  assert.equal(formatHours(60), '1h');
  assert.equal(formatHours(25), '0.4h');
});

test('every post except ag-grid has a cover', () => {
  const dir = path.join(import.meta.dirname, '../content/blog');
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = src.match(/^cover:\s*"([^"]+)"\s*$/m);
    if (f === 'ag-grid-realtime-streaming.mdx') {
      assert.equal(m, null, `${f} should have no cover`);
      continue;
    }
    assert.ok(m, `${f} has no cover`);
    assert.ok(fs.existsSync(path.resolve(dir, m[1])), `${f}: cover file missing: ${m[1]}`);
    assert.match(src, /^cover_alt:\s*"[^"]+"/m, `${f} has no cover_alt`);
  }
});
