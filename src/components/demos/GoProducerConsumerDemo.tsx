import React, { useEffect, useState } from 'react';

// A tick-by-tick model of one producer goroutine and one consumer goroutine
// joined by a channel. It is a teaching simulation, not a measurement.
const TOTAL = 8;

interface Params {
  cap: number; // channel capacity: 0 = unbuffered
  prodEvery: number; // producer prepares a value every N ticks
  consEvery: number; // consumer is ready to receive every N ticks
}

interface State {
  tick: number;
  made: number; // values the producer has created
  holding: boolean; // producer holds a value it cannot send yet
  queue: number[]; // values waiting inside the channel buffer
  got: number[]; // values the consumer has received
  closed: boolean;
  producerDone: boolean;
  consumerDone: boolean;
  note: { en: string; vi: string };
}

function simulate(p: Params, ticks: number): State {
  const s: State = {
    tick: 0, made: 0, holding: false, queue: [], got: [], closed: false,
    producerDone: false, consumerDone: false,
    note: { en: 'Both goroutines are about to start.', vi: 'Hai goroutine sắp bắt đầu.' },
  };
  let nextVal = 1;
  let held = 0;
  for (let t = 1; t <= ticks; t++) {
    s.tick = t;
    const consumerReady = t % p.consEvery === 0 && !s.consumerDone;
    let msgEn = '';
    let msgVi = '';
    // producer prepares a value
    if (!s.producerDone && !s.holding && t % p.prodEvery === 0 && s.made < TOTAL) {
      held = nextVal++;
      s.made++;
      s.holding = true;
    }
    // try to send
    if (s.holding) {
      if (p.cap > 0 && s.queue.length < p.cap) {
        s.queue.push(held);
        s.holding = false;
        msgEn = `Producer sent ${held} into the buffer and kept going.`;
        msgVi = `Producer gửi ${held} vào buffer rồi làm tiếp.`;
      } else if (p.cap === 0 && consumerReady) {
        s.got.push(held);
        s.holding = false;
        msgEn = `Hand-off: producer and consumer met, ${held} passed straight across.`;
        msgVi = `Trao tay: producer và consumer gặp nhau, ${held} chuyển thẳng sang.`;
      } else {
        msgEn = `Producer is blocked on send: ${p.cap === 0 ? 'no receiver is ready' : 'the buffer is full'}.`;
        msgVi = `Producer bị chặn ở lệnh gửi: ${p.cap === 0 ? 'chưa có bên nhận sẵn sàng' : 'buffer đã đầy'}.`;
      }
    }
    // consumer receives from the buffer
    if (consumerReady && p.cap > 0 && s.queue.length > 0) {
      const v = s.queue.shift() as number;
      s.got.push(v);
      msgEn = `Consumer received ${v} from the buffer.`;
      msgVi = `Consumer nhận ${v} từ buffer.`;
    }
    if (s.made === TOTAL && !s.holding && !s.producerDone) {
      s.producerDone = true;
      s.closed = true;
      msgEn = 'Producer called close(ch) and returned.';
      msgVi = 'Producer gọi close(ch) rồi thoát.';
    }
    if (s.closed && s.queue.length === 0 && s.got.length === TOTAL && !s.consumerDone) {
      s.consumerDone = true;
      msgEn = 'The channel is closed and empty, so the range loop ends. Both goroutines exited.';
      msgVi = 'Channel đã đóng và hết dữ liệu nên vòng range kết thúc. Cả hai goroutine đã thoát.';
    }
    if (msgEn) s.note = { en: msgEn, vi: msgVi };
  }
  return s;
}

const PACE = [
  { v: 1, en: 'fast', vi: 'nhanh' },
  { v: 3, en: 'slow', vi: 'chậm' },
];

