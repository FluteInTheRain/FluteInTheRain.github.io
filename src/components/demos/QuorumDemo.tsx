import React, { useState } from 'react';

// Leaderless quorum playground (Dynamo style).
// n replicas hold one key. A write is sent to every replica that is up, but only the first w to answer
// are counted, and only they have the new version when the client gets its OK; the others are
// treated as slow and still hold the old version. A read asks r of the replicas that are up and keeps
// the highest version it gets back. If w + r > n, the read set and the write set always overlap, so a
// read sees the newest successful write. If fewer than w replicas are up, the write is reported as
// failed but is NOT rolled back on the replicas that took it, as the book warns.
// Optional read repair writes the newest version back to the stale replicas the read touched.
// Which replicas answer first comes from a seeded generator, so the first render is deterministic.

type State = {
  n: number;
  w: number;
  r: number;
  up: boolean[];
  versions: number[]; // version each replica holds
  latestOk: number; // newest version whose write was acknowledged by w replicas
  nextVersion: number;
  seed: number;
  writes: number;
  failedWrites: number;
  reads: number;
  failedReads: number;
  staleReads: number;
  lastWrite: number[] | null; // replicas that took the last write
  lastRead: number[] | null; // replicas the last read asked
  lastReadValue: number | null;
  lastMsg: { en: string; vi: string } | null;
};

const SEED = 11;

function rand(seed: number) {
  const next = (seed + 0x6d2b79f5) | 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: next };
}

