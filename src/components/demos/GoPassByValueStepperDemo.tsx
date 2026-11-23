import React, { useState } from 'react';

type ModeId = 'value' | 'pointer' | 'defer';

interface Cell {
  name: string;
  addr: string;
  val: string;
  changed?: boolean;
  pointer?: boolean;
}
interface Frame {
  title: string;
  cells: Cell[];
}
interface Step {
  line: number;
  frames: Frame[];
  queue?: string[];
  out: string[];
  noteEn: string;
  noteVi: string;
}
interface Scenario {
  tabEn: string;
  tabVi: string;
  code: string[];
  steps: Step[];
}

const X = '0x1000';
const V = '0x2000';

const SCENARIOS: Record<ModeId, Scenario> = {
  value: {
    tabEn: 'Pass a value',
    tabVi: 'Truyền giá trị',
    code: [
      'func bump(v int) {',
      '    v += 50',
      '}',
      'func main() {',
      '    x := 10',
      '    bump(x)',
      '    fmt.Println(x)',
      '}',
    ],
    steps: [
      {
        line: 4,
        frames: [{ title: 'main', cells: [{ name: 'x', addr: X, val: '10' }] }],
        out: [],
        noteEn: 'main creates x and stores 10 in it.',
        noteVi: 'main tạo biến x và lưu số 10 vào đó.',
      },
      {
        line: 5,
        frames: [
          { title: 'main', cells: [{ name: 'x', addr: X, val: '10' }] },
          { title: 'bump', cells: [{ name: 'v', addr: V, val: '10', changed: true }] },
        ],
        out: [],
        noteEn: 'The call copies the number 10 into a new variable v. v lives at a different address than x.',
        noteVi: 'Lời gọi hàm chép số 10 sang một biến mới tên v. v nằm ở địa chỉ khác với x.',
      },
      {
        line: 1,
        frames: [
          { title: 'main', cells: [{ name: 'x', addr: X, val: '10' }] },
          { title: 'bump', cells: [{ name: 'v', addr: V, val: '60', changed: true }] },
        ],
        out: [],
        noteEn: 'v += 50 changes the copy. x is a different box and does not move.',
        noteVi: 'v += 50 chỉ sửa bản sao. x là ô khác nên không đổi.',
      },
      {
        line: 6,
        frames: [{ title: 'main', cells: [{ name: 'x', addr: X, val: '10' }] }],
        out: ['10'],
        noteEn: 'bump returned and its frame is gone. main still has x = 10.',
        noteVi: 'bump đã thoát, frame của nó biến mất. main vẫn thấy x = 10.',
      },
    ],
  },
  pointer: {
    tabEn: 'Pass a pointer',
    tabVi: 'Truyền con trỏ',
    code: [
      'func bump(p *int) {',
      '    *p += 50',
      '}',
      'func main() {',
      '    x := 10',
      '    bump(&x)',
      '    fmt.Println(x)',
      '}',
    ],
    steps: [
      {
        line: 4,
        frames: [{ title: 'main', cells: [{ name: 'x', addr: X, val: '10' }] }],
        out: [],
        noteEn: 'Same start: x holds 10.',
        noteVi: 'Bắt đầu giống trên: x giữ số 10.',
      },
      {
        line: 5,
        frames: [
          { title: 'main', cells: [{ name: 'x', addr: X, val: '10' }] },
          { title: 'bump', cells: [{ name: 'p', addr: V, val: X + '  (address of x)', pointer: true, changed: true }] },
        ],
        out: [],
        noteEn: '&x is the address of x. The call still copies, but what it copies is the address, so p points at x.',
        noteVi: '&x là địa chỉ của x. Lời gọi vẫn chép, nhưng thứ được chép là địa chỉ, nên p trỏ vào x.',
      },
      {
        line: 1,
        frames: [
          { title: 'main', cells: [{ name: 'x', addr: X, val: '60', changed: true }] },
          { title: 'bump', cells: [{ name: 'p', addr: V, val: X + '  (address of x)', pointer: true }] },
        ],
        out: [],
        noteEn: '*p means "the box p points at". Adding 50 there changes x itself.',
        noteVi: '*p nghĩa là "ô mà p trỏ tới". Cộng 50 vào đó là sửa chính x.',
      },
      {
        line: 6,
        frames: [{ title: 'main', cells: [{ name: 'x', addr: X, val: '60' }] }],
        out: ['60'],
        noteEn: 'main sees the change. Passing a pointer is how a function gets to modify the caller\'s variable.',
        noteVi: 'main thấy giá trị mới. Truyền con trỏ là cách để hàm sửa biến của nơi gọi.',
      },
    ],
  },
  defer: {
    tabEn: 'defer captures now',
    tabVi: 'defer chốt giá trị ngay',
    code: [
      'func demo() {',
      '    x := 10',
      '    defer fmt.Println("arg:", x)',
      '    defer func() { fmt.Println("closure:", x) }()',
      '    x = 99',
      '}',
    ],
    steps: [
      {
        line: 1,
        frames: [{ title: 'demo', cells: [{ name: 'x', addr: X, val: '10' }] }],
        queue: [],
        out: [],
        noteEn: 'x holds 10. The deferred list is empty.',
        noteVi: 'x giữ 10. Danh sách defer còn trống.',
      },
      {
        line: 2,
        frames: [{ title: 'demo', cells: [{ name: 'x', addr: X, val: '10' }] }],
        queue: ['Println("arg:", 10)'],
        out: [],
        noteEn: 'defer puts the call on a list and evaluates its arguments right now. The value 10 is copied into the list entry.',
        noteVi: 'defer xếp lời gọi vào danh sách và tính luôn các tham số ngay lúc này. Số 10 được chép vào mục đó.',
      },
      {
        line: 3,
        frames: [{ title: 'demo', cells: [{ name: 'x', addr: X, val: '10' }] }],
        queue: ['Println("arg:", 10)', 'closure (reads x later)'],
        out: [],
        noteEn: 'A closure has no arguments to copy. It keeps a link to x and reads it when it finally runs.',
        noteVi: 'Closure không có tham số để chép. Nó giữ liên kết tới x và chỉ đọc x khi thực sự chạy.',
      },
      {
        line: 4,
        frames: [{ title: 'demo', cells: [{ name: 'x', addr: X, val: '99', changed: true }] }],
        queue: ['Println("arg:", 10)', 'closure (reads x later)'],
        out: [],
        noteEn: 'x changes to 99. The first entry already holds its own 10, so it does not care.',
        noteVi: 'x đổi thành 99. Mục đầu đã giữ số 10 của riêng nó nên không bị ảnh hưởng.',
      },
      {
        line: 5,
        frames: [{ title: 'demo', cells: [{ name: 'x', addr: X, val: '99' }] }],
        queue: [],
        out: ['closure: 99', 'arg: 10'],
        noteEn: 'On return the list runs last in, first out: the closure first (it reads 99), then the Println (it has 10).',
        noteVi: 'Khi hàm trả về, danh sách chạy vào sau ra trước: closure trước (đọc được 99), rồi tới Println (giữ 10).',
      },
    ],
  },
};

