import React, { useId, useMemo, useState } from 'react';

// Deterministic simulation of a binary risk classifier with an initial proxy penalty
// on Group B and a self-reinforcing retraining feedback loop over 8 generations.
// Ground truth is identical across both groups (40 safe, 10 genuinely risky per 50).

type Group = 'A' | 'B';
type Applicant = {
  id: string;
  group: Group;
  trueRisky: boolean;
  base: number;
};

const MAX_CYCLE = 8;
const MIN_THR = 30;
const MAX_THR = 85;
const DEFAULT_THR = 55;

function createCohort(): Applicant[] {
  let a = 42 | 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gauss = (mean: number, std: number) => {
    const u1 = Math.max(1e-6, rand());
    const u2 = rand();
    return mean + Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * std;
  };
  const list: Applicant[] = [];
  for (const group of ['A', 'B'] as const) {
    for (let i = 0; i < 50; i++) {
      const trueRisky = i >= 40; // 40 safe, 10 risky per group (20% base rate in both)
      const base = trueRisky ? gauss(68, 12) : gauss(39, 13);
      list.push({
        id: `${group}-${i}`,
        group,
        trueRisky,
        base: Math.min(98, Math.max(2, base)),
      });
    }
  }
  return list;
}

const COHORT = createCohort();

type CycleSnapshot = {
  cycle: number;
  scores: number[];
  fpA: number;
  fpRateA: number;
  fpB: number;
  fpRateB: number;
  fnTotal: number;
  fnRateTotal: number;
  ratio: number;
};

function runHistory(threshold: number): CycleSnapshot[] {
  let scores = COHORT.map((p) => Math.min(99, Math.max(1, p.base + (p.group === 'B' ? 8 : 0))));
  const snapshots: CycleSnapshot[] = [];

  for (let c = 0; c <= MAX_CYCLE; c++) {
    const evalGroup = (g: Group) => {
      const idx = COHORT.map((p, i) => (p.group === g ? i : -1)).filter((i) => i >= 0);
      const safe = idx.filter((i) => !COHORT[i].trueRisky);
      const risky = idx.filter((i) => COHORT[i].trueRisky);
      const fp = safe.filter((i) => scores[i] >= threshold).length;
      const fn = risky.filter((i) => scores[i] < threshold).length;
      return {
        fp,
        fpRate: Math.round((fp / safe.length) * 100),
        fn,
      };
    };

    const aStats = evalGroup('A');
    const bStats = evalGroup('B');
    const fnTotal = aStats.fn + bStats.fn;
    const ratio = aStats.fpRate === 0 ? (bStats.fpRate > 0 ? bStats.fpRate : 1) : bStats.fpRate / aStats.fpRate;

    snapshots.push({
      cycle: c,
      scores,
      fpA: aStats.fp,
      fpRateA: aStats.fpRate,
      fpB: bStats.fp,
      fpRateB: bStats.fpRate,
      fnTotal,
      fnRateTotal: Math.round((fnTotal / 20) * 100),
      ratio,
    });

    if (c < MAX_CYCLE) {
      const rejA = COHORT.filter((p, i) => p.group === 'A' && scores[i] >= threshold).length / 50;
      const rejB = COHORT.filter((p, i) => p.group === 'B' && scores[i] >= threshold).length / 50;
      const proxyAmplify = 0.8 + Math.max(0, rejB - rejA) * 4.5;
      scores = scores.map((s, i) => {
        const denied = s >= threshold;
        const p = COHORT[i];
        let next = s;
        if (denied) next += 1.6;
        else if (!p.trueRisky) next -= 0.4;
        if (p.group === 'B') next += proxyAmplify;
        return Math.min(99, Math.max(1, next));
      });
    }
  }
  return snapshots;
}

// Chart geometry for 8-generation disparity curve
const CW = 340;
const CH = 210;
const PAD = { l: 42, r: 18, t: 16, b: 32 };
const cx = (cycle: number) => PAD.l + (cycle / MAX_CYCLE) * (CW - PAD.l - PAD.r);
const cy = (pct: number) => CH - PAD.b - (pct / 100) * (CH - PAD.t - PAD.b);