// Pick k distinct items from list, in a seeded random order.
function pick(list: number[], k: number, seed: number) {
  const a = [...list];
  let sd = seed;
  for (let i = a.length - 1; i > 0; i--) {
    const r = rand(sd);
    sd = r.seed;
    const j = Math.floor(r.value * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return { chosen: a.slice(0, k).sort((x, y) => x - y), seed: sd };
}

function initial(n: number, w: number, r: number): State {
  return {
    n, w, r,
    up: Array(n).fill(true),
    versions: Array(n).fill(1),
    latestOk: 1,
    nextVersion: 2,
    seed: SEED,
    writes: 0, failedWrites: 0, reads: 0, failedReads: 0, staleReads: 0,
    lastWrite: null, lastRead: null, lastReadValue: null, lastMsg: null,
  };
}

const upList = (s: State) => s.up.map((u, i) => (u ? i : -1)).filter((i) => i >= 0);
const nodeName = (i: number) => `${i + 1}`;

function doWrite(s: State): State {
  const up = upList(s);
  const v = s.nextVersion;
  const versions = [...s.versions];
  if (up.length < s.w) {
    // Not enough replicas: the client gets an error, yet the replicas that are up keep the value.
    up.forEach((i) => (versions[i] = v));
    return {
      ...s, versions, nextVersion: v + 1, writes: s.writes + 1, failedWrites: s.failedWrites + 1,
      lastWrite: up, lastRead: null,
      lastMsg: {
        en: `Write of v${v} failed: only ${up.length} replica${up.length === 1 ? ' is' : 's are'} up, w = ${s.w}. ${up.length ? `It is not rolled back on replica${up.length === 1 ? '' : 's'} ${up.map(nodeName).join(', ')}.` : ''}`,
        vi: `Ghi v${v} thất bại: chỉ ${up.length} replica đang chạy, mà w = ${s.w}. ${up.length ? `Nhưng nó không bị gỡ khỏi replica ${up.map(nodeName).join(', ')}.` : ''}`,
      },
    };
  }
  const { chosen, seed } = pick(up, s.w, s.seed);
  chosen.forEach((i) => (versions[i] = v));
  return {
    ...s, versions, seed, latestOk: v, nextVersion: v + 1, writes: s.writes + 1,
    lastWrite: chosen, lastRead: null,
    lastMsg: {
      en: `Wrote v${v}. Replicas ${chosen.map(nodeName).join(', ')} answered first; the others are slow and still hold an older version.`,
      vi: `Đã ghi v${v}. Replica ${chosen.map(nodeName).join(', ')} trả lời trước; các replica còn lại chậm và vẫn giữ phiên bản cũ.`,
    },
  };
}

function doRead(s: State, repair: boolean): State {
  const up = upList(s);
  if (up.length < s.r) {
    return {
      ...s, reads: s.reads + 1, failedReads: s.failedReads + 1, lastRead: null, lastReadValue: null,
      lastMsg: {
        en: `Read failed: only ${up.length} replica${up.length === 1 ? ' is' : 's are'} up, r = ${s.r}.`,
        vi: `Đọc thất bại: chỉ ${up.length} replica đang chạy, mà r = ${s.r}.`,
      },
    };
  }
  const { chosen, seed } = pick(up, s.r, s.seed);
  const got = Math.max(...chosen.map((i) => s.versions[i]));
  const stale = got < s.latestOk;
  const versions = [...s.versions];
  if (repair) chosen.forEach((i) => (versions[i] = Math.max(versions[i], got)));
  return {
    ...s, versions, seed, reads: s.reads + 1, staleReads: s.staleReads + (stale ? 1 : 0),
    lastRead: chosen, lastReadValue: got,
    lastMsg: stale
      ? {
          en: `Read asked ${chosen.map(nodeName).join(', ')} and got v${got}, but v${s.latestOk} was already acknowledged. Stale read.`,
          vi: `Lần đọc hỏi replica ${chosen.map(nodeName).join(', ')} và nhận v${got}, trong khi v${s.latestOk} đã được xác nhận ghi xong. Đọc phải dữ liệu cũ.`,
        }
      : {
          en: `Read asked ${chosen.map(nodeName).join(', ')} and got v${got}, the newest acknowledged write.`,
          vi: `Lần đọc hỏi replica ${chosen.map(nodeName).join(', ')} và nhận v${got}, đúng bản ghi mới nhất đã được xác nhận.`,
        },
  };
}

const SIZES = [3, 5];

export default function QuorumDemo() {
  const [s, setS] = useState<State>(() => initial(3, 2, 2));
  const [repair, setRepair] = useState(false);
  const quorum = s.w + s.r > s.n;
  const upCount = s.up.filter(Boolean).length;

  const setParams = (n: number, w: number, r: number) => setS(initial(n, Math.min(w, n), Math.min(r, n)));
  const toggle = (i: number) => {
    const up = [...s.up];
    up[i] = !up[i];
    setS({ ...s, up, lastMsg: null });
  };
  const readMany = () => {
    let t = s;
    for (let i = 0; i < 20; i++) t = doRead(t, repair);
    setS(t);
  };

  const R = 34;
  const cx = (i: number) => 70 + i * ((620 - 140) / Math.max(1, s.n - 1));

  return (
    <div className="sd qrm">
      <div className="sd-controls">
        <div className="sd-group" role="group" aria-label="Replicas">
          <span>n</span>
          {SIZES.map((n) => (
            <button key={n} type="button" className={s.n === n ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={s.n === n} onClick={() => setParams(n, Math.ceil((n + 1) / 2), Math.ceil((n + 1) / 2))}>
              {n}
            </button>
          ))}
        </div>
        <div className="sd-group" role="group" aria-label="Write quorum">
          <span>w</span>
          {Array.from({ length: s.n }, (_, i) => i + 1).map((w) => (
            <button key={w} type="button" className={s.w === w ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={s.w === w} onClick={() => setParams(s.n, w, s.r)}>
              {w}
            </button>
          ))}
        </div>
        <div className="sd-group" role="group" aria-label="Read quorum">
          <span>r</span>
          {Array.from({ length: s.n }, (_, i) => i + 1).map((r) => (
            <button key={r} type="button" className={s.r === r ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={s.r === r} onClick={() => setParams(s.n, s.w, r)}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="sd-controls">
        <div className="sd-group">
          <button type="button" className="sd-btn" onClick={() => setS(doWrite(s))}>
            <span data-lang-en>Write</span>
            <span data-lang-vi>Ghi</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setS(doRead(s, repair))}>
            <span data-lang-en>Read</span>
            <span data-lang-vi>Đọc</span>
          </button>
          <button type="button" className="sd-btn" onClick={readMany}>
            <span data-lang-en>Read 20 times</span>
            <span data-lang-vi>Đọc 20 lần</span>
          </button>
          <button type="button" className={repair ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={repair} onClick={() => setRepair(!repair)}>
            <span data-lang-en>Read repair</span>
            <span data-lang-vi>Read repair</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setS(initial(s.n, s.w, s.r))}>
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Làm lại</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className={quorum ? 'sd-stat is-good' : 'sd-stat is-bad'}>
          <b>{s.w} + {s.r} {quorum ? '>' : '≤'} {s.n}</b>
          <span>
            <span data-lang-en>{quorum ? 'read and write sets overlap' : 'sets may miss each other'}</span>
            <span data-lang-vi>{quorum ? 'tập đọc và tập ghi luôn giao nhau' : 'tập đọc có thể trượt tập ghi'}</span>
          </span>
        </div>
        <div className={s.staleReads ? 'sd-stat is-bad' : 'sd-stat'}>
          <b>{s.staleReads} / {s.reads - s.failedReads}</b>
          <span><span data-lang-en>stale reads</span><span data-lang-vi>lần đọc phải bản cũ</span></span>
        </div>
        <div className={s.failedWrites + s.failedReads ? 'sd-stat is-bad' : 'sd-stat'}>
          <b>{s.failedWrites} / {s.failedReads}</b>
          <span><span data-lang-en>failed writes / reads</span><span data-lang-vi>ghi / đọc thất bại</span></span>
        </div>
        <div className="sd-stat">
          <b>{upCount} / {s.n}</b>
          <span><span data-lang-en>replicas up</span><span data-lang-vi>replica đang chạy</span></span>
        </div>
      </div>

      <p className="qrm-msg" aria-live="polite">
        {s.lastMsg ? (
          <>
            <span data-lang-en>{s.lastMsg.en}</span>
            <span data-lang-vi>{s.lastMsg.vi}</span>
          </>
        ) : (
          <>
            <span data-lang-en>Click a replica to take it down or bring it back. Write, then read. Try w = 1, r = 1, then w = 2, r = 2.</span>
            <span data-lang-vi>Bấm vào một replica để tắt hoặc bật lại nó. Ghi, rồi đọc. Thử w = 1, r = 1, rồi w = 2, r = 2.</span>
          </>
        )}
      </p>

      <div className="qrm-scroll">
        <svg viewBox="0 0 690 150" className="qrm-svg" role="img" aria-label={`${s.n} replicas; ${upCount} up. Highest acknowledged version v${s.latestOk}.`}>
          {s.versions.map((v, i) => {
            const isUp = s.up[i];
            const inWrite = s.lastWrite?.includes(i);
            const inRead = s.lastRead?.includes(i);
            const stale = v < s.latestOk;
            const unconfirmed = v > s.latestOk; // left behind by a write that was reported as failed
            return (
              <g key={i} className="qrm-node" onClick={() => toggle(i)} role="button" tabIndex={0} aria-label={`replica ${i + 1} ${isUp ? 'up' : 'down'}, holds v${v}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); } }}>
                {inRead && <circle cx={cx(i)} cy={62} r={R + 7} className="qrm-read-ring" />}
                <circle cx={cx(i)} cy={62} r={R} className={`qrm-disc${isUp ? '' : ' is-down'}${inWrite ? ' is-written' : ''}`} />
                <text x={cx(i)} y={58} textAnchor="middle" className={`qrm-v${stale ? ' is-stale' : ''}${isUp ? '' : ' is-down'}`}>v{v}</text>
                <text x={cx(i)} y={76} textAnchor="middle" className="qrm-small">
                  <tspan data-lang-en>{isUp ? (stale ? 'old' : unconfirmed ? 'unconfirmed' : 'newest') : 'down'}</tspan>
                  <tspan data-lang-vi>{isUp ? (stale ? 'bản cũ' : unconfirmed ? 'chưa xác nhận' : 'mới nhất') : 'đã tắt'}</tspan>
                </text>
                <text x={cx(i)} y={124} textAnchor="middle" className="qrm-label">
                  <tspan data-lang-en>replica {i + 1}</tspan>
                  <tspan data-lang-vi>replica {i + 1}</tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="qrm-legend">
        <span className="qrm-key"><span className="qrm-swatch is-written" aria-hidden="true" /><span data-lang-en>took the last write</span><span data-lang-vi>nhận lần ghi gần nhất</span></span>
        <span className="qrm-key"><span className="qrm-swatch is-read" aria-hidden="true" /><span data-lang-en>asked by the last read</span><span data-lang-vi>được lần đọc gần nhất hỏi</span></span>
        <span className="qrm-key"><span className="qrm-swatch is-down" aria-hidden="true" /><span data-lang-en>down</span><span data-lang-vi>đã tắt</span></span>
      </p>
    </div>
  );
}
