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
    tabEn: '1. Bug: Close() Without Drain Kills Keep-Alive',
    tabVi: '1. Bug: Đóng Body Ngay Phá Hỏng Keep-Alive',
    code: [
      'resp, err := client.Do(req)',
      'if err != nil { return err }',
      'defer resp.Body.Close() // only read first 128B JSON header; 2 KB left!',
      '// net/http sees unread body bytes -> CLOSES TCP/TLS SOCKET!',
    ],
    steps: [
      {
        codeLine: 3,
        titleEn: 'Closing with unread bytes discards TCP connection instead of pooling',
        titleVi: 'Đóng Body khi còn byte chưa đọc khiến net/http vứt bỏ luôn kết nối TCP!',
        noteEn: 'Go http.Transport can only reuse a Keep-Alive connection cleanly for future requests if the stream reaches io.EOF. Calling Close() after peeking headers leaves unread body bytes—forcing a slow new TCP + TLS handshake on every request and piling up TIME_WAIT sockets!',
        noteVi: 'http.Transport của Go chỉ dám đưa kết nối TCP vào pool tái sử dụng nếu dòng stream đã đọc cạn tới EOF. Nếu bạn chỉ kiểm status code rồi Close(), các byte dư khiến net/http đóng sập socket, ép bắt tay lại TCP + TLS ở mỗi request!',
        socketStatus: 'Socket CLOSED -> forces fresh TCP SYN/ACK + TLS handshake (~30–80 ms extra!)',
        stats: [
          { labelEn: 'Keep-Alive reuse', labelVi: 'Tái sử dụng kết nối', val: '0% (socket dropped!)', bad: true },
          { labelEn: 'OS TCP state', labelVi: 'Trạng thái OS socket', val: 'TIME_WAIT port exhaust', bad: true },
          { labelEn: 'Default MaxIdlePerHost', labelVi: 'Mặc định Idle/Host', val: 'Only 2! (needs tuning)', bad: true },
        ],
      },
    ],
  },
  drained: {
    tabEn: '2. Fix: Drain + Close + Tuned Transport Pool',
    tabVi: '2. Fix: Đọc Cạn + Close + Mở Rộng Idle Pool',
    code: [
      'defer func() {',
      '    _, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 1<<20))',
      '    _ = resp.Body.Close() // TCP/TLS returned clean to idle pool!',
      '}()',
      'tr := &http.Transport{MaxIdleConnsPerHost: 100, IdleConnTimeout: 90*time.Second}',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Bounded drain (1 MiB cap) returns socket cleanly to Keep-Alive pool',
        titleVi: 'Đọc cạn (có trần 1 MiB) giúp giữ kết nối Keep-Alive ấm sẵn trong pool',
        noteEn: 'Draining small unread tails via io.Discard returns warm TLS sockets straight back to Transport idle pool—pairing bounded io.LimitReader safety against malicious multi-GB upstream responses plus raising MaxIdleConnsPerHost from 2 up to 100!',
        noteVi: 'Xả nốt vài KB còn sót qua `io.Discard` (bọc `io.LimitReader` để tránh upstream gửi file 10 GB) trả kết nối TLS ấm nguyên vẹn vào pool, cộng với nâng `MaxIdleConnsPerHost` từ 2 lên 100 để chịu tải cao!',
        socketStatus: 'Socket WARM in pool -> zero new TLS handshake -> < 1 ms overhead!',
        stats: [
          { labelEn: 'Keep-Alive reuse', labelVi: 'Tái sử dụng TCP/TLS', val: '~99.9% pooled!', good: true },
          { labelEn: 'Bounded safety', labelVi: 'Chống tràn DoS', val: 'LimitReader 1 MiB cap', good: true },
          { labelEn: 'MaxIdleConnsPerHost', labelVi: 'MaxIdlePerHost chuẩn', val: '100 (vs default 2)', good: true },
        ],
      },
    ],
  },
  defaultClient: {
    tabEn: '3. Trap: http.DefaultClient Timeout = 0 (Infinite)',
    tabVi: '3. Bẫy: http.DefaultClient Không Có Timeout',
    code: [
      '// NEVER in production: http.Get(url) uses http.DefaultClient (Timeout = 0)!',
      'client := &http.Client{',
      '    Timeout: 5 * time.Second, // bounds dial + TLS + body read end-to-end',
      '    Transport: &http.Transport{DialContext: (&net.Dialer{Timeout: 2*time.Second}).DialContext},',
      '}',
    ],
    steps: [
      {
        codeLine: 2,
        titleEn: 'Explicit Transport & Client timeouts rescue goroutines from hung peers',
        titleVi: 'Đặt đủ Timeout chặn đứng thảm họa treo sạch goroutine khi đối tác đơ',
        noteEn: 'If a third-party webhook server accepts TCP SYN and never sends headers, http.Get() blocks forever until container OOMs. Configure DialContext, TLSHandshakeTimeout, ResponseHeaderTimeout, and Client.Timeout explicitly.',
        noteVi: 'Nếu server đối tác nhận kết nối TCP rồi im bặt không trả byte nào, lệnh `http.Get()` treo vĩnh viễn không bao giờ thoát! Luôn tạo `&http.Client{Timeout: ...}` riêng với đủ các ngưỡng thời gian.',
        socketStatus: 'Slow peer aborted cleanly at 5s -> goroutine & FD released cleanly!',
        stats: [
          { labelEn: 'http.DefaultClient Timeout', labelVi: 'Timeout mặc định', val: '0 (Infinite wait!)', bad: true },
          { labelEn: 'Custom client bound', labelVi: 'Client chuẩn production', val: '2s dial / 5s total', good: true },
          { labelEn: 'Applies to server too?', labelVi: 'Cần cho HTTP Server?', val: 'Yes (ReadHeaderTimeout!)', good: true },
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
            <span data-lang-en>HTTP &amp; Pool Trap</span>
            <span data-lang-vi>Bẫy Socket &amp; Pool</span>
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
