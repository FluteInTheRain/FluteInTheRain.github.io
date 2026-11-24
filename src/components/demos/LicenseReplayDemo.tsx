import React, { useEffect, useId, useMemo, useRef, useState } from 'react';

// Step through a simulated event log for one Netflix member and watch the read models
// (Netflix calls them aggregates) rebuild: license state per title, and downloads per title
// this year. The renewal rule lives in the projection, so switching it and replaying the
// same events gives a different view. Rules from Netflix TechBlog (2017): a renewal sets
// the expiry 30 days past the current date; some titles may be downloaded twice a year.
// The events and days are made up; the first render is fixed, so SSR and client match.

type EventKind = 'created' | 'renewed' | 'released';
interface LogEvent {
  day: number;
  kind: EventKind;
  title: 'A' | 'B';
}

const EVENTS: LogEvent[] = [
  { day: 1, kind: 'created', title: 'A' },
  { day: 10, kind: 'renewed', title: 'A' },
  { day: 35, kind: 'created', title: 'B' },
  { day: 40, kind: 'released', title: 'A' },
  { day: 45, kind: 'renewed', title: 'B' },
  { day: 60, kind: 'created', title: 'A' },
];
// A command that arrives after the log: the handler rejects it, so it never becomes an event.
const REJECTED = { day: 80, title: 'A' as const };
const DOWNLOAD_LIMIT = 2;

const KIND_TEXT: Record<EventKind, { en: string; vi: string }> = {
  created: { en: 'License Created', vi: 'License Created' },
  renewed: { en: 'License Renewed', vi: 'License Renewed' },
  released: { en: 'License Released', vi: 'License Released' },
};

type Rule = 30 | 14;
interface LicenseView {
  status: 'active' | 'expired' | 'released';
  expires: number;
}

// The projection: replay events[0..upTo) in order with the given renewal rule.
function project(upTo: number, rule: Rule) {
  const licenses: Partial<Record<'A' | 'B', { expires: number; released: boolean }>> = {};
  const downloads: Record<'A' | 'B', number> = { A: 0, B: 0 };
  for (const ev of EVENTS.slice(0, upTo)) {
    if (ev.kind === 'created') {
      licenses[ev.title] = { expires: ev.day + rule, released: false };
      downloads[ev.title] += 1;
    } else if (ev.kind === 'renewed') {
      const lic = licenses[ev.title];
      if (lic) lic.expires = ev.day + rule;
    } else {
      const lic = licenses[ev.title];
      if (lic) lic.released = true;
    }
  }
  const today = upTo > 0 ? EVENTS[upTo - 1].day : 0;
  const view: Partial<Record<'A' | 'B', LicenseView>> = {};
  (['A', 'B'] as const).forEach((t) => {
    const lic = licenses[t];
    if (!lic) return;
    view[t] = { status: lic.released ? 'released' : today > lic.expires ? 'expired' : 'active', expires: lic.expires };
  });
  return { view, downloads, today };
}

const STATUS_TEXT: Record<LicenseView['status'], { en: string; vi: string }> = {
  active: { en: 'active', vi: 'còn hiệu lực' },
  expired: { en: 'expired', vi: 'hết hạn' },
  released: { en: 'released', vi: 'đã trả' },
};

