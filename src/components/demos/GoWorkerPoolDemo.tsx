import React, { useEffect, useState } from 'react';

// A tick-by-tick model of a worker pool: jobs arrive, wait in a queue, and a
// fixed number of workers take them. One tick = 100 ms. It is a teaching
// simulation, not a measurement.
const TICKS = 50; // a 5 second run
const TICK_MS = 100;
const MAX_CELLS = 24;

interface Params {
  workers: number;
  rate: number; // jobs arriving per second
  service: number; // milliseconds one job takes
}

interface State {
  tick: number;
  queue: number;
  maxQueue: number;
  done: number;
  busy: boolean[];
}

function simulate(p: Params, ticks: number): State {
  const perJob = Math.max(1, Math.round(p.service / TICK_MS));
  const left: number[] = Array.from({ length: p.workers }, () => 0);
  let queue = 0;
  let maxQueue = 0;
  let done = 0;
  let credit = 0;
  for (let t = 1; t <= ticks; t++) {
    credit += (p.rate * TICK_MS) / 1000;
    const arrivals = Math.floor(credit);
    credit -= arrivals;
    queue += arrivals;
    for (let w = 0; w < left.length; w++) {
      if (left[w] === 0 && queue > 0) {
        queue--;
        left[w] = perJob;
      }
    }
    maxQueue = Math.max(maxQueue, queue);
    for (let w = 0; w < left.length; w++) {
      if (left[w] > 0) {
        left[w]--;
        if (left[w] === 0) done++;
      }
    }
  }
  return { tick: ticks, queue, maxQueue, done, busy: left.map((x) => x > 0) };
}

const WORKERS = [1, 2, 4, 8];
const RATES = [10, 20, 40];
const SERVICES = [100, 200];

export default function GoWorkerPoolDemo() {
  const [workers, setWorkers] = useState(2);
  const [rate, setRate] = useState(20);
  const [service, setService] = useState(200);
  // Start on the finished run so the server-rendered page already shows results.
  const [tick, setTick] = useState(TICKS);
  const [playing, setPlaying] = useState(false);

  const st = simulate({ workers, rate, service }, tick);
  const capacity = Math.round((workers * 1000) / service);
  const seconds = tick / (1000 / TICK_MS);
  const throughput = seconds > 0 ? (st.done / seconds).toFixed(1) : '0.0';
  const finished = tick >= TICKS;
  const overloaded = rate > capacity;

  useEffect(() => {
    if (!playing) return;
    if (finished) { setPlaying(false); return; }
    const id = window.setTimeout(() => setTick((t) => t + 1), 120);
    return () => window.clearTimeout(id);
  }, [playing, tick, finished]);

  const change = (fn: () => void) => { fn(); setTick(TICKS); setPlaying(false); };
  const replay = () => { setTick(0); setPlaying(true); };
  const cells = Math.min(st.queue, MAX_CELLS);

  return (
    <div className="sd gwp">
      <div className="sd-controls">
        <div className="sd-group">
          <span><span data-lang-en>Workers</span><span data-lang-vi>Số worker</span></span>
          {WORKERS.map((w) => (
            <button key={w} type="button" className={workers === w ? 'sd-btn is-on' : 'sd-btn'} onClick={() => change(() => setWorkers(w))}>{w}</button>
          ))}
        </div>
        <div className="sd-group">
          <span><span data-lang-en>Jobs arriving per second</span><span data-lang-vi>Job đến mỗi giây</span></span>
          {RATES.map((r) => (
            <button key={r} type="button" className={rate === r ? 'sd-btn is-on' : 'sd-btn'} onClick={() => change(() => setRate(r))}>{r}</button>
          ))}
        </div>
        <div className="sd-group">
          <span><span data-lang-en>One job takes</span><span data-lang-vi>Một job mất</span></span>
          {SERVICES.map((s) => (
            <button key={s} type="button" className={service === s ? 'sd-btn is-on' : 'sd-btn'} onClick={() => change(() => setService(s))}>{s} ms</button>
          ))}
        </div>
      </div>

      <div className="gwp-stage" aria-hidden="true">
        <div className="gwp-col">
          <small><span data-lang-en>queue (jobs waiting)</span><span data-lang-vi>hàng đợi (job đang chờ)</span></small>
          <div className="gwp-queue">
            {Array.from({ length: cells }).map((_, i) => (<span key={i} className="gwp-cell" />))}
            {st.queue > MAX_CELLS ? <b>+{st.queue - MAX_CELLS}</b> : null}
          </div>
        </div>
        <div className="gwp-col">
          <small><span data-lang-en>workers</span><span data-lang-vi>worker</span></small>
          <div className="gwp-workers">
            {st.busy.map((b, i) => (
              <span key={i} className={b ? 'gwp-worker is-busy' : 'gwp-worker'}>{i + 1}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat"><span><span data-lang-en>Pool capacity</span><span data-lang-vi>Sức chứa của pool</span></span><b>{capacity} /s</b></div>
        <div className="sd-stat"><span><span data-lang-en>Finished jobs</span><span data-lang-vi>Job xong</span></span><b>{st.done}</b></div>
        <div className="sd-stat"><span><span data-lang-en>Throughput</span><span data-lang-vi>Thông lượng</span></span><b>{throughput} /s</b></div>
        <div className="sd-stat"><span><span data-lang-en>Queue now / peak</span><span data-lang-vi>Hàng đợi nay / đỉnh</span></span><b>{st.queue} / {st.maxQueue}</b></div>
      </div>

      <p className="gwp-note" role="status">
        {overloaded ? (
          <>
            <span data-lang-en>Jobs arrive faster than the {workers} worker(s) can finish them ({rate}/s in, {capacity}/s out), so the queue keeps growing. Add workers, or the queue never drains.</span>
            <span data-lang-vi>Job đến nhanh hơn {workers} worker xử lý được ({rate}/s vào, {capacity}/s ra), nên hàng đợi cứ dài ra. Thêm worker, nếu không hàng đợi không bao giờ cạn.</span>
          </>
        ) : (
          <>
            <span data-lang-en>The pool keeps up ({rate}/s in, up to {capacity}/s out). Throughput equals the arrival rate and the queue stays short. More workers than this would sit idle.</span>
            <span data-lang-vi>Pool theo kịp ({rate}/s vào, tối đa {capacity}/s ra). Thông lượng bằng tốc độ job đến và hàng đợi ngắn. Thêm worker nữa chỉ làm worker ngồi không.</span>
          </>
        )}
      </p>

      <div className="sd-controls">
        <button type="button" className="sd-btn" onClick={replay}>
          <span data-lang-en>Replay 5 seconds</span><span data-lang-vi>Chạy lại 5 giây</span>
        </button>
        <button type="button" className="sd-btn" disabled={!playing} onClick={() => setPlaying(false)}>
          <span data-lang-en>Pause</span><span data-lang-vi>Dừng</span>
        </button>
        <span className="gwp-tick">t = {seconds.toFixed(1)} s</span>
      </div>
    </div>
  );
}
