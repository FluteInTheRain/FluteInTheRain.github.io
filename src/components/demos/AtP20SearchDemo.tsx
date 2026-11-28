import React, { useMemo, useState } from 'react';

// A tiny genetic search on a market that is pure noise (mulberry32 seeds 1 to 6, 1,500 simulated days,
// daily moves of 1% scale). Days 100-749 are the search window, days 750-1499 are never seen by the search.
// The Python run in the post brief (gp.py) uses the same generator and gives identical numbers.

const SIZES = [3, 8, 5, 2, 4, 3];
const AW = [1, 2, 3, 5, 8, 10, 15, 20];
const BW = [5, 10, 20, 40, 60];
const TH = [0, 0.25, 0.5, 1.0];
const N = 1500, IS_END = 750, T0 = 100, POP = 40, GENS = 15, ELITE = 10, PARENTS = 20;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sharpe(x: number[]) {
  const n = x.length;
  let m = 0;
  for (const v of x) m += v;
  m /= n;
  let s = 0;
  for (const v of x) s += (v - m) * (v - m);
  s /= n;
  return s <= 0 ? 0 : (m / Math.sqrt(s)) * Math.sqrt(252);
}

type Genome = number[];
interface Step { gen: number; tried: number; is: number; oos: number; genome: Genome }

function runSearch(seed: number): Step[] {
  const next = rng(seed);
  const r: number[] = [];
  for (let i = 0; i < N; i++) {
    let s = 0;
    for (let j = 0; j < 12; j++) s += next();
    r.push(0.01 * (s - 6));
  }
  const S = [0], Q = [0];
  for (const x of r) { S.push(S[S.length - 1] + x); Q.push(Q[Q.length - 1] + x * x); }
  const cache = new Map<string, [number, number]>();
  const ev = (g: Genome): [number, number] => {
    const key = g.join(',');
    let c = cache.get(key);
    if (!c) {
      const [kind, ai, bi, flip, thi, li] = g;
      const a = AW[ai], b = BW[bi], th = TH[thi], L = li + 1, sg = flip === 0 ? 1 : -1;
      const rets: number[] = [];
      for (let t = T0; t < N; t++) {
        const e = t - L;
        const ma = (S[e + 1] - S[e + 1 - a]) / a;
        const mb = (S[e + 1] - S[e + 1 - b]) / b;
        const v = (Q[e + 1] - Q[e + 1 - b]) / b - mb * mb;
        const sd = v > 0 ? Math.sqrt(v) : 0;
        const f = kind === 0 ? ma : kind === 1 ? r[e] - mb : ma - mb;
        let pos = 0;
        if (Math.abs(f) > th * sd && f !== 0) pos = sg * (f > 0 ? 1 : -1);
        rets.push(pos * r[t]);
      }
      const k = IS_END - T0;
      c = [sharpe(rets.slice(0, k)), sharpe(rets.slice(k))];
      cache.set(key, c);
    }
    return c;
  };
  let pop: Genome[] = [];
  for (let i = 0; i < POP; i++) pop.push(SIZES.map((sz) => Math.floor(next() * sz)));
  let best: Genome | null = null;
  const out: Step[] = [];
  for (let gen = 0; gen <= GENS; gen++) {
    const order = pop.map((_, i) => i).sort((i, j) => ev(pop[j])[0] - ev(pop[i])[0] || i - j);
    const top = pop[order[0]];
    if (best === null || ev(top)[0] > ev(best)[0]) best = top;
    const e = ev(best);
    out.push({ gen, tried: cache.size, is: Math.round(e[0] * 100) / 100, oos: Math.round(e[1] * 100) / 100, genome: [...best] });
    if (gen === GENS) break;
    const ranked = order.map((i) => pop[i]);
    const nxt: Genome[] = ranked.slice(0, ELITE).map((g) => [...g]);
    while (nxt.length < POP) {
      const pa = ranked[Math.floor(next() * PARENTS)];
      const pb = ranked[Math.floor(next() * PARENTS)];
      const ch = SIZES.map((_, i) => (next() < 0.5 ? pa[i] : pb[i]));
      const gi = Math.floor(next() * 6);
      ch[gi] = Math.floor(next() * SIZES[gi]);
      nxt.push(ch);
    }
    pop = nxt;
  }
  return out;
}

const fmt = (x: number, vi: boolean) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(2).replace('.', vi ? ',' : '.');

function describe(g: Genome) {
  const [kind, ai, bi, flip, thi, li] = g;
  const a = AW[ai], b = BW[bi];
  const core = [
    [`the last ${a}-day average return`, `lợi suất trung bình ${a} ngày gần nhất`],
    [`the last day's return against the ${b}-day average`, `lợi suất hôm qua so với trung bình ${b} ngày`],
    [`the ${a}-day average minus the ${b}-day average`, `trung bình ${a} ngày trừ trung bình ${b} ngày`],
  ][kind];
  const dir = flip === 0 ? ['Follow', 'Đi theo'] : ['Bet against', 'Đánh ngược'];
  const th = TH[thi] === 0 ? ['always trade', 'luôn vào lệnh'] : [`trade only when it is more than ${TH[thi]} daily deviations away`, `chỉ vào lệnh khi lệch hơn ${TH[thi]} độ lệch chuẩn ngày`];
  return {
    en: `${dir[0]} ${core[0]}; ${th[0]}; act ${li + 1} day${li ? 's' : ''} after the data.`,
    vi: `${dir[1]} ${core[1]}; ${th[1]}; vào lệnh sau dữ liệu ${li + 1} ngày.`,
  };
}

