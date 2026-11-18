import React, { useState } from 'react';

// A toy B-tree leaf level the reader can insert into, with random (UUIDv4-like) or
// time-ordered (UUIDv7-like) keys. Leaf pages hold LEAF_CAP keys.
// Split rule: a full leaf splits in half, except when the new key is the largest in the
// rightmost leaf; then the full page is left as it is and a new page starts on the right
// (MySQL's docs: sequential inserts leave InnoDB pages about 15/16 full).
// Each "commit" writes every page it changed once, like a write-ahead log; a split also
// rewrites the parent page. All numbers are simulated, not measured.
// The first render comes from a fixed seed, so server and client HTML match.

const LEAF_CAP = 8;
const PREFILL = 20;
const MAX_KEYS = 240;
const ORDERED_BASE = 0x0190a000;

type Mode = 'random' | 'ordered';
type Leaf = { id: number; keys: number[] };
type State = {
  mode: Mode;
  leaves: Leaf[];
  nextId: number;
  counter: number;
  seed: number;
  inserts: number;
  splits: number;
  pageWrites: number;
  commits: number;
  touched: number[];
  created: number[];
  lastKey: number | null;
  lastLeafPos: number | null;
  lastSplit: boolean;
};

function mulberry32(seed: number) {
  let a = seed | 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: a };
}

const hex = (k: number) => k.toString(16).padStart(8, '0');

function nextKey(s: State): { key: number; s: State } {
  if (s.mode === 'ordered') {
    return { key: ORDERED_BASE + s.counter, s: { ...s, counter: s.counter + 1 } };
  }
  const r = mulberry32(s.seed);
  return { key: Math.floor(r.value * 0xffffffff), s: { ...s, seed: r.seed } };
}

// One commit of n inserts.
function commit(s0: State, n: number): State {
  let s = { ...s0, leaves: s0.leaves.map((l) => ({ ...l, keys: [...l.keys] })) };
  const touched = new Set<number>();
  const created = new Set<number>();
  let splitInCommit = false;
  let lastSplit = false;
  let lastLeafPos: number | null = null;
  let lastKey: number | null = null;

  for (let i = 0; i < n && s.inserts + PREFILL < MAX_KEYS + PREFILL; i++) {
    const g = nextKey(s);
    s = g.s;
    const key = g.key;
    if (s.leaves.length === 0) s.leaves.push({ id: s.nextId++, keys: [] });
    let pos = 0;
    for (let j = 0; j < s.leaves.length; j++) {
      if (s.leaves[j].keys.length && s.leaves[j].keys[0] <= key) pos = j;
    }
    const leaf = s.leaves[pos];
    const isAppend = pos === s.leaves.length - 1 && (leaf.keys.length === 0 || key > leaf.keys[leaf.keys.length - 1]);
    leaf.keys.push(key);
    leaf.keys.sort((a, b) => a - b);
    touched.add(leaf.id);
    lastSplit = false;
    if (leaf.keys.length > LEAF_CAP) {
      let right: number[];
      if (isAppend) {
        right = leaf.keys.splice(LEAF_CAP);
      } else {
        right = leaf.keys.splice(Math.floor(leaf.keys.length / 2));
      }
      const nl = { id: s.nextId++, keys: right };
      s.leaves.splice(pos + 1, 0, nl);
      created.add(nl.id);
      s.splits += 1;
      splitInCommit = true;
      lastSplit = true;
      if (right.includes(key)) pos += 1;
    }
    s.inserts += 1;
    lastKey = key;
    lastLeafPos = pos;
  }
  // every changed page is written once per commit; a split also rewrites the parent page
  const dirty = new Set([...touched, ...created]).size + (splitInCommit ? 1 : 0);
  return {
    ...s,
    pageWrites: s.pageWrites + dirty,
    commits: s.commits + 1,
    touched: [...touched],
    created: [...created],
    lastKey,
    lastLeafPos,
    lastSplit,
  };
}

function initialState(mode: Mode): State {
  const empty: State = {
    mode, leaves: [], nextId: 1, counter: 0, seed: 20240611, inserts: 0, splits: 0, pageWrites: 0, commits: 0,
    touched: [], created: [], lastKey: null, lastLeafPos: null, lastSplit: false,
  };
  const filled = commit(empty, PREFILL);
  return { ...filled, inserts: 0, splits: 0, pageWrites: 0, commits: 0, touched: [], created: [], lastKey: null, lastLeafPos: null, lastSplit: false };
}

const nf = (n: number, lang: 'en' | 'vi') => n.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN');

