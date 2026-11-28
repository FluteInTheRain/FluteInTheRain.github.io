import React, { useId, useMemo, useState } from 'react';

// A tabular Q-learning agent trains on ONE simulated price path whose daily
// returns are pure noise (mean 0, sd 1%). It is then run, with its learned
// table frozen, on the path it trained on and on 100 fresh noise paths.
// The numbers are checked against a Python port (see the post's notes).

// <sim>
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function noiseReturns(rnd: () => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = Math.max(rnd(), 1e-12);
    const u2 = rnd();
    out.push(0.01 * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
  }
  return out;
}

const K = 4;

// state = signs of the last 4 daily returns (16 patterns) x current position (flat or long)
function stateOf(r: number[], t: number, p: number): number {
  let s = 0;
  for (let j = 1; j <= K; j++) s = s * 2 + (t - j >= 0 && r[t - j] > 0 ? 1 : 0);
  return s * 2 + p;
}

export function trainQ(r: number[], cost: number, epochs: number, seed = 7): number[][] {
  const alpha = 0.1, gamma = 0.9, eps = 0.1;
  const rnd = mulberry32(seed);
  const Q: number[][] = [];
  for (let i = 0; i < 2 ** K * 2; i++) Q.push([0, 0]);
  for (let e = 0; e < epochs; e++) {
    let p = 0;
    for (let t = 0; t < r.length; t++) {
      const s = stateOf(r, t, p);
      let a: number;
      if (rnd() < eps) a = rnd() < 0.5 ? 1 : 0;
      else a = Q[s][1] > Q[s][0] ? 1 : 0;
      const rew = a * r[t] - cost * Math.abs(a - p);
      let tgt = rew;
      if (t + 1 < r.length) {
        const s2 = stateOf(r, t + 1, a);
        tgt = rew + gamma * Math.max(Q[s2][0], Q[s2][1]);
      }
      Q[s][a] += alpha * (tgt - Q[s][a]);
      p = a;
    }
  }
  return Q;
}

export function runGreedy(Q: number[][], r: number[], cost: number, keepCurve = false) {
  let p = 0, total = 0, trades = 0;
  const curve: number[] = keepCurve ? [0] : [];
  for (let t = 0; t < r.length; t++) {
    const s = stateOf(r, t, p);
    const a = Q[s][1] > Q[s][0] ? 1 : 0;
    total += a * r[t] - cost * Math.abs(a - p);
    trades += Math.abs(a - p);
    p = a;
    if (keepCurve) curve.push(total);
  }
  return { total, trades, curve };
}

export function experiment(seed: number, days: number, epochs: number, cost: number) {
  const r = noiseReturns(mulberry32(seed), days);
  const Q = trainQ(r, cost, epochs);
  const inS = runGreedy(Q, r, cost, true);
  let sum = 0, pos = 0;
  const fresh: number[][] = [];
  for (let i = 0; i < 100; i++) {
    const r2 = noiseReturns(mulberry32(1000 + i), days);
    const o = runGreedy(Q, r2, cost, i < 8);
    sum += o.total;
    if (o.total > 0) pos++;
    if (i < 8) fresh.push(o.curve);
  }
  return { inSample: inS.total, trades: inS.trades, curve: inS.curve, freshMean: sum / 100, freshPos: pos, fresh };
}
// </sim>

const DAYS = [250, 500, 1000];
const EPOCHS = [10, 50, 200, 1000];
const COSTS_BP = [0, 2, 5, 10];

const pct = (x: number) => `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(1)}%`;