export default function AtP20SearchDemo() {
  const [seed, setSeed] = useState(1);
  const [gen, setGen] = useState(GENS);
  const runs = useMemo(() => [1, 2, 3, 4, 5, 6].map((s) => runSearch(s)), []);
  const run = runs[seed - 1];
  const cur = run[gen];
  const mean = (f: (s: Step) => number) => runs.reduce((a, r) => a + f(r[gen]), 0) / runs.length;
  const d = describe(cur.genome);
  const W = 600, H = 210, x0 = 40, x1 = 580, y0 = 20, y1 = 180, lo = -2, hi = 3;
  const X = (g: number) => x0 + (g / GENS) * (x1 - x0);
  const Y = (v: number) => y1 - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (y1 - y0);
  const line = (f: (s: Step) => number) => run.map((s, i) => `${i ? 'L' : 'M'} ${X(s.gen).toFixed(1)} ${Y(f(s)).toFixed(1)}`).join(' ');
  return (
    <div className="sd atp20">
      <div className="sd-controls">
        <div className="sd-group">
          <span><span data-lang-en>Simulated market</span><span data-lang-vi>Thị trường mô phỏng</span></span>
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <button key={s} type="button" className={seed === s ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={seed === s} onClick={() => setSeed(s)}>{s}</button>
          ))}
        </div>
        <div className="sd-group">
          <label htmlFor="atp20-gen">
            <span data-lang-en>Generation</span><span data-lang-vi>Thế hệ</span>: <b>{gen}</b>
          </label>
          <input id="atp20-gen" type="range" min={0} max={GENS} value={gen} onChange={(e) => setGen(Number(e.target.value))} />
        </div>
      </div>
      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>Formulas tried so far</span><span data-lang-vi>Công thức đã thử</span></span>
          <b>{cur.tried}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Best Sharpe on the search window</span><span data-lang-vi>Sharpe tốt nhất trên đoạn tìm kiếm</span></span>
          <b>{fmt(cur.is, false)}</b>
        </div>
        <div className={cur.oos < 0.5 ? 'sd-stat is-bad' : 'sd-stat'}>
          <span><span data-lang-en>Same formula on unseen days</span><span data-lang-vi>Cùng công thức trên ngày chưa thấy</span></span>
          <b>{fmt(cur.oos, false)}</b>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="atp20-chart" role="img" aria-label="Best in-sample Sharpe and out-of-sample Sharpe of the same formula, by generation">
        {[-2, -1, 0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={x0} x2={x1} y1={Y(v)} y2={Y(v)} style={{ stroke: v === 0 ? 'var(--text-muted)' : 'var(--border)', strokeDasharray: v === 0 ? '' : '3 4' }} />
            <text x={x0 - 6} y={Y(v) + 4} textAnchor="end" className="atp20-t">{v}</text>
          </g>
        ))}
        <path d={line((s) => s.is)} style={{ stroke: 'var(--gold)', strokeWidth: 2.5, fill: 'none' }} />
        <path d={line((s) => s.oos)} style={{ stroke: 'var(--red)', strokeWidth: 2.5, fill: 'none' }} />
        <line x1={X(gen)} x2={X(gen)} y1={y0} y2={y1} style={{ stroke: 'var(--text-muted)', strokeDasharray: '4 3' }} />
        <circle cx={X(gen)} cy={Y(cur.is)} r={4.5} style={{ fill: 'var(--gold)' }} />
        <circle cx={X(gen)} cy={Y(cur.oos)} r={4.5} style={{ fill: 'var(--red)' }} />
        <text x={x0} y={H - 8} className="atp20-t"><tspan data-lang-en>generation 0</tspan><tspan data-lang-vi>thế hệ 0</tspan></text>
        <text x={x1} y={H - 8} textAnchor="end" className="atp20-t">{GENS}</text>
      </svg>
      <p className="atp20-key">
        <span style={{ color: 'var(--gold-icon)' }}>● <span data-lang-en>search window (the search sees it)</span><span data-lang-vi>đoạn tìm kiếm (thuật toán thấy)</span></span>
        <span style={{ color: 'var(--red)' }}>● <span data-lang-en>unseen days</span><span data-lang-vi>ngày chưa thấy</span></span>
      </p>
      <p className="atp20-rule">
        <b><span data-lang-en>Best rule so far:</span><span data-lang-vi>Quy tắc tốt nhất hiện tại:</span></b>{' '}
        <span data-lang-en>{d.en}</span><span data-lang-vi>{d.vi}</span>
      </p>
      <p className="atp20-note">
        <span data-lang-en>Average over the six markets at this generation: {fmt(mean((s) => s.is), false)} on the search window, {fmt(mean((s) => s.oos), false)} on unseen days. Every market is pure noise, so the true Sharpe of every rule is 0.</span>
        <span data-lang-vi>Trung bình sáu thị trường ở thế hệ này: {fmt(mean((s) => s.is), true)} trên đoạn tìm kiếm, {fmt(mean((s) => s.oos), true)} trên ngày chưa thấy. Mọi thị trường đều là nhiễu thuần, nên Sharpe thật của mọi quy tắc bằng 0.</span>
      </p>
    </div>
  );
}
