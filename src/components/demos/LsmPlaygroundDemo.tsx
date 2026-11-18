import React, { useId, useState } from 'react';

// A toy LSM storage engine the reader can drive:
// writes go to the WAL and the memtable; a full memtable flushes into a sorted SSTable;
// when too many SSTables pile up, one compaction merges them all, keeping the newest value
// per key and dropping tombstones (safe here because every file takes part in the merge).
// Reads check the memtable, then SSTables newest to oldest; an optional Bloom filter per
// SSTable skips files that cannot hold the key.
// Byte counts are simulated: every record is counted as REC_BYTES bytes.
// The first render comes from a fixed seed, so server and client HTML match.

const KEYS = Array.from({ length: 20 }, (_, i) => `k${String(i).padStart(2, '0')}`);
const MEM_CAP = 4;
const MAX_SST = 4;
const REC_BYTES = 16;
const BLOOM_BITS = 32;

type Rec = { key: string; val: number | null }; // val null = tombstone
type SSTable = { id: number; recs: Rec[]; bloom: boolean[] };
type Msg = { en: string; vi: string };
type Step = { where: 'mem' | 'sst'; id?: number; result: 'hit' | 'deleted' | 'miss' | 'skip' | 'fp' };
type ReadPath = { key: string; steps: Step[] };

type State = {
  wal: Rec[];
  mem: Rec[];
  ssts: SSTable[];
  nextId: number;
  version: number;
  userBytes: number;
  diskBytes: number;
  compactions: number;
  seed: number;
  msgs: Msg[];
  read: ReadPath | null;
};

function mulberry32(seed: number) {
  let a = seed | 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: a };
}

function hash(s: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % BLOOM_BITS;
}
const bloomBits = (key: string) => [hash(key, 17), hash(key, 4099)];
function makeBloom(recs: Rec[]) {
  const bits = Array<boolean>(BLOOM_BITS).fill(false);
  recs.forEach((r) => bloomBits(r.key).forEach((b) => (bits[b] = true)));
  return bits;
}

const fmtBytes = (n: number, lang: 'en' | 'vi') => `${n.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN')} B`;
const fmtAmp = (disk: number, user: number, lang: 'en' | 'vi') =>
  user === 0 ? '–' : `${(disk / user).toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}×`;

function applyWrite(s: State, key: string, del: boolean): State {
  const val = del ? null : s.version + 1;
  const rec: Rec = { key, val };
  let mem = [...s.mem.filter((r) => r.key !== key), rec].sort((a, b) => a.key.localeCompare(b.key));
  let wal = [...s.wal, rec];
  let ssts = s.ssts;
  let nextId = s.nextId;
  let diskBytes = s.diskBytes + REC_BYTES; // WAL append
  let compactions = s.compactions;
  const msgs: Msg[] = [];

  if (mem.length >= MEM_CAP) {
    const sst: SSTable = { id: nextId, recs: mem, bloom: makeBloom(mem) };
    diskBytes += mem.length * REC_BYTES;
    msgs.push({
      en: `Memtable full: flushed ${mem.length} keys as SSTable #${nextId} and cleared the WAL.`,
      vi: `Memtable đầy: ghi ${mem.length} khoá ra SSTable #${nextId} và xoá WAL.`,
    });
    ssts = [sst, ...ssts];
    nextId += 1;
    mem = [];
    wal = [];
  }

  if (ssts.length >= MAX_SST) {
    const newest = new Map<string, Rec>();
    let seen = 0;
    ssts.forEach((t) => t.recs.forEach((r) => {
      seen += 1;
      if (!newest.has(r.key)) newest.set(r.key, r);
    }));
    const kept = [...newest.values()].filter((r) => r.val !== null).sort((a, b) => a.key.localeCompare(b.key));
    const tombs = [...newest.values()].filter((r) => r.val === null).length;
    const old = seen - newest.size;
    diskBytes += kept.length * REC_BYTES;
    msgs.push({
      en: `Compaction: merged ${ssts.length} SSTables into SSTable #${nextId}. Kept ${kept.length} keys, dropped ${old} older value${old === 1 ? '' : 's'} and ${tombs} tombstone${tombs === 1 ? '' : 's'}.`,
      vi: `Compaction: trộn ${ssts.length} SSTable thành SSTable #${nextId}. Giữ ${kept.length} khoá, bỏ ${old} giá trị cũ và ${tombs} tombstone.`,
    });
    ssts = [{ id: nextId, recs: kept, bloom: makeBloom(kept) }];
    nextId += 1;
    compactions += 1;
  }

  return {
    ...s,
    wal,
    mem,
    ssts,
    nextId,
    version: del ? s.version : s.version + 1,
    userBytes: s.userBytes + REC_BYTES,
    diskBytes,
    compactions,
    msgs,
    read: null,
  };
}

