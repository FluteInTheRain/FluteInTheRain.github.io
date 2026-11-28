import React, { useState } from 'react';

// Knight Capital, 1 Aug 2012. SEC Release 34-70694, para 17: 4 million executions, 154 stocks, more than 397 million shares in
// approximately 45 minutes, net long about $3.5 billion (80 stocks) plus net short about $3.15 billion (74 stocks).
// The demo spreads those totals evenly over 45 minutes (2,700 s). Real flow was not even, so read it as the average pace.
export const TOTAL_S = 45 * 60;
export const SHARES = 397_000_000;
export const EXECS = 4_000_000;
export const GROSS = 3_500_000_000 + 3_150_000_000;

export function runaway(capUsd: number | null, humanSec: number) {
  const usdPerSec = GROSS / TOTAL_S;
  const capSec = capUsd === null ? Infinity : capUsd / usdPerSec;
  const stop = Math.min(TOTAL_S, humanSec, capSec);
  const by = capSec <= Math.min(TOTAL_S, humanSec) ? 'cap' : humanSec < TOTAL_S ? 'human' : 'none';
  return {
    stop,
    by,
    shares: (SHARES / TOTAL_S) * stop,
    execs: (EXECS / TOTAL_S) * stop,
    gross: usdPerSec * stop,
  };
}

const CAPS: { v: number | null; en: string; vi: string }[] = [
  { v: null, en: 'no cap', vi: 'không có' },
  { v: 1_000_000_000, en: '$1 billion', vi: '1 tỷ USD' },
  { v: 500_000_000, en: '$500 million', vi: '500 triệu USD' },
  { v: 100_000_000, en: '$100 million', vi: '100 triệu USD' },
  { v: 10_000_000, en: '$10 million', vi: '10 triệu USD' },
];
const HUMAN: { v: number; en: string; vi: string }[] = [
  { v: 30, en: '30 seconds', vi: '30 giây' },
  { v: 300, en: '5 minutes', vi: '5 phút' },
  { v: 900, en: '15 minutes', vi: '15 phút' },
  { v: TOTAL_S, en: 'never (45 minutes)', vi: 'không bao giờ (45 phút)' },
];

const n0 = (x: number) => Math.round(x).toLocaleString('en-US');
const fmtUsd = (x: number) => (x >= 1e9 ? `$${(x / 1e9).toFixed(2)} billion` : `$${(x / 1e6).toFixed(1)} million`);
const fmtUsdVi = (x: number) => (x >= 1e9 ? `${(x / 1e9).toFixed(2).replace('.', ',')} tỷ USD` : `${(x / 1e6).toFixed(1).replace('.', ',')} triệu USD`);
const fmtT = (s: number) => (s >= 120 ? `${(s / 60).toFixed(1)} min` : `${s.toFixed(1)} s`);
const fmtTVi = (s: number) => (s >= 120 ? `${(s / 60).toFixed(1).replace('.', ',')} phút` : `${s.toFixed(1).replace('.', ',')} giây`);

export default function AtP13CapDemo() {
  const [ci, setCi] = useState(0);
  const [hi, setHi] = useState(3);
  const r = runaway(CAPS[ci].v, HUMAN[hi].v);
  const pct = (r.stop / TOTAL_S) * 100;

  return (
    <div className="sd">
      <div className="sd-controls">
        <div className="sd-group">
          <span><span data-lang-en>Automatic exposure cap</span><span data-lang-vi>Hạn mức vị thế tự động</span></span>
          {CAPS.map((c, i) => (
            <button key={i} type="button" className={i === ci ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={i === ci} onClick={() => setCi(i)}>
              <span data-lang-en>{c.en}</span><span data-lang-vi>{c.vi}</span>
            </button>
          ))}
        </div>
        <div className="sd-group">
          <span><span data-lang-en>A person notices after</span><span data-lang-vi>Một người nhận ra sau</span></span>
          {HUMAN.map((h, i) => (
            <button key={i} type="button" className={i === hi ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={i === hi} onClick={() => setHi(i)}>
              <span data-lang-en>{h.en}</span><span data-lang-vi>{h.vi}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sd-stats" aria-live="polite">
        <div className="sd-stat"><b>
          <span data-lang-en>{fmtT(r.stop)}</span><span data-lang-vi>{fmtTVi(r.stop)}</span>
        </b><span><span data-lang-en>until the router stops</span><span data-lang-vi>cho tới khi router dừng</span></span></div>
        <div className="sd-stat"><b>{n0(r.execs)}</b><span><span data-lang-en>executions</span><span data-lang-vi>lần khớp</span></span></div>
        <div className="sd-stat"><b>{n0(r.shares)}</b><span><span data-lang-en>shares traded</span><span data-lang-vi>cổ phiếu đã giao dịch</span></span></div>
        <div className={r.gross > 1e9 ? 'sd-stat is-bad' : 'sd-stat'}><b>
          <span data-lang-en>{fmtUsd(r.gross)}</span><span data-lang-vi>{fmtUsdVi(r.gross)}</span>
        </b><span><span data-lang-en>gross position built</span><span data-lang-vi>vị thế gộp đã dựng</span></span></div>
      </div>

      <div className="atp13-bar" role="img" aria-label={`${pct.toFixed(1)}% of the 45 minutes`}>
        <div className="atp13-bar-fill" style={{ width: `${Math.max(pct, 0.6)}%` }} />
      </div>
      <p className="ob-summary">
        <span data-lang-en>{r.by === 'cap' ? 'The cap stopped it.' : r.by === 'human' ? 'A person stopped it by hand.' : 'Nothing stopped it: the full 45 minutes.'}</span>
        <span data-lang-vi>{r.by === 'cap' ? 'Hạn mức đã chặn lại.' : r.by === 'human' ? 'Một người dừng nó bằng tay.' : 'Không gì chặn được: đủ 45 phút.'}</span>
      </p>
    </div>
  );
}
