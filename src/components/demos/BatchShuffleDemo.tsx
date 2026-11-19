import { useId, useMemo, useState } from 'react';

// Interactive batch-processing simulator with two modes (all values deterministic & simulated):
// 1) Local aggregation memory model: In-memory hash table (OOMs when distinct keys exceed 128 MiB worker RAM)
//    vs External sort-merge (caps buffer at 32 MiB, spills sorted runs to disk, merges sequentially).
// 2) Distributed join across 4 workers: Uniform sort-merge shuffle vs 70% celebrity hot-key straggler
//    vs Broadcast hash join (replicates small dimension table to mappers, zero fact shuffle).

type Tab = 'memory' | 'shuffle';
type Cardinality = 'low' | 'high';
type AggMode = 'hash' | 'sort';
type ShuffleMode = 'uniform' | 'skew' | 'broadcast';

const WORKER_RAM_MIB = 128;
const SORT_BUF_MIB = 32;
const TOTAL_LINES = 10_000_000;
const PROGRESS_STEPS = [25, 50, 75, 100] as const;

type WorkerLane = {
  id: number;
  rows: number;
  hotRows: number;
  bytesShuffledMb: number;
  timeSec: number;
  straggler: boolean;
};

const fmtNum = (n: number, lang: 'en' | 'vi') =>
  n.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN');