export default function GoPassByValueStepperDemo() {
  const [mode, setMode] = useState<ModeId>('value');
  const [idx, setIdx] = useState(0);
  const sc = SCENARIOS[mode];
  const st = sc.steps[idx];
  const last = sc.steps.length - 1;

  return (
    <div className="sd gpv">
      <div className="sd-controls">
        <div className="sd-group">
          {(Object.keys(SCENARIOS) as ModeId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={mode === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => {
                setMode(id);
                setIdx(0);
              }}
            >
              <span data-lang-en>{SCENARIOS[id].tabEn}</span>
              <span data-lang-vi>{SCENARIOS[id].tabVi}</span>
            </button>
          ))}
        </div>
        <div className="sd-group sd-run">
          <button type="button" className="sd-btn" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}>
            <span data-lang-en>Back</span>
            <span data-lang-vi>Lùi</span>
          </button>
          <button type="button" className="sd-btn is-on" disabled={idx >= last} onClick={() => setIdx((i) => Math.min(last, i + 1))}>
            <span data-lang-en>Next ({idx + 1}/{sc.steps.length})</span>
            <span data-lang-vi>Tiếp ({idx + 1}/{sc.steps.length})</span>
          </button>
        </div>
      </div>

      <div className="gpv-grid">
        <div className="gpv-pane">
          <div className="gpv-hdr">
            <span data-lang-en>Code</span>
            <span data-lang-vi>Code</span>
          </div>
          <div className="gpv-code">
            {sc.code.map((line, i) => (
              <div key={i} className={i === st.line ? 'gpv-line is-active' : 'gpv-line'}>
                <span className="gpv-ln">{i === st.line ? '▶' : i + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gpv-pane">
          <div className="gpv-hdr">
            <span data-lang-en>Memory</span>
            <span data-lang-vi>Bộ nhớ</span>
          </div>
          <div className="gpv-mem">
            {st.frames.map((f) => (
              <div key={f.title} className="gpv-frame">
                <div className="gpv-frame-title">{f.title}()</div>
                {f.cells.map((c) => (
                  <div key={c.name} className={c.changed ? 'gpv-cell is-changed' : 'gpv-cell'}>
                    <b>{c.name}</b>
                    <span className="gpv-addr">{c.addr}</span>
                    <span className="gpv-val">{c.val}</span>
                  </div>
                ))}
              </div>
            ))}
            {st.queue && (
              <div className="gpv-frame">
                <div className="gpv-frame-title">
                  <span data-lang-en>deferred list (runs bottom to top)</span>
                  <span data-lang-vi>danh sách defer (chạy từ dưới lên)</span>
                </div>
                {st.queue.length === 0 ? (
                  <div className="gpv-cell gpv-empty">
                    <span data-lang-en>empty</span>
                    <span data-lang-vi>trống</span>
                  </div>
                ) : (
                  st.queue.map((q) => (
                    <div key={q} className="gpv-cell">
                      <span className="gpv-val">{q}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="gpv-note">
        <span data-lang-en>{st.noteEn}</span>
        <span data-lang-vi>{st.noteVi}</span>
      </p>
      <div className="gpv-out">
        <span className="gpv-out-label">
          <span data-lang-en>prints</span>
          <span data-lang-vi>in ra</span>
        </span>
        <code>{st.out.length ? st.out.join('  ·  ') : '—'}</code>
      </div>
      <p className="gpv-foot">
        <span data-lang-en>Addresses are made up to keep the picture short. Real ones look like 0xc000012345.</span>
        <span data-lang-vi>Địa chỉ ở đây là số tự đặt cho gọn. Địa chỉ thật trông như 0xc000012345.</span>
      </p>
    </div>
  );
}
