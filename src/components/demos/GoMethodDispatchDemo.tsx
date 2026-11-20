import React, { useState } from 'react';

type ScenarioId = 'valrecv' | 'ptrrecv' | 'methodset' | 'typednil';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  slotA: { label: string; val: string; cls?: 'ok' | 'bad' };
  slotB: { label: string; val: string; cls?: 'ok' | 'bad' };
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
  valrecv: {
    tabEn: 'Value Receiver (Lost Edit)',
    tabVi: 'Value Receiver (Mất sửa đổi)',
    code: [
      'func (a Account) Deposit(n int64) {',
      '    a.Balance += n  // edits local copy on callee stack!',
      '}',
      'acct := Account{ID: 7, Balance: 100}',
      'acct.Deposit(50)',
      'fmt.Println(acct.Balance) // still 100!',
    ],
    steps: [
      {
        codeLine: 3,
        titleEn: 'Allocate caller struct acct (40 bytes) on stack',
        titleVi: 'Khởi tạo struct acct (40 byte) trên Stack hàm main',
        slotA: { label: 'main acct (0x..a040)', val: 'ID=7 Balance=100' },
        slotB: { label: 'Deposit receiver a', val: '(not called yet)' },
        stats: [
          { labelEn: 'Struct size', labelVi: 'Kích thước struct', val: '40 bytes' },
          { labelEn: 'acct.Balance', labelVi: 'acct.Balance', val: '100' },
          { labelEn: 'Receiver type', labelVi: 'Kiểu receiver', val: 'Account (value)' },
        ],
      },
      {
        codeLine: 1,
        titleEn: 'acct.Deposit(50) copies all 40 bytes into a',
        titleVi: 'acct.Deposit(50) copy toàn bộ 40 byte sang biến a riêng',
        slotA: { label: 'main acct (0x..a040)', val: 'ID=7 Balance=100' },
        slotB: { label: 'copy a (0x..a080)', val: 'ID=7 Balance=100 -> 150', cls: 'bad' },
        stats: [
          { labelEn: 'Bytes copied', labelVi: 'Lượng copy', val: '40 bytes', bad: true },
          { labelEn: 'copy a.Balance', labelVi: 'Bản sao a.Balance', val: '150' },
          { labelEn: 'main acct.Balance', labelVi: 'Biến gốc Balance', val: 'Still 100!', bad: true },
        ],
      },
      {
        codeLine: 5,
        titleEn: 'Callee stack frame pops; edit disappears silently',
        titleVi: 'Thoát Deposit: stack frame bản sao biến mất, acct vẫn 100',
        slotA: { label: 'main acct (0x..a040)', val: 'ID=7 Balance=100', cls: 'bad' },
        slotB: { label: 'copy a (0x..a080)', val: '(frame popped)' },
        stats: [
          { labelEn: 'Printed Balance', labelVi: 'Kết quả in ra', val: '100 (bug!)', bad: true },
          { labelEn: 'Extra bug risk', labelVi: 'Bẫy kèm theo', val: 'Copies sync.Mutex!', bad: true },
          { labelEn: 'Fix', labelVi: 'Cách sửa', val: 'Use (a *Account)' },
        ],
      },
    ],
  },
  ptrrecv: {
    tabEn: 'Pointer Receiver (*Account)',
    tabVi: 'Pointer Receiver (*Account)',
    code: [
      'func (a *Account) Deposit(n int64) {',
      '    a.Balance += n  // dereferences 0x..a040!',
      '}',
      'acct := Account{ID: 7, Balance: 100}',
      'acct.Deposit(50) // compiler rewrites to (&acct).Deposit(50)',
      'fmt.Println(acct.Balance) // 150!',
    ],
    steps: [
      {
        codeLine: 4,
        titleEn: 'Compiler sugar: auto-takes (&acct) because acct is addressable',
        titleVi: 'Compiler tự lấy (&acct) vì biến cục bộ acct có địa chỉ rõ ràng',
        slotA: { label: 'main acct (0x..a040)', val: 'ID=7 Balance=100' },
        slotB: { label: 'callee a (*Account)', val: '0x..a040 (8 bytes)', cls: 'ok' },
        stats: [
          { labelEn: 'Argument copied', labelVi: 'Tham số copy', val: '8B address only', good: true },
          { labelEn: 'Addressable?', labelVi: 'Lấy địa chỉ được?', val: 'Yes (stack var)' },
          { labelEn: 'a points to', labelVi: 'a trỏ tới', val: '0x..a040' },
        ],
      },
      {
        codeLine: 1,
        titleEn: '*a dereferences directly to caller acct in place',
        titleVi: 'Ghi trực tiếp vào ô nhớ gốc 0x..a040 thông qua con trỏ a',
        slotA: { label: 'main acct (0x..a040)', val: 'ID=7 Balance=150', cls: 'ok' },
        slotB: { label: 'callee a (*Account)', val: '0x..a040 -> updated', cls: 'ok' },
        stats: [
          { labelEn: 'acct.Balance', labelVi: 'acct.Balance', val: '150', good: true },
          { labelEn: 'Extra struct copies', labelVi: 'Copy thừa', val: '0 struct copies', good: true },
          { labelEn: 'Safe with Mutex?', labelVi: 'An toàn với Mutex?', val: 'Yes (shared lock)', good: true },
        ],
      },
    ],
  },
  methodset: {
    tabEn: 'Interface Method Set & itab',
    tabVi: 'Luật Method Set & Interface itab',
    code: [
      'type Depositer interface { Deposit(int64) }',
      'var bad Depositer = Account{}   // COMPILE ERROR!',
      'var ok  Depositer = &Account{}  // builds 16B iface{tab, data}',
      'ok.Deposit(50)                  // calls tab.fun[0](data, 50)',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Why Account{} fails: interface copy has NO addressable slot!',
        titleVi: 'Vì sao Account{} báo lỗi: bản sao nhét vào interface không có địa chỉ sửa gốc',
        slotA: { label: 'T method set', labelVi: 'T', val: 'Only (a Account) methods', cls: 'bad' } as never,
        slotB: { label: 'Compiler check', val: 'Account lacks *Account set', cls: 'bad' },
        stats: [
          { labelEn: 'Account{} assigned', labelVi: 'Gán Account{}', val: 'Compile error!', bad: true },
          { labelEn: 'Reason', labelVi: 'Lý do', val: 'Mutation would vanish' },
          { labelEn: 'Fix', labelVi: 'Cách đúng', val: 'Pass &Account{}', good: true },
        ],
      },
      {
        codeLine: 3,
        titleEn: '&Account{} satisfies interface -> 16B iface{tab, data}',
        titleVi: '&Account{} khớp interface -> tạo header 16-byte iface{tab, data}',
        slotA: { label: 'iface.tab (*itab)', val: '*Account -> Deposit ptr [fun[0]]', cls: 'ok' },
        slotB: { label: 'iface.data', val: '0x..c100 (&Account)', cls: 'ok' },
        stats: [
          { labelEn: 'iface size', labelVi: 'Kích thước interface', val: '16 bytes (2 ptrs)' },
          { labelEn: 'Method dispatch', labelVi: 'Gọi hàm ok.Deposit', val: 'tab.fun[0](data, 50)', good: true },
          { labelEn: 'Compile-time safe?', labelVi: 'Kiểm tra lúc build', val: 'itab cached once', good: true },
        ],
      },
    ].map((s, idx) =>
      idx === 0
        ? {
            ...s,
            slotA: { label: 'T method set', val: 'Only value receivers (T)', cls: 'bad' as const },
          }
        : s
    ),
  },
  typednil: {
    tabEn: 'Trap: Typed-nil error != nil',
    tabVi: 'Bẫy: Typed-nil error != nil',
    code: [
      'func openFile() error {',
      '    var p *os.PathError = nil  // concrete pointer is nil',
      '    return p                   // BUG: boxes into error iface!',
      '}',
      'if err := openFile(); err != nil { /* FIRES EVEN ON SUCCESS! */ }',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Boxing (*os.PathError)(nil) fills iface.tab!',
        titleVi: 'Trả về p gắn *os.PathError vào ngăn tab của interface error!',
        slotA: { label: 'iface.tab (*itab)', val: '*os.PathError (NON-NIL!)', cls: 'bad' },
        slotB: { label: 'iface.data', val: '0x0 (nil pointer)', cls: 'ok' },
        stats: [
          { labelEn: 'p == nil', labelVi: 'Biến gốc p == nil', val: 'true' },
          { labelEn: 'err == nil', labelVi: 'Interface err == nil', val: 'FALSE! (tab != nil)', bad: true },
          { labelEn: 'Fix', labelVi: 'Cách tránh bẫy', val: 'Explicit "return nil"', good: true },
        ],
      },
      {
        codeLine: 4,
        titleEn: 'Caller checks err != nil -> false outage triggered!',
        titleVi: 'Caller kiểm tra err != nil dính True -> báo lỗi giả dù không hề lỗi!',
        slotA: { label: 'Rule for (err == nil)', val: 'BOTH tab AND data must be nil', cls: 'ok' },
        slotB: { label: 'Best practice', val: 'Always return untyped nil', cls: 'ok' },
        stats: [
          { labelEn: 'True nil error', labelVi: 'Interface nil thật', val: '{tab: nil, data: nil}', good: true },
          { labelEn: 'Typed-nil bug', labelVi: 'Interface dính bẫy', val: '{tab: *PathErr, data: nil}', bad: true },
          { labelEn: 'Verified Go 1.27', labelVi: 'Đã đo Go 1.27', val: 'err==nil -> false', bad: true },
        ],
      },
    ],
  },
};

