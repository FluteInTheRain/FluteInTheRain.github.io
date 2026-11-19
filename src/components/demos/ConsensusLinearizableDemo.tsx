import { useMemo, useState } from 'react';

type Tab = 'quorum' | 'clocks';

// ---------- Tab 1: Quorum & Linearizability Checker (n=3, w=2, r=2) ----------
interface QuorumStepDesc {
  step: number;
  actor: string;
  en: string;
  vi: string;
}

const QUORUM_STEPS: QuorumStepDesc[] = [
  {
    step: 1,
    actor: 'Writer',
    en: 'Writer sends Write(x = 1, v1) to all 3 replicas. R1 updates immediately; packets to R2 & R3 are delayed in transit.',
    vi: 'Writer gửi Write(x = 1, v1) tới cả 3 replica. R1 cập nhật ngay; gói tin tới R2 & R3 bị trễ trên mạng.',
  },
  {
    step: 2,
    actor: 'Alice',
    en: 'Alice reads with r=2 from {R1, R2}. R1 has 1 (v1), R2 has 0 (v0). Alice picks the newer version and gets x = 1.',
    vi: 'Alice đọc với r=2 từ {R1, R2}. R1 giữ 1 (v1), R2 giữ 0 (v0). Alice chọn bản mới hơn và nhận x = 1.',
  },
  {
    step: 3,
    actor: 'Bob',
    en: 'After Alice finishes, Bob reads with r=2 from {R2, R3}. Without sync repair on R2, both R2 and R3 return stale 0 (v0)!',
    vi: 'Sau khi Alice xong, Bob đọc với r=2 từ {R2, R3}. Nếu chưa sửa R2 trước khi trả kết quả, cả R2 lẫn R3 đều trả về 0 (v0) cũ!',
  },
  {
    step: 4,
    actor: 'Writer',
    en: 'Delayed write packets reach R2 and R3 (w=2 satisfied). All replicas now hold x = 1 (v1).',
    vi: 'Các gói tin ghi bị trễ tới được R2 và R3 (đủ w=2). Giờ cả 3 replica đều giữ x = 1 (v1).',
  },
];

// ---------- Tab 2: Causal ID & Clock Stepper ----------
interface ClockEvent {
  id: number;
  node: 'A' | 'B';
  labelEn: string;
  labelVi: string;
  realMs: number;
  localWallMs: number;
  wallTs: number;
  lamport: [number, string];
  hlc: [number, number];
}

interface ActionSpec {
  node: 'A' | 'B';
  labelEn: string;
  labelVi: string;
  realMs: number;
}

const INITIAL_ACTIONS: ActionSpec[] = [
  {
    node: 'A',
    labelEn: 'Set account = private',
    labelVi: 'Đặt tài khoản = riêng tư',
    realMs: 200,
  },
  {
    node: 'B',
    labelEn: 'Upload private photo',
    labelVi: 'Đăng ảnh riêng tư',
    realMs: 250,
  },
];

function computeClockTimeline(actions: ActionSpec[], skewBMs: number, causalLink: boolean): ClockEvent[] {
  let lA = 0;
  let lB = 0;
  let hlcA: [number, number] = [0, 0];
  let hlcB: [number, number] = [0, 0];
  let lastSeenLamport = 0;
  let lastSeenHlc: [number, number] = [0, 0];

  return actions.map((act, idx) => {
    const localWallMs = act.node === 'A' ? act.realMs : Math.max(0, act.realMs + skewBMs);

    // Lamport update
    if (act.node === 'A') {
      if (causalLink && lastSeenLamport > lA) lA = lastSeenLamport;
      lA += 1;
      lastSeenLamport = Math.max(lastSeenLamport, lA);
    } else {
      if (causalLink && lastSeenLamport > lB) lB = lastSeenLamport;
      lB += 1;
      lastSeenLamport = Math.max(lastSeenLamport, lB);
    }
    const nodeTag = act.node === 'A' ? 'node-2 (acct)' : 'node-1 (photo)';
    const lamport: [number, string] = [act.node === 'A' ? lA : lB, nodeTag];

    // HLC update (CockroachDB / Kulkarni et al. rule)
    const cur = act.node === 'A' ? hlcA : hlcB;
    let baseWall = cur[0];
    let baseLog = cur[1];
    if (causalLink) {
      if (lastSeenHlc[0] > baseWall) {
        baseWall = lastSeenHlc[0];
        baseLog = lastSeenHlc[1];
      } else if (lastSeenHlc[0] === baseWall) {
        baseLog = Math.max(baseLog, lastSeenHlc[1]);
      }
    }

    let nextHlc: [number, number];
    if (localWallMs > baseWall) {
      nextHlc = [localWallMs, 0];
    } else {
      nextHlc = [baseWall, baseLog + 1];
    }

    if (act.node === 'A') {
      hlcA = nextHlc;
    } else {
      hlcB = nextHlc;
    }
    if (
      nextHlc[0] > lastSeenHlc[0] ||
      (nextHlc[0] === lastSeenHlc[0] && nextHlc[1] > lastSeenHlc[1])
    ) {
      lastSeenHlc = nextHlc;
    }

    return {
      id: idx + 1,
      node: act.node,
      labelEn: act.labelEn,
      labelVi: act.labelVi,
      realMs: act.realMs,
      localWallMs,
      wallTs: localWallMs,
      lamport,
      hlc: nextHlc,
    };
  });
}

