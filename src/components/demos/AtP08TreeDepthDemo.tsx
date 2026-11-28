import React, { useState } from 'react';

// Numbers below come from one python run (scikit-learn 1.8.0, numpy seed 80):
// 200 stocks x 120 months, 6 persistent features, true signal 0.6*x1 + 0.8*x2*x3
// at about 1.4% monthly R2, 1-month label. Train on months 1-80, test on 81-120.
// Rank IC = mean over months of the cross-sectional Spearman correlation between
// score and next-month return. Spread = top decile minus bottom decile, in units
// of one standard deviation of the monthly return, averaged over the test months.
// tree: DecisionTreeRegressor(min_samples_leaf=20); forest: 100 trees,
// min_samples_leaf=50, max_features=0.5. depth 0 means no depth limit.
type Row = { depth: number; icIn: number; icOos: number; spread: number };
const TREE: Row[] = [
  { depth: 1, icIn: 0.0752, icOos: 0.0493, spread: 0.0711 },
  { depth: 2, icIn: 0.0857, icOos: 0.0513, spread: 0.0945 },
  { depth: 3, icIn: 0.0953, icOos: 0.0498, spread: 0.1804 },
  { depth: 4, icIn: 0.1049, icOos: 0.0318, spread: 0.1012 },
  { depth: 6, icIn: 0.1376, icOos: 0.0342, spread: 0.037 },
  { depth: 8, icIn: 0.179, icOos: 0.0333, spread: 0.0265 },
  { depth: 12, icIn: 0.289, icOos: 0.016, spread: -0.0002 },
  { depth: 0, icIn: 0.4343, icOos: 0.0006, spread: -0.0114 },
];
const FOREST: Row[] = [
  { depth: 1, icIn: 0.1004, icOos: 0.0414, spread: 0.1112 },
  { depth: 2, icIn: 0.1152, icOos: 0.0486, spread: 0.1465 },
  { depth: 3, icIn: 0.1313, icOos: 0.0531, spread: 0.156 },
  { depth: 4, icIn: 0.152, icOos: 0.0552, spread: 0.1911 },
  { depth: 6, icIn: 0.2031, icOos: 0.0609, spread: 0.1966 },
  { depth: 8, icIn: 0.262, icOos: 0.0623, spread: 0.2058 },
  { depth: 12, icIn: 0.354, icOos: 0.0588, spread: 0.2464 },
  { depth: 0, icIn: 0.3928, icOos: 0.0573, spread: 0.1978 },
];

const f = (v: number) => v.toFixed(3);
const BAR = 0.45; // IC value that fills a bar

export default function AtP08TreeDepthDemo() {
  const [model, setModel] = useState<'tree' | 'forest'>('tree');
  const [i, setI] = useState(7);
  const rows = model === 'tree' ? TREE : FOREST;
  const r = rows[i];
  const label = r.depth === 0 ? null : String(r.depth);
  const best = Math.max(...rows.map((x) => x.icOos));
  const isBest = r.icOos === best;
  const overfit = r.icIn - r.icOos;

  return (
    <div className="sd atp08-demo">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Model</span>
            <span data-lang-vi>Mô hình</span>
          </span>
          <button type="button" className={model === 'tree' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setModel('tree')}>
            <span data-lang-en>One tree</span>
            <span data-lang-vi>Một cây</span>
          </button>
          <button type="button" className={model === 'forest' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setModel('forest')}>
            <span data-lang-en>Forest of 100 trees</span>
            <span data-lang-vi>Rừng 100 cây</span>
          </button>
        </div>
        <div className="sd-group atp08-slider">
          <label htmlFor="atp08-depth">
            <span data-lang-en>Maximum depth: </span>
            <span data-lang-vi>Độ sâu tối đa: </span>
            <b>
              {label ?? ''}
              {label === null && (
                <>
                  <span data-lang-en>no limit</span>
                  <span data-lang-vi>không giới hạn</span>
                </>
              )}
            </b>
          </label>
          <input id="atp08-depth" type="range" min={0} max={rows.length - 1} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} />
        </div>
      </div>

      <div className="atp08-bars">
        <div className="atp08-bar-row">
          <span className="atp08-bar-lab">
            <span data-lang-en>Rank IC on the months it trained on</span>
            <span data-lang-vi>Rank IC trên các tháng nó đã học</span>
          </span>
          <span className="atp08-bar-track">
            <span className="atp08-bar-fill is-in" style={{ width: `${Math.min(100, (r.icIn / BAR) * 100)}%` }} />
          </span>
          <b>{f(r.icIn)}</b>
        </div>
        <div className="atp08-bar-row">
          <span className="atp08-bar-lab">
            <span data-lang-en>Rank IC on 40 months it never saw</span>
            <span data-lang-vi>Rank IC trên 40 tháng nó chưa thấy</span>
          </span>
          <span className="atp08-bar-track">
            <span className="atp08-bar-fill is-out" style={{ width: `${Math.max(0.6, Math.min(100, (r.icOos / BAR) * 100))}%` }} />
          </span>
          <b>{f(r.icOos)}</b>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>Gap: memorised minus real</span><span data-lang-vi>Chênh: thuộc lòng trừ thật</span></span>
          <b className={overfit > 0.1 ? 'atp08-bad' : ''}>{f(overfit)}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Top minus bottom decile, unseen months</span><span data-lang-vi>Decile đầu trừ cuối, tháng chưa thấy</span></span>
          <b>{r.spread.toFixed(2)}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Best unseen IC for this model</span><span data-lang-vi>IC chưa thấy tốt nhất của mô hình này</span></span>
          <b className={isBest ? 'atp08-good' : ''}>{f(best)}</b>
        </div>
      </div>
    </div>
  );
}
