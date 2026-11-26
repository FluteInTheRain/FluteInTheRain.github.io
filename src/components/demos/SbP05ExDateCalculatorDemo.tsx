import React, { useId, useState } from 'react';

type Venue = 'HOSE' | 'HNX' | 'UPCOM';

const VENUES: { id: Venue; band: number }[] = [
  { id: 'HOSE', band: 0.07 },
  { id: 'HNX', band: 0.10 },
  { id: 'UPCOM', band: 0.15 },
];

const tickFor = (venue: Venue, price: number) => {
  if (venue !== 'HOSE') return 100;
  if (price < 10_000) return 10;
  if (price < 50_000) return 50;
  return 100;
};

const roundTick = (venue: Venue, raw: number) => {
  const t = tickFor(venue, raw);
  return Math.max(t, Math.round(raw / t) * t);
};

const ceilTick = (venue: Venue, refPrice: number, band: number) => {
  const t = tickFor(venue, refPrice * (1 + band));
  return Math.floor((refPrice * (1 + band) + 1e-6) / t) * t;
};

const floorTick = (venue: Venue, refPrice: number, band: number) => {
  const t = tickFor(venue, refPrice * (1 - band));
  return Math.ceil((refPrice * (1 - band) - 1e-6) / t) * t;
};

const fmt = (n: number, vi: boolean) => Math.round(n).toLocaleString(vi ? 'vi-VN' : 'en-US');

