import React, { useState } from 'react';

// Rolling upgrade, simulated. Eight servers read messages from clients through a load balancer.
// You deploy v2 one server at a time, turn the new field on at the clients, or roll back.
// Every action sends a batch of BATCH messages; each lands on a random server, and each is in
// the new format with probability NEW_SHARE once the clients send it (some clients update late).
// The deploy can "miss" one server: the tool reports it as upgraded, but it still runs v1,
// the way one of Knight Capital's eight SMARS servers did in 2012 (SEC release 34-70694).
// Randomness comes from a seeded PRNG keyed by the action count, so the first render and
// every replay are identical.

const SERVERS = 8;
const BATCH = 16;
const NEW_SHARE = 0.6;
const MISSED = SERVERS - 1; // index of the server the deploy can miss

type Change = 'optional' | 'required' | 'reuse';
type Outcome = 'ok' | 'error' | 'wrong';
type Batch = { labelEn: string; labelVi: string; ok: number; error: number; wrong: number; lines: { en: string; vi: string }[] };
type State = { change: Change; deployed: number; clientsNew: boolean; missOne: boolean; actions: number; history: Batch[] };

const CHANGES: { id: Change; en: string; vi: string }[] = [
  { id: 'optional', en: 'Add an optional field', vi: 'Thêm một trường tuỳ chọn' },
  { id: 'required', en: 'Add a field v2 requires', vi: 'Thêm trường mà v2 bắt buộc phải có' },
  { id: 'reuse', en: 'Reuse a retired flag', vi: 'Dùng lại một cờ đã bỏ' },
];

function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const runsV2 = (s: State, i: number) => i < s.deployed && !(s.missOne && i === MISSED);

function outcome(change: Change, readerV2: boolean, msgNew: boolean): Outcome {
  if (readerV2 && !msgNew && change === 'required') return 'error';
  if (!readerV2 && msgNew && change === 'reuse') return 'wrong';
  return 'ok';
}

function lineFor(o: Outcome, server: number, change: Change): { en: string; vi: string } {
  if (o === 'error')
    return {
      en: `Server ${server + 1} (v2) got an old message without the field it requires: request failed.`,
      vi: `Server ${server + 1} (v2) nhận message cũ thiếu trường bắt buộc: request lỗi.`,
    };
  if (o === 'wrong' && change === 'reuse')
    return {
      en: `Server ${server + 1} (v1) read the flag with its old meaning and ran the retired code.`,
      vi: `Server ${server + 1} (v1) hiểu cờ theo nghĩa cũ và chạy lại đoạn code đã bỏ.`,
    };
  return { en: '', vi: '' };
}

function runBatch(s: State, labelEn: string, labelVi: string): State {
  const rand = mulberry32(1000 + s.actions * 7919);
  const b: Batch = { labelEn, labelVi, ok: 0, error: 0, wrong: 0, lines: [] };
  for (let m = 0; m < BATCH; m++) {
    const server = Math.floor(rand() * SERVERS);
    const msgNew = s.clientsNew && rand() < NEW_SHARE;
    const o = outcome(s.change, runsV2(s, server), msgNew);
    b[o] += 1;
    if (o !== 'ok' && b.lines.length < 3) b.lines.push(lineFor(o, server, s.change));
  }
  return { ...s, actions: s.actions + 1, history: [...s.history, b].slice(-10) };
}

function fresh(change: Change, missOne: boolean): State {
  return runBatch({ change, deployed: 0, clientsNew: false, missOne, actions: 0, history: [] }, 'Before the deploy', 'Trước khi deploy');
}

