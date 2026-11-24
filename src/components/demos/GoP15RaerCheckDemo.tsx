import React, { useState } from 'react';

// Measured with the Go program in the post (one run, 2000 requests per size).
const RUNS = [
  { todos: 1000, p99Ms: 0.352, kb: 86 },
  { todos: 10000, p99Ms: 3.06, kb: 1027 },
  { todos: 100000, p99Ms: 32.3, kb: 15438 },
];

const fmt = (n: number) => n.toLocaleString('en-US');

export default function GoP15RaerCheckDemo() {
  const [idx, setIdx] = useState(0);
  const [maxP99, setMaxP99] = useState(5);
  const [maxKb, setMaxKb] = useState(200);
  const run = RUNS[idx];
  const latencyOk = run.p99Ms <= maxP99;
  const memoryOk = run.kb <= maxKb;
  const within = latencyOk && memoryOk;

  return (
    <div className="gp15demo">
      <div className="gp15demo-row">
        <span className="gp15demo-label">
          <span data-lang-en>Dataset</span>
          <span data-lang-vi>Cỡ dữ liệu</span>
        </span>
        {RUNS.map((r, i) => (
          <button key={r.todos} type="button" className={i === idx ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setIdx(i)}>
            <span data-lang-en>{fmt(r.todos)} todos</span>
            <span data-lang-vi>{fmt(r.todos)} todo</span>
          </button>
        ))}
      </div>

      <div className="gp15demo-row">
        <label className="gp15demo-field">
          <span data-lang-en>p99 budget (ms)</span>
          <span data-lang-vi>Ngân sách p99 (ms)</span>
          <input type="number" min={0.1} step={0.5} value={maxP99} onChange={(e) => setMaxP99(Number(e.target.value))} />
        </label>
        <label className="gp15demo-field">
          <span data-lang-en>Memory budget per request (KB)</span>
          <span data-lang-vi>Ngân sách bộ nhớ mỗi request (KB)</span>
          <input type="number" min={1} step={50} value={maxKb} onChange={(e) => setMaxKb(Number(e.target.value))} />
        </label>
      </div>

      <div className="gp15demo-grid">
        <div className={latencyOk ? 'gp15demo-cell is-ok' : 'gp15demo-cell is-over'}>
          <b>{run.p99Ms} ms</b>
          <span>
            <span data-lang-en>p99 latency: {latencyOk ? 'within budget' : 'over budget'}</span>
            <span data-lang-vi>Độ trễ p99: {latencyOk ? 'trong ngân sách' : 'vượt ngân sách'}</span>
          </span>
        </div>
        <div className={memoryOk ? 'gp15demo-cell is-ok' : 'gp15demo-cell is-over'}>
          <b>{fmt(run.kb)} KB</b>
          <span>
            <span data-lang-en>Memory per request: {memoryOk ? 'within budget' : 'over budget'}</span>
            <span data-lang-vi>Bộ nhớ mỗi request: {memoryOk ? 'trong ngân sách' : 'vượt ngân sách'}</span>
          </span>
        </div>
      </div>

      <p className="gp15demo-verdict">
        {within ? (
          <>
            <span data-lang-en>Both numbers are within the budget. Stop here and release. More tuning would add risk for no written gain.</span>
            <span data-lang-vi>Cả hai số đều trong ngân sách. Dừng ở đây và phát hành. Tối ưu thêm chỉ thêm rủi ro mà không có lợi ích nào đã viết ra.</span>
          </>
        ) : (
          <>
            <span data-lang-en>The budget is missed. Go on to step 6: find the bottleneck, pick one level, change one thing, then test again.</span>
            <span data-lang-vi>Trượt ngân sách. Sang bước 6: tìm điểm nghẽn, chọn một tầng, đổi một thứ, rồi test lại.</span>
          </>
        )}
      </p>
    </div>
  );
}
