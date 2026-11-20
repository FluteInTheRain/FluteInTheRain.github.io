import React, { useState } from 'react';

type ScenarioId = 'normalReuse' | 'gcVictim' | 'leakBug';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  localPrivate: string;
  localShared: string;
  victim: string;
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
  normalReuse: {
    tabEn: '1. Lock-free P private & shared deque',
    tabVi: '1. Khe private không Lock & shared deque',
    code: [
      'buf := pool.Get().(*bytes.Buffer) // 0 locks on hit',
      'buf.Reset()                        // wipe stale len',
      'buf.Write(payload)',
      'if buf.Cap() <= 64<<10 {           // reject >64KiB',
      '    pool.Put(buf)                  // -> P.private',
      '}',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'pool.Get() hits P0.private slot with ZERO atomic CAS or mutex',
        titleVi: 'pool.Get() bốc thẳng từ ô P0.private — tốn đúng 0 lệnh khóa Mutex/Atomic!',
        noteEn: 'Go maintains a 128-byte padded poolLocal slot per processor P (preventing CPU false sharing). Reading P.private skips locks completely; only when P.private is nil does Get pop P.shared or steal from another P.',
        noteVi: 'Mỗi CPU P có một ô `poolLocal` lót đệm 128-byte chống false sharing. Lấy từ `P.private` không tốn lấy 1 khóa nào; chỉ khi `private` trống mới đi lấy ở `shared` hoặc trộm từ `P` bên cạnh.',
        localPrivate: 'Hit -> buf#42',
        localShared: '[#18, #07]',
        victim: '(empty)',
        stats: [
          { labelEn: 'Lock overhead', labelVi: 'Chi phí khóa', val: '0 locks (P.private hit)', good: true },
          { labelEn: 'CPU cache false sharing', labelVi: 'Đụng cache giữa core', val: 'Blocked via 128B pad', good: true },
          { labelEn: 'Cap check guard', labelVi: 'Bảo vệ trần kích thước', val: 'cap <= 64 KiB', good: true },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'pool.Put(buf) refills P.private cleanly within size limit',
        titleVi: 'pool.Put(buf) đặt lại vào P.private sau khi kiểm trần cap <= 64 KiB',
        noteEn: 'Putting normal-sized buffers back keeps allocs/op at zero under steady throughput while discarding occasional 32 MB spikes prevents permanently pinning oversized backing arrays.',
        noteVi: 'Kiểm `buf.Cap() <= 64<<10` giữ kích thước ổn định 0 allocs ở tải thường, còn hễ gặp 1 request đột biến 32 MB thì bỏ không Put vào Pool để GC dọn đi.',
        localPrivate: 'Stored! [*bytes.Buffer#42, len=0]',
        localShared: '[#18, #07]',
        victim: '(empty)',
        stats: [
          { labelEn: 'Steady-state Heap', labelVi: 'Bộ nhớ Heap ổn định', val: 'Bounded & reused', good: true },
          { labelEn: 'Spike outlier pinning', labelVi: 'Giữ nhầm buffer khổng lồ', val: 'Rejected cleanly', good: true },
          { labelEn: 'Concurrent safety', labelVi: 'An toàn đa luồng', val: 'Pin/unpin per-P cleanly', good: true },
        ],
      },
    ],
  },
  gcVictim: {
    tabEn: '2. Victim Cache Across 2 GC Cycles',
    tabVi: '2. Cơ chế Victim Cache Qua 2 Chu Kỳ GC',
    code: [
      '// Cycle 1: GC runs sync.poolCleanup()',
      'pool.victim = pool.local  // demote to victim tier',
      'pool.local  = nil         // fresh local slots',
      '// Get() in lull still checks victim first',
      '// Cycle 2: idle victim wiped -> RAM freed!',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'GC #1 moves pool.local -> pool.victim (no abrupt cold-cache stampede)',
        titleVi: 'Chu kỳ GC #1 dời local sang victim (chống thắt cổ chai hụt cache ngay sau GC!)',
        noteEn: 'Before Go 1.13, every GC wiped sync.Pool cold, forcing latency spikes right after every GC. Victim caching keeps buffers alive 1 extra cycle as fallback while still letting idle pools shrink to zero on GC #2.',
        noteVi: 'Trước Go 1.13, cứ GC xong là toàn bộ sync.Pool bị xóa sạch khiến latency giật thót. Cơ chế `victim cache` giữ lại 1 nhịp dự phòng — nếu app vẫn dùng thì lấy lên tái sử dụng, còn nếu app rảnh thật thì GC #2 mới xóa hẳn!',
        localPrivate: 'nil (cleared cleanly)',
        localShared: '[]',
        victim: 'Demoted: [#42, #18, #07]',
        stats: [
          { labelEn: 'Post-GC #1 cold miss?', labelVi: 'Sập cache sau GC #1?', val: 'Protected by victim!', good: true },
          { labelEn: 'Can Get() hit victim?', labelVi: 'Get() có lấy từ victim?', val: 'Yes (fallback tier)', good: true },
          { labelEn: 'Idle spike memory held?', labelVi: 'Giam RAM khi vắng tải?', val: 'Freed cleanly on GC #2', good: true },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'GC #2 clears old victim -> stale burst RAM returns to OS',
        titleVi: 'Chu kỳ GC #2 dọn sạch victim cũ -> trả toàn bộ RAM lúc vắng tải!',
        noteEn: 'Because traffic subsided during Cycle 2 and buffers stayed untouched inside victim, GC drops them cleanly—proving why sync.Pool MUST NEVER hold DB connections or auth tokens you expect kept forever.',
        noteVi: 'Nếu tải đã giảm và không ai gọi Get() trong chu kỳ thứ hai, GC dọn sạch victim hoàn toàn — chứng minh `sync.Pool` tuyệt đối KHÔNG dùng để lưu session hay kết nối cố định.',
        localPrivate: 'nil',
        localShared: '[]',
        victim: '(swept cleanly by GC #2)',
        stats: [
          { labelEn: 'Burst RAM reclaimed', labelVi: 'RAM lúc spike đã trả?', val: '100% freed by GC #2', good: true },
          { labelEn: 'Guaranteed retention?', labelVi: 'Đảm bảo giữ mãi mãi?', val: 'NO! Dropped anytime by GC', bad: true },
          { labelEn: 'Use sync.Pool for cache?', labelVi: 'Dùng làm KV cache?', val: 'Forbidden pattern!', bad: true },
        ],
      },
    ],
  },
  leakBug: {
    tabEn: '3. Bug: Dirty Buffer Data Leak & Race',
    tabVi: '3. Bug: Rò Dữ Liệu Cũ & Race Do Quên Reset',
    code: [
      'buf := pool.Get().(*bytes.Buffer)',
      'buf.Write(tenantA_Secret) // len=48 bytes',
      'pool.Put(buf)             // BUG: no Reset()!',
      '// Tenant B calls Get() -> reads Tenant A data!',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Returning un-reset buffer exposes Tenant A bytes to Tenant B!',
        titleVi: 'Quên buf.Reset() trước/sau khi Get làm Tenant B đọc trúng payload bí mật của Tenant A!',
        noteEn: 'Putting a buffer back with non-zero length causes the next unrelated goroutine to inherit Tenant A leftovers—a devastating multi-tenant security breach caught in real services!',
        noteVi: 'Trả buffer còn nguyên dữ liệu cũ (hoặc giữ slice `b[:len]` sau khi Put) làm goroutine của khách hàng B đọc nhầm thông tin nhạy cảm từ request trước — lỗ hổng bảo mật cực nghiêm trọng!',
        localPrivate: 'DIRTY! ["token=secret-A..."]',
        localShared: 'Stale tenant slices',
        victim: '(n/a)',
        stats: [
          { labelEn: 'Security impact', labelVi: 'Hậu quả bảo mật', val: 'Cross-tenant leak!', bad: true },
          { labelEn: 'Safe defense #1', labelVi: 'Chốt chặn #1', val: 'Always Reset() before Put', good: true },
          { labelEn: 'Safe defense #2', labelVi: 'Chốt chặn #2', val: 'Copy slice out before Put', good: true },
        ],
      },
    ],
  },
};

export default function GoSyncPoolLifecycleDemo() {
  const [mode, setMode] = useState<ScenarioId>('normalReuse');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gspl">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Pool Trace</span>
            <span data-lang-vi>Luồng sync.Pool</span>
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

      <div className="gspl-grid">
        <div className="gspl-pane">
          <div className="gspl-hdr">
            <span data-lang-en>Go Source Trace</span>
            <span data-lang-vi>Chạy từng dòng code Go</span>
          </div>
          <div className="gspl-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`gspl-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gspl-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gspl-pane">
          <div className="gspl-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="gspl-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="gspl-slots">
              <div className="gspl-slot"><span>P0.private</span><b>{st.localPrivate}</b></div>
              <div className="gspl-slot"><span>P0.shared</span><b>{st.localShared}</b></div>
              <div className="gspl-slot"><span>pool.victim</span><b>{st.victim}</b></div>
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
