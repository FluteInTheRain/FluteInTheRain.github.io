import React, { useState } from 'react';

type ScenarioId = 'cpuProfile' | 'fgprof' | 'trace';

interface SliceBar {
  label: string;
  ms: number;
  kind: 'cpu' | 'mutex' | 'io';
  visibleInTool: boolean;
}

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  bars: SliceBar[];
  stats: [
    { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean },
    { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean },
    { labelEn: string; labelVi: string; val: string; good?: boolean; bad?: boolean },
  ];
}

const CODE_LINES = [
  'func HandleCheckout(w http.ResponseWriter, r *http.Request) {',
  '    req := parseJSON(r.Body)      // 2 ms active CPU burning cycles',
  '    cacheMu.Lock()                // 18 ms goroutine PARKED on Mutex contention!',
  '    item := cache[req.SKU]; cacheMu.Unlock()',
  '    resp, _ := pgPool.Exec(req)   // 30 ms parked waiting on PostgreSQL network I/O!',
  '}                                 // Total user wall time = 50 ms!',
];

const SCENARIOS: Record<
  ScenarioId,
  { tabEn: string; tabVi: string; steps: StepSpec[] }
> = {
  cpuProfile: {
    tabEn: '1. Standard pprof CPU (On-CPU only)',
    tabVi: '1. CPU pprof Chuẩn (Chỉ thấy On-CPU)',
    steps: [
      {
        codeLine: 1,
        titleEn: 'SIGPROF 100 Hz timer samples ONLY goroutines actively running on OS threads',
        titleVi: 'SIGPROF 100 Hz chỉ lấy mẫu những lúc goroutine đang thực sự đốt nhân CPU',
        noteEn: 'HandleCheckout takes 50 ms wall-clock time—yet only 2 ms burns CPU in parseJSON. When blocked on cacheMu.Lock() or pgPool.Exec(), Go parks the goroutine (Off-CPU) so pprof CPU skips those 48 ms completely!',
        noteVi: 'Cả request mất 50 ms ngoài đời thực nhưng chỉ đúng 2 ms `parseJSON` đốt CPU. Suốt 48 ms đứng đợi Mutex hoặc chờ PostgreSQL trả mạng, goroutine bị đỗ ngủ nên CPU profile bỏ sót sạch sẽ!',
        bars: [
          { label: 'parseJSON (2 ms CPU)', ms: 2, kind: 'cpu', visibleInTool: true },
          { label: 'cacheMu.Lock wait (18 ms — INVISIBLE!)', ms: 18, kind: 'mutex', visibleInTool: false },
          { label: 'pgPool SQL I/O wait (30 ms — INVISIBLE!)', ms: 30, kind: 'io', visibleInTool: false },
        ],
        stats: [
          { labelEn: 'User wall-clock p99', labelVi: 'Thời gian khách chờ', val: '50 ms' },
          { labelEn: 'Visible in pprof CPU', labelVi: 'CPU pprof nhìn thấy', val: '2 ms ONLY (100% parseJSON!)', bad: true },
          { labelEn: 'Team wrong guess', labelVi: 'Hiểu nhầm dễ gặp', val: 'Blames parseJSON falsely', bad: true },
        ],
      },
    ],
  },
  fgprof: {
    tabEn: '2. fgprof Wall-Clock Profiler (On + Off-CPU)',
    tabVi: '2. fgprof Wall-Clock (Bắt trọn On + Off-CPU)',
    steps: [
      {
        codeLine: 4,
        titleEn: 'fgprof samples ALL goroutines runnable OR sleeping every 10 ms via runtime.GoroutineProfile',
        titleVi: 'fgprof chụp trạng thái TẤT CẢ goroutine mỗi 10 ms -> phơi bày 96% thời gian chờ!',
        noteEn: 'Polling every non-dead goroutine stack exposes wall-clock time evenly across CPU, Mutex wait, and SQL socket I/O—revealing immediately that pgPool (60%) and cacheMu (36%) dwarf parseJSON (4%)!',
        noteVi: 'Bằng cách quét stack toàn bộ goroutine đang mở mỗi 10 ms, fgprof lập tức vẽ đúng tỷ lệ thời gian thật: 60% nằm chờ PostgreSQL, 36% tắc khóa Mutex, còn parseJSON chỉ chiếm 4%!',
        bars: [
          { label: 'parseJSON (4% wall time)', ms: 2, kind: 'cpu', visibleInTool: true },
          { label: 'cacheMu.Lock (36% wall time!)', ms: 18, kind: 'mutex', visibleInTool: true },
          { label: 'pgPool SQL wait (60% wall time!)', ms: 30, kind: 'io', visibleInTool: true },
        ],
        stats: [
          { labelEn: 'Visible in fgprof', labelVi: 'fgprof nhìn thấy', val: 'All 50 ms (100%)', good: true },
          { labelEn: '#1 Root cause revealed', labelVi: 'Nguyên nhân số #1 lộ diện', val: 'pgPool I/O (60%) + Mutex (36%)', good: true },
          { labelEn: 'Extra overhead rule', labelVi: 'Chi phí runtime', val: 'Avoid >10k idle Gs always' },
        ],
      },
    ],
  },
  trace: {
    tabEn: '3. Mutex Profile & go tool trace',
    tabVi: '3. Mutex Profile & go tool trace',
    steps: [
      {
        codeLine: 2,
        titleEn: 'SetMutexProfileFraction + go tool trace expose scheduler & lock contention directly',
        titleVi: 'Mutex Profile + Execution Trace vạch rõ từng micro-giây tranh chấp khóa và P rảnh',
        noteEn: 'When Mutexes or scheduling stalls dominate, runtime.SetMutexProfileFraction(1) pinpoints the exact unlock holding cacheMu, while `go tool trace` shows exact nanosecond wake-up arrows across all 8 cores.',
        noteVi: 'Khi nghi nghẽn Lock hoặc thiếu P chạy, bật `runtime.SetMutexProfileFraction` chỉ đích danh dòng `Unlock` giữ khóa lâu nhất, còn `go tool trace` vẽ từng mũi tên đánh thức goroutine theo thời gian thực.',
        bars: [
          { label: 'parseJSON active', ms: 2, kind: 'cpu', visibleInTool: true },
          { label: 'Mutex profile delay (/debug/pprof/mutex)', ms: 18, kind: 'mutex', visibleInTool: true },
          { label: 'Network Wait (Netpoll epoll)', ms: 30, kind: 'io', visibleInTool: true },
        ],
        stats: [
          { labelEn: 'Mutex contention tool', labelVi: 'Tìm kẹt Sync Lock', val: 'SetMutexProfileFraction', good: true },
          { labelEn: 'Exact timeline tool', labelVi: 'Xem dòng thời gian thật', val: 'go tool trace', good: true },
          { labelEn: 'Correct fix design level', labelVi: 'Hướng sửa tối ưu', val: 'Level 1 Batch SQL / RWMutex', good: true },
        ],
      },
    ],
  },
};

