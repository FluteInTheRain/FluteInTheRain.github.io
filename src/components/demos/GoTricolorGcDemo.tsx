import React, { useState } from 'react';

type ScenarioId = 'sweepcycle' | 'barrier' | 'pacer';

interface NodeState {
  id: string;
  label: string;
  color: 'white' | 'grey' | 'black';
}

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  nodes: NodeState[];
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
  sweepcycle: {
    tabEn: '1. Tri-Color Mark & Sweep Cycle',
    tabVi: '1. Chu trình Đánh dấu 3 màu',
    code: [
      'runtime.GC() // Phase 1: Sweep Termination -> STW Mark Setup (~50 us)',
      '// Roots (Stacks + Globals) pushed into Grey work queue',
      '// Concurrent Mark workers pop Grey -> scan ptrs -> mark Black',
      '// STW Mark Termination disables write barrier (~50 us)',
      '// Background Sweep reclaims all remaining White allocations',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Mark Setup (brief STW ~50 us): roots painted Grey',
        titleVi: 'Pha Mark Setup (dừng cực ngắn ~50 us): tô Xám toàn bộ Root',
        noteEn: 'At cycle start every heap block starts White (presumed dead). Go pauses goroutines briefly to enable the Hybrid Write Barrier and shade direct Root pointers (Stack Root A) Grey.',
        noteVi: 'Đầu chu kỳ mọi ô trên Heap mang màu Trắng (coi như sắp xóa). Runtime dừng chớp mắt ~50 us để bật Write Barrier và tô Xám các Root trên Stack (Node A).',
        nodes: [
          { id: 'Root->A', label: 'A (live root)', color: 'grey' },
          { id: 'A->B', label: 'B (child)', color: 'white' },
          { id: 'C', label: 'C (orphan garbage)', color: 'white' },
          { id: 'D', label: 'D (orphan garbage)', color: 'white' },
        ],
        stats: [
          { labelEn: 'STW pause #1', labelVi: 'Ngưng STW đầu pha', val: '~0.05 ms (MarkSetup)' },
          { labelEn: 'Grey work queue', labelVi: 'Hàng đợi Xám', val: '[Node A]' },
          { labelEn: 'Remaining White', labelVi: 'Chưa quét (Trắng)', val: 'B, C, D' },
        ],
      },
      {
        codeLine: 2,
        titleEn: 'Concurrent Marking: worker goroutines scan Grey -> Black',
        titleVi: 'Đánh dấu đồng thời: quét Xám -> đẩy con thành Xám -> tô Đen cha',
        noteEn: 'Application goroutines resume running alongside background markers (~25% CPU). Markers trace pointers out of A -> shade child B Grey, mark A Black (fully scanned), leaving C and D untouched White.',
        noteVi: 'App chạy lại song song với goroutine GC nền (~25% CPU). GC duyệt con trỏ từ A -> tô Xám B rồi tô Đen A (xong hẳn); các rác cô lập C, D giữ nguyên màu Trắng.',
        nodes: [
          { id: 'Root->A', label: 'A (scanned)', color: 'black' },
          { id: 'A->B', label: 'B (marked)', color: 'black' },
          { id: 'C', label: 'C (garbage)', color: 'white' },
          { id: 'D', label: 'D (garbage)', color: 'white' },
        ],
        stats: [
          { labelEn: 'Black (kept)', labelVi: 'Màu Đen (giữ lại)', val: 'A, B', good: true },
          { labelEn: 'App paused?', labelVi: 'App có bị treo?', val: 'Running concurrently', good: true },
          { labelEn: 'Still White', labelVi: 'Vẫn là Trắng', val: 'C, D (unreachable)' },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'Concurrent Sweep frees White slots without moving live objects',
        titleVi: 'Pha Quét đồng thời trả các ô Trắng về mcache/mheap — không dời ô sống',
        noteEn: 'Go GC is non-moving/non-compacting (using TCMalloc size classes instead of copying pointers), so C and D sweep cleanly to free lists with zero object relocation!',
        noteVi: 'Go GC KHÔNG dời vị trí biến sống nên khỏi cần sửa hàng triệu con trỏ; C và D tự trả slot trống về mspan theo đúng size-class.',
        nodes: [
          { id: 'Root->A', label: 'A (kept)', color: 'black' },
          { id: 'A->B', label: 'B (kept)', color: 'black' },
          { id: 'C', label: 'C (FREED)', color: 'white' },
          { id: 'D', label: 'D (FREED)', color: 'white' },
        ],
        stats: [
          { labelEn: 'Reclaimed slots', labelVi: 'Ô rác thu hồi', val: 'C, D freed lazily', good: true },
          { labelEn: 'Next GC trigger', labelVi: 'Ngưỡng chạy lần tới', val: 'live * (1 + GOGC/100)' },
          { labelEn: 'Verified M2 gctrace', labelVi: 'Đo thật gctrace M2', val: '0.02+0.7+0.002 ms', good: true },
        ],
      },
    ],
  },
  barrier: {
    tabEn: '2. Hybrid Write Barrier Mutation',
    tabVi: '2. Write Barrier Khi App Đổi Con Trỏ',
    code: [
      '// Mid-GC: A is already BLACK, D is still WHITE.',
      '// Mutator goroutine moves D behind A while dropping B.ptr!',
      'A.Next = D     // Hybrid Write Barrier intercepts *slot = ptr!',
      'B.Next = nil   // Shades BOTH overwritten slot AND D GREY!',
      '// D is NEVER accidentally collected alive!',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'Hazard: mutator wires White object D onto already-Black A',
        titleVi: 'Nguy hiểm: code app gắn object Trắng D vào sau node Đen A giữa pha Mark!',
        noteEn: 'Without a write barrier, Black A will NOT be re-scanned—so dropping the old reference to White D would cause GC to sweep a LIVE object D!',
        noteVi: 'Nếu không có write barrier, node Đen A không được quét lại nữa — khi app cắt dây cũ tới D và nối sang A, D vẫn mang màu Trắng và sẽ bị xóa nhầm dù đang sống!',
        nodes: [
          { id: 'A (Black)', label: 'A (already Black!)', color: 'black' },
          { id: 'B (Grey)', label: 'B (had D)', color: 'grey' },
          { id: 'D (White)', label: 'D (reachable ONLY via A now)', color: 'white' },
        ],
        stats: [
          { labelEn: 'Invariant hazard', labelVi: 'Lỗi nguy hiểm', val: 'Black pointing to White!', bad: true },
          { labelEn: 'Without barrier', labelVi: 'Nếu thiếu barrier', val: 'D deleted alive (corruption)', bad: true },
          { labelEn: 'Write target', labelVi: 'Lệnh đang chạy', val: 'A.Next = D' },
        ],
      },
      {
        codeLine: 2,
        titleEn: 'Go Hybrid Write Barrier shades D Grey before assignment',
        titleVi: 'Hybrid Write Barrier tự động tô Xám D ngay khoảnh khắc gán A.Next = D',
        noteEn: 'Before overwriting pointer slot *A.Next = D, compiler-injected barrier instructions mark D (and any overwritten pointer) Grey, guaranteeing D gets scanned before Mark Termination!',
        noteVi: 'Ngay trong câu lệnh gán con trỏ trên Heap, write barrier tô Xám cả con trỏ mới (D) lẫn con trỏ bị ghi đè — đảm bảo GC quét qua D 100% an toàn trước khi kết thúc!',
        nodes: [
          { id: 'A (Black)', label: 'A (Black)', color: 'black' },
          { id: 'B (Grey)', label: 'B (nil)', color: 'black' },
          { id: 'D (Grey!)', label: 'D (Barrier -> Grey -> Black!)', color: 'grey' },
        ],
        stats: [
          { labelEn: 'Write barrier cost', labelVi: 'Chi phí Write Barrier', val: 'Only ON during Mark' },
          { labelEn: 'Stack writes?', labelVi: 'Ghi trên Stack?', val: 'NO barrier needed!', good: true },
          { labelEn: 'Live object D', labelVi: 'Trạng thái object D', val: 'Preserved safely', good: true },
        ],
      },
    ],
  },
  pacer: {
    tabEn: '3. GOGC vs GOMEMLIMIT Thrashing',
    tabVi: '3. GOGC vs Trần Mềm GOMEMLIMIT',
    code: [
      '// Default GOGC=100: Goal = Live + Live * 100% = 2x Live',
      'debug.SetMemoryLimit(512 << 20) // Soft cap 512 MiB in K8s pod',
      '// Case A: Live=120 MiB -> GC runs cleanly around 240 MiB (low CPU)',
      '// Case B: Live=490 MiB -> tiny 22 MiB headroom -> GC spins non-stop!',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Healthy headroom: Live 120 MiB vs GOMEMLIMIT 512 MiB',
        titleVi: 'Khoảng thở rộng: Live Heap 120 MiB vs GOMEMLIMIT 512 MiB',
        noteEn: 'With 120 MiB live data, GOGC=100 schedules GC around 240 MiB (well below 512 MiB). Background GC uses <2% CPU and handles bursts smoothly without hitting Kubernetes OOMKill.',
        noteVi: 'Khi dữ liệu sống 120 MiB, GOGC=100 dời lần quét tới mốc 240 MiB — rộng rãi dưới trần 512 MiB. CPU tốn cho GC dưới 2% và an toàn trước OOMKill.',
        nodes: [
          { id: 'Live Data', label: '120 MiB Live', color: 'black' },
          { id: 'GC Headroom', label: '240 MiB Goal (Healthy)', color: 'grey' },
          { id: 'Pod Limit', label: '512 MiB Limit', color: 'white' },
        ],
        stats: [
          { labelEn: 'Heap goal', labelVi: 'Mục tiêu chu kỳ GC', val: '240 MiB (<= 512)', good: true },
          { labelEn: 'GC CPU overhead', labelVi: 'CPU tiêu tốn cho GC', val: '~1–3%', good: true },
          { labelEn: 'Burst protection', labelVi: 'Chống OOM khi spike', val: 'Active', good: true },
        ],
      },
      {
        codeLine: 3,
        titleEn: 'Thrashing danger: Live 490 MiB hugs 512 MiB soft cap',
        titleVi: 'Nguy hiểm Death Spiral: Live 490 MiB bám sát trần 512 MiB!',
        noteEn: 'Because GOMEMLIMIT is a SOFT limit (Go prefers slower CPU over crashing OOM), leaving only 22 MiB headroom triggers continuous back-to-back GC cycles eating 40–60% CPU—capped only by Go runtime 50% CPU limit!',
        noteVi: 'Vì GOMEMLIMIT là trần MỀM, chỉ còn 22 MiB trống khiến GC phải chạy liên hoàn hết công suất (Go kìm tối đa 50% CPU nhưng p99 nát vụn) rồi vẫn chết OOM nếu Heap thật tiếp tục tăng!',
        nodes: [
          { id: 'Live Data', label: '490 MiB Live Cache!', color: 'black' },
          { id: 'Tiny Headroom', label: '22 MiB Headroom -> Thrash!', color: 'grey' },
          { id: 'Pod Limit', label: '512 MiB Cap Hit!', color: 'white' },
        ],
        stats: [
          { labelEn: 'Headroom left', labelVi: 'Khoảng trống còn lại', val: '22 MiB (4.3%)', bad: true },
          { labelEn: 'GC CPU burn', labelVi: 'Tải CPU dọn rác', val: 'Hits ~50% GC ceiling!', bad: true },
          { labelEn: 'True fix', labelVi: 'Giải pháp đúng', val: 'Cut live RAM / raise pod limit' },
        ],
      },
    ],
  },
};

export default function GoTricolorGcDemo() {
  const [mode, setMode] = useState<ScenarioId>('sweepcycle');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gtgc">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>GC Phase</span>
            <span data-lang-vi>Pha GC</span>
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

      <div className="gtgc-grid">
        <div className="gtgc-pane">
          <div className="gtgc-hdr">
            <span data-lang-en>Runtime Execution Trace</span>
            <span data-lang-vi>Diễn biến tầng Runtime</span>
          </div>
          <div className="gtgc-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`gtgc-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gtgc-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gtgc-pane">
          <div className="gtgc-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="gtgc-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="gtgc-nodes">
              {st.nodes.map((n, idx) => (
                <div key={idx} className={`gtgc-node is-${n.color}`}>
                  <span>{n.id}</span>
                  <b>{n.label}</b>
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
