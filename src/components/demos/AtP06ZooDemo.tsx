import React, { useState } from 'react';

// Pure-noise factor zoo. Every number is from a Python run (normal approximation, two-sided):
//   p(|t|>2) = erfc(2/sqrt2) = 0.0455, p(|t|>3) = 0.0027
//   expected passes = N*p, chance of at least one = 1-(1-p)^N,
//   typical best |t| = the median of the largest |t| among N noise factors = inv_cdf(1-(1-0.5**(1/N))/2).
// A Monte Carlo (360 months, 400 trials) agreed: N=100 -> 4.61 passes at t>2, median best |t| 2.70.
// Row = [N, expected passes at t>2, P(at least one) at t>2, expected at t>3, P(at least one) at t>3, typical best |t|]
const ROWS: [number, number, number, number, number, number][] = [
  [1, 0.05, 0.046, 0.0, 0.003, 0.67],
  [5, 0.23, 0.208, 0.01, 0.013, 1.52],
  [10, 0.46, 0.372, 0.03, 0.027, 1.83],
  [20, 0.91, 0.606, 0.05, 0.053, 2.12],
  [50, 2.28, 0.903, 0.13, 0.126, 2.46],
  [100, 4.55, 0.991, 0.27, 0.237, 2.7],
  [200, 9.1, 1.0, 0.54, 0.418, 2.92],
  [400, 18.2, 1.0, 1.08, 0.661, 3.13],
];

const pct = (p: number) => `${(p * 100).toFixed(p < 0.1 ? 1 : 0)}%`;

export default function AtP06ZooDemo() {
  const [i, setI] = useState(5);
  const [bar, setBar] = useState<2 | 3>(2);
  const r = ROWS[i];
  const exp = bar === 2 ? r[1] : r[3];
  const any = bar === 2 ? r[2] : r[4];
  const best = r[5];
  const passes = best > bar;

  return (
    <div className="sd p06z">
      <div className="sd-controls">
        {ROWS.map((row, k) => (
          <button key={row[0]} type="button" className={k === i ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={k === i} onClick={() => setI(k)}>
            {row[0]}
          </button>
        ))}
        <span className="p06z-gap" />
        <button type="button" className={bar === 2 ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={bar === 2} onClick={() => setBar(2)}>
          <span data-lang-en>Bar: t &gt; 2</span>
          <span data-lang-vi>Ngưỡng: t &gt; 2</span>
        </button>
        <button type="button" className={bar === 3 ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={bar === 3} onClick={() => setBar(3)}>
          <span data-lang-en>Bar: t &gt; 3</span>
          <span data-lang-vi>Ngưỡng: t &gt; 3</span>
        </button>
      </div>
      <p className="p06z-lead" aria-live="polite">
        <span data-lang-en>
          Say you try <b>{r[0]}</b> factors that are all pure noise, and keep any whose t-statistic beats <b>{bar}</b>.
        </span>
        <span data-lang-vi>
          Giả sử bạn thử <b>{r[0]}</b> factor mà tất cả chỉ là nhiễu, rồi giữ lại cái nào có t-statistic vượt <b>{bar}</b>.
        </span>
      </p>
      <div className="p06z-grid">
        <div className="p06z-cell">
          <div className="p06z-num">{exp.toFixed(exp < 10 ? 2 : 1)}</div>
          <div className="p06z-lab"><span data-lang-en>factors pass by luck, on average</span><span data-lang-vi>factor vượt ngưỡng chỉ nhờ may, tính trung bình</span></div>
        </div>
        <div className="p06z-cell">
          <div className={any > 0.5 ? 'p06z-num is-bad' : 'p06z-num'}>{pct(any)}</div>
          <div className="p06z-lab"><span data-lang-en>chance that at least one passes</span><span data-lang-vi>khả năng có ít nhất một cái vượt</span></div>
        </div>
        <div className="p06z-cell">
          <div className={passes ? 'p06z-num is-bad' : 'p06z-num'}>{best.toFixed(2)}</div>
          <div className="p06z-lab"><span data-lang-en>typical t of the best one (half the time higher)</span><span data-lang-vi>t thường gặp của cái tốt nhất (một nửa số lần cao hơn)</span></div>
        </div>
      </div>
    </div>
  );
}