function randomWrites(s: State, n: number): State {
  let st = s;
  let seed = s.seed;
  const all: Msg[] = [];
  for (let i = 0; i < n; i++) {
    const r1 = mulberry32(seed);
    const r2 = mulberry32(r1.seed);
    seed = r2.seed;
    st = applyWrite(st, KEYS[Math.floor(r1.value * KEYS.length)], r2.value < 0.15);
    all.push(...st.msgs);
  }
  return { ...st, seed, msgs: all.length ? all.slice(-3) : [{ en: `Wrote ${n} random keys.`, vi: `Đã ghi ${n} khoá ngẫu nhiên.` }] };
}

function doRead(s: State, key: string, bloomOn: boolean): State {
  const steps: Step[] = [];
  const inMem = s.mem.find((r) => r.key === key);
  if (inMem) {
    steps.push({ where: 'mem', result: inMem.val === null ? 'deleted' : 'hit' });
  } else {
    steps.push({ where: 'mem', result: 'miss' });
    for (const t of s.ssts) {
      const maybe = bloomBits(key).every((b) => t.bloom[b]);
      const rec = t.recs.find((r) => r.key === key);
      if (bloomOn && !maybe) {
        steps.push({ where: 'sst', id: t.id, result: 'skip' });
        continue;
      }
      if (rec) {
        steps.push({ where: 'sst', id: t.id, result: rec.val === null ? 'deleted' : 'hit' });
        break;
      }
      steps.push({ where: 'sst', id: t.id, result: bloomOn ? 'fp' : 'miss' });
    }
  }
  return { ...s, read: { key, steps }, msgs: [] };
}

const EMPTY: State = {
  wal: [], mem: [], ssts: [], nextId: 1, version: 0, userBytes: 0, diskBytes: 0, compactions: 0, seed: 7, msgs: [], read: null,
};
function initialState(): State {
  const s = randomWrites(EMPTY, 6);
  return { ...s, msgs: [] };
}

function stepLabel(st: Step, key: string, found: Rec | undefined): Msg {
  const where = st.where === 'mem' ? { en: 'Memtable', vi: 'Memtable' } : { en: `SSTable #${st.id}`, vi: `SSTable #${st.id}` };
  switch (st.result) {
    case 'hit':
      return { en: `${where.en}: found ${key} = v${found?.val}`, vi: `${where.vi}: thấy ${key} = v${found?.val}` };
    case 'deleted':
      return { en: `${where.en}: tombstone, ${key} is deleted`, vi: `${where.vi}: tombstone, ${key} đã bị xoá` };
    case 'skip':
      return { en: `${where.en}: Bloom filter says no, skipped`, vi: `${where.vi}: Bloom filter nói không, bỏ qua` };
    case 'fp':
      return { en: `${where.en}: Bloom filter said maybe, not there`, vi: `${where.vi}: Bloom filter nói có thể, nhưng không có` };
    default:
      return { en: `${where.en}: not here`, vi: `${where.vi}: không có` };
  }
}

function Chip({ rec, hot }: { rec: Rec; hot?: boolean }) {
  return (
    <span className={`lsmp-chip${rec.val === null ? ' is-tomb' : ''}${hot ? ' is-hot' : ''}`}>
      <b>{rec.key}</b>
      <small>{rec.val === null ? 'tombstone' : `v${rec.val}`}</small>
    </span>
  );
}

