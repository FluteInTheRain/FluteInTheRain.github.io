import React, { useState } from 'react';

// How much of day 1 still reaches day T when the memory is multiplied by a factor each step.
// Plain recurrent net: factor a per step. LSTM cell state: forget gate f per step (other paths ignored).
// remaining(T) = factor ** T. Numbers are cross-checked against a Python run (see post report).

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

const W = 640;
const H = 220;
const PL = 44;
const PR = 14;
const PT = 14;
const PB = 30;
const YMAX = 1.2;

function fmt(v: number): string {
  if (v >= 1000) return v.toFixed(0);
  if (v >= 10) return v.toFixed(1);
  if (v >= 0.0001) return v.toFixed(4);
  return v.toExponential(1);
}

export default function AtP15MemoryDemo() {
  const [steps, setSteps] = useState(50);
  const [a, setA] = useState(0.9);
  const [f, setF] = useState(0.97);

  const px = (t: number) => PL + (t / steps) * (W - PL - PR);
  const py = (v: number) => PT + (1 - Math.min(v, YMAX) / YMAX) * (H - PT - PB);
  const path = (k: number) => {
    const pts: string[] = [];
    for (let t = 0; t <= steps; t++) pts.push(`${px(t).toFixed(1)},${py(Math.pow(k, t)).toFixed(1)}`);
    return pts.join(' ');
  };
  const ra = Math.pow(a, steps);
  const rf = Math.pow(f, steps);

  return (
    <div className="p15-demo">
      <div className="p15-controls">
        <label>
          <span>{L(`Steps between day 1 and today: ${steps}`, `Số bước từ ngày 1 tới hôm nay: ${steps}`)}</span>
          <input type="range" min={5} max={100} step={1} value={steps} onChange={(e) => setSteps(Number(e.target.value))} />
        </label>
        <label>
          <span>{L(`Plain net: memory factor per step ${a.toFixed(2)}`, `Mạng thường: hệ số bộ nhớ mỗi bước ${a.toFixed(2)}`)}</span>
          <input type="range" min={0.5} max={1.1} step={0.01} value={a} onChange={(e) => setA(Number(e.target.value))} />
        </label>
        <label>
          <span>{L(`LSTM: forget gate ${f.toFixed(2)}`, `LSTM: cổng quên ${f.toFixed(2)}`)}</span>
          <input type="range" min={0.8} max={1} step={0.01} value={f} onChange={(e) => setF(Number(e.target.value))} />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart of how much of day 1 remains after each step, for a plain recurrent net and for an LSTM forget gate" className="p15-chart">
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <g key={g}>
            <line x1={PL} x2={W - PR} y1={py(g)} y2={py(g)} className="p15-grid" />
            <text x={PL - 6} y={py(g) + 4} textAnchor="end" className="p15-tick">{Math.round(g * 100)}%</text>
          </g>
        ))}
        <polyline points={path(a)} className="p15-line-a" />
        <polyline points={path(f)} className="p15-line-f" />
        <text x={PL} y={H - 8} className="p15-tick">{L('day 1', 'ngày 1')}</text>
        <text x={W - PR} y={H - 8} textAnchor="end" className="p15-tick">{L(`today (step ${steps})`, `hôm nay (bước ${steps})`)}</text>
      </svg>

      <div className="p15-out">
        <div className="p15-card p15-a">
          <div className="p15-k">{L('Plain net keeps', 'Mạng thường giữ lại')}</div>
          <div className="p15-v">{fmt(ra)}</div>
          <div className="p15-s">{`${a.toFixed(2)}^${steps}`}</div>
        </div>
        <div className="p15-card p15-f">
          <div className="p15-k">{L('LSTM memory line keeps', 'Đường bộ nhớ LSTM giữ lại')}</div>
          <div className="p15-v">{fmt(rf)}</div>
          <div className="p15-s">{`${f.toFixed(2)}^${steps}`}</div>
        </div>
      </div>
      <p className="p15-note">
        {L(
          'A value of 1 means day 1 arrives intact; 0.005 means it arrives at half a percent. Above 1 the signal blows up, which breaks training in the other direction. Only the memory line is modelled here; the real gradient has more paths.',
          'Giá trị 1 nghĩa là ngày 1 tới nơi nguyên vẹn; 0,005 nghĩa là chỉ còn nửa phần trăm. Trên 1 thì tín hiệu phình to, làm hỏng huấn luyện theo chiều ngược lại. Ở đây chỉ mô hình hoá đường bộ nhớ; gradient thật còn nhiều đường khác.',
        )}
      </p>
    </div>
  );
}