export default function GoOffCpuTimelineDemo() {
  const [mode, setMode] = useState<ScenarioId>('cpuProfile');
  const st = SCENARIOS[mode].steps[0];

  return (
    <div className="sd goct">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Profiler Lens</span>
            <span data-lang-vi>Góc nhìn Profiler</span>
          </span>
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={mode === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => setMode(id)}
            >
              <span data-lang-en>{SCENARIOS[id].tabEn}</span>
              <span data-lang-vi>{SCENARIOS[id].tabVi}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="goct-grid">
        <div className="goct-pane">
          <div className="goct-hdr">
            <span data-lang-en>50 ms Request Handler Source</span>
            <span data-lang-vi>Code Endpoint Chạy Tổng 50 ms</span>
          </div>
          <div className="goct-code">
            {CODE_LINES.map((line, i) => (
              <div key={i} className={`goct-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="goct-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="goct-pane">
          <div className="goct-hdr">
            <span data-lang-en>{st.titleEn}</span>
            <span data-lang-vi>{st.titleVi}</span>
          </div>
          <div className="goct-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="goct-bars">
              {st.bars.map((b, i) => (
                <div key={i} className={`goct-bar-row ${b.visibleInTool ? 'is-seen' : 'is-blind'}`}>
                  <div className="goct-bar-meta">
                    <span>{b.label}</span>
                    <b>{b.visibleInTool ? `${b.ms} ms sampled` : 'BLIND SPOT'}</b>
                  </div>
                  <div className="goct-track">
                    <div className={`goct-fill is-${b.kind}`} style={{ width: `${(b.ms / 50) * 100}%` }} />
                  </div>
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
