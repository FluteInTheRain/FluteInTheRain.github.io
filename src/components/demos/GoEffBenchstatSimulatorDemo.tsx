import React, { useState } from 'react';

type ExperimentId = 'deadcode' | 'noise' | 'benchstat';

export default function GoEffBenchstatSimulatorDemo() {
  const [exp, setExp] = useState<ExperimentId>('deadcode');

  const EXPERIMENTS: Record<
    ExperimentId,
    {
      labelEn: string;
      labelVi: string;
      code: string[];
      bars: { name: string; valText: string; pct: number; bad?: boolean; ok?: boolean }[];
      verdictEn: string;
      verdictVi: string;
      statA: { en: string; vi: string; val: string; bad?: boolean; ok?: boolean };
      statB: { en: string; vi: string; val: string; bad?: boolean; ok?: boolean };
    }
  > = {
    deadcode: {
      labelEn: '1. Compiler dead-code lie',
      labelVi: '1. Bẫy compiler xóa code',
      code: [
        'func BenchmarkMaskEliminated(b *testing.B) {',
        '  for i := 0; i < b.N; i++ {',
        '    computeMask(0xab, uint64(i)) // unused -> deleted!',
        '  }',
        '}',
        '// Fix: store accumulated output in exported Sink:',
        'var globalSink uint64',
        'func BenchmarkMaskObserved(b *testing.B) { ... globalSink = acc }',
      ],
      bars: [
        { name: 'Eliminated (fake!)', valText: '0.31 ns/op', pct: 50, bad: true },
        { name: 'Observed via Sink', valText: '0.61 ns/op', pct: 98, ok: true },
      ],
      verdictEn: 'On Apple M2 Go 1.27, dropping computeMask() output cuts reported runtime in half (~1 CPU cycle) because the compiler eliminates the work.',
      verdictVi: 'Chạy thật trên Apple M2 Go 1.27: quên gán kết quả khiến thời gian đo rớt còn 0,31 ns/op vì compiler tối ưu xóa sạch phép tính.',
      statA: { en: 'Dead-code result', vi: 'Đo lỗi (không gán biến)', val: '0.31 ns/op (LIE)', bad: true },
      statB: { en: 'Real via globalSink', vi: 'Đo thật qua globalSink', val: '0.61 ns/op', ok: true },
    },
    noise: {
      labelEn: '2. Why -count=1 misleads',
      labelVi: '2. Vì sao chạy 1 lần hay sai',
      code: [
        '# Single run (-count=1) on noisy laptop with Slack/IDE open:',
        '$ go test -bench=BenchmarkSum4 -benchtime=250ms',
        '# Safe scientific protocol (-count=6..10 + benchmem + stable host):',
        '$ go test -run "^$" -bench "^BenchmarkSum" -count=6 -cpu=4 -benchmem',
      ],
      bars: [
        { name: 'v4 (noisy run avg)', valText: '1.80 ms ± 69%', pct: 78, bad: true },
        { name: 'v6 (noisy run avg)', valText: '2.09 ms ± 48%', pct: 90, bad: true },
      ],
      verdictEn: 'Variance hit ±69% across 6 short laptop runs (p = 0.240): raw ns/op looks slower or faster randomly until you extend -benchtime and quiet background noise.',
      verdictVi: 'Khi máy đang ồn nền, sai số nhảy tới ±69% (p = 0,240): nhìn 1 lần rất dễ tưởng code nhanh/chậm oan. Tăng -benchtime và tắt app nặng trước khi đo.',
      statA: { en: 'Observed variance', vi: 'Độ dao động thực tế', val: '±69%', bad: true },
      statB: { en: 'Minimum samples', vi: 'Số lần lặp tối thiểu', val: '-count 6..10', ok: true },
    },
    benchstat: {
      labelEn: '3. benchstat v4.txt v6.txt',
      labelVi: '3. Lọc nhiễu bằng benchstat',
      code: [
        '$ benchstat v4.txt v6.txt   # Apple M2 Go 1.27 real output',
        'sec/op:    1.801m ± 69%   vs   2.089m ± 48%   ~ (p=0.240 n=6)',
        'B/op:    1401263.5 ± 0%   vs    216.0 ± 0%    -99.98% (p=0.002 n=6)',
        'allocs/op:   5.000 ± 0%   vs    3.000 ± 0%    -40.00% (p=0.002 n=6)',
      ],
      bars: [
        { name: 'v4 Heap B/op (ReadFile)', valText: '1,401,264 B/op', pct: 100, bad: true },
        { name: 'v6 Heap B/op (8KB Stream)', valText: '216 B/op (-99.98%)', pct: 2, ok: true },
      ],
      verdictEn: 'benchstat refuses to claim a latency win when p=0.240 (~), yet proves with p=0.002 confidence that streaming cut heap allocations by 99.98%!',
      verdictVi: 'benchstat thẳng thắn báo "~ (p=0.240)" chưa chốt được tốc độ vì quá nhiễu, nhưng chứng minh chắc chắn giảm 99,98% RAM Heap (p=0.002)!',
      statA: { en: 'sec/op p-value', vi: 'Độ tin cậy tốc độ', val: '~ (p=0.240)', bad: true },
      statB: { en: 'Heap B/op delta', vi: 'Mức giảm bộ nhớ Heap', val: '-99.98% (p=0.002)', ok: true },
    },
  };

  const c = EXPERIMENTS[exp];

  return (
    <div className="sd geff">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Experiment</span>
            <span data-lang-vi>Thử nghiệm</span>
          </span>
          {(Object.keys(EXPERIMENTS) as ExperimentId[]).map((id) => (
            <button key={id} type="button" className={exp === id ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setExp(id)}>
              <span data-lang-en>{EXPERIMENTS[id].labelEn}</span>
              <span data-lang-vi>{EXPERIMENTS[id].labelVi}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="geff-grid">
        <div className="geff-pane">
          <div className="geff-hdr">
            <span data-lang-en>Benchmark Setup / Terminal Command</span>
            <span data-lang-vi>Code Benchmark &amp; Lệnh đo thật</span>
          </div>
          <div className="geff-code">
            {c.code.map((line, i) => (
              <div key={i} className="geff-line">
                <span className="geff-ln">{`L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="geff-pane">
          <div className="geff-hdr">
            <span data-lang-en>Measured Comparison</span>
            <span data-lang-vi>Biểu đồ so sánh kết quả</span>
          </div>
          <div className="geff-bars">
            {c.bars.map((b, idx) => (
              <div key={idx} className="geff-bar-row">
                <div className="geff-bar-top">
                  <span>{b.name}</span>
                  <b>{b.valText}</b>
                </div>
                <div className="geff-track">
                  <div className={`geff-fill ${b.bad ? 'is-bad' : ''} ${b.ok ? 'is-ok' : ''}`} style={{ width: `${b.pct}%` }} />
                </div>
              </div>
            ))}
            <p className="geff-verdict">
              <span data-lang-en>{c.verdictEn}</span>
              <span data-lang-vi>{c.verdictVi}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="sd-stats">
        <div className={`sd-stat ${c.statA.bad ? 'is-bad' : ''} ${c.statA.ok ? 'is-good' : ''}`}>
          <b>{c.statA.val}</b>
          <span>
            <span data-lang-en>{c.statA.en}</span>
            <span data-lang-vi>{c.statA.vi}</span>
          </span>
        </div>
        <div className={`sd-stat ${c.statB.bad ? 'is-bad' : ''} ${c.statB.ok ? 'is-good' : ''}`}>
          <b>{c.statB.val}</b>
          <span>
            <span data-lang-en>{c.statB.en}</span>
            <span data-lang-vi>{c.statB.vi}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