export default function AtP19TrainOnNoiseDemo() {
  const dId = useId();
  const eId = useId();
  const cId = useId();
  const [di, setDi] = useState(1);
  const [ei, setEi] = useState(3);
  const [ci, setCi] = useState(2);
  const [seed, setSeed] = useState(2);
  const res = useMemo(
    () => experiment(seed, DAYS[di], EPOCHS[ei], COSTS_BP[ci] / 10000),
    [seed, di, ei, ci],
  );

  const W = 640, H = 230, PL = 8, PR = 8, PT = 10, PB = 10;
  const all = [...res.curve, ...res.fresh.flat(), 0];
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const len = res.curve.length - 1;
  const X = (i: number) => PL + (i / len) * (W - PL - PR);
  const Y = (v: number) => PT + (1 - (v - lo) / (hi - lo || 1)) * (H - PT - PB);
  const path = (c: number[]) => c.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');

  return (
    <div className="sd atp19">
      <div className="atp19-sliders">
        <div>
          <div className="atp19-row">
            <label htmlFor={eId} className="atp19-lbl">
              <span data-lang-en>Passes over the same history</span>
              <span data-lang-vi>Số lần học lại cùng một lịch sử</span>
            </label>
            <span className="atp19-val">{EPOCHS[ei]}</span>
          </div>
          <input id={eId} className="atp19-range" type="range" min={0} max={EPOCHS.length - 1} step={1} value={ei} onChange={(e) => setEi(Number(e.target.value))} />
        </div>
        <div>
          <div className="atp19-row">
            <label htmlFor={cId} className="atp19-lbl">
              <span data-lang-en>Cost per position change</span>
              <span data-lang-vi>Phí mỗi lần đổi vị thế</span>
            </label>
            <span className="atp19-val">{(COSTS_BP[ci] / 100).toFixed(2)}%</span>
          </div>
          <input id={cId} className="atp19-range" type="range" min={0} max={COSTS_BP.length - 1} step={1} value={ci} onChange={(e) => setCi(Number(e.target.value))} />
        </div>
        <div>
          <div className="atp19-row">
            <label htmlFor={dId} className="atp19-lbl">
              <span data-lang-en>Days of training history</span>
              <span data-lang-vi>Số ngày lịch sử huấn luyện</span>
            </label>
            <span className="atp19-val">{DAYS[di]}</span>
          </div>
          <input id={dId} className="atp19-range" type="range" min={0} max={DAYS.length - 1} step={1} value={di} onChange={(e) => setDi(Number(e.target.value))} />
        </div>
        <div className="sd-group">
          <button type="button" className="sd-btn" onClick={() => setSeed((s) => s + 1)}>
            <span data-lang-en>New training history</span>
            <span data-lang-vi>Lịch sử huấn luyện mới</span>
          </button>
          <span className="atp19-seed">seed {seed}</span>
        </div>
      </div>

      <svg className="atp19-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cumulative return of the trained agent on its training path (dark line) and on eight fresh noise paths (grey lines)">
        <line x1={PL} x2={W - PR} y1={Y(0)} y2={Y(0)} className="atp19-zero" />
        {res.fresh.map((c, i) => <path key={i} d={path(c)} className="atp19-thin" />)}
        <path d={path(res.curve)} className="atp19-train" />
      </svg>
      <p className="atp19-legend">
        <span data-lang-en>Dark line: the path the agent trained on. Grey lines: eight of the 100 fresh paths. All of them are random.</span>
        <span data-lang-vi>Đường đậm: chuỗi giá mà agent đã học. Đường xám: tám trong 100 chuỗi giá mới. Tất cả đều là ngẫu nhiên.</span>
      </p>

      <div className="sd-stats">
        <div className="sd-stat is-good">
          <span><span data-lang-en>Return on its training path</span><span data-lang-vi>Lợi suất trên chuỗi đã học</span></span>
          <b>{pct(res.inSample)}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Position changes there</span><span data-lang-vi>Số lần đổi vị thế</span></span>
          <b>{res.trades}</b>
        </div>
        <div className={res.freshMean < 0 ? 'sd-stat is-bad' : 'sd-stat'}>
          <span><span data-lang-en>Mean over 100 fresh paths</span><span data-lang-vi>Trung bình 100 chuỗi mới</span></span>
          <b>{pct(res.freshMean)}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Fresh paths that ended in profit</span><span data-lang-vi>Chuỗi mới kết thúc có lãi</span></span>
          <b>{res.freshPos} / 100</b>
        </div>
      </div>
    </div>
  );
}
