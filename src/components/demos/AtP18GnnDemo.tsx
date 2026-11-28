import React, { useMemo, useState } from 'react';

// Toy graph from the post: eight tickers, made-up one-day returns (percent), mean aggregation over the
// neighbourhood including the node itself (D^-1 (A+I) x). Matches the Python run recorded in the post.
const NAMES = ['HPG', 'HSG', 'NKG', 'VCB', 'BID', 'CTG', 'FPT', 'MWG'];
const X0 = [3.0, 2.4, 2.8, -0.4, -0.2, 0.1, 1.2, -1.5];
const BASE: [number, number][] = [[0, 1], [0, 2], [1, 2], [3, 4], [3, 5], [4, 5], [6, 7]];
const LINKS: [number, number][] = [[0, 4], [6, 3]];

function run(edges: [number, number][], layers: number): number[] {
  const nb: number[][] = NAMES.map((_, i) => [i]);
  edges.forEach(([a, b]) => { nb[a].push(b); nb[b].push(a); });
  let h = X0.slice();
  for (let l = 0; l < layers; l++) {
    const prev = h;
    h = nb.map((list) => list.reduce((s, j) => s + prev[j], 0) / list.length);
  }
  return h;
}

const f2 = (v: number, vi: boolean) => (vi ? v.toFixed(2).replace('.', ',') : v.toFixed(2));

export default function AtP18GnnDemo() {
  const [layers, setLayers] = useState(1);
  const [links, setLinks] = useState(true);
  const h = useMemo(() => run(links ? BASE.concat(LINKS) : BASE, layers), [layers, links]);
  const max = Math.max(...h);
  const min = Math.min(...h);
  const spread = max - min;
  const leaders = NAMES.filter((_, i) => h[i] > max - 0.005);
  const SC = 14; // percent of the row width per 1.0 of return, centre at 38%

  return (
    <div className="atp18d">
      <div className="sd-controls">
        <div className="sd-group">
          <label htmlFor="atp18d-layers">
            <span data-lang-en>Layers stacked</span>
            <span data-lang-vi>Số lớp chồng lên</span>
          </label>
          <input id="atp18d-layers" type="range" min={0} max={12} step={1} value={layers} onChange={(e) => setLayers(Number(e.target.value))} />
          <b className="atp18d-n">{layers}</b>
        </div>
        <div className="sd-group">
          <span>
            <span data-lang-en>Edges</span>
            <span data-lang-vi>Cạnh</span>
          </span>
          <button type="button" className={!links ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setLinks(false)}>
            <span data-lang-en>Same group only</span>
            <span data-lang-vi>Chỉ cùng nhóm</span>
          </button>
          <button type="button" className={links ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setLinks(true)}>
            <span data-lang-en>Plus 2 cross links</span>
            <span data-lang-vi>Thêm 2 liên kết chéo</span>
          </button>
        </div>
      </div>

      <ul className="atp18d-rows">
        {NAMES.map((nm, i) => {
          const lead = h[i] > max - 0.005;
          const w = Math.abs(h[i]) * SC;
          const wBefore = Math.abs(X0[i]) * SC;
          return (
            <li key={nm} className="atp18d-row">
              <span className="atp18d-name">{nm}</span>
              <span className="atp18d-track" aria-hidden="true">
                <span className="atp18d-zero" />
                <span className="atp18d-bar before" style={{ left: X0[i] >= 0 ? '38%' : `${38 - wBefore}%`, width: `${wBefore}%` }} />
                <span className={lead ? 'atp18d-bar after lead' : 'atp18d-bar after'} style={{ left: h[i] >= 0 ? '38%' : `${38 - w}%`, width: `${w}%` }} />
              </span>
              <span className="atp18d-val">
                <span data-lang-en>{f2(h[i], false)}</span>
                <span data-lang-vi>{f2(h[i], true)}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>Top stock(s)</span><span data-lang-vi>Mã đứng đầu</span></span>
          <b>{leaders.join(', ')}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Highest minus lowest</span><span data-lang-vi>Cao nhất trừ thấp nhất</span></span>
          <b>
            <span data-lang-en>{f2(spread, false)}</span>
            <span data-lang-vi>{f2(spread, true)}</span>
          </b>
        </div>
      </div>
    </div>
  );
}
