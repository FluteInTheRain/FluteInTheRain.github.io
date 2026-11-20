import React, { useState } from 'react';

type ModeId = 'value' | 'pointer' | 'defer';

interface StepItem {
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
  ModeId,
  {
    tabEn: string;
    tabVi: string;
    code: string[];
    steps: StepItem[];
  }
> = {
  value: {
    tabEn: 'Pass-by-Value (Copy)',
    tabVi: 'Truyền tham trị (Copy)',
    code: [
      'func bumpByValue(v int) {',
      '    v += 50 // modifies copy at 0x..a0c0',
      '}',
      'func main() {',
      '    x := 10 // lives at 0x..a088',
      '    bumpByValue(x)',
      '    fmt.Println(x) // still 10!',
      '}',
    ],
    steps: [
      {
        codeLine: 4,
        titleEn: 'Allocate x in main stack frame',
        titleVi: 'Khởi tạo biến x trên Stack của main',
        statA: { labelEn: 'main x (0x..a088)', labelVi: 'Biến x gốc', val: '10' },
        statB: { labelEn: 'Callee v', labelVi: 'Tham số v', val: '(not called)' },
        statC: { labelEn: 'Aliases shared?', labelVi: 'Dùng chung địa chỉ?', val: 'No' },
        noteEn: 'Go zero-initializes memory and stores 10 at address 0x..a088 inside main.',
        noteVi: 'Biến x được cấp trên Stack của main với giá trị 10 tại địa chỉ 0x..a088.',
      },
      {
        codeLine: 1,
        titleEn: 'Call bumpByValue(x): separate copy created',
        titleVi: 'Gọi bumpByValue(x): nhân bản sang ô nhớ khác',
        statA: { labelEn: 'main x (0x..a088)', labelVi: 'Biến x gốc', val: '10', good: true },
        statB: { labelEn: 'callee v (0x..a0c0)', labelVi: 'Bản sao v', val: '10 → 60', bad: true },
        statC: { labelEn: 'Aliases shared?', labelVi: 'Cùng địa chỉ?', val: 'No (copied)' },
        noteEn: 'v receives a bitwise copy of 10 at a fresh address 0x..a0c0. Adding 50 updates v only.',
        noteVi: 'Tham số v nhận bản copy số 10 tại địa chỉ mới 0x..a0c0, nên v += 50 không đụng vào x.',
      },
      {
        codeLine: 6,
        titleEn: 'Return to main: x stays 10',
        titleVi: 'Thoát hàm: biến x ban đầu giữ nguyên 10',
        statA: { labelEn: 'Printed x', labelVi: 'Kết quả in x', val: '10' },
        statB: { labelEn: 'Callee frame', labelVi: 'Stack frame con', val: 'Popped' },
        statC: { labelEn: 'Surprise for beginners?', labelVi: 'Kết luận', val: 'Immutable copy', good: true },
        noteEn: 'Value copies protect caller state automatically—and make small structs safe against accidental mutation.',
        noteVi: 'Truyền tham trị giúp bảo vệ biến gốc khỏi bị hàm con vô tình làm thay đổi ngoài ý muốn.',
      },
    ],
  },
  pointer: {
    tabEn: 'Pass Pointer (&x / *p)',
    tabVi: 'Truyền con trỏ (&x / *p)',
    code: [
      'func bumpByPtr(p *int) {',
      '    if p == nil { return }',
      '    *p += 50 // dereferences 0x..a088',
      '}',
      'func main() {',
      '    x := 10 // lives at 0x..a088',
      '    bumpByPtr(&x)',
      '    fmt.Println(x) // prints 60!',
      '}',
    ],
    steps: [
      {
        codeLine: 6,
        titleEn: 'Take address &x -> 0x..a088',
        titleVi: 'Lấy địa chỉ &x -> truyền 0x..a088 vào hàm',
        statA: { labelEn: 'main x (0x..a088)', labelVi: 'Biến x gốc', val: '10' },
        statB: { labelEn: 'p (*int value)', labelVi: 'Giá trị con trỏ p', val: '0x..a088' },
        statC: { labelEn: 'Copy size', labelVi: 'Lượng copy', val: '8 bytes (addr)', good: true },
        noteEn: '&x yields a pointer storing the memory address of x. Go still copies that 8-byte address into p.',
        noteVi: '&x lấy địa chỉ ô nhớ của x. Go copy đúng địa chỉ 8-byte này vào biến p ở hàm con.',
      },
      {
        codeLine: 2,
        titleEn: 'Nil guard passes & *p mutates caller x',
        titleVi: 'Kiểm tra p != nil rồi *p sửa thẳng ô nhớ x',
        statA: { labelEn: 'main x (0x..a088)', labelVi: 'Biến x gốc', val: '10 → 60', good: true },
        statB: { labelEn: 'Target of *p', labelVi: 'Ô nhớ *p trỏ tới', val: '60', good: true },
        statC: { labelEn: 'Pointer math (p++)?', labelVi: 'Cộng trừ p++?', val: 'Forbidden by compiler' },
        noteEn: 'Dereferencing *p follows 0x..a088 straight back to main x and adds 50 in place—without unsafe C arithmetic.',
        noteVi: 'Toán tử *p đi theo đúng địa chỉ 0x..a088 về main để cộng thêm 50 vào biến x gốc.',
      },
      {
        codeLine: 7,
        titleEn: 'Caller observes updated value 60',
        titleVi: 'main đọc lại được giá trị mới 60',
        statA: { labelEn: 'Printed x', labelVi: 'Kết quả in x', val: '60', good: true },
        statB: { labelEn: 'Zero-value risk', labelVi: 'Bẫy hay quên', val: 'Nil deref panic', bad: true },
        statC: { labelEn: 'Use when', labelVi: 'Khi nào nên dùng', val: 'Mutate / big struct' },
        noteEn: 'Verified in Go 1.27 TestFund1Basics: pass-by-value=10, pass-by-pointer=60.',
        noteVi: 'Khớp đúng output chạy thực tế trên Go 1.27: pass-by-value=10, pass-by-pointer=60.',
      },
    ],
  },
  defer: {
    tabEn: 'LIFO defer Stack',
    tabVi: 'Ngăn xếp dọn dẹp defer',
    code: [
      'func runCleanup() (order []int) {',
      '    defer func() { order = append(order, 1) }()',
      '    defer func() { order = append(order, 2) }()',
      '    defer func() { order = append(order, 3) }()',
      '    return order // triggers LIFO pop!',
      '}',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Push defer #1, #2, #3 onto stack',
        titleVi: 'Xếp lần lượt 3 lệnh defer vào ngăn xếp',
        statA: { labelEn: 'Defer stack top→bot', labelVi: 'Đỉnh → Đáy Stack', val: '[#3, #2, #1]' },
        statB: { labelEn: 'order slice now', labelVi: 'Giá trị order hiện tại', val: '[] (empty)' },
        statC: { labelEn: 'Body executed yet?', labelVi: 'Đã chạy thân hàm?', val: 'Not yet' },
        noteEn: 'Go records each defer closure in LIFO order as execution reaches each statement—nothing runs yet.',
        noteVi: 'Mỗi dòng defer mới chỉ đăng ký hàm dọn dẹp vào ngăn xếp LIFO (vào sau ra trước), chưa chạy vội.',
      },
      {
        codeLine: 3,
        titleEn: 'All 3 defers queued cleanly',
        titleVi: 'Đã chốt xong 3 lớp defer bảo vệ tài nguyên',
        statA: { labelEn: 'Stack depth', labelVi: 'Số lớp defer', val: '3 closures' },
        statB: { labelEn: 'Arg evaluation', labelVi: 'Thời điểm tính tham số', val: 'At defer line' },
        statC: { labelEn: 'Runs even on panic?', labelVi: 'Chạy cả khi lỗi?', val: 'Yes', good: true },
        noteEn: 'Remember: any arguments passed to a deferred call are evaluated immediately at the defer line, not at return.',
        noteVi: 'Mẹo nhớ: tham số truyền cho hàm defer được chốt trị ngay tại dòng khai báo defer, không đợi tới lúc return.',
      },
      {
        codeLine: 4,
        titleEn: 'Return pops LIFO -> [3, 2, 1]',
        titleVi: 'Thoát hàm: Stack bung ngược [3, 2, 1]',
        statA: { labelEn: 'Final order slice', labelVi: 'Thứ tự chạy thực tế', val: '[3, 2, 1]', good: true },
        statB: { labelEn: 'Real-world match', labelVi: 'Ứng dụng thực tế', val: 'Close DB after Rows', good: true },
        statC: { labelEn: 'Panic-safe?', labelVi: 'Chống rò tài nguyên', val: 'Guaranteed', good: true },
        noteEn: 'LIFO order ensures inner resources (like sql.Rows) close cleanly before outer connections (db.Close).',
        noteVi: 'Thứ tự LIFO đảm bảo đóng resource bên trong (như file/rows) xong rồi mới đóng kết nối bao ngoài.',
      },
    ],
  },
};

export default function GoFundPassByValueDemo() {
  const [mode, setMode] = useState<ModeId>('value');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gfnd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Concept</span>
            <span data-lang-vi>Cơ chế</span>
          </span>
          {(Object.keys(SCENARIOS) as ModeId[]).map((id) => (
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

      <div className="gfnd-grid">
        <div className="gfnd-pane">
          <div className="gfnd-hdr">
            <span data-lang-en>Go Source Execution</span>
            <span data-lang-vi>Chạy từng dòng code Go</span>
          </div>
          <div className="gfnd-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`gfnd-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gfnd-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gfnd-pane">
          <div className="gfnd-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="gfnd-note">
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
