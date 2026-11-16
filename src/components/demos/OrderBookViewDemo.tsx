import { useMemo, useState } from 'react';

type Tab = 'merge' | 'pagination';
type MergeMode = 'naive' | 'monotonic';

interface OrderEvent {
  seq: number;
  eventNs: number;
  arrivedAt: number;
  status: 'ACCEPTED' | 'PARTIAL_FILL' | 'FILLED';
  filledQty: number;
  note: string;
}

const ORDER_EVENTS: OrderEvent[] = [
  { seq: 1, eventNs: 100, arrivedAt: 102, status: 'ACCEPTED', filledQty: 0, note: 'Exchange acknowledged order' },
  { seq: 2, eventNs: 140, arrivedAt: 145, status: 'PARTIAL_FILL', filledQty: 400, note: 'First 400 shares matched' },
  { seq: 3, eventNs: 190, arrivedAt: 194, status: 'FILLED', filledQty: 1000, note: 'Remaining 600 shares filled (final)' },
  { seq: 4, eventNs: 120, arrivedAt: 220, status: 'ACCEPTED', filledQty: 0, note: 'Delayed duplicate report arrives late' },
];

const isFinal = (status: string) => status === 'FILLED' || status === 'CANCELLED' || status === 'REJECTED';

interface FillRow {
  id: string;
  ts: number;
  qty: number;
  price: string;
  isNew?: boolean;
}

const INITIAL_FILLS: FillRow[] = [
  { id: 'FILL-106', ts: 106, qty: 200, price: '68.50' },
  { id: 'FILL-105', ts: 105, qty: 400, price: '68.45' },
  { id: 'FILL-104', ts: 104, qty: 150, price: '68.40' },
  { id: 'FILL-103', ts: 103, qty: 300, price: '68.35' },
  { id: 'FILL-102', ts: 102, qty: 250, price: '68.30' },
  { id: 'FILL-101', ts: 101, qty: 500, price: '68.25' },
];

const NEW_FILL: FillRow = { id: 'FILL-107', ts: 107, qty: 350, price: '68.55', isNew: true };

