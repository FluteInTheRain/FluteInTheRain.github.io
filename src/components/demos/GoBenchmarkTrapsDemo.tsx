import React, { useState } from 'react';

type ScenarioId = 'deadcode' | 'timer' | 'bloop' | 'parallel';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  ssaView: string;
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
  deadcode: {
    tabEn: '1. Dead-Code Elimination',
    tabVi: '1. Compiler Xóa Code Chết',
    code: [
      'func BenchmarkComputeBad(b *testing.B) {',
      '    for i := 0; i < b.N; i++ {',
      '        computeHash("hello") // BUG: result ignored -> compiler drops call!',
      '    }',
      '}',
      'var sink uint64',
      'func BenchmarkComputeGood(b *testing.B) {',
      '    var res uint64',
      '    for b.Loop() { res ^= computeHash("hello") }',
      '    sink = res // keeps compiler honest without global mutex!',
      '}',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Inlining proves computeHash has zero observable side effects',
        titleVi: 'Inlining phát hiện computeHash thuần túy không có tác dụng phụ -> xóa sạch!',
        noteEn: 'Because computeHash("hello") is pure and its return value goes unused, the Go SSA pass eliminates the loop body completely—reporting a fake 0.28 ns/op!',
        noteVi: 'Vì computeHash không ghi biến ngoài và kết quả bị vứt bỏ, bước tối ưu SSA xóa sạch phần thân vòng lặp — ra số benchmark ảo 0,28 ns/op làm bạn tưởng nhanh gấp 100 lần!',
        ssaView: 'SSA Loop Body: [EMPTY JUMP -> RET] (dead call deleted)',
        stats: [
          { labelEn: 'Fake reported latency', labelVi: 'Số đo ảo báo ra', val: '0.28 ns/op (fake!)', bad: true },
          { labelEn: 'Work executed', labelVi: 'Code thật sự chạy', val: 'Empty for-loop only', bad: true },
          { labelEn: 'Trap symptom', labelVi: 'Dấu hiệu nhận biết', val: '< 1 ns on complex func' },
        ],
      },
      {
        codeLine: 9,
        titleEn: 'Assigning accumulated value to package-level `sink` disables deletion',
        titleVi: 'Gán kết quả ra biến package `sink` + `b.Loop()` ép CPU chạy thật',
        noteEn: 'Exporting/storing `res` into package-level `sink` prevents SSA dead-code deletion cleanly; accumulate into local `res` inside the loop so `sink` writes happen once at exit rather than polluting iterations.',
        noteVi: 'Dồn kết quả vào biến cục bộ `res` trong vòng `b.Loop()` rồi mới gán ra biến package `sink` ở cuối giúp SSA không thể xóa code mà vẫn giữ vòng lặp cực sạch.',
        ssaView: 'SSA Loop Body: [computeHash inline preserved] -> sink = res',
        stats: [
          { labelEn: 'Real latency measured', labelVi: 'Độ trễ thật sự', val: '18.4 ns/op', good: true },
          { labelEn: 'Compiler optimized away?', labelVi: 'Bị compiler xóa?', val: 'No (sink escapes trace)', good: true },
          { labelEn: 'Best Go 1.24+ loop', labelVi: 'Chuẩn Go 1.24+', val: 'for b.Loop()', good: true },
        ],
      },
    ],
  },
  timer: {
    tabEn: '2. Setup Time Pollution',
    tabVi: '2. Dính Thời Gian Setup Dữ Liệu',
    code: [
      'func BenchmarkParseBad(b *testing.B) {',
      '    data := generate30MBTestPayload() // 45 ms setup BEFORE timer stops!',
      '    for i := 0; i < b.N; i++ { parse(data) }',
      '}',
      'func BenchmarkParseGood(b *testing.B) {',
      '    data := generate30MBTestPayload()',
      '    b.ResetTimer() // zeros clock AND allocation counters right here!',
      '    for i := 0; i < b.N; i++ { parse(data) }',
      '}',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Setup allocations & 45 ms generation bleed into low b.N iterations',
        titleVi: '45 ms tạo payload mẫu dính luôn vào cả thời gian lẫn B/op của benchmark!',
        noteEn: 'Before entering the loop, generate30MBTestPayload() ran while b.Timer stayed ON—inflating allocs/op and skewing latency across early scaling runs.',
        noteVi: 'Lúc chuẩn bị test payload 30 MB, đồng hồ b vẫn đang đếm — làm kết quả `B/op` bị cộng lây cả rác của hàm tạo mock data!',
        ssaView: 'b.ReportAllocs includes generate30MBTestPayload() garbage!',
        stats: [
          { labelEn: 'Fixture setup', labelVi: 'Setup dữ liệu mẫu', val: 'Counted inside B/op!', bad: true },
          { labelEn: 'Variance across N', labelVi: 'Sai số giữa các lần', val: 'Noisy across runs', bad: true },
          { labelEn: 'Fix', labelVi: 'Cách khắc phục', val: 'Call b.ResetTimer()' },
        ],
      },
      {
        codeLine: 6,
        titleEn: 'b.ResetTimer() (or b.Loop()) cleanly isolates target code',
        titleVi: 'b.ResetTimer() xóa sạch đồng hồ & bộ đếm rác trước khi vào vòng đo',
        noteEn: 'Remember: b.Loop() in Go 1.24+ automatically resets the timer on its first entry AND prevents arguments inside the loop from optimizing away—while StopTimer/StartTimer should NEVER sit inside fast ns loops.',
        noteVi: 'Mẹo hay: `b.Loop()` từ Go 1.24 tự động đặt lại timer ngay lần lặp đầu tiên! Tuyệt đối tránh gọi `b.StopTimer()` bên trong vòng lặp vài nano-giây vì chi phí bật/tắt timer tốn ~40 ns.',
        ssaView: 'Timer reset clean -> pure parse(data) ns/op + allocs/op',
        stats: [
          { labelEn: 'Measured allocs', labelVi: 'Số alloc thực của parse', val: 'Accurate B/op', good: true },
          { labelEn: 'Go 1.24+ b.Loop()', labelVi: 'Lợi ích b.Loop()', val: 'Auto ResetTimer once', good: true },
          { labelEn: 'Per-iter StopTimer?', labelVi: 'Gọi StopTimer mỗi vòng?', val: 'Never in fast loops!', bad: true },
        ],
      },
    ],
  },
  bloop: {
    tabEn: '3. Legacy i < b.N vs b.Loop()',
    tabVi: '3. Vòng cũ b.N vs b.Loop() (Go 1.24+)',
    code: [
      '// Legacy loop: compiler can hoist loop-invariant pure calls ABOVE loop!',
      'for i := 0; i < b.N; i++ {',
      '    _ = fastMath(constX, constY) // called 1x instead of b.N times?!',
      '}',
      '// Go 1.24+ idiomatic benchmark loop:',
      'for b.Loop() {',
      '    fastMath(constX, constY) // compiler keeps args live per iteration!',
      '}',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Classic trap: loop-invariant code motion hoists pure call out of b.N',
        titleVi: 'Bẫy ẩn: compiler tự bốc hàm thuần túy không đổi ra NGOÀI vòng `i < b.N`!',
        noteEn: 'Even if you read the result afterward, because constX/constY stay unchanged across i = 0..b.N, SSA hoists fastMath() outside the loop and calls it just ONCE for all N iterations!',
        noteVi: 'Kể cả khi bạn giữ kết quả sau vòng lặp, do constX và constY không thay đổi qua mỗi vòng `i`, compiler có thể nhấc phép tính ra NGOÀI chạy 1 lần rồi nhân kết quả!',
        ssaView: 'tmp := fastMath(x, y); for i := 0; i < b.N; i++ {}',
        stats: [
          { labelEn: 'Actual calls executed', labelVi: 'Số lần chạy thật', val: '1 call / N iters!', bad: true },
          { labelEn: 'Auto timer reset?', labelVi: 'Tự reset timer setup?', val: 'No (must call manually)' },
          { labelEn: 'Scaling re-runs', labelVi: 'Số lượt chạy b.N', val: 'Multiple trial ramps' },
        ],
      },
      {
        codeLine: 5,
        titleEn: 'Go 1.24+ b.Loop(): compiler guarantees exact per-iteration execution',
        titleVi: 'Go 1.24+ `for b.Loop()`: compiler cấm xóa hoặc nhấc hàm ra ngoài vòng!',
        noteEn: 'The compiler treats the loop body inside `for b.Loop()` specially: arguments remain live, results are not dead-code eliminated, setup before `b.Loop()` auto-resets timers, and scaling runs once cleanly.',
        noteVi: 'Trình biên dịch Go 1.24+ nhận diện riêng cấu trúc `for b.Loop()`: khóa không cho xóa code chết, không nhấc hàm ra ngoài, và tự động reset timer sau phần setup phía trên!',
        ssaView: 'Guaranteed N executions + clean setup auto-reset',
        stats: [
          { labelEn: 'Compiler protection', labelVi: 'Chống xóa code ảo', val: 'Built into Go 1.24+', good: true },
          { labelEn: 'Explicit ResetTimer?', labelVi: 'Cần tự gọi ResetTimer?', val: 'Auto on 1st b.Loop()', good: true },
          { labelEn: 'Statistical stability', labelVi: 'Kết hợp benchstat', val: 'Pair with -count=6..10', good: true },
        ],
      },
    ],
  },
  parallel: {
    tabEn: '4. benchstat Noise vs Signal',
    tabVi: '4. Lọc nhiễu bằng p-value benchstat',
    code: [
      '# Run baseline & candidate on identical quiet machine with count >= 6:',
      'go test -bench=^BenchmarkSum$ -benchmem -count=8 . > old.txt',
      '# (edit single optimization level via TFBO)',
      'go test -bench=^BenchmarkSum$ -benchmem -count=8 . > new.txt',
      'benchstat old.txt new.txt',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Single -count=1 measurement misleads via CPU boost & OS jitter',
        titleVi: 'Chạy 1 lần (-count=1) rất dễ ăn cú lừa bởi Turbo Boost & tiến trình nền OS',
        noteEn: 'A background Spotlight index or thermal throttle shifts single runs by +-12%. Shipping a "9% speedup" from -count=1 regularly turns out to be pure thermal noise.',
        noteVi: 'Chỉ cần tiến trình nền hoặc hạ xung nhiệt lướt qua lúc đo là -count=1 đã lệch tới +-12%. Rất nhiều PR khoe nhanh hơn 9% thực ra chỉ là nhiễu ngẫu nhiên.',
        ssaView: 'Single sample variance -> p-value unknown (~)',
        stats: [
          { labelEn: 'Minimum recommended count', labelVi: 'Số lượt lặp tối thiểu', val: '-count=6 to 10' },
          { labelEn: 'Accept threshold', labelVi: 'Ngưỡng tin cậy', val: 'p < 0.05 (benchstat)' },
          { labelEn: 'If benchstat prints ~', labelVi: 'Nếu thấy dấu ngã ~', val: 'Noise! (No proof)', bad: true },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'Wilcoxon rank-sum test confirms p < 0.001 real improvement',
        titleVi: 'Kiểm định Wilcoxon của benchstat xác nhận p < 0.001 mới dám kết luận',
        noteEn: 'benchstat computes median + variance across all 8 runs. Only clean separation (`-48.2% (p=0.000 n=8)`) validates that your Go optimization beat laptop jitter.',
        noteVi: 'benchstat tính trung vị và độ phân tán qua cả 8 lần đo: chỉ khi thấy p < 0.05 (ví dụ `-48.2% (p=0.000 n=8)`) mới khẳng định tối ưu thật sự có tác dụng.',
        ssaView: 'sec/op: 101.2ms -> 18.4ms (-81.8% p=0.000 n=8)',
        stats: [
          { labelEn: 'Significance proof', labelVi: 'Xác suất ngẫu nhiên', val: 'p = 0.000 (< 0.05)', good: true },
          { labelEn: 'Latency improvement', labelVi: 'Mức cải thiện thật', val: '-81.8% sec/op', good: true },
          { labelEn: 'Reliable habit', labelVi: 'Thói quen chuẩn', val: 'Pair w/ CPU & Mem pprof', good: true },
        ],
      },
    ],
  },
};

export default function GoBenchmarkTrapsDemo() {
  const [mode, setMode] = useState<ScenarioId>('deadcode');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gbtd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Pitfall</span>
            <span data-lang-vi>Cạm bẫy</span>
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

      <div className="gbtd-grid">
        <div className="gbtd-pane">
          <div className="gbtd-hdr">
            <span data-lang-en>Benchmark Source Trace</span>
            <span data-lang-vi>Code Benchmark &amp; Lệnh Đo</span>
          </div>
          <div className="gbtd-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`gbtd-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gbtd-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gbtd-pane">
          <div className="gbtd-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="gbtd-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="gbtd-ssa">
              <span>Compiler / Statistical Effect</span>
              <code>{st.ssaView}</code>
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
