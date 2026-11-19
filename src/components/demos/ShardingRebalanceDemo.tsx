import React, { useMemo, useState } from 'react';

// Interactive sharding & rebalancing playground:
// Compares hash(key) % N, Fixed Logical Shards (24), and Consistent Hashing (16 vnodes/node)
// across deterministic keys k00..k59, plus a simulated celebrity hot key (@taylor) with optional
// key salting (#00..#09). First render is 100% deterministic so SSR and client match.

type Strategy = 'mod' | 'fixed' | 'consistent';

const MIN_NODES = 2;
const MAX_NODES = 6;
const NUM_KEYS = 60;
const FIXED_SHARDS = 24;
const VNODES_PER_NODE = 32;
const SALT_BUCKETS = 10;
const HOT_KEY = '@taylor';
const HOT_REQS = 40;

const BASE_KEYS = Array.from({ length: NUM_KEYS }, (_, i) => `k${String(i).padStart(2, '0')}`);

function hash32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Murmur3 fmix32 avalanche so similar node/key strings spread across the full 32-bit ring
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// Deterministic mapping from 24 logical shards to n physical nodes (n = 2..6),
// mirroring a cluster that steals minimal whole shards when adding a node.
function fixedShardOwners(n: number): number[] {
  // Base n = 3: 8 contiguous shards per node
  const owners = Array.from({ length: FIXED_SHARDS }, (_, s) => Math.floor(s / 8));
  if (n === 2) {
    // Reassign node 2's 8 shards evenly to nodes 0 and 1
    for (let s = 16; s < 24; s++) owners[s] = s % 2;
    return owners;
  }
  if (n >= 4) {
    // Move 2 shards from each of 0, 1, 2 to node 3 -> [6, 6, 6, 6]
    [6, 7, 14, 15, 22, 23].forEach((s) => (owners[s] = 3));
  }
  if (n >= 5) {
    // Move 1 shard each from 0,1,2,3 plus 1 more from 0 to node 4 -> [4, 5, 5, 5, 5]
    [4, 5, 13, 21, 23].forEach((s) => (owners[s] = 4));
  }
  if (n >= 6) {
    // Move 1 shard each from 1,2,3,4 to node 5 -> [4, 4, 4, 4, 4, 4]
    [12, 20, 22, 23].forEach((s) => (owners[s] = 5));
  }
  return owners;
}

type VNode = { pos: number; node: number };

function buildRing(n: number): VNode[] {
  const ring: VNode[] = [];
  for (let node = 0; node < n; node++) {
    for (let v = 0; v < VNODES_PER_NODE; v++) {
      ring.push({ pos: hash32(`node-${node}-vn-${v}`), node });
    }
  }
  ring.sort((a, b) => a.pos - b.pos);
  return ring;
}

function ownerConsistent(key: string, ring: VNode[]): number {
  const h = hash32(key);
  let lo = 0;
  let hi = ring.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (ring[mid].pos >= h) hi = mid - 1;
    else lo = mid + 1;
  }
  return ring[lo < ring.length ? lo : 0].node;
}

function assignKeys(keys: string[], strategy: Strategy, n: number): Map<string, number> {
  const out = new Map<string, number>();
  if (strategy === 'mod') {
    for (const k of keys) out.set(k, hash32(k) % n);
  } else if (strategy === 'fixed') {
    const owners = fixedShardOwners(n);
    for (const k of keys) out.set(k, owners[hash32(k) % FIXED_SHARDS]);
  } else {
    const ring = buildRing(n);
    for (const k of keys) out.set(k, ownerConsistent(k, ring));
  }
  return out;
}

