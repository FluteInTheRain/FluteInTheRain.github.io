import React, { useState } from 'react';

// Capacity steps captured from a real Go 1.27.1 run (darwin/arm64) of:
//   var s []int; for i := 0; i < 1500; i++ { s = append(s, i); print cap(s) when it changes }
// Each pair is [length at which the capacity changed, new capacity].
const STEPS: Array<[number, number]> = [
  [1, 4],
  [5, 8],
  [9, 16],
  [17, 32],
  [33, 64],
  [65, 128],
  [129, 256],
  [257, 512],
  [513, 848],
  [849, 1280],
  [1281, 1792],
];

const MAX_N = 1500;

function capAfter(n: number): number {
  let cap = 0;
  for (const [at, c] of STEPS) if (n >= at) cap = c;
  return cap;
}
function stepsAfter(n: number): number {
  return STEPS.filter(([at]) => n >= at).length;
}

export default function GoSliceGrowthDemo() {
  const [n, setN] = useState(100);
  const [mode, setMode] = useState<'append' | 'prealloc'>('append');

  const cap = mode === 'append' ? capAfter(n) : n;
  const steps = mode === 'append' ? stepsAfter(n) : n > 0 ? 1 : 0;
  const scale = 1792;
  const lenPct = (n / scale) * 100;
  const capPct = (cap / scale) * 100;
  const code =
    mode === 'append'
      ? ['var s []int', `for i := 0; i < ${n}; i++ {`, '    s = append(s, i)', '}']
      : [`s := make([]int, 0, ${n})`, `for i := 0; i < ${n}; i++ {`, '    s = append(s, i)', '}'];

  return (
    <div className="sd gsg">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>How the slice is created</span>
            <span data-lang-vi>Cách tạo slice</span>
          </span>
          <button type="button" className={mode === 'append' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setMode('append')}>
            <span data-lang-en>Start empty</span>
            <span data-lang-vi>Bắt đầu rỗng</span>
          </button>
          <button type="button" className={mode === 'prealloc' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setMode('prealloc')}>
            <span data-lang-en>Reserve room first</span>
            <span data-lang-vi>Đặt chỗ trước</span>
          </button>
        </div>
        <label className="gsg-slider">
          <span>
            <span data-lang-en>Elements appended: </span>
            <span data-lang-vi>Số phần tử đã append: </span>
            <b>{n}</b>
          </span>
          <input type="range" min={0} max={MAX_N} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} aria-label="Elements appended" />
        </label>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>len (items in use)</span><span data-lang-vi>len (đang dùng)</span></span>
          <b>{n}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>cap (room reserved)</span><span data-lang-vi>cap (chỗ đã có)</span></span>
          <b>{cap}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Capacity changes</span><span data-lang-vi>Lần đổi cap</span></span>
          <b>{steps}</b>
        </div>
      </div>

      <div className="gsg-grid">
        <pre className="gsg-code">{code.join('\n')}</pre>
        <div className="gsg-bars" aria-hidden="true">
          <div className="gsg-track">
            <div className="gsg-cap" style={{ width: `${capPct}%` }} />
            <div className="gsg-len" style={{ width: `${lenPct}%` }} />
          </div>
          <div className="gsg-legend">
            <span><i className="gsg-sw is-len" /> len</span>
            <span><i className="gsg-sw is-cap" /> cap</span>
          </div>
        </div>
      </div>

      {mode === 'append' && (
        <div className="gsg-chips">
          {STEPS.map(([at, c]) => (
            <span key={at} className={n >= at ? 'gsg-chip is-hit' : 'gsg-chip'}>
              len {at} → cap {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
