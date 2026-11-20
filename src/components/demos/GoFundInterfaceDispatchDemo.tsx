import React, { useState } from 'react';

type TopicId = 'slice' | 'map' | 'interface';

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
  TopicId,
  {
    tabEn: string;
    tabVi: string;
    code: string[];
    steps: StepData[];
  }
> = {
  slice: {
    tabEn: 'Slice cap vs Prealloc',
    tabVi: 'Slice cap & Prealloc',
    code: [
      'var s []int // nil: len=0, cap=0',
      'for i := 0; i < 10; i++ {',
      '    s = append(s, i) // doubles 1→2→4→8→16',
      '}',
      'pre := make([]int, 0, 10) // len=0, cap=10',
      'for i := 0; i < 10; i++ { pre = append(pre, i) }',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'Nil slice before append()',
        titleVi: 'Slice nil ban đầu trước khi append()',
        statA: { labelEn: 'len(s) / cap(s)', labelVi: 'len(s) / cap(s)', val: '0 / 0' },
        statB: { labelEn: 'Is s == nil?', labelVi: 's == nil?', val: 'true (safe!)' },
        statC: { labelEn: 'Allocations so far', labelVi: 'Số lần cấp phát', val: '0' },
        noteEn: 'An uninitialized Go slice is nil yet completely valid for len() and append().',
        noteVi: 'Slice nil vẫn gọi len(s) hay append() trực tiếp mà không bao giờ bị crash.',
      },
      {
        codeLine: 2,
        titleEn: 'Appending 10 elements without make()',
        titleVi: 'Đẩy 10 phần tử không đặt trước cap',
        statA: { labelEn: 'Cap growth path', labelVi: 'Đường nhảy cap', val: '1→2→4→8→16', bad: true },
        statB: { labelEn: 'Realloc + copies', labelVi: 'Số lần xin mảng mới', val: '5 heap allocs', bad: true },
        statC: { labelEn: 'Wasted spare tail', labelVi: 'Ô thừa cuối', val: '6 unused ints' },
        noteEn: 'Verified in Go 1.27 TestFund2CompositeTypes: growing from 0 to 10 items triggers 5 backing-array allocations and copies.',
        noteVi: 'Số đo Go 1.27 thực tế: thêm 10 số từ nil ép runtime phải xin lại mảng mới tới 5 lần (cap: 1→2→4→8→16).',
      },
      {
        codeLine: 4,
        titleEn: 'With make([]int, 0, 10)',
        titleVi: 'Dùng make([]int, 0, 10) cấp phát 1 lần',
        statA: { labelEn: 'len / cap after loop', labelVi: 'len / cap cuối', val: '10 / 10', good: true },
        statB: { labelEn: 'Realloc + copies', labelVi: 'Số lần cấp phát lại', val: '1 exact alloc!', good: true },
        statC: { labelEn: 'Pitfall avoided', labelVi: 'Tránh bẫy', val: 'len=0 (not 10)' },
        noteEn: 'Passing length 0 and capacity 10 allocates exact backing storage once so every append writes in place.',
        noteVi: 'Đặt len=0, cap=10 xin gọn đúng 1 mảng 10 chỗ từ đầu; vòng lặp append chạy thẳng không copy lại.',
      },
    ],
  },
  map: {
    tabEn: 'Map Comma-ok Check',
    tabVi: 'Map & Bẫy Zero Value',
    code: [
      'var broken map[string]int // nil map!',
      '// broken["k"] = 1  -> PANICS at runtime',
      'scores := map[string]int{"alice": 0}',
      'vZero, okAlice := scores["alice"]',
      'vMiss, okBob := scores["bob"]',
    ],
    steps: [
      {
        codeLine: 1,
        titleEn: 'Nil map write panics immediately',
        titleVi: 'Ghi vào nil map làm sập chương trình',
        statA: { labelEn: 'Read broken["k"]', labelVi: 'Đọc nil map', val: '0 (no panic)' },
        statB: { labelEn: 'Write broken["k"]=1', labelVi: 'Ghi nil map', val: 'PANIC!', bad: true },
        statC: { labelEn: 'Fix', labelVi: 'Cách đúng', val: 'make(map[K]V)' },
        noteEn: 'A nil map has zero hash buckets. Always initialize with make() or a map literal {} before inserting.',
        noteVi: 'Map chưa khởi tạo không có bucket nào để băm khóa vào, nên mọi lệnh gán key đều gây panic.',
      },
      {
        codeLine: 3,
        titleEn: 'Alice exists with score 0 -> okAlice=true',
        titleVi: 'Alice có trong map với điểm 0 -> ok=true',
        statA: { labelEn: 'Returned value vZero', labelVi: 'Giá trị trả về', val: '0' },
        statB: { labelEn: 'Comma-ok flag', labelVi: 'Cờ tồn tại (ok)', val: 'true', good: true },
        statC: { labelEn: 'Single map["alice"]?', labelVi: 'Nếu chỉ lấy 1 biến', val: 'Ambiguous!' },
        noteEn: 'Comma-ok separates a real zero stored under "alice" from an absent key cleanly.',
        noteVi: 'Nhờ biến ok=true bạn biết chắc Alice có điểm 0 thật trong danh sách.',
      },
      {
        codeLine: 4,
        titleEn: 'Bob missing -> vMiss=0, okBob=false',
        titleVi: 'Bob không có trong map -> ok=false',
        statA: { labelEn: 'Returned value vMiss', labelVi: 'Giá trị trả về', val: '0' },
        statB: { labelEn: 'Comma-ok flag', labelVi: 'Cờ tồn tại (ok)', val: 'false', good: true },
        statC: { labelEn: 'TestFund2 assertion', labelVi: 'Kết quả Go 1.27', val: '(0,true) vs (0,false)' },
        noteEn: 'Always check ", ok" before treating a zero numeric/string/bool map result as real data.',
        noteVi: 'Luôn kiểm tra ", ok" trước khi dùng kết quả lấy từ map nếu giá trị 0 mang ý nghĩa hợp lệ.',
      },
    ],
  },
  interface: {
    tabEn: 'Implicit Interface + Mock',
    tabVi: 'Interface & Mock Test',
    code: [
      'type Alerter interface { Send(msg string) error }',
      'type SlackAlerter struct { webhook string }',
      'func (s SlackAlerter) Send(m string) error { ... }',
      'type FakeAlerter struct { sent []string }',
      'func (f *FakeAlerter) Send(m string) error { ... }',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'Consumer declares tiny 1-method interface',
        titleVi: 'Bên dùng tự khai báo interface 1 hàm gọn nhẹ',
        statA: { labelEn: '"implements" keyword?', labelVi: 'Cần từ khóa implements?', val: 'None needed', good: true },
        statB: { labelEn: 'Method count', labelVi: 'Số method yêu cầu', val: '1 (Send)' },
        statC: { labelEn: 'Coupling to Slack pkg?', labelVi: 'Phụ thuộc gói ngoài?', val: 'Zero' },
        noteEn: 'In Go, the caller owns the narrow interface it actually calls—keeping business logic decoupled.',
        noteVi: 'Gói nghiệp vụ tự đặt interface nhỏ nó cần, không bị trói vào struct thư viện ngoài.',
      },
      {
        codeLine: 2,
        titleEn: 'SlackAlerter satisfies Alerter automatically',
        titleVi: 'SlackAlerter tự khớp Alerter lúc compile',
        statA: { labelEn: 'Compile check', labelVi: 'Kiểm tra lúc build', val: 'var _ Alerter = ...', good: true },
        statB: { labelEn: 'Runtime dispatch cost', labelVi: 'Chi phí tra itable', val: 'Zero changes in Slack' },
        statC: { labelEn: 'Production impl', labelVi: 'Bản chạy thật', val: 'SlackAlerter' },
        noteEn: 'Even third-party structs from packages you cannot edit satisfy your interfaces seamlessly.',
        noteVi: 'Ngay cả struct nằm trong thư viện bên thứ ba vẫn tự khớp được interface bạn vừa tự viết.',
      },
      {
        codeLine: 4,
        titleEn: 'Swap *FakeAlerter in unit tests cleanly',
        titleVi: 'Đổi sang *FakeAlerter để unit test không cần mạng',
        statA: { labelEn: 'Receiver type needed', labelVi: 'Loại receiver', val: '*FakeAlerter (mutates)', good: true },
        statB: { labelEn: 'Value Fake{} satisfies?', labelVi: 'Giá trị Fake{} khớp?', val: 'No (pointer method)', bad: true },
        statC: { labelEn: 'Unit test speed', labelVi: 'Tốc độ unit test', val: '< 0.1 ms offline', good: true },
        noteEn: 'Remember the receiver rule: because Send uses (*FakeAlerter), you must pass &FakeAlerter{} as the Alerter!',
        noteVi: 'Nhớ quy tắc receiver: vì Send gắn trên (*FakeAlerter), lúc truyền vào interface phải đưa con trỏ &FakeAlerter{}.',
      },
    ],
  },
};

export default function GoFundInterfaceDispatchDemo() {
  const [topic, setTopic] = useState<TopicId>('slice');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[topic];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gfnd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Pattern</span>
            <span data-lang-vi>Mẫu code</span>
          </span>
          {(Object.keys(SCENARIOS) as TopicId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={topic === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => {
                setTopic(id);
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
            <span data-lang-en>Go Type Behavior</span>
            <span data-lang-vi>Hành vi cấu trúc dữ liệu Go</span>
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
