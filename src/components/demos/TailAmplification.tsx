import React, { useId, useMemo, useState } from 'react';

// Interactive version of Dean & Barroso's tail-at-scale example:
// a page waits for N parallel backend calls; each call is slow with probability P_SLOW.
// The page is slow if ANY call is slow, so P(page slow) = 1 - (1 - P_SLOW)^N.

const P_SLOW = 0.01;
const MAX_N = 200;
const TRIALS = 1000;

const pageSlowProb = (n: number) => 1 - Math.pow(1 - P_SLOW, n);
const pct = (p: number) => `${(p * 100).toFixed(1)}%`;

// Seeded roll for the first render so server and client HTML match (no hydration mismatch).
function seededRoll(seed: number): boolean[] {
  let a = seed;
  const out: boolean[] = [];
  for (let i = 0; i < MAX_N; i++) {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    out.push(((t ^ (t >>> 14)) >>> 0) / 4294967296 < P_SLOW);
  }
  return out;
}
const randomRoll = () => Array.from({ length: MAX_N }, () => Math.random() < P_SLOW);

// Curve chart geometry (SVG user units)
const CW = 320;
const CH = 210;
const PAD = { l: 38, r: 12, t: 12, b: 30 };
const cx = (n: number) => PAD.l + (n / MAX_N) * (CW - PAD.l - PAD.r);
const cy = (p: number) => CH - PAD.b - p * (CH - PAD.t - PAD.b);
const CURVE = Array.from({ length: MAX_N + 1 }, (_, n) => `${n === 0 ? 'M' : 'L'} ${cx(n).toFixed(1)} ${cy(pageSlowProb(n)).toFixed(1)}`).join(' ');

export default function TailAmplification({ initialN = 100 }: { initialN?: number }) {
  const sliderId = useId(); // the post renders this twice (EN + VI), so ids must differ
  const [n, setN] = useState(initialN);
  const [roll, setRoll] = useState<boolean[]>(() => seededRoll(11));
  const [sim, setSim] = useState<{ n: number; slow: number } | null>(null);

  const p = pageSlowProb(n);
  const slowCalls = useMemo(() => roll.slice(0, n).reduce<number[]>((acc, s, i) => (s ? [...acc, i + 1] : acc), []), [roll, n]);
  const pageSlow = slowCalls.length > 0;

  const runTrials = () => {
    let slow = 0;
    for (let t = 0; t < TRIALS; t++) {
      for (let i = 0; i < n; i++) {
        if (Math.random() < P_SLOW) {
          slow++;
          break;
        }
      }
    }
    setSim({ n, slow });
  };

  return (
    <div className="ta">
      <div className="ta-control">
        <label htmlFor={sliderId}>
          <span data-lang-en>Backend calls per page</span>
          <span data-lang-vi>Số backend call cho mỗi trang</span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={1}
          max={MAX_N}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
        />
        <span className="ta-n">N = {n}</span>
      </div>

      <p className="ta-headline">
        <strong>{pct(p)}</strong>{' '}
        <span data-lang-en>of page loads wait for at least one slow call.</span>
        <span data-lang-vi>số lần tải trang phải chờ ít nhất một call chậm.</span>
      </p>
      <p className="ta-formula">
        1 − (1 − 0.01)<sup>{n}</sup> = {pct(p)}
      </p>

      <div className="ta-panels">
        <div className="ta-panel">
          <p className="ta-panel-title">
            <span data-lang-en>One page load: {n} calls in parallel, each slow 1% of the time</span>
            <span data-lang-vi>Một lần tải trang: {n} call song song, mỗi call chậm 1% số lần</span>
          </p>
          <div className="ta-grid" aria-label={`${n} backend calls, ${slowCalls.length} slow`}>
            {roll.slice(0, n).map((slow, i) => (
              <span key={i} className={slow ? 'ta-cell is-slow' : 'ta-cell'} title={slow ? `call #${i + 1}: 1 s` : `call #${i + 1}: 10 ms`} />
            ))}
          </div>
          <p className={pageSlow ? 'ta-result is-slow' : 'ta-result'}>
            {pageSlow ? (
              <>
                <span data-lang-en>Slow page: call #{slowCalls[0]} took 1 s, so the whole page took 1 s.</span>
                <span data-lang-vi>Trang chậm: call #{slowCalls[0]} mất 1 s, nên cả trang mất 1 s.</span>
              </>
            ) : (
              <>
                <span data-lang-en>Fast page: every call finished in about 10 ms.</span>
                <span data-lang-vi>Trang nhanh: mọi call đều xong trong khoảng 10 ms.</span>
              </>
            )}
          </p>
          <button type="button" className="ta-btn" onClick={() => setRoll(randomRoll())}>
            <span data-lang-en>Load the page again</span>
            <span data-lang-vi>Tải lại trang</span>
          </button>
        </div>

        <div className="ta-panel">
          <p className="ta-panel-title">
            <span data-lang-en>Chance the page is slow, as N grows</span>
            <span data-lang-vi>Xác suất trang bị chậm khi N tăng</span>
          </p>
          <svg viewBox={`0 0 ${CW} ${CH}`} className="ta-chart" role="img" aria-label={`Curve of 1 - 0.99^N; at N = ${n} it is ${pct(p)}`}>
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={CW - PAD.r} y1={cy(v)} y2={cy(v)} className="ta-gridline" />
                <text x={PAD.l - 6} y={cy(v) + 4} textAnchor="end" className="ta-tick">{v * 100}%</text>
              </g>
            ))}
            {[0, 50, 100, 150, 200].map((v) => (
              <text key={v} x={cx(v)} y={CH - PAD.b + 16} textAnchor="middle" className="ta-tick">{v}</text>
            ))}
            <text x={CW - PAD.r} y={CH - 2} textAnchor="end" className="ta-tick">N</text>
            <path d={CURVE} className="ta-curve" />
            <line x1={cx(n)} x2={cx(n)} y1={cy(0)} y2={cy(p)} className="ta-guide" />
            <line x1={PAD.l} x2={cx(n)} y1={cy(p)} y2={cy(p)} className="ta-guide" />
            <circle cx={cx(n)} cy={cy(p)} r="5" className="ta-point" />
          </svg>
          <button type="button" className="ta-btn" onClick={runTrials}>
            <span data-lang-en>Simulate {TRIALS.toLocaleString('en-US')} page loads</span>
            <span data-lang-vi>Mô phỏng {TRIALS.toLocaleString('vi-VN')} lần tải trang</span>
          </button>
          {sim && (
            <p className="ta-sim">
              <span data-lang-en>
                N = {sim.n}: {sim.slow} of {TRIALS.toLocaleString('en-US')} loads were slow ({pct(sim.slow / TRIALS)}). The formula says {pct(pageSlowProb(sim.n))}.
              </span>
              <span data-lang-vi>
                N = {sim.n}: {sim.slow} trên {TRIALS.toLocaleString('vi-VN')} lần bị chậm ({pct(sim.slow / TRIALS)}). Công thức cho {pct(pageSlowProb(sim.n))}.
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
