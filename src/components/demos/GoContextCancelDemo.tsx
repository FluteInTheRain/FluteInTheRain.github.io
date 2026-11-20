import React, { useState } from 'react';

type ScenarioId = 'rctxLeak' | 'withoutCancel' | 'rwlockDeadlock';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  ctxState: string;
  stats: [
    { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean },
    { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean },
    { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean },
  ];
}

const SCENARIOS: Record<
  ScenarioId,
  { tabEn: string; tabVi: string; code: string[]; steps: StepSpec[] }
> = {
  rctxLeak: {
    tabEn: '1. Bug: Passing r.Context() to Background Job',
    tabVi: '1. Bug: Truyền r.Context() Vào Job Nền',
    code: [
      'func OrderHandler(w http.ResponseWriter, r *http.Request) {',
      '    go saveAuditTrail(r.Context(), orderID) // async audit write!',
      '    w.WriteHeader(http.StatusAccepted)      // HTTP finishes in 2 ms!',
      '} // net/http CANCELS r.Context() the instant handler returns!',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'HTTP handler finishes in 2 ms -> net/http cancels r.Context() immediately!',
        titleVi: 'HTTP handler trả xong 202 sau 2 ms -> net/http lập tức hủy r.Context()!',
        noteEn: 'Passing r.Context() into a background goroutine means the audit SQL INSERT receives `context.Canceled` mid-flight 2 ms later—silently losing audit logs in production!',
        noteVi: 'Ngay khoảnh khắc HTTP handler trả kết quả, net/http tự động hủy `r.Context()`. Goroutine chạy ngầm chưa kịp INSERT xuống SQL đã bị cắt ngang với lỗi `context.Canceled`!',
        ctxState: 'r.Context().Done() = CLOSED (Err: context canceled) -> saveAuditTrail aborts!',
        stats: [
          { labelEn: 'Audit SQL write', labelVi: 'Lưu audit SQL', val: 'Aborted silently!', bad: true },
          { labelEn: 'Why it failed', labelVi: 'Lý do thất bại', val: 'Handler return = ctx cancel', bad: true },
          { labelEn: 'Go 1.21+ fix', labelVi: 'Cách sửa chuẩn', val: 'context.WithoutCancel(ctx)', good: true },
        ],
      },
    ],
  },
  withoutCancel: {
    tabEn: '2. Fix: context.WithoutCancel + Own Deadline',
    tabVi: '2. Fix: context.WithoutCancel + Deadline Riêng',
    code: [
      'func OrderHandler(w http.ResponseWriter, r *http.Request) {',
      '    bgCtx := context.WithoutCancel(r.Context()) // keeps trace_id values!',
      '    go func() {',
      '        ctx, cancel := context.WithTimeout(bgCtx, 5*time.Second)',
      '        defer cancel()',
      '        saveAuditTrail(ctx, orderID) // completes safely post-HTTP!',
      '    }()',
      '}',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'WithoutCancel preserves trace IDs while detaching HTTP cancellation',
        titleVi: 'WithoutCancel giữ nguyên trace_id/auth nhưng tách khỏi tín hiệu hủy HTTP',
        noteEn: 'Go 1.21 added `context.WithoutCancel(ctx)` specifically for async side tasks: request tracing metadata survives cleanly while giving the background write its own bounded 5-second timeout.',
        noteVi: '`context.WithoutCancel(ctx)` (từ Go 1.21) vừa giữ được thông tin trace/user từ request cha vừa miễn nhiễm với lệnh hủy khi HTTP đóng kết nối, rồi bọc tiếp `WithTimeout(5s)` riêng.',
        ctxState: 'bgCtx inherits Values (trace_id) ONLY; bounded cleanly by 5s timeout',
        stats: [
          { labelEn: 'Trace metadata kept?', labelVi: 'Giữ được trace_id?', val: 'Yes (ctx.Value intact)', good: true },
          { labelEn: 'Aborts on HTTP 202?', labelVi: 'Bị ngắt khi trả HTTP?', val: 'No (detached safely)', good: true },
          { labelEn: 'Bounded lifetime?', labelVi: 'Có timeout riêng?', val: 'Yes (5s deadline)', good: true },
        ],
      },
    ],
  },
  rwlockDeadlock: {
    tabEn: '3. RWMutex Writer-Priority Deadlock',
    tabVi: '3. Bẫy Deadlock RLock Lồng Nhau',
    code: [
      '// Goroutine A holds mu.RLock(), then calls helper calling mu.RLock() again!',
      'func outerRead() { mu.RLock(); defer mu.RUnlock(); innerRead() }',
      'func innerRead() { mu.RLock(); defer mu.RUnlock(); ... }',
      '// Meanwhile Goroutine B calls mu.Lock() -> DEADLOCK across all 3!',
    ],
    steps: [
      {
        codeLine: 3,
        titleEn: 'Recursive RLock deadlocks the moment ANY writer calls mu.Lock() between them!',
        titleVi: 'Gọi RLock() lồng RLock() sẽ kẹt cứng DEADLOCK ngay khi có 1 writer chen ở giữa!',
        noteEn: 'In Go sync.RWMutex, a waiting writer (Goroutine B calling Lock) blocks ALL new RLock calls to prevent writer starvation. Because outerRead waits for innerRead to get its nested RLock—and innerRead waits on B—and B waits on outerRead releasing RLock: permanent deadlock!',
        noteVi: 'Để tránh writer bị bỏ đói, khi Goroutine B gọi `mu.Lock()`, Go chặn mọi lệnh `RLock()` mới cho tới khi writer xong. Lúc đó `outerRead` chờ `innerRead`, `innerRead` chờ `B`, còn `B` lại chờ chính `outerRead` nhả khóa -> Treo cứng vĩnh viễn!',
        ctxState: 'CYCLE: outerRead -> waits innerRead(RLock) -> waits B(Lock) -> waits outerRead(RUnlock)!',
        stats: [
          { labelEn: 'Single-thread test', labelVi: 'Test không có writer', val: 'Passes deceptively!', bad: true },
          { labelEn: 'With concurrent writer', labelVi: 'Có writer xen ngang', val: 'Permanent Deadlock!', bad: true },
          { labelEn: 'Fix (etcd lesson)', labelVi: 'Quy tắc bắt buộc', val: 'NEVER acquire lock recursively', good: true },
        ],
      },
    ],
  },
};

