import React, { useState } from 'react';

// Starting book: the first three levels on each side are the book of the worked example in HOSE's trading
// rules (example 3); the two deeper levels are added here so the demo does not run dry. One price step = 50 VND.
// OFI follows Cont, Kukanov & Stoikov (2014): e_n compares the best bid/ask (price, size) before and after an event.
// ENGINE START
type Book = { bids: Record<number, number>; asks: Record<number, number> };
type Top = [number, number, number, number]; // best bid price, size, best ask price, size
type Act = 'mkt_buy' | 'mkt_sell' | 'add_bid' | 'add_ask' | 'cancel_bid' | 'cancel_ask' | 'improve_bid' | 'improve_ask';
const TICK = 50;
const initBook = (): Book => ({
  bids: { 40650: 100, 40600: 300, 40550: 500, 40500: 400, 40450: 600 },
  asks: { 40800: 900, 40850: 500, 40900: 200, 40950: 400, 41000: 600 },
});
const nums = (o: Record<number, number>) => Object.keys(o).map(Number);
const top = (b: Book): Top => {
  const pb = Math.max(...nums(b.bids));
  const pa = Math.min(...nums(b.asks));
  return [pb, b.bids[pb], pa, b.asks[pa]];
};
const ofiE = (prev: Top, cur: Top): number => {
  const [pb0, qb0, pa0, qa0] = prev;
  const [pb, qb, pa, qa] = cur;
  let e = 0;
  if (pb >= pb0) e += qb;
  if (pb <= pb0) e -= qb0;
  if (pa <= pa0) e -= qa;
  if (pa >= pa0) e += qa0;
  return e;
};
// returns the new book, or null when the action does nothing or would empty a side
const applyAct = (b0: Book, act: Act, q: number): Book | null => {
  const b: Book = { bids: { ...b0.bids }, asks: { ...b0.asks } };
  if (act === 'mkt_buy' || act === 'mkt_sell') {
    const side = act === 'mkt_buy' ? b.asks : b.bids;
    const order = nums(side).sort((x, y) => (act === 'mkt_buy' ? x - y : y - x));
    let rem = q;
    for (const p of order) {
      const t = Math.min(rem, side[p]);
      side[p] -= t;
      rem -= t;
      if (side[p] === 0) delete side[p];
      if (rem === 0) break;
    }
  } else if (act === 'add_bid') {
    b.bids[Math.max(...nums(b.bids))] += q;
  } else if (act === 'add_ask') {
    b.asks[Math.min(...nums(b.asks))] += q;
  } else if (act === 'cancel_bid' || act === 'cancel_ask') {
    const side = act === 'cancel_bid' ? b.bids : b.asks;
    const p = act === 'cancel_bid' ? Math.max(...nums(side)) : Math.min(...nums(side));
    side[p] -= Math.min(q, side[p]);
    if (side[p] === 0) delete side[p];
  } else if (act === 'improve_bid') {
    const p = Math.max(...nums(b.bids)) + TICK;
    if (p >= Math.min(...nums(b.asks))) return null;
    b.bids[p] = (b.bids[p] || 0) + q;
  } else {
    const p = Math.min(...nums(b.asks)) - TICK;
    if (p <= Math.max(...nums(b.bids))) return null;
    b.asks[p] = (b.asks[p] || 0) + q;
  }
  if (nums(b.bids).length === 0 || nums(b.asks).length === 0) return null;
  return b;
};
// ENGINE END

const SCRIPT: [Act, number][] = [['mkt_buy', 1000], ['add_ask', 300], ['cancel_bid', 100], ['improve_bid', 500]];

const LABEL: Record<Act, { en: string; vi: string }> = {
  mkt_buy: { en: 'Market buy', vi: 'Mua thị trường' },
  mkt_sell: { en: 'Market sell', vi: 'Bán thị trường' },
  add_bid: { en: 'Add buy at best bid', vi: 'Thêm lệnh mua ở giá mua tốt nhất' },
  add_ask: { en: 'Add sell at best ask', vi: 'Thêm lệnh bán ở giá bán tốt nhất' },
  cancel_bid: { en: 'Cancel buy at best bid', vi: 'Huỷ lệnh mua ở giá mua tốt nhất' },
  cancel_ask: { en: 'Cancel sell at best ask', vi: 'Huỷ lệnh bán ở giá bán tốt nhất' },
  improve_bid: { en: 'Buy inside the spread', vi: 'Mua chen vào trong spread' },
  improve_ask: { en: 'Sell inside the spread', vi: 'Bán chen vào trong spread' },
};
const ORDER: Act[] = ['mkt_buy', 'mkt_sell', 'add_bid', 'add_ask', 'cancel_bid', 'cancel_ask', 'improve_bid', 'improve_ask'];

type Entry = { act: Act; q: number; e: number; cum: number };
type State = { book: Book; log: Entry[]; cum: number; script: number };
const fresh = (): State => ({ book: initBook(), log: [], cum: 0, script: 0 });

const fmt = (n: number) => n.toLocaleString('en-US');
const fmtVi = (n: number) => n.toLocaleString('en-US').replace(/,/g, '.');
const sgn = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);

