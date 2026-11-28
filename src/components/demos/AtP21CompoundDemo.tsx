import React, { useId, useState } from 'react';

// Whole-task success of an agent that takes n steps. Each step is right with probability p. A check after
// each step catches a wrong step with probability c and triggers one retry (right again with probability p);
// a wrong step the check misses goes through and ruins the task.
//   step success s = p + (1 - p) * c * p        task success = s ** n
// The numbers in the no-JS table were produced by a Python run of the same two formulas.

export function stepSuccess(p: number, c: number): number {
  return p + (1 - p) * c * p;
}
export function taskSuccess(p: number, n: number, c: number): number {
  return Math.pow(stepSuccess(p, c), n);
}
export const GRID = { ps: [0.9, 0.95, 0.99], ns: [5, 10, 20] };

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

export default function AtP21CompoundDemo() {
  const id = useId();
  const [p, setP] = useState(0.95);
  const [n, setN] = useState(10);
  const [c, setC] = useState(0.8);
  const bare = taskSuccess(p, n, 0);
  const checked = taskSuccess(p, n, c);
  const bars = [
    { key: 'bare', en: 'No check', vi: 'Không kiểm', v: bare, cls: 'is-bare' },
    { key: 'chk', en: 'Check after each step', vi: 'Kiểm sau mỗi bước', v: checked, cls: 'is-chk' },
  ];
  return (
    <div className="p21d">
      <div className="p21d-ctl">
        <label htmlFor={`${id}-p`}>
          <span data-lang-en>Each step is right</span>
          <span data-lang-vi>Mỗi bước đúng</span>
          <b>{Math.round(p * 100)}%</b>
        </label>
        <input id={`${id}-p`} type="range" min="80" max="99" step="1" value={Math.round(p * 100)} onChange={(e) => setP(Number(e.target.value) / 100)} />
        <label htmlFor={`${id}-n`}>
          <span data-lang-en>Steps in the task</span>
          <span data-lang-vi>Số bước của việc</span>
          <b>{n}</b>
        </label>
        <input id={`${id}-n`} type="range" min="1" max="20" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} />
        <label htmlFor={`${id}-c`}>
          <span data-lang-en>The check catches a wrong step</span>
          <span data-lang-vi>Bước kiểm bắt được một bước sai</span>
          <b>{Math.round(c * 100)}%</b>
        </label>
        <input id={`${id}-c`} type="range" min="0" max="100" step="5" value={Math.round(c * 100)} onChange={(e) => setC(Number(e.target.value) / 100)} />
      </div>
      <div className="p21d-bars" aria-live="polite">
        {bars.map((b) => (
          <div key={b.key} className="p21d-bar">
            <span className="p21d-bl">
              <span data-lang-en>{b.en}</span>
              <span data-lang-vi>{b.vi}</span>
            </span>
            <span className="p21d-track">
              <span className={`p21d-fill ${b.cls}`} style={{ width: `${Math.max(b.v * 100, 0.5)}%` }} />
            </span>
            <b className="p21d-val">{pct(b.v)}</b>
          </div>
        ))}
      </div>
      <p className="p21d-note">
        <span data-lang-en>Task success = (step success) to the power of the number of steps. With a check, step success = p + (1 - p) x catch rate x p: one retry on a caught error.</span>
        <span data-lang-vi>Xác suất xong việc = (xác suất một bước đúng) mũ số bước. Có bước kiểm: xác suất một bước đúng = p + (1 - p) x tỉ lệ bắt x p, tức thử lại một lần khi bắt được lỗi.</span>
      </p>
    </div>
  );
}
