import React, { useState } from 'react';

// Simulated stocks (z-scores), made up for this demo: 8 background stocks and 5 stocks to explain.
// Feature order: 12-month momentum, 6-month momentum, value, volatility, size.
const ALL: number[][] = [
  [-0.8, 0.87, 0.81, -0.35, -0.27],
  [0.24, 0.69, -0.89, 0.03, -0.96],
  [-1.66, -1.16, 0.77, 1.05, -0.81],
  [0.66, 0.13, -1.17, -0.18, -0.35],
  [1.14, 1.75, 0.55, -0.76, 0.97],
  [-0.45, -0.67, -1.04, -0.97, -0.98],
  [0.43, 1.29, -1.84, -0.22, -0.09],
  [0.25, -0.04, -0.59, -0.75, -0.61],
];
const LOW: number[][] = [5, 4, 7, 0].map((i) => ALL[i]); // the 4 background stocks with the lowest volatility
const STOCKS: Record<string, number[]> = {
  A: [-0.39, -0.2, -1.46, 1.88, 0.32],
  B: [-0.86, -1.6, 0.55, -1.18, 0.4],
  C: [-2.03, -0.22, 0.02, -1.08, -1.47],
  D: [1.41, 1.07, 0.51, -0.31, 2.39],
  E: [-0.05, -0.27, 0.09, 0.65, 0.19],
};
const NAMES = [
  { en: '12-month momentum', vi: 'Momentum 12 tháng' },
  { en: '6-month momentum', vi: 'Momentum 6 tháng' },
  { en: 'value', vi: 'value' },
  { en: 'volatility', vi: 'biến động' },
  { en: 'size', vi: 'quy mô' },
];
const MODELS = { both: [0.35, 0.25], one: [0.6, 0] } as const;
type ModelKey = keyof typeof MODELS;

function score(x: number[], w: readonly number[]) {
  return w[0] * x[0] + w[1] * x[1] + 0.3 * x[2] - 0.4 * x[3] + 0.15 * x[4] + 0.2 * x[0] * x[2];
}

// Exact Shapley values with a background: v(S) = mean over background rows of score(x on S, background elsewhere).
export function shapley(x: number[], bg: number[][], w: readonly number[]) {
  const n = 5;
  const val = (mask: number) => {
    let t = 0;
    for (const b of bg) t += score(b.map((bv, i) => ((mask >> i) & 1 ? x[i] : bv)), w);
    return t / bg.length;
  };
  const phi = [0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    for (let mask = 0; mask < 1 << n; mask++) {
      if ((mask >> i) & 1) continue;
      let k = 0;
      for (let j = 0; j < n; j++) k += (mask >> j) & 1;
      const weight = (fact(k) * fact(n - k - 1)) / fact(n);
      phi[i] += weight * (val(mask | (1 << i)) - val(mask));
    }
  }
  return { base: val(0), phi, fx: val((1 << n) - 1) };
}
function fact(n: number): number {
  return n <= 1 ? 1 : n * fact(n - 1);
}

const num = (n: number, vi: boolean, d = 3, sign = false) => {
  const s = Math.abs(n).toFixed(d);
  const body = vi ? s.replace('.', ',') : s;
  const neg = n < -(0.5 * Math.pow(10, -d));
  return (neg ? '-' : sign && n > 0 ? '+' : '') + body;
};

