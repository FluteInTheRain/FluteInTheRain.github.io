import React, { useMemo, useState } from 'react';

// Simulated returns: 12 assets in 3 groups of 4, one market factor + one group factor + own noise
// (Python, numpy seed 2026, 1,000 days). Each entry is what you would estimate from the FIRST T days:
// sd = daily standard deviation in %, C = correlation matrix (4 decimals).
const DATA = {"names":["B1","B2","B3","B4","S1","S2","S3","S4","R1","R2","R3","R4"],"sect":[0,0,0,0,1,1,1,1,2,2,2,2],"T":{"20":{"C":[[1.0,0.4911,0.6171,0.4591,0.1027,0.405,0.0706,-0.1636,-0.027,0.014,-0.0788,0.1412],[0.4911,1.0,0.5969,0.3566,0.1282,0.5652,0.4936,0.1239,-0.0131,-0.0912,0.14,0.027],[0.6171,0.5969,1.0,0.4861,0.1607,0.5099,0.1332,0.042,0.0079,-0.0497,-0.0516,0.348],[0.4591,0.3566,0.4861,1.0,0.0053,0.3289,0.1554,-0.167,0.4237,0.1942,0.1585,0.3546],[0.1027,0.1282,0.1607,0.0053,1.0,0.6726,0.6983,0.6693,0.1345,0.3712,0.3902,0.1444],[0.405,0.5652,0.5099,0.3289,0.6726,1.0,0.656,0.5711,-0.0965,0.1814,0.1543,0.1053],[0.0706,0.4936,0.1332,0.1554,0.6983,0.656,1.0,0.648,0.1573,0.372,0.4554,0.1136],[-0.1636,0.1239,0.042,-0.167,0.6693,0.5711,0.648,1.0,-0.2168,0.0346,0.0269,-0.1733],[-0.027,-0.0131,0.0079,0.4237,0.1345,-0.0965,0.1573,-0.2168,1.0,0.7633,0.7036,0.6447],[0.014,-0.0912,-0.0497,0.1942,0.3712,0.1814,0.372,0.0346,0.7633,1.0,0.7901,0.7437],[-0.0788,0.14,-0.0516,0.1585,0.3902,0.1543,0.4554,0.0269,0.7036,0.7901,1.0,0.5828],[0.1412,0.027,0.348,0.3546,0.1444,0.1053,0.1136,-0.1733,0.6447,0.7437,0.5828,1.0]],"sd":[0.824,0.947,0.915,1.025,2.612,2.18,1.949,1.636,1.78,1.862,1.665,1.86]},"60":{"C":[[1.0,0.7067,0.6584,0.7224,0.1933,0.2497,0.1664,0.2271,0.2362,0.3858,0.3091,0.275],[0.7067,1.0,0.7775,0.6888,0.2241,0.2972,0.2713,0.2644,0.2189,0.3397,0.3916,0.218],[0.6584,0.7775,1.0,0.655,0.2837,0.347,0.2565,0.2456,0.2294,0.3189,0.2938,0.3132],[0.7224,0.6888,0.655,1.0,0.1375,0.1725,0.0962,0.1066,0.2676,0.4004,0.3231,0.2478],[0.1933,0.2241,0.2837,0.1375,1.0,0.6478,0.6578,0.6143,0.3097,0.3756,0.4496,0.3491],[0.2497,0.2972,0.347,0.1725,0.6478,1.0,0.6491,0.6624,0.1175,0.2551,0.1719,0.2612],[0.1664,0.2713,0.2565,0.0962,0.6578,0.6491,1.0,0.6664,0.346,0.4429,0.4294,0.3901],[0.2271,0.2644,0.2456,0.1066,0.6143,0.6624,0.6664,1.0,0.2777,0.3272,0.2823,0.3118],[0.2362,0.2189,0.2294,0.2676,0.3097,0.1175,0.346,0.2777,1.0,0.7053,0.7212,0.7329],[0.3858,0.3397,0.3189,0.4004,0.3756,0.2551,0.4429,0.3272,0.7053,1.0,0.6797,0.7274],[0.3091,0.3916,0.2938,0.3231,0.4496,0.1719,0.4294,0.2823,0.7212,0.6797,1.0,0.642],[0.275,0.218,0.3132,0.2478,0.3491,0.2612,0.3901,0.3118,0.7329,0.7274,0.642,1.0]],"sd":[1.056,1.306,1.136,1.226,2.278,2.448,1.926,1.966,1.779,1.789,1.654,1.79]},"250":{"C":[[1.0,0.6918,0.6808,0.6797,0.2535,0.2814,0.2296,0.2723,0.1558,0.1701,0.1648,0.1634],[0.6918,1.0,0.7518,0.6888,0.3338,0.3256,0.2745,0.2949,0.2031,0.1995,0.2486,0.1628],[0.6808,0.7518,1.0,0.7039,0.3078,0.3135,0.2615,0.2979,0.2247,0.2101,0.2226,0.2034],[0.6797,0.6888,0.7039,1.0,0.2962,0.312,0.2663,0.2504,0.2061,0.1987,0.23,0.2071],[0.2535,0.3338,0.3078,0.2962,1.0,0.6768,0.6961,0.7016,0.2635,0.2338,0.2561,0.2314],[0.2814,0.3256,0.3135,0.312,0.6768,1.0,0.6812,0.6971,0.2472,0.2526,0.2368,0.2658],[0.2296,0.2745,0.2615,0.2663,0.6961,0.6812,1.0,0.7065,0.2761,0.2608,0.2623,0.3001],[0.2723,0.2949,0.2979,0.2504,0.7016,0.6971,0.7065,1.0,0.337,0.2993,0.2586,0.2737],[0.1558,0.2031,0.2247,0.2061,0.2635,0.2472,0.2761,0.337,1.0,0.7134,0.7432,0.707],[0.1701,0.1995,0.2101,0.1987,0.2338,0.2526,0.2608,0.2993,0.7134,1.0,0.6813,0.6967],[0.1648,0.2486,0.2226,0.23,0.2561,0.2368,0.2623,0.2586,0.7432,0.6813,1.0,0.7073],[0.1634,0.1628,0.2034,0.2071,0.2314,0.2658,0.3001,0.2737,0.707,0.6967,0.7073,1.0]],"sd":[1.167,1.173,1.175,1.174,2.331,2.381,2.322,2.319,1.875,1.743,1.795,1.874]},"1000":{"C":[[1.0,0.7139,0.7182,0.7124,0.2663,0.2721,0.2628,0.2648,0.2055,0.206,0.1951,0.2089],[0.7139,1.0,0.7227,0.7226,0.2808,0.2915,0.2734,0.2901,0.2388,0.2326,0.2495,0.244],[0.7182,0.7227,1.0,0.728,0.2794,0.2733,0.2757,0.2984,0.2483,0.2156,0.211,0.2078],[0.7124,0.7226,0.728,1.0,0.2778,0.2705,0.2648,0.2757,0.229,0.23,0.2166,0.2171],[0.2663,0.2808,0.2794,0.2778,1.0,0.7153,0.7112,0.7338,0.2481,0.2466,0.2407,0.2397],[0.2721,0.2915,0.2733,0.2705,0.7153,1.0,0.7031,0.7255,0.2663,0.2543,0.234,0.2813],[0.2628,0.2734,0.2757,0.2648,0.7112,0.7031,1.0,0.7269,0.2581,0.2333,0.2365,0.2687],[0.2648,0.2901,0.2984,0.2757,0.7338,0.7255,0.7269,1.0,0.279,0.281,0.2705,0.2889],[0.2055,0.2388,0.2483,0.229,0.2481,0.2663,0.2581,0.279,1.0,0.678,0.6946,0.6916],[0.206,0.2326,0.2156,0.23,0.2466,0.2543,0.2333,0.281,0.678,1.0,0.6713,0.6736],[0.1951,0.2495,0.211,0.2166,0.2407,0.234,0.2365,0.2705,0.6946,0.6713,1.0,0.6819],[0.2089,0.244,0.2078,0.2171,0.2397,0.2813,0.2687,0.2889,0.6916,0.6736,0.6819,1.0]],"sd":[1.201,1.201,1.201,1.201,2.401,2.401,2.401,2.401,1.801,1.801,1.801,1.801]}}};

