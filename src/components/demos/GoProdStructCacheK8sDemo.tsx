import React, { useState } from 'react';

type Tab = 'struct' | 'k8s';

export default function GoProdStructCacheK8sDemo() {
  const [tab, setTab] = useState<Tab>('struct');
  const [aligned, setAligned] = useState<boolean>(false);
  const [hostCores, setHostCores] = useState<number>(8);
  const [podLimit, setPodLimit] = useState<number>(4);
  const [useAutoMax, setUseAutoMax] = useState<boolean>(false);

  const gomax = useAutoMax ? podLimit : hostCores;
  const burnMs = Math.min(100, Math.round((podLimit / gomax) * 100));
  const throttledMs = Math.max(0, 100 - burnMs);
  const req50Total = throttledMs > 0 && 50 > burnMs ? 50 + throttledMs : 50;

  const unalignedWords = [
    { label: 'Word 0 (0–7B)', slots: [{ name: 'Active (1B)', kind: 'data' }, { name: 'padding (7B)', kind: 'pad' }] },
    { label: 'Word 1 (8–15B)', slots: [{ name: 'Amount int64 (8B)', kind: 'data' }] },
    { label: 'Word 2 (16–23B)', slots: [{ name: 'Retry (1B)', kind: 'data' }, { name: 'padding (7B)', kind: 'pad' }] },
  ];
  const alignedWords = [
    { label: 'Word 0 (0–7B)', slots: [{ name: 'Amount int64 (8B)', kind: 'data' }] },
    { label: 'Word 1 (8–15B)', slots: [{ name: 'Active (1B)', kind: 'data' }, { name: 'Retry (1B)', kind: 'data' }, { name: 'pad (6B)', kind: 'pad' }] },
  ];
  const words = aligned ? alignedWords : unalignedWords;

  const structCode = aligned
    ? [
        'type Job struct {',
        '  Amount int64 // offset 0..7 (8B, 0 pad)',
        '  Active bool  // offset 8 (1B)',
        '  Retry  bool  // offset 9 + 6B pad -> 16B total',
        '} // unsafe.Sizeof(Job{}) == 16 bytes!',
      ]
    : [
        'type Job struct {',
        '  Active bool  // 1B + 7B wasted padding!',
        '  Amount int64 // aligned to 8-byte word',
        '  Retry  bool  // 1B + 7B trailing padding!',
        '} // unsafe.Sizeof(Job{}) == 24 bytes (+50%)',
      ];

  const k8sCode = useAutoMax
    ? [
        'import _ "go.uber.org/automaxprocs" // or Go 1.25+',
        `// Pod limits.cpu=${podLimit} on ${hostCores}-core node`,
        `// GOMAXPROCS clamped -> ${podLimit} OS threads`,
        '// 4 threads x 100ms = 400ms (0ms throttled!)',
      ]
    : [
        '// No cgroup awareness (older Go runtime)',
        `// Pod limits.cpu=${podLimit} -> ${podLimit * 100}ms / 100ms window`,
        `// GOMAXPROCS=${hostCores} burns quota in ${burnMs}ms!`,
        `// CFS freezes pod for next ${throttledMs}ms (+latency!)`,
      ];

  const barRunWidthPx = Math.max(40, Math.round((burnMs / 100) * 412));

  return (
    <div className="sd gpsc">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Lab</span>
            <span data-lang-vi>Thử nghiệm</span>
          </span>
          <button type="button" className={tab === 'struct' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setTab('struct')}>
            <span data-lang-en>Struct byte alignment</span>
            <span data-lang-vi>Sắp xếp byte Struct</span>
          </button>
          <button type="button" className={tab === 'k8s' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setTab('k8s')}>
            <span data-lang-en>Kubernetes CFS throttling</span>
            <span data-lang-vi>Throttling CPU Kubernetes</span>
          </button>
        </div>

        {tab === 'struct' ? (
          <div className="sd-group">
            <span>
              <span data-lang-en>Field order</span>
              <span data-lang-vi>Thứ tự trường</span>
            </span>
            <button type="button" className={!aligned ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setAligned(false)}>
              bool, int64, bool
            </button>
            <button type="button" className={aligned ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setAligned(true)}>
              int64, bool, bool
            </button>
          </div>
        ) : (
          <>
            <div className="sd-group">
              <span>
                <span data-lang-en>Node</span>
                <span data-lang-vi>Host</span>
              </span>
              {[8, 16, 32].map((c) => (
                <button key={c} type="button" className={hostCores === c ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setHostCores(c)}>
                  {c}c
                </button>
              ))}
            </div>
            <div className="sd-group">
              <span>Pod</span>
              {[2, 4].map((l) => (
                <button key={l} type="button" className={podLimit === l ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setPodLimit(l)}>
                  {l}c
                </button>
              ))}
            </div>
            <div className="sd-group">
              <button type="button" className={useAutoMax ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setUseAutoMax(!useAutoMax)}>
                <span data-lang-en>{useAutoMax ? 'Container-aware: ON' : 'Container-aware: OFF'}</span>
                <span data-lang-vi>{useAutoMax ? 'Khớp cgroup: BẬT' : 'Khớp cgroup: TẮT'}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Side-by-side Code + SVG timeline */}
      <div className="gpsc-grid">
        <div className="gpsc-pane">
          <div className="gpsc-pane-hdr">
            <span data-lang-en>Go code</span>
            <span data-lang-vi>Code Go đối chiếu</span>
          </div>
          <div className="gpsc-code-body">
            {(tab === 'struct' ? structCode : k8sCode).map((line, i) => {
              const highlight = tab === 'struct' ? i === 1 || i === 3 : i === 2;
              const cls = !highlight
                ? ''
                : tab === 'struct'
                  ? aligned
                    ? 'is-good'
                    : 'is-bad'
                  : throttledMs > 0
                    ? 'is-bad'
                    : 'is-good';
              return (
                <div key={i} className={`gpsc-line ${highlight ? 'is-active' : ''} ${cls}`}>
                  <span className="gpsc-ln">{highlight ? '▶' : `L${i + 1}`}</span>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="gpsc-pane">
          <div className="gpsc-pane-hdr">
            <span data-lang-en>{tab === 'struct' ? 'Memory word layout' : '100 ms CFS window'}</span>
            <span data-lang-vi>{tab === 'struct' ? 'Bố cục word bộ nhớ CPU' : 'Chu kỳ CFS 100 ms trên Pod'}</span>
          </div>
          {tab === 'struct' ? (
            <svg viewBox="0 0 460 128" className="gpsc-flow-svg" role="img" aria-label="64-bit struct word alignment diagram">
              {words.map((w, idx) => (
                <g key={w.label}>
                  <rect x="14" y={12 + idx * 36} width="432" height="28" rx="5" className={`gpsc-svg-box ${aligned ? 'is-good' : idx !== 1 ? 'is-bad' : ''}`} />
                  <text x="26" y={30 + idx * 36} className="gpsc-svg-b">{w.label}</text>
                  <text x="165" y={30 + idx * 36} className={aligned ? 'gpsc-svg-good' : idx !== 1 ? 'gpsc-svg-red' : 'gpsc-svg-b'}>
                    {w.slots.map((s) => s.name).join(' + ')}
                  </text>
                </g>
              ))}
            </svg>
          ) : (
            <svg viewBox="0 0 460 128" className="gpsc-flow-svg" role="img" aria-label="Kubernetes CFS throttling timeline">
              <rect x="24" y="28" width={barRunWidthPx} height="48" rx="5" className="gpsc-svg-box is-good" />
              <text x={24 + barRunWidthPx / 2} y="56" textAnchor="middle" className="gpsc-svg-b">
                {burnMs} ms RUN
              </text>

              {throttledMs > 0 && (
                <>
                  <rect x={24 + barRunWidthPx + 2} y="28" width={Math.max(40, 412 - barRunWidthPx)} height="48" rx="5" className="gpsc-svg-box is-bad" />
                  <text x={24 + barRunWidthPx + (412 - barRunWidthPx) / 2} y="56" textAnchor="middle" className="gpsc-svg-red">
                    {throttledMs} ms FREEZE
                  </text>
                </>
              )}

              <line x1="24" x2="436" y1="96" y2="96" stroke="var(--text-muted)" strokeWidth="1.4" />
              <text x="24" y="114" className="gpsc-svg-sm">0 ms</text>
              <text x={24 + barRunWidthPx} y="114" textAnchor="middle" className={throttledMs > 0 ? 'gpsc-svg-red' : 'gpsc-svg-good'}>
                {burnMs} ms
              </text>
              <text x="436" y="114" textAnchor="end" className="gpsc-svg-sm">100 ms</text>
            </svg>
          )}
        </div>
      </div>

      {tab === 'struct' ? (
        <div>
          <div className="sd-stats">
            <div className={`sd-stat ${aligned ? 'is-good' : 'is-bad'}`}>
              <b>{aligned ? '16 B' : '24 B'}</b>
              <span>unsafe.Sizeof</span>
            </div>
            <div className={`sd-stat ${aligned ? 'is-good' : 'is-bad'}`}>
              <b>{aligned ? '6 B' : '14 B'}</b>
              <span><span data-lang-en>wasted padding</span><span data-lang-vi>byte đệm thừa</span></span>
            </div>
            <div className={`sd-stat ${aligned ? 'is-good' : ''}`}>
              <b>{aligned ? '152.6 MiB' : '228.9 MiB'}</b>
              <span><span data-lang-en>10M slice footprint</span><span data-lang-vi>RAM slice 10 triệu phần tử</span></span>
            </div>
          </div>

          <div className="gpsc-words">
            {words.map((w) => (
              <div key={w.label} className="gpsc-word">
                <span className="gpsc-wlbl">{w.label}</span>
                <div className="gpsc-slots">
                  {w.slots.map((s) => (
                    <span key={s.name} className={`gpsc-slot is-${s.kind}`}>{s.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="sd-stats">
            <div className="sd-stat">
              <b>{gomax}</b>
              <span>GOMAXPROCS</span>
            </div>
            <div className="sd-stat">
              <b>{burnMs} ms</b>
              <span><span data-lang-en>active window / 100 ms</span><span data-lang-vi>chạy / 100 ms</span></span>
            </div>
            <div className={`sd-stat ${throttledMs > 0 ? 'is-bad' : 'is-good'}`}>
              <b>{throttledMs} ms</b>
              <span><span data-lang-en>CFS throttled pause</span><span data-lang-vi>bị CFS đóng băng</span></span>
            </div>
            <div className={`sd-stat ${throttledMs > 0 ? 'is-bad' : 'is-good'}`}>
              <b>{req50Total} ms</b>
              <span><span data-lang-en>50 ms job wall latency</span><span data-lang-vi>tổng trễ job 50 ms</span></span>
            </div>
          </div>
          <div className="gpsc-bar-wrap" aria-label="100ms CFS window bar">
            <div className="gpsc-bar-run" style={{ width: `${burnMs}%` }}>
              {burnMs > 18 && <span>{burnMs} ms CPU</span>}
            </div>
            {throttledMs > 0 && (
              <div className="gpsc-bar-stop" style={{ width: `${throttledMs}%` }}>
                <span>{throttledMs} ms THROTTLED</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
