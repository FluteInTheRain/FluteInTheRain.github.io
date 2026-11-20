import React, { useState } from 'react';

type GateId = 'stop-early' | 'pick-level' | 'tfbo-loop';

interface StepData {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  statA: { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean };
  statB: { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean };
  statC: { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean };
  noteEn: string;
  noteVi: string;
}

const SCENARIOS: Record<
  GateId,
  {
    tabEn: string;
    tabVi: string;
    code: string[];
    steps: StepData[];
  }
> = {
  'stop-early': {
    tabEn: 'Gate 1: Within RAER -> Stop!',
    tabVi: 'Cửa 1: Đạt RAER -> Dừng ngay!',
    code: [
      '// RAER Contract: batch export <= 5.0 s, RAM <= 1.0 GB',
      'BenchmarkExport_10kRows: 1.56 s/op · 226 MB peak RSS',
      '// Should we rewrite decoder with unsafe + sync.Pool?',
      'decision := checkRAER(measured=1.56s, limit=5.0s)',
      'return decision // PASSES RAER -> SHIP AS-IS!',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'Inspect written RAER targets first',
        titleVi: 'Đọc lại hợp đồng RAER đã cam kết trước',
        statA: { labelEn: 'Latency ceiling', labelVi: 'Trần độ trễ', val: '<= 5.0 s' },
        statB: { labelEn: 'Memory ceiling', labelVi: 'Trần RAM', val: '<= 1.0 GB' },
        statC: { labelEn: 'Baseline passes test?', labelVi: 'Unit test?', val: 'PASS', good: true },
        noteEn: 'Because RAER puts numbers on what "fast enough" means, engineers avoid weeks of unnecessary tuning.',
        noteVi: 'Có số RAER rạch ròi giúp team không bị tâm lý cầu toàn kéo vào tối ưu thừa thãi.',
      },
      {
        codeLine: 1,
        titleEn: 'Compare baseline measurement vs RAER',
        titleVi: 'Đối chiếu số đo hiện tại với trần RAER',
        statA: { labelEn: 'Measured latency', labelVi: 'Đo thực tế', val: '1.56 s (3.2x headroom)', good: true },
        statB: { labelEn: 'Measured RAM', labelVi: 'RAM thực tế', val: '226 MB (4.4x headroom)', good: true },
        statC: { labelEn: 'Action required', labelVi: 'Hành động', val: 'Jump to Step 9 Release!', good: true },
        noteEn: 'At 1.56s vs 5s target, optimization ends cleanly right at TFBO Step 5. Move directly to telemetry.',
        noteVi: 'Số đo chỉ 1,56s so với trần 5s: quy trình TFBO dừng đẹp ngay Bước 5 — ship thẳng lên prod.',
      },
    ],
  },
  'pick-level': {
    tabEn: 'Gate 2: Top Design Level First',
    tabVi: 'Cửa 2: Chọn Tầng cao nhất',
    code: [
      '// Service fails RAER: 120 ms p99 (target <= 15 ms)',
      '// Profile shows 95 ms waiting on 200 sequential SQL queries!',
      'AttemptA := tweakStringAllocInGo()   // L3 Code: -0.4 ms!',
      'AttemptB := batchSingleSQLInQuery()  // L2 Algo/DB: -88 ms!',
      'ship(AttemptB) // p99 drops 120 ms -> 11 ms!',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Wrong level (L3 Code) on an L2 bottleneck',
        titleVi: 'Sửa nhầm tầng Code (L3) khi lỗi nằm ở Tầng 2',
        statA: { labelEn: 'Effort spent', labelVi: 'Công sức bỏ ra', val: '3 days rewriting strings' },
        statB: { labelEn: 'End-to-end speedup', labelVi: 'Hiệu quả thật', val: '120 → 119.6 ms (0.3%)', bad: true },
        statC: { labelEn: 'RAER met?', labelVi: 'Đạt RAER?', val: 'FAIL', bad: true },
        noteEn: 'Polishing string allocations inside Go code cannot speed up 200 sequential network round-trips to Postgres.',
        noteVi: 'Tối ưu từng nano-giây ép chuỗi trong Go chẳng cứu nổi 200 lần gọi SQL nối đuôi nhau ngoài mạng.',
      },
      {
        codeLine: 3,
        titleEn: 'Move up to Level 1/2 (Batch SQL query)',
        titleVi: 'Nhảy lên Tầng 2: Gộp thành 1 câu SQL WHERE IN',
        statA: { labelEn: 'DB round-trips', labelVi: 'Số lượt gọi DB', val: '200 → 1', good: true },
        statB: { labelEn: 'New p99 latency', labelVi: 'Độ trễ p99 mới', val: '11.0 ms (10.9x faster!)', good: true },
        statC: { labelEn: 'Go code complexity', labelVi: 'Độ phức tạp Go', val: 'Simpler & shorter!', good: true },
        noteEn: 'Fixing the highest-leverage Design Level delivers an instant 10x gain while leaving Go code simpler than before.',
        noteVi: 'Chữa đúng ở tầng thiết kế cao hơn giúp giảm độ trễ 10 lần ngay lập tức mà code Go còn ngắn gọn hơn.',
      },
    ],
  },
  'tfbo-loop': {
    tabEn: 'Gate 3: Guard Functionality on Loop',
    tabVi: 'Cửa 3: Giữ đúng Test qua TFBO',
    code: [
      'func TestSumParity(t *testing.T) { /* verifies edge inputs */ }',
      '// TFBO Steps 7 -> 8: change ONE design level, re-run tests',
      'runGoTestRaceAndVerifyBenchstat()',
      '// Trap: unsafe slice-to-string optimization fails on concurrent edit',
      'if !testPass || !benchstatSignificant { gitRevert(); retry() }',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'TDD builds correctness harness BEFORE tuning',
        titleVi: 'TDD khóa chặt logic Đúng trước khi tối ưu',
        statA: { labelEn: 'Unit + Fuzz Tests', labelVi: 'Bộ Test bảo vệ', val: 'Green + -race', good: true },
        statB: { labelEn: 'Optimization scope', labelVi: 'Phạm vi mỗi vòng', val: '1 Design Level only' },
        statC: { labelEn: 'Mixing refactors?', labelVi: 'Sửa gộp nhiều chỗ?', val: 'Forbidden', bad: true },
        noteEn: 'Changing multiple levels in one commit mixes regressions and gains so you never know which change actually helped.',
        noteVi: 'Đừng bao giờ vừa đổi cấu trúc dữ liệu vừa bật batch pool trong cùng 1 commit — không tách được công tội.',
      },
      {
        codeLine: 4,
        titleEn: 'Loop cleanly back to Step 1 every iteration',
        titleVi: 'Quay lại Test ở Bước 1 sau mỗi lần sửa',
        statA: { labelEn: 'Correctness guarantee', labelVi: 'Bảo chứng đúng', val: 'Zero broken invariants', good: true },
        statB: { labelEn: 'Speedup proof', labelVi: 'Chứng cứ tốc độ', val: 'benchstat p < 0.05', good: true },
        statC: { labelEn: 'Maintainability check', labelVi: 'Duyệt độ dễ đọc', val: 'Code stays auditable', good: true },
        noteEn: 'Remember Sutter & Alexandrescu: making a correct program fast is infinitely easier than debugging a fast, subtly broken one.',
        noteVi: 'Đưa một hàm chạy đúng chạy nhanh luôn dễ hơn ngàn lần đi sửa bug âm thầm trong một hàm nhanh mà sai.',
      },
    ],
  },
};