type Method = 'single' | 'average' | 'ward';
const TS = ['20', '60', '250', '1000'] as const;
const METHODS: Method[] = ['single', 'average', 'ward'];
const N = 12;
const SECT = DATA.sect as number[];
const NAMES = DATA.names as string[];
const SECT_NAME_EN = ['Banks', 'Steel', 'Retail'];
const SECT_NAME_VI = ['Ngân hàng', 'Thép', 'Bán lẻ'];
const SECT_VAR = ['var(--act-3)', 'var(--act-1)', 'var(--act-2)'];

interface Merge { a: number; b: number; h: number }

function agglo(D: number[][], method: Method): Merge[] {
  const dm = new Map<string, number>();
  const key = (a: number, b: number) => (a < b ? `${a},${b}` : `${b},${a}`);
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) dm.set(key(i, j), D[i][j]);
  const sz = new Map<number, number>();
  for (let i = 0; i < N; i++) sz.set(i, 1);
  let act = Array.from({ length: N }, (_, i) => i);
  const Z: Merge[] = [];
  let nxt = N;
  for (let step = 0; step < N - 1; step++) {
    let best: [number, number, number] | null = null;
    for (let i = 0; i < act.length; i++) {
      for (let j = i + 1; j < act.length; j++) {
        const v = dm.get(key(act[i], act[j]))!;
        if (best === null || v < best[0] - 1e-12) best = [v, act[i], act[j]];
      }
    }
    const [v, a, b] = best!;
    Z.push({ a, b, h: v });
    const nu = nxt++;
    for (const c of act) {
      if (c === a || c === b) continue;
      const dac = dm.get(key(a, c))!;
      const dbc = dm.get(key(b, c))!;
      const na = sz.get(a)!, nb = sz.get(b)!, nc = sz.get(c)!;
      let x: number;
      if (method === 'single') x = Math.min(dac, dbc);
      else if (method === 'average') x = (na * dac + nb * dbc) / (na + nb);
      else x = Math.sqrt(((na + nc) * dac * dac + (nb + nc) * dbc * dbc - nc * v * v) / (na + nb + nc));
      dm.set(key(nu, c), x);
    }
    sz.set(nu, sz.get(a)! + sz.get(b)!);
    act = act.filter((c) => c !== a && c !== b).concat([nu]);
  }
  return Z;
}

