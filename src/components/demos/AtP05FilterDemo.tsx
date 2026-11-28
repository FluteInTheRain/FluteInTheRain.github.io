import React, { useId, useMemo, useState } from 'react';

// Simulated market: 160 days from a two-state Markov chain (python, numpy default_rng seed 18).
// Calm: mean +0.06%, sd 0.7% a day. Turbulent: mean -0.10%, sd 2.0% a day.
// Stay probabilities 0.98 (calm) and 0.94 (turbulent). The filter is told the true parameters.
// Returns are the rounded values python produced, so the numbers match its run exactly.
const R = [-0.0073, -0.0072, 0.0071, 0.0046, 0.0204, 0.0081, -0.0014, 0.0041, -0.0031, 0.0034, 0.0007, 0.0015, 0.0002, 0.0055, 0.0055, 0.001, 0.0069, 0.0006, 0.0136, -0.0074, -0.0002, -0.001, 0.01, -0.0093, -0.003, 0.0005, -0.01, 0.0049, -0.0034, -0.015, -0.0072, -0.0071, 0.0008, 0.0112, -0.0029, 0.0049, 0.0008, 0.0031, 0.0046, -0.0076, -0.0031, 0.0024, 0.0026, -0.011, 0.0003, 0.0063, -0.0156, -0.0402, 0.0311, -0.0216, 0.0129, -0.0015, 0.0012, -0.001, 0.0005, 0.0027, -0.0179, -0.0146, 0.0413, -0.0191, 0.0051, 0.0053, -0.0038, -0.0064, -0.0072, 0.0109, 0.0082, -0.0099, -0.0026, -0.0027, 0.0091, -0.0044, 0.0029, -0.0035, 0.0002, -0.0038, -0.0392, -0.0137, -0.0014, 0.0003, -0.0134, -0.0004, 0.0022, 0.0003, 0.0194, 0.0066, 0.0103, -0.0033, 0.0049, 0.0016, -0.0015, -0.0103, -0.0265, -0.0274, 0.0452, -0.0037, -0.0564, 0.0119, -0.0277, 0.0076, 0.0147, -0.0382, -0.0033, 0.0145, -0.0039, 0.0055, 0.0082, 0.0035, -0.0055, 0.0127, 0.0088, -0.0035, 0.0117, 0.0023, -0.0051, 0.0025, 0.0325, 0.0052, -0.0065, 0.0107, 0.0016, -0.0137, 0.0022, 0.0059, 0.0143, -0.0167, -0.0394, -0.0057, -0.0151, -0.0293, -0.0003, -0.0085, -0.0104, -0.0095, -0.0217, -0.0039, 0.0108, -0.0024, 0.0008, -0.0115, 0.0001, -0.0049, -0.0082, 0.0113, -0.0023, 0.0033, -0.0054, -0.0005, 0.0063, 0.0007, -0.0052, 0.0142, 0.0076, -0.0121, -0.0081, 0.0028, 0.0005, 0.0033, 0.0035, -0.0033];
const TRUTH = '0000000000000000000000000000000000000000000000111111111111100000000000000001110000000000000111111111111100000000000110000000111111111111000000000000000000000000';
const MU = [0.0006, -0.001];
const SD = [0.007, 0.02];
const A = [[0.98, 0.02], [0.06, 0.94]];
const PI = [0.9, 0.1];

const npdf = (x: number, m: number, s: number) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

