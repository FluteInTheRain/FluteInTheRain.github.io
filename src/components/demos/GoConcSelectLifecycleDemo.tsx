import React, { useState } from 'react';

type Scenario = 'ctx' | 'nil-chan' | 'etcd';

interface ScenarioData {
  unsafeLabelEn: string;
  unsafeLabelVi: string;
  safeLabelEn: string;
  safeLabelVi: string;
  code: string[];
  activeLines: number[]; // index into code for steps 1, 2, 3
  nodes: { title: string; sub: string; badOnStep?: number; okOnStep?: number }[];
  events: { en: string; vi: string; tone: 'neutral' | 'warn' | 'ok' | 'bad' }[];
  verdictEn: string;
  verdictVi: string;
}

export default function GoConcSelectLifecycleDemo() {
  const [scenario, setScenario] = useState<Scenario>('ctx');
  const [safeMode, setSafeMode] = useState<boolean>(false);
  const [step, setStep] = useState<number>(3);

  const data: ScenarioData = {
    ctx: {
      unsafeLabelEn: 'r.Context() passed directly',
      unsafeLabelVi: 'Truyền thẳng r.Context()',
      safeLabelEn: 'context.WithoutCancel(r.Context())',
      safeLabelVi: 'Tách bằng context.WithoutCancel',
      code: safeMode
        ? [
            'func handle(w http.ResponseWriter, r *http.Request) {',
            '  bg := context.WithoutCancel(r.Context())',
            '  ctx, cancel := context.WithTimeout(bg, 3*time.Second)',
            '  go func() { defer cancel(); kafka.Publish(ctx) }()',
            '  w.WriteHeader(200) // cancels r.Context() only',
            '}',
          ]
        : [
            'func handle(w http.ResponseWriter, r *http.Request) {',
            '  go audit.Publish(r.Context(), evt)',
            '  w.WriteHeader(http.StatusOK)',
            '  return // net/http cancels r.Context() NOW!',
            '  // background kafka write aborts mid-flight',
            '}',
          ],
      activeLines: safeMode ? [1, 4, 3] : [1, 3, 4],
      nodes: safeMode
        ? [
            { title: '1. WithoutCancel', sub: 'keeps trace ID' },
            { title: '2. HTTP 200 OK', sub: 'r.Context canceled' },
            { title: '3. Kafka Flush', sub: 'finishes in 3s', okOnStep: 3 },
          ]
        : [
            { title: '1. HTTP Handler', sub: 'go Publish(ctx)' },
            { title: '2. HTTP 200 OK', sub: 'net/http cancels' },
            { title: '3. Kafka Driver', sub: 'context canceled!', badOnStep: 3 },
          ],
      events: safeMode
        ? [
            { en: 'POST /checkout arrives; handler detaches cancel signal with context.WithoutCancel(r.Context()) + 3s timeout.', vi: 'Request tới; handler tách tín hiệu hủy bằng context.WithoutCancel(r.Context()) + timeout 3s riêng.', tone: 'ok' },
            { en: 'Handler writes HTTP 200 OK and returns; net/http cancels the original r.Context().', vi: 'Handler trả 200 OK và thoát; net/http hủy r.Context() gốc.', tone: 'warn' },
            { en: 'Background goroutine keeps trace IDs, finishes Kafka flush, and cleans up via defer cancel().', vi: 'Goroutine nền giữ trace ID, ghi xong Kafka rồi tự dọn bằng defer cancel().', tone: 'ok' },
          ]
        : [
            { en: 'POST /checkout arrives; handler spawns go audit.Publish(r.Context(), evt).', vi: 'Request tới; handler chạy go audit.Publish(r.Context(), evt).', tone: 'neutral' },
            { en: 'Handler writes HTTP 200 OK quickly; net/http immediately cancels r.Context().', vi: 'Handler trả 200 OK và return; net/http lập tức hủy r.Context().', tone: 'warn' },
            { en: 'Kafka driver inside audit.Publish aborts with context canceled — audit event dropped!', vi: 'Driver Kafka ngắt ngang với lỗi context canceled — mất luôn audit event!', tone: 'bad' },
          ],
      verdictEn: safeMode ? 'Audit preserved · 0 leaks' : 'Write aborted on HTTP 200',
      verdictVi: safeMode ? 'Lưu an toàn · Không rò rỉ' : 'Chết ngang khi trả HTTP 200',
    },
    'nil-chan': {
      unsafeLabelEn: 'Keep closed channel in select',
      unsafeLabelVi: 'Giữ nguyên channel đã đóng',
      safeLabelEn: 'Set ch1 = nil when closed',
      safeLabelVi: 'Gán ch1 = nil khi đóng',
      code: safeMode
        ? [
            'for ch1 != nil || ch2 != nil {',
            '  select {',
            '  case v, ok := <-ch1:',
            '    if !ok { ch1 = nil; continue }',
            '  case v, ok := <-ch2:',
            '    if !ok { ch2 = nil } else { use(v) }',
            '} }',
          ]
        : [
            'for {',
            '  select {',
            '  case v := <-ch1: // closed! NEVER blocks',
            '    log.Print(v)   // runs (0, false) at 100% CPU!',
            '  case v := <-ch2: // slow producer',
            '    use(v)',
            '} }',
          ],
      activeLines: safeMode ? [2, 3, 4] : [2, 3, 3],
      nodes: safeMode
        ? [
            { title: '1. ch1 closes', sub: 'returns (0, false)' },
            { title: '2. ch1 = nil', sub: 'branch paused', okOnStep: 2 },
            { title: '3. ch2 drains', sub: '0% idle spin', okOnStep: 3 },
          ]
        : [
            { title: '1. ch1 closes', sub: 'close(ch1)' },
            { title: '2. <-ch1 ready', sub: 'returns 0 nonstop' },
            { title: '3. CPU 100%', sub: 'infinite spin!', badOnStep: 3 },
          ],
      events: safeMode
        ? [
            { en: 'Producer 1 closes ch1; select reads (0, ok=false) on L3.', vi: 'Producer 1 đóng ch1; select đọc được (0, ok=false) ở L3.', tone: 'ok' },
            { en: 'L4 sets ch1 = nil; runtime removes ch1 from active select cases.', vi: 'L4 gán ch1 = nil; runtime bỏ qua nhánh ch1 ở lượt lặp tiếp theo.', tone: 'ok' },
            { en: 'Select blocks quietly until ch2 sends or closes — 0% CPU spin.', vi: 'Select ngủ chờ dữ liệu từ ch2 rồi thoát gọn — tốn 0% CPU quay rỗng.', tone: 'ok' },
          ]
        : [
            { en: 'Producer 1 finishes and closes ch1 while ch2 is still running.', vi: 'Producer 1 chạy xong và đóng ch1 trong khi ch2 vẫn đang chờ.', tone: 'neutral' },
            { en: 'Reading closed ch1 on L3 NEVER blocks and immediately yields (0, false).', vi: 'Đọc từ ch1 đã đóng ở L3 KHÔNG bao giờ block mà trả ngay (0, false).', tone: 'warn' },
            { en: 'Loop executes L4 millions of times per second — pinning 1 CPU core at 100%!', vi: 'Vòng lặp quay L4 hàng triệu lần mỗi giây, đốt cứng 100% 1 nhân CPU!', tone: 'bad' },
          ],
      verdictEn: safeMode ? 'Clean exit · 0% spin' : '100% CPU infinite spin',
      verdictVi: safeMode ? 'Thoát sạch · Không quay rỗng' : 'Đốt 100% CPU vô hạn',
    },
    etcd: {
      unsafeLabelEn: 'Format inside mu.Lock()',
      unsafeLabelVi: 'Gọi fmt.Sprintf trong lock',
      safeLabelEn: 'Format outside lock',
      safeLabelVi: 'Mở khóa rồi mới format',
      code: safeMode
        ? [
            'func (c *Node) Update() error {',
            '  c.mu.Lock()',
            '  snap := c.status // copy scalar under lock',
            '  c.mu.Unlock()    // release BEFORE fmt!',
            '  return fmt.Errorf("node err: %s", snap)',
            '}',
          ]
        : [
            'func (c *Node) Update() error {',
            '  c.mu.Lock(); defer c.mu.Unlock()',
            '  return fmt.Errorf("bad node: %v", c)',
            '} // fmt triggers c.String() silently!',
            'func (c *Node) String() string {',
            '  c.mu.RLock(); defer c.mu.RUnlock() // DEADLOCK!',
            '}',
          ],
      activeLines: safeMode ? [1, 3, 4] : [1, 2, 5],
      nodes: safeMode
        ? [
            { title: '1. mu.Lock()', sub: 'copy c.status' },
            { title: '2. mu.Unlock()', sub: 'lock released', okOnStep: 2 },
            { title: '3. fmt log OK', sub: 'zero contention', okOnStep: 3 },
          ]
        : [
            { title: '1. c.mu.Lock()', sub: 'write lock held' },
            { title: '2. fmt "%v", c', sub: 'calls c.String()' },
            { title: '3. c.mu.RLock()', sub: 'self-DEADLOCK!', badOnStep: 3 },
          ],
      events: safeMode
        ? [
            { en: 'Worker acquires c.mu.Lock() and reads scalar status under the lock.', vi: 'Worker lấy c.mu.Lock() và sao chép nhanh trạng thái sang biến tạm.', tone: 'ok' },
            { en: 'Worker releases c.mu.Unlock() BEFORE formatting any strings.', vi: 'Worker gọi c.mu.Unlock() TRƯỚC khi đụng vào fmt hay logging.', tone: 'ok' },
            { en: 'fmt formats safely with zero risk of reentrant lock contention.', vi: 'Log format bình thường, không dính khóa chồng chéo.', tone: 'ok' },
          ]
        : [
            { en: 'Update acquires exclusive write lock c.mu.Lock() on L2.', vi: 'Update lấy khóa ghi độc quyền c.mu.Lock() ở L2.', tone: 'neutral' },
            { en: 'L3 calls fmt.Errorf("bad node: %v", c) while still holding the lock.', vi: 'L3 gọi fmt.Errorf("bad node: %v", c) ngay khi chưa trả lock.', tone: 'warn' },
            { en: 'fmt invokes c.String() on L6, which calls c.mu.RLock() — goroutine deadlocks forever!', vi: 'fmt gọi c.String() ở L6 và gọi tiếp c.mu.RLock() — tự treo deadlock vĩnh viễn!', tone: 'bad' },
          ],
      verdictEn: safeMode ? 'No lock inversion' : 'Permanent Deadlock',
      verdictVi: safeMode ? 'Không kẹt khóa' : 'Treo Deadlock vĩnh viễn',
    },
  }[scenario];

  const visible = data.events.slice(0, step);
  const activeLineIdx = data.activeLines[Math.min(step - 1, data.activeLines.length - 1)];

  return (
    <div className="sd gcsl">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Scenario</span>
            <span data-lang-vi>Kịch bản</span>
          </span>
          <button type="button" className={scenario === 'ctx' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => { setScenario('ctx'); setStep(3); }}>
            HTTP r.Context()
          </button>
          <button type="button" className={scenario === 'nil-chan' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => { setScenario('nil-chan'); setStep(3); }}>
            select &amp; nil channel
          </button>
          <button type="button" className={scenario === 'etcd' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => { setScenario('etcd'); setStep(3); }}>
            String() self-deadlock
          </button>
        </div>

        <div className="sd-group">
          <span>
            <span data-lang-en>Code</span>
            <span data-lang-vi>Cách viết</span>
          </span>
          <button type="button" className={!safeMode ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setSafeMode(false)}>
            <span data-lang-en>{data.unsafeLabelEn}</span>
            <span data-lang-vi>{data.unsafeLabelVi}</span>
          </button>
          <button type="button" className={safeMode ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setSafeMode(true)}>
            <span data-lang-en>{data.safeLabelEn}</span>
            <span data-lang-vi>{data.safeLabelVi}</span>
          </button>
        </div>

        <div className="sd-group sd-run">
          <button type="button" className="sd-btn" disabled={step >= 3} onClick={() => setStep((s) => Math.min(3, s + 1))}>
            <span data-lang-en>Next ({step}/3)</span>
            <span data-lang-vi>Bước tiếp ({step}/3)</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => setStep(1)}>
            <span data-lang-en>Restart</span>
            <span data-lang-vi>Từ đầu</span>
          </button>
        </div>
      </div>

      {/* Side-by-side Code + Animated Execution Flow */}
      <div className="gcsl-grid">
        <div className="gcsl-code-card">
          <div className="gcsl-pane-hdr">
            <span data-lang-en>Go code (active line = t{step})</span>
            <span data-lang-vi>Code Go (dòng đang chạy = t{step})</span>
          </div>
          <div className="gcsl-code-body">
            {data.code.map((line, i) => {
              const isAct = i === activeLineIdx;
              const toneCls = !isAct ? '' : safeMode ? 'is-ok' : step === 3 ? 'is-bad' : '';
              return (
                <div key={i} className={`gcsl-line ${isAct ? 'is-active' : ''} ${toneCls}`}>
                  <span className="gcsl-ln">{isAct ? '▶' : `L${i + 1}`}</span>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="gcsl-flow-card">
          <div className="gcsl-pane-hdr">
            <span data-lang-en>Runtime execution flow</span>
            <span data-lang-vi>Luồng chạy trên Runtime</span>
          </div>
          <svg viewBox="0 0 460 156" className="gcsl-flow-svg" role="img" aria-label="Go runtime execution step flow">
            <line x1="74" x2="386" y1="68" y2="68" className={`gcsl-wire ${safeMode ? 'is-ok' : step === 3 ? 'is-red' : ''}`} />
            {data.nodes.map((nd, idx) => {
              const x = 10 + idx * 156;
              const active = idx + 1 === step;
              const reached = idx + 1 <= step;
              const cls =
                nd.badOnStep && step >= nd.badOnStep
                  ? 'is-bad'
                  : nd.okOnStep && step >= nd.okOnStep
                    ? 'is-ok'
                    : active
                      ? 'is-active'
                      : '';
              return (
                <g key={nd.title} style={{ opacity: reached ? 1 : 0.45 }}>
                  <rect x={x} y="34" width="128" height="68" rx="8" className={`gcsl-node ${cls}`} />
                  <text x={x + 64} y="62" textAnchor="middle" className="gcsl-nb">{nd.title}</text>
                  <text x={x + 64} y="82" textAnchor="middle" className="gcsl-ns">{nd.sub}</text>
                </g>
              );
            })}
            {scenario === 'etcd' && !safeMode && step === 3 && (
              <>
                <path d="M 386 112 L 80 112" className="gcsl-wire is-red" />
                <polygon points="74,112 83,107 83,117" className="gcsl-pulse-red" />
              </>
            )}
            <text x="230" y="138" textAnchor="middle" className="gcsl-ns">
              <tspan data-lang-en>{data.verdictEn}</tspan>
              <tspan data-lang-vi>{data.verdictVi}</tspan>
            </text>
          </svg>
        </div>
      </div>

      <div className="sd-stats">
        <div className={`sd-stat ${safeMode ? 'is-good' : 'is-bad'}`}>
          <b>
            <span data-lang-en>{data.verdictEn}</span>
            <span data-lang-vi>{data.verdictVi}</span>
          </b>
          <span><span data-lang-en>runtime outcome</span><span data-lang-vi>kết quả vận hành</span></span>
        </div>
      </div>

      <ol className="gcsl-list">
        {visible.map((ev, idx) => (
          <li key={idx} className={`gcsl-item is-${ev.tone}`}>
            <span className="gcsl-step">t{idx + 1}</span>
            <span className="gcsl-msg">
              <span data-lang-en>{ev.en}</span>
              <span data-lang-vi>{ev.vi}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