export default function LsmPlaygroundDemo() {
  const selectId = useId();
  const [state, setState] = useState<State>(initialState);
  const [key, setKey] = useState('k07');
  const [bloomOn, setBloomOn] = useState(true);

  const s = state;
  const readKey = s.read?.key;
  const stepFor = (id: number) => s.read?.steps.find((st) => st.where === 'sst' && st.id === id);
  const memStep = s.read?.steps.find((st) => st.where === 'mem');
  const lastStep = s.read?.steps[s.read.steps.length - 1];
  const opened = s.read ? s.read.steps.filter((st) => st.where === 'sst' && st.result !== 'skip').length : 0;
  const findRec = (st: Step) => (st.where === 'mem' ? s.mem : s.ssts.find((t) => t.id === st.id)?.recs ?? []).find((r) => r.key === readKey);

  return (
    <div className="sd lsmp">
      <div className="sd-controls">
        <div className="sd-group">
          <label htmlFor={selectId} className="lsmp-label">
            <span data-lang-en>Key</span>
            <span data-lang-vi>Khoá</span>
          </label>
          <select id={selectId} className="lsmp-select" value={key} onChange={(e) => setKey(e.target.value)}>
            {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <button type="button" className="sd-btn" onClick={() => setState(applyWrite(s, key, false))}>
            <span data-lang-en>Write</span>
            <span data-lang-vi>Ghi</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setState(applyWrite(s, key, true))}>
            <span data-lang-en>Delete</span>
            <span data-lang-vi>Xoá</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setState(doRead(s, key, bloomOn))}>
            <span data-lang-en>Read</span>
            <span data-lang-vi>Đọc</span>
          </button>
        </div>
        <div className="sd-group">
          <button type="button" className="sd-btn" onClick={() => setState(randomWrites(s, 10))}>
            <span data-lang-en>Write 10 random</span>
            <span data-lang-vi>Ghi 10 khoá ngẫu nhiên</span>
          </button>
          <button type="button" className={bloomOn ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={bloomOn} onClick={() => { setBloomOn(!bloomOn); setState({ ...s, read: null, msgs: [] }); }}>
            <span data-lang-en>Bloom filters {bloomOn ? 'on' : 'off'}</span>
            <span data-lang-vi>Bloom filter: {bloomOn ? 'bật' : 'tắt'}</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setState(initialState())}>
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Làm lại</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b><span data-lang-en>{fmtBytes(s.userBytes, 'en')}</span><span data-lang-vi>{fmtBytes(s.userBytes, 'vi')}</span></b>
          <span><span data-lang-en>you wrote</span><span data-lang-vi>bạn đã ghi</span></span>
        </div>
        <div className="sd-stat">
          <b><span data-lang-en>{fmtBytes(s.diskBytes, 'en')}</span><span data-lang-vi>{fmtBytes(s.diskBytes, 'vi')}</span></b>
          <span><span data-lang-en>written to disk</span><span data-lang-vi>đã ghi xuống đĩa</span></span>
        </div>
        <div className="sd-stat is-bad">
          <b><span data-lang-en>{fmtAmp(s.diskBytes, s.userBytes, 'en')}</span><span data-lang-vi>{fmtAmp(s.diskBytes, s.userBytes, 'vi')}</span></b>
          <span><span data-lang-en>write amplification</span><span data-lang-vi>khuếch đại ghi</span></span>
        </div>
        <div className="sd-stat">
          <b>{s.compactions}</b>
          <span><span data-lang-en>compactions</span><span data-lang-vi>lần compaction</span></span>
        </div>
      </div>

      <div className="lsmp-msg" aria-live="polite">
        {s.read ? (
          <>
            <span data-lang-en>Read {s.read.key}: checked the memtable, opened {opened} of {s.ssts.length} SSTables.</span>
            <span data-lang-vi>Đọc {s.read.key}: xem memtable, mở {opened} trên {s.ssts.length} SSTable.</span>
          </>
        ) : s.msgs.length ? (
          s.msgs.map((m, i) => (
            <span key={i} className="lsmp-msg-line">
              <span data-lang-en>{m.en}</span>
              <span data-lang-vi>{m.vi}</span>
            </span>
          ))
        ) : (
          <>
            <span data-lang-en>Pick a key and write, delete or read it.</span>
            <span data-lang-vi>Chọn một khoá rồi ghi, xoá hoặc đọc nó.</span>
          </>
        )}
      </div>

      <div className="lsmp-cols">
        <div className="lsmp-col">
          <p className="lsmp-h">
            <span data-lang-en>Memory</span>
            <span data-lang-vi>Bộ nhớ (RAM)</span>
          </p>
          <div className={`lsmp-box${memStep ? ` is-read-${memStep.result}` : ''}`}>
            <p className="lsmp-box-title">
              <span data-lang-en>Memtable, sorted ({s.mem.length}/{MEM_CAP})</span>
              <span data-lang-vi>Memtable, đã sắp xếp ({s.mem.length}/{MEM_CAP})</span>
            </p>
            <div className="lsmp-chips">
              {s.mem.map((r) => <Chip key={r.key} rec={r} hot={r.key === readKey && (memStep?.result === 'hit' || memStep?.result === 'deleted')} />)}
              {Array.from({ length: MEM_CAP - s.mem.length }, (_, i) => <span key={`e${i}`} className="lsmp-chip is-empty" />)}
            </div>
          </div>
          {s.read && (
            <ol className="lsmp-path">
              {s.read.steps.map((st, i) => {
                const label = stepLabel(st, s.read!.key, findRec(st));
                const final = st === lastStep && (st.result === 'hit' || st.result === 'deleted');
                return (
                  <li key={i} className={final ? 'is-final' : st.result === 'skip' ? 'is-skip' : ''}>
                    <span data-lang-en>{label.en}</span>
                    <span data-lang-vi>{label.vi}</span>
                  </li>
                );
              })}
              {lastStep && lastStep.result !== 'hit' && lastStep.result !== 'deleted' && (
                <li className="is-final">
                  <span data-lang-en>{s.read.key} does not exist</span>
                  <span data-lang-vi>{s.read.key} không tồn tại</span>
                </li>
              )}
            </ol>
          )}
        </div>

        <div className="lsmp-col">
          <p className="lsmp-h">
            <span data-lang-en>Disk</span>
            <span data-lang-vi>Đĩa</span>
          </p>
          <div className="lsmp-box">
            <p className="lsmp-box-title">
              <span data-lang-en>Write-ahead log, in arrival order</span>
              <span data-lang-vi>Write-ahead log, theo thứ tự đến</span>
            </p>
            <div className="lsmp-chips">
              {s.wal.length ? s.wal.map((r, i) => <Chip key={i} rec={r} />) : (
                <span className="lsmp-none">
                  <span data-lang-en>empty since the last flush</span>
                  <span data-lang-vi>trống từ lần flush gần nhất</span>
                </span>
              )}
            </div>
          </div>
          {s.ssts.map((t, i) => {
            const st = stepFor(t.id);
            return (
              <div key={t.id} className={`lsmp-box is-sst${st ? ` is-read-${st.result}` : ''}`}>
                <p className="lsmp-box-title">
                  <span data-lang-en>SSTable #{t.id}{i === 0 ? ', newest' : ''}{i === s.ssts.length - 1 && i > 0 ? ', oldest' : ''}</span>
                  <span data-lang-vi>SSTable #{t.id}{i === 0 ? ', mới nhất' : ''}{i === s.ssts.length - 1 && i > 0 ? ', cũ nhất' : ''}</span>
                </p>
                <div className="lsmp-chips">
                  {t.recs.length ? t.recs.map((r) => <Chip key={r.key} rec={r} hot={r.key === readKey && (st?.result === 'hit' || st?.result === 'deleted')} />) : (
                    <span className="lsmp-none">
                      <span data-lang-en>empty: every key was deleted</span>
                      <span data-lang-vi>trống: mọi khoá đã bị xoá</span>
                    </span>
                  )}
                </div>
                <div className="lsmp-bloom" aria-hidden="true">
                  {t.bloom.map((b, j) => {
                    const probe = readKey && bloomOn && bloomBits(readKey).includes(j);
                    return <span key={j} className={`${b ? 'is-set' : ''}${probe ? ' is-probe' : ''}`} />;
                  })}
                </div>
              </div>
            );
          })}
          {s.ssts.length === 0 && (
            <p className="lsmp-none">
              <span data-lang-en>No SSTables yet.</span>
              <span data-lang-vi>Chưa có SSTable nào.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
