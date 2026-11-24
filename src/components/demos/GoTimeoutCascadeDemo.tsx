import React, { useState } from 'react';

// Models the program in the post: handle -> loadUser -> queryDB, one shared deadline.
// No real timing here: the numbers are the two slider values.
const MAX = 500;

export default function GoTimeoutCascadeDemo() {
  const [deadline, setDeadline] = useState(150);
  const [query, setQuery] = useState(400);

  const timedOut = query > deadline;
  const stop = timedOut ? deadline : query;
  const dPct = (deadline / MAX) * 100;
  const sPct = (stop / MAX) * 100;

  return (
    <div className="sd gtc">
      <div className="sd-controls">
        <label className="gtc-slider">
          <span>
            <span data-lang-en>Deadline set in handle: </span>
            <span data-lang-vi>Deadline đặt ở handle: </span>
            <b>{deadline} ms</b>
          </span>
          <input type="range" min={50} max={MAX} step={10} value={deadline} onChange={(e) => setDeadline(Number(e.target.value))} aria-label="Deadline in milliseconds" />
        </label>
        <label className="gtc-slider">
          <span>
            <span data-lang-en>Query would take: </span>
            <span data-lang-vi>Query cần: </span>
            <b>{query} ms</b>
          </span>
          <input type="range" min={50} max={MAX} step={10} value={query} onChange={(e) => setQuery(Number(e.target.value))} aria-label="Query time in milliseconds" />
        </label>
      </div>

      <div className="gtc-track" aria-hidden="true">
        <div className={timedOut ? 'gtc-work is-cut' : 'gtc-work is-ok'} style={{ width: `${sPct}%` }} />
        <div className="gtc-mark" style={{ left: `${dPct}%` }} />
      </div>
      <div className="gtc-axis" aria-hidden="true"><span>0</span><span>{MAX} ms</span></div>

      <ol className="gtc-calls">
        <li>
          <code>handle(ctx)</code>
          <span>
            <span data-lang-en>{timedOut ? 'returns "handle: loadUser: context deadline exceeded"' : 'returns nil'}</span>
            <span data-lang-vi>{timedOut ? 'trả về "handle: loadUser: context deadline exceeded"' : 'trả về nil'}</span>
          </span>
        </li>
        <li>
          <code>loadUser(ctx)</code>
          <span>
            <span data-lang-en>{timedOut ? 'wraps the error and passes it up' : 'returns nil'}</span>
            <span data-lang-vi>{timedOut ? 'bọc lỗi rồi đẩy lên' : 'trả về nil'}</span>
          </span>
        </li>
        <li>
          <code>queryDB(ctx)</code>
          <span>
            <span data-lang-en>{timedOut ? `gives up at ${deadline} ms: ctx.Done() fires, not the ${query} ms query` : `finishes at ${query} ms, before the deadline`}</span>
            <span data-lang-vi>{timedOut ? `bỏ cuộc ở ${deadline} ms: ctx.Done() kích hoạt, không chờ query ${query} ms` : `xong ở ${query} ms, trước deadline`}</span>
          </span>
        </li>
      </ol>
    </div>
  );
}
