import React, { useId, useMemo, useState } from 'react';

// Interactive stream windowing simulator for DDIA Ch. 12 ("Reasoning About Time"):
// - Compare Event Time vs Processing Time under a 60s consumer restart pause
// - Switch between Tumbling (1m), Hopping (2m / hop 1m), Sliding (1m), and Session (60s gap) windows
// - Scrub processing clock, inject an offline mobile straggler (event @ 10:00:40 arriving @ 10:05:25),
//   tune watermark slack (15s vs 300s), and toggle Drop vs Update + Retract late-event handling.
// First render is completely deterministic (no Math.random) so SSR and client HTML match.

type TimeDomain = 'event' | 'processing';
type WindowKind = 'tumbling' | 'hopping' | 'sliding' | 'session';
type LatePolicy = 'drop' | 'retract';

interface StreamEvent {
  id: string;
  eventSec: number;
  baseProcSec: number;
  isStraggler?: boolean;
}

interface ComputedWindow {
  key: string;
  label: string;
  startSec: number;
  endSec: number;
  closeSec: number;
  count: number;
  onTimeCount: number;
  lateIncluded: number;
  lateDropped: number;
  closed: boolean;
  retracted: boolean;
  hasRestartBurst: boolean;
  events: string[];
}

interface EmissionEntry {
  atSec: number;
  kind: 'emit' | 'retract' | 'update' | 'drop';
  windowLabel: string;
  value?: number;
  eventId?: string;
}

const BASE_EVENTS: StreamEvent[] = [
  { id: 'e1', eventSec: 15, baseProcSec: 18 },
  { id: 'e2', eventSec: 48, baseProcSec: 52 },
  { id: 'e3', eventSec: 72, baseProcSec: 75 },
  { id: 'e4', eventSec: 105, baseProcSec: 109 },
  { id: 'e5', eventSec: 132, baseProcSec: 136 },
  { id: 'e6', eventSec: 164, baseProcSec: 168 },
  { id: 'e7', eventSec: 195, baseProcSec: 199 },
  { id: 'e8', eventSec: 222, baseProcSec: 226 },
  // 73s quiet gap between 10:03:42 (222s) and 10:04:55 (295s) splits Session 1 from Session 2
  { id: 'e9', eventSec: 295, baseProcSec: 299 },
  { id: 'e10', eventSec: 315, baseProcSec: 319 },
];

const MOBILE_STRAGGLER: StreamEvent = {
  id: 'm1',
  eventSec: 40, // 10:00:40
  baseProcSec: 325, // 10:05:25 (4m 45s delayed offline mobile upload)
  isStraggler: true,
};

const MAX_CLOCK = 660; // 10:11:00
const MIN_CLOCK = 60;  // 10:01:00
const DEFAULT_CLOCK = 660;

function fmtTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `10:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function fmtMin(sec: number): string {
  const mins = Math.floor(sec / 60);
  return `10:${String(mins).padStart(2, '0')}`;
}

export default function StreamWindowDemo() {
  const sliderId = useId();
  const [domain, setDomain] = useState<TimeDomain>('processing');
  const [winKind, setWinKind] = useState<WindowKind>('tumbling');
  const [restartPause, setRestartPause] = useState<boolean>(true);
  const [stragglerOn, setStragglerOn] = useState<boolean>(true);
  const [slackSec, setSlackSec] = useState<number>(15);
  const [latePolicy, setLatePolicy] = useState<LatePolicy>('retract');
  const [clockSec, setClockSec] = useState<number>(DEFAULT_CLOCK);

  const sim = useMemo(() => {
    // 1. Resolve effective processing arrival time for each event
    const rawEvents = stragglerOn ? [...BASE_EVENTS, MOBILE_STRAGGLER] : [...BASE_EVENTS];
    const events = rawEvents
      .map((ev) => {
        let procSec = ev.baseProcSec;
        let queuedByRestart = false;
        if (restartPause && procSec >= 120 && procSec < 180) {
          // Consumer down during [10:02:00, 10:03:00): backlog drains right at 10:03:02+
          procSec = procSec === 136 ? 182 : 186;
          queuedByRestart = true;
        }
        return { ...ev, procSec, queuedByRestart };
      })
      .sort((a, b) => a.procSec - b.procSec);

    const arrived = events.filter((e) => e.procSec <= clockSec);

    // Helper: compute watermark at any processing clock c
    const watermarkAt = (c: number): number => {
      if (domain === 'processing') return c;
      // During consumer pause [120, 180), consumer cannot read new records so watermark pauses at last seen
      const readAt = restartPause && c >= 120 && c < 180 ? 119 : c;
      const seen = events.filter((e) => e.procSec <= readAt);
      const maxEv = seen.length ? Math.max(...seen.map((e) => e.eventSec)) : 0;
      // After last regular event finishes (319s), idle source advances clock steadily
      const progress = readAt > 325 ? Math.max(maxEv, readAt) : maxEv;
      return Math.max(0, progress - slackSec);
    };

    const currentWatermark = watermarkAt(clockSec);

    // Find earliest processing clock at which watermark >= target
    const firstClockWhereWatermarkReaches = (target: number): number => {
      for (let c = 0; c <= MAX_CLOCK; c += 1) {
        if (watermarkAt(c) >= target) return c;
      }
      return MAX_CLOCK + 1;
    };

    // Assigned timestamp under current time domain
    const stamp = (e: (typeof events)[number]) => (domain === 'event' ? e.eventSec : e.procSec);

    // 2. Determine window definitions and group arrived events
    const windows: ComputedWindow[] = [];
    const logs: EmissionEntry[] = [];
    let droppedTotal = 0;
    let retractedTotal = 0;

    if (winKind === 'tumbling' || winKind === 'hopping') {
      const size = winKind === 'tumbling' ? 60 : 120;
      const slide = 60;
      const endLimit = winKind === 'tumbling' ? 360 : 420;
      for (let start = 0; start < 360; start += slide) {
        const end = start + size;
        if (end > endLimit) break;
        const closeAt = domain === 'processing' ? end : firstClockWhereWatermarkReaches(end);
        const isClosed = clockSec >= closeAt;

        const matching = arrived.filter((e) => {
          const t = stamp(e);
          return t >= start && t < end;
        });

        let onTime = 0;
        let lateInc = 0;
        let lateDrop = 0;
        let retracted = false;
        const keptIds: string[] = [];

        if (isClosed) {
          // On-time events arrived strictly before or at closeAt
          for (const e of matching) {
            if (e.procSec <= closeAt) {
              onTime += 1;
              keptIds.push(e.id);
            } else if (domain === 'event') {
              if (latePolicy === 'drop') {
                lateDrop += 1;
                droppedTotal += 1;
                logs.push({
                  atSec: e.procSec,
                  kind: 'drop',
                  windowLabel: `${fmtMin(start)}–${fmtMin(end)}`,
                  eventId: e.id,
                });
              } else {
                lateInc += 1;
                keptIds.push(e.id);
                retracted = true;
              }
            }
          }
          logs.push({
            atSec: closeAt,
            kind: 'emit',
            windowLabel: `${fmtMin(start)}–${fmtMin(end)}`,
            value: onTime,
          });
          if (retracted) {
            retractedTotal += 1;
            const lateEv = matching.find((e) => e.procSec > closeAt);
            logs.push({
              atSec: lateEv ? lateEv.procSec : closeAt + 1,
              kind: 'retract',
              windowLabel: `${fmtMin(start)}–${fmtMin(end)}`,
              value: onTime,
            });
            logs.push({
              atSec: lateEv ? lateEv.procSec : closeAt + 1,
              kind: 'update',
              windowLabel: `${fmtMin(start)}–${fmtMin(end)}`,
              value: onTime + lateInc,
            });
          }
        } else {
          for (const e of matching) {
            onTime += 1;
            keptIds.push(e.id);
          }
        }

        const count = onTime + lateInc;
        const hasRestartBurst = domain === 'processing' && matching.some((e) => e.queuedByRestart);
        windows.push({
          key: `${start}-${end}`,
          label: `${fmtMin(start)}–${fmtMin(end)}`,
          startSec: start,
          endSec: end,
          closeSec: end,
          count,
          onTimeCount: onTime,
          lateIncluded: lateInc,
          lateDropped: lateDrop,
          closed: isClosed,
          retracted,
          hasRestartBurst,
          events: keptIds,
        });
      }
    } else if (winKind === 'sliding') {
      // Event-anchored 60s sliding windows [t, t+60s): deduplicated by unique event membership
      const sorted = [...arrived].sort((a, b) => stamp(a) - stamp(b));
      const seenSets = new Set<string>();
      for (const anchor of sorted) {
        const start = stamp(anchor);
        const end = start + 60;
        const closeAt = domain === 'processing' ? end : firstClockWhereWatermarkReaches(end);
        const isClosed = clockSec >= closeAt;

        const matching = sorted.filter((e) => {
          const t = stamp(e);
          return t >= start && t < end;
        });

        // Skip strict subsets already captured earlier unless it's a unique span
        const setSig = matching.map((e) => e.id).join(',');
        if (seenSets.has(setSig)) continue;
        seenSets.add(setSig);

        let onTime = 0;
        let lateInc = 0;
        let lateDrop = 0;
        let retracted = false;
        const keptIds: string[] = [];

        if (isClosed) {
          for (const e of matching) {
            if (e.procSec <= closeAt) {
              onTime += 1;
              keptIds.push(e.id);
            } else if (domain === 'event') {
              if (latePolicy === 'drop') {
                lateDrop += 1;
                droppedTotal += 1;
                logs.push({
                  atSec: e.procSec,
                  kind: 'drop',
                  windowLabel: `${fmtTime(start)}–${fmtTime(end)}`,
                  eventId: e.id,
                });
              } else {
                lateInc += 1;
                keptIds.push(e.id);
                retracted = true;
              }
            }
          }
          if (keptIds.length === 0 && lateDrop === 0) continue;
          logs.push({
            atSec: closeAt,
            kind: 'emit',
            windowLabel: `${fmtTime(start)}–${fmtTime(end)}`,
            value: onTime,
          });
          if (retracted) {
            retractedTotal += 1;
            const lateEv = matching.find((e) => e.procSec > closeAt);
            logs.push({
              atSec: lateEv ? lateEv.procSec : closeAt + 1,
              kind: 'retract',
              windowLabel: `${fmtTime(start)}–${fmtTime(end)}`,
              value: onTime,
            });
            logs.push({
              atSec: lateEv ? lateEv.procSec : closeAt + 1,
              kind: 'update',
              windowLabel: `${fmtTime(start)}–${fmtTime(end)}`,
              value: onTime + lateInc,
            });
          }
        } else {
          for (const e of matching) {
            onTime += 1;
            keptIds.push(e.id);
          }
        }

        windows.push({
          key: `sl-${start}`,
          label: `${fmtTime(start).slice(3)}`,
          startSec: start,
          endSec: end,
          closeSec: end,
          count: onTime + lateInc,
          onTimeCount: onTime,
          lateIncluded: lateInc,
          lateDropped: lateDrop,
          closed: isClosed,
          retracted,
          hasRestartBurst: domain === 'processing' && matching.some((e) => e.queuedByRestart),
          events: keptIds,
        });
      }
    } else {
      // Session windows: group events separated by <= 60s inactivity gap
      const gap = 60;
      const sorted = [...arrived].sort((a, b) => stamp(a) - stamp(b));
      const clusters: (typeof sorted)[] = [];
      for (const e of sorted) {
        const lastCluster = clusters[clusters.length - 1];
        if (!lastCluster || stamp(e) - stamp(lastCluster[lastCluster.length - 1]) > gap) {
          clusters.push([e]);
        } else {
          lastCluster.push(e);
        }
      }

      clusters.forEach((cluster, idx) => {
        // Check if session had already closed before any late event arrived
        const nonLate = cluster.filter((e) => !e.isStraggler);
        const baseEnd = nonLate.length ? stamp(nonLate[nonLate.length - 1]) : stamp(cluster[cluster.length - 1]);
        const closeTrigger = baseEnd + gap;
        const closeAt = domain === 'processing' ? closeTrigger : firstClockWhereWatermarkReaches(closeTrigger);
        const isClosed = clockSec >= closeAt;

        let onTime = 0;
        let lateInc = 0;
        let lateDrop = 0;
        let retracted = false;
        const keptIds: string[] = [];

        if (isClosed) {
          for (const e of cluster) {
            if (e.procSec <= closeAt) {
              onTime += 1;
              keptIds.push(e.id);
            } else if (domain === 'event') {
              if (latePolicy === 'drop') {
                lateDrop += 1;
                droppedTotal += 1;
                logs.push({
                  atSec: e.procSec,
                  kind: 'drop',
                  windowLabel: `Session #${idx + 1}`,
                  eventId: e.id,
                });
              } else {
                lateInc += 1;
                keptIds.push(e.id);
                retracted = true;
              }
            }
          }
          logs.push({
            atSec: closeAt,
            kind: 'emit',
            windowLabel: `Session #${idx + 1}`,
            value: onTime,
          });
          if (retracted) {
            retractedTotal += 1;
            const lateEv = cluster.find((e) => e.procSec > closeAt);
            logs.push({
              atSec: lateEv ? lateEv.procSec : closeAt + 1,
              kind: 'retract',
              windowLabel: `Session #${idx + 1}`,
              value: onTime,
            });
            logs.push({
              atSec: lateEv ? lateEv.procSec : closeAt + 1,
              kind: 'update',
              windowLabel: `Session #${idx + 1}`,
              value: onTime + lateInc,
            });
          }
        } else {
          for (const e of cluster) {
            onTime += 1;
            keptIds.push(e.id);
          }
        }

        const startSec = stamp(cluster[0]);
        const endSec = stamp(cluster[cluster.length - 1]);
        windows.push({
          key: `sess-${idx}`,
          label: `${fmtTime(startSec).slice(3)}–${fmtTime(endSec).slice(3)}`,
          startSec,
          endSec,
          closeSec: closeTrigger,
          count: onTime + lateInc,
          onTimeCount: onTime,
          lateIncluded: lateInc,
          lateDropped: lateDrop,
          closed: isClosed,
          retracted,
          hasRestartBurst: domain === 'processing' && cluster.some((e) => e.queuedByRestart),
          events: keptIds,
        });
      });
    }

    logs.sort((a, b) => a.atSec - b.atSec);
    const maxCount = Math.max(4, ...windows.map((w) => w.count));
    const hasFalseSpike = domain === 'processing' && restartPause;

    return {
      arrived,
      windows,
      logs,
      currentWatermark,
      droppedTotal,
      retractedTotal,
      maxCount,
      hasFalseSpike,
    };
  }, [domain, winKind, restartPause, stragglerOn, slackSec, latePolicy, clockSec]);

  return (
    <div className="sd str">
      <div className="sd-controls">
        <div className="sd-group">
          <span className="str-grp-lbl">
            <span data-lang-en>Clock basis</span>
            <span data-lang-vi>Mốc thời gian</span>
          </span>
          <button
            type="button"
            className={domain === 'processing' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={domain === 'processing'}
            onClick={() => setDomain('processing')}
          >
            <span data-lang-en>Processing time</span>
            <span data-lang-vi>Thời gian xử lý</span>
          </button>
          <button
            type="button"
            className={domain === 'event' ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={domain === 'event'}
            onClick={() => setDomain('event')}
          >
            <span data-lang-en>Event time</span>
            <span data-lang-vi>Thời gian sự kiện</span>
          </button>
        </div>

        <div className="sd-group">
          <span className="str-grp-lbl">
            <span data-lang-en>Window</span>
            <span data-lang-vi>Cửa sổ</span>
          </span>
          {(
            [
              ['tumbling', 'Tumbling (1m)', 'Tumbling (1p)'],
              ['hopping', 'Hopping (2m / 1m)', 'Hopping (2p / 1p)'],
              ['sliding', 'Sliding (1m)', 'Sliding (1p)'],
              ['session', 'Session (60s gap)', 'Session (nghỉ 60s)'],
            ] as const
          ).map(([k, en, vi]) => (
            <button
              key={k}
              type="button"
              className={winKind === k ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={winKind === k}
              onClick={() => setWinKind(k)}
            >
              <span data-lang-en>{en}</span>
              <span data-lang-vi>{vi}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sd-controls">
        <div className="sd-group">
          <span className="str-grp-lbl">
            <span data-lang-en>Anomalies</span>
            <span data-lang-vi>Sự cố</span>
          </span>
          <button
            type="button"
            className={restartPause ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={restartPause}
            onClick={() => setRestartPause(!restartPause)}
          >
            <span data-lang-en>Consumer restart (10:02 pause)</span>
            <span data-lang-vi>Restart consumer (dừng lúc 10:02)</span>
          </button>
          <button
            type="button"
            className={stragglerOn ? 'sd-btn is-on' : 'sd-btn'}
            aria-pressed={stragglerOn}
            onClick={() => setStragglerOn(!stragglerOn)}
          >
            <span data-lang-en>Offline mobile straggler</span>
            <span data-lang-vi>Sự kiện di động đến muộn</span>
          </button>
        </div>

        {domain === 'event' && (
          <div className="sd-group">
            <span className="str-grp-lbl">
              <span data-lang-en>Watermark slack</span>
              <span data-lang-vi>Độ trễ watermark</span>
            </span>
            <button
              type="button"
              className={slackSec === 15 ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={slackSec === 15}
              onClick={() => setSlackSec(15)}
            >
              <span data-lang-en>15s (fast emit)</span>
              <span data-lang-vi>15s (chốt nhanh)</span>
            </button>
            <button
              type="button"
              className={slackSec === 300 ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={slackSec === 300}
              onClick={() => setSlackSec(300)}
            >
              <span data-lang-en>300s (wait for offline)</span>
              <span data-lang-vi>300s (đợi máy offline)</span>
            </button>
          </div>
        )}

        {domain === 'event' && (
          <div className="sd-group">
            <span className="str-grp-lbl">
              <span data-lang-en>Late policy</span>
              <span data-lang-vi>Xử lý tin trễ</span>
            </span>
            <button
              type="button"
              className={latePolicy === 'drop' ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={latePolicy === 'drop'}
              onClick={() => setLatePolicy('drop')}
            >
              <span data-lang-en>Drop</span>
              <span data-lang-vi>Bỏ qua</span>
            </button>
            <button
              type="button"
              className={latePolicy === 'retract' ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={latePolicy === 'retract'}
              onClick={() => setLatePolicy('retract')}
            >
              <span data-lang-en>Update + retract</span>
              <span data-lang-vi>Cập nhật + thu hồi</span>
            </button>
          </div>
        )}
      </div>

      <div className="str-scrubber">
        <label htmlFor={sliderId} className="str-scrubber-lbl">
          <span data-lang-en>Processor clock: <b>{fmtTime(clockSec)}</b></span>
          <span data-lang-vi>Đồng hồ hệ thống: <b>{fmtTime(clockSec)}</b></span>
        </label>
        <input
          id={sliderId}
          type="range"
          min={MIN_CLOCK}
          max={MAX_CLOCK}
          step={15}
          value={clockSec}
          onChange={(e) => setClockSec(Number(e.target.value))}
          className="str-range"
        />
        <div className="sd-group">
          <button
            type="button"
            className="sd-btn"
            disabled={clockSec >= MAX_CLOCK}
            onClick={() => setClockSec(Math.min(MAX_CLOCK, clockSec + 30))}
          >
            <span data-lang-en>Step +30s</span>
            <span data-lang-vi>Tiến +30s</span>
          </button>
          <button
            type="button"
            className="sd-btn"
            onClick={() => setClockSec(clockSec === DEFAULT_CLOCK ? 180 : DEFAULT_CLOCK)}
          >
            <span data-lang-en>{clockSec === DEFAULT_CLOCK ? 'Jump to 10:03' : 'Jump to end'}</span>
            <span data-lang-vi>{clockSec === DEFAULT_CLOCK ? 'Tới 10:03' : 'Tới cuối'}</span>
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b>{sim.arrived.length}</b>
          <span>
            <span data-lang-en>events read</span>
            <span data-lang-vi>sự kiện đã đọc</span>
          </span>
        </div>
        <div className="sd-stat">
          <b>{domain === 'event' ? fmtTime(sim.currentWatermark) : '—'}</b>
          <span>
            <span data-lang-en>watermark</span>
            <span data-lang-vi>mốc watermark</span>
          </span>
        </div>
        <div className={`sd-stat${sim.hasFalseSpike ? ' is-bad' : ''}`}>
          <b>
            {sim.hasFalseSpike ? (
              <>
                <span data-lang-en>Fake 2× spike</span>
                <span data-lang-vi>Đỉnh giả gấp đôi</span>
              </>
            ) : (
              <>
                <span data-lang-en>True rate</span>
                <span data-lang-vi>Tốc độ thật</span>
              </>
            )}
          </b>
          <span>
            <span data-lang-en>traffic signal</span>
            <span data-lang-vi>tín hiệu biểu đồ</span>
          </span>
        </div>
        <div className={`sd-stat${sim.droppedTotal > 0 ? ' is-bad' : ''}`}>
          <b>{domain === 'event' ? (latePolicy === 'drop' ? sim.droppedTotal : sim.retractedTotal) : 0}</b>
          <span>
            <span data-lang-en>{latePolicy === 'drop' ? 'dropped late events' : 'window retractions'}</span>
            <span data-lang-vi>{latePolicy === 'drop' ? 'tin trễ bị bỏ' : 'lần thu hồi & sửa'}</span>
          </span>
        </div>
      </div>

      <div className="str-body">
        <div className="str-bars-panel">
          <p className="str-panel-title">
            <span data-lang-en>Window counts ({winKind})</span>
            <span data-lang-vi>Số lượng theo cửa sổ ({winKind})</span>
          </p>
          <div className="str-bars">
            {sim.windows.map((w) => {
              const pct = Math.round((w.count / sim.maxCount) * 100);
              const isBad = w.hasRestartBurst || (w.count === 0 && domain === 'processing' && restartPause && w.startSec === 120);
              return (
                <div
                  key={w.key}
                  className={`str-bar-col${isBad ? ' is-bad' : ''}${w.retracted ? ' is-retracted' : ''}${!w.closed ? ' is-open' : ''}`}
                >
                  <div className="str-bar-track">
                    <span className="str-bar-count">{w.count}</span>
                    <div className="str-bar-fill" style={{ height: `${Math.max(4, pct)}%` }} />
                  </div>
                  <span className="str-bar-lbl">{w.label}</span>
                  <span className="str-bar-state">
                    {!w.closed ? (
                      <>
                        <span data-lang-en>open</span>
                        <span data-lang-vi>đang mở</span>
                      </>
                    ) : w.retracted ? (
                      <>
                        <span data-lang-en>updated</span>
                        <span data-lang-vi>đã sửa</span>
                      </>
                    ) : w.lateDropped > 0 ? (
                      <>
                        <span data-lang-en>{w.lateDropped} dropped</span>
                        <span data-lang-vi>bỏ {w.lateDropped}</span>
                      </>
                    ) : (
                      <>
                        <span data-lang-en>closed</span>
                        <span data-lang-vi>đã chốt</span>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="str-hint">
            {domain === 'processing' ? (
              <>
                <span data-lang-en>In processing time, pausing at 10:02 drops that bucket to 0 and stacks its backlog onto 10:03. Switch to Event time to place every event back where it occurred.</span>
                <span data-lang-vi>Theo thời gian xử lý, dừng lúc 10:02 làm cột đó tụt về 0 rồi dồn hết sang 10:03. Chuyển sang Thời gian sự kiện để trả từng sự kiện về đúng lúc nó xảy ra.</span>
              </>
            ) : (
              <>
                <span data-lang-en>Watermark {fmtTime(sim.currentWatermark)} marks how far event time has safely progressed. {stragglerOn ? 'Mobile event m1 (10:00:40) arrives at 10:05:25—try 15s vs 300s slack.' : 'Enable the offline mobile straggler to test late arrival behavior.'}</span>
                <span data-lang-vi>Watermark {fmtTime(sim.currentWatermark)} đánh dấu thời gian sự kiện đã trôi qua an toàn. {stragglerOn ? 'Sự kiện di động m1 (10:00:40) tới lúc 10:05:25 — thử đổi độ trễ 15s và 300s.' : 'Bật sự kiện di động đến muộn để thử hành vi trễ.'}</span>
              </>
            )}
          </p>
        </div>

        <div className="str-log-panel">
          <p className="str-panel-title">
            <span data-lang-en>Output log</span>
            <span data-lang-vi>Nhật ký xuất kết quả</span>
          </p>
          {sim.logs.length === 0 ? (
            <p className="str-empty">
              <span data-lang-en>No windows closed yet — advance the clock.</span>
              <span data-lang-vi>Chưa có cửa sổ nào đóng — hãy kéo đồng hồ tiến lên.</span>
            </p>
          ) : (
            <ul className="str-log" aria-live="polite">
              {sim.logs.slice(-7).map((entry, idx) => (
                <li key={idx} className={`str-log-item is-${entry.kind}`}>
                  <span className="str-log-ts">{fmtTime(entry.atSec)}</span>
                  <span className="str-log-msg">
                    {entry.kind === 'emit' && (
                      <>
                        <span data-lang-en>Emit {entry.windowLabel} → {entry.value}</span>
                        <span data-lang-vi>Chốt {entry.windowLabel} → {entry.value}</span>
                      </>
                    )}
                    {entry.kind === 'retract' && (
                      <>
                        <span data-lang-en>Retract {entry.windowLabel} (−{entry.value})</span>
                        <span data-lang-vi>Thu hồi {entry.windowLabel} (−{entry.value})</span>
                      </>
                    )}
                    {entry.kind === 'update' && (
                      <>
                        <span data-lang-en>Update {entry.windowLabel} → +{entry.value}</span>
                        <span data-lang-vi>Cập nhật {entry.windowLabel} → +{entry.value}</span>
                      </>
                    )}
                    {entry.kind === 'drop' && (
                      <>
                        <span data-lang-en>Dropped late {entry.eventId} (past watermark for {entry.windowLabel})</span>
                        <span data-lang-vi>Bỏ qua {entry.eventId} đến muộn (quá watermark của {entry.windowLabel})</span>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
