import React, { useState } from 'react';

// The two chains below match a real Go 1.27.1 run (darwin/arm64) of:
//   inner := fmt.Errorf("load profile 7: "+verb, ErrNotFound)   // verb is %w or %v
//   outer := fmt.Errorf("handle request: %w", inner)
//   errors.Is(outer, ErrNotFound)  -> true for %w, false for %v
type Layer = { text: string; code: string };

function buildLayers(verb: '%w' | '%v'): Layer[] {
  return [
    { text: 'handle request: load profile 7: not found', code: 'fmt.Errorf("handle request: %w", inner)' },
    { text: 'load profile 7: not found', code: `fmt.Errorf("load profile 7: ${verb}", ErrNotFound)` },
    { text: 'not found', code: 'errors.New("not found")  // ErrNotFound' },
  ];
}

export default function GoErrorChainDemo() {
  const [verb, setVerb] = useState<'%w' | '%v'>('%w');
  const [step, setStep] = useState(0);
  const layers = buildLayers(verb);
  // Layer 1 (middle) only links to the root when it was built with %w.
  const links = [true, verb === '%w'];
  const maxStep = links[1] ? 2 : 1;
  const at = Math.min(step, maxStep);
  const canUnwrap = at < maxStep;
  const isFound = maxStep === 2;

  const choose = (v: '%w' | '%v') => {
    setVerb(v);
    setStep(0);
  };

  return (
    <div className="sd gec">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Middle layer wraps with</span>
            <span data-lang-vi>Tầng giữa bọc bằng</span>
          </span>
          <button type="button" className={verb === '%w' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => choose('%w')}>%w</button>
          <button type="button" className={verb === '%v' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => choose('%v')}>%v</button>
        </div>
        <div className="sd-group">
          <button type="button" className="sd-btn" disabled={!canUnwrap} onClick={() => setStep(at + 1)}>
            <span data-lang-en>errors.Unwrap one layer</span>
            <span data-lang-vi>errors.Unwrap một tầng</span>
          </button>
          <button type="button" className="sd-btn" disabled={at === 0} onClick={() => setStep(0)}>
            <span data-lang-en>Reset</span>
            <span data-lang-vi>Làm lại</span>
          </button>
        </div>
      </div>

      <ol className="gec-chain">
        {layers.map((l, i) => {
          const isCurrent = i === at;
          const isReachable = i <= maxStep;
          const cls = ['gec-layer', isCurrent ? 'is-current' : '', !isReachable ? 'is-cut' : '', i < at ? 'is-peeled' : ''].join(' ').trim();
          return (
            <li key={i} className={cls}>
              <code className="gec-code">{l.code}</code>
              <span className="gec-text">{l.text}</span>
              {i < layers.length - 1 && (
                <span className="gec-link" aria-hidden="true">
                  {links[i] ? '↓ wraps' : '✕ text only'}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="sd-stats">
        <div className="sd-stat">
          <span><span data-lang-en>Peeled so far</span><span data-lang-vi>Đã bóc</span></span>
          <b>{at}</b>
        </div>
        <div className="sd-stat">
          <span><span data-lang-en>Current error</span><span data-lang-vi>Lỗi hiện tại</span></span>
          <b className="gec-now">{layers[at].text}</b>
        </div>
        <div className="sd-stat">
          <span>errors.Is(outer, ErrNotFound)</span>
          <b className={isFound ? 'gec-yes' : 'gec-no'}>{isFound ? 'true' : 'false'}</b>
        </div>
      </div>
    </div>
  );
}