export default function GoEffTfboDecisionDemo() {
  const [gate, setGate] = useState<GateId>('stop-early');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[gate];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd ge8f">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>TFBO Gate</span>
            <span data-lang-vi>Cửa kiểm soát</span>
          </span>
          {(Object.keys(SCENARIOS) as GateId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={gate === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => {
                setGate(id);
                setStepIdx(0);
              }}
            >
              <span data-lang-en>{SCENARIOS[id].tabEn}</span>
              <span data-lang-vi>{SCENARIOS[id].tabVi}</span>
            </button>
          ))}
        </div>

        <div className="sd-group sd-run">
          <button type="button" className="sd-btn" disabled={stepIdx === 0} onClick={() => setStepIdx((s) => Math.max(0, s - 1))}>
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

      <div className="ge8f-grid">
        <div className="ge8f-pane">
          <div className="ge8f-hdr">
            <span data-lang-en>Engineering Decision Trace</span>
            <span data-lang-vi>Tình huống ra quyết định TFBO</span>
          </div>
          <div className="ge8f-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`ge8f-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="ge8f-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ge8f-pane">
          <div className="ge8f-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="ge8f-note">
            <span data-lang-en>{st.noteEn}</span>
            <span data-lang-vi>{st.noteVi}</span>
          </div>
        </div>
      </div>

      <div className="sd-stats">
        {[st.statA, st.statB, st.statC].map((m, idx) => (
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
