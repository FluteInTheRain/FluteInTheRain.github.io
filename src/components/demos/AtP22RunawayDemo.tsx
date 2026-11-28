import React, { useId, useState } from 'react';

// Knight Capital, 1 Aug 2012 (SEC Release 34-70694): about $460 million lost in about 45 minutes.
// The demo assumes the loss grew in a straight line at the average rate, 460 / 45 = 10.22 million a minute.
// Each control only changes when the orders stop. Checked against a Python run (see the post notes).

export const TOTAL_LOSS = 460; // $ million, SEC
export const TOTAL_MIN = 45; // minutes, SEC
export const RATE = TOTAL_LOSS / TOTAL_MIN;

export const CAPS = [0, 10, 25, 50, 100]; // 0 = no automatic cap, $ million

export function stopMinute(opts: { person: number; cap: number; monitor: boolean; alerts: boolean }): number {
  if (opts.alerts) return 0;
  let m = Math.min(opts.person, TOTAL_MIN);
  if (opts.cap > 0) m = Math.min(m, opts.cap / RATE);
  if (opts.monitor) m = Math.min(m, 1);
  return m;
}

export const lossAt = (m: number) => RATE * m;

const fmtM = (x: number) => `$${x.toFixed(1)}M`;

export default function AtP22RunawayDemo() {
  const pId = useId();
  const cId = useId();
  const [person, setPerson] = useState(45);
  const [capI, setCapI] = useState(0);
  const [monitor, setMonitor] = useState(false);
  const [alerts, setAlerts] = useState(false);

  const cap = CAPS[capI];
  const m = stopMinute({ person, cap, monitor, alerts });
  const loss = lossAt(m);

  const W = 640, H = 220, PL = 44, PR = 12, PT = 14, PB = 28;
  const X = (t: number) => PL + (t / TOTAL_MIN) * (W - PL - PR);
  const Y = (v: number) => H - PB - (v / TOTAL_LOSS) * (H - PT - PB);

  return (
    <div className="sd atp22">
      <div className="atp22-controls">
        <div>
          <div className="atp22-row">
            <label htmlFor={pId} className="atp22-lbl">
              <span data-lang-en>A person notices and stops it after</span>
              <span data-lang-vi>Một người nhận ra và dừng sau</span>
            </label>
            <span className="atp22-val">{person >= TOTAL_MIN ? '45+' : person} <span data-lang-en>min</span><span data-lang-vi>phút</span></span>
          </div>
          <input id={pId} className="atp22-range" type="range" min={1} max={TOTAL_MIN} step={1} value={person} onChange={(e) => setPerson(Number(e.target.value))} />
        </div>
        <div>
          <div className="atp22-row">
            <label htmlFor={cId} className="atp22-lbl">
              <span data-lang-en>Automatic loss cap</span>
              <span data-lang-vi>Trần lỗ tự động</span>
            </label>
            <span className="atp22-val">{cap === 0 ? '—' : `$${cap}M`}</span>
          </div>
          <input id={cId} className="atp22-range" type="range" min={0} max={CAPS.length - 1} step={1} value={capI} onChange={(e) => setCapI(Number(e.target.value))} />
        </div>
        <div className="sd-group">
          <button type="button" className={monitor ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={monitor} onClick={() => setMonitor((v) => !v)}>
            <span data-lang-en>Orders-out vs orders-in monitor (trips in 1 min)</span>
            <span data-lang-vi>Giám sát lệnh ra so với lệnh vào (chạy sau 1 phút)</span>
          </button>
          <button type="button" className={alerts ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={alerts} onClick={() => setAlerts((v) => !v)}>
            <span data-lang-en>The 8:01 e-mails count as alerts</span>
            <span data-lang-vi>E-mail 8:01 được coi là cảnh báo</span>
          </button>
        </div>
      </div>

      <svg className="atp22-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Loss growing in a straight line over 45 minutes; the line is shaded up to the minute the orders stop">
        <line x1={PL} x2={W - PR} y1={Y(0)} y2={Y(0)} className="atp22-axis" />
        <path d={`M${X(0)} ${Y(0)} L${X(TOTAL_MIN)} ${Y(TOTAL_LOSS)}`} className="atp22-full" />
        {m > 0 && <path d={`M${X(0)} ${Y(0)} L${X(m)} ${Y(loss)} L${X(m)} ${Y(0)} Z`} className="atp22-area" />}
        <line x1={X(m)} x2={X(m)} y1={PT} y2={Y(0)} className="atp22-stop" />
        <circle cx={X(m)} cy={Y(loss)} r="4.5" className="atp22-dot" />
        <text x={PL - 6} y={Y(TOTAL_LOSS) + 4} textAnchor="end" className="atp22-tick">$460M</text>
        <text x={PL - 6} y={Y(0) + 4} textAnchor="end" className="atp22-tick">0</text>
        <text x={W - PR} y={H - 8} textAnchor="end" className="atp22-tick">45 min</text>
        <text x={PL} y={H - 8} className="atp22-tick">0</text>
      </svg>
      <p className="atp22-legend">
        <span data-lang-en>Grey line: what happened (about $10.2 million a minute for 45 minutes, a straight-line assumption). Filled area: what you lose with the controls you switched on.</span>
        <span data-lang-vi>Đường xám: điều đã xảy ra (khoảng 10,2 triệu USD mỗi phút trong 45 phút, giả định đường thẳng). Vùng tô: mức lỗ với các kiểm soát bạn đã bật.</span>
      </p>

      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>Orders stop at</span><span data-lang-vi>Lệnh dừng lúc</span></span>
          <b>{m.toFixed(1)} <span data-lang-en>min</span><span data-lang-vi>phút</span></b>
        </div>
        <div className={loss > 0 ? 'sd-stat is-bad' : 'sd-stat is-good'}>
          <span><span data-lang-en>Loss</span><span data-lang-vi>Lỗ</span></span>
          <b>{fmtM(loss)}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Share of the real loss</span><span data-lang-vi>So với mức lỗ thật</span></span>
          <b>{((loss / TOTAL_LOSS) * 100).toFixed(1)}%</b>
        </div>
      </div>
    </div>
  );
}
