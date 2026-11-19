import React, { useState } from 'react';

// Replication lag, from one user's seat.
// One leader and two asynchronous followers. Follower A applies a write 1 simulated second after the
// leader, follower B 5 seconds after. Alice and Bob post comments (writes go to the leader); Alice
// refreshes the page (a read routed to one replica). Two optional routing rules fix two anomalies:
//  - read-your-writes: only read from a replica whose log position is at least Alice's last write
//    (the log-sequence-number check Bitbucket describes), otherwise read from the leader;
//  - monotonic reads: Alice always reads from the same follower (picked by a hash of her user id),
//    unless read-your-writes sends her to the leader.
// Random routing uses a seeded generator, so the first render and every replay are deterministic.

type Replica = 'leader' | 'a' | 'b';
type Write = { pos: number; t: number; author: 'alice' | 'bob'; n: number };
type Read = {
  replica: Replica;
  seen: number[]; // positions visible in this read
  missingOwn: boolean;
  wentBack: boolean;
};
type State = {
  now: number;
  writes: Write[];
  aliceLastWrite: number; // log position of Alice's last write, 0 = none
  aliceMaxSeen: number; // highest log position Alice has seen in a read
  seed: number;
  reads: number;
  leaderReads: number;
  ownMissing: number;
  backInTime: number;
  last: Read | null;
};

const LAG: Record<Replica, number> = { leader: 0, a: 1, b: 5 };
const STICKY: Replica = 'b'; // hash("alice") % 2 picks follower B in this demo
const SEED = 7;

function rand(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, seed: (seed + 0x6d2b79f5) | 0 };
}

// Highest log position a replica has applied at time `now`.
function applied(s: State, r: Replica) {
  return s.writes.filter((w) => w.t + LAG[r] <= s.now).reduce((m, w) => Math.max(m, w.pos), 0);
}

function initial(): State {
  return { now: 0, writes: [], aliceLastWrite: 0, aliceMaxSeen: 0, seed: SEED, reads: 0, leaderReads: 0, ownMissing: 0, backInTime: 0, last: null };
}

function post(s: State, author: 'alice' | 'bob'): State {
  const pos = s.writes.length + 1;
  const n = s.writes.filter((w) => w.author === author).length + 1;
  const writes = [...s.writes, { pos, t: s.now, author, n }];
  return { ...s, writes, aliceLastWrite: author === 'alice' ? pos : s.aliceLastWrite };
}

// Changing a routing rule starts the counters again, so each rule is judged on its own reads.
function resetCounters(s: State): State {
  return { ...s, reads: 0, leaderReads: 0, ownMissing: 0, backInTime: 0, aliceMaxSeen: 0, last: null };
}

function wait(s: State, secs: number): State {
  return { ...s, now: s.now + secs };
}

function refresh(s: State, ryw: boolean, mono: boolean): State {
  let seed = s.seed;
  let replica: Replica;
  if (mono) {
    replica = STICKY;
  } else {
    const r = rand(seed);
    seed = r.seed;
    replica = r.value < 0.5 ? 'a' : 'b';
  }
  // Bitbucket-style check: the follower must have reached Alice's last write. With both rules on,
  // it must also have reached what she already saw, so a fallback to the leader cannot make a later
  // read from her sticky follower go back in time.
  const need = ryw ? Math.max(s.aliceLastWrite, mono ? s.aliceMaxSeen : 0) : 0;
  if (applied(s, replica) < need) {
    const other: Replica = replica === 'a' ? 'b' : 'a';
    replica = !mono && applied(s, other) >= need ? other : 'leader';
  }
  const pos = applied(s, replica);
  const seen = s.writes.filter((w) => w.pos <= pos).map((w) => w.pos);
  const missingOwn = s.aliceLastWrite > pos;
  const wentBack = pos < s.aliceMaxSeen;
  return {
    ...s,
    seed,
    reads: s.reads + 1,
    leaderReads: s.leaderReads + (replica === 'leader' ? 1 : 0),
    ownMissing: s.ownMissing + (missingOwn ? 1 : 0),
    backInTime: s.backInTime + (wentBack ? 1 : 0),
    aliceMaxSeen: Math.max(s.aliceMaxSeen, pos),
    last: { replica, seen, missingOwn, wentBack },
  };
}

const NAME: Record<Replica, { en: string; vi: string }> = {
  leader: { en: 'Leader', vi: 'Leader' },
  a: { en: 'Follower A', vi: 'Follower A' },
  b: { en: 'Follower B', vi: 'Follower B' },
};

function label(w: Write, lang: 'en' | 'vi') {
  if (lang === 'en') return `${w.author === 'alice' ? 'Alice' : 'Bob'}: comment ${w.n}`;
  return `${w.author === 'alice' ? 'Alice' : 'Bob'}: bình luận ${w.n}`;
}