export default function LicenseReplayDemo() {
  const sliderId = useId(); // rendered twice in the post (EN + VI), so the id must be unique
  const total = EVENTS.length;
  const [step, setStep] = useState<number>(total);
  const [rule, setRule] = useState<Rule>(30);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= total) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 900);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, total]);

  const { view, downloads, today } = useMemo(() => project(step, rule), [step, rule]);
  const other = useMemo(() => project(step, rule === 30 ? 14 : 30), [step, rule]);
  const activeCount = Object.values(view).filter((v) => v?.status === 'active').length;
  const showRejected = step === total;

  const replay = () => {
    setStep(0);
    setPlaying(true);
  };

  return (
    <div className="sd lr-demo">
      <style>{LR_CSS}</style>
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Step</span>
            <span data-lang-vi>Bước</span>
          </span>
          <button type="button" className="sd-btn" onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0}>
            <span data-lang-en>Back</span>
            <span data-lang-vi>Lùi</span>
          </button>
          <button type="button" className="sd-btn" onClick={() => { setPlaying(false); setStep((s) => Math.min(total, s + 1)); }} disabled={step === total}>
            <span data-lang-en>Next</span>
            <span data-lang-vi>Tiếp</span>
          </button>
          <button type="button" className="sd-btn" onClick={replay}>
            <span data-lang-en>Replay from event 1</span>
            <span data-lang-vi>Replay từ event 1</span>
          </button>
        </div>
        <div className="sd-group">
          <span>
            <span data-lang-en>Renewal rule in the projection</span>
            <span data-lang-vi>Luật gia hạn trong projection</span>
          </span>
          <button type="button" className={`sd-btn ${rule === 30 ? 'is-on' : ''}`} onClick={() => setRule(30)} aria-pressed={rule === 30}>
            <span data-lang-en>30 days (Netflix)</span>
            <span data-lang-vi>30 ngày (Netflix)</span>
          </button>
          <button type="button" className={`sd-btn ${rule === 14 ? 'is-on' : ''}`} onClick={() => setRule(14)} aria-pressed={rule === 14}>
            <span data-lang-en>14 days (what if)</span>
            <span data-lang-vi>14 ngày (giả sử)</span>
          </button>
        </div>
      </div>

      <label className="lr-scrub" htmlFor={sliderId}>
        <span data-lang-en>Events applied: {step} of {total}</span>
        <span data-lang-vi>Đã áp dụng: {step}/{total} event</span>
      </label>
      <input
        id={sliderId}
        className="lr-range"
        type="range"
        min={0}
        max={total}
        step={1}
        value={step}
        onChange={(e) => { setPlaying(false); setStep(Number(e.target.value)); }}
      />

      <div className="lr-cols">
        <div>
          <p className="lr-head">
            <span data-lang-en>Event log (append only)</span>
            <span data-lang-vi>Event log (chỉ ghi thêm)</span>
          </p>
          <ol className="lr-log">
            {EVENTS.map((ev, i) => {
              const state = i < step - 1 ? 'is-done' : i === step - 1 ? 'is-current' : 'is-pending';
              return (
                <li key={i} className={`lr-row ${state}`}>
                  <span className="lr-day">
                    <span data-lang-en>day {ev.day}</span>
                    <span data-lang-vi>ngày {ev.day}</span>
                  </span>
                  <span className="lr-kind">
                    <span data-lang-en>{KIND_TEXT[ev.kind].en}</span>
                    <span data-lang-vi>{KIND_TEXT[ev.kind].vi}</span>
                  </span>
                  <span className="lr-title">
                    <span data-lang-en>title {ev.title}</span>
                    <span data-lang-vi>phim {ev.title}</span>
                  </span>
                </li>
              );
            })}
            <li className={`lr-row is-rejected ${showRejected ? '' : 'is-hidden'}`}>
              <span className="lr-day">
                <span data-lang-en>day {REJECTED.day}</span>
                <span data-lang-vi>ngày {REJECTED.day}</span>
              </span>
              <span className="lr-kind">
                <span data-lang-en>Command: download title {REJECTED.title} again</span>
                <span data-lang-vi>Command: tải lại phim {REJECTED.title}</span>
              </span>
              <span className="lr-title">
                <span data-lang-en>rejected by the handler, not logged</span>
                <span data-lang-vi>handler từ chối, không ghi vào log</span>
              </span>
            </li>
          </ol>
        </div>

        <div>
          <p className="lr-head">
            <span data-lang-en>Views rebuilt from the log, as of day {today}</span>
            <span data-lang-vi>Các view dựng lại từ log, tính tới ngày {today}</span>
          </p>
          <div className="sd-stats">
            <div className="sd-stat">
              <b>{activeCount}</b>
              <span>
                <span data-lang-en>active licenses</span>
                <span data-lang-vi>license còn hiệu lực</span>
              </span>
            </div>
            <div className={`sd-stat ${downloads.A >= DOWNLOAD_LIMIT ? 'is-bad' : ''}`}>
              <b>{downloads.A} / {DOWNLOAD_LIMIT}</b>
              <span>
                <span data-lang-en>downloads of title A this year</span>
                <span data-lang-vi>lượt tải phim A năm nay</span>
              </span>
            </div>
          </div>
          <table className="lr-table">
            <thead>
              <tr>
                <th>
                  <span data-lang-en>Title</span>
                  <span data-lang-vi>Phim</span>
                </th>
                <th>
                  <span data-lang-en>Status</span>
                  <span data-lang-vi>Trạng thái</span>
                </th>
                <th>
                  <span data-lang-en>Expires</span>
                  <span data-lang-vi>Hết hạn</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(['A', 'B'] as const).map((t) => {
                const v = view[t];
                const o = other.view[t];
                return (
                  <tr key={t}>
                    <td>{t}</td>
                    <td>
                      {v ? (
                        <>
                          <span data-lang-en>{STATUS_TEXT[v.status].en}</span>
                          <span data-lang-vi>{STATUS_TEXT[v.status].vi}</span>
                        </>
                      ) : (
                        <>
                          <span data-lang-en>no license yet</span>
                          <span data-lang-vi>chưa có license</span>
                        </>
                      )}
                    </td>
                    <td>
                      {v ? (
                        <>
                          <span data-lang-en>day {v.expires}</span>
                          <span data-lang-vi>ngày {v.expires}</span>
                          {o && o.expires !== v.expires && (
                            <span className="lr-was">
                              <span data-lang-en> (day {o.expires} with the other rule)</span>
                              <span data-lang-vi> (ngày {o.expires} nếu dùng luật kia)</span>
                            </span>
                          )}
                        </>
                      ) : (
                        '–'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="lr-note">
            <span data-lang-en>
              Same {total} events either way. Switching the renewal rule only changes the projection, so the expiry dates
              are recomputed on replay and nothing in the log is edited.
            </span>
            <span data-lang-vi>
              Dù chọn luật nào thì vẫn là {total} event đó. Đổi luật gia hạn chỉ đổi projection, nên ngày hết hạn được tính
              lại khi replay và không event nào trong log bị sửa.
            </span>
          </p>
          <p className="lr-note lr-sim">
            <span data-lang-en>
              Simulated log. The 30-day renewal and the twice-a-year download limit are the
              rules Netflix described.
            </span>
            <span data-lang-vi>
              Log mô phỏng. Luật gia hạn 30 ngày và giới hạn tải hai lần một năm là luật Netflix
              đã mô tả.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const LR_CSS = `
.lr-demo .sd-group > span, .lr-demo .sd-stat span { text-transform: none; letter-spacing: 0; }
.lr-demo .sd-stat span { font-size: 12px; font-weight: 600; }
.lr-scrub { display: block; font-size: 13px; font-weight: 600; color: var(--text-muted); margin: 4px 0 4px; }
.lr-range { width: 100%; accent-color: var(--red); margin: 0 0 14px; }
.lr-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; }
@media (max-width: 640px) { .lr-cols { grid-template-columns: minmax(0, 1fr); } }
.prose .lr-head, .lr-head { margin: 0 0 8px; font-size: 13.5px; font-weight: 700; color: var(--text); }
.prose .lr-log, .lr-log { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.prose .lr-log li { margin: 0; }
.lr-row { display: flex; flex-wrap: wrap; gap: 4px 10px; align-items: baseline; padding: 7px 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-alt); font-size: 13px; }
.lr-row.is-pending { opacity: 0.4; }
.lr-row.is-current { border-color: var(--red); background: var(--red-tint-bg); }
.lr-row.is-current .lr-kind { color: var(--red); }
.lr-row.is-rejected { background: none; border-style: dashed; color: var(--text-muted); }
.lr-row.is-hidden { visibility: hidden; }
.lr-day { color: var(--text-muted); font-variant-numeric: tabular-nums; min-width: 52px; }
.lr-kind { font-weight: 700; color: var(--text); }
.lr-row.is-rejected .lr-kind { color: var(--text-muted); }
.lr-title { color: var(--text-body); }
.prose .lr-table, .lr-table { width: 100%; display: table; border-collapse: collapse; font-size: 13px; margin: 0 0 10px; }
.lr-table th, .lr-table td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); font-variant-numeric: tabular-nums; }
.lr-table th { color: var(--text-muted); font-weight: 700; }
.lr-was { color: var(--text-muted); font-size: 12px; }
.prose .lr-note, .lr-note { margin: 0 0 6px; font-size: 13px; color: var(--text-muted); line-height: 1.5; }
`;
