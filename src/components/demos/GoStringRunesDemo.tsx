import React, { useState } from 'react';

type ScenarioId = 'bytes' | 'badslice' | 'range' | 'runeslice';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  highlightBytes: number[];
  brokenBytes?: number[];
  runeFocus?: number;
  stats: [
    { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean },
    { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean },
    { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean },
  ];
}

const BYTES = [
  { idx: 0, hex: '50', rune: 'P', group: 0 },
  { idx: 1, hex: '68', rune: 'h', group: 1 },
  { idx: 2, hex: 'e1', rune: 'ở (1/3)', group: 2 },
  { idx: 3, hex: 'bb', rune: 'ở (2/3)', group: 2 },
  { idx: 4, hex: '9f', rune: 'ở (3/3)', group: 2 },
  { idx: 5, hex: '20', rune: 'space', group: 3 },
  { idx: 6, hex: 'f0', rune: '🍜 (1/4)', group: 4 },
  { idx: 7, hex: '9f', rune: '🍜 (2/4)', group: 4 },
  { idx: 8, hex: '8d', rune: '🍜 (3/4)', group: 4 },
  { idx: 9, hex: '9c', rune: '🍜 (4/4)', group: 4 },
];

const SCENARIOS: Record<
  ScenarioId,
  { tabEn: string; tabVi: string; code: string[]; steps: StepSpec[] }
