import { useMemo, useState } from 'react';

type RiskLimitMode = 'pass' | 'block';

interface StageInfo {
  step: number;
  component: string;
  title: string;
  detail: string;
}

const STAGES: StageInfo[] = [
  {
    step: 1,
    component: 'DataEngine',
    title: 'DataClient -> DataEngine',
    detail: 'Parses WebSocket frame into QuoteTick(FPT, bid=132.50, ask=132.60)',
  },
  {
    step: 2,
    component: 'Cache & MessageBus',
    title: 'DataEngine -> Cache -> MessageBus',
    detail: 'Writes cache.add_quote(tick) FIRST, then publishes on data.quotes.HOSE.FPT',
  },
  {
    step: 3,
    component: 'Strategy',
    title: 'Strategy.on_quote()',
    detail: 'Reads self.cache.quote(), creates LimitOrder(BUY 500 FPT @ 132.60)',
  },
  {
    step: 4,
    component: 'RiskEngine',
    title: 'RiskEngine Pre-Trade Gate',
    detail: 'Validates balance, max order qty (limit check), notional & rate limits',
  },
  {
    step: 5,
    component: 'ExecutionEngine',
    title: 'ExecutionEngine -> ExecutionClient',
    detail: 'Submits order over venue adapter while awaiting exchange acknowledgment',
  },
  {
    step: 6,
    component: 'Portfolio & Cache',
    title: 'Venue -> ExecutionEngine -> Cache',
    detail: 'OrderAccepted -> OrderFilled (500 @ 132.60); updates Cache & Portfolio',
  },
];

export default function NautilusFlowDemo() {
  const [riskLimit, setRiskLimit] = useState<RiskLimitMode>('pass');
  const [step, setStep] = useState<number>(3);

  const isBlocked = riskLimit === 'block' && step >= 4;
  const maxStep = riskLimit === 'block' ? 4 : STAGES.length;
  const effectiveStep = Math.min(step, maxStep);

  const snapshot = useMemo(() => {
    const active = STAGES[effectiveStep - 1]?.component ?? 'Idle';
    let orderStatus = '—';
    let isOpen = false;
    let isInflight = false;
    let isClosed = false;
    let outcome = 'Waiting';
    let isBad = false;
    let isGood = false;

    if (effectiveStep === 1 || effectiveStep === 2) {
      orderStatus = '—';
      outcome = effectiveStep === 1 ? 'Market data ingested' : 'Cache updated before pub';
    } else if (effectiveStep === 3) {
      orderStatus = 'INITIALIZED';
      outcome = 'SubmitOrder queued';
    } else if (effectiveStep === 4) {
      if (riskLimit === 'block') {
        orderStatus = 'DENIED';
        isClosed = true;
        outcome = 'BLOCKED: OrderDenied (qty 500 > limit 200)';
        isBad = true;
      } else {
        orderStatus = 'INITIALIZED';
        outcome = 'Allowed (qty 500 <= limit 1,000)';
        isGood = true;
      }
    } else if (effectiveStep === 5) {
      orderStatus = 'SUBMITTED';
      isInflight = true;
      outcome = 'In-flight (!is_open, NOT is_closed)';
    } else if (effectiveStep === 6) {
      orderStatus = 'ACCEPTED -> FILLED';
      isClosed = true;
      outcome = 'Filled 500 FPT @ 132.60';
      isGood = true;
    }

    return { active, orderStatus, isOpen, isInflight, isClosed, outcome, isBad, isGood };
  }, [effectiveStep, riskLimit]);

  return (
    <div className="sd ob-demo">
      <div className="sd-controls">
        <div className="sd-group" role="group" aria-label="RiskEngine max order quantity">
          <span>Risk Limit</span>
          <button
            type="button"
            className={`sd-btn ${riskLimit === 'pass' ? 'is-on' : ''}`}
            onClick={() => setRiskLimit('pass')}
          >
            Max 1,000 shares (Pass)
          </button>
          <button
            type="button"
            className={`sd-btn ${riskLimit === 'block' ? 'is-on' : ''}`}
            onClick={() => {
              setRiskLimit('block');
              if (step > 4) setStep(4);
            }}
          >
            Max 200 shares (Block)
          </button>
        </div>
        <div className="sd-group sd-run">
          <button
            type="button"
            className="sd-btn is-on"
            disabled={effectiveStep >= maxStep}
            onClick={() => setStep((s) => Math.min(maxStep, s + 1))}
          >
            {isBlocked
              ? 'Stopped at RiskEngine'
              : effectiveStep >= maxStep
                ? 'Cycle complete'
                : 'Step next stage'}
          </button>
          <button type="button" className="sd-btn" onClick={() => setStep(1)}>
            Reset
          </button>
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <b className="ob-verdict">{snapshot.active}</b>
          <span>Active Component</span>
        </div>
        <div className={`sd-stat ${snapshot.isBad ? 'is-bad' : snapshot.isGood ? 'is-good' : ''}`}>
          <b className="ob-verdict">{snapshot.orderStatus}</b>
          <span>OrderStatus</span>
        </div>
        <div className="sd-stat">
          <b className="ob-verdict">
            open:{String(snapshot.isOpen)} · inflight:{String(snapshot.isInflight)} · closed:{String(snapshot.isClosed)}
          </b>
          <span>Status Flags</span>
        </div>
        <div className={`sd-stat ${snapshot.isBad ? 'is-bad' : snapshot.isGood ? 'is-good' : ''}`}>
          <b className="ob-verdict">{snapshot.outcome}</b>
          <span>Gate / Lifecycle</span>
        </div>
      </div>

      <div className="ob-list" aria-label="NautilusKernel execution pipeline">
        {STAGES.map((st) => {
          const done = st.step <= effectiveStep;
          const current = st.step === effectiveStep;
          const blockedHere = isBlocked && st.step === 4;
          const skipped = isBlocked && st.step > 4;
          return (
            <div
              key={st.step}
              className={`ob-row ${done ? 'is-done' : 'is-pending'} ${current ? 'is-current' : ''}`}
              style={skipped ? { opacity: 0.3 } : undefined}
            >
              <span className="ob-seq">#{st.step}</span>
              <span className="ob-pill">{st.title}</span>
              <span className="ob-meta">
                {blockedHere ? (
                  <>
                    <strong className="ob-late-tag">DENIED</strong> Order qty 500 exceeds 200 limit — never hits ExecutionEngine
                  </>
                ) : skipped ? (
                  'Skipped (blocked by RiskEngine)'
                ) : (
                  st.detail
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
