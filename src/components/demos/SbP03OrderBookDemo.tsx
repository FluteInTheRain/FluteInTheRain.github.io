import React, { useState, useId } from 'react';

type Side = 'buy' | 'sell';
type OrderType = 'lo' | 'mp' | 'atc';

interface BookLevel {
  price: number;
  qty: number;
}

const ASKS: BookLevel[] = [
  { price: 25_050, qty: 500 },
  { price: 25_200, qty: 500 },
  { price: 25_600, qty: 1_000 },
];

const BIDS: BookLevel[] = [
  { price: 25_000, qty: 800 },
  { price: 24_900, qty: 700 },
  { price: 24_700, qty: 1_000 },
];

const ATC_PRICE = 25_100;
const fmt = (n: number, vi: boolean) => n.toLocaleString(vi ? 'vi-VN' : 'en-US', { maximumFractionDigits: 1 });

export default function SbP03OrderBookDemo() {
  const qtyId = useId();
  const limId = useId();
  const [side, setSide] = useState<Side>('buy');
  const [orderType, setOrderType] = useState<OrderType>('lo');
  const [qty, setQty] = useState<number>(1_200);
  const [limitPrice, setLimitPrice] = useState<number>(25_050);

  const book = side === 'buy' ? ASKS : BIDS;
  const bestTouch = book[0].price;

  let filled = 0;
  let totalCost = 0;
  const fills: { price: number; qty: number }[] = [];

  if (orderType === 'atc') {
    filled = qty;
    totalCost = qty * ATC_PRICE;
    fills.push({ price: ATC_PRICE, qty });
  } else {
    let rem = qty;
    for (const lvl of book) {
      if (rem <= 0) break;
      const okPrice =
        orderType === 'mp' ||
        (side === 'buy' ? lvl.price <= limitPrice : lvl.price >= limitPrice);
      if (!okPrice) continue;
      const take = Math.min(rem, lvl.qty);
      fills.push({ price: lvl.price, qty: take });
      filled += take;
      totalCost += take * lvl.price;
      rem -= take;
    }
  }

  const unfilled = qty - filled;
  const avgPrice = filled > 0 ? totalCost / filled : 0;
  const slippagePerShare =
    filled > 0
      ? side === 'buy'
        ? avgPrice - bestTouch
        : bestTouch - avgPrice
      : 0;

  return (
    <div className="sd sbp3d">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Side</span>
            <span data-lang-vi>Chiều</span>
          </span>
          <button
            type="button"
            className={side === 'buy' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={side === 'buy'}
            onClick={() => { setSide('buy'); setLimitPrice(25_050); }}
          >
            <span data-lang-en>Buy</span>
            <span data-lang-vi>Mua</span>
          </button>
          <button
            type="button"
            className={side === 'sell' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={side === 'sell'}
            onClick={() => { setSide('sell'); setLimitPrice(25_000); }}
          >
            <span data-lang-en>Sell</span>
            <span data-lang-vi>Bán</span>
          </button>
        </div>

        <div className="sd-group">
          <span>
            <span data-lang-en>Order type</span>
            <span data-lang-vi>Loại lệnh</span>
          </span>
          {(['lo', 'mp', 'atc'] as OrderType[]).map((t) => (
            <button
              key={t}
              type="button"
              className={orderType === t ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={orderType === t}
              onClick={() => setOrderType(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="sbp3d-sliders">
        <div>
          <div className="sbp3d-row">
            <label className="sbp3d-lbl" htmlFor={qtyId}>
              <span data-lang-en>Quantity (100-share lots)</span>
              <span data-lang-vi>Khối lượng (bội số 100 CP)</span>
            </label>
            <output className="sbp3d-val">{fmt(qty, false)} CP</output>
          </div>
          <input
            id={qtyId}
            className="sbp3d-range"
            type="range"
            min={100}
            max={2_000}
            step={100}
            value={qty}
            onChange={(e) => setQty(Number(e.currentTarget.value))}
          />
        </div>

        {orderType === 'lo' && (
          <div>
            <div className="sbp3d-row">
              <label className="sbp3d-lbl" htmlFor={limId}>
                <span data-lang-en>Limit price</span>
                <span data-lang-vi>Giá đặt (LO)</span>
              </label>
              <output className="sbp3d-val">
                <span data-lang-en>{fmt(limitPrice, false)} VND</span>
                <span data-lang-vi>{fmt(limitPrice, true)} đồng</span>
              </output>
            </div>
            <input
              id={limId}
              className="sbp3d-range"
              type="range"
              min={24_700}
              max={25_600}
              step={50}
              value={limitPrice}
              onChange={(e) => setLimitPrice(Number(e.currentTarget.value))}
            />
          </div>
        )}
      </div>

      <div className="sbp3d-book">
        <span>
          <span data-lang-en>Resting {side === 'buy' ? 'Asks (Sellers)' : 'Bids (Buyers)'}: </span>
          <span data-lang-vi>Hàng chờ bên {side === 'buy' ? 'Bán (Ask)' : 'Mua (Bid)'}: </span>
        </span>
        {book.map((b, i) => (
          <code key={i} className="sbp3d-chip">
            {fmt(b.price, false)} × {fmt(b.qty, false)}
          </code>
        ))}
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>
            <span data-lang-en>{fmt(filled, false)} / {fmt(qty, false)}</span>
            <span data-lang-vi>{fmt(filled, true)} / {fmt(qty, true)}</span>
          </b>
          <span>
            <span data-lang-en>Filled now ({fmt(unfilled, false)} waiting/unfilled)</span>
            <span data-lang-vi>Khớp ngay (còn chờ/dư {fmt(unfilled, true)} CP)</span>
          </span>
        </div>

        <div className="sd-stat">
          <b>
            <span data-lang-en>{filled > 0 ? `${fmt(avgPrice, false)} VND` : '—'}</span>
            <span data-lang-vi>{filled > 0 ? `${fmt(avgPrice, true)} đồng` : '—'}</span>
          </b>
          <span>
            <span data-lang-en>Average fill price</span>
            <span data-lang-vi>Giá khớp bình quân</span>
          </span>
        </div>

        <div className="sd-stat">
          <b>
            <span data-lang-en>{filled > 0 ? `${fmt(slippagePerShare, false)} VND/sh` : '0 VND'}</span>
            <span data-lang-vi>{filled > 0 ? `${fmt(slippagePerShare, true)} đ/CP` : '0 đ'}</span>
          </b>
          <span>
            <span data-lang-en>{orderType === 'atc' ? 'Auction clearing (25,100)' : 'Slippage vs top of book'}</span>
            <span data-lang-vi>{orderType === 'atc' ? 'Giá khớp định kỳ (25.100)' : 'Trượt giá so với bậc 1'}</span>
          </span>
        </div>
      </div>

      {fills.length > 0 && (
        <p className="sbp3d-note">
          <span data-lang-en>Fills: {fills.map((f) => `${fmt(f.qty, false)} @ ${fmt(f.price, false)}`).join(' + ')}</span>
          <span data-lang-vi>Chi tiết khớp: {fills.map((f) => `${fmt(f.qty, true)} @ ${fmt(f.price, true)}`).join(' + ')}</span>
        </p>
      )}
    </div>
  );
}