export function filterSmooth(r: number[]) {
  const T = r.length;
  const B = r.map((x) => [npdf(x, MU[0], SD[0]), npdf(x, MU[1], SD[1])]);
  const al: number[][] = [];
  let a = [PI[0] * B[0][0], PI[1] * B[0][1]];
  let z = a[0] + a[1];
  al.push([a[0] / z, a[1] / z]);
  for (let t = 1; t < T; t++) {
    const p = al[t - 1];
    a = [(p[0] * A[0][0] + p[1] * A[1][0]) * B[t][0], (p[0] * A[0][1] + p[1] * A[1][1]) * B[t][1]];
    z = a[0] + a[1];
    al.push([a[0] / z, a[1] / z]);
  }
  const be: number[][] = Array.from({ length: T }, () => [1, 1]);
  for (let t = T - 2; t >= 0; t--) {
    const w0 = B[t + 1][0] * be[t + 1][0];
    const w1 = B[t + 1][1] * be[t + 1][1];
    const b = [A[0][0] * w0 + A[0][1] * w1, A[1][0] * w0 + A[1][1] * w1];
    const s = b[0] + b[1];
    be[t] = [b[0] / s, b[1] / s];
  }
  const filt = al.map((p) => p[1]);
  const smooth = al.map((p, t) => {
    const u = p[0] * be[t][0];
    const v = p[1] * be[t][1];
    return v / (u + v);
  });
  return { filt, smooth };
}

// Sit in cash today if yesterday's signal exceeds the threshold.
export function runRule(sig: number[], r: number[], thr: number) {
  let eq = 1;
  let peak = 1;
  let dd = 0;
  let cash = 0;
  const curve = [1];
  for (let t = 0; t < r.length; t++) {
    const inCash = t > 0 && sig[t - 1] > thr;
    if (inCash) cash++;
    eq *= 1 + (inCash ? 0 : r[t]);
    peak = Math.max(peak, eq);
    dd = Math.min(dd, eq / peak - 1);
    curve.push(eq);
  }
  return { final: eq, dd, cash, curve };
}

const SIG = filterSmooth(R);
const BH = runRule(R.map(() => 0), R, 2);

const W = 860;
const X0 = 40;
const X1 = 840;
const xs = (t: number) => X0 + (t / (R.length - 1)) * (X1 - X0);

