import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import type { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

type Mode = 'naive' | 'optimized';
interface Row {
  id: string;
  symbol: string;
  last: number;
  changePct: number;
  bid: number;
  ask: number;
  volume: number;
}

const FEED_MS = 25; // how often the "network" delivers a message
const FLUSH_MS = 100; // optimized mode: how often coalesced updates reach the grid
const ROW_OPTIONS = [500, 2000, 10000];
const RATE_OPTIONS = [500, 2000, 5000]; // incoming updates per second

const round = (n: number) => Math.round(n * 100) / 100;

function createRows(count: number): { rows: Row[]; open: number[] } {
  const rows: Row[] = [];
  const open: number[] = [];
  for (let i = 0; i < count; i++) {
    const price = round(20 + Math.random() * 480);
    const id = `SYM${String(i).padStart(5, '0')}`;
    open.push(price);
    rows.push({ id, symbol: id, last: price, changePct: 0, bid: round(price - 0.02), ask: round(price + 0.02), volume: 0 });
  }
  return { rows, open };
}

/** Produce a new object for one randomly chosen row (rows are treated as immutable). */
function tickRow(row: Row, open: number): Row {
  const last = Math.max(1, round(row.last * (1 + (Math.random() - 0.5) * 0.004)));
  return {
    ...row,
    last,
    changePct: round(((last - open) / open) * 100),
    bid: round(last - 0.02),
    ask: round(last + 0.02),
    volume: row.volume + Math.floor(Math.random() * 500),
  };
}

/* ---- Naive cell renderer: a React component per cell, re-created on every refresh ---- */
function ChangeRenderer(p: ICellRendererParams<Row, number>) {
  const v = p.value ?? 0;
  return <span className={v >= 0 ? 'sd-up' : 'sd-down'}>{`${v >= 0 ? '+' : ''}${v.toFixed(2)}%`}</span>;
}

const fmtPrice = (p: { value?: number }) => (p.value == null ? '' : p.value.toFixed(2));
const fmtVolume = (p: { value?: number }) => (p.value == null ? '' : p.value.toLocaleString('en-US'));
const fmtChange = (p: { value?: number }) => (p.value == null ? '' : `${p.value >= 0 ? '+' : ''}${p.value.toFixed(2)}%`);

function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setDark(el.getAttribute('data-theme') === 'dark');
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return dark;
}