export default function EthicsThresholdDemo() {
  const sliderId = useId();
  const [threshold, setThreshold] = useState(DEFAULT_THR);
  const [cycle, setCycle] = useState(0);

  const history = useMemo(() => runHistory(threshold), [threshold]);
  const current = history[cycle];

  const pathA = history
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${cx(h.cycle).toFixed(1)} ${cy(h.fpRateA).toFixed(1)}`)
    .join(' ');
  const pathB = history
    .map((h, i) => `${i === 0 ? 'M' : 'L'} ${cx(h.cycle).toFixed(1)} ${cy(h.fpRateB).toFixed(1)}`)
    .join(' ');

  const renderDots = (group: Group) => {
    const items = COHORT.map((p, i) => ({ p, score: current.scores[i] }))
      .filter((x) => x.p.group === group)
      .sort((a, b) => a.score - b.score);

    return items.map(({ p, score }) => {
      const denied = score >= threshold;
      let cls = 'eth-dot ';
      if (!p.trueRisky && denied) cls += 'is-fp'; // False positive: safe person trapped
      else if (p.trueRisky && !denied) cls += 'is-fn'; // False negative: risky missed
      else if (p.trueRisky && denied) cls += 'is-tp'; // Correctly flagged risky
      else cls += 'is-tn'; // Safe and approved

      const titleText = p.trueRisky
        ? denied
          ? `True positive (risky, denied at score ${Math.round(score)})`
          : `False negative (risky, approved at score ${Math.round(score)})`
        : denied
          ? `False positive: safe person trapped in algorithmic prison (score ${Math.round(score)})`
          : `True negative (safe, approved at score ${Math.round(score)})`;

      return <span key={p.id} className={cls} title={titleText} />;
    });
  };

  return (
    <div className="sd eth">
      <div className="sd-controls">
        <div className="sd-group eth-slider-group">
          <label htmlFor={sliderId} className="eth-label">
            <span data-lang-en>Rejection threshold</span>
            <span data-lang-vi>Ngưỡng từ chối</span>
          </label>
          <input
            id={sliderId}
            type="range"
            min={MIN_THR}
            max={MAX_THR}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="eth-range"
          />
          <b className="eth-val">{threshold}</b>
        </div>
        <div className="sd-group">
          <button
            type="button"
            className="sd-btn is-on"
            disabled={cycle >= MAX_CYCLE}
            onClick={() => setCycle((c) => Math.min(MAX_CYCLE, c + 1))}
          >
            <span data-lang-en>Retrain +1 cycle</span>
            <span data-lang-vi>Huấn luyện lại +1 vòng</span>
          </button>
          <button
            type="button"
            className="sd-btn"
            disabled={cycle >= MAX_CYCLE}
            onClick={() => setCycle(MAX_CYCLE)}
          >
            <span data-lang-en>Jump to cycle 8</span>
            <span data-lang-vi>Tới thẳng vòng 8</span>
          </button>
          <button
            type="button"
            className="sd-btn"
            onClick={() => {
              setThreshold(DEFAULT_THR);
              setCycle(0);
            }}
          >
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Làm lại</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>{current.fpRateA}%</b>
          <span>
            <span data-lang-en>Safe people trapped (Group A)</span>
            <span data-lang-vi>Người vô tội bị chặn (Nhóm A)</span>
          </span>
        </div>
        <div className={`sd-stat${current.fpRateB > current.fpRateA ? ' is-bad' : ''}`}>
          <b>{current.fpRateB}%</b>
          <span>
            <span data-lang-en>Safe people trapped (Group B)</span>
            <span data-lang-vi>Người vô tội bị chặn (Nhóm B)</span>
          </span>
        </div>
        <div className="sd-stat">
          <b>{current.fnTotal} / 20</b>
          <span>
            <span data-lang-en>Missed risky cases (FN)</span>
            <span data-lang-vi>Ca rủi ro bị lọt (FN)</span>
          </span>
        </div>
        <div className={`sd-stat${current.ratio >= 2 ? ' is-bad' : ''}`}>
          <b>
            {current.fpRateA === 0
              ? current.fpRateB === 0
                ? '1.0×'
                : '∞'
              : `${current.ratio.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}×`}
          </b>
          <span>
            <span data-lang-en>Harm disparity (Cycle {cycle})</span>
            <span data-lang-vi>Chênh lệch chặn nhầm (Vòng {cycle})</span>
          </span>
        </div>
      </div>

      <p className="eth-msg" aria-live="polite">
        <span data-lang-en>
          Cycle {cycle} of {MAX_CYCLE}: at threshold {threshold}, {current.fpA} of 40 safe applicants in Group A and{' '}
          {current.fpB} of 40 safe applicants in Group B are wrongly denied (False Positives), while {current.fnTotal} of 20 risky cases slip through.
        </span>
        <span data-lang-vi>
          Vòng {cycle}/{MAX_CYCLE}: ở ngưỡng {threshold}, có {current.fpA}/40 người an toàn ở Nhóm A và{' '}
          {current.fpB}/40 người an toàn ở Nhóm B bị từ chối oan (False Positive), trong khi {current.fnTotal}/20 ca rủi ro thật bị bỏ lọt.
        </span>
      </p>

      <div className="eth-panels">
        <div className="eth-panel">
          <p className="eth-panel-title">
            <span data-lang-en>Decisions by group (50 each, identical 80% safe ground truth)</span>
            <span data-lang-vi>Kết quả từng nhóm (50 người/nhóm, cùng tỉ lệ 80% thực sự an toàn)</span>
          </p>

          <div className="eth-group-block">
            <div className="eth-group-head">
              <span data-lang-en>Group A (baseline features)</span>
              <span data-lang-vi>Nhóm A (dữ liệu chuẩn)</span>
              <small>
                <span data-lang-en>{current.fpA} wrongly denied</span>
                <span data-lang-vi>{current.fpA} bị chặn oan</span>
              </small>
            </div>
            <div className="eth-dots">{renderDots('A')}</div>
          </div>

          <div className="eth-group-block">
            <div className="eth-group-head">
              <span data-lang-en>Group B (correlated proxy penalty)</span>
              <span data-lang-vi>Nhóm B (dính biến đại diện)</span>
              <small className={current.fpB > current.fpA ? 'is-bad' : ''}>
                <span data-lang-en>{current.fpB} wrongly denied</span>
                <span data-lang-vi>{current.fpB} bị chặn oan</span>
              </small>
            </div>
            <div className="eth-dots">{renderDots('B')}</div>
          </div>

          <div className="eth-legend">
            <span>
              <i className="eth-dot is-tn" />
              <span data-lang-en>Safe, approved</span>
              <span data-lang-vi>An toàn, duyệt</span>
            </span>
            <span>
              <i className="eth-dot is-fp" />
              <span data-lang-en>Safe, trapped (FP)</span>
              <span data-lang-vi>An toàn, bị chặn oan (FP)</span>
            </span>
            <span>
              <i className="eth-dot is-fn" />
              <span data-lang-en>Risky, missed (FN)</span>
              <span data-lang-vi>Rủi ro, bị lọt (FN)</span>
            </span>
            <span>
              <i className="eth-dot is-tp" />
              <span data-lang-en>Risky, caught</span>
              <span data-lang-vi>Rủi ro, chặn đúng</span>
            </span>
          </div>
        </div>

        <div className="eth-panel">
          <p className="eth-panel-title">
            <span data-lang-en>Wrongful rejection rate across retraining cycles</span>
            <span data-lang-vi>Tỉ lệ chặn nhầm qua các vòng huấn luyện lại</span>
          </p>
          <svg
            viewBox={`0 0 ${CW} ${CH}`}
            className="eth-chart"
            role="img"
            aria-label={`Line chart of false positive rates across retraining cycles 0 to 8 at threshold ${threshold}`}
          >
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={CW - PAD.r} y1={cy(v)} y2={cy(v)} className="eth-gridline" />
                <text x={PAD.l - 6} y={cy(v) + 4} textAnchor="end" className="eth-tick">
                  {v}%
                </text>
              </g>
            ))}
            {[0, 2, 4, 6, 8].map((c) => (
              <text key={c} x={cx(c)} y={CH - PAD.b + 16} textAnchor="middle" className="eth-tick">
                {c}
              </text>
            ))}
            <text x={CW - PAD.r} y={CH - 4} textAnchor="end" className="eth-tick">
              <tspan data-lang-en>retraining cycle</tspan>
              <tspan data-lang-vi>vòng lặp</tspan>
            </text>

            <path d={pathA} className="eth-line-a" />
            <path d={pathB} className="eth-line-b" />

            <line x1={cx(cycle)} x2={cx(cycle)} y1={cy(0)} y2={cy(100)} className="eth-guide" />
            <circle cx={cx(cycle)} cy={cy(current.fpRateA)} r="4.5" className="eth-pt-a" />
            <circle cx={cx(cycle)} cy={cy(current.fpRateB)} r="5" className="eth-pt-b" />

            <text x={cx(MAX_CYCLE)} y={Math.max(PAD.t + 12, cy(history[MAX_CYCLE].fpRateB) - 9)} textAnchor="end" className="eth-lbl-b">
              <tspan data-lang-en>Group B</tspan>
              <tspan data-lang-vi>Nhóm B</tspan>
            </text>
            <text x={cx(MAX_CYCLE)} y={Math.min(cy(0) - 8, cy(history[MAX_CYCLE].fpRateA) + 14)} textAnchor="end" className="eth-lbl-a">
              <tspan data-lang-en>Group A</tspan>
              <tspan data-lang-vi>Nhóm A</tspan>
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
