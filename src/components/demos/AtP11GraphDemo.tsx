import React, { useState } from 'react';

// Simulated market, not real prices. Say 12 stocks in 3 sectors of 4 and 250 trading days:
// each return = market factor + sector factor + own noise (Python numpy, seed 5 for the calm run, seed 6 for the crash run;
// the crash run only raises the market factor loading from 0.4 to 1.1). The matrices below are the 2-decimal correlations of
// those runs. Edge counts, groups and tree length are recomputed here and match the Python (networkx) run of the same matrices.
// MATH-START
const CALM = [
    [1,0.44,0.43,0.47,0.23,0.05,0.09,0.11,0.09,0.07,0.11,0.13],
    [0.44,1,0.4,0.43,0.14,0.05,-0.01,0.02,0.12,0.09,0.04,0.11],
    [0.43,0.4,1,0.41,0.19,0.02,0.04,0.11,0.15,0.04,0,0.14],
    [0.47,0.43,0.41,1,0.22,0.06,0.09,0.15,0.12,0.08,0.06,0.21],
    [0.23,0.14,0.19,0.22,1,0.38,0.37,0.42,0.05,0.17,0.07,0.03],
    [0.05,0.05,0.02,0.06,0.38,1,0.46,0.4,0.05,0.29,0.12,0.12],
    [0.09,-0.01,0.04,0.09,0.37,0.46,1,0.39,0.07,0.26,0.14,0.17],
    [0.11,0.02,0.11,0.15,0.42,0.4,0.39,1,0.09,0.22,0.09,0.16],
    [0.09,0.12,0.15,0.12,0.05,0.05,0.07,0.09,1,0.36,0.35,0.36],
    [0.07,0.09,0.04,0.08,0.17,0.29,0.26,0.22,0.36,1,0.36,0.4],
    [0.11,0.04,0,0.06,0.07,0.12,0.14,0.09,0.35,0.36,1,0.36],
    [0.13,0.11,0.14,0.21,0.03,0.12,0.17,0.16,0.36,0.4,0.36,1]
  ];
const CRASH = [
    [1,0.64,0.64,0.66,0.55,0.53,0.52,0.49,0.47,0.48,0.5,0.46],
    [0.64,1,0.66,0.65,0.55,0.51,0.55,0.47,0.5,0.49,0.51,0.53],
    [0.64,0.66,1,0.63,0.51,0.46,0.49,0.46,0.44,0.45,0.48,0.39],
    [0.66,0.65,0.63,1,0.52,0.54,0.52,0.51,0.47,0.49,0.44,0.5],
    [0.55,0.55,0.51,0.52,1,0.63,0.7,0.63,0.5,0.54,0.48,0.56],
    [0.53,0.51,0.46,0.54,0.63,1,0.64,0.62,0.52,0.55,0.48,0.5],
    [0.52,0.55,0.49,0.52,0.7,0.64,1,0.66,0.5,0.53,0.47,0.55],
    [0.49,0.47,0.46,0.51,0.63,0.62,0.66,1,0.51,0.56,0.47,0.53],
    [0.47,0.5,0.44,0.47,0.5,0.52,0.5,0.51,1,0.67,0.69,0.65],
    [0.48,0.49,0.45,0.49,0.54,0.55,0.53,0.56,0.67,1,0.66,0.68],
    [0.5,0.51,0.48,0.44,0.48,0.48,0.47,0.47,0.69,0.66,1,0.66],
    [0.46,0.53,0.39,0.5,0.56,0.5,0.55,0.53,0.65,0.68,0.66,1]
  ];

function distance(rho) {
  return Math.sqrt(2 * (1 - rho));
}

function thresholdStats(M, pct) {
  const n = M.length;
  const parent = [];
  for (let i = 0; i < n; i++) parent.push(i);
  const find = (a) => (parent[a] === a ? a : (parent[a] = find(parent[a])));
  const edges = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.round(M[i][j] * 100) >= pct) {
        edges.push([i, j]);
        parent[find(i)] = find(j);
      }
    }
  }
  let groups = 0;
  for (let i = 0; i < n; i++) if (find(i) === i) groups++;
  return { edges, groups };
}