> = {
  bytes: {
    tabEn: 's[i] & len(s)',
    tabVi: 'Độ dài byte s[i]',
    code: [
      's := "Phở 🍜"',
      'nBytes := len(s)              // counts raw UTF-8 bytes',
      'b0 := s[0]                    // 0x50 (\'P\')',
      'b2 := s[2]                    // 0xe1 (head byte only!)',
      'nRunes := utf8.RuneCountInString(s)',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'stringStruct{str, len} allocated in .rodata',
        titleVi: 'Header stringStruct{str, len} trỏ tới mảng 10 byte .rodata',
        noteEn: 'A Go string is a 16-byte header {ptr, len}. "Phở 🍜" has 5 visible characters but occupies 10 UTF-8 bytes in read-only memory.',
        noteVi: 'Kiểu string trong Go chỉ là header 16 byte {ptr, len}. Chuỗi "Phở 🍜" nhìn có 5 ký tự nhưng chiếm đúng 10 byte UTF-8 trong vùng nhớ chỉ đọc.',
        highlightBytes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        stats: [
          { labelEn: 'Header size', labelVi: 'Kích thước header', val: '16 B (ptr + len)' },
          { labelEn: 'len(s)', labelVi: 'len(s) trả về', val: '10 bytes' },
          { labelEn: 'Visible chars', labelVi: 'Số ký tự thật', val: '5 runes' },
        ],
      },
      {
        codeLine: 2,
        titleEn: 's[0] indexes byte #0 (ASCII 1-byte rune)',
        titleVi: 's[0] lấy đúng 1 byte đầu tiên (ASCII)',
        noteEn: 'ASCII characters fit in 1 byte (0x00..0x7f). Here s[0] returns uint8 0x50 (\'P\'), so byte indexing happens to match the first character.',
        noteVi: 'Ký tự ASCII chỉ tốn 1 byte. Ở vị trí đầu, s[0] trả về byte 0x50 (\'P\') nên trùng khớp tình cờ với ký tự đầu tiên.',
        highlightBytes: [0],
        stats: [
          { labelEn: 's[0] type', labelVi: 'Kiểu của s[0]', val: 'byte (uint8)' },
          { labelEn: 'Hex value', labelVi: 'Giá trị hex', val: '0x50 (\'P\')', good: true },
          { labelEn: 'O(1) lookup?', labelVi: 'Độ phức tạp', val: 'O(1) offset' },
        ],
      },
      {
        codeLine: 3,
        titleEn: 's[2] reads ONLY byte 1/3 of \'ở\' -> broken!',
        titleVi: 's[2] chỉ bốc 1/3 mảnh của chữ \'ở\'',
        noteEn: 'Vietnamese \'ở\' takes 3 UTF-8 bytes [e1 bb 9f]. s[2] gives 0xe1—just the lead byte, not a readable rune!',
        noteVi: 'Chữ \'ở\' trong tiếng Việt tốn 3 byte UTF-8 [e1 bb 9f]. Lấy s[2] chỉ ra mỗi byte đầu 0xe1, hoàn toàn vô nghĩa nếu đứng một mình.',
        highlightBytes: [3, 4],
        brokenBytes: [2],
        stats: [
          { labelEn: 's[2] value', labelVi: 'Giá trị s[2]', val: '0xe1 (fragment)', bad: true },
          { labelEn: '\'ở\' byte span', labelVi: 'Vùng của \'ở\'', val: 'bytes [2..4]' },
          { labelEn: 'Rune count', labelVi: 'Đếm ký tự chuẩn', val: '5 (RuneCount)', good: true },
        ],
      },
    ],
  },
  badslice: {
    tabEn: 'Bug: s[:4] truncation',
    tabVi: 'Lỗi: Cắt nhầm s[:4]',
    code: [
      's := "Phở 🍜"',
      'preview := s[0:4] // BUG: cuts byte #4 (0x9f) off \'ở\'!',
      'safeIdx := 0',
      'for i := range s { /* snap to valid rune boundary */ }',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'Naive preview limit: take first 4 bytes',
        titleVi: 'Cắt chuỗi hiển thị preview lấy 4 byte đầu s[0:4]',
        noteEn: 'Because s[i:j] slices by BYTE offset with zero UTF-8 validation, it shares the backing bytes but splits right inside byte [2..4].',
        noteVi: 'Toán tử s[i:j] cắt theo chỉ số BYTE và không hề kiểm tra ranh giới UTF-8. Nó chia sẻ vùng nhớ gốc nhưng cắt đôi đúng ký tự \'ở\'.',
        highlightBytes: [0, 1],
        brokenBytes: [2, 3],
        stats: [
          { labelEn: 's[0:4] result', labelVi: 'Kết quả s[0:4]', val: '"Ph\\xe1\\xbb"', bad: true },
          { labelEn: 'UI renders', labelVi: 'Hiển thị thực tế', val: '"Ph" (broken)', bad: true },
          { labelEn: 'Allocations', labelVi: 'Cấp phát mới', val: '0 B/op (shared)' },
        ],
      },
      {
        codeLine: 3,
        titleEn: 'Fix: step along rune boundaries, slice by byte index',
        titleVi: 'Cách sửa: tìm ranh giới rune rồi cắt theo byte offset',
        noteEn: 'Stopping at byte offset 5 keeps "Phở" intact without allocating a []rune slice: valid UTF-8, zero heap copies.',
        noteVi: 'Chốt vị trí sau byte 4 (offset 5) giữ nguyên vẹn "Phở" mà không cần copy sang []rune: vừa chuẩn UTF-8 vừa 0 cấp phát Heap.',
        highlightBytes: [0, 1, 2, 3, 4],
        stats: [
          { labelEn: 'Clean slice', labelVi: 'Cắt đúng biên', val: 's[0:5] -> "Phở"', good: true },
          { labelEn: 'Heap alloc', labelVi: 'Cấp phát Heap', val: '0 B/op', good: true },
          { labelEn: 'Valid UTF-8?', labelVi: 'Chuẩn UTF-8?', val: 'utf8.Valid == true', good: true },
        ],
      },
    ],
  },
  range: {
    tabEn: 'for i, r := range s',
    tabVi: 'Duyệt for range s',
    code: [
      's := "Phở 🍜"',
      'for i, r := range s {',
      '    // i jumps: 0 -> 1 -> 2 -> 5 -> 6!',
      '    // r is decoded int32 (rune)',
      '}',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Iteration 1-2: ASCII fast path (1 byte each)',
        titleVi: 'Bước lặp 1-2: Nhánh nhanh ASCII (mỗi ký tự +1 byte)',
        noteEn: 'runtime.decoderune skips multi-byte work when b < 0x80: i=0 yields r=\'P\'; i=1 yields r=\'h\'.',
        noteVi: 'Khi byte < 0x80, runtime lấy thẳng ASCII: i=0 cho r=\'P\', rồi i=1 cho r=\'h\'.',
        highlightBytes: [0, 1],
        stats: [
          { labelEn: 'Offset i', labelVi: 'Vị trí byte i', val: '0 -> 1' },
          { labelEn: 'Rune r (int32)', labelVi: 'Ký tự rune r', val: '\'P\', \'h\'', good: true },
          { labelEn: 'Fast path?', labelVi: 'Nhánh tối ưu', val: '1-byte ASCII', good: true },
        ],
      },
      {
        codeLine: 2,
        titleEn: 'Iteration 3: Decodes 3 bytes -> i=2, r=\'ở\'',
        titleVi: 'Bước lặp 3: Giải mã 3 byte liền -> i=2, r=\'ở\'',
        noteEn: 'Lead byte 0xe1 signals a 3-byte sequence [e1 bb 9f] (U+1EDF). Next loop index skips i=3,4 straight to i=5!',
        noteVi: 'Byte đầu 0xe1 báo hiệu cụm 3 byte [e1 bb 9f] (U+1EDF). Xong bước này i nhảy vọt qua 3,4 tới thẳng i=5!',
        highlightBytes: [2, 3, 4],
        stats: [
          { labelEn: 'Offset i', labelVi: 'Vị trí byte i', val: '2 (jumps +3)' },
          { labelEn: 'Decoded rune', labelVi: 'Ký tự giải mã', val: '\'ở\' (U+1EDF)', good: true },
          { labelEn: 'Next byte idx', labelVi: 'Offset kế tiếp', val: '5 (0x20 space)' },
        ],
      },
      {
        codeLine: 2,
        titleEn: 'Iteration 5: Decodes 4-byte emoji -> i=6, r=\'🍜\'',
        titleVi: 'Bước lặp 5: Giải mã 4 byte emoji -> i=6, r=\'🍜\'',
        noteEn: 'Lead byte 0xf0 marks a 4-byte sequence [f0 9f 8d 9c] (U+1F35C). Zero heap allocation needed to iterate all 5 runes.',
        noteVi: 'Byte đầu 0xf0 báo cụm 4 byte [f0 9f 8d 9c] (U+1F35C). Toàn bộ vòng range duyệt 5 rune tốn 0 byte cấp phát trên Heap.',
        highlightBytes: [6, 7, 8, 9],
        stats: [
          { labelEn: 'Offset i', labelVi: 'Vị trí byte i', val: '6 (4 bytes)' },
          { labelEn: 'Decoded rune', labelVi: 'Ký tự giải mã', val: '\'🍜\' (U+1F35C)', good: true },
          { labelEn: 'Heap alloc', labelVi: 'Cấp phát Heap', val: '0 allocs/op', good: true },
        ],
      },
    ],
  },
  runeslice: {
    tabEn: '[]rune(s) conversion',
    tabVi: 'Ép kiểu []rune(s)',
    code: [
      's := "Phở 🍜"         // 10 UTF-8 bytes in .rodata',
      'rs := []rune(s)       // allocates [5]int32 (20 bytes)',
      'rs[2] = \'o\'           // O(1) random rune edit',
      'out := string(rs)     // copies + re-encodes UTF-8',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: '[]rune(s) decodes & allocates 5 x 4-byte slots',
        titleVi: '[]rune(s) giải mã toàn bộ sang mảng 5 phần tử int32 (20 byte)',
        noteEn: 'Every character expands to a fixed 4-byte int32 (UTF-32 code point) so rs[k] becomes O(1) random access—at the cost of memory & allocation.',
        noteVi: 'Mỗi ký tự đều giãn thành 4 byte cố định int32 để rs[k] truy cập ngẫu nhiên O(1), đánh đổi bằng tốn RAM gấp đôi và tốn 1 lần cấp phát.',
        highlightBytes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        stats: [
          { labelEn: 'Backing storage', labelVi: 'Bộ nhớ mới', val: '5 x 4B = 20 B' },
          { labelEn: 'Random rs[k]', labelVi: 'Truy cập rs[k]', val: 'O(1) safe', good: true },
          { labelEn: 'Cost vs range', labelVi: 'Chi phí so range', val: '+1 alloc/copy', bad: true },
        ],
      },
      {
        codeLine: 3,
        titleEn: 'string(rs) re-encodes mutable runes back to UTF-8',
        titleVi: 'string(rs) nén ngược []int32 về chuỗi UTF-8 bất biến mới',
        noteEn: 'Strings in Go are immutable. Converting back writes a fresh UTF-8 byte sequence ("Pho 🍜", 8 bytes) so s remains untouched.',
        noteVi: 'String Go luôn bất biến. Chuyển ngược lại tạo vùng UTF-8 mới ("Pho 🍜", 8 byte) nên biến s ban đầu hoàn toàn không đổi.',
        highlightBytes: [0, 1, 2, 3, 4],
        stats: [
          { labelEn: 'Original s', labelVi: 'Biến s gốc', val: '"Phở 🍜" intact', good: true },
          { labelEn: 'New string out', labelVi: 'Chuỗi out mới', val: '"Pho 🍜" (8 B)' },
          { labelEn: 'When to use []rune', labelVi: 'Khi nào dùng []rune', val: 'Only for index edits' },
        ],
      },
    ],
  },
};

