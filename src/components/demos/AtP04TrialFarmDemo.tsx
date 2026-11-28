import React, { useId, useMemo, useState } from 'react';

// Strategy farm: N strategies whose daily returns are pure noise (mean 0, sd 1%).
// The page shows the best one, as a backtest report would. Numbers are checked
// against a Python port of the same PRNG (see the post's verification notes).

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function erfc(x: number) {
  // Abramowitz & Stegun 7.1.26 on |x|, max abs error ~1.5e-7
  const z = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * z);
  const y = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const r = y * Math.exp(-z * z);
  return x >= 0 ? r : 2 - r;
}

export interface Farm {
  best: number;
  sr: number[];
  t: number;
  p: number;
  pAdj: number;
  curve: number[];
  curves: number[][];
}

const DAYS_PER_YEAR = 252;
const CURVE_STEP = 6;
const MAX_DRAWN = 60;

export function simulate(seed: number, n: number, years: number): Farm {
  const rnd = mulberry32(seed);
  const days = DAYS_PER_YEAR * years;
  const sr: number[] = [];
  const curves: number[][] = [];
  let bestIdx = 0;
  let bestSr = -Infinity;
  for (let s = 0; s < n; s++) {
    let sum = 0;
    let sumSq = 0;
    const path: number[] = [0];
    for (let d = 0; d < days; d++) {
      const u1 = Math.max(rnd(), 1e-12);
      const u2 = rnd();
      const r = 0.01 * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      sum += r;
      sumSq += r * r;
      if ((d + 1) % CURVE_STEP === 0) path.push(sum);
    }
    const mean = sum / days;
    const sd = Math.sqrt((sumSq - days * mean * mean) / (days - 1));
    const v = (mean / sd) * Math.sqrt(DAYS_PER_YEAR);
    sr.push(v);
    if (s < MAX_DRAWN || v > bestSr) curves[s] = path;
    if (v > bestSr) { bestSr = v; bestIdx = s; }
  }
  const t = bestSr * Math.sqrt(years);
  const p = erfc(Math.abs(t) / Math.SQRT2);
  const drawn = curves.map((c, i) => ({ c, i })).filter(({ c, i }) => c && (i < MAX_DRAWN || i === bestIdx));
  return { best: bestIdx, sr, t, p, pAdj: Math.min(1, n * p), curve: curves[bestIdx], curves: drawn.map(({ c }) => c) };
}

const f2 = (x: number) => x.toFixed(2);
const fp = (p: number) => (p < 0.001 ? p.toExponential(1) : p.toFixed(3));

export default function AtP04TrialFarmDemo() {
  const nId = useId();
  const yId = useId();
  const [n, setN] = useState(45);
  const [years, setYears] = useState(5);
  const [seed, setSeed] = useState(2);
  const farm = useMemo(() => simulate(seed, n, years), [seed, n, years]);

  const W = 640, H = 230, PL = 8, PR = 8, PT = 10, PB = 10;
  const all = farm.curves.flat();
  const lo = Math.min(...all, -0.1);
  const hi = Math.max(...all, 0.1);
  const len = farm.curves[0].length - 1;
  const X = (i: number) => PL + (i / len) * (W - PL - PR);
  const Y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
  const path = (c: number[]) => c.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');

  const raw = farm.p < 0.05;
  const adj = farm.pAdj < 0.05;

  return (
    <div className="sd atp04">
      <div className="atp04-sliders">
        <div>
          <div className="atp04-row">
            <label htmlFor={nId} className="atp04-lbl">
              <span data-lang-en>Strategies tried</span>
              <span data-lang-vi>Số chiến lược đã thử</span>
            </label>
            <span className="atp04-val">{n}</span>
          </div>
          <input id={nId} className="atp04-range" type="range" min={1} max={300} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} />
        </div>
        <div>
          <div className="atp04-row">
            <label htmlFor={yId} className="atp04-lbl">
              <span data-lang-en>Years of daily data</span>
              <span data-lang-vi>Số năm dữ liệu ngày</span>
            </label>
            <span className="atp04-val">{years}</span>
          </div>
          <input id={yId} className="atp04-range" type="range" min={1} max={10} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} />
        </div>
        <div className="sd-group">
          <button type="button" className="sd-btn" onClick={() => setSeed((s) => s + 1)}>
            <span data-lang-en>Draw new noise</span>
            <span data-lang-vi>Xào nhiễu mới</span>
          </button>
          <span className="atp04-seed">seed {seed}</span>
        </div>
      </div>

      <svg className="atp04-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cumulative return curves of the simulated strategies, the best one highlighted">
        <line x1={PL} x2={W - PR} y1={Y(0)} y2={Y(0)} className="atp04-zero" />
        {farm.curves.map((c, i) => (c === farm.curve ? null : <path key={i} d={path(c)} className="atp04-thin" />))}
        <path d={path(farm.curve)} className="atp04-best" />
      </svg>

      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>Best annual Sharpe</span><span data-lang-vi>Sharpe năm cao nhất</span></span>
          <b>{f2(farm.sr[farm.best])}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Its t-statistic</span><span data-lang-vi>t-statistic của nó</span></span>
          <b>{f2(farm.t)}</b>
        </div>
        <div className={raw ? 'sd-stat is-bad' : 'sd-stat'}>
          <span><span data-lang-en>p-value, one test</span><span data-lang-vi>p-value nếu chỉ thử một lần</span></span>
          <b>{fp(farm.p)}</b>
        </div>
        <div className={adj ? 'sd-stat is-bad' : 'sd-stat is-good'}>
          <span><span data-lang-en>p-value after {n} tries</span><span data-lang-vi>p-value sau {n} lần thử</span></span>
          <b>{fp(farm.pAdj)}</b>
        </div>
      </div>
      <p className="atp04-note">
        <span data-lang-en>
          Every strategy here has a true edge of exactly zero. {raw ? 'The best one still passes the usual 5% test.' : 'The best one does not pass the 5% test this time.'} {adj ? 'Even the corrected p-value stays under 5%, which happens in about 1 draw in 20.' : 'After multiplying the p-value by the number of tries, it no longer looks special.'}
        </span>
        <span data-lang-vi>
          Mọi chiến lược ở đây có lợi thế thật bằng đúng 0. {raw ? 'Vậy mà chiến lược tốt nhất vẫn qua bài test 5% thông thường.' : 'Lần này chiến lược tốt nhất không qua bài test 5%.'} {adj ? 'Ngay cả p-value đã hiệu chỉnh vẫn dưới 5%, chuyện này xảy ra khoảng 1 lần trong 20.' : 'Nhân p-value với số lần thử xong, nó không còn gì đặc biệt.'}
        </span>
      </p>
    </div>
  );
}
