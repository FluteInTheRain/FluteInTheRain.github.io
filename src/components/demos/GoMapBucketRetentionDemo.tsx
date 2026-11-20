import React, { useState } from 'react';

type ScenarioId = 'retention' | 'ptrvalue' | 'recreate';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  heapLabel: string;
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
  retention: {
    tabEn: '1. delete() Never Shrinks Map RAM',
    tabVi: '1. Xóa delete() Không Trả RAM Map',
    code: [
      'm := make(map[int][128]byte)',
      'for i := 0; i < 1_000_000; i++ { m[i] = [128]byte{} }',
      'for i := 0; i < 990_000; i++ { delete(m, i) }',
      'runtime.GC() // len=10,000, Heap STILL 288 MiB!',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Peak burst inserts 1M x 128-byte entries -> allocates 288 MiB table',
        titleVi: 'Đợt tải nhọn chèn 1 triệu key [128]byte -> phình bảng lên 288 MiB',
        noteEn: 'Inserting 1,000,000 keys expands internal map directories and slots exponentially to accommodate 87.5% load factor headroom.',
        noteVi: 'Khi chèn tới 1 triệu key, Go mở rộng liên tục mảng bucket/table để giữ mật độ tải an toàn, ngốn khoảng 288 MiB RAM.',
        heapLabel: 'Table Cap: ~1.1M slots | Live entries: 1,000,000 | RAM: ~288 MiB',
        stats: [
          { labelEn: 'len(m)', labelVi: 'Số key hiện tại', val: '1,000,000' },
          { labelEn: 'HeapInuse', labelVi: 'RAM đang giữ', val: '~288 MiB' },
          { labelEn: 'Table capacity', labelVi: 'Số ô đã cấp', val: '~2^20 slots' },
        ],
      },
      {
        codeLine: 3,
        titleEn: 'After deleting 99% & GC, map STILL locks 288 MiB!',
        titleVi: 'Xóa 99% key + chạy runtime.GC(), Map VẪN ôm cứng 288 MiB RAM!',
        noteEn: 'delete(m, i) marks control bytes / clears keys to prevent retaining stale pointers—but NEVER shrinks allocated bucket arrays down! Even with 10k remaining keys, 288 MiB stays pinned until process exit.',
        noteVi: 'Hàm delete(m, i) chỉ xóa trống ô dữ liệu chứ KHÔNG BAO GIỜ co nhỏ lại mảng bucket đã cấp! Dù len(m) chỉ còn 10.000, 288 MiB vẫn nằm lì đó không bao giờ trả cho OS.',
        heapLabel: 'Table Cap: STILL ~1.1M slots | Live: 10,000 | WASTED: ~285 MiB!',
        stats: [
          { labelEn: 'len(m) after delete', labelVi: 'len(m) sau xóa', val: '10,000 (1%)' },
          { labelEn: 'HeapInuse after GC', labelVi: 'RAM sau khi GC', val: '~288 MiB (STUCK!)', bad: true },
          { labelEn: 'Root cause', labelVi: 'Nguyên nhân', val: 'Go maps never auto-shrink', bad: true },
        ],
      },
    ],
  },
  ptrvalue: {
    tabEn: '2. Pointer Values vs Inline 128B',
    tabVi: '2. Lưu Con Trỏ *[128]byte Giảm Tồn Đọng',
    code: [
      'm := make(map[int]*[128]byte) // 8B pointers!',
      'for i := 0; i < 1_000_000; i++ { m[i] = new([128]byte) }',
      'for i := 0; i < 990_000; i++ { delete(m, i) }',
      'runtime.GC() // 128B payloads freed -> ~16 MiB!',
    ],
    steps: [
      {
        codeLine: 3,
        titleEn: 'Pointer payloads free immediately on delete; only tiny 8B slots remain',
        titleVi: 'Xóa con trỏ giúp GC giải phóng 99% cục 128B ngay, bảng chỉ giữ lỗ 8B!',
        noteEn: 'When values are pointers (*[128]byte), delete zeroes the 8-byte slot so GC collects the 128-byte payload objects cleanly. Table footprint shrinks by ~8x right away—though map cloning still frees the last empty directory bytes.',
        noteVi: 'Nhờ tách phần payload 128 byte ra qua con trỏ, khi xóa key là GC thu hồi sạch phần dữ liệu nặng ngay — chỉ còn lại khung bảng 8-byte (~16 MiB thay vì 288 MiB).',
        heapLabel: 'Dead 128B targets freed! Only pointer table (~16 MiB) stays allocated',
        stats: [
          { labelEn: 'Payload RAM reclaimed', labelVi: 'RAM dữ liệu thu hồi', val: '99% freed by GC', good: true },
          { labelEn: 'Map directory kept', labelVi: 'Khung bảng còn lại', val: '~16 MiB vs 288 MiB', good: true },
          { labelEn: 'Extra trade-off', labelVi: 'Đánh đổi nhỏ', val: '1 alloc + pointer indirection' },
        ],
      },
    ],
  },
  recreate: {
    tabEn: '3. Fix: Periodic Rebuild / Copy',
    tabVi: '3. Fix Chuẩn: Tạo Map Mới Thay Thế',
    code: [
      'func compactCache(old map[int][128]byte) map[int][128]byte {',
      '    fresh := make(map[int][128]byte, len(old))',
      '    for k, v := range old { fresh[k] = v }',
      '    return fresh // old 288 MiB table -> GC collects!',
      '}',
    ],
    steps: [
      {
        codeLine: 3,
        titleEn: 'Swapping in `fresh` drops retained RAM from 288 MiB down to ~3 MiB',
        titleVi: 'Chép sang map `fresh` vừa khít giúp RAM tụt từ 288 MiB xuống ~3 MiB!',
        noteEn: 'Long-lived in-memory caches in Go either shard/rotate maps on a timer or rebuild a fresh map whenever len drops below 25% of peak size, allowing GC + OS scavenger to return all 285 MiB.',
        noteVi: 'Các cache sống lâu trong Go (như session/rate-limit cache) thường dựng lại map mới khi tỷ lệ xóa vượt quá 50–75%, nhường chỗ cho GC và scavenger trả sạch ~285 MiB về Linux.',
        heapLabel: 'fresh Cap: 10,000 (~3 MiB) | old 288 MiB collected cleanly!',
        stats: [
          { labelEn: 'RAM after rebuild', labelVi: 'RAM sau dựng lại', val: '~3 MiB (-99%!)', good: true },
          { labelEn: 'Time for 10k copy', labelVi: 'Tốc độ chép 10k mục', val: '< 0.5 ms' },
          { labelEn: 'Production idiom', labelVi: 'Mẫu thực chiến', val: 'Sharded TTL / Ring Epoch Map', good: true },
        ],
      },
    ],
  },
};

export default function GoMapBucketRetentionDemo() {
  const [mode, setMode] = useState<ScenarioId>('retention');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gmbr">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Map Lifecycle</span>
            <span data-lang-vi>Vòng đời Map</span>
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

      <div className="gmbr-grid">
        <div className="gmbr-pane">
          <div className="gmbr-hdr">
            <span data-lang-en>Go Source Trace</span>
            <span data-lang-vi>Theo dõi dòng code Go</span>
          </div>
          <div className="gmbr-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`gmbr-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gmbr-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gmbr-pane">
          <div className="gmbr-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="gmbr-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="gmbr-heap">{st.heapLabel}</div>
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