export default function GoStringRunesDemo() {
  const [mode, setMode] = useState<ScenarioId>('bytes');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gsrun">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Scenario</span>
            <span data-lang-vi>Tình huống</span>
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

      <div className="gsrun-grid">
        <div className="gsrun-pane">
          <div className="gsrun-hdr">
            <span data-lang-en>Go Source Trace</span>
            <span data-lang-vi>Theo dõi dòng code Go</span>
          </div>
          <div className="gsrun-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`gsrun-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gsrun-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gsrun-pane">
          <div className="gsrun-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="gsrun-note">
            <span data-lang-en>{st.noteEn}</span>
            <span data-lang-vi>{st.noteVi}</span>
          </div>
        </div>
      </div>

      <div className="gsrun-mem">
        <div className="gsrun-mem-title">
          <span data-lang-en>Backing UTF-8 byte array in memory (len = 10 bytes, 5 Unicode runes)</span>
          <span data-lang-vi>Mảng 10 byte UTF-8 thật trong RAM (len = 10 byte, 5 ký tự Unicode)</span>
        </div>
        <div className="gsrun-bytes">
          {BYTES.map((b) => {
            const isBroken = st.brokenBytes?.includes(b.idx);
            const isHit = st.highlightBytes.includes(b.idx);
            const cls = isBroken ? 'is-bad' : isHit ? 'is-ok' : '';
            return (
              <div key={b.idx} className={`gsrun-cell ${cls}`}>
                <span className="gsrun-idx">[{b.idx}]</span>
                <b className="gsrun-hex">0x{b.hex}</b>
                <span className="gsrun-ch">{b.rune}</span>
              </div>
            );
          })}
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
