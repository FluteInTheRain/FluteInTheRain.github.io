import React, { useId, useState } from 'react';

// Assumed companies (same numbers as the SbP08ExporterImporter figure), VND billions.
const BASE_RATE = 23_000;
const EXPORTER = { usdRevenueM: 10, vndCostBn: 200 };
const IMPORTER = { vndSalesBn: 250, usdInputsM: 8, otherCostBn: 40 };

const exporterProfit = (rate: number) => (EXPORTER.usdRevenueM * 1e6 * rate) / 1e9 - EXPORTER.vndCostBn;
const importerProfit = (rate: number) => IMPORTER.vndSalesBn - (IMPORTER.usdInputsM * 1e6 * rate) / 1e9 - IMPORTER.otherCostBn;

const pct = (now: number, base: number) => (base === 0 ? 0 : ((now - base) / Math.abs(base)) * 100);
const sign = (n: number, d = 1) => `${n >= 0 ? '+' : '-'}${Math.abs(n).toFixed(d)}`;

export default function SbP08RateFxDemo() {
  const peId = useId();
  const depId = useId();
  const fxId = useId();
  const [pe, setPe] = useState(15);
  const [deposit, setDeposit] = useState(4);
  const [fx, setFx] = useState(24_500);

  const ep = 100 / pe;
  const spare = ep - deposit;
  const breakEvenPe = 100 / deposit;

  const exp = exporterProfit(fx);
  const imp = importerProfit(fx);
  const expBase = exporterProfit(BASE_RATE);
  const impBase = importerProfit(BASE_RATE);

  return (
    <div className="sd sbp8d">
      <div className="sbp8d-grid">
        <div className="sbp8d-panel">
          <p className="sbp8d-h">
            <span data-lang-en>1. A stock against the deposit</span>
            <span data-lang-vi>1. Cổ phiếu so với tiền gửi</span>
          </p>
          <div className="sbp8d-row">
            <label htmlFor={peId} className="sbp8d-lbl">
              <span data-lang-en>Stock P/E</span>
              <span data-lang-vi>P/E của cổ phiếu</span>
            </label>
            <span className="sbp8d-val">{pe}×</span>
          </div>
          <input id={peId} className="sbp8d-range" type="range" min={8} max={30} step={1} value={pe} onChange={(e) => setPe(Number(e.target.value))} />
          <div className="sbp8d-row">
            <label htmlFor={depId} className="sbp8d-lbl">
              <span data-lang-en>12-month deposit rate</span>
              <span data-lang-vi>Lãi gửi 12 tháng</span>
            </label>
            <span className="sbp8d-val">{deposit.toFixed(1)}%</span>
          </div>
          <input id={depId} className="sbp8d-range" type="range" min={3} max={8} step={0.5} value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
          <div className="sd-stats">
            <div className="sd-stat">
              <span>
                <span data-lang-en>Earnings yield (1 ÷ P/E)</span>
                <span data-lang-vi>Tỷ suất lợi nhuận (1 ÷ P/E)</span>
              </span>
              <b>{ep.toFixed(2)}%</b>
            </div>
            <div className="sd-stat">
              <span>
                <span data-lang-en>Spare yield over deposit</span>
                <span data-lang-vi>Hơn tiền gửi</span>
              </span>
              <b>{sign(spare, 2)} pt</b>
            </div>
            <div className="sd-stat">
              <span>
                <span data-lang-en>P/E that only matches the deposit</span>
                <span data-lang-vi>P/E chỉ ngang tiền gửi</span>
              </span>
              <b>{breakEvenPe.toFixed(1)}×</b>
            </div>
          </div>
        </div>

        <div className="sbp8d-panel">
          <p className="sbp8d-h">
            <span data-lang-en>2. One dollar rate, two companies (VND bn)</span>
            <span data-lang-vi>2. Một tỷ giá, hai công ty (tỷ đồng)</span>
          </p>
          <div className="sbp8d-row">
            <label htmlFor={fxId} className="sbp8d-lbl">
              <span data-lang-en>USD/VND</span>
              <span data-lang-vi>USD/VND</span>
            </label>
            <span className="sbp8d-val">{fx.toLocaleString('en-US')}</span>
          </div>
          <input id={fxId} className="sbp8d-range" type="range" min={22_500} max={25_000} step={100} value={fx} onChange={(e) => setFx(Number(e.target.value))} />
          <div className="sd-stats">
            <div className="sd-stat">
              <span>
                <span data-lang-en>Exporter profit (base 23,000: {expBase.toFixed(0)})</span>
                <span data-lang-vi>Lãi nhà xuất khẩu (gốc 23.000: {expBase.toFixed(0)})</span>
              </span>
              <b>
                {exp.toFixed(1)} ({sign(pct(exp, expBase), 0)}%)
              </b>
            </div>
            <div className="sd-stat">
              <span>
                <span data-lang-en>Importer profit (base 23,000: {impBase.toFixed(0)})</span>
                <span data-lang-vi>Lãi nhà nhập khẩu (gốc 23.000: {impBase.toFixed(0)})</span>
              </span>
              <b>
                {imp.toFixed(1)} ({sign(pct(imp, impBase), 0)}%)
              </b>
            </div>
          </div>
        </div>
      </div>
      <p className="sbp8d-note">
        <span data-lang-en>
          Assumptions: exporter earns USD 10m and pays 200 bn VND of costs; importer sells 250 bn VND, buys USD 8m of inputs and has 40 bn other costs. Real firms also hold USD debt and hedges.
        </span>
        <span data-lang-vi>
          Giả định: nhà xuất khẩu thu 10 triệu USD, chi phí 200 tỷ đồng; nhà nhập khẩu bán 250 tỷ đồng, mua 8 triệu USD nguyên liệu, chi phí khác 40 tỷ. Doanh nghiệp thật còn có nợ USD và công cụ phòng ngừa.
        </span>
      </p>
    </div>
  );
}