function mst(M) {
  const n = M.length;
  const all = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all.push([i, j, distance(M[i][j])]);
  all.sort((a, b) => a[2] - b[2]);
  const parent = [];
  for (let i = 0; i < n; i++) parent.push(i);
  const find = (a) => (parent[a] === a ? a : (parent[a] = find(parent[a])));
  const edges = [];
  let length = 0;
  for (const [a, b, d] of all) {
    if (find(a) !== find(b)) {
      parent[find(a)] = find(b);
      edges.push([a, b]);
      length += d;
    }
  }
  return { edges, length };
}

function meanCorr(M) {
  const n = M.length;
  let s = 0;
  let c = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { s += M[i][j]; c++; }
  return s / c;
}
// MATH-END

const SECTOR = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];
const NAMES = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'];
const POS = NAMES.map((_, i) => {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / 12;
  return [200 + 140 * Math.cos(a), 170 + 130 * Math.sin(a)];
});

export default function AtP11GraphDemo() {
  const [regime, setRegime] = useState('calm');
  const [view, setView] = useState('threshold');
  const [pct, setPct] = useState(30);

  const M = regime === 'calm' ? CALM : CRASH;
  const t = thresholdStats(M, pct);
  const tree = mst(M);
  const edges = view === 'threshold' ? t.edges : tree.edges;
  const fmt = (x, d) => x.toFixed(d);

  return (
    <div className="sd atp11">
      <div className="sd-controls">
        <button type="button" className={regime === 'calm' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={regime === 'calm'} onClick={() => setRegime('calm')}>
          <span data-lang-en>Calm stretch</span>
          <span data-lang-vi>Quãng êm</span>
        </button>
        <button type="button" className={regime === 'crash' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={regime === 'crash'} onClick={() => setRegime('crash')}>
          <span data-lang-en>Crash stretch</span>
          <span data-lang-vi>Quãng sụp đổ</span>
        </button>
        <button type="button" className={view === 'threshold' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={view === 'threshold'} onClick={() => setView('threshold')}>
          <span data-lang-en>Threshold graph</span>
          <span data-lang-vi>Đồ thị ngưỡng</span>
        </button>
        <button type="button" className={view === 'tree' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={view === 'tree'} onClick={() => setView('tree')}>
          <span data-lang-en>Spanning tree</span>
          <span data-lang-vi>Cây khung</span>
        </button>
      </div>
      <label className="atp11-slider">
        <span data-lang-en>Keep a link when correlation is at least {fmt(pct / 100, 2)}</span>
        <span data-lang-vi>Giữ cạnh khi tương quan từ {fmt(pct / 100, 2).replace('.', ',')} trở lên</span>
        <input type="range" min={10} max={70} step={5} value={pct} disabled={view === 'tree'} onChange={(e) => setPct(Number(e.target.value))} />
      </label>
      <svg viewBox="0 0 400 340" className="atp11-svg" role="img" aria-label="Twelve simulated stocks on a ring, coloured by sector, with the links the current settings keep.">
        {edges.map(([a, b]) => (
          <line key={a + '-' + b} x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} className="atp11-e" />
        ))}
        {POS.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="13" className={'atp11-n atp11-s' + SECTOR[i]} />
            <text x={x} y={y + 4} textAnchor="middle" className="atp11-t">{NAMES[i]}</text>
          </g>
        ))}
      </svg>
      <dl className="atp11-read" aria-live="polite">
        <div><dt><span data-lang-en>Mean correlation</span><span data-lang-vi>Tương quan trung bình</span></dt><dd>{fmt(meanCorr(M), 2)}</dd></div>
        <div><dt><span data-lang-en>Links shown</span><span data-lang-vi>Số cạnh đang hiện</span></dt><dd>{edges.length}</dd></div>
        <div><dt><span data-lang-en>Separate groups</span><span data-lang-vi>Số nhóm rời nhau</span></dt><dd>{view === 'threshold' ? t.groups : 1}</dd></div>
        <div><dt><span data-lang-en>Tree length (11 links)</span><span data-lang-vi>Độ dài cây (11 cạnh)</span></dt><dd>{fmt(tree.length, 2)}</dd></div>
      </dl>
    </div>
  );
}
