import React, { useState } from 'react';

type ScenarioId = 'ifaceBox' | 'gcshape' | 'badConstraint';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  compilerBox: string;
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
  ifaceBox: {
    tabEn: '1. Legacy any Slice Boxing vs Generics',
    tabVi: '1. Đóng hộp Interface any vs Generics',
    code: [
      'func MinIface(a, b any) any { ... }        // forces heap box per scalar!',
      'func Min[T cmp.Ordered](a, b T) T {',
      '    if a < b { return a }; return b',
      '}',
      'best := Min(12, 45) // compiled for int registers directly -> 0 B/op!',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'Passing scalars to `any` forces runtime eface boxing & type assertions',
        titleVi: 'Truyền số vào `any` ép đóng hộp Heap và mất an toàn kiểu lúc biên dịch',
        noteEn: 'Before Go 1.18 generics, writing reusable comparators required interface{} (any) boxing values onto heap slots or resorting to reflect, burning both allocations and CPU.',
        noteVi: 'Trước khi có Generics Go 1.18, viết hàm dùng chung buộc phải ép kiểu qua `interface{}` hay `reflect`, vừa tốn cấp phát Heap vừa dễ nổ panic khi ép sai kiểu lúc chạy.',
        compilerBox: 'eface{_type: *int, data: heapCopy(12)} + runtime assertion cost',
        stats: [
          { labelEn: 'Compile type check', labelVi: 'Kiểm kiểu khi build', val: 'Weak (runtime assert!)', bad: true },
          { labelEn: 'Boxing allocations', labelVi: 'Đóng hộp Heap', val: 'High on scalars', bad: true },
          { labelEn: 'Inlining friendly?', labelVi: 'Inline được không?', val: 'Often blocked by reflect' },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'Generics emit direct machine comparison with zero eface boxing',
        titleVi: 'Generics sinh mã máy trực tiếp cho int/float64 với 0 byte đóng hộp',
        noteEn: 'Calling Min(12, 45) compiles straight to register comparisons (zero interface header, zero heap box, and tiny wrappers inline directly into callers!).',
        noteVi: 'Gọi `Min(12, 45)` biên dịch thẳng thành phép so sánh thanh ghi nguyên thủy — 0 tốn header interface 16 byte, 0 cấp phát Heap và thậm chí được inline thẳng!',
        compilerBox: 'GCShape Stencil: Min[go.shape.int](a, b int) -> inlined CMP!',
        stats: [
          { labelEn: 'Heap allocations', labelVi: 'Cấp phát Heap', val: '0 B/op, 0 allocs', good: true },
          { labelEn: 'Compile type check', labelVi: 'An toàn lúc build', val: 'Strict T == T check', good: true },
          { labelEn: 'Code reuse', labelVi: 'Tái sử dụng', val: 'int, float64, string', good: true },
        ],
      },
    ],
  },
  gcshape: {
    tabEn: '2. GCShape Stenciling + Dictionary',
    tabVi: '2. Cơ chế GCShape + Từ điển kiểu Go',
    code: [
      '// Value types emit separate shape code (int vs float64);',
      '// ALL pointer types share ONE single GCShape binary (*uint8)!',
      'func Inspect[T io.Closer](c T) { _ = c.Close() }',
      'Inspect(filePtr) // passes hidden .dict holding (*os.File).Close addr',
      'Inspect(respBody)// reuses EXACT SAME machine code + respBody .dict!',
    ],
    steps: [
      {
        codeLine: 3,
        titleEn: 'All pointer types share ONE compiled stencil + pass tiny static dictionary',
        titleVi: 'Mọi con trỏ *File, *Conn dùng chung ĐÚNG 1 bản mã máy nhờ truyền .dict!',
        noteEn: 'Instead of C++ full monomorphization (bloating binary size 10x for every pointer struct), Go stencils by GCShape (memory size + pointer bitmask) so all pointers share one binary function, receiving a static dictionary parameter for method dispatch.',
        noteVi: 'Khác C++ sinh riêng từng bản code phình to file chạy, Go gộp mọi kiểu có chung hình thái GCShape (tất cả con trỏ dùng chung 1 bản mã!) và truyền thêm bảng tra `.dict` tĩnh để biết gọi `.Close()` của kiểu nào.',
        compilerBox: 'Shared Text: Inspect[go.shape.*uint8](.dict *itab, c *uint8)',
        stats: [
          { labelEn: 'Binary size bloat', labelVi: 'Phình kích thước binary', val: 'Minimal (shared pointers)', good: true },
          { labelEn: 'Compile speed', labelVi: 'Tốc độ biên dịch', val: 'Fast (no C++ template drag)', good: true },
          { labelEn: 'Tiny overhead note', labelVi: 'Đánh đổi nhỏ', val: 'Indirect call via .dict' },
        ],
      },
    ],
  },
  badConstraint: {
    tabEn: '3. Don\'t Force Generics Over Interfaces!',
    tabVi: '3. Đừng Lạm Dụng Generics Thay Interface!',
    code: [
      '// Over-engineered: behavioral I/O rarely gains anything from Generics!',
      'func SaveOrder[S OrderSaver](ctx context.Context, s S, o Order) error',
      '// Idiomatic Go: accept simple interface on consumer side cleanly!',
      'func SaveOrder(ctx context.Context, s OrderSaver, o Order) error',
    ],
    steps: [
      {
        codeLine: 3,
        titleEn: 'When behavior varies (DB vs Mock), keep interfaces—skip Generics',
        titleVi: 'Khi hành vi I/O khác nhau (DB thật vs Mock), dùng Interface gọn hơn hẳn Generics!',
        noteEn: 'Remember Teiva Harsanyi & Ian Lance Taylor rule: Generics introduce indirection and viral [T ...] type parameters if overused for I/O abstraction. Reserve generics for data structures, slices/maps helpers, and pure algorithms across numeric/comparable types.',
        noteVi: 'Nếu chỉ để truyền DB hay Mock test qua I/O mạng vốn đã chậm mili-giây, Interface thường viết gọn hơn, không lây lan `[T ...]` lên toàn bộ chữ ký hàm phía trên. Chỉ dùng Generics cho thuật toán / container lặp kiểu.',
        compilerBox: 'Clean consumer interface -> easy mock & zero generic virality',
        stats: [
          { labelEn: 'I/O dependency injection', labelVi: 'Truyền DB / Cache / HTTP', val: 'Use Interface cleanly', good: true },
          { labelEn: 'Containers & slice algos', labelVi: 'Hàm chung Set / Max / Sort', val: 'Use Generics [T ...]', good: true },
          { labelEn: 'Misuse symptom', labelVi: 'Dấu hiệu lạm dụng', val: '[T io.Reader] boilerplate', bad: true },
        ],
      },
    ],
  },
};

export default function GoGenericsStencilDemo() {
  const [mode, setMode] = useState<ScenarioId>('ifaceBox');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd ggst">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Dispatch Strategy</span>
            <span data-lang-vi>Kiểu biên dịch</span>
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

      <div className="ggst-grid">
        <div className="ggst-pane">
          <div className="ggst-hdr">
            <span data-lang-en>Go Source Trace</span>
            <span data-lang-vi>Code Go Minh Họa</span>
          </div>
          <div className="ggst-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`ggst-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="ggst-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ggst-pane">
          <div className="ggst-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="ggst-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="ggst-box">{st.compilerBox}</div>
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