export default function AtP16OfiBookDemo() {
  const [st, setSt] = useState<State>(fresh);
  const [size, setSize] = useState(500);
  const [note, setNote] = useState(false);

  const t0 = top(initBook());
  const mid0 = (t0[0] + t0[2]) / 2;
  const cur = top(st.book);
  const mid = (cur[0] + cur[2]) / 2;
  const imb = (cur[1] - cur[3]) / (cur[1] + cur[3]);

  const run = (s: State, act: Act, q: number, keepScript: boolean): State | null => {
    const nb = applyAct(s.book, act, q);
    if (!nb) return null;
    const e = ofiE(top(s.book), top(nb));
    const cum = s.cum + e;
    return { book: nb, log: [...s.log, { act, q, e, cum }], cum, script: keepScript ? s.script + 1 : -1 };
  };
  const doAct = (act: Act) => {
    const next = run(st, act, size, false);
    setNote(!next);
    if (next) setSt(next);
  };
  const playScript = () => {
    const base = st.script >= 0 && st.script < SCRIPT.length ? st : fresh();
    const [act, q] = SCRIPT[base.script];
    const next = run(base, act, q, true);
    if (next) setSt(next);
    setNote(false);
  };
  const reset = () => { setSt(fresh()); setNote(false); };

  const asks = nums(st.book.asks).sort((a, b) => a - b).slice(0, 5).reverse();
  const bids = nums(st.book.bids).sort((a, b) => b - a).slice(0, 5);
  const maxQ = 1000;
  const dMid = mid - mid0;
  const scriptDone = st.script >= SCRIPT.length;

  const row = (p: number, q: number, side: 'ask' | 'bid') => (
    <li key={p} className={`p16-row is-${side}${(side === 'ask' ? p === cur[2] : p === cur[0]) ? ' is-best' : ''}`}>
      <span className="p16-price"><span data-lang-en>{fmt(p)}</span><span data-lang-vi>{fmtVi(p)}</span></span>
      <span className="p16-track"><span className="p16-bar" style={{ width: `${Math.min(100, (q / maxQ) * 100)}%` }} /></span>
      <span className="p16-q">{q}</span>
    </li>
  );

  return (
    <div className="sd p16">
      <div className="sd-controls">
        <div className="sd-group">
          <span><span data-lang-en>Order size</span><span data-lang-vi>Cỡ lệnh</span></span>
          {[100, 500, 1000].map((n) => (
            <button key={n} type="button" className={size === n ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setSize(n)}>
              <span data-lang-en>{fmt(n)}</span><span data-lang-vi>{fmtVi(n)}</span>
            </button>
          ))}
        </div>
        <div className="sd-group">
          <button type="button" className="sd-btn" onClick={playScript} disabled={scriptDone}>
            <span data-lang-en>Play the 4 events from the text ({Math.max(st.script, 0)}/4)</span>
            <span data-lang-vi>Chạy 4 sự kiện trong bài ({Math.max(st.script, 0)}/4)</span>
          </button>
          <button type="button" className="sd-btn" onClick={reset}><span data-lang-en>Reset</span><span data-lang-vi>Làm lại</span></button>
        </div>
      </div>

      <div className="p16-acts">
        {ORDER.map((a) => (
          <button key={a} type="button" className="sd-btn" onClick={() => doAct(a)}>
            <span data-lang-en>{LABEL[a].en}</span><span data-lang-vi>{LABEL[a].vi}</span>
          </button>
        ))}
      </div>
      {note && (
        <p className="p16-note">
          <span data-lang-en>That action does nothing here (no room inside the spread, or it would empty one side of the book).</span>
          <span data-lang-vi>Thao tác đó không làm gì ở đây (không còn chỗ trong spread, hoặc nó sẽ làm trống một phía của sổ lệnh).</span>
        </p>
      )}

      <div className="p16-grid">
        <div>
          <p className="p16-cap"><span data-lang-en>Order book (shares waiting, VND)</span><span data-lang-vi>Sổ lệnh (cổ phiếu đang chờ, đồng)</span></p>
          <ul className="p16-book">
            {asks.map((p) => row(p, st.book.asks[p], 'ask'))}
            <li className="p16-spread">
              <span data-lang-en>spread {fmt(cur[2] - cur[0])} VND, mid {fmt(mid)}</span>
              <span data-lang-vi>spread {fmtVi(cur[2] - cur[0])} đồng, giá giữa {fmtVi(mid)}</span>
            </li>
            {bids.map((p) => row(p, st.book.bids[p], 'bid'))}
          </ul>
        </div>
        <div>
          <div className="sd-stats">
            <div className="sd-stat"><span><span data-lang-en>Cumulative OFI</span><span data-lang-vi>OFI cộng dồn</span></span><b>{sgn(st.cum)}</b></div>
            <div className="sd-stat"><span><span data-lang-en>Mid vs start (VND)</span><span data-lang-vi>Giá giữa so với đầu (đồng)</span></span><b>{sgn(dMid)}</b></div>
            <div className="sd-stat"><span><span data-lang-en>Queue imbalance</span><span data-lang-vi>Mất cân bằng hàng chờ</span></span><b>{imb.toFixed(2)}</b></div>
          </div>
          <p className="p16-cap"><span data-lang-en>Events so far</span><span data-lang-vi>Các sự kiện đã xảy ra</span></p>
          <ol className="p16-log">
            {st.log.length === 0 && <li className="p16-faint"><span data-lang-en>None yet. Click an action.</span><span data-lang-vi>Chưa có. Hãy bấm một thao tác.</span></li>}
            {st.log.slice(-6).map((l, i) => (
              <li key={st.log.length - Math.min(6, st.log.length) + i}>
                <span><span data-lang-en>{LABEL[l.act].en}</span><span data-lang-vi>{LABEL[l.act].vi}</span> {l.q}</span>
                <b className={l.e >= 0 ? 'p16-pos' : 'p16-neg'}>e = {sgn(l.e)}</b>
                <span className="p16-faint">Σ {sgn(l.cum)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