export default function GoProducerConsumerDemo() {
  const [cap, setCap] = useState(0);
  const [prodEvery, setProd] = useState(1);
  const [consEvery, setCons] = useState(3);
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);

  const params: Params = { cap, prodEvery, consEvery };
  const st = simulate(params, tick);
  const finished = st.consumerDone;

  useEffect(() => {
    if (!playing) return;
    if (finished) { setPlaying(false); return; }
    const id = window.setTimeout(() => setTick((t) => t + 1), 650);
    return () => window.clearTimeout(id);
  }, [playing, tick, finished]);

  const change = (fn: () => void) => { fn(); setTick(0); setPlaying(false); };
  const slots = Math.max(cap, 1);

  return (
    <div className="sd gpc">
      <div className="sd-controls">
        <div className="sd-group">
          <span><span data-lang-en>Channel</span><span data-lang-vi>Channel</span></span>
          {[0, 1, 3].map((c) => (
            <button key={c} type="button" className={cap === c ? 'sd-btn is-on' : 'sd-btn'} onClick={() => change(() => setCap(c))}>
              {c === 0 ? 'make(chan int)' : `make(chan int, ${c})`}
            </button>
          ))}
        </div>
        <div className="sd-group">
          <span><span data-lang-en>Producer</span><span data-lang-vi>Producer</span></span>
          {PACE.map((o) => (
            <button key={o.v} type="button" className={prodEvery === o.v ? 'sd-btn is-on' : 'sd-btn'} onClick={() => change(() => setProd(o.v))}>
              <span data-lang-en>{o.en}</span><span data-lang-vi>{o.vi}</span>
            </button>
          ))}
        </div>
        <div className="sd-group">
          <span><span data-lang-en>Consumer</span><span data-lang-vi>Consumer</span></span>
          {PACE.map((o) => (
            <button key={o.v} type="button" className={consEvery === o.v ? 'sd-btn is-on' : 'sd-btn'} onClick={() => change(() => setCons(o.v))}>
              <span data-lang-en>{o.en}</span><span data-lang-vi>{o.vi}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gpc-stage" aria-hidden="true">
        <div className={'gpc-box' + (st.holding ? ' is-blocked' : '')}>
          <b>producer</b>
          <span>{st.producerDone ? 'done' : st.holding ? 'blocked' : 'working'}</span>
          <i>made {st.made}/{TOTAL}</i>
        </div>
        <div className="gpc-pipe">
          <div className="gpc-slots">
            {cap === 0 ? (
              <div className={'gpc-slot is-wide' + (st.holding ? ' is-waiting' : '')}>{st.holding ? 'sender waits' : 'no buffer'}</div>
            ) : (
              Array.from({ length: slots }).map((_, i) => (
                <div key={i} className={'gpc-slot' + (st.queue[i] !== undefined ? ' is-full' : '')}>{st.queue[i] ?? ''}</div>
              ))
            )}
          </div>
          <small>{st.closed ? 'closed' : 'open'}</small>
        </div>
        <div className="gpc-box">
          <b>consumer</b>
          <span>{st.consumerDone ? 'done' : 'receiving'}</span>
          <i>got {st.got.length}/{TOTAL}</i>
        </div>
      </div>

      <p className="gpc-got">
        <span data-lang-en>Received so far: </span><span data-lang-vi>Đã nhận: </span>
        <b>{st.got.length ? st.got.join(', ') : '-'}</b>
      </p>
      <p className="gpc-note" role="status">
        <span data-lang-en>{st.note.en}</span><span data-lang-vi>{st.note.vi}</span>
      </p>

      <div className="sd-controls">
        <button type="button" className="sd-btn" disabled={finished} onClick={() => setTick((t) => t + 1)}>
          <span data-lang-en>Step</span><span data-lang-vi>Bước</span>
        </button>
        <button type="button" className="sd-btn" disabled={finished} onClick={() => setPlaying((p) => !p)}>
          {playing ? (<><span data-lang-en>Pause</span><span data-lang-vi>Dừng</span></>) : (<><span data-lang-en>Play</span><span data-lang-vi>Chạy</span></>)}
        </button>
        <button type="button" className="sd-btn" onClick={() => { setTick(0); setPlaying(false); }}>
          <span data-lang-en>Reset</span><span data-lang-vi>Đặt lại</span>
        </button>
        <span className="gpc-tick">tick {st.tick}</span>
      </div>
    </div>
  );
}