export default function AtP05FilterDemo() {
  const id = useId();
  const [mode, setMode] = useState<'filtered' | 'smoothed'>('filtered');
  const [thr10, setThr10] = useState(50);
  const thr = thr10 / 100;
  const sig = mode === 'filtered' ? SIG.filt : SIG.smooth;
  const res = useMemo(() => runRule(sig, R, thr), [sig, thr]);

  const pY = (p: number) => 150 - p * 80;
  const eY = (v: number) => 360 - (v - 0.7) * 180;
  const probPath = sig.map((p, t) => `${t ? 'L' : 'M'} ${xs(t).toFixed(1)} ${pY(p).toFixed(1)}`).join(' ');
  const curvePath = (c: number[]) => c.slice(1).map((v, t) => `${t ? 'L' : 'M'} ${xs(t).toFixed(1)} ${eY(v).toFixed(1)}`).join(' ');
  const bhCurve = BH.curve;
  const spells: { a: number; b: number }[] = [];
  for (let t = 0; t < TRUTH.length; t++) {
    if (TRUTH[t] === '1') {
      if (spells.length && spells[spells.length - 1].b === t - 1) spells[spells.length - 1].b = t;
      else spells.push({ a: t, b: t });
    }
  }
  const fmt = (v: number) => `${v.toFixed(2)}×`;
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="sd atp5">
      <div className="sd-controls">
        <div className="sd-group">
          <button type="button" className={`sd-btn${mode === 'filtered' ? ' is-on' : ''}`} onClick={() => setMode('filtered')} aria-pressed={mode === 'filtered'}>
            <span data-lang-en>Filtered: what you knew that day</span>
            <span data-lang-vi>Filtered: những gì biết được hôm đó</span>
          </button>
          <button type="button" className={`sd-btn${mode === 'smoothed' ? ' is-on' : ''}`} onClick={() => setMode('smoothed')} aria-pressed={mode === 'smoothed'}>
            <span data-lang-en>Smoothed: hindsight</span>
            <span data-lang-vi>Smoothed: nhìn lại sau này</span>
          </button>
        </div>
        <div className="sd-group atp5-slider">
          <label htmlFor={id} className="atp5-label">
            <span data-lang-en>Go to cash when P(turbulent) is above</span>
            <span data-lang-vi>Đứng ngoài tiền mặt khi P(hỗn loạn) lớn hơn</span>
          </label>
          <input id={id} type="range" min={10} max={90} step={10} value={thr10} onChange={(e) => setThr10(Number(e.target.value))} className="atp5-range" />
          <b className="atp5-val">{thr.toFixed(1)}</b>
        </div>
      </div>

      <div className="sd-stats">
        <div className={`sd-stat${res.final >= BH.final ? ' is-good' : ''}`}>
          <b>{fmt(res.final)}</b>
          <span><span data-lang-en>Rule: 1 unit becomes</span><span data-lang-vi>Luật: 1 đơn vị thành</span></span>
        </div>
        <div className="sd-stat">
          <b>{pct(res.dd)}</b>
          <span><span data-lang-en>Rule: worst fall</span><span data-lang-vi>Luật: sụt tối đa</span></span>
        </div>
        <div className="sd-stat">
          <b>{res.cash}</b>
          <span><span data-lang-en>Days in cash (of 160)</span><span data-lang-vi>Số ngày ở tiền mặt (trên 160)</span></span>
        </div>
        <div className="sd-stat is-bad">
          <b>{fmt(BH.final)}</b>
          <span><span data-lang-en>Buy and hold, worst fall {pct(BH.dd)}</span><span data-lang-vi>Cứ giữ, sụt tối đa {pct(BH.dd)}</span></span>
        </div>
      </div>

      <div className="atp5-scroll">
        <svg viewBox={`0 0 ${W} 400`} className="atp5-svg" role="img" aria-label="Simulated returns over 160 days with the hidden turbulent spells shaded, the model's probability of turbulence with a threshold line, and the growth of one unit under the rule and under buy and hold.">
          {spells.map((s) => (
            <rect key={s.a} x={xs(s.a) - 2} y="18" width={xs(s.b) - xs(s.a) + 4} height="362" className="atp5-spell" />
          ))}
          <text x={X0} y="14" className="atp5-t">
            <tspan data-lang-en>Shaded: the turbulent days the simulation knows about (a real market never tells you)</tspan>
            <tspan data-lang-vi>Phần tô: những ngày hỗn loạn mà mô phỏng biết (thị trường thật không bao giờ cho bạn biết)</tspan>
          </text>
          <line x1={X0} y1={pY(0)} x2={X1} y2={pY(0)} className="atp5-axis" />
          <line x1={X0} y1={pY(thr)} x2={X1} y2={pY(thr)} className="atp5-thr" />
          <text x={X1 - 2} y={pY(thr) - 5} textAnchor="end" className="atp5-t">
            <tspan data-lang-en>threshold</tspan>
            <tspan data-lang-vi>ngưỡng</tspan>
          </text>
          <path d={probPath} className="atp5-prob" />
          <text x={X0 + 4} y={pY(1) + 14} className="atp5-t">
            <tspan data-lang-en>P(turbulent)</tspan>
            <tspan data-lang-vi>P(hỗn loạn)</tspan>
          </text>
          <line x1={X0} y1="236" x2={X1} y2="236" className="atp5-axis" />
          {R.map((v, t) => (
            <line key={t} x1={xs(t)} x2={xs(t)} y1="236" y2={236 - v * 700} className="atp5-ret" />
          ))}
          <text x={X0 + 4} y="196" className="atp5-t">
            <tspan data-lang-en>daily return</tspan>
            <tspan data-lang-vi>lợi suất ngày</tspan>
          </text>
          <path d={curvePath(bhCurve)} className="atp5-bh" />
          <path d={curvePath(res.curve)} className="atp5-rule" />
          <text x={X0 + 4} y="276" className="atp5-t">
            <tspan data-lang-en>growth of 1 unit: grey is buy and hold, gold is the rule</tspan>
            <tspan data-lang-vi>1 đơn vị lớn lên: xám là cứ giữ, vàng là luật</tspan>
          </text>
        </svg>
      </div>
    </div>
  );
}