export default function AtP09ExplainDemo() {
  const [stock, setStock] = useState<string>('D');
  const [bgKey, setBgKey] = useState<'all' | 'low'>('all');
  const [modelKey, setModelKey] = useState<ModelKey>('both');

  const w = MODELS[modelKey];
  const bg = bgKey === 'all' ? ALL : LOW;
  const { base, phi, fx } = shapley(STOCKS[stock], bg, w);
  const ranks = Object.keys(STOCKS)
    .map((k) => ({ k, s: score(STOCKS[k], w) }))
    .sort((a, b) => b.s - a.s);
  const maxAbs = Math.max(0.3, ...phi.map((p) => Math.abs(p)));

  return (
    <div className="sd atp09d">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Stock</span>
            <span data-lang-vi>Cổ phiếu</span>
          </span>
          {Object.keys(STOCKS).map((k) => (
            <button key={k} type="button" className={stock === k ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={stock === k} onClick={() => setStock(k)}>
              {k}
            </button>
          ))}
        </div>
        <div className="sd-group">
          <span>
            <span data-lang-en>Compare with</span>
            <span data-lang-vi>So với</span>
          </span>
          <button type="button" className={bgKey === 'all' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={bgKey === 'all'} onClick={() => setBgKey('all')}>
            <span data-lang-en>all 8 stocks</span>
            <span data-lang-vi>cả 8 cổ phiếu</span>
          </button>
          <button type="button" className={bgKey === 'low' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={bgKey === 'low'} onClick={() => setBgKey('low')}>
            <span data-lang-en>4 calmest stocks</span>
            <span data-lang-vi>4 cổ phiếu êm nhất</span>
          </button>
        </div>
        <div className="sd-group">
          <span>
            <span data-lang-en>Model</span>
            <span data-lang-vi>Mô hình</span>
          </span>
          <button type="button" className={modelKey === 'both' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={modelKey === 'both'} onClick={() => setModelKey('both')}>
            <span data-lang-en>uses both momentum features</span>
            <span data-lang-vi>dùng cả hai momentum</span>
          </button>
          <button type="button" className={modelKey === 'one' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={modelKey === 'one'} onClick={() => setModelKey('one')}>
            <span data-lang-en>drops 6-month momentum</span>
            <span data-lang-vi>bỏ momentum 6 tháng</span>
          </button>
        </div>
      </div>

      <div className="atp09d-rows" role="table">
        <div className="atp09d-row atp09d-head" role="row">
          <span role="columnheader">
            <span data-lang-en>Feature</span>
            <span data-lang-vi>Feature</span>
          </span>
          <span role="columnheader">z</span>
          <span role="columnheader">
            <span data-lang-en>Moved the score by</span>
            <span data-lang-vi>Kéo điểm đi</span>
          </span>
        </div>
        <div className="atp09d-row" role="row">
          <span>
            <span data-lang-en>average score of the comparison stocks</span>
            <span data-lang-vi>điểm trung bình của nhóm đối chứng</span>
          </span>
          <span />
          <span className="atp09d-bar">
            <b>
              <span data-lang-en>{num(base, false)}</span>
              <span data-lang-vi>{num(base, true)}</span>
            </b>
          </span>
        </div>
        {phi.map((p, i) => (
          <div className="atp09d-row" role="row" key={i}>
            <span>
              <span data-lang-en>{NAMES[i].en}</span>
              <span data-lang-vi>{NAMES[i].vi}</span>
            </span>
            <span className="atp09d-z">
              <span data-lang-en>{num(STOCKS[stock][i], false, 2, true)}</span>
              <span data-lang-vi>{num(STOCKS[stock][i], true, 2, true)}</span>
            </span>
            <span className="atp09d-bar">
              <span className="atp09d-track">
                <i
                  className={p >= 0 ? 'is-up' : 'is-down'}
                  style={{ width: `${(Math.abs(p) / maxAbs) * 50}%`, [p >= 0 ? 'left' : 'right']: '50%' } as React.CSSProperties}
                />
              </span>
              <b>
                <span data-lang-en>{num(p, false, 3, true)}</span>
                <span data-lang-vi>{num(p, true, 3, true)}</span>
              </b>
            </span>
          </div>
        ))}
        <div className="atp09d-row atp09d-total" role="row">
          <span>
            <span data-lang-en>score for {stock} (average + five pushes)</span>
            <span data-lang-vi>điểm của {stock} (trung bình + năm cú đẩy)</span>
          </span>
          <span />
          <span className="atp09d-bar">
            <b>
              <span data-lang-en>{num(fx, false)}</span>
              <span data-lang-vi>{num(fx, true)}</span>
            </b>
          </span>
        </div>
      </div>

      <p className="atp09d-note">
        <span data-lang-en>
          Ranking by score: {ranks.map((r) => r.k).join(' > ')}. The ranking does not move when you change the comparison group; the explanation does.
        </span>
        <span data-lang-vi>
          Xếp theo điểm: {ranks.map((r) => r.k).join(' > ')}. Đổi nhóm đối chứng thì thứ hạng không đổi; lời giải thích thì đổi.
        </span>
      </p>
    </div>
  );
}
