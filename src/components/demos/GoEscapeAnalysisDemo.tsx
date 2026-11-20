import React, { useState } from 'react';

type ScenarioId = 'retptr' | 'anybox' | 'dynmake' | 'closure';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  compilerMsg: string;
  placement: { label: string; where: string; cls: 'ok' | 'bad' };
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
  retptr: {
    tabEn: '1. Return *User Pointer',
    tabVi: '1. Trả về Con trỏ *User',
    code: [
      'func newUserPtr(id int) *User {',
      '    u := User{ID: id} // local candidate on stack',
      '    return &u         // address leaves current frame!',
      '}',
      'func newUserVal(id int) User { return User{ID: id} }',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Return &u crosses frame lifetime boundary',
        titleVi: 'Trả &u ra khỏi stack frame hiện tại -> buộc chuyển lên Heap',
        noteEn: 'Once newUserPtr returns, its stack frame vanishes cleanly when SP unwinds. Any pointer surviving after return CANNOT live on that popped stack frame, so escape analysis emits `moved to heap: u`.',
        noteVi: 'Khi newUserPtr thoát ra, stack frame của nó bị thu hồi ngay lập tức. Vì con trỏ &u còn sống tiếp cho caller dùng, compiler buộc phải cấp phát u lên Heap (`moved to heap: u`).',
        compilerMsg: 'flow: ~r0 <- &u -> moved to heap: u',
        placement: { label: 'u allocation target', where: 'HEAP (runtime.newobject -> GC tracked)', cls: 'bad' },
        stats: [
          { labelEn: 'newUserPtr allocs', labelVi: 'Cấp phát Heap', val: '1 alloc/op (24B)', bad: true },
          { labelEn: 'Cleanup path', labelVi: 'Dọn dẹp sau cùng', val: 'GC scan + sweep', bad: true },
          { labelEn: 'Stack lifetime invariant', labelVi: 'Quy tắc an toàn', val: 'Refs never outlive frame' },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'Fix: return value User directly for small structs',
        titleVi: 'Cách tối ưu: trả thẳng giá trị User thay vì con trỏ *User',
        noteEn: 'Returning User{ID: id} copies 16-24 bytes through CPU registers or caller-owned stack slot with zero Heap allocation and zero GC work—faster in 95% of constructors for small structs!',
        noteVi: 'Trả thẳng User chỉ chép vài từ máy ngay trên thanh ghi / stack của bên gọi, hoàn toàn 0 B/op trên Heap và không hề làm phiền Garbage Collector!',
        compilerMsg: 'inlining call to newUserVal -> 0 escapes',
        placement: { label: 'u allocation target', where: 'STACK / REGISTERS (0 B/op heap)', cls: 'ok' },
        stats: [
          { labelEn: 'newUserVal allocs', labelVi: 'Cấp phát Heap', val: '0 B/op, 0 allocs', good: true },
          { labelEn: 'Stack free cost', labelVi: 'Chi phí dọn RAM', val: '1 CPU instr (SP pop)', good: true },
          { labelEn: 'Inlining bonus', labelVi: 'Tối ưu kèm theo', val: 'Inlined by compiler', good: true },
        ],
      },
    ],
  },
  anybox: {
    tabEn: '2. Boxing into any / fmt',
    tabVi: '2. Đóng hộp any / fmt',
    code: [
      'func logBad(count int) {',
      '    fmt.Println("items:", count) // arg signature: a ...any!',
      '}',
      'func logGood(w *bytes.Buffer, count int) {',
      '    strconv.AppendInt(w.AvailableBuffer(), int64(count), 10)',
      '}',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Interface boxing forces heap escape on non-constant ints',
        titleVi: 'Truyền biến vào interface ...any thường ép đóng hộp lên Heap',
        noteEn: 'fmt.Println(a ...any) accepts an empty interface slice where each entry stores eface{_type, data}. Because `data` needs a stable heap-safe pointer and fmt internally reflects, `count` escapes!',
        noteVi: 'fmt.Println(a ...any) nhận danh sách empty interface chứa con trỏ eface{_type, data}. Vì compiler không chứng minh được fmt không lưu giữ tham số, `count` bị đẩy lên Heap!',
        compilerMsg: '... argument does not escape vs count escapes to heap',
        placement: { label: 'count boxed as eface.data', where: 'HEAP + []any slice alloc', cls: 'bad' },
        stats: [
          { labelEn: 'Boxed overhead', labelVi: 'Chi phí đóng hộp', val: 'Heap alloc per call', bad: true },
          { labelEn: 'Runtime lookup', labelVi: 'Chi phí runtime', val: 'reflect type switch', bad: true },
          { labelEn: 'Hot-path impact', labelVi: 'Tác hại đường nóng', val: 'Millions of GC objs' },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'Concrete typed formatting stays 100% allocation-free',
        titleVi: 'Dùng hàm nhận kiểu tường minh (strconv.AppendInt) sạch 0 allocs',
        noteEn: 'Keeping concrete parameter types (int64, []byte) lets escape analysis prove zero pointers outlive the call—running inside caller registers cleanly at ~5 ns.',
        noteVi: 'Giữ nguyên kiểu cụ thể (int64, []byte) thay vì ...any giúp trình biên dịch chắc chắn 100% không rò con trỏ -> chạy thẳng ~5 ns với 0 cấp phát Heap.',
        compilerMsg: 'w does not escape; count remains in register',
        placement: { label: 'Typed append fast path', where: 'STACK / BUFFER IN-PLACE (0 allocs)', cls: 'ok' },
        stats: [
          { labelEn: 'Allocs per log line', labelVi: 'Số lần cấp phát', val: '0 allocs/op', good: true },
          { labelEn: 'Reflect overhead', labelVi: 'Chi phí reflect', val: 'Eliminated', good: true },
          { labelEn: 'Real-world win', labelVi: 'Thư viện thật', val: 'slog.Attr / zerolog design', good: true },
        ],
      },
    ],
  },
  dynmake: {
    tabEn: '3. Dynamic make([]byte, n)',
    tabVi: '3. Cấp phát động make([]byte, n)',
    code: [
      'func readBad(n int) int {',
      '    buf := make([]byte, n) // runtime variable length n!',
      '    return len(buf)',
      '}',
      'func readFixed() int { var buf [4096]byte; return len(buf) }',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Unknown runtime size `n` forces heap allocation even if n=16',
        titleVi: 'Kích thước biến động `n` lúc chạy ép lên Heap dù n chỉ bằng 16',
        noteEn: 'Go cannot reserve an unknown dynamic size safely inside a fixed stack frame layout—if n happened to be 100 MB, blowing out a 2 KB goroutine stack would crash. So `make([]byte, n)` escapes!',
        noteVi: 'Compiler không đoán được lúc chạy `n` là 16 byte hay 100 MB; để an toàn cho Stack goroutine, mọi `make([]T, n)` có kích thước biến động đều đẩy thẳng lên Heap!',
        compilerMsg: 'make([]byte, n) escapes to heap (non-constant size)',
        placement: { label: 'buf backing array', where: 'HEAP (runtime.makeslice)', cls: 'bad' },
        stats: [
          { labelEn: 'Why escaped?', labelVi: 'Lý do lên Heap', val: 'Dynamic size n', bad: true },
          { labelEn: 'Allocation threshold', labelVi: 'Ngưỡng tràn Stack', val: 'Stack limit ~64 KB' },
          { labelEn: 'Zeroing cost', labelVi: 'Chi phí xóa rác', val: 'memclrHeapBytes' },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'Small constant size <= 64 KB allocates directly on stack frame',
        titleVi: 'Kích thước hằng số nhỏ (<= 64 KB) cấp phát luôn trên Stack frame',
        noteEn: 'A compile-time constant buffer [4096]byte or make([]byte, 0, 256) that never escapes sits cleanly right on the stack (or comes from sync.Pool if larger).',
        noteVi: 'Mảng hoặc slice kích thước hằng số nhỏ hơn ~64 KB không thoát ra ngoài sẽ nằm gọn ngay trên Stack frame — hoặc tái sử dụng từ sync.Pool nếu lớn hơn.',
        compilerMsg: 'buf does not escape -> stack allocated [4096]byte',
        placement: { label: 'Fixed small scratch slice', where: 'STACK (0 GC scanning overhead)', cls: 'ok' },
        stats: [
          { labelEn: 'Heap allocations', labelVi: 'Số alloc Heap', val: '0 allocs/op', good: true },
          { labelEn: 'Pattern used in Go stdlib', labelVi: 'Thư viện chuẩn', val: 'fmt tmp / strconv buf', good: true },
          { labelEn: 'Rule of thumb', labelVi: 'Mẹo thực chiến', val: 'Use [N]byte scratch array', good: true },
        ],
      },
    ],
  },
  closure: {
    tabEn: '4. Closure Reference Capture',
    tabVi: '4. Closure Bắt Biến Qua Con Trỏ',
    code: [
      'func spawnBad(x int) {',
      '    x++ // captured by ref by escaping goroutine!',
      '    go func() { use(x) }() // forces heap alloc for `x`',
      '}',
      'func spawnGood(x int) { go func(v int) { use(v) }(x) }',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Goroutine closure captures `&x` across goroutine lifetimes',
        titleVi: 'Goroutine nền bắt địa chỉ `&x` khiến biến nguyên thủy int lên Heap!',
        noteEn: 'Even though `x` is a tiny 8-byte int, sharing it cleanly into an escaping closure (`go func() { use(x) }()`) turns `x` into a heap cell so both goroutines reference the same address.',
        noteVi: 'Dù `x` chỉ là một biến `int` 8 byte bình thường, việc closure trong `go func()` giữ tham chiếu tới `x` buộc Go chuyển `x` thành 1 ô nhớ trên Heap để tránh hỏng bộ nhớ lúc spawnBad kết thúc.',
        compilerMsg: 'moved to heap: x (captured by escaping func literal)',
        placement: { label: 'Captured scalar x', where: 'HEAP CELL (8-byte boxing)', cls: 'bad' },
        stats: [
          { labelEn: 'Even an int escapes?', labelVi: 'Biến int cũng lên Heap?', val: 'Yes (captured ref)', bad: true },
          { labelEn: 'Hidden risk', labelVi: 'Rủi ro kèm theo', val: 'Easy data race if mutated', bad: true },
          { labelEn: 'Allocations per spawn', labelVi: 'Số alloc khi tạo', val: '+1 heap cell', bad: true },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'Pass `x` as explicit argument into goroutine closure',
        titleVi: 'Truyền thẳng `x` làm tham số `(v int)` của goroutine closure',
        noteEn: 'Passing `(x)` by value snapshots the integer into the new goroutine frame cleanly—zero shared heap box and zero subtle race condition on outer writes.',
        noteVi: 'Truyền thẳng `(x)` theo tham trị đẩy bản sao giá trị vào thẳng khung Stack của goroutine con — vừa dẹp được cấp phát ô nhớ Heap vừa tránh luôn data race nếu hàm ngoài sửa `x`.',
        compilerMsg: 'func literal passes value directly -> x stays on stack',
        placement: { label: 'Value argument copy', where: 'GOROUTINE STACK ARGUMENT', cls: 'ok' },
        stats: [
          { labelEn: 'Outer var x location', labelVi: 'Vị trí biến x cha', val: 'Stays on stack', good: true },
          { labelEn: 'Snapshot safe?', labelVi: 'An toàn race?', val: 'Zero shared mutation', good: true },
          { labelEn: 'Check command', labelVi: 'Lệnh tự kiểm chứng', val: 'go build -gcflags="-m=2"', good: true },
        ],
      },
    ],
  },
};

export default function GoEscapeAnalysisDemo() {
  const [mode, setMode] = useState<ScenarioId>('retptr');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gead">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Escape Case</span>
            <span data-lang-vi>Trường hợp</span>
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

      <div className="gead-grid">
        <div className="gead-pane">
          <div className="gead-hdr">
            <span data-lang-en>Go Source (-gcflags="-m=2")</span>
            <span data-lang-vi>Code Go phân tích Escape</span>
          </div>
          <div className="gead-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`gead-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gead-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gead-pane">
          <div className="gead-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="gead-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className={`gead-badge is-${st.placement.cls}`}>
              <span>{st.placement.label}</span>
              <b>{st.placement.where}</b>
              <code>{st.compilerMsg}</code>
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