export default function SbP05ExDateCalculatorDemo() {
  const priceId = useId();
  const cashId = useId();
  const stockId = useId();
  const rightsId = useId();

  const [venue, setVenue] = useState<Venue>('HOSE');
  const [price, setPrice] = useState<number>(30_000);
  const [cashPct, setCashPct] = useState<number>(20); // 20% par = 2,000 VND
  const [stockPct, setStockPct] = useState<number>(20); // 20% = 5:1
  const [rightsPct, setRightsPct] = useState<number>(0); // 0% = none, 50% = 2:1
  const [rightsSubPrice, setRightsSubPrice] = useState<number>(10_000);

  const sharesHeld = 1_000;
  const band = VENUES.find((v) => v.id === venue)!.band;

  const cashPerShare = cashPct * 100; // % of 10,000 VND par = % * 100 VND
  const i1 = rightsPct / 100;
  const i2 = stockPct / 100;

  const rawAdj = (price + i1 * rightsSubPrice - cashPerShare) / (1 + i1 + i2);
  const adjRef = roundTick(venue, Math.max(100, rawAdj));
  const ceil = ceilTick(venue, adjRef, band);
  const floor = floorTick(venue, adjRef, band);

  const newStockShares = Math.floor(sharesHeld * i2);
  const newRightsShares = Math.floor(sharesHeld * i1);
  const rightsCashNeeded = newRightsShares * rightsSubPrice;
  const grossCashDiv = sharesHeld * cashPerShare;
  const netCashDiv = grossCashDiv * 0.95; // 5% PIT withheld on cash dividend

  // Immediate wealth change if rights exist and investor skips subscribing (without selling rights)
  const beforeValue = sharesHeld * price;
  const valueIfSkipRights = (sharesHeld + newStockShares) * adjRef + netCashDiv;
  const valueIfExercise = (sharesHeld + newStockShares + newRightsShares) * adjRef + netCashDiv - rightsCashNeeded;
  const skipPenalty = valueIfExercise - valueIfSkipRights;

  return (
    <div className="sd sbp5d">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Venue</span>
            <span data-lang-vi>Sàn</span>
          </span>
          {VENUES.map((v) => (
            <button
              key={v.id}
              type="button"
              className={venue === v.id ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={venue === v.id}
              onClick={() => setVenue(v.id)}
            >
              {v.id} (±{Math.round(v.band * 100)}%)
            </button>
          ))}
        </div>

        <div className="sd-group">
          <span>
            <span data-lang-en>Presets</span>
            <span data-lang-vi>Kịch bản mẫu</span>
          </span>
          <button
            type="button"
            className="sd-btn"
            onClick={() => {
              setPrice(30_000);
              setCashPct(20);
              setStockPct(20);
              setRightsPct(0);
            }}
          >
            <span data-lang-en>20% cash + 20% stock</span>
            <span data-lang-vi>20% tiền + 20% CP</span>
          </button>
          <button
            type="button"
            className="sd-btn"
            onClick={() => {
              setPrice(25_000);
              setCashPct(0);
              setStockPct(0);
              setRightsPct(50);
              setRightsSubPrice(10_000);
            }}
          >
            <span data-lang-en>2:1 rights @ 10k</span>
            <span data-lang-vi>Quyền mua 2:1 giá 10k</span>
          </button>
        </div>
      </div>

      <div className="sbp5d-sliders">
        <div>
          <div className="sbp5d-row">
            <label htmlFor={priceId} className="sbp5d-lbl">
              <span data-lang-en>Prior close (1,000 CP held)</span>
              <span data-lang-vi>Giá đóng cửa trước (đang giữ 1.000 CP)</span>
            </label>
            <span className="sbp5d-val">
              <span data-lang-en>{fmt(price, false)} VND</span>
              <span data-lang-vi>{fmt(price, true)} đ</span>
            </span>
          </div>
          <input
            id={priceId}
            className="sbp5d-range"
            type="range"
            min={10_000}
            max={80_000}
            step={500}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <div className="sbp5d-row">
            <label htmlFor={cashId} className="sbp5d-lbl">
              <span data-lang-en>Cash dividend (% of 10k par)</span>
              <span data-lang-vi>Cổ tức tiền (% mệnh giá 10k)</span>
            </label>
            <span className="sbp5d-val">
              {cashPct}% ({fmt(cashPerShare, true)} đ/CP)
            </span>
          </div>
          <input
            id={cashId}
            className="sbp5d-range"
            type="range"
            min={0}
            max={50}
            step={5}
            value={cashPct}
            onChange={(e) => setCashPct(Number(e.target.value))}
          />
        </div>

        <div>
          <div className="sbp5d-row">
            <label htmlFor={stockId} className="sbp5d-lbl">
              <span data-lang-en>Stock dividend / bonus (%)</span>
              <span data-lang-vi>Cổ tức cổ phiếu / thưởng (%)</span>
            </label>
            <span className="sbp5d-val">+{stockPct}% ({newStockShares} CP)</span>
          </div>
          <input
            id={stockId}
            className="sbp5d-range"
            type="range"
            min={0}
            max={100}
            step={5}
            value={stockPct}
            onChange={(e) => setStockPct(Number(e.target.value))}
          />
        </div>

        <div>
          <div className="sbp5d-row">
            <label htmlFor={rightsId} className="sbp5d-lbl">
              <span data-lang-en>Rights issue ratio @ {fmt(rightsSubPrice, true)} đ</span>
              <span data-lang-vi>Quyền mua thêm @ {fmt(rightsSubPrice, true)} đ</span>
            </label>
            <span className="sbp5d-val">+{rightsPct}% ({newRightsShares} CP)</span>
          </div>
          <input
            id={rightsId}
            className="sbp5d-range"
            type="range"
            min={0}
            max={100}
            step={10}
            value={rightsPct}
            onChange={(e) => setRightsPct(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <span>
            <span data-lang-en>Adjusted Ref Price (GDKHQ)</span>
            <span data-lang-vi>Tham chiếu GDKHQ ({venue})</span>
          </span>
          <b>
            <span data-lang-en>{fmt(adjRef, false)} VND</span>
            <span data-lang-vi>{fmt(adjRef, true)} đ</span>
          </b>
        </div>
        <div className="sd-stat">
          <span>
            <span data-lang-en>New Ex-Date Ceiling / Floor</span>
            <span data-lang-vi>Biên Trần / Sàn mới</span>
          </span>
          <b>
            <span data-lang-en>{fmt(ceil, false)} / {fmt(floor, false)}</span>
            <span data-lang-vi>{fmt(ceil, true)} / {fmt(floor, true)}</span>
          </b>
        </div>
        <div className="sd-stat">
          <span>
            <span data-lang-en>Net Cash Div (after 5% PIT)</span>
            <span data-lang-vi>Tiền cổ tức ròng (sau thuế 5%)</span>
          </span>
          <b>
            <span data-lang-en>{fmt(netCashDiv, false)} VND</span>
            <span data-lang-vi>{fmt(netCashDiv, true)} đ</span>
          </b>
        </div>
        <div className="sd-stat">
          <span>
            <span data-lang-en>Cash Needed for Rights</span>
            <span data-lang-vi>Tiền cần nộp mua quyền</span>
          </span>
          <b>
            <span data-lang-en>{fmt(rightsCashNeeded, false)} VND</span>
            <span data-lang-vi>{fmt(rightsCashNeeded, true)} đ</span>
          </b>
        </div>
      </div>

      <p className="sbp5d-note">
        <span data-lang-en>
          Before Ex-Date: {sharesHeld.toLocaleString('en-US')} shares = {fmt(beforeValue, false)} VND. Waiting shares (stock div + rights): {(newStockShares + newRightsShares).toLocaleString('en-US')} shares locked ~1–3 months before trading.
          {rightsPct > 0 && skipPenalty > 0
            ? ` Skipping discounted rights loses ~${fmt(skipPenalty, false)} VND immediately at Ex-Date.`
            : ''}
        </span>
        <span data-lang-vi>
          Trước GDKHQ: 1.000 CP = {fmt(beforeValue, true)} đ. Số CP chờ về (cổ phiếu + quyền mua): {(newStockShares + newRightsShares).toLocaleString('vi-VN')} CP bị khóa ~1–3 tháng mới giao dịch.
          {rightsPct > 0 && skipPenalty > 0
            ? ` Nếu bỏ quyền mua giá rẻ sẽ thiệt ngay ~${fmt(skipPenalty, true)} đ ngay sáng GDKHQ.`
            : ''}
        </span>
      </p>
    </div>
  );
}