function cmpLamport(a: [number, string], b: [number, string]): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  return a[1].localeCompare(b[1]);
}

function cmpHlc(a: [number, number], b: [number, number]): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  return a[1] - b[1];
}

export default function ConsensusLinearizableDemo() {
  const [tab, setTab] = useState<Tab>('quorum');

  // Mode 1 state: start at step 3 so the stale read is immediately visible on load
  const [repairOnRead, setRepairOnRead] = useState(false);
  const [quorumStep, setQuorumStep] = useState(3);

  // Mode 2 state: start with -120 ms skew and causalLink = true so reader sees Wall fail & HLC succeed
  const [skewB, setSkewB] = useState(-120);
  const [causalLink, setCausalLink] = useState(true);
  const [actions, setActions] = useState<ActionSpec[]>(INITIAL_ACTIONS);

  // Derived replica state for Mode 1
  const quorumView = useMemo(() => {
    const r1 = quorumStep >= 1 ? { val: 1, ver: 1 } : { val: 0, ver: 0 };
    const r2 =
      quorumStep >= 4
        ? { val: 1, ver: 1 }
        : quorumStep >= 2 && repairOnRead
          ? { val: 1, ver: 1 }
          : { val: 0, ver: 0 };
    const r3 = quorumStep >= 4 ? { val: 1, ver: 1 } : { val: 0, ver: 0 };

    const aliceVal = quorumStep >= 2 ? 1 : null;
    const bobVal = quorumStep >= 3 ? (repairOnRead ? 1 : 0) : null;
    const violated = quorumStep >= 3 && aliceVal === 1 && bobVal === 0;
    const repairedBob = quorumStep >= 3 && repairOnRead;

    return { r1, r2, r3, aliceVal, bobVal, violated, repairedBob };
  }, [quorumStep, repairOnRead]);

  // Derived timeline for Mode 2
  const clockEvents = useMemo(
    () => computeClockTimeline(actions, skewB, causalLink),
    [actions, skewB, causalLink],
  );

  const orderChecks = useMemo(() => {
    let wallReversed = 0;
    let lamportReversed = 0;
    let hlcReversed = 0;
    for (let i = 1; i < clockEvents.length; i++) {
      const prev = clockEvents[i - 1];
      const curr = clockEvents[i];
      if (curr.wallTs <= prev.wallTs) wallReversed += 1;
      if (cmpLamport(curr.lamport, prev.lamport) <= 0) lamportReversed += 1;
      if (cmpHlc(curr.hlc, prev.hlc) <= 0) hlcReversed += 1;
    }
    return { wallReversed, lamportReversed, hlcReversed };
  }, [clockEvents]);

  const addClockEvent = (node: 'A' | 'B') => {
    const lastReal = actions[actions.length - 1]?.realMs ?? 200;
    const nextReal = lastReal + 40;
    const num = actions.length + 1;
    setActions([
      ...actions,
      {
        node,
        labelEn: node === 'A' ? `Account update #${num}` : `Photo write #${num}`,
        labelVi: node === 'A' ? `Cập nhật tài khoản #${num}` : `Ghi ảnh #${num}`,
        realMs: nextReal,
      },
    ]);
  };

  return (
    <div className="sd con-demo">
      <div className="sd-controls">
        <div className="sd-group" role="tablist" aria-label="Consensus & clock scenarios">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'quorum'}
            className={`sd-btn ${tab === 'quorum' ? 'is-on' : ''}`}
            onClick={() => setTab('quorum')}
          >
            <span data-lang-en>1. Quorum &amp; Linearizability (n=3, w=2, r=2)</span>
            <span data-lang-vi>1. Quorum &amp; Khả tuyến tính (n=3, w=2, r=2)</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'clocks'}
            className={`sd-btn ${tab === 'clocks' ? 'is-on' : ''}`}
            onClick={() => setTab('clocks')}
          >
            <span data-lang-en>2. Causal ID &amp; Clock Stepper</span>
            <span data-lang-vi>2. Bộ đếm ID nhân quả &amp; Đồng hồ</span>
          </button>
        </div>
      </div>

      {tab === 'quorum' ? (
        <div>
          <div className="sd-controls">
            <div className="sd-group" role="group" aria-label="Read repair mode">
              <span>
                <span data-lang-en>Mode</span>
                <span data-lang-vi>Chế độ</span>
              </span>
              <button
                type="button"
                className={`sd-btn ${!repairOnRead ? 'is-on' : ''}`}
                onClick={() => setRepairOnRead(false)}
              >
                <span data-lang-en>Standard Dynamo (no sync repair)</span>
                <span data-lang-vi>Dynamo chuẩn (không sửa đồng bộ)</span>
              </button>
              <button
                type="button"
                className={`sd-btn ${repairOnRead ? 'is-on' : ''}`}
                onClick={() => setRepairOnRead(true)}
              >
                <span data-lang-en>Sync read-repair (repair before return)</span>
                <span data-lang-vi>Sửa đồng bộ khi đọc (read-repair)</span>
              </button>
            </div>

            <div className="sd-group sd-run">
              <button
                type="button"
                className="sd-btn is-on"
                disabled={quorumStep >= 4}
                onClick={() => setQuorumStep((s) => Math.min(4, s + 1))}
              >
                <span data-lang-en>{quorumStep >= 4 ? 'Done (4/4)' : `Step next (${quorumStep}/4)`}</span>
                <span data-lang-vi>{quorumStep >= 4 ? 'Xong (4/4)' : `Bước tiếp (${quorumStep}/4)`}</span>
              </button>
              <button type="button" className="sd-btn" onClick={() => setQuorumStep(0)}>
                <span data-lang-en>Reset</span>
                <span data-lang-vi>Làm lại</span>
              </button>
            </div>
          </div>

          <div className="sd-stats">
            <div className="sd-stat">
              <b>w=2 + r=2 &gt; n=3</b>
              <span>
                <span data-lang-en>Quorum rule</span>
                <span data-lang-vi>Điều kiện quorum</span>
              </span>
            </div>
            <div className="sd-stat">
              <b>{quorumView.aliceVal !== null ? `x = ${quorumView.aliceVal} (v1)` : '—'}</b>
              <span>
                <span data-lang-en>Alice read {'{R1, R2}'}</span>
                <span data-lang-vi>Alice đọc {'{R1, R2}'}</span>
              </span>
            </div>
            <div
              className={`sd-stat ${
                quorumView.violated ? 'is-bad' : quorumView.repairedBob ? 'is-good' : ''
              }`}
            >
              <b>
                {quorumView.bobVal !== null
                  ? `x = ${quorumView.bobVal} (v${quorumView.bobVal})`
                  : '—'}
              </b>
              <span>
                <span data-lang-en>Bob read {'{R2, R3}'}</span>
                <span data-lang-vi>Bob đọc {'{R2, R3}'}</span>
              </span>
            </div>
            <div
              className={`sd-stat ${
                quorumView.violated ? 'is-bad' : quorumStep >= 3 ? 'is-good' : ''
              }`}
            >
              <b className="con-verdict">
                {quorumView.violated ? (
                  <>
                    <span data-lang-en>VIOLATED: stale read</span>
                    <span data-lang-vi>VI PHẠM: đọc dữ liệu cũ</span>
                  </>
                ) : quorumStep >= 3 ? (
                  <>
                    <span data-lang-en>Linearizable read</span>
                    <span data-lang-vi>Đọc đúng khả tuyến tính</span>
                  </>
                ) : (
                  <>
                    <span data-lang-en>In progress</span>
                    <span data-lang-vi>Đang chạy</span>
                  </>
                )}
              </b>
              <span>
                <span data-lang-en>Recency verdict</span>
                <span data-lang-vi>Kết luận tính mới nhất</span>
              </span>
            </div>
          </div>

          <div className="con-replicas">
            {[
              {
                name: 'Replica R1',
                data: quorumView.r1,
                aliceHit: quorumStep >= 2,
                bobHit: false,
                repaired: false,
                delayed: false,
              },
              {
                name: 'Replica R2',
                data: quorumView.r2,
                aliceHit: quorumStep >= 2,
                bobHit: quorumStep >= 3,
                repaired: quorumStep >= 2 && repairOnRead && quorumStep < 4,
                delayed: quorumStep >= 1 && quorumStep < 4 && !(quorumStep >= 2 && repairOnRead),
              },
              {
                name: 'Replica R3',
                data: quorumView.r3,
                aliceHit: false,
                bobHit: quorumStep >= 3,
                repaired: false,
                delayed: quorumStep >= 1 && quorumStep < 4,
              },
            ].map((rep) => (
              <div
                key={rep.name}
                className={`con-rep ${
                  rep.data.val === 1 ? 'is-new' : rep.bobHit && quorumView.violated ? 'is-stale' : ''
                }`}
              >
                <div className="con-rep-head">
                  <strong>{rep.name}</strong>
                  <span className="con-ver-pill">v{rep.data.ver}</span>
                </div>
                <div className="con-rep-val">x = {rep.data.val}</div>
                <div className="con-rep-tags">
                  {rep.aliceHit && <span className="con-tag">Alice</span>}
                  {rep.bobHit && (
                    <span className={`con-tag ${quorumView.violated ? 'is-bad' : ''}`}>Bob</span>
                  )}
                  {rep.repaired && (
                    <span className="con-tag is-ok">
                      <span data-lang-en>repaired</span>
                      <span data-lang-vi>đã sửa</span>
                    </span>
                  )}
                  {rep.delayed && (
                    <span className="con-tag">
                      <span data-lang-en>write in transit</span>
                      <span data-lang-vi>ghi đang trên đường</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="con-list" aria-label="Quorum trace steps">
            {QUORUM_STEPS.map((st) => {
              const done = st.step <= quorumStep;
              const current = st.step === quorumStep;
              return (
                <div
                  key={st.step}
                  className={`con-row ${done ? 'is-done' : 'is-pending'} ${current ? 'is-current' : ''}`}
                >
                  <span className="con-seq">t{st.step}</span>
                  <span className="con-pill">{st.actor}</span>
                  <span className="con-text">
                    <span data-lang-en>{st.en}</span>
                    <span data-lang-vi>{st.vi}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="sd-controls">
            <div className="sd-group" role="group" aria-label="Node B clock skew">
              <span>
                <span data-lang-en>Node B clock skew</span>
                <span data-lang-vi>Lệch giờ Node B</span>
              </span>
              {[
                { val: -120, en: '-120 ms (slow)', vi: '-120 ms (chậm)' },
                { val: 0, en: '0 ms (synced)', vi: '0 ms (khớp)' },
                { val: 150, en: '+150 ms (fast)', vi: '+150 ms (nhanh)' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  className={`sd-btn ${skewB === opt.val ? 'is-on' : ''}`}
                  onClick={() => setSkewB(opt.val)}
                >
                  <span data-lang-en>{opt.en}</span>
                  <span data-lang-vi>{opt.vi}</span>
                </button>
              ))}
            </div>

            <div className="sd-group" role="group" aria-label="Causal timestamp propagation">
              <button
                type="button"
                className={`sd-btn ${causalLink ? 'is-on' : ''}`}
                aria-pressed={causalLink}
                onClick={() => setCausalLink((v) => !v)}
              >
                <span data-lang-en>Causal msg A → B: {causalLink ? 'ON' : 'OFF'}</span>
                <span data-lang-vi>Truyền tin nhân quả A → B: {causalLink ? 'BẬT' : 'TẮT'}</span>
              </button>
            </div>
          </div>

          <div className="sd-controls">
            <div className="sd-group">
              <button type="button" className="sd-btn" onClick={() => addClockEvent('A')}>
                <span data-lang-en>+ Event on Node A (acct)</span>
                <span data-lang-vi>+ Sự kiện Node A (acct)</span>
              </button>
              <button type="button" className="sd-btn" onClick={() => addClockEvent('B')}>
                <span data-lang-en>+ Event on Node B (photo)</span>
                <span data-lang-vi>+ Sự kiện Node B (photo)</span>
              </button>
            </div>
            <div className="sd-group sd-run">
              <button
                type="button"
                className="sd-btn"
                onClick={() => {
                  setSkewB(-120);
                  setCausalLink(true);
                  setActions(INITIAL_ACTIONS);
                }}
              >
                <span data-lang-en>Reset photo leak case</span>
                <span data-lang-vi>Đặt lại vụ lộ ảnh</span>
              </button>
            </div>
          </div>

          <div className="sd-stats">
            <div className={`sd-stat ${orderChecks.wallReversed > 0 ? 'is-bad' : 'is-good'}`}>
              <b>
                {orderChecks.wallReversed > 0 ? (
                  <>
                    <span data-lang-en>REVERSED ({orderChecks.wallReversed})</span>
                    <span data-lang-vi>ĐẢO NGƯỢC ({orderChecks.wallReversed})</span>
                  </>
                ) : (
                  <>
                    <span data-lang-en>Order OK</span>
                    <span data-lang-vi>Đúng thứ tự</span>
                  </>
                )}
              </b>
              <span>
                <span data-lang-en>Wall-clock (NTP)</span>
                <span data-lang-vi>Đồng hồ vật lý (NTP)</span>
              </span>
            </div>

            <div className={`sd-stat ${orderChecks.lamportReversed > 0 ? 'is-bad' : 'is-good'}`}>
              <b>
                {orderChecks.lamportReversed > 0 ? (
                  <>
                    <span data-lang-en>TIE-BREAK FAIL</span>
                    <span data-lang-vi>LỆCH KHI ĐỒNG COUNTER</span>
                  </>
                ) : (
                  <>
                    <span data-lang-en>Order OK (no wall time)</span>
                    <span data-lang-vi>Đúng thứ tự (mất giờ thực)</span>
                  </>
                )}
              </b>
              <span>
                <span data-lang-en>Lamport (c, nodeId)</span>
                <span data-lang-vi>Lamport (c, nodeId)</span>
              </span>
            </div>

            <div className={`sd-stat ${orderChecks.hlcReversed > 0 ? 'is-bad' : 'is-good'}`}>
              <b>
                {orderChecks.hlcReversed > 0 ? (
                  <>
                    <span data-lang-en>SHARD GAP (no msg)</span>
                    <span data-lang-vi>LỆCH DO KHÔNG TRUYỀN TIN</span>
                  </>
                ) : (
                  <>
                    <span data-lang-en>Causal + Wall OK</span>
                    <span data-lang-vi>Đúng nhân quả + Sát giờ thực</span>
                  </>
                )}
              </b>
              <span>
                <span data-lang-en>Hybrid Logical Clock</span>
                <span data-lang-vi>Đồng hồ logic lai (HLC)</span>
              </span>
            </div>
          </div>

          <div className="con-table-wrap">
            <table className="con-table">
              <thead>
                <tr>
                  <th>
                    <span data-lang-en>Real time &amp; Event</span>
                    <span data-lang-vi>Giờ thực &amp; Sự kiện</span>
                  </th>
                  <th>
                    <span data-lang-en>Wall clock (local)</span>
                    <span data-lang-vi>Đồng hồ vật lý</span>
                  </th>
                  <th>
                    <span data-lang-en>Lamport (c, id)</span>
                    <span data-lang-vi>Lamport (c, id)</span>
                  </th>
                  <th>
                    <span data-lang-en>HLC (wall, logical)</span>
                    <span data-lang-vi>HLC (vật lý, logic)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {clockEvents.map((ev, idx) => {
                  const prev = idx > 0 ? clockEvents[idx - 1] : null;
                  const wallBad = prev !== null && ev.wallTs <= prev.wallTs;
                  const lampBad = prev !== null && cmpLamport(ev.lamport, prev.lamport) <= 0;
                  const hlcBad = prev !== null && cmpHlc(ev.hlc, prev.hlc) <= 0;
                  return (
                    <tr key={ev.id}>
                      <td>
                        <span className="con-pill">{ev.node === 'A' ? 'Node A (node-2)' : 'Node B (node-1)'}</span>{' '}
                        <span className="con-ev-time">t={ev.realMs}ms</span>
                        <div className="con-ev-lbl">
                          <span data-lang-en>{ev.labelEn}</span>
                          <span data-lang-vi>{ev.labelVi}</span>
                        </div>
                      </td>
                      <td className={wallBad ? 'is-bad' : ''}>
                        {ev.wallTs} ms {wallBad ? '✕' : ''}
                      </td>
                      <td className={lampBad ? 'is-bad' : ''}>
                        ({ev.lamport[0]}, "{ev.lamport[1].split(' ')[0]}") {lampBad ? '✕' : ''}
                      </td>
                      <td className={hlcBad ? 'is-bad' : 'is-ok'}>
                        ({ev.hlc[0]} ms, {ev.hlc[1]}) {hlcBad ? '✕' : '✓'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