export default function OrderBookViewDemo() {
  const [tab, setTab] = useState<Tab>('merge');

  // Tab 1 state: Out-of-order event merge
  const [mode, setMode] = useState<MergeMode>('naive');
  const [step, setStep] = useState<number>(3);

  const mergeState = useMemo(() => {
    let status = '—';
    let filledQty = 0;
    let eventNs = 0;
    let verdict = 'Waiting for events';
    let isBug = false;
    let isIgnored = false;

    for (const ev of ORDER_EVENTS.slice(0, step)) {
      if (mode === 'naive') {
        const reopenedFinal = isFinal(status) && !isFinal(ev.status);
        status = ev.status;
        filledQty = ev.filledQty;
        eventNs = ev.eventNs;
        if (reopenedFinal) {
          verdict = 'BUG: Final order reopened!';
          isBug = true;
          isIgnored = false;
        } else {
          verdict = `Overwrote row (t=${ev.eventNs}ms)`;
          isBug = false;
          isIgnored = false;
        }
      } else {
        if (isFinal(status) && !isFinal(ev.status)) {
          verdict = `Ignored late event (t=${ev.eventNs} < ${eventNs})`;
          isBug = false;
          isIgnored = true;
        } else if (ev.eventNs > eventNs) {
          status = ev.status;
          filledQty = ev.filledQty;
          eventNs = ev.eventNs;
          verdict = `Applied newer event (t=${ev.eventNs}ms)`;
          isBug = false;
          isIgnored = false;
        } else {
          verdict = `Ignored stale event (t=${ev.eventNs} <= ${eventNs})`;
          isBug = false;
          isIgnored = true;
        }
      }
    }

    return { status, filledQty, eventNs, verdict, isBug, isIgnored };
  }, [mode, step]);

  // Tab 2 state: Offset vs. Cursor pagination
  const [insertedNew, setInsertedNew] = useState(false);
  const [page2Loaded, setPage2Loaded] = useState(false);

  const currentStream = useMemo(
    () => (insertedNew ? [NEW_FILL, ...INITIAL_FILLS] : INITIAL_FILLS),
    [insertedNew],
  );
  const page1 = useMemo(() => INITIAL_FILLS.slice(0, 3), []);
  const page1Ids = useMemo(() => new Set(page1.map((r) => r.id)), [page1]);
  const cursorTs = page1[page1.length - 1].ts; // 104

  const offsetPage2 = useMemo(() => currentStream.slice(3, 6), [currentStream]);
  const cursorPage2 = useMemo(
    () => currentStream.filter((r) => r.ts < cursorTs).slice(0, 3),
    [currentStream, cursorTs],
  );
  const offsetDupCount = useMemo(
    () => offsetPage2.filter((r) => page1Ids.has(r.id)).length,
    [offsetPage2, page1Ids],
  );

  return (
    <div className="sd ob-demo">
      <div className="sd-controls">
        <div className="sd-group" role="tablist" aria-label="Interactive scenarios">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'merge'}
            className={`sd-btn ${tab === 'merge' ? 'is-on' : ''}`}
            onClick={() => setTab('merge')}
          >
            1. Out-of-order Event Merge
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'pagination'}
            className={`sd-btn ${tab === 'pagination' ? 'is-on' : ''}`}
            onClick={() => setTab('pagination')}
          >
            2. Offset vs. Cursor Pagination
          </button>
        </div>
      </div>

      {tab === 'merge' ? (
        <div>
          <div className="sd-controls">
            <div className="sd-group" role="group" aria-label="Merge strategy">
              <span>Strategy</span>
              <button
                type="button"
                className={`sd-btn ${mode === 'naive' ? 'is-on' : ''}`}
                onClick={() => setMode('naive')}
              >
                Naive overwrite
              </button>
              <button
                type="button"
                className={`sd-btn ${mode === 'monotonic' ? 'is-on' : ''}`}
                onClick={() => setMode('monotonic')}
              >
                Monotonic merge (event_ns + isFinal)
              </button>
            </div>
            <div className="sd-group sd-run">
              <button
                type="button"
                className="sd-btn is-on"
                disabled={step >= ORDER_EVENTS.length}
                onClick={() => setStep((s) => Math.min(ORDER_EVENTS.length, s + 1))}
              >
                {step >= ORDER_EVENTS.length ? 'All 4 events processed' : 'Step next event'}
              </button>
              <button type="button" className="sd-btn" onClick={() => setStep(0)}>
                Reset
              </button>
            </div>
          </div>

          <div className="sd-stats">
            <div className={`sd-stat ${mergeState.isBug ? 'is-bad' : ''}`}>
              <b>{mergeState.status}</b>
              <span>Stored Status (ORD-8841)</span>
            </div>
            <div className={`sd-stat ${mergeState.isBug ? 'is-bad' : ''}`}>
              <b>{mergeState.filledQty.toLocaleString('en-US')} / 1,000</b>
              <span>Filled Qty</span>
            </div>
            <div className="sd-stat">
              <b>{mergeState.eventNs ? `${mergeState.eventNs} ms` : '—'}</b>
              <span>Stored event_ns</span>
            </div>
            <div className={`sd-stat ${mergeState.isBug ? 'is-bad' : mergeState.isIgnored ? 'is-good' : ''}`}>
              <b className="ob-verdict">{mergeState.verdict}</b>
              <span>Decision</span>
            </div>
          </div>

          <div className="ob-list" aria-label="Incoming event log">
            {ORDER_EVENTS.map((ev, idx) => {
              const processed = idx < step;
              const isCurrent = idx === step - 1;
              const isLate = ev.seq === 4;
              return (
                <div
                  key={ev.seq}
                  className={`ob-row ${processed ? 'is-done' : 'is-pending'} ${isCurrent ? 'is-current' : ''}`}
                >
                  <span className="ob-seq">#{ev.seq}</span>
                  <span className="ob-pill">{ev.status}</span>
                  <span className="ob-meta">
                    <code>event_ns={ev.eventNs}ms</code> (arrived {ev.arrivedAt}ms) · filled={ev.filledQty}
                  </span>
                  <span className="ob-note">
                    {isLate && <strong className="ob-late-tag">OUT OF ORDER</strong>} {ev.note}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="sd-controls">
            <div className="sd-group">
              <button
                type="button"
                className={`sd-btn ${insertedNew ? '' : 'is-on'}`}
                disabled={insertedNew}
                onClick={() => setInsertedNew(true)}
              >
                {insertedNew ? 'Inserted FILL-107 at top' : '+ Insert new fill at top (FILL-107)'}
              </button>
              <button
                type="button"
                className={`sd-btn ${page2Loaded ? '' : 'is-on'}`}
                disabled={page2Loaded}
                onClick={() => setPage2Loaded(true)}
              >
                {page2Loaded ? 'Page 2 loaded' : 'Load Page 2'}
              </button>
            </div>
            <div className="sd-group sd-run">
              <button
                type="button"
                className="sd-btn"
                onClick={() => {
                  setInsertedNew(false);
                  setPage2Loaded(false);
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="ob-cols">
            <div className="ob-col">
              <div className="ob-col-head">
                <strong>Page 1 (initial load)</strong>
                <span>cursor = (ts: {cursorTs}, id: {page1[2].id})</span>
              </div>
              {insertedNew && (
                <div className="ob-item is-new">
                  <span>{NEW_FILL.id}</span>
                  <span>ts={NEW_FILL.ts}</span>
                  <span className="ob-badge ob-badge-new">NEW</span>
                </div>
              )}
              {page1.map((r) => (
                <div key={r.id} className="ob-item">
                  <span>{r.id}</span>
                  <span>ts={r.ts}</span>
                  <span className="ob-badge">Page 1</span>
                </div>
              ))}
            </div>

            <div className="ob-col">
              <div className="ob-col-head">
                <strong>Offset Page 2</strong>
                <code>OFFSET 3 LIMIT 3</code>
              </div>
              {!page2Loaded ? (
                <p className="ob-empty">Click "Load Page 2" to fetch the next 3 rows.</p>
              ) : (
                <>
                  {offsetPage2.map((r) => {
                    const isDup = page1Ids.has(r.id);
                    return (
                      <div key={r.id} className={`ob-item ${isDup ? 'is-dup' : ''}`}>
                        <span>{r.id}</span>
                        <span>ts={r.ts}</span>
                        {isDup ? (
                          <span className="ob-badge ob-badge-dup">DUPLICATE</span>
                        ) : (
                          <span className="ob-badge">Page 2</span>
                        )}
                      </div>
                    );
                  })}
                  <p className={`ob-summary ${offsetDupCount > 0 ? 'is-bad' : ''}`}>
                    {offsetDupCount > 0
                      ? `${offsetDupCount} duplicate row (${offsetPage2[0].id}) shifted into Page 2!`
                      : '0 duplicates (no top inserts occurred)'}
                  </p>
                </>
              )}
            </div>

            <div className="ob-col">
              <div className="ob-col-head">
                <strong>Cursor Page 2</strong>
                <code>WHERE (ts, id) &lt; (104, 104)</code>
              </div>
              {!page2Loaded ? (
                <p className="ob-empty">Click "Load Page 2" to seek after FILL-104.</p>
              ) : (
                <>
                  {cursorPage2.map((r) => (
                    <div key={r.id} className="ob-item is-ok">
                      <span>{r.id}</span>
                      <span>ts={r.ts}</span>
                      <span className="ob-badge ob-badge-ok">Page 2</span>
                    </div>
                  ))}
                  <p className="ob-summary is-good">0 duplicates · 0 skipped rows</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
