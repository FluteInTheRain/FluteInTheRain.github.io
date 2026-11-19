import React, { useId, useState } from 'react';

// Illustrative model of a replication slot: the primary keeps every WAL byte the replica has not
// applied yet. Retained WAL grows at (write rate - apply rate). Numbers are made up for the demo.

const HEADROOM_GB = 2000; // free disk on the primary
const CAP_GB = 500; // max_slot_wal_keep_size in the "capped" setting
const MAX_DAYS = 14;

const CW = 360;
const CH = 210;
const PAD = { l: 48, r: 12, t: 14, b: 32 };
const cx = (d: number) => PAD.l + (d / MAX_DAYS) * (CW - PAD.l - PAD.r);
const cy = (gb: number) => CH - PAD.b - (gb / (HEADROOM_GB * 1.1)) * (CH - PAD.t - PAD.b);

export default function TradeOffsWalDemo() {
  const id = useId();
  const [write, setWrite] = useState(230); // GB per hour the backfill writes
  const [apply, setApply] = useState(200); // GB per hour the replica applies
  const [capped, setCapped] = useState(false);

  const growth = Math.max(0, write - apply); // GB per hour
  const growthDay = growth * 24;
  const daysToFull = growth > 0 ? HEADROOM_GB / growthDay : Infinity;
  const daysToCap = growth > 0 ? CAP_GB / growthDay : Infinity;

  const wal = (d: number) => {
    const v = growthDay * d;
    return Math.min(v, capped ? CAP_GB : HEADROOM_GB);
  };
  const path = Array.from({ length: MAX_DAYS * 4 + 1 }, (_, i) => {
    const d = i / 4;
    return `${i === 0 ? 'M' : 'L'} ${cx(d).toFixed(1)} ${cy(wal(d)).toFixed(1)}`;
  }).join(' ');

  const fmt = (d: number, vi = false) =>
    d < 1 ? `${Math.round(d * 24)} h` : vi ? `${d.toFixed(1).replace('.', ',')} ngày` : `${d.toFixed(1)} days`;
  let verdictEn: string;
  let verdictVi: string;
  let bad = false;
  if (growth === 0) {
    verdictEn = 'The replica keeps up. Retained WAL stays near zero.';
    verdictVi = 'Replica theo kịp. WAL bị giữ lại gần như bằng 0.';
  } else if (capped) {
    if (daysToCap <= MAX_DAYS) {
      verdictEn = `The cap holds the primary's disk, but after ${fmt(daysToCap)} the replica loses WAL it still needs and must be rebuilt.`;
      verdictVi = `Giới hạn bảo vệ đĩa của DB chính, nhưng sau ${fmt(daysToCap, true)} replica mất WAL nó còn cần và phải dựng lại.`;
    } else {
      verdictEn = 'Within these 14 days the cap is never reached.';
      verdictVi = 'Trong 14 ngày này chưa chạm giới hạn.';
    }
  } else if (daysToFull <= MAX_DAYS) {
    bad = true;
    verdictEn = `With no cap the primary's disk is full after ${fmt(daysToFull)}, and production stops.`;
    verdictVi = `Không có giới hạn thì đĩa DB chính đầy sau ${fmt(daysToFull, true)}, và production dừng.`;
  } else {
    verdictEn = 'The disk survives these 14 days, but the WAL is still growing.';
    verdictVi = 'Đĩa chịu được 14 ngày này, nhưng WAL vẫn đang tăng.';
  }

  return (
    <div className="tow">
      <div className="tow-controls">
        <div className="tow-row">
          <label htmlFor={`${id}-w`}>
            <span data-lang-en>Backfill writes</span>
            <span data-lang-vi>Backfill ghi</span>
          </label>
          <input id={`${id}-w`} type="range" min={50} max={400} step={10} value={write} onChange={(e) => setWrite(Number(e.target.value))} />
          <span className="tow-val">{write} GB/h</span>
        </div>
        <div className="tow-row">
          <label htmlFor={`${id}-a`}>
            <span data-lang-en>Replica applies</span>
            <span data-lang-vi>Replica áp dụng</span>
          </label>
          <input id={`${id}-a`} type="range" min={50} max={400} step={10} value={apply} onChange={(e) => setApply(Number(e.target.value))} />
          <span className="tow-val">{apply} GB/h</span>
        </div>
        <label className="tow-check">
          <input type="checkbox" checked={capped} onChange={(e) => setCapped(e.target.checked)} />
          <span data-lang-en>Cap retained WAL at {CAP_GB} GB (max_slot_wal_keep_size)</span>
          <span data-lang-vi>Giới hạn WAL giữ lại ở {CAP_GB} GB (max_slot_wal_keep_size)</span>
        </label>
      </div>

      <p className={bad ? 'tow-verdict is-bad' : 'tow-verdict'}>
        <span data-lang-en>{verdictEn}</span>
        <span data-lang-vi>{verdictVi}</span>
      </p>

      <svg viewBox={`0 0 ${CW} ${CH}`} className="tow-chart" role="img" aria-label={`Retained WAL over 14 days at ${growth} GB per hour of lag growth`}>
        {[0, 500, 1000, 1500, 2000].map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={CW - PAD.r} y1={cy(v)} y2={cy(v)} className="tow-gridline" />
            <text x={PAD.l - 6} y={cy(v) + 4} textAnchor="end" className="tow-tick">{v}</text>
          </g>
        ))}
        {[0, 7, 14].map((v) => (
          <text key={v} x={cx(v)} y={CH - PAD.b + 16} textAnchor="middle" className="tow-tick">{v}</text>
        ))}
        <text x={CW - PAD.r} y={CH - 2} textAnchor="end" className="tow-tick">
          <tspan data-lang-en>days</tspan>
          <tspan data-lang-vi>ngày</tspan>
        </text>
        <text x={CW - PAD.r} y={cy(HEADROOM_GB) + 14} textAnchor="end" className="tow-limit-label">
          <tspan data-lang-en>free disk: {HEADROOM_GB} GB (illustrative)</tspan>
          <tspan data-lang-vi>đĩa trống: {HEADROOM_GB} GB (minh hoạ)</tspan>
        </text>
        <line x1={PAD.l} x2={CW - PAD.r} y1={cy(HEADROOM_GB)} y2={cy(HEADROOM_GB)} className="tow-limit" />
        <path d={path} className="tow-curve" />
      </svg>
      <p className="tow-axis-note">
        <span data-lang-en>Vertical axis: WAL retained on the primary, in GB.</span>
        <span data-lang-vi>Trục dọc: lượng WAL bị giữ lại trên DB chính, tính bằng GB.</span>
      </p>
    </div>
  );
}