export default function BtreeInsertDemo() {
  const [s, setS] = useState<State>(() => initialState('random'));
  const full = s.inserts >= MAX_KEYS;
  const lastDirty = s.commits ? new Set([...s.touched, ...s.created]).size + (s.created.length ? 1 : 0) : 0;
  const totalKeys = s.leaves.reduce((a, l) => a + l.keys.length, 0);
  const fill = Math.round((100 * totalKeys) / (s.leaves.length * LEAF_CAP));
  const perCommit = s.commits ? s.pageWrites / s.commits : 0;
  const fmtPer = (lang: 'en' | 'vi') => perCommit.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN', { maximumFractionDigits: 1 });

  return (
    <div className="sd bts">
      <div className="sd-controls">
        <div className="sd-group" role="group" aria-label="Key type">
          <button type="button" className={s.mode === 'random' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={s.mode === 'random'} onClick={() => setS(initialState('random'))}>
            <span data-lang-en>Random keys (UUIDv4)</span>
            <span data-lang-vi>Khoá ngẫu nhiên (UUIDv4)</span>
          </button>
          <button type="button" className={s.mode === 'ordered' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={s.mode === 'ordered'} onClick={() => setS(initialState('ordered'))}>
            <span data-lang-en>Time-ordered keys (UUIDv7)</span>
            <span data-lang-vi>Khoá theo thời gian (UUIDv7)</span>
          </button>
        </div>
        <div className="sd-group">
          <button type="button" className="sd-btn" disabled={full} onClick={() => setS(commit(s, 1))}>
            <span data-lang-en>Insert 1</span>
            <span data-lang-vi>Insert 1 khoá</span>
          </button>
          <button type="button" className="sd-btn" disabled={full} onClick={() => setS(commit(s, 10))}>
            <span data-lang-en>Insert 10 in one commit</span>
            <span data-lang-vi>Insert 10 khoá, một commit</span>
          </button>
          <button type="button" className="sd-btn" disabled={full} onClick={() => { let t = s; for (let i = 0; i < 5; i++) t = commit(t, 10); setS(t); }}>
            <span data-lang-en>5 commits of 10</span>
            <span data-lang-vi>5 commit, mỗi cái 10 khoá</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setS(initialState(s.mode))}>
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Làm lại</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>{nf(s.inserts, 'en')}</b>
          <span><span data-lang-en>keys inserted</span><span data-lang-vi>khoá đã insert</span></span>
        </div>
        <div className="sd-stat">
          <b>{s.splits}</b>
          <span><span data-lang-en>page splits</span><span data-lang-vi>lần tách trang</span></span>
        </div>
        <div className={s.mode === 'random' && s.commits ? 'sd-stat is-bad' : 'sd-stat'}>
          <b><span data-lang-en>{fmtPer('en')}</span><span data-lang-vi>{fmtPer('vi')}</span></b>
          <span><span data-lang-en>pages written per commit</span><span data-lang-vi>trang ghi mỗi commit</span></span>
        </div>
        <div className="sd-stat">
          <b>{fill}%</b>
          <span><span data-lang-en>average leaf fill</span><span data-lang-vi>độ đầy trung bình của lá</span></span>
        </div>
      </div>

      <p className="bts-msg" aria-live="polite">
        {s.lastKey === null ? (
          <>
            <span data-lang-en>{PREFILL} keys are already in the tree. Insert more and watch which leaf pages change.</span>
            <span data-lang-vi>Cây đã có sẵn {PREFILL} khoá. Insert thêm và xem trang lá nào bị sửa.</span>
          </>
        ) : (
          <>
            <span data-lang-en>
              Last commit changed {lastDirty} page{lastDirty === 1 ? '' : 's'}{s.created.length ? ', counting the parent page a split rewrites' : ''}. Last key {hex(s.lastKey)}… went into leaf {(s.lastLeafPos ?? 0) + 1} of {s.leaves.length}{s.lastSplit ? ', which split' : ''}.
            </span>
            <span data-lang-vi>
              Commit vừa rồi sửa {lastDirty} trang{s.created.length ? ', tính cả trang cha bị ghi lại khi tách' : ''}. Khoá cuối {hex(s.lastKey)}… rơi vào lá {(s.lastLeafPos ?? 0) + 1} trên {s.leaves.length}{s.lastSplit ? ', và lá đó bị tách' : ''}.
            </span>
          </>
        )}
        {full && (
          <>
            {' '}
            <span data-lang-en>The demo stops at {MAX_KEYS} inserts; press Reset to start again.</span>
            <span data-lang-vi>Demo dừng ở {MAX_KEYS} lần insert; bấm Làm lại để chạy lại.</span>
          </>
        )}
      </p>

      <p className="bts-root">
        <span data-lang-en>Root page → {s.leaves.length} leaf pages, smallest keys on the left</span>
        <span data-lang-vi>Trang gốc → {s.leaves.length} trang lá, khoá nhỏ nhất bên trái</span>
      </p>
      <div className="bts-leaves">
        {s.leaves.map((l, i) => {
          const isNew = s.created.includes(l.id);
          const isTouched = s.touched.includes(l.id);
          return (
            <div
              key={l.id}
              className={`bts-leaf${isTouched || isNew ? ' is-hot' : ''}${isNew ? ' is-new' : ''}`}
              title={`leaf ${i + 1}: ${l.keys.map(hex).join(', ')}`}
            >
              {Array.from({ length: LEAF_CAP }, (_, j) => (
                <span key={j} className={j < l.keys.length ? 'is-used' : ''} />
              ))}
            </div>
          );
        })}
      </div>
      <p className="bts-legend">
        <span className="bts-legend-item">
          <span className="bts-leaf is-hot bts-legend-swatch" aria-hidden="true" />
          <span data-lang-en>changed by the last commit</span>
          <span data-lang-vi>bị sửa bởi commit vừa rồi</span>
        </span>
        <span className="bts-legend-item">
          <span className="bts-leaf is-hot is-new bts-legend-swatch" aria-hidden="true" />
          <span data-lang-en>new page from a split</span>
          <span data-lang-vi>trang mới sinh ra khi tách</span>
        </span>
      </p>
    </div>
  );
}