function leavesOf(Z: Merge[], node: number): number[] {
  if (node < N) return [node];
  const m = Z[node - N];
  return leavesOf(Z, m.a).concat(leavesOf(Z, m.b));
}

// order of leaves as in Lopez de Prado's quasi-diagonalisation
function quasi(Z: Merge[]): number[] {
  let out = [Z[Z.length - 1].a, Z[Z.length - 1].b];
  while (out.some((x) => x >= N)) {
    const next: number[] = [];
    for (const x of out) {
      if (x >= N) next.push(Z[x - N].a, Z[x - N].b);
      else next.push(x);
    }
    out = next;
  }
  return out;
}

function clusterVar(V: number[][], idx: number[]): number {
  const w = idx.map((i) => 1 / V[i][i]);
  const s = w.reduce((p, c) => p + c, 0);
  const wn = w.map((x) => x / s);
  let v = 0;
  for (let a = 0; a < idx.length; a++) for (let b = 0; b < idx.length; b++) v += wn[a] * wn[b] * V[idx[a]][idx[b]];
  return v;
}

function hrp(V: number[][], order: number[]): number[] {
  const w = new Array(N).fill(1);
  let items: number[][] = [order];
  while (items.length) {
    const next: number[][] = [];
    for (const it of items) {
      if (it.length > 1) {
        const h = Math.floor(it.length / 2);
        next.push(it.slice(0, h), it.slice(h));
      }
    }
    items = next;
    for (let i = 0; i < items.length; i += 2) {
      const a = items[i], b = items[i + 1];
      const va = clusterVar(V, a), vb = clusterVar(V, b);
      const al = 1 - va / (va + vb);
      a.forEach((x) => (w[x] *= al));
      b.forEach((x) => (w[x] *= 1 - al));
    }
  }
  return w;
}

function cutThree(Z: Merge[]): number[][] {
  let nodes = [2 * N - 2];
  const height = (x: number) => Z[x - N].h;
  while (nodes.length < 3) {
    nodes.sort((p, q) => height(q) - height(p));
    const top = nodes.shift()!;
    nodes = nodes.concat([Z[top - N].a, Z[top - N].b]);
  }
  return nodes.map((nd) => leavesOf(Z, nd));
}

