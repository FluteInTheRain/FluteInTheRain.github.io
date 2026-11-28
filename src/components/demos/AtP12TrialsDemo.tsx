import React, { useId, useMemo, useState } from 'react';

// Pure-noise strategies: NS strategies, each 1,260 "in-sample" days plus 252 "next year" days of random
// daily returns (sd 1%, no edge at all). The reader picks how many were tried (N); the demo shows the best
// in-sample Sharpe among the first N and what that same strategy did in the next 252 days.
// Seeded mulberry32 + Box-Muller, so the numbers are identical to the Python run recorded in the brief.

const NS = 500;
const T_IS = 1260;
const T_OOS = 252;
const GRID = [1, 2, 5, 10, 20, 50, 100, 200, 500];
const SEEDS = [1, 2, 3, 4, 5];
const GAMMA = 0.5772156649015329;
const SD_EST = Math.sqrt(252 / T_IS);

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sharpe(x: Float64Array, from: number, to: number) {
  const n = to - from;
  let m = 0;
  for (let i = from; i < to; i++) m += x[i];
  m /= n;
  let v = 0;
  for (let i = from; i < to; i++) v += (x[i] - m) * (x[i] - m);
  v /= n - 1;
  return (m / Math.sqrt(v)) * Math.sqrt(252);
}