/** Measures frames per second and the longest gap between frames over the last second. */
function useFrameStats(active: boolean) {
  const [stats, setStats] = useState({ fps: 0, longest: 0 });
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    let windowStart = last;
    let frames = 0;
    let longest = 0;
    const loop = (now: number) => {
      frames++;
      longest = Math.max(longest, now - last);
      last = now;
      if (now - windowStart >= 1000) {
        setStats({ fps: Math.round((frames * 1000) / (now - windowStart)), longest: Math.round(longest) });
        frames = 0;
        longest = 0;
        windowStart = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return stats;
}

interface Props {
  autoStart?: boolean;
  initialMode?: Mode;
}

export default function GridStreamingDemo({ autoStart = false, initialMode = 'naive' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [rowCount, setRowCount] = useState(2000);
  const [rate, setRate] = useState(2000);
  const [running, setRunning] = useState(autoStart);
  const [applied, setApplied] = useState(0);
  const dark = useIsDark();
  const { fps, longest } = useFrameStats(running);

  const apiRef = useRef<GridApi<Row> | null>(null);
  const dataRef = useRef(createRows(rowCount));
  const pending = useRef(new Map<string, Row>()); // optimized mode: latest update per row id
  const appliedCounter = useRef(0);

  // Rebuild the dataset whenever the shape of the experiment changes.
  const initialRows = useMemo(() => {
    dataRef.current = createRows(rowCount);
    pending.current.clear();
    return dataRef.current.rows.slice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowCount, mode]);

  const onGridReady = useCallback((e: GridReadyEvent<Row>) => {
    apiRef.current = e.api;
  }, []);

  // The "feed": generates updates at the chosen rate, independent of how the grid consumes them.
  useEffect(() => {
    if (!running) return;
    const perTick = Math.max(1, Math.round((rate * FEED_MS) / 1000));
    const id = setInterval(() => {
      const { rows, open } = dataRef.current;
      for (let i = 0; i < perTick; i++) {
        const idx = Math.floor(Math.random() * rows.length);
        const next = tickRow(rows[idx], open[idx]);
        rows[idx] = next;
        if (mode === 'optimized') pending.current.set(next.id, next); // coalesce: latest wins
      }
      if (mode === 'naive') {
        // Anti-pattern: hand the grid a brand-new dataset for every message.
        apiRef.current?.setGridOption('rowData', rows.map((r) => ({ ...r })));
        appliedCounter.current += rows.length;
      }
    }, FEED_MS);
    return () => clearInterval(id);
  }, [running, rate, mode, rowCount]);

  // Optimized mode: flush the coalesced updates in one batch.
  useEffect(() => {
    if (!running || mode !== 'optimized') return;
    const id = setInterval(() => {
      if (pending.current.size === 0) return;
      const batch = Array.from(pending.current.values());
      pending.current.clear();
      apiRef.current?.applyTransaction({ update: batch });
      appliedCounter.current += batch.length;
    }, FLUSH_MS);
    return () => clearInterval(id);
  }, [running, mode, rowCount]);

  // Rows touched in the grid per second.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setApplied(appliedCounter.current);
      appliedCounter.current = 0;
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const columnDefs = useMemo<ColDef<Row>[]>(() => {
    if (mode === 'naive') {
      return [
        { field: 'symbol', width: 120 },
        { field: 'last', valueFormatter: fmtPrice, type: 'numericColumn' },
        { field: 'changePct', headerName: 'Chg %', cellRenderer: ChangeRenderer, type: 'numericColumn' },
        { field: 'bid', valueFormatter: fmtPrice, type: 'numericColumn' },
        { field: 'ask', valueFormatter: fmtPrice, type: 'numericColumn' },
        { field: 'volume', valueFormatter: fmtVolume, type: 'numericColumn' },
      ];
    }
    return [
      { field: 'symbol', width: 120 },
      { field: 'last', valueFormatter: fmtPrice, type: 'numericColumn', enableCellChangeFlash: true },
      {
        field: 'changePct',
        headerName: 'Chg %',
        valueFormatter: fmtChange,
        type: 'numericColumn',
        cellClassRules: { 'sd-up': (p) => (p.value ?? 0) >= 0, 'sd-down': (p) => (p.value ?? 0) < 0 },
      },
      { field: 'bid', valueFormatter: fmtPrice, type: 'numericColumn' },
      { field: 'ask', valueFormatter: fmtPrice, type: 'numericColumn' },
      { field: 'volume', valueFormatter: fmtVolume, type: 'numericColumn' },
    ];
  }, [mode]);

  const defaultColDef = useMemo<ColDef<Row>>(() => ({ flex: 1, minWidth: 90, sortable: false, suppressMovable: true }), []);
  const getRowId = useCallback((p: { data: Row }) => p.data.id, []);
  const optimized = mode === 'optimized';
  const toggle = (on: boolean) => (on ? 'sd-btn is-on' : 'sd-btn');

  return (
    <div className="sd" data-ag-theme-mode={dark ? 'dark' : 'light'}>
      <div className="sd-controls">
        <div className="sd-group">
          <span>Approach</span>
          <button className={toggle(!optimized)} onClick={() => setMode('naive')}>Naive</button>
          <button className={toggle(optimized)} onClick={() => setMode('optimized')}>Optimized</button>
        </div>
        <div className="sd-group">
          <span>Rows</span>
          {ROW_OPTIONS.map((n) => (
            <button key={n} className={toggle(rowCount === n)} onClick={() => setRowCount(n)}>{n.toLocaleString('en-US')}</button>
          ))}
        </div>
        <div className="sd-group">
          <span>Updates/s</span>
          {RATE_OPTIONS.map((n) => (
            <button key={n} className={toggle(rate === n)} onClick={() => setRate(n)}>{n.toLocaleString('en-US')}</button>
          ))}
        </div>
        <button className={`${toggle(running)} sd-run`} onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause stream' : 'Start stream'}
        </button>
      </div>

      <div className="sd-stats">
        <div className={`sd-stat${running && fps > 0 && fps < 30 ? ' is-bad' : ''}`}><b>{running ? fps : '–'}</b><span>UI frames / s</span></div>
        <div className={`sd-stat${running && longest > 100 ? ' is-bad' : ''}`}><b>{running ? `${longest} ms` : '–'}</b><span>Longest frame</span></div>
        <div className="sd-stat"><b>{running ? rate.toLocaleString('en-US') : '–'}</b><span>Incoming updates / s</span></div>
        <div className="sd-stat"><b>{running ? applied.toLocaleString('en-US') : '–'}</b><span>Rows pushed to grid / s</span></div>
      </div>

      <div className="sd-grid">
        <AgGridReact<Row>
          key={`${mode}-${rowCount}`}
          theme={themeQuartz}
          rowData={initialRows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={optimized ? getRowId : undefined}
          animateRows={!optimized}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
}
