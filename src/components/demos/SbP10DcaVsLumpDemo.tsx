import React, { useId, useState } from 'react';

// Last trading-day close of the VN-Index for each month (HOSE data via SSI iBoard chart history API, read 2026-11-26).
const CLOSES: ReadonlyArray<readonly [string, number]> = [
  ['2021-01', 1056.61],
  ['2021-02', 1168.47],
  ['2021-03', 1191.44],
  ['2021-04', 1239.39],
  ['2021-05', 1328.05],
  ['2021-06', 1408.55],
  ['2021-07', 1310.05],
  ['2021-08', 1331.47],
  ['2021-09', 1342.06],
  ['2021-10', 1444.27],
  ['2021-11', 1478.44],
  ['2021-12', 1498.28],
  ['2022-01', 1478.96],
  ['2022-02', 1490.13],
  ['2022-03', 1492.15],
  ['2022-04', 1366.8],
  ['2022-05', 1292.68],
  ['2022-06', 1197.6],
  ['2022-07', 1206.33],
  ['2022-08', 1280.51],
  ['2022-09', 1132.11],
  ['2022-10', 1027.94],
  ['2022-11', 1048.42],
  ['2022-12', 1007.09],
  ['2023-01', 1111.18],
  ['2023-02', 1024.68],
  ['2023-03', 1064.64],
  ['2023-04', 1049.12],
  ['2023-05', 1075.17],
  ['2023-06', 1120.18],
  ['2023-07', 1222.9],
  ['2023-08', 1224.05],
  ['2023-09', 1154.15],
  ['2023-10', 1028.19],
  ['2023-11', 1094.13],
  ['2023-12', 1129.93],
  ['2024-01', 1164.31],
  ['2024-02', 1252.73],
  ['2024-03', 1284.09],
  ['2024-04', 1209.52],
  ['2024-05', 1261.72],
  ['2024-06', 1245.32],
  ['2024-07', 1251.51],
  ['2024-08', 1283.87],
  ['2024-09', 1287.94],
  ['2024-10', 1264.48],
  ['2024-11', 1250.46],
  ['2024-12', 1266.78],
  ['2025-01', 1265.05],
  ['2025-02', 1305.36],
  ['2025-03', 1306.86],
  ['2025-04', 1226.3],
  ['2025-05', 1332.6],
  ['2025-06', 1376.07],
  ['2025-07', 1502.52],
  ['2025-08', 1682.21],
  ['2025-09', 1661.7],
  ['2025-10', 1639.65],
  ['2025-11', 1690.99],
  ['2025-12', 1784.49],
  ['2026-01', 1829.04],
  ['2026-02', 1880.33],
  ['2026-03', 1674.49],
  ['2026-04', 1854.1],
  ['2026-05', 1863.49],
  ['2026-06', 1860.01],
  ['2026-07', 1735.78],
  ['2026-08', 1832.12],
  ['2026-09', 1768.62],
  ['2026-10', 1741.62],
];

const FEE_OPTIONS = [0.0003, 0.0015, 0.0025] as const;
const PIT = 0.001; // 0.1% of gross sale value

const PRESETS = [
  { id: 'jan22', start: '2022-01', months: 24, labelEn: 'Jan 2022 start (near the high)', labelVi: 'Bắt đầu 1/2022 (gần đỉnh)' },
  { id: 'jan21', start: '2021-01', months: 24, labelEn: 'Jan 2021 start (before the peak)', labelVi: 'Bắt đầu 1/2021 (trước đỉnh)' },
  { id: 'jan23', start: '2023-01', months: 24, labelEn: 'Jan 2023 start (after the fall)', labelVi: 'Bắt đầu 1/2023 (sau đợt giảm)' },
] as const;

export interface DcaResult {
  invested: number;
  avgCost: number;
  lastIndex: number;
  dcaNet: number;
  dcaPct: number;
  lumpNet: number;
  lumpPct: number;
}

export function runDca(startIdx: number, months: number, monthly: number, fee: number): DcaResult {
  const slice = CLOSES.slice(startIdx, startIdx + months);
  let units = 0;
  let invested = 0;
  for (const [, close] of slice) {
    units += (monthly * (1 - fee)) / close;
    invested += monthly;
  }
  const lastIndex = slice[slice.length - 1][1];
  const dcaNet = units * lastIndex * (1 - fee - PIT);
  const lumpUnits = (invested * (1 - fee)) / slice[0][1];
  const lumpNet = lumpUnits * lastIndex * (1 - fee - PIT);
  return {
    invested,
    avgCost: invested / units,
    lastIndex,
    dcaNet,
    dcaPct: (dcaNet / invested - 1) * 100,
    lumpNet,
    lumpPct: (lumpNet / invested - 1) * 100,
  };
}

const fmt = (n: number, vi: boolean) => Math.round(n).toLocaleString(vi ? 'vi-VN' : 'en-US');
const pct = (n: number, vi: boolean) => {
  const s = n.toFixed(1);
  return (n > 0 ? '+' : '') + (vi ? s.replace('.', ',') : s) + '%';
};
const num2 = (n: number, vi: boolean) => (vi ? n.toFixed(2).replace('.', ',') : n.toFixed(2));

