import React, { useState } from 'react';

type Mode = 'slice' | 'map';
type SliceMode = 'uncapped' | 'capped' | 'copy';

export default function GoMemSliceMapDemo() {
  const [mode, setMode] = useState<Mode>('slice');
  const [sliceMode, setSliceMode] = useState<SliceMode>('uncapped');
  const [appendedVal, setAppendedVal] = useState<number | null>(99);
  const [mapStage, setMapStage] = useState<0 | 1 | 2>(2);

  const baseArray = [10, 20, 30, 40, 50];

  const computeSlice = () => {
    const s1 = [...baseArray];
    if (appendedVal === null) {
      return {
        s1,
        s2: [20, 30],
        s2Len: 2,
        s2Cap: sliceMode === 'uncapped' ? 4 : 2,
        separateArray: null as number[] | null,
        overwrittenIdx: -1,
      };
    }
    if (sliceMode === 'uncapped') {
      s1[3] = appendedVal;
      return {
        s1,
        s2: [20, 30, appendedVal],
        s2Len: 3,
        s2Cap: 4,
        separateArray: null as number[] | null,
        overwrittenIdx: 3,
      };
    }
    return {
      s1,
      s2: [20, 30, appendedVal],
      s2Len: 3,
      s2Cap: 4,
      separateArray: [20, 30, appendedVal, 0],
      overwrittenIdx: -1,
    };
  };

  const sl = computeSlice();

  const mapData = [
    { entries: '10,000', buckets: '2,048', heap: '3.1 MiB', recreated: '3.1 MiB', cls: '' },
    { entries: '1,000,000', buckets: '131,072', heap: '288.2 MiB', recreated: '288.2 MiB', cls: '' },
    { entries: '10,000', buckets: '131,072', heap: '288.2 MiB', recreated: '3.1 MiB', cls: 'is-bad' },
  ][mapStage];

  const sliceCode =
    sliceMode === 'uncapped'
      ? [
          's1 := []int{10, 20, 30, 40, 50}',
          's2 := s1[1:3]        // cap = 4!',
          's2 = append(s2, 99)  // overwrites s1[3]!',
          '// s1[3] is now 99 (aliased!)',
        ]
      : sliceMode === 'capped'
        ? [
            's1 := []int{10, 20, 30, 40, 50}',
            's2 := s1[1:3:3]      // cap = 2 pinned',
            's2 = append(s2, 99)  // len == cap -> new alloc',
            '// s1[3] stays untouched = 40',
          ]
        : [
            's1 := []int{10, 20, 30, 40, 50}',
            's2 := make([]int, 2); copy(s2, s1[1:3])',
            's2 = append(s2, 99)  // separate buffer',
            '// s1[3] stays untouched = 40',
          ];

  const mapCode = [
    'm := make(map[int][128]byte)',
    'for i := 0; i < 1_000_000; i++ { m[i] = v }',
    'for i := 0; i < 990_000; i++ { delete(m, i) }',
    '// fix: copy remaining 10k into fresh map',
  ];

  const sliceActiveIdx = appendedVal === null ? 1 : 2;
  const mapActiveIdx = mapStage;

  return (
    <div className="sd gms">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Inspector</span>
            <span data-lang-vi>Chế độ</span>
          </span>
          <button type="button" className={mode === 'slice' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setMode('slice')}>
            Slice header &amp; append
          </button>
          <button type="button" className={mode === 'map' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setMode('map')}>
            <span data-lang-en>Map bucket retention</span>
            <span data-lang-vi>Map giữ bucket sau delete</span>
          </button>
        </div>

        {mode === 'slice' ? (
          <>
            <div className="sd-group">
              <span>
                <span data-lang-en>Syntax</span>
                <span data-lang-vi>Cách cắt</span>
              </span>
              <button type="button" className={sliceMode === 'uncapped' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setSliceMode('uncapped')}>
                s1[1:3]
              </button>
              <button type="button" className={sliceMode === 'capped' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setSliceMode('capped')}>
                s1[1:3:3]
              </button>
              <button type="button" className={sliceMode === 'copy' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setSliceMode('copy')}>
                copy(s2, ...)
              </button>
            </div>
            <div className="sd-group sd-run">
              <button type="button" className={appendedVal !== null ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setAppendedVal(99)}>
                append(s2, 99)
              </button>
              <button type="button" className="sd-btn" onClick={() => setAppendedVal(null)}>
                <span data-lang-en>Reset</span>
                <span data-lang-vi>Làm lại</span>
              </button>
            </div>
          </>
        ) : (
          <div className="sd-group">
            <span>
              <span data-lang-en>Stage</span>
              <span data-lang-vi>Giai đoạn</span>
            </span>
            <button type="button" className={mapStage === 0 ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setMapStage(0)}>
              1. 10k keys
            </button>
            <button type="button" className={mapStage === 1 ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setMapStage(1)}>
              2. 1M keys
            </button>
            <button type="button" className={mapStage === 2 ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setMapStage(2)}>
              3. delete 990k
            </button>
          </div>
        )}
      </div>

      {/* Side-by-side Code + Animated SVG pointer/bucket flow */}
      <div className="gms-grid">
        <div className="gms-pane">
          <div className="gms-pane-hdr">
            <span data-lang-en>Go code</span>
            <span data-lang-vi>Code Go đối chiếu</span>
          </div>
          <div className="gms-code-body">
            {(mode === 'slice' ? sliceCode : mapCode).map((line, i) => {
              const active = mode === 'slice' ? i === sliceActiveIdx : i === mapActiveIdx;
              const cls = !active
                ? ''
                : mode === 'slice'
                  ? sliceMode === 'uncapped' && appendedVal !== null
                    ? 'is-bad'
                    : 'is-good'
                  : mapStage === 2
                    ? 'is-bad'
                    : '';
              return (
                <div key={i} className={`gms-line ${active ? 'is-active' : ''} ${cls}`}>
                  <span className="gms-ln">{active ? '▶' : `L${i + 1}`}</span>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="gms-pane">
          <div className="gms-pane-hdr">
            <span data-lang-en>Pointer &amp; heap flow</span>
            <span data-lang-vi>Luồng con trỏ &amp; Heap</span>
          </div>
          {mode === 'slice' ? (
            <svg viewBox="0 0 460 132" className="gms-flow-svg" role="img" aria-label="Slice pointer trace">
              <rect x="10" y="14" width="128" height="44" rx="6" className="gms-box" />
              <text x="20" y="34" className="gms-svg-b">s1 (ptr → arr[0])</text>
              <text x="20" y="50" className="gms-svg-sm">len: 5 · cap: 5</text>

              <rect x="10" y="72" width="128" height="46" rx="6" className={`gms-box ${sl.overwrittenIdx >= 0 ? 'is-red' : 'is-good'}`} />
              <text x="20" y="92" className={sl.overwrittenIdx >= 0 ? 'gms-svg-red' : 'gms-svg-good'}>s2 ({sliceMode})</text>
              <text x="20" y="108" className="gms-svg-sm">len: {sl.s2Len} · cap: {sl.s2Cap}</text>

              <line x1="138" x2="188" y1="36" y2="36" stroke="var(--text-muted)" strokeWidth="1.6" />
              <line
                x1="138"
                x2="188"
                y1="95"
                y2={sl.separateArray ? '95' : '44'}
                stroke={sl.overwrittenIdx >= 0 ? 'var(--red)' : 'rgb(21, 128, 61)'}
                strokeWidth="1.8"
              />

              {sl.s1.map((val, idx) => (
                <g key={idx}>
                  <rect x={190 + idx * 52} y="16" width="46" height="40" rx="5" className={`gms-box ${idx === sl.overwrittenIdx ? 'is-red' : ''}`} />
                  <text x={213 + idx * 52} y="41" textAnchor="middle" className={idx === sl.overwrittenIdx ? 'gms-svg-red' : 'gms-svg-b'}>{val}</text>
                </g>
              ))}

              {sl.separateArray ? (
                sl.separateArray.map((val, idx) => (
                  <g key={idx}>
                    <rect x={190 + idx * 52} y="76" width="46" height="40" rx="5" className="gms-box is-good" />
                    <text x={213 + idx * 52} y="101" textAnchor="middle" className="gms-svg-good">{idx === 3 ? '—' : val}</text>
                  </g>
                ))
              ) : (
                <text x="320" y="96" textAnchor="middle" className={sl.overwrittenIdx >= 0 ? 'gms-svg-red' : 'gms-svg-sm'}>
                  <tspan data-lang-en>{sl.overwrittenIdx >= 0 ? 's2 wrote 99 into s1[3]!' : 'Click append(s2, 99) to trace'}</tspan>
                  <tspan data-lang-vi>{sl.overwrittenIdx >= 0 ? 's2 đã ghi đè 99 vào s1[3]!' : 'Bấm append(s2, 99) để xem'}</tspan>
                </text>
              )}
            </svg>
          ) : (
            <svg viewBox="0 0 460 132" className="gms-flow-svg" role="img" aria-label="Animated Go map bucket retention flow">
              <rect x="16" y="20" width="132" height="92" rx="8" className={`gms-box ${mapStage === 0 ? 'is-good' : ''}`} />
              <text x="82" y="48" textAnchor="middle" className="gms-svg-b">1. Baseline</text>
              <text x="82" y="70" textAnchor="middle" className="gms-svg-sm">2,048 buckets</text>
              <text x="82" y="92" textAnchor="middle" className="gms-svg-good">3.1 MiB</text>

              <rect x="164" y="20" width="132" height="92" rx="8" className={`gms-box ${mapStage === 1 ? 'is-good' : ''}`} />
              <text x="230" y="48" textAnchor="middle" className="gms-svg-b">2. Spike 1M</text>
              <text x="230" y="70" textAnchor="middle" className="gms-svg-sm">131,072 buckets</text>
              <text x="230" y="92" textAnchor="middle" className="gms-svg-b">288.2 MiB</text>

              <rect x="312" y="20" width="132" height="92" rx="8" className={`gms-box ${mapStage === 2 ? 'is-red' : ''}`} />
              <text x="378" y="48" textAnchor="middle" className="gms-svg-red">3. delete 99%</text>
              <text x="378" y="70" textAnchor="middle" className="gms-svg-sm">131,072 pinned</text>
              <text x="378" y="92" textAnchor="middle" className="gms-svg-red">288.2 MiB!</text>

              <line x1="148" x2="164" y1="66" y2="66" stroke="var(--text-muted)" strokeWidth="1.6" />
              <line x1="296" x2="312" y1="66" y2="66" stroke="var(--red)" strokeWidth="1.6" />
            </svg>
          )}
        </div>
      </div>

      {mode === 'slice' ? (
        <div>
          <div className="sd-stats">
            <div className="sd-stat">
              <b>{`[${sl.s1.join(', ')}]`}</b>
              <span><span data-lang-en>s1 visible elements</span><span data-lang-vi>s1 đang thấy</span></span>
            </div>
            <div className="sd-stat">
              <b>{`[${sl.s2.join(', ')}]`}</b>
              <span>s2 (len={sl.s2Len}, cap={sl.s2Cap})</span>
            </div>
            <div className={`sd-stat ${sl.overwrittenIdx >= 0 ? 'is-bad' : appendedVal !== null ? 'is-good' : ''}`}>
              <b>
                {sl.overwrittenIdx >= 0 ? (
                  <>
                    <span data-lang-en>s1[3] overwritten!</span>
                    <span data-lang-vi>s1[3] bị ghi đè!</span>
                  </>
                ) : appendedVal !== null ? (
                  <>
                    <span data-lang-en>s1 isolated &amp; safe</span>
                    <span data-lang-vi>s1 an toàn, tách biệt</span>
                  </>
                ) : (
                  <>
                    <span data-lang-en>Click append(s2, 99)</span>
                    <span data-lang-vi>Bấm append(s2, 99)</span>
                  </>
                )}
              </b>
              <span><span data-lang-en>memory safety</span><span data-lang-vi>trạng thái bộ nhớ</span></span>
            </div>
          </div>

          <div className="gms-arrays">
            <div className="gms-row">
              <span className="gms-row-lbl">
                <span data-lang-en>Backing array A (s1)</span>
                <span data-lang-vi>Mảng nền A (của s1)</span>
              </span>
              <div className="gms-cells">
                {sl.s1.map((val, idx) => {
                  const inS2 = idx >= 1 && idx <= 2;
                  const overwritten = idx === sl.overwrittenIdx;
                  const cls = overwritten ? 'gms-cell is-bad' : inS2 ? 'gms-cell is-shared' : 'gms-cell';
                  return (
                    <div key={idx} className={cls}>
                      <small>[{idx}]</small>
                      <strong>{val}</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {sl.separateArray && (
              <div className="gms-row">
                <span className="gms-row-lbl is-good">
                  <span data-lang-en>New array B (s2)</span>
                  <span data-lang-vi>Mảng mới B (của s2)</span>
                </span>
                <div className="gms-cells">
                  {sl.separateArray.map((val, idx) => (
                    <div key={idx} className={idx === 2 ? 'gms-cell is-good' : 'gms-cell'}>
                      <small>[{idx}]</small>
                      <strong>{idx === 3 ? '—' : val}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="sd-stats">
            <div className="sd-stat">
              <b>{mapData.entries}</b>
              <span><span data-lang-en>live map entries</span><span data-lang-vi>số key đang sống</span></span>
            </div>
            <div className="sd-stat">
              <b>{mapData.buckets}</b>
              <span><span data-lang-en>allocated buckets</span><span data-lang-vi>số bucket đã cấp</span></span>
            </div>
            <div className={`sd-stat ${mapData.cls}`}>
              <b>{mapData.heap}</b>
              <span><span data-lang-en>HeapAlloc (delete only)</span><span data-lang-vi>HeapAlloc (chỉ delete)</span></span>
            </div>
            <div className="sd-stat is-good">
              <b>{mapData.recreated}</b>
              <span><span data-lang-en>HeapAlloc (recreate map)</span><span data-lang-vi>HeapAlloc (tạo lại map)</span></span>
            </div>
          </div>
          <p className="gms-note">
            {mapStage === 2 ? (
              <>
                <span data-lang-en>99% of keys were deleted, yet all 131,072 buckets remain allocated in heap memory (288.2 MiB measured on Go 1.27). Periodically copying live entries into a fresh map lets GC collect the old table.</span>
                <span data-lang-vi>99% số key đã bị xóa, nhưng toàn bộ 131.072 bucket vẫn nằm lì trên heap (đo thực tế 288,2 MiB trên Go 1.27). Định kỳ copy các key còn sống sang map mới sẽ giúp GC giải phóng bảng cũ.</span>
              </>
            ) : (
              <>
                <span data-lang-en>Advance to stage 2 and 3 to observe what happens to Go map memory after a traffic spike subsides.</span>
                <span data-lang-vi>Hãy chuyển qua bước 2 và bước 3 để xem bộ nhớ Go map biến động ra sao sau một đợt tăng tải đột biến.</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
