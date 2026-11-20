import React, { useState } from 'react';

type ScenarioId = 'errtree' | 'defernamed' | 'panicrecover' | 'goroutinecrash';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  stackFrames: { frame: string; detail: string; cls?: 'ok' | 'bad' }[];
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
  errtree: {
    tabEn: 'Error Wrapping Tree (%w)',
    tabVi: 'Cây Bọc Lỗi (%w)',
    code: [
      'base := &TimeoutErr{Op: "SELECT", Ms: 250}',
      'joined := errors.Join(io.EOF, base)',
      'err := fmt.Errorf("checkout: %w", joined)',
      'errors.Is(err, io.EOF)      // walks Unwrap() tree',
      'errors.As(err, &timeoutPtr) // extracts typed fields',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Wrap two parallel failure causes with errors.Join',
        titleVi: 'Gom 2 lỗi độc lập bằng errors.Join (Go 1.20+)',
        noteEn: 'errors.Join returns a struct implementing Unwrap() []error holding both io.EOF and *TimeoutErr without losing either identity.',
        noteVi: 'errors.Join tạo struct cài đặt hàm Unwrap() []error giữ cả 2 nguyên nhân io.EOF và *TimeoutErr thay vì vứt mất một lỗi.',
        stackFrames: [
          { frame: 'joined.Unwrap()', detail: '[io.EOF, *TimeoutErr{SELECT, 250ms}]', cls: 'ok' },
          { frame: 'Compare err == io.EOF?', detail: 'FALSE directly (need errors.Is)', cls: 'bad' },
        ],
        stats: [
          { labelEn: 'Tree branches', labelVi: 'Số nhánh lỗi', val: '2 causes kept' },
          { labelEn: 'Direct == match?', labelVi: 'So sánh == trực tiếp', val: 'Fails (wrapped)', bad: true },
          { labelEn: 'errors.Is result', labelVi: 'errors.Is(io.EOF)', val: 'true (DFS walk)', good: true },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'errors.As extracts concrete *TimeoutErr struct',
        titleVi: 'errors.As bóc tách struct *TimeoutErr để đọc chi tiết Op/Ms',
        noteEn: 'Because %w preserves both unwrap interfaces, errors.As traverses past "checkout:" and populates &timeoutPtr so callers branch on Ms == 250.',
        noteVi: 'Vì %w giữ nguyên chuỗi liên kết, errors.As lần sâu qua lớp "checkout:" và gán đúng con trỏ *TimeoutErr để xử lý riêng lỗi timeout.',
        stackFrames: [
          { frame: 'errors.Is(err, io.EOF)', detail: 'Unwrap() -> joined -> matches [0]', cls: 'ok' },
          { frame: 'errors.As(err, &timeoutPtr)', detail: 'Populates Op="SELECT", Ms=250', cls: 'ok' },
        ],
        stats: [
          { labelEn: 'errors.As match', labelVi: 'Khớp errors.As', val: 'true (Ms=250)', good: true },
          { labelEn: 'With %v instead?', labelVi: 'Nếu lỡ dùng %v?', val: 'Chain broken! (false)', bad: true },
          { labelEn: 'Go 1.27 verified', labelVi: 'Đo trên Go 1.27', val: 'Is=true As=true', good: true },
        ],
      },
    ],
  },
  defernamed: {
    tabEn: 'defer Arg vs Named Return',
    tabVi: 'defer Tham Số vs Return Định Danh',
    code: [
      'func commitTx(tx *Tx) (err error) {',
      '    start := time.Now()',
      '    defer logLatency(start) // snapshot NOW (t=0)!',
      '    defer func() { if cerr := tx.Close(); cerr != nil { err = cerr } }()',
      '    return tx.Write()       // return pops LIFO defers',
      '}',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Line 3 locks argument `start` immediately',
        titleVi: 'Dòng 3 chốt cứng giá trị `start` ngay tại lúc gọi defer',
        noteEn: 'Arguments passed directly to a deferred function (logLatency(start)) evaluate NOW, not at function return—avoiding stale overwritten values.',
        noteVi: 'Tham số truyền vào lời gọi defer (như start) được chụp giá trị NGAY tại dòng khai báo defer chứ không đợi tới lúc hàm kết thúc.',
        stackFrames: [
          { frame: '_defer[1] arg snapshot', detail: 'start captured eagerly at t=0', cls: 'ok' },
          { frame: '_defer[2] closure', detail: 'captures &err by reference (runs FIRST)', cls: 'ok' },
        ],
        stats: [
          { labelEn: 'Arg evaluation', labelVi: 'Chốt tham số defer', val: 'At defer statement' },
          { labelEn: 'LIFO execution order', labelVi: 'Thứ tự bung LIFO', val: 'Closure -> logLatency' },
          { labelEn: 'err visible inside?', labelVi: 'Thấy được err trả về?', val: 'Yes (named err)' },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'Return assigns tx.Write(), then closure inspects & overrides err',
        titleVi: 'Lệnh return chạy LIFO: closure chạy trước và cập nhật được named `err`',
        noteEn: 'Return sets `err = tx.Write()`, then runs `_defer[2]`. Because `err` is a named return variable, errors during tx.Close() merge via errors.Join instead of silently dropping!',
        noteVi: 'Return đặt kết quả vào biến tên `err`, rồi mới chạy closure. Nhờ `err` là named return, lỗi đóng transaction không bao giờ bị nuốt mất âm thầm!',
        stackFrames: [
          { frame: '1. _defer[2] pops', detail: 'Merges tx.Close() err into named `err`', cls: 'ok' },
          { frame: '2. _defer[1] pops', detail: 'Logs exact elapsed time since start' },
        ],
        stats: [
          { labelEn: 'Silent Close error?', labelVi: 'Bỏ sót lỗi Close()?', val: 'Zero lost errors', good: true },
          { labelEn: 'Modern cost (Go 1.14+)', labelVi: 'Chi phí open-coded defer', val: '~0-1 ns (inlined)', good: true },
          { labelEn: 'Loop trap warning', labelVi: 'Bẫy vòng lặp', val: 'Extract loop body!', bad: true },
        ],
      },
    ],
  },
  panicrecover: {
    tabEn: 'panic() + recover() Boundary',
    tabVi: 'Biên Giải Cứu panic() / recover()',
    code: [
      'func safeMiddleware(next http.HandlerFunc) {',
      '    defer func() {',
      '        if r := recover(); r != nil { log.Printf("caught: %v", r) }',
      '    }()',
      '    next() // triggers panic("nil ptr in parser") deep inside',
      '}',
    ],
    steps: [
      {
        codeLine: 4,
        titleEn: 'panic() interrupts normal execution & unwinds call stack',
        titleVi: 'panic() cắt ngang luồng chạy bình thường và tháo ngược từng stack frame',
        noteEn: 'As soon as panic fires inside next(), all regular statements are skipped. Go walks back up the current goroutine stack invoking queued defers.',
        noteVi: 'Hễ panic nổ bên trong next(), mọi dòng code phía sau bị bỏ qua hết; runtime cuộn ngược lên các frame cha và kích hoạt các defer đang xếp hàng.',
        stackFrames: [
          { frame: 'next() frame', detail: 'PANIC active -> skipping remaining body', cls: 'bad' },
          { frame: 'safeMiddleware defer', detail: 'Queued on current goroutine stack', cls: 'ok' },
        ],
        stats: [
          { labelEn: 'Control flow', labelVi: 'Luồng thực thi', val: 'Unwinding upward', bad: true },
          { labelEn: 'Defers still run?', labelVi: 'defer vẫn chạy chứ?', val: 'Yes (LIFO unwind)', good: true },
          { labelEn: 'Scope of unwind', labelVi: 'Phạm vi cuộn', val: 'Current G only' },
        ],
      },
      {
        codeLine: 2,
        titleEn: 'recover() directly inside deferred func restores normal flow',
        titleVi: 'recover() gọi trực tiếp trong hàm defer thu hồi panic, cứu sống server',
        noteEn: 'Calling recover() directly inside a deferred closure captures the panic value and resumes execution cleanly at safeMiddleware return (converting crash into HTTP 500).',
        noteVi: 'recover() gọi thẳng bên trong hàm defer (không bọc thêm lớp trung gian) sẽ chặn đứng panic, để HTTP server trả 500 sạch sẽ thay vì chết toàn tiến trình.',
        stackFrames: [
          { frame: 'recover() invoked', detail: 'Returns "nil ptr in parser"; stops unwind!', cls: 'ok' },
          { frame: 'Process status', detail: 'Alive! Other requests keep serving', cls: 'ok' },
        ],
        stats: [
          { labelEn: 'Server process', labelVi: 'Tiến trình server', val: 'Healthy & alive', good: true },
          { labelEn: 'Return to client', labelVi: 'Phản hồi client', val: 'HTTP 500 logged', good: true },
          { labelEn: 'Indirect call rule', labelVi: 'Lưu ý recover()', val: 'Must be direct in defer' },
        ],
      },
    ],
  },
  goroutinecrash: {
    tabEn: 'Uncaught Background Goroutine Crash',
    tabVi: 'Bẫy Goroutine Con Chết Cả Server',
    code: [
      'func handleWebhook() {',
      '    defer middlewareRecover() // ONLY guards handleWebhook G!',
      '    go func() {',
      '        doAsyncWork() // PANIC HERE KILLS ENTIRE SERVER PROCESS!',
      '    }()',
      '}',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'go func() spawns a fresh independent stack',
        titleVi: 'go func() tạo một goroutine hoàn toàn mới tách khỏi defer của hàm cha',
        noteEn: 'Each goroutine owns its own private stack. Parent middlewareRecover() NEVER crosses goroutine boundaries!',
        noteVi: 'Mỗi goroutine mang stack độc lập. Lớp defer recover() ở hàm HTTP handler cha KHÔNG HỀ bảo vệ được goroutine con mới đẻ!',
        stackFrames: [
          { frame: 'Parent HTTP G1', detail: 'Has middlewareRecover(); returns cleanly', cls: 'ok' },
          { frame: 'Child G2 stack', detail: 'Empty defer list -> UNPROTECTED!', cls: 'bad' },
        ],
        stats: [
          { labelEn: 'Parent recover protects G2?', labelVi: 'Cha cứu được G2?', val: 'NO (separate stacks)', bad: true },
          { labelEn: 'Child G2 stack size', labelVi: 'Stack khởi đầu G2', val: '2 KB independent' },
          { labelEn: 'Required pattern', labelVi: 'Cách viết đúng', val: 'Defer inside go func()' },
        ],
      },
      {
        codeLine: 3,
        titleEn: 'Uncaught panic in G2 terminates EVERY goroutine immediately',
        titleVi: 'Panic không bắt trong G2 đánh sập toàn bộ binary + mọi request khác!',
        noteEn: 'Unlike isolated thread pools in some VMs, one uncaught panic in any goroutine terminates the whole OS process. Always wrap spawned goroutines with recover() + stack trace logging.',
        noteVi: 'Chỉ 1 panic lọt lưới ở bất kỳ goroutine nền nào cũng khiến Go runtime giết cả process. Mọi worker chạy nền bắt buộc có defer recover() + debug.Stack() riêng!',
        stackFrames: [
          { frame: 'Child G2 exits with panic', detail: 'Fatal crash -> runtime kills all Gs!', cls: 'bad' },
          { frame: 'Fix: GoSafe helper', detail: 'go func() { defer logRecover(); ... }()', cls: 'ok' },
        ],
        stats: [
          { labelEn: 'OS process state', labelVi: 'Trạng thái process', val: 'SIGABRT / Exit 2', bad: true },
          { labelEn: 'Other active requests', labelVi: 'Các request đang chạy', val: 'Dropped abruptly', bad: true },
          { labelEn: 'Prevention', labelVi: 'Phòng ngừa chuẩn', val: 'Per-goroutine recover', good: true },
        ],
      },
    ],
  },
};

