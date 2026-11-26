import React, { useId, useState } from 'react';

const MMR = 0.35; // maintenance (call) ratio, MBS policy 24/09/2025
const FS = 0.30; // force-sell ratio, same policy
const FLOOR = 0.07; // HOSE daily limit

const fmt = (n: number, vi: boolean, d = 1) =>
  n.toLocaleString(vi ? 'vi-VN' : 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

/** pure maths, mirrored one-to-one by the Python check in the plan notes */
export function marginMath(ownM: number, borrowPct: number, ratePct: number, days: number, movePct: number) {
  const debt = ownM * (borrowPct / 100);
  const v0 = ownM + debt;
  const v = v0 * (1 + movePct / 100);
  const equity = v - debt;
  const interest = (debt * (ratePct / 100) * days) / 365;
  const ratio = v > 0 ? (v - debt) / v : 0;
  const callDrop = debt > 0 ? 1 - debt / (1 - MMR) / v0 : null;
  const fsDrop = debt > 0 ? 1 - debt / (1 - FS) / v0 : null;
  const wipeDrop = debt > 0 ? 1 - debt / v0 : null;
  const sessions = (drop: number | null) =>
    drop === null ? null : Math.ceil(Math.log(1 - drop) / Math.log(1 - FLOOR));
  const status: 'none' | 'ok' | 'call' | 'fs' | 'wipe' =
    debt === 0 ? 'none' : equity <= 0 ? 'wipe' : ratio <= FS ? 'fs' : ratio < MMR ? 'call' : 'ok';
  return {
    debt, v0, v, equity, interest, ratio, callDrop, fsDrop, wipeDrop,
    callSessions: sessions(callDrop), fsSessions: sessions(fsDrop),
    equityChangePct: ((equity - interest) / ownM - 1) * 100,
    status,
  };
}

const STATUS = {
  none: { en: 'No loan: no call, no force-sell', vi: 'Không vay: không có gọi ký quỹ hay bán giải chấp' },
  ok: { en: 'Above the call line', vi: 'Trên đường báo gọi' },
  call: { en: 'Call: ratio under 35%', vi: 'Gọi ký quỹ: tỷ lệ dưới 35%' },
  fs: { en: 'Force-sell: ratio at or under 30%', vi: 'Bán giải chấp: tỷ lệ từ 30% trở xuống' },
  wipe: { en: 'Wiped out: shares no longer cover the debt', vi: 'Mất sạch vốn: cổ phiếu không đủ trả nợ' },
} as const;

export default function SbP09MarginLinesDemo() {
  const ids = [useId(), useId(), useId(), useId(), useId()];
  const [own, setOwn] = useState(100);
  const [borrow, setBorrow] = useState(100);
  const [rate, setRate] = useState(13);
  const [days, setDays] = useState(30);
  const [move, setMove] = useState(-25);
  const m = marginMath(own, borrow, rate, days, move);

  const row = (id: string, en: string, vi: string, val: React.ReactNode, min: number, max: number, step: number, v: number, set: (n: number) => void) => (
    <div>
      <div className="sbp9d-row">
        <label htmlFor={id} className="sbp9d-lbl">
          <span data-lang-en>{en}</span>
          <span data-lang-vi>{vi}</span>
        </label>
        <span className="sbp9d-val">{val}</span>
      </div>
      <input id={id} className="sbp9d-range" type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} />
    </div>
  );
  const pct = (x: number | null, vi: boolean) => (x === null ? '—' : `−${fmt(x * 100, vi, 2)}%`);

  return (
    <div className="sd sbp9d">
      <div className="sbp9d-sliders">
        {row(ids[0], 'Own money (million VND)', 'Tiền của bạn (triệu đồng)', own, 50, 500, 10, own, setOwn)}
        {row(ids[1], 'Borrowed, as % of own money', 'Vay, tính theo % tiền của bạn', `${borrow}%`, 0, 100, 10, borrow, setBorrow)}
        {row(ids[2], 'Margin interest per year', 'Lãi margin mỗi năm', `${fmt(rate, false, 1)}%`, 8, 16, 0.5, rate, setRate)}
        {row(ids[3], 'Days held', 'Số ngày giữ', days, 0, 90, 5, days, setDays)}
        {row(ids[4], 'Share price move since buying', 'Giá cổ phiếu thay đổi từ lúc mua', `${move > 0 ? '+' : ''}${move}%`, -60, 30, 1, move, setMove)}
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>Shares now / debt</span><span data-lang-vi>Cổ phiếu hiện tại / nợ</span></span>
          <b><span data-lang-en>{fmt(m.v, false)}M / {fmt(m.debt, false)}M</span><span data-lang-vi>{fmt(m.v, true)} tr / {fmt(m.debt, true)} tr</span></b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Margin ratio</span><span data-lang-vi>Tỷ lệ ký quỹ</span></span>
          <b><span data-lang-en>{m.status === 'wipe' ? '0%' : `${fmt(m.ratio * 100, false)}%`}</span><span data-lang-vi>{m.status === 'wipe' ? '0%' : `${fmt(m.ratio * 100, true)}%`}</span></b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Your equity change (after interest)</span><span data-lang-vi>Vốn thay đổi (sau lãi)</span></span>
          <b><span data-lang-en>{fmt(m.equityChangePct, false)}%</span><span data-lang-vi>{fmt(m.equityChangePct, true)}%</span></b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Interest to date</span><span data-lang-vi>Lãi đã tính</span></span>
          <b><span data-lang-en>{fmt(m.interest, false, 2)}M VND</span><span data-lang-vi>{fmt(m.interest, true, 2)} triệu đồng</span></b>
        </div>
      </div>

      <p className={`sbp9d-status sbp9d-${m.status}`} role="status">
        <span data-lang-en>{STATUS[m.status].en}</span>
        <span data-lang-vi>{STATUS[m.status].vi}</span>
      </p>

      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>Call line (35%): price fall</span><span data-lang-vi>Đường gọi (35%): giá giảm</span></span>
          <b><span data-lang-en>{pct(m.callDrop, false)}{m.callSessions !== null ? ` (${m.callSessions} floor sessions)` : ''}</span><span data-lang-vi>{pct(m.callDrop, true)}{m.callSessions !== null ? ` (${m.callSessions} phiên sàn)` : ''}</span></b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Force-sell line (30%): price fall</span><span data-lang-vi>Đường bán giải chấp (30%): giá giảm</span></span>
          <b><span data-lang-en>{pct(m.fsDrop, false)}{m.fsSessions !== null ? ` (${m.fsSessions} floor sessions)` : ''}</span><span data-lang-vi>{pct(m.fsDrop, true)}{m.fsSessions !== null ? ` (${m.fsSessions} phiên sàn)` : ''}</span></b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Wipe-out: price fall</span><span data-lang-vi>Mất sạch vốn: giá giảm</span></span>
          <b><span data-lang-en>{pct(m.wipeDrop, false)}</span><span data-lang-vi>{pct(m.wipeDrop, true)}</span></b>
        </div>
      </div>
    </div>
  );
}
