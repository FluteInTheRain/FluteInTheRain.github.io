import React, { useState, useId } from 'react';

const FEE_TIERS = [
  { id: '0.03', rate: 0.0003, labelEn: '0.03% (promo)', labelVi: '0,03% (ưu đãi)' },
  { id: '0.15', rate: 0.0015, labelEn: '0.15% (standard)', labelVi: '0,15% (phổ thông)' },
  { id: '0.25', rate: 0.0025, labelEn: '0.25% (full)', labelVi: '0,25% (trọn gói)' },
] as const;

const PIT_SELL_TAX = 0.001; // 0.1% on gross sell
const VSDC_CUSTODY_PER_SHARE_MO = 0.27; // VND per share per month
const ADV_RATE_PER_YEAR = 0.12; // ~12%/yr example advance rate

const fmt = (n: number, vi: boolean) => Math.round(n).toLocaleString(vi ? 'vi-VN' : 'en-US');

export default function SbP04TradeCostDemo() {
  const buyId = useId();
  const sellId = useId();
  const [feeTier, setFeeTier] = useState<'0.03' | '0.15' | '0.25'>('0.15');
  const [advDays, setAdvDays] = useState<number>(0);
  const [buyPrice, setBuyPrice] = useState<number>(25_000);
  const [sellPrice, setSellPrice] = useState<number>(27_500);
  const shares = 4_000;
  const monthsHeld = 3;

  const rate = FEE_TIERS.find((t) => t.id === feeTier)!.rate;
  const buyGross = shares * buyPrice;
  const buyFee = buyGross * rate;
  const totalOutlay = buyGross + buyFee;

  const sellGross = shares * sellPrice;
  const sellFee = sellGross * rate;
  const sellTax = sellGross * PIT_SELL_TAX;
  const custodyFee = shares * VSDC_CUSTODY_PER_SHARE_MO * monthsHeld;
  const advFee = advDays > 0 ? (sellGross - sellFee - sellTax) * ADV_RATE_PER_YEAR * (advDays / 365) : 0;

  const netProceeds = sellGross - sellFee - sellTax - advFee;
  const netPnl = netProceeds - totalOutlay - custodyFee;
  const rawBreakEven = (buyPrice * (1 + rate)) / (1 - rate - PIT_SELL_TAX);
  const tickBreakEven = Math.ceil(rawBreakEven / 50) * 50; // HOSE 50-VND tick tier

  return (
    <div className="sd sbp4d">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Broker fee</span>
            <span data-lang-vi>Phí CTCK</span>
          </span>
          {FEE_TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={feeTier === t.id ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={feeTier === t.id}
              onClick={() => setFeeTier(t.id)}
            >
              <span data-lang-en>{t.labelEn}</span>
              <span data-lang-vi>{t.labelVi}</span>
            </button>
          ))}
        </div>

        <div className="sd-group">
          <span>
            <span data-lang-en>Cash advance</span>
            <span data-lang-vi>Ứng trước tiền</span>
          </span>
          {[0, 2, 4].map((d) => (
            <button
              key={d}
              type="button"
              className={advDays === d ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={advDays === d}
              onClick={() => setAdvDays(d)}
            >
              <span data-lang-en>{d === 0 ? 'Wait T+2' : `${d}d (~12%/yr)`}</span>
              <span data-lang-vi>{d === 0 ? 'Đợi T+2' : `${d} ngày (~12%/năm)`}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sbp4d-sliders">
        <div>
          <div className="sbp4d-row">
            <label className="sbp4d-lbl" htmlFor={buyId}>
              <span data-lang-en>Buy price (4,000 shares)</span>
              <span data-lang-vi>Giá mua (4.000 cổ phiếu)</span>
            </label>
            <output className="sbp4d-val">
              <span data-lang-en>{fmt(buyPrice, false)} VND</span>
              <span data-lang-vi>{fmt(buyPrice, true)} đồng</span>
            </output>
          </div>
          <input
            id={buyId}
            className="sbp4d-range"
            type="range"
            min={15_000}
            max={40_000}
            step={500}
            value={buyPrice}
            onChange={(e) => setBuyPrice(Number(e.currentTarget.value))}
          />
        </div>

        <div>
          <div className="sbp4d-row">
            <label className="sbp4d-lbl" htmlFor={sellId}>
              <span data-lang-en>Sell price</span>
              <span data-lang-vi>Giá bán</span>
            </label>
            <output className="sbp4d-val">
              <span data-lang-en>{fmt(sellPrice, false)} VND</span>
              <span data-lang-vi>{fmt(sellPrice, true)} đồng</span>
            </output>
          </div>
          <input
            id={sellId}
            className="sbp4d-range"
            type="range"
            min={15_000}
            max={45_000}
            step={500}
            value={sellPrice}
            onChange={(e) => setSellPrice(Number(e.currentTarget.value))}
          />
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>
            <span data-lang-en>{fmt(buyFee + sellFee + sellTax + custodyFee + advFee, false)} VND</span>
            <span data-lang-vi>{fmt(buyFee + sellFee + sellTax + custodyFee + advFee, true)} đồng</span>
          </b>
          <span>
            <span data-lang-en>Total fees + 0.1% sell tax (3 mo custody)</span>
            <span data-lang-vi>Tổng phí + thuế bán 0,1% (3 tháng lưu ký)</span>
          </span>
        </div>

        <div className="sd-stat">
          <b>
            <span data-lang-en>{netPnl >= 0 ? `+${fmt(netPnl, false)}` : fmt(netPnl, false)} VND</span>
            <span data-lang-vi>{netPnl >= 0 ? `+${fmt(netPnl, true)}` : fmt(netPnl, true)} đồng</span>
          </b>
          <span>
            <span data-lang-en>Net profit / loss after all tolls</span>
            <span data-lang-vi>Lãi / lỗ ròng thực tế sau phí thuế</span>
          </span>
        </div>

        <div className="sd-stat">
          <b>
            <span data-lang-en>{fmt(tickBreakEven, false)} VND</span>
            <span data-lang-vi>{fmt(tickBreakEven, true)} đồng</span>
          </b>
          <span>
            <span data-lang-en>First profitable HOSE sell tick</span>
            <span data-lang-vi>Bước giá HOSE đầu tiên có lãi</span>
          </span>
        </div>
      </div>

      <p className="sbp4d-note">
        <span data-lang-en>
          Breakdown: Buy fee {fmt(buyFee, false)} · Custody (3 mo) {fmt(custodyFee, false)} · Sell fee {fmt(sellFee, false)} · 0.1% PIT tax {fmt(sellTax, false)} · Advance {fmt(advFee, false)} VND.
        </span>
        <span data-lang-vi>
          Chi tiết: Phí mua {fmt(buyFee, true)} · Lưu ký (3 tháng) {fmt(custodyFee, true)} · Phí bán {fmt(sellFee, true)} · Thuế bán 0,1% {fmt(sellTax, true)} · Ứng tiền {fmt(advFee, true)} đồng.
        </span>
      </p>
    </div>
  );
}