export default function GoContextCancelDemo() {
  const [mode, setMode] = useState<ScenarioId>('rctxLeak');
  const st = SCENARIOS[mode].steps[0];

  return (
    <div className="sd gccd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Concurrency Trap</span>
            <span data-lang-vi>Bẫy Đồng Thời</span>
          </span>
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={mode === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => setMode(id)}
            >
              <span data-lang-en>{SCENARIOS[id].tabEn}</span>
              <span data-lang-vi>{SCENARIOS[id].tabVi}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gccd-grid">
        <div className="gccd-pane">
          <div className="gccd-hdr">
            <span data-lang-en>Go Source Trace</span>
            <span data-lang-vi>Code Go Minh Họa</span>
          </div>
          <div className="gccd-code">
            {SCENARIOS[mode].code.map((line, i) => (
              <div key={i} className={`gccd-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gccd-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gccd-pane">
          <div className="gccd-hdr">
            <span data-lang-en>{st.titleEn}</span>
            <span data-lang-vi>{st.titleVi}</span>
          </div>
          <div className="gccd-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="gccd-state">{st.ctxState}</div>
          </div>
        </div>
      </div>

      <div className="sd-stats">
        {st.stats.map((m, idx) => (
          <div key={idx} className={`sd-stat ${m.good ? 'is-good' : ''} ${m.bad ? 'is-bad' : ''}`}>
            <b>{m.val}</b>
            <span>
              <span data-lang-en>{m.labelEn}</span>
              <span data-lang-vi>{m.labelVi}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