const fmtDec = (n: number, lang: 'en' | 'vi', digits = 1) =>
  n.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export default function BatchShuffleDemo() {
  const uid = useId();
  const [tab, setTab] = useState<Tab>('memory');

  // Mode 1: Memory vs. Spill
  const [cardinality, setCardinality] = useState<Cardinality>('high');
  const [aggMode, setAggMode] = useState<AggMode>('hash');
  const [progress, setProgress] = useState<number>(100);

  // Mode 2: Distributed Shuffle
  const [shuffleMode, setShuffleMode] = useState<ShuffleMode>('skew');

  const memStats = useMemo(() => {
    const targetKeys = cardinality === 'low' ? 20_000 : 600_000;
    const linesRead = Math.round((TOTAL_LINES * progress) / 100);
    // Low cardinality saturates unique keys quickly; high cardinality keeps discovering new URLs.
    const distinctSeen =
      cardinality === 'low'
        ? Math.min(targetKeys, Math.round(targetKeys * (0.65 + (0.35 * progress) / 100)))
        : Math.round((targetKeys * progress) / 100);

    // Simulated hash entry footprint (~310 bytes/entry including Python/JVM object & bucket overhead).
    const hashRamNeedMib = Math.round((distinctSeen * 310) / (1024 * 1024));

    if (aggMode === 'hash') {
      const oom = hashRamNeedMib > WORKER_RAM_MIB;
      const ramUsed = Math.min(WORKER_RAM_MIB, hashRamNeedMib);
      const oomAtPct = oom
        ? Math.min(progress, Math.floor((WORKER_RAM_MIB / Math.max(1, (targetKeys * 310) / (1024 * 1024))) * 100))
        : null;
      return {
        linesRead,
        distinctSeen,
        ramUsed,
        ramNeed: hashRamNeedMib,
        oom,
        oomAtPct,
        runs: [] as number[],
        diskSpillMb: 0,
        passes: 1,
      };
    }

    // External sort-merge caps working RAM at 32 MiB and spills fixed 32 MiB sorted segments.
    const rawKeyStreamMb = Math.round(((linesRead * 48) / (1024 * 1024)) * (cardinality === 'low' ? 0.35 : 0.45));
    const runCount = Math.max(1, Math.ceil(rawKeyStreamMb / SORT_BUF_MIB));
    const runs = Array.from({ length: Math.min(runCount, 8) }, (_, i) => i + 1);
    const diskSpillMb = runCount > 1 ? rawKeyStreamMb : 0;

    return {
      linesRead,
      distinctSeen,
      ramUsed: Math.min(SORT_BUF_MIB, Math.max(8, rawKeyStreamMb)),
      ramNeed: SORT_BUF_MIB,
      oom: false,
      oomAtPct: null,
      runs,
      totalRuns: runCount,
      diskSpillMb,
      passes: runCount > 1 ? 2 : 1,
    };
  }, [cardinality, aggMode, progress]);

  const shuffleStats = useMemo(() => {
    const totalEvents = 1_000_000;
    const dimTableMb = 8;
    let lanes: WorkerLane[] = [];
    let shuffledMb = 0;
    let stageTime = 0;
    let skewRatio = 1.0;

    if (shuffleMode === 'uniform') {
      lanes = [0, 1, 2, 3].map((id) => ({
        id,
        rows: 250_000,
        hotRows: 0,
        bytesShuffledMb: 120,
        timeSec: 4.2,
        straggler: false,
      }));
      shuffledMb = 480;
      stageTime = 4.2;
      skewRatio = 1.0;
    } else if (shuffleMode === 'skew') {
      // 70% celebrity hot key hashes to Reducer 2 (700k hot + 75k uniform = 775k).
      lanes = [
        { id: 0, rows: 75_000, hotRows: 0, bytesShuffledMb: 36, timeSec: 1.4, straggler: false },
        { id: 1, rows: 75_000, hotRows: 0, bytesShuffledMb: 36, timeSec: 1.4, straggler: false },
        { id: 2, rows: 775_000, hotRows: 700_000, bytesShuffledMb: 372, timeSec: 13.8, straggler: true },
        { id: 3, rows: 75_000, hotRows: 0, bytesShuffledMb: 36, timeSec: 1.4, straggler: false },
      ];
      shuffledMb = 480;
      stageTime = 13.8;
      skewRatio = 10.3;
    } else {
      // Broadcast hash join: 8 MB dimension table sent to 4 mappers (32 MB total), 0 MB fact events shuffled.
      lanes = [0, 1, 2, 3].map((id) => ({
        id,
        rows: 250_000,
        hotRows: 0,
        bytesShuffledMb: dimTableMb,
        timeSec: 1.9,
        straggler: false,
      }));
      shuffledMb = dimTableMb * 4;
      stageTime = 1.9;
      skewRatio = 1.0;
    }

    const maxRows = Math.max(...lanes.map((l) => l.rows));
    return { totalEvents, dimTableMb, lanes, shuffledMb, stageTime, skewRatio, maxRows };
  }, [shuffleMode]);

  const ramPct = Math.min(100, Math.round((memStats.ramUsed / WORKER_RAM_MIB) * 100));

  return (
    <div className="sd btc" aria-labelledby={uid}>
      <span id={uid} className="btc-sr">
        <span data-lang-en>Interactive batch processing memory and shuffle simulator</span>
        <span data-lang-vi>Trình mô phỏng bộ nhớ và shuffle trong xử lý batch</span>
      </span>

      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Experiment</span>
            <span data-lang-vi>Thử nghiệm</span>
          </span>
          <button
            type="button"
            className={tab === 'memory' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={tab === 'memory'}
            onClick={() => setTab('memory')}
          >
            <span data-lang-en>1. RAM hash vs. sort-merge spill</span>
            <span data-lang-vi>1. Hash trong RAM vs. tràn đĩa</span>
          </button>
          <button
            type="button"
            className={tab === 'shuffle' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={tab === 'shuffle'}
            onClick={() => setTab('shuffle')}
          >
            <span data-lang-en>2. 4-reducer shuffle vs. broadcast</span>
            <span data-lang-vi>2. Shuffle 4 reducer vs. broadcast</span>
          </button>
        </div>
      </div>

      {tab === 'memory' ? (
        <>
          <div className="sd-controls">
            <div className="sd-group">
              <span>
                <span data-lang-en>Keys</span>
                <span data-lang-vi>Số khoá</span>
              </span>
              <button
                type="button"
                className={cardinality === 'low' ? 'sd-btn is-on' : 'sd-btn'}
                aria-pressed={cardinality === 'low'}
                onClick={() => setCardinality('low')}
              >
                <span data-lang-en>20k distinct URLs</span>
                <span data-lang-vi>20.000 URL riêng biệt</span>
              </button>
              <button
                type="button"
                className={cardinality === 'high' ? 'sd-btn is-on' : 'sd-btn'}
                aria-pressed={cardinality === 'high'}
                onClick={() => setCardinality('high')}
              >
                <span data-lang-en>600k distinct URLs</span>
                <span data-lang-vi>600.000 URL riêng biệt</span>
              </button>
            </div>

            <div className="sd-group">
              <span>
                <span data-lang-en>Engine</span>
                <span data-lang-vi>Cơ chế</span>
              </span>
              <button
                type="button"
                className={aggMode === 'hash' ? 'sd-btn is-on' : 'sd-btn'}
                aria-pressed={aggMode === 'hash'}
                onClick={() => setAggMode('hash')}
              >
                <span data-lang-en>In-memory hash table</span>
                <span data-lang-vi>Bảng băm trong RAM</span>
              </button>
              <button
                type="button"
                className={aggMode === 'sort' ? 'sd-btn is-on' : 'sd-btn'}
                aria-pressed={aggMode === 'sort'}
                onClick={() => setAggMode('sort')}
              >
                <span data-lang-en>External sort-merge (32 MiB cap)</span>
                <span data-lang-vi>Sort-merge ngoài RAM (giới hạn 32 MiB)</span>
              </button>
            </div>

            <div className="sd-group">
              <span>
                <span data-lang-en>Log scanned</span>
                <span data-lang-vi>Tiến độ đọc</span>
              </span>
              {PROGRESS_STEPS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className={progress === pct ? 'sd-btn is-on' : 'sd-btn'}
                  aria-pressed={progress === pct}
                  onClick={() => setProgress(pct)}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="sd-stats">
            <div className={`sd-stat${memStats.oom ? ' is-bad' : ' is-good'}`}>
              <b>
                <span data-lang-en>{memStats.oom ? `${WORKER_RAM_MIB} / ${WORKER_RAM_MIB} MiB` : `${memStats.ramUsed} / ${WORKER_RAM_MIB} MiB`}</span>
                <span data-lang-vi>{memStats.oom ? `${WORKER_RAM_MIB} / ${WORKER_RAM_MIB} MiB` : `${memStats.ramUsed} / ${WORKER_RAM_MIB} MiB`}</span>
              </b>
              <span>
                <span data-lang-en>worker RAM used</span>
                <span data-lang-vi>RAM worker đã dùng</span>
              </span>
            </div>
            <div className="sd-stat">
              <b>
                <span data-lang-en>{fmtNum(memStats.distinctSeen, 'en')}</span>
                <span data-lang-vi>{fmtNum(memStats.distinctSeen, 'vi')}</span>
              </b>
              <span>
                <span data-lang-en>distinct keys seen</span>
                <span data-lang-vi>khoá riêng biệt đã gặp</span>
              </span>
            </div>
            <div className="sd-stat">
              <b>
                <span data-lang-en>{aggMode === 'sort' ? `${memStats.totalRuns ?? memStats.runs.length} runs` : '0 runs'}</span>
                <span data-lang-vi>{aggMode === 'sort' ? `${memStats.totalRuns ?? memStats.runs.length} đoạn` : '0 đoạn'}</span>
              </b>
              <span>
                <span data-lang-en>sorted disk spills</span>
                <span data-lang-vi>đoạn tràn xuống đĩa</span>
              </span>
            </div>
            <div className={`sd-stat${memStats.oom ? ' is-bad' : ' is-good'}`}>
              <b>
                <span data-lang-en>{memStats.oom ? 'OOMKilled (137)' : 'Succeeded'}</span>
                <span data-lang-vi>{memStats.oom ? 'OOMKilled (137)' : 'Hoàn thành'}</span>
              </b>
              <span>
                <span data-lang-en>container status</span>
                <span data-lang-vi>trạng thái container</span>
              </span>
            </div>
          </div>

          <p className={`btc-msg${memStats.oom ? ' is-bad' : ''}`} aria-live="polite">
            {memStats.oom ? (
              <>
                <span data-lang-en>
                  Crashed around {memStats.oomAtPct}% through the 10M-line log: holding {fmtNum(memStats.distinctSeen, 'en')} distinct URLs in a hash table needs ~{memStats.ramNeed} MiB, exceeding the {WORKER_RAM_MIB} MiB cgroup limit.
                </span>
                <span data-lang-vi>
                  Sập ở khoảng {memStats.oomAtPct}% file log 10 triệu dòng: giữ {fmtNum(memStats.distinctSeen, 'vi')} URL trong bảng băm cần tới ~{memStats.ramNeed} MiB, vượt trần {WORKER_RAM_MIB} MiB của cgroup.
                </span>
              </>
            ) : aggMode === 'hash' ? (
              <>
                <span data-lang-en>
                  In-memory hash table wins here: only {fmtNum(memStats.distinctSeen, 'en')} distinct keys fit easily in {memStats.ramUsed} MiB of RAM with a single sequential scan.
                </span>
                <span data-lang-vi>
                  Bảng băm trong RAM thắng thế ở đây: chỉ {fmtNum(memStats.distinctSeen, 'vi')} khoá nên nằm gọn trong {memStats.ramUsed} MiB RAM sau đúng một lượt quét.
                </span>
              </>
            ) : (
              <>
                <span data-lang-en>
                  Sort-merge caps working memory at {SORT_BUF_MIB} MiB: it sorts chunks in RAM, spills {memStats.totalRuns} sorted run{(memStats.totalRuns ?? 0) === 1 ? '' : 's'} ({memStats.diskSpillMb} MiB) sequentially to local disk, then merges them cleanly.
                </span>
                <span data-lang-vi>
                  Sort-merge khoá chặt RAM ở mức {SORT_BUF_MIB} MiB: sắp xếp từng khúc trong RAM, ghi tràn tuần tự {memStats.totalRuns} đoạn đã xếp ({memStats.diskSpillMb} MiB) xuống đĩa rồi trộn lại.
                </span>
              </>
            )}
          </p>

          <div className="btc-cols">
            <div className={`btc-box${memStats.oom ? ' is-bad' : ''}`}>
              <p className="btc-box-head">
                <span data-lang-en>Worker RAM buffer (limit: {WORKER_RAM_MIB} MiB)</span>
                <span data-lang-vi>Bộ nhớ RAM worker (trần: {WORKER_RAM_MIB} MiB)</span>
              </p>
              <div className="btc-bar-track" aria-hidden="true">
                <div className={`btc-bar-fill${memStats.oom ? ' is-bad' : ''}`} style={{ width: `${ramPct}%` }} />
              </div>
              <p className="btc-box-foot">
                <span data-lang-en>
                  {memStats.oom
                    ? `Required ~${memStats.ramNeed} MiB → kernel killed process`
                    : `${memStats.ramUsed} MiB allocated (${ramPct}% of limit)`}
                </span>
                <span data-lang-vi>
                  {memStats.oom
                    ? `Cần ~${memStats.ramNeed} MiB → nhân Linux giết tiến trình`
                    : `Đang dùng ${memStats.ramUsed} MiB (${ramPct}% trần giới hạn)`}
                </span>
              </p>
            </div>

            <div className="btc-box">
              <p className="btc-box-head">
                <span data-lang-en>Local disk spill segments (sequential I/O)</span>
                <span data-lang-vi>Các đoạn tràn xuống đĩa cục bộ (I/O tuần tự)</span>
              </p>
              {aggMode === 'sort' ? (
                <>
                  <div className="btc-runs">
                    {memStats.runs.map((r) => (
                      <span key={r} className="btc-run">
                        <span data-lang-en>run #{r}</span>
                        <span data-lang-vi>đoạn #{r}</span>
                      </span>
                    ))}
                    {(memStats.totalRuns ?? 0) > memStats.runs.length && (
                      <span className="btc-run is-more">+{((memStats.totalRuns ?? 0) - memStats.runs.length)}</span>
                    )}
                  </div>
                  <p className="btc-box-foot">
                    <span data-lang-en>k-way mergesort + uniq counts adjacent duplicates in O(1) extra RAM</span>
                    <span data-lang-vi>trộn k nhánh (k-way merge) + đếm dòng kề nhau với RAM phụ O(1)</span>
                  </p>
                </>
              ) : (
                <p className="btc-box-empty">
                  <span data-lang-en>None — hash tables cannot spill sorted runs to disk cleanly, so all distinct keys must stay in RAM.</span>
                  <span data-lang-vi>Không có — bảng băm không thể xả từng đoạn đã xếp ra đĩa gọn gàng, nên mọi khoá đều phải bám trong RAM.</span>
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="sd-controls">
            <div className="sd-group">
              <span>
                <span data-lang-en>Join plan</span>
                <span data-lang-vi>Chiến lược join</span>
              </span>
              <button
                type="button"
                className={shuffleMode === 'uniform' ? 'sd-btn is-on' : 'sd-btn'}
                aria-pressed={shuffleMode === 'uniform'}
                onClick={() => setShuffleMode('uniform')}
              >
                <span data-lang-en>Uniform sort-merge</span>
                <span data-lang-vi>Sort-merge đều khoá</span>
              </button>
              <button
                type="button"
                className={shuffleMode === 'skew' ? 'sd-btn is-on' : 'sd-btn'}
                aria-pressed={shuffleMode === 'skew'}
                onClick={() => setShuffleMode('skew')}
              >
                <span data-lang-en>70% celebrity hot key</span>
                <span data-lang-vi>Hot key lệch 70%</span>
              </button>
              <button
                type="button"
                className={shuffleMode === 'broadcast' ? 'sd-btn is-on' : 'sd-btn'}
                aria-pressed={shuffleMode === 'broadcast'}
                onClick={() => setShuffleMode('broadcast')}
              >
                <span data-lang-en>Broadcast hash join</span>
                <span data-lang-vi>Broadcast hash join</span>
              </button>
            </div>
          </div>

          <div className="sd-stats">
            <div className={`sd-stat${shuffleStats.skewRatio > 2 ? ' is-bad' : ' is-good'}`}>
              <b>
                <span data-lang-en>{fmtNum(shuffleStats.maxRows, 'en')}</span>
                <span data-lang-vi>{fmtNum(shuffleStats.maxRows, 'vi')}</span>
              </b>
              <span>
                <span data-lang-en>max rows on 1 task</span>
                <span data-lang-vi>số dòng tối đa ở 1 task</span>
              </span>
            </div>
            <div className={`sd-stat${shuffleStats.skewRatio > 2 ? ' is-bad' : ' is-good'}`}>
              <b>
                <span data-lang-en>{fmtDec(shuffleStats.skewRatio, 'en')}×</span>
                <span data-lang-vi>{fmtDec(shuffleStats.skewRatio, 'vi')}×</span>
              </b>
              <span>
                <span data-lang-en>max / median skew</span>
                <span data-lang-vi>độ lệch max / trung vị</span>
              </span>
            </div>
            <div className="sd-stat">
              <b>
                <span data-lang-en>{fmtNum(shuffleStats.shuffledMb, 'en')} MB</span>
                <span data-lang-vi>{fmtNum(shuffleStats.shuffledMb, 'vi')} MB</span>
              </b>
              <span>
                <span data-lang-en>network bytes moved</span>
                <span data-lang-vi>dữ liệu đẩy qua mạng</span>
              </span>
            </div>
            <div className={`sd-stat${shuffleStats.stageTime > 8 ? ' is-bad' : ' is-good'}`}>
              <b>
                <span data-lang-en>{fmtDec(shuffleStats.stageTime, 'en')} s</span>
                <span data-lang-vi>{fmtDec(shuffleStats.stageTime, 'vi')} s</span>
              </b>
              <span>
                <span data-lang-en>stage completion time</span>
                <span data-lang-vi>thời gian xong cả stage</span>
              </span>
            </div>
          </div>

          <p className={`btc-msg${shuffleStats.skewRatio > 2 ? ' is-bad' : ''}`} aria-live="polite">
            {shuffleMode === 'uniform' ? (
              <>
                <span data-lang-en>
                  Uniform keys split 1M click events evenly across all 4 reducers (250k each). Every task finishes around the same time, though all 480 MB of events still cross the network.
                </span>
                <span data-lang-vi>
                  Khoá phân bố đều chia 1 triệu click cho 4 reducer (mỗi máy 250 nghìn dòng). Các task xong gần như cùng lúc, dù toàn bộ 480 MB sự kiện vẫn phải đi qua mạng.
                </span>
              </>
            ) : shuffleMode === 'skew' ? (
              <>
                <span data-lang-en>
                  Straggler bottleneck: one celebrity account (@star) produces 70% of clicks, hashing 775,000 rows onto Reducer #2. Reducers #0, #1, and #3 finish in 1.4 s and sit idle for 12.4 s waiting on Reducer #2.
                </span>
                <span data-lang-vi>
                  Nút thắt kẻ tụt hậu (straggler): một tài khoản nổi tiếng (@star) chiếm 70% lượng click, dồn 775.000 dòng về Reducer #2. Reducer #0, #1 và #3 chạy xong sau 1,4 giây rồi ngồi không chờ 12,4 giây.
                </span>
              </>
            ) : (
              <>
                <span data-lang-en>
                  Broadcast hash join skips shuffling the 1M-row event table altogether. The 8 MB user table is copied to all 4 map workers (32 MB total), and each worker joins its local 250k shard in 1.9 s with zero skew.
                </span>
                <span data-lang-vi>
                  Broadcast hash join bỏ luôn bước shuffle bảng 1 triệu sự kiện. Bảng user nhỏ (8 MB) được phát tán tới cả 4 mapper (tổng 32 MB), mỗi worker tự join 250 nghìn dòng tại chỗ trong 1,9 giây mà không lệch tải.
                </span>
              </>
            )}
          </p>

          <div className="btc-workers">
            {shuffleStats.lanes.map((lane) => {
              const barWidth = Math.max(4, Math.round((lane.rows / 800_000) * 100));
              return (
                <div key={lane.id} className={`btc-worker${lane.straggler ? ' is-bad' : ''}`}>
                  <div className="btc-worker-top">
                    <b>
                      <span data-lang-en>{shuffleMode === 'broadcast' ? `Map task #${lane.id}` : `Reducer #${lane.id}`}</span>
                      <span data-lang-vi>{shuffleMode === 'broadcast' ? `Map task #${lane.id}` : `Reducer #${lane.id}`}</span>
                    </b>
                    <span className="btc-worker-time">
                      <span data-lang-en>{fmtDec(lane.timeSec, 'en')} s</span>
                      <span data-lang-vi>{fmtDec(lane.timeSec, 'vi')} s</span>
                    </span>
                  </div>
                  <div className="btc-bar-track" aria-hidden="true">
                    <div
                      className={`btc-bar-fill${lane.straggler ? ' is-bad' : ''}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="btc-worker-meta">
                    <span>
                      <span data-lang-en>{fmtNum(lane.rows, 'en')} rows</span>
                      <span data-lang-vi>{fmtNum(lane.rows, 'vi')} dòng</span>
                    </span>
                    {lane.straggler ? (
                      <span className="btc-tag is-bad">
                        <span data-lang-en>700k @star hot key</span>
                        <span data-lang-vi>700k dòng hot key @star</span>
                      </span>
                    ) : shuffleMode === 'skew' ? (
                      <span className="btc-tag">
                        <span data-lang-en>idle 12.4 s</span>
                        <span data-lang-vi>chờ 12,4 s</span>
                      </span>
                    ) : (
                      <span className="btc-tag">
                        <span data-lang-en>{lane.bytesShuffledMb} MB net</span>
                        <span data-lang-vi>{lane.bytesShuffledMb} MB mạng</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