export default function GoDeferPanicDemo() {
  const [mode, setMode] = useState<ScenarioId>('errtree');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gdpd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Scenario</span>
            <span data-lang-vi>Kịch bản</span>
          </span>
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={mode === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => {
                setMode(id);
                setStepIdx(0);
              }}
            >
              <span data-lang-en>{SCENARIOS[id].tabEn}</span>
              <span data-lang-vi>{SCENARIOS[id].tabVi}</span>
            </button>
          ))}
        </div>

        <div className="sd-group sd-run">
          <button
            type="button"
            className="sd-btn"
            disabled={stepIdx === 0}
            onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
          >
            <span data-lang-en>Prev</span>
            <span data-lang-vi>Lùi</span>
          </button>
          <button
            type="button"
            className="sd-btn is-on"
            disabled={stepIdx >= cur.steps.length - 1}
            onClick={() => setStepIdx((s) => Math.min(cur.steps.length - 1, s + 1))}
          >
            <span data-lang-en>Next ({stepIdx + 1}/{cur.steps.length})</span>
            <span data-lang-vi>Bước tiếp ({stepIdx + 1}/{cur.steps.length})</span>
          </button>
        </div>
      </div>

      <div className="gdpd-grid">
        <div className="gdpd-pane">
          <div className="gdpd-hdr">
            <span data-lang-en>Go Source Trace</span>
            <span data-lang-vi>Chạy từng dòng code Go</span>
          </div>
          <div className="gdpd-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`gdpd-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gdpd-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gdpd-pane">
          <div className="gdpd-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="gdpd-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="gdpd-frames">
              {st.stackFrames.map((f, i) => (
                <div key={i} className={`gdpd-frame ${f.cls ? `is-${f.cls}` : ''}`}>
                  <span>{f.frame}</span>
                  <b>{f.detail}</b>
                </div>
              ))}
            </div>
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
