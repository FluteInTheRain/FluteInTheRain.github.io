import React, { useState } from 'react';

type ScenarioId = 'nodrain' | 'drained' | 'defaultClient';

interface StepSpec {
  codeLine: number;
  titleEn: string;
  titleVi: string;
  noteEn: string;
  noteVi: string;
  socketStatus: string;
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
  nodrain: {
    tabEn: '1. Bug: close without reading the body',
    tabVi: '1. Lỗi: đóng body khi chưa đọc hết',
    code: [
      'resp, err := client.Do(req)',
      'if err != nil { return err }',
      'defer resp.Body.Close() // the body is never read',
      '// unread bytes left: the transport cannot reuse this connection',
    ],
    steps: [
      {
        codeLine: 3,
        titleEn: 'Closing an unread body throws the connection away',
        titleVi: 'Đóng body chưa đọc hết thì connection bị bỏ đi',
        noteEn: 'http.Transport puts a connection back in its idle pool only when the body has been read to the end. Close the body early and the transport closes the connection, so the next request has to dial again.',
        noteVi: 'http.Transport chỉ trả connection về pool rảnh khi body đã được đọc tới cuối. Đóng body sớm thì transport đóng luôn connection, nên request sau phải quay số lại từ đầu.',
        socketStatus: 'Connection closed: the next request opens a new TCP (and TLS) connection',
        stats: [
          { labelEn: '5 requests, 5 MB body', labelVi: '5 request, body 5 MB', val: '5 connections', bad: true },
          { labelEn: 'Next request', labelVi: 'Request kế tiếp', val: 'new handshake', bad: true },
          { labelEn: 'Default MaxIdleConnsPerHost', labelVi: 'MaxIdleConnsPerHost mặc định', val: '2', bad: true },
        ],
      },
    ],
  },
  drained: {
    tabEn: '2. Fix: read to the end, then close',
    tabVi: '2. Sửa: đọc hết rồi mới đóng',
    code: [
      'defer func() {',
      '    _, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 1<<20))',
      '    _ = resp.Body.Close() // connection goes back to the idle pool',
      '}()',
      'tr := &http.Transport{MaxIdleConnsPerHost: 100, IdleConnTimeout: 90*time.Second}',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'A bounded drain keeps the connection for the next request',
        titleVi: 'Đọc cạn có giới hạn giữ connection cho request sau',
        noteEn: 'io.Copy to io.Discard reads what is left, and io.LimitReader caps it at 1 MiB so a huge response cannot keep you reading. Raising MaxIdleConnsPerHost lets more connections wait in the pool for the same host.',
        noteVi: 'io.Copy vào io.Discard đọc nốt phần còn lại, còn io.LimitReader chặn ở 1 MiB để một response khổng lồ không bắt bạn đọc mãi. Tăng MaxIdleConnsPerHost cho phép nhiều connection tới cùng một host chờ sẵn trong pool hơn.',
        socketStatus: 'Connection back in the idle pool: the next request reuses it',
        stats: [
          { labelEn: '5 requests, 5 MB body', labelVi: '5 request, body 5 MB', val: '1 connection', good: true },
          { labelEn: 'Drain limit', labelVi: 'Giới hạn đọc cạn', val: 'LimitReader 1 MiB', good: true },
          { labelEn: 'MaxIdleConnsPerHost', labelVi: 'MaxIdleConnsPerHost', val: '100 (default 2)', good: true },
        ],
      },
    ],
  },
  defaultClient: {
    tabEn: '3. Trap: http.DefaultClient has no timeout',
    tabVi: '3. Bẫy: http.DefaultClient không có timeout',
    code: [
      '// http.Get(url) uses http.DefaultClient, whose Timeout is 0',
      'client := &http.Client{',
      '    Timeout: 5 * time.Second, // one deadline for dial, TLS, headers and body',
      '    Transport: &http.Transport{DialContext: (&net.Dialer{Timeout: 2*time.Second}).DialContext},',
      '}',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Your own client with timeouts stops a stuck call',
        titleVi: 'Client riêng có timeout chặn được lời gọi bị treo',
        noteEn: 'If a server accepts the connection and never sends headers, http.Get waits for ever and its goroutine never returns. Set DialContext, TLSHandshakeTimeout, ResponseHeaderTimeout and Client.Timeout yourself.',
        noteVi: 'Nếu server nhận kết nối rồi không bao giờ gửi header, http.Get chờ mãi và goroutine của nó không bao giờ thoát. Hãy tự đặt DialContext, TLSHandshakeTimeout, ResponseHeaderTimeout và Client.Timeout.',
        socketStatus: 'The call gives up after 5 s and the goroutine and connection are released',
        stats: [
          { labelEn: 'http.DefaultClient Timeout', labelVi: 'Timeout của DefaultClient', val: '0 (no limit)', bad: true },
          { labelEn: 'Own client', labelVi: 'Client riêng', val: '2 s dial, 5 s total', good: true },
          { labelEn: 'Server side', labelVi: 'Phía server', val: 'set ReadHeaderTimeout', good: true },
        ],
      },
    ],
  },
};

export default function GoHttpPoolLeakDemo() {
  const [mode, setMode] = useState<ScenarioId>('nodrain');
  const st = SCENARIOS[mode].steps[0];

  return (
    <div className="sd ghpl">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>HTTP client traps</span>
            <span data-lang-vi>Bẫy HTTP client</span>
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

      <div className="ghpl-grid">
        <div className="ghpl-pane">
          <div className="ghpl-hdr">
            <span data-lang-en>Go Source Trace</span>
            <span data-lang-vi>Code Go Minh Họa</span>
          </div>
          <div className="ghpl-code">
            {SCENARIOS[mode].code.map((line, i) => (
              <div key={i} className={`ghpl-line ${i === st.codeLine ? 'is-active' : ''}`}>
                <span className="ghpl-ln">{i === st.codeLine ? '▶' : `L${i + 1}`}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ghpl-pane">
          <div className="ghpl-hdr">
            <span data-lang-en>{st.titleEn}</span>
            <span data-lang-vi>{st.titleVi}</span>
          </div>
          <div className="ghpl-note">
            <p>
              <span data-lang-en>{st.noteEn}</span>
              <span data-lang-vi>{st.noteVi}</span>
            </p>
            <div className="ghpl-sock">{st.socketStatus}</div>
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