export default function SbP10DcaVsLumpDemo() {
  const monthsId = useId();
  const amountId = useId();
  const startId = useId();
  const [start, setStart] = useState<string>('2022-01');
  const [months, setMonths] = useState<number>(24);
  const [monthly, setMonthly] = useState<number>(5_000_000);
  const [feeIdx, setFeeIdx] = useState<number>(1);

  const startIdx = CLOSES.findIndex(([k]) => k === start);
  const maxMonths = CLOSES.length - startIdx;
  const n = Math.min(months, maxMonths);
  const r = runDca(startIdx, n, monthly, FEE_OPTIONS[feeIdx]);
  const lastKey = CLOSES[startIdx + n - 1][0];

  const pickPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!;
    setStart(p.start);
    setMonths(p.months);
  };

  return (
    <div className="sd sbp10d">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Preset</span>
            <span data-lang-vi>Mẫu</span>
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={start === p.start && months === p.months ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={start === p.start && months === p.months}
              onClick={() => pickPreset(p.id)}
            >
              <span data-lang-en>{p.labelEn}</span>
              <span data-lang-vi>{p.labelVi}</span>
            </button>
          ))}
        </div>
        <div className="sd-group">
          <span>
            <span data-lang-en>Commission per order</span>
            <span data-lang-vi>Phí mỗi lệnh</span>
          </span>
          {FEE_OPTIONS.map((f, i) => (
            <button
              key={f}
              type="button"
              className={feeIdx === i ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={feeIdx === i}
              onClick={() => setFeeIdx(i)}
            >
              <span data-lang-en>{(f * 100).toFixed(2)}%</span>
              <span data-lang-vi>{(f * 100).toFixed(2).replace('.', ',')}%</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sbp10d-sliders">
        <div>
          <div className="sbp10d-row">
            <label htmlFor={startId} className="sbp10d-lbl">
              <span data-lang-en>First buy (month)</span>
              <span data-lang-vi>Tháng mua đầu tiên</span>
            </label>
            <span className="sbp10d-val">{start}</span>
          </div>
          <select id={startId} className="sbp10d-select" value={start} onChange={(e) => setStart(e.target.value)}>
            {CLOSES.slice(0, CLOSES.length - 5).map(([k]) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="sbp10d-row">
            <label htmlFor={monthsId} className="sbp10d-lbl">
              <span data-lang-en>Number of monthly buys</span>
              <span data-lang-vi>Số tháng mua đều</span>
            </label>
            <span className="sbp10d-val">{n}</span>
          </div>
          <input id={monthsId} className="sbp10d-range" type="range" min={6} max={36} step={1} value={n} onChange={(e) => setMonths(Number(e.target.value))} />
        </div>
        <div>
          <div className="sbp10d-row">
            <label htmlFor={amountId} className="sbp10d-lbl">
              <span data-lang-en>Amount per month</span>
              <span data-lang-vi>Số tiền mỗi tháng</span>
            </label>
            <span className="sbp10d-val">
              <span data-lang-en>{fmt(monthly, false)} VND</span>
              <span data-lang-vi>{fmt(monthly, true)} đ</span>
            </span>
          </div>
          <input id={amountId} className="sbp10d-range" type="range" min={1_000_000} max={20_000_000} step={1_000_000} value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} />
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <span>
            <span data-lang-en>Invested ({start} to {lastKey})</span>
            <span data-lang-vi>Đã bỏ vào ({start} đến {lastKey})</span>
          </span>
          <b>
            <span data-lang-en>{fmt(r.invested, false)} VND</span>
            <span data-lang-vi>{fmt(r.invested, true)} đ</span>
          </b>
        </div>
        <div className="sd-stat">
          <span>
            <span data-lang-en>Average index cost</span>
            <span data-lang-vi>Điểm VN-Index bình quân đã mua</span>
          </span>
          <b>
            <span data-lang-en>{num2(r.avgCost, false)} vs last {num2(r.lastIndex, false)}</span>
            <span data-lang-vi>{num2(r.avgCost, true)} so với cuối kỳ {num2(r.lastIndex, true)}</span>
          </b>
        </div>
        <div className="sd-stat">
          <span>
            <span data-lang-en>DCA result after sale costs</span>
            <span data-lang-vi>Kết quả DCA sau chi phí bán</span>
          </span>
          <b>
            <span data-lang-en>{fmt(r.dcaNet, false)} VND ({pct(r.dcaPct, false)})</span>
            <span data-lang-vi>{fmt(r.dcaNet, true)} đ ({pct(r.dcaPct, true)})</span>
          </b>
        </div>
        <div className="sd-stat">
          <span>
            <span data-lang-en>Lump sum on day one</span>
            <span data-lang-vi>Bỏ một lần ngay từ đầu</span>
          </span>
          <b>
            <span data-lang-en>{fmt(r.lumpNet, false)} VND ({pct(r.lumpPct, false)})</span>
            <span data-lang-vi>{fmt(r.lumpNet, true)} đ ({pct(r.lumpPct, true)})</span>
          </b>
        </div>
      </div>

      <p className="sbp10d-note">
        <span data-lang-en>
          Assumptions: the VN-Index is treated as something you can buy in any amount (no lot rounding, no dividends). Each buy pays the commission; the final sale pays the commission plus 0.1% PIT. {r.dcaPct > r.lumpPct ? 'DCA finished ahead of the lump sum in this window.' : 'The lump sum finished ahead of DCA in this window.'}
        </span>
        <span data-lang-vi>
          Giả định: coi VN-Index như thứ mua được với số tiền bất kỳ (không làm tròn lô, không tính cổ tức). Mỗi lần mua trả phí môi giới; lần bán cuối trả phí cộng thuế TNCN 0,1%. {r.dcaPct > r.lumpPct ? 'Trong khoảng này DCA về đích trước phương án bỏ một lần.' : 'Trong khoảng này bỏ một lần về đích trước DCA.'}
        </span>
      </p>
    </div>
  );
}