export default function GoMethodDispatchDemo() {
  const [mode, setMode] = useState<ScenarioId>('valrecv');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[mode];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gmdsp">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Mechanism</span>
            <span data-lang-vi>Cơ chế</span>
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

      <div className="gmdsp-grid">
        <div className="gmdsp-pane">
          <div className="gmdsp-hdr">
            <span data-lang-en>Go Source Trace</span>
            <span data-lang-vi>Chạy từng dòng code Go</span>
          </div>
          <div className="gmdsp-code">
            {cur.code.map((line, i) => (
              <div key={i} className={`gmdsp-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="gmdsp-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gmdsp-pane">
          <div className="gmdsp-hdr">
            <span data-lang-en>Step {stepIdx + 1}: {st.titleEn}</span>
            <span data-lang-vi>Bước {stepIdx + 1}: {st.titleVi}</span>
          </div>
          <div className="gmdsp-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="gmdsp-slots">
              <div className={`gmdsp-slot ${st.slotA.cls ? `is-${st.slotA.cls}` : ''}`}>
                <span>{st.slotA.label}</span>
                <b>{st.slotA.val}</b>
              </div>
              <div className={`gmdsp-slot ${st.slotB.cls ? `is-${st.slotB.cls}` : ''}`}>
                <span>{st.slotB.label}</span>
                <b>{st.slotB.val}</b>
              </div>
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