export default function RollingUpgradeDemo() {
  const [s, setS] = useState<State>(() => fresh('reuse', true));
  const last = s.history[s.history.length - 1];
  const totals = s.history.reduce((t, b) => ({ ok: t.ok + b.ok, error: t.error + b.error, wrong: t.wrong + b.wrong }), { ok: 0, error: 0, wrong: 0 });
  const maxBar = BATCH;

  const deploy = () => {
    const next = { ...s, deployed: s.deployed + 1 };
    setS(runBatch(next, `Deploy ${next.deployed}/${SERVERS}`, `Deploy ${next.deployed}/${SERVERS}`));
  };
  const rollback = () => {
    const next = { ...s, deployed: s.deployed - 1 };
    setS(runBatch(next, `Roll back to ${next.deployed}/${SERVERS}`, `Rollback còn ${next.deployed}/${SERVERS}`));
  };
  const toggleClients = () => {
    const next = { ...s, clientsNew: !s.clientsNew };
    setS(runBatch(next, next.clientsNew ? 'New field on' : 'New field off', next.clientsNew ? 'Bật trường mới' : 'Tắt trường mới'));
  };

  return (
    <div className="sd rup">
      <div className="rup-changes" role="group" aria-label="Schema change">
        <span className="rup-label">
          <span data-lang-en>The change:</span>
          <span data-lang-vi>Thay đổi:</span>
        </span>
        {CHANGES.map((c) => (
          <button key={c.id} type="button" className={s.change === c.id ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={s.change === c.id} onClick={() => setS(fresh(c.id, s.missOne))}>
            <span data-lang-en>{c.en}</span>
            <span data-lang-vi>{c.vi}</span>
          </button>
        ))}
      </div>

      <div className="sd-controls rup-controls">
        <div className="sd-group">
          <button type="button" className="sd-btn" disabled={s.deployed >= SERVERS} onClick={deploy}>
            <span data-lang-en>Deploy v2 to next server</span>
            <span data-lang-vi>Deploy v2 lên server kế tiếp</span>
          </button>
          <button type="button" className={s.clientsNew ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={s.clientsNew} onClick={toggleClients}>
            <span data-lang-en>Clients send the new field: {s.clientsNew ? 'on' : 'off'}</span>
            <span data-lang-vi>Client gửi trường mới: {s.clientsNew ? 'bật' : 'tắt'}</span>
          </button>
          <button type="button" className="sd-btn" disabled={s.deployed <= 0} onClick={rollback}>
            <span data-lang-en>Roll back one server</span>
            <span data-lang-vi>Rollback một server</span>
          </button>
        </div>
        <div className="sd-group">
          <button type="button" className={s.missOne ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={s.missOne} onClick={() => setS(fresh(s.change, !s.missOne))}>
            <span data-lang-en>Deploy misses server {SERVERS}: {s.missOne ? 'yes' : 'no'}</span>
            <span data-lang-vi>Deploy bỏ sót server {SERVERS}: {s.missOne ? 'có' : 'không'}</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setS(fresh(s.change, s.missOne))}>
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Làm lại</span>
          </button>
        </div>
      </div>

      <div className="rup-servers">
        {Array.from({ length: SERVERS }, (_, i) => {
          const v2 = runsV2(s, i);
          const ghost = s.missOne && i === MISSED && i < s.deployed;
          return (
            <div key={i} className={`rup-server${v2 ? ' is-v2' : ''}${ghost ? ' is-ghost' : ''}`}>
              <span className="rup-server-name">
                <span data-lang-en>Server {i + 1}</span>
                <span data-lang-vi>Server {i + 1}</span>
              </span>
              <b>{v2 ? 'v2' : 'v1'}</b>
              {ghost && (
                <small>
                  <span data-lang-en>tool says v2</span>
                  <span data-lang-vi>tool báo v2</span>
                </small>
              )}
            </div>
          );
        })}
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>{totals.ok}</b>
          <span><span data-lang-en>handled correctly</span><span data-lang-vi>xử lý đúng</span></span>
        </div>
        <div className="sd-stat">
          <b>{totals.error}</b>
          <span><span data-lang-en>failed loudly</span><span data-lang-vi>lỗi, có báo</span></span>
        </div>
        <div className="sd-stat is-bad">
          <b>{totals.wrong}</b>
          <span><span data-lang-en>silently wrong</span><span data-lang-vi>sai mà không báo</span></span>
        </div>
      </div>

      <div className="rup-timeline" aria-label="Messages per action">
        {s.history.map((b, i) => (
          <div key={i} className={`rup-step${i === s.history.length - 1 ? ' is-last' : ''}`}>
            <div className="rup-bar" aria-hidden="true">
              <span className="is-wrong" style={{ height: `${(b.wrong / maxBar) * 100}%` }} />
              <span className="is-error" style={{ height: `${(b.error / maxBar) * 100}%` }} />
              <span className="is-ok" style={{ height: `${(b.ok / maxBar) * 100}%` }} />
            </div>
            <p className="rup-step-label">
              <span data-lang-en>{b.labelEn}</span>
              <span data-lang-vi>{b.labelVi}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="rup-log" aria-live="polite">
        {last && last.lines.length ? (
          last.lines.map((l, i) => (
            <p key={i}>
              <span data-lang-en>{l.en}</span>
              <span data-lang-vi>{l.vi}</span>
            </p>
          ))
        ) : (
          <p>
            <span data-lang-en>Last batch: all {BATCH} messages handled correctly.</span>
            <span data-lang-vi>Lượt vừa rồi: cả {BATCH} message đều được xử lý đúng.</span>
          </p>
        )}
      </div>
    </div>
  );
}