export default function ShardingRebalanceDemo() {
  const [strategy, setStrategy] = useState<Strategy>('mod');
  const [nodes, setNodes] = useState<number>(4);
  const [resize, setResize] = useState<{ from: number; to: number }>({ from: 3, to: 4 });
  const [hotOn, setHotOn] = useState<boolean>(false);
  const [saltOn, setSaltOn] = useState<boolean>(false);

  const effectiveSalt = hotOn && saltOn;

  const { perNode, movedCount, maxLoad, fairLoad, totalReqs, hotKeysList } = useMemo(() => {
    const currMap = assignKeys(BASE_KEYS, strategy, nodes);
    const prevMap = resize.from !== resize.to ? assignKeys(BASE_KEYS, strategy, resize.from) : currMap;

    const hotEntries = hotOn
      ? effectiveSalt
        ? Array.from({ length: SALT_BUCKETS }, (_, i) => ({
            key: `${HOT_KEY}#${String(i).padStart(2, '0')}`,
            reqs: HOT_REQS / SALT_BUCKETS,
          }))
        : [{ key: HOT_KEY, reqs: HOT_REQS }]
      : [];

    const hotAssign = assignKeys(
      hotEntries.map((e) => e.key),
      strategy,
      nodes,
    );

    let moved = 0;
    const buckets = Array.from({ length: nodes }, () => ({
      keys: [] as { key: string; moved: boolean }[],
      hotReqs: 0,
      hotLabels: [] as string[],
    }));

    for (const k of BASE_KEYS) {
      const owner = currMap.get(k)!;
      const isMoved = resize.from !== resize.to && prevMap.get(k) !== owner;
      if (isMoved) moved += 1;
      buckets[owner].keys.push({ key: k, moved: isMoved });
    }

    for (const h of hotEntries) {
      const owner = hotAssign.get(h.key)!;
      buckets[owner].hotReqs += h.reqs;
      buckets[owner].hotLabels.push(h.key);
    }

    const total = NUM_KEYS + (hotOn ? HOT_REQS : 0);
    const loads = buckets.map((b) => b.keys.length + b.hotReqs);
    const maxL = Math.max(...loads);
    const fair = total / nodes;

    return {
      perNode: buckets,
      movedCount: moved,
      maxLoad: maxL,
      fairLoad: fair,
      totalReqs: total,
      hotKeysList: hotEntries,
    };
  }, [strategy, nodes, resize, hotOn, effectiveSalt]);

  const movedPct = ((movedCount / NUM_KEYS) * 100).toFixed(0);
  const skewRatio = maxLoad / fairLoad;
  const fixedOwners = strategy === 'fixed' ? fixedShardOwners(nodes) : null;

  const stepNodes = (delta: number) => {
    const next = Math.max(MIN_NODES, Math.min(MAX_NODES, nodes + delta));
    if (next !== nodes) {
      setResize({ from: nodes, to: next });
      setNodes(next);
    }
  };

  const resetAll = () => {
    setStrategy('mod');
    setNodes(4);
    setResize({ from: 3, to: 4 });
    setHotOn(false);
    setSaltOn(false);
  };

  return (
    <div className="sd shrd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Strategy</span>
            <span data-lang-vi>Chiến lược</span>
          </span>
          <button type="button" className={strategy === 'mod' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setStrategy('mod')}>
            hash(k) % N
          </button>
          <button type="button" className={strategy === 'fixed' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setStrategy('fixed')}>
            <span data-lang-en>Fixed shards ({FIXED_SHARDS})</span>
            <span data-lang-vi>Số shard cố định ({FIXED_SHARDS})</span>
          </button>
          <button type="button" className={strategy === 'consistent' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setStrategy('consistent')}>
            <span data-lang-en>Consistent hashing</span>
            <span data-lang-vi>Consistent hashing</span>
          </button>
        </div>

        <div className="sd-group">
          <span>
            <span data-lang-en>Cluster</span>
            <span data-lang-vi>Cụm máy</span>
          </span>
          <button type="button" className="sd-btn" disabled={nodes <= MIN_NODES} onClick={() => stepNodes(-1)}>
            <span data-lang-en>−1 node</span>
            <span data-lang-vi>−1 node</span>
          </button>
          <button type="button" className="sd-btn" disabled={nodes >= MAX_NODES} onClick={() => stepNodes(1)}>
            <span data-lang-en>+1 node</span>
            <span data-lang-vi>+1 node</span>
          </button>
          <button
            type="button"
            className={hotOn ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={hotOn}
            onClick={() => setHotOn(!hotOn)}
          >
            <span data-lang-en>Celebrity key ({HOT_KEY})</span>
            <span data-lang-vi>Hot key ({HOT_KEY})</span>
          </button>
          <button
            type="button"
            className={effectiveSalt ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={effectiveSalt}
            disabled={!hotOn}
            onClick={() => setSaltOn(!saltOn)}
          >
            <span data-lang-en>Salt #00..#09</span>
            <span data-lang-vi>Thêm muối #00..#09</span>
          </button>
          <button type="button" className="sd-btn" onClick={resetAll}>
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Làm lại</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>{resize.from} → {resize.to}</b>
          <span>
            <span data-lang-en>last resize (N = {nodes})</span>
            <span data-lang-vi>đổi cụm gần nhất (N = {nodes})</span>
          </span>
        </div>
        <div className={`sd-stat ${Number(movedPct) > 45 ? 'is-bad' : 'is-good'}`}>
          <b>{movedCount} / {NUM_KEYS} ({movedPct}%)</b>
          <span>
            <span data-lang-en>keys relocated</span>
            <span data-lang-vi>khoá phải di dời</span>
          </span>
        </div>
        <div className={`sd-stat ${skewRatio > 1.5 ? 'is-bad' : ''}`}>
          <b>{maxLoad} / {totalReqs}</b>
          <span>
            <span data-lang-en>hottest node reqs</span>
            <span data-lang-vi>tải node nóng nhất</span>
          </span>
        </div>
        <div className={`sd-stat ${effectiveSalt ? 'is-bad' : ''}`}>
          <b>{effectiveSalt ? SALT_BUCKETS : 1}</b>
          <span>
            <span data-lang-en>reads per {HOT_KEY} lookup</span>
            <span data-lang-vi>lần đọc để gom {HOT_KEY}</span>
          </span>
        </div>
      </div>

      <div className="shrd-msg" aria-live="polite">
        {hotOn ? (
          effectiveSalt ? (
            <>
              <span data-lang-en>
                Salting splits {HOT_KEY} across {SALT_BUCKETS} keys (<code>#00..#09</code>), dropping peak node load to {maxLoad} reqs — but every read for {HOT_KEY} now has to query and merge {SALT_BUCKETS} keys.
              </span>
              <span data-lang-vi>
                Thêm muối chia {HOT_KEY} thành {SALT_BUCKETS} khoá (<code>#00..#09</code>), kéo tải đỉnh xuống còn {maxLoad} request — đổi lại mỗi lần đọc {HOT_KEY} phải truy vấn rồi gộp cả {SALT_BUCKETS} khoá.
              </span>
            </>
          ) : (
            <>
              <span data-lang-en>
                Uniform hashing does not stop a hot key: all {HOT_REQS} extra requests for {HOT_KEY} still slam one node ({maxLoad} of {totalReqs} reqs) regardless of strategy.
              </span>
              <span data-lang-vi>
                Hàm băm đều không cứu được hot key: toàn bộ {HOT_REQS} request của {HOT_KEY} vẫn dồn lên đúng một node ({maxLoad} trên {totalReqs} request) bất kể chiến lược chia nào.
              </span>
            </>
          )
        ) : strategy === 'mod' ? (
          <>
            <span data-lang-en>
              Modulo N moved {movedCount} of {NUM_KEYS} keys ({movedPct}%) when resizing {resize.from} → {resize.to} nodes because changing the divisor shifts almost every remainder.
            </span>
            <span data-lang-vi>
              Chia lấy dư cho N làm {movedCount} trên {NUM_KEYS} khoá ({movedPct}%) phải dời khi đổi từ {resize.from} → {resize.to} node vì đổi số chia làm phần dư đổi gần hết.
            </span>
          </>
        ) : strategy === 'fixed' ? (
          <>
            <span data-lang-en>
              Fixed shards moved only whole logical shards ({movedCount} of {NUM_KEYS} keys, {movedPct}%). No key changed its shard ID — only shard-to-node ownership changed.
            </span>
            <span data-lang-vi>
              Số shard cố định chỉ dời trọn vẹn vài shard logic ({movedCount} trên {NUM_KEYS} khoá, {movedPct}%). Không khoá nào đổi số shard — chỉ đổi máy đang giữ shard đó.
            </span>
          </>
        ) : (
          <>
            <span data-lang-en>
              Consistent hashing with {VNODES_PER_NODE} virtual nodes per host moved {movedCount} of {NUM_KEYS} keys ({movedPct}%), close to the ideal 1/{Math.max(resize.from, resize.to)} share.
            </span>
            <span data-lang-vi>
              Consistent hashing với {VNODES_PER_NODE} virtual node mỗi máy chỉ dời {movedCount} trên {NUM_KEYS} khoá ({movedPct}%), sát mức lý tưởng 1/{Math.max(resize.from, resize.to)}.
            </span>
          </>
        )}
      </div>

      <div className="shrd-grid">
        {perNode.map((node, idx) => {
          const load = node.keys.length + node.hotReqs;
          const isHot = load > fairLoad * 1.5;
          const barPct = Math.min(100, (load / Math.max(maxLoad, fairLoad * 1.5)) * 100);
          const shardsHere = fixedOwners
            ? fixedOwners.reduce<number[]>((acc, o, s) => (o === idx ? [...acc, s] : acc), [])
            : null;
          return (
            <div key={idx} className={`shrd-node${isHot ? ' is-hot' : ''}`}>
              <div className="shrd-node-head">
                <strong>Node {idx}</strong>
                <span>
                  <span data-lang-en>{node.keys.length} keys · {load} reqs</span>
                  <span data-lang-vi>{node.keys.length} khoá · {load} req</span>
                </span>
              </div>
              <div className="shrd-bar" aria-hidden="true">
                <div className={`shrd-bar-fill${isHot ? ' is-hot' : ''}`} style={{ width: `${barPct.toFixed(1)}%` }} />
              </div>
              {shardsHere && (
                <div className="shrd-shards">
                  {shardsHere.map((s) => (
                    <span key={s} className="shrd-shard">S{s}</span>
                  ))}
                </div>
              )}
              <div className="shrd-keys">
                {node.keys.map((k) => (
                  <span
                    key={k.key}
                    className={`shrd-chip${k.moved ? ' is-moved' : ''}`}
                    title={k.moved ? `${k.key} (moved)` : k.key}
                  >
                    {k.key}
                  </span>
                ))}
                {node.hotLabels.map((hl) => (
                  <span key={hl} className="shrd-chip is-hot">
                    {hl} (+{hotKeysList.find((x) => x.key === hl)?.reqs})
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
