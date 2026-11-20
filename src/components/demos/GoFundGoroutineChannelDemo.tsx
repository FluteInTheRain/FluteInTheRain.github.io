import React, { useState } from 'react';

type ScenarioId = 'errors' | 'workers' | 'timeout';

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
  ScenarioId,
  {
    tabEn: string;
    tabVi: string;
    code: string[];
    steps: StepData[];
  }
> = {
  errors: {
    tabEn: 'Wrap & Match (%w / Is)',
    tabVi: 'Bọc & Soi lỗi (%w / Is)',
    code: [
      'var ErrConfigMissing = errors.New("config missing")',
      'func loadPort() (int, error) {',
      '    return 0, fmt.Errorf("read env: %w", ErrConfigMissing)',
      '}',
      'if _, err := loadPort(); errors.Is(err, ErrConfigMissing) {',
      '    log.Warn("using default port 8080")',
      '}',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'Define sentinel ErrConfigMissing',
        titleVi: 'Khai báo sentinel ErrConfigMissing làm mốc chuẩn',
        statA: { labelEn: 'Sentinel string', labelVi: 'Chuỗi gốc', val: '"config missing"' },
        statB: { labelEn: 'Allocated once?', labelVi: 'Khởi tạo', val: 'Package global' },
        statC: { labelEn: 'Type', labelVi: 'Kiểu', val: 'error (interface)' },
        noteEn: 'Package sentinel errors provide a stable target callers can branch on reliably without fragile string matching.',
        noteVi: 'Khai báo sentinel error bằng errors.New giúp hàm gọi bắt đúng nguyên nhân thay vì so chuỗi err.Error().',
      },
      {
        codeLine: 2,
        titleEn: 'Wrap failure with context via %w',
        titleVi: 'Gói thêm ngữ cảnh bằng động từ %w',
        statA: { labelEn: 'Full err.Error()', labelVi: 'Nội dung in log', val: 'read env: config missing', good: true },
        statB: { labelEn: 'Chain preserved?', labelVi: 'Giữ mắt xích gốc?', val: 'Yes (via Unwrap)', good: true },
        statC: { labelEn: 'What if %v used?', labelVi: 'Nếu lỡ dùng %v?', val: 'Breaks errors.Is!', bad: true },
        noteEn: 'fmt.Errorf("%w", err) appends context ("read env:") while keeping ErrConfigMissing intact inside Unwrap().',
        noteVi: 'Dùng %w giữ lại liên kết với ErrConfigMissing bên trong; nếu viết nhầm %v thì chain bị đứt luôn.',
      },
      {
        codeLine: 4,
        titleEn: 'Match wrapped chain with errors.Is',
        titleVi: 'Dò chuỗi bằng errors.Is(err, ErrConfigMissing)',
        statA: { labelEn: 'Naive err == Err...', labelVi: 'So == trực tiếp', val: 'false (WRONG!)', bad: true },
        statB: { labelEn: 'errors.Is(err, ...)', labelVi: 'errors.Is(err, ...)', val: 'true (walks chain)', good: true },
        statC: { labelEn: 'TestFund3 result', labelVi: 'Kiểm chứng Go 1.27', val: 'PASS', good: true },
        noteEn: 'Because loadPort wrapped ErrConfigMissing, direct == fails, whereas errors.Is traverses Unwrap() and returns true.',
        noteVi: 'So dấu == trực tiếp sẽ ra false vì đã bị bọc thêm chuỗi "read env:", còn errors.Is dò tận gốc trả true.',
      },
    ],
  },
  workers: {
    tabEn: 'Goroutines + WaitGroup',
    tabVi: 'Goroutine + WaitGroup',
    code: [
      'jobs := make(chan int, 4); results := make(chan int, 4)',
      'for w := 0; w < 2; w++ {',
      '    wg.Add(1)',
      '    go func() { defer wg.Done(); for j := range jobs { results <- j*j } }()',
      '}',
      'for i := 1; i <= 4; i++ { jobs <- i }; close(jobs)',
      'wg.Wait(); close(results) // deterministic sum = 30',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'wg.Add(1) BEFORE spawning workers',
        titleVi: 'Gọi wg.Add(1) TRƯỚC khi tung goroutine',
        statA: { labelEn: 'Workers spawned', labelVi: 'Số worker', val: '2 (~4 KB stack)' },
        statB: { labelEn: 'Queue capacity', labelVi: 'Đệm channel jobs', val: '4 buffered ints' },
        statC: { labelEn: 'Race hazard avoided', labelVi: 'Lỗi hay gặp', val: 'Add before go!', good: true },
        noteEn: 'Always call wg.Add(1) on the caller goroutine right before go func(), ensuring wg.Wait() never passes too early.',
        noteVi: 'Tăng bộ đếm wg.Add(1) ngay trên luồng chính trước chữ go để không bị Wait() chạy lọt trước khi worker bắt đầu.',
      },
      {
        codeLine: 5,
        titleEn: 'Feed 4 jobs & close(jobs)',
        titleVi: 'Đẩy 4 việc rồi close(jobs) báo hết việc',
        statA: { labelEn: 'Items pushed', labelVi: 'Số việc gửi', val: '1, 2, 3, 4' },
        statB: { labelEn: 'Who calls close?', labelVi: 'Ai được close()?', val: 'Producer ONLY', good: true },
        statC: { labelEn: 'Worker loop exits?', labelVi: 'Vòng range tự dừng?', val: 'Yes on close', good: true },
        noteEn: 'Closing jobs allows both worker loops (`for j := range jobs`) to drain all buffered items and exit cleanly.',
        noteVi: 'Lệnh close(jobs) giúp vòng `for j := range jobs` tự động xử lý nốt đồ trong đệm rồi thoát an toàn.',
      },
      {
        codeLine: 6,
        titleEn: 'wg.Wait() then close(results) -> 30',
        titleVi: 'Chờ xong hết mới close(results) -> tổng = 30',
        statA: { labelEn: 'Sum of squares', labelVi: 'Tổng bình phương', val: '1+4+9+16 = 30', good: true },
        statB: { labelEn: 'go test -race', labelVi: 'Kiểm tra -race', val: 'PASS (0 races)', good: true },
        statC: { labelEn: 'Leaked goroutines', labelVi: 'Goroutine kẹt sót', val: '0' },
        noteEn: 'Waiting via WaitGroup before closing results prevents workers from sending onto a closed channel.',
        noteVi: 'Phải đợi wg.Wait() xong hoàn toàn rồi mới close(results) — nếu đóng sớm worker gửi tiếp sẽ panic ngay.',
      },
    ],
  },
  timeout: {
    tabEn: 'select + context Timeout',
    tabVi: 'select + context Timeout',
    code: [
      'ctx, cancel := context.WithTimeout(parent, 20*time.Millisecond)',
      'defer cancel() // always free internal timer immediately!',
      'select {',
      'case val := <-slowDBChan:',
      '    return val, nil',
      'case <-ctx.Done():',
      '    return 0, ctx.Err() // context.DeadlineExceeded',
      '}',
    ],
    steps: [
      {
        codeLine: 0,
        titleEn: 'Attach 20 ms deadline + defer cancel()',
        titleVi: 'Đặt trần thời gian 20 ms + defer cancel()',
        statA: { labelEn: 'Deadline budget', labelVi: 'Giới hạn chờ', val: '20 ms' },
        statB: { labelEn: 'Missing defer cancel?', labelVi: 'Quên defer cancel?', val: 'Leaks timer RAM!', bad: true },
        statC: { labelEn: 'Timer auto-cleans?', labelVi: 'Tự dọn timer?', val: 'Yes on return', good: true },
        noteEn: 'Deriving context.WithTimeout puts an upper bound on slow downstream queries while defer cancel() avoids timer leaks.',
        noteVi: 'Tạo ngữ cảnh có hạn giờ giúp hệ thống không chờ vô hạn, và defer cancel() dọn bộ đếm nếu hàm xong sớm.',
      },
      {
        codeLine: 3,
        titleEn: 'select multiplexes result vs ctx.Done()',
        titleVi: 'select đua song song: kết quả về hay hết giờ?',
        statA: { labelEn: 'DB latency today', labelVi: 'Độ trễ DB lúc kẹt', val: '450 ms (stalled)', bad: true },
        statB: { labelEn: 'ctx.Done() fires at', labelVi: 'ctx.Done() kích ở', val: '20.0 ms sharp', good: true },
        statC: { labelEn: 'Goroutine unblocks?', labelVi: 'Thoát khỏi chờ?', val: 'Unblocks cleanly', good: true },
        noteEn: 'At 20 ms, Go runtime closes ctx.Done() and select wakes the waiting goroutine cleanly instead of hanging.',
        noteVi: 'Đúng mốc 20 ms, Go runtime đóng channel ctx.Done(), nhánh select đánh thức goroutine thoát ra gọn gàng.',
      },
      {
        codeLine: 6,
        titleEn: 'Return context.DeadlineExceeded',
        titleVi: 'Trả ngay lỗi chuẩn context.DeadlineExceeded',
        statA: { labelEn: 'Returned err', labelVi: 'Giá trị ctx.Err()', val: 'DeadlineExceeded' },
        statB: { labelEn: 'Downstream cascade', labelVi: 'Nghẽn dây chuyền?', val: 'Stopped early', good: true },
        statC: { labelEn: 'Wait latency saved', labelVi: 'Tiết kiệm chờ', val: '430 ms saved', good: true },
        noteEn: 'Propagating ctx down HTTP/SQL calls stops wasted work across the whole request tree cleanly.',
        noteVi: 'Truyền ctx xuyên suốt xuống DB/HTTP client giúp cắt ngang công việc thừa ngay khi user đã hết kiên nhẫn.',
      },
    ],
  },
};

export default function GoFundGoroutineChannelDemo() {
  const [scenario, setScenario] = useState<ScenarioId>('errors');
  const [stepIdx, setStepIdx] = useState(0);

  const cur = SCENARIOS[scenario];
  const st = cur.steps[stepIdx];

  return (
    <div className="sd gfnd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Mechanism</span>
            <span data-lang-vi>Luồng chạy</span>
          </span>
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={scenario === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => {
                setScenario(id);
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
            <span data-lang-en>Go Runtime Trace</span>
            <span data-lang-vi>Luồng chạy thực tế trên Go</span>
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