export default function ReplicationLagDemo() {
  const [ryw, setRyw] = useState(false);
  const [mono, setMono] = useState(false);
  const [s, setS] = useState<State>(initial);

  const replicas: Replica[] = ['leader', 'a', 'b'];
  const leaderShare = s.reads ? Math.round((100 * s.leaderReads) / s.reads) : 0;

  return (
    <div className="sd rlag">
      <div className="sd-controls">
        <div className="sd-group" role="group" aria-label="Actions">
          <button type="button" className="sd-btn" onClick={() => setS(post(s, 'alice'))}>
            <span data-lang-en>Alice posts</span>
            <span data-lang-vi>Alice đăng</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setS(post(s, 'bob'))}>
            <span data-lang-en>Bob posts</span>
            <span data-lang-vi>Bob đăng</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setS(refresh(s, ryw, mono))}>
            <span data-lang-en>Alice refreshes</span>
            <span data-lang-vi>Alice tải lại trang</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setS(wait(s, 1))}>
            <span data-lang-en>Wait 1 s</span>
            <span data-lang-vi>Chờ 1 giây</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setS(initial())}>
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Làm lại</span>
          </button>
        </div>
      </div>
      <div className="sd-controls">
        <div className="sd-group" role="group" aria-label="Routing rules">
          <span className="rlag-group-label">
            <span data-lang-en>Routing rules:</span>
            <span data-lang-vi>Luật điều hướng:</span>
          </span>
          <button type="button" className={ryw ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={ryw} onClick={() => { setRyw(!ryw); setS(resetCounters(s)); }}>
            <span data-lang-en>Read your writes (log position check)</span>
            <span data-lang-vi>Đọc được cái mình ghi (so vị trí log)</span>
          </button>
          <button type="button" className={mono ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={mono} onClick={() => { setMono(!mono); setS(resetCounters(s)); }}>
            <span data-lang-en>Monotonic reads (Alice sticks to follower B)</span>
            <span data-lang-vi>Đọc đơn điệu (Alice luôn đọc follower B)</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>{s.now} s</b>
          <span><span data-lang-en>simulated clock</span><span data-lang-vi>đồng hồ mô phỏng</span></span>
        </div>
        <div className={s.ownMissing ? 'sd-stat is-bad' : 'sd-stat'}>
          <b>{s.ownMissing}</b>
          <span><span data-lang-en>reads missing her own comment</span><span data-lang-vi>lần đọc thiếu bình luận của chính cô ấy</span></span>
        </div>
        <div className={s.backInTime ? 'sd-stat is-bad' : 'sd-stat'}>
          <b>{s.backInTime}</b>
          <span><span data-lang-en>reads that went back in time</span><span data-lang-vi>lần đọc bị lùi về quá khứ</span></span>
        </div>
        <div className="sd-stat">
          <b>{s.reads ? `${leaderShare}%` : '–'}</b>
          <span><span data-lang-en>reads sent to the leader</span><span data-lang-vi>lượt đọc phải về leader</span></span>
        </div>
      </div>

      <p className="rlag-msg" aria-live="polite">
        {s.last === null ? (
          <>
            <span data-lang-en>Try: Alice posts, then refreshes right away. Then Bob posts, wait 2 s, and let Alice refresh a few times.</span>
            <span data-lang-vi>Thử: Alice đăng rồi tải lại trang ngay. Sau đó Bob đăng, chờ 2 giây, và cho Alice tải lại vài lần.</span>
          </>
        ) : (
          <>
            <span data-lang-en>
              Last read served by {NAME[s.last.replica].en}, which showed {s.last.seen.length} of {s.writes.length} comment{s.writes.length === 1 ? '' : 's'}.
              {s.last.missingOwn ? ' Her own comment is missing: it looks lost to her.' : ''}
              {s.last.wentBack ? ' A comment she saw a moment ago has vanished: time went backwards.' : ''}
              {!s.last.missingOwn && !s.last.wentBack ? ' Nothing odd this time.' : ''}
            </span>
            <span data-lang-vi>
              Lần đọc vừa rồi do {NAME[s.last.replica].vi} trả lời, hiện {s.last.seen.length}/{s.writes.length} bình luận.
              {s.last.missingOwn ? ' Bình luận của chính cô ấy không thấy đâu: với cô ấy, nó như đã mất.' : ''}
              {s.last.wentBack ? ' Một bình luận vừa thấy lúc nãy đã biến mất: thời gian như chạy lùi.' : ''}
              {!s.last.missingOwn && !s.last.wentBack ? ' Lần này không có gì lạ.' : ''}
            </span>
          </>
        )}
      </p>

      <div className="rlag-cols">
        {replicas.map((r) => {
          const pos = applied(s, r);
          const served = s.last?.replica === r;
          return (
            <div key={r} className={served ? 'rlag-col is-served' : 'rlag-col'}>
              <p className="rlag-h">
                <span data-lang-en>{NAME[r].en}</span>
                <span data-lang-vi>{NAME[r].vi}</span>
              </p>
              <p className="rlag-sub">
                <span data-lang-en>{r === 'leader' ? 'takes every write' : `applies writes ${LAG[r]} s late`} · log position {pos}</span>
                <span data-lang-vi>{r === 'leader' ? 'nhận mọi lệnh ghi' : `áp dụng lệnh ghi trễ ${LAG[r]} giây`} · vị trí log {pos}</span>
              </p>
              <ul className="rlag-list">
                {s.writes.length === 0 && (
                  <li className="rlag-none">
                    <span data-lang-en>no comments yet</span>
                    <span data-lang-vi>chưa có bình luận</span>
                  </li>
                )}
                {s.writes.map((w) => {
                  const has = w.pos <= pos;
                  return (
                    <li key={w.pos} className={`${has ? 'rlag-item' : 'rlag-item is-missing'}${w.author === 'alice' ? ' is-own' : ''}`}>
                      <span data-lang-en>{label(w, 'en')}{has ? '' : ' (not here yet)'}</span>
                      <span data-lang-vi>{label(w, 'vi')}{has ? '' : ' (chưa tới)'}</span>
                    </li>
                  );
                })}
              </ul>
              {served && (
                <p className="rlag-served">
                  <span data-lang-en>answered the last refresh</span>
                  <span data-lang-vi>trả lời lần tải lại vừa rồi</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