function drawStrategies(seed: number) {
  const r = mulberry(seed);
  const is: number[] = [];
  const oos: number[] = [];
  const xs = new Float64Array(T_IS + T_OOS);
  for (let k = 0; k < NS; k++) {
    for (let t = 0; t < T_IS + T_OOS; t++) {
      const u1 = Math.max(r(), 1e-12);
      const u2 = r();
      xs[t] = 0.01 * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    is.push(sharpe(xs, 0, T_IS));
    oos.push(sharpe(xs, T_IS, T_IS + T_OOS));
  }
  return { is, oos };
}

// Acklam's rational approximation of the standard normal quantile (relative error ~1e-9)
function normInv(p: number) {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - lo) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

// expected best Sharpe among N pure-noise strategies (Bailey and Lopez de Prado, 2014)
function expectedMax(n: number) {
  if (n === 1) return 0;
  return SD_EST * ((1 - GAMMA) * normInv(1 - 1 / n) + GAMMA * normInv(1 - 1 / (n * Math.E)));
}

const W = 420;
const H = 300;
const PAD = { l: 46, r: 14, t: 14, b: 40 };
const LIM = 3;
const sx = (v: number) => PAD.l + ((v + LIM) / (2 * LIM)) * (W - PAD.l - PAD.r);
const sy = (v: number) => H - PAD.b - ((v + LIM) / (2 * LIM)) * (H - PAD.t - PAD.b);

const f2 = (v: number, lang: 'en' | 'vi') => {
  const s = (Math.abs(v) < 0.0005 ? 0 : v).toFixed(2).replace('-', '−');
  return lang === 'vi' ? s.replace('.', ',') : s;
};

export default function AtP12TrialsDemo() {
  const sliderId = useId();
  const [gi, setGi] = useState(6);
  const [si, setSi] = useState(0);
  const seed = SEEDS[si];
  const data = useMemo(() => drawStrategies(seed), [seed]);
  const n = GRID[gi];

  let best = 0;
  for (let i = 1; i < n; i++) if (data.is[i] > data.is[best]) best = i;
  const bestIs = data.is[best];
  const bestOos = data.oos[best];
  const luck = expectedMax(n);

  return (
    <div className="atp12d">
      <div className="atp12d-controls">
        <label htmlFor={sliderId} className="atp12d-label">
          <span data-lang-en>Strategies tried</span>
          <span data-lang-vi>Số chiến lược đã thử</span>
        </label>
        <input id={sliderId} type="range" min={0} max={GRID.length - 1} step={1} value={gi} onChange={(e) => setGi(Number(e.target.value))} className="atp12d-range" />
        <b className="atp12d-val">{n}</b>
        <button type="button" className="atp12d-btn" onClick={() => setSi((s) => (s + 1) % SEEDS.length)}>
          <span data-lang-en>Draw again (set {seed} of {SEEDS.length})</span>
          <span data-lang-vi>Rút lại (bộ {seed}/{SEEDS.length})</span>
        </button>
      </div>

      <div className="atp12d-stats">
        <div className="atp12d-stat is-bad">
          <b>
            <span data-lang-en>{f2(bestIs, 'en')}</span>
            <span data-lang-vi>{f2(bestIs, 'vi')}</span>
          </b>
          <span>
            <span data-lang-en>Best backtest Sharpe</span>
            <span data-lang-vi>Sharpe backtest tốt nhất</span>
          </span>
        </div>
        <div className="atp12d-stat">
          <b>
            <span data-lang-en>{f2(bestOos, 'en')}</span>
            <span data-lang-vi>{f2(bestOos, 'vi')}</span>
          </b>
          <span>
            <span data-lang-en>Same strategy, next 252 days</span>
            <span data-lang-vi>Cùng chiến lược, 252 ngày kế</span>
          </span>
        </div>
        <div className="atp12d-stat">
          <b>
            <span data-lang-en>{f2(luck, 'en')}</span>
            <span data-lang-vi>{f2(luck, 'vi')}</span>
          </b>
          <span>
            <span data-lang-en>Best that luck alone is expected to reach</span>
            <span data-lang-vi>Mức tốt nhất mà riêng may mắn được kỳ vọng đạt</span>
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" className="atp12d-svg" aria-label="Scatter of backtest Sharpe ratio against next-year Sharpe ratio for the strategies tried. The cloud is round: a high backtest Sharpe says nothing about the next year.">
        {[-2, 0, 2].map((v) => (
          <g key={v}>
            <line x1={sx(-LIM)} x2={sx(LIM)} y1={sy(v)} y2={sy(v)} className={v === 0 ? 'atp12d-ax' : 'atp12d-grid'} />
            <line x1={sx(v)} x2={sx(v)} y1={sy(-LIM)} y2={sy(LIM)} className={v === 0 ? 'atp12d-ax' : 'atp12d-grid'} />
            <text x={PAD.l - 8} y={sy(v) + 4} textAnchor="end" className="atp12d-tick">{v}</text>
            <text x={sx(v)} y={H - PAD.b + 16} textAnchor="middle" className="atp12d-tick">{v}</text>
          </g>
        ))}
        {data.is.slice(0, n).map((v, i) => (
          <circle key={i} cx={sx(Math.max(-LIM, Math.min(LIM, v)))} cy={sy(Math.max(-LIM, Math.min(LIM, data.oos[i])))} r={2.4} className="atp12d-dot" />
        ))}
        <line x1={sx(bestIs)} x2={sx(bestIs)} y1={sy(-LIM)} y2={sy(LIM)} className="atp12d-pick" />
        <circle cx={sx(bestIs)} cy={sy(Math.max(-LIM, Math.min(LIM, bestOos)))} r={6} className="atp12d-best" />
        <text x={(PAD.l + W - PAD.r) / 2} y={H - 6} textAnchor="middle" className="atp12d-axis">
          <tspan data-lang-en>Sharpe in the backtest (5 years)</tspan>
          <tspan data-lang-vi>Sharpe trong backtest (5 năm)</tspan>
        </text>
        <text transform={`translate(12 ${(PAD.t + H - PAD.b) / 2}) rotate(-90)`} textAnchor="middle" className="atp12d-axis">
          <tspan data-lang-en>Sharpe next year</tspan>
          <tspan data-lang-vi>Sharpe năm kế tiếp</tspan>
        </text>
      </svg>

      <p className="atp12d-msg" aria-live="polite">
        <span data-lang-en>
          Of {n} strategies with no edge, the winner shows a backtest Sharpe of {f2(bestIs, 'en')}; in the next 252 days the same strategy gets {f2(bestOos, 'en')}.
        </span>
        <span data-lang-vi>
          Trong {n} chiến lược không có lợi thế nào, cái thắng có Sharpe backtest {f2(bestIs, 'vi')}; 252 ngày kế tiếp chính chiến lược đó chỉ được {f2(bestOos, 'vi')}.
        </span>
      </p>
    </div>
  );
}