function compute(t: string, method: Method) {
  const C = DATA.T[t].C as number[][];
  const sd = DATA.T[t].sd as number[];
  const D = C.map((row) => row.map((r) => Math.sqrt(0.5 * (1 - r))));
  const V = C.map((row, i) => row.map((r, j) => sd[i] * sd[j] * r));
  const Z = agglo(D, method);
  const order = quasi(Z);
  const w = hrp(V, order);
  const groups = cutThree(Z);
  let misplaced = 0;
  for (const g of groups) {
    const cnt = [0, 0, 0];
    g.forEach((i) => cnt[SECT[i]]++);
    misplaced += g.length - Math.max(...cnt);
  }
  const iv = sd.map((s) => 1 / (s * s));
  const ivs = iv.reduce((p, c) => p + c, 0);
  return { order, w, groups, misplaced, iv: iv.map((x) => x / ivs) };
}

const pct = (x: number, vi: boolean) => (x * 100).toLocaleString(vi ? 'vi-VN' : 'en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

export default function AtP10HrpDemo() {
  const [t, setT] = useState<string>('250');
  const [method, setMethod] = useState<Method>('ward');
  const r = useMemo(() => compute(t, method), [t, method]);
  const maxW = Math.max(...r.w, ...r.iv);
  const sizes = r.groups.map((g) => g.length).sort((a, b) => b - a);

  return (
    <div className="sd atp10">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Days of history</span>
            <span data-lang-vi>Số ngày dữ liệu</span>
          </span>
          {TS.map((x) => (
            <button key={x} type="button" className={t === x ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={t === x} onClick={() => setT(x)}>
              {x}
            </button>
          ))}
        </div>
        <div className="sd-group">
          <span>
            <span data-lang-en>Linkage</span>
            <span data-lang-vi>Cách nối cụm</span>
          </span>
          {METHODS.map((m) => (
            <button key={m} type="button" className={method === m ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={method === m} onClick={() => setMethod(m)}>
              {m === 'single' ? (<><span data-lang-en>single</span><span data-lang-vi>single (gần nhất)</span></>) : m === 'average' ? (<><span data-lang-en>average</span><span data-lang-vi>average (trung bình)</span></>) : 'Ward'}
            </button>
          ))}
        </div>
      </div>

      <p className="atp10-h">
        <span data-lang-en>Three groups found (colour = the sector the asset really belongs to)</span>
        <span data-lang-vi>Ba nhóm tìm được (màu = ngành thật của mã)</span>
      </p>
      <div className="atp10-groups">
        {r.groups.map((g, k) => (
          <div key={k} className="atp10-group">
            {g.map((i) => (
              <span key={i} className="atp10-chip" style={{ borderColor: SECT_VAR[SECT[i]], color: SECT_VAR[SECT[i]] }}>{NAMES[i]}</span>
            ))}
          </div>
        ))}
      </div>
      <p className="atp10-key">
        {SECT_VAR.map((c, k) => (
          <span key={k} className="atp10-keyi" style={{ color: c }}>
            ● <span data-lang-en>{SECT_NAME_EN[k]}</span><span data-lang-vi>{SECT_NAME_VI[k]}</span>
          </span>
        ))}
      </p>

      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>Group sizes</span><span data-lang-vi>Cỡ các nhóm</span></span>
          <b>{sizes.join(' / ')}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Assets in the wrong group</span><span data-lang-vi>Mã nằm sai nhóm</span></span>
          <b>{r.misplaced}</b>
        </div>
      </div>

      <p className="atp10-h">
        <span data-lang-en>Weights in tree order: HRP (solid) against inverse-variance (outline)</span>
        <span data-lang-vi>Tỷ trọng theo thứ tự cây: HRP (đặc) so với nghịch đảo phương sai (viền)</span>
      </p>
      <div className="atp10-bars" role="img" aria-label="HRP and inverse-variance weights by asset">
        {r.order.map((i) => (
          <div key={i} className="atp10-col">
            <div className="atp10-barwrap">
              <div className="atp10-iv" style={{ height: `${(r.iv[i] / maxW) * 100}%` }} />
              <div className="atp10-w" style={{ height: `${(r.w[i] / maxW) * 100}%`, background: SECT_VAR[SECT[i]] }} />
            </div>
            <span className="atp10-name">{NAMES[i]}</span>
            <span className="atp10-pct">
              <span data-lang-en>{pct(r.w[i], false)}</span>
              <span data-lang-vi>{pct(r.w[i], true)}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="atp10-note">
        <span data-lang-en>Simulated data. With 20 days, single linkage chains one group onto another; Ward and average still find the three groups.</span>
        <span data-lang-vi>Dữ liệu mô phỏng. Với 20 ngày, single linkage nối dây chuyền hai nhóm làm một; Ward và average vẫn tìm đúng ba nhóm.</span>
      </p>
    </div>
  );
}
