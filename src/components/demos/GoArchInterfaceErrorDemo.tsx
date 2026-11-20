import React, { useState } from 'react';

type Tab = 'nil-trap' | 'err-chain';
type ReturnMode = 'typed-nil' | 'untyped-nil' | 'real-err';
type WrapVerb = 'pct-w' | 'pct-v';

export default function GoArchInterfaceErrorDemo() {
  const [tab, setTab] = useState<Tab>('nil-trap');
  const [retMode, setRetMode] = useState<ReturnMode>('typed-nil');
  const [verb, setVerb] = useState<WrapVerb>('pct-w');
  const [checkFn, setCheckFn] = useState<'eq' | 'is' | 'as'>('is');

  const nilState = {
    'typed-nil': {
      tab: '*ValidationError',
      data: '0x0 (nil)',
      notNil: true,
      isTrap: true,
      code: [
        'func validate(s string) error {',
        '  var err *ValidationError // nil ptr',
        '  return err // packs (*ValidationError, 0x0)!',
        '}',
        '// caller: err != nil -> TRUE (bug!)',
      ],
      activeLine: 2,
      en: 'BUG: return err returns a non-nil interface boxing a nil *ValidationError pointer. Caller sees err != nil and falls into the error path.',
      vi: 'LỖI: return err trả về một interface khác nil bên trong bọc con trỏ *ValidationError = nil. Caller thấy err != nil nên nhảy nhầm vào nhánh xử lý lỗi.',
    },
    'untyped-nil': {
      tab: '0x0 (nil)',
      data: '0x0 (nil)',
      notNil: false,
      isTrap: false,
      code: [
        'func validate(s string) error {',
        '  if s == "" { return &ValidationError{...} }',
        '  return nil // leaves tab=0x0, data=0x0',
        '}',
        '// caller: err == nil -> true (safe)',
      ],
      activeLine: 2,
      en: 'SAFE: return nil leaves both words of runtime.iface zeroed. Caller evaluates err == nil cleanly.',
      vi: 'AN TOÀN: return nil giữ cả hai trường của runtime.iface bằng 0. Phép kiểm tra err == nil cho kết quả chuẩn xác.',
    },
    'real-err': {
      tab: '*ValidationError',
      data: '0x1400010a020',
      notNil: true,
      isTrap: false,
      code: [
        'func validate(s string) error {',
        '  return &ValidationError{Field: "email"}',
        '}',
        '// both tab and data are populated',
        '// caller: err.Error() -> "invalid: email"',
      ],
      activeLine: 1,
      en: 'ACTUAL ERROR: both tab and data point to valid structures. Calling err.Error() prints "invalid: email".',
      vi: 'LỖI THẬT: cả tab và data đều trỏ vào cấu trúc hợp lệ. Gọi err.Error() trả về "invalid: email".',
    },
  }[retMode];

  const matchResult = checkFn === 'eq' ? false : verb === 'pct-w';

  const wrapCode = [
    `err := ${verb === 'pct-w' ? 'fmt.Errorf("save: %w", sql.ErrNoRows)' : 'fmt.Errorf("save: %v", sql.ErrNoRows)'}`,
    checkFn === 'eq'
      ? 'if err == sql.ErrNoRows { // false! wrapper != leaf'
      : checkFn === 'is'
        ? `if errors.Is(err, sql.ErrNoRows) { // ${matchResult}`
        : `if errors.As(err, &target) { // ${matchResult}`,
    verb === 'pct-w' ? '// Unwrap() chain connects outer -> sql.ErrNoRows' : '// %v builds plain text; no Unwrap() edge',
  ];

  return (
    <div className="sd gaie">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Explorer</span>
            <span data-lang-vi>Chế độ</span>
          </span>
          <button type="button" className={tab === 'nil-trap' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setTab('nil-trap')}>
            <span data-lang-en>Typed nil interface</span>
            <span data-lang-vi>Bẫy typed nil interface</span>
          </button>
          <button type="button" className={tab === 'err-chain' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setTab('err-chain')}>
            <span data-lang-en>Wrapping (%w vs %v)</span>
            <span data-lang-vi>Bọc lỗi (%w vs %v)</span>
          </button>
        </div>

        {tab === 'nil-trap' ? (
          <div className="sd-group">
            <span>
              <span data-lang-en>Return</span>
              <span data-lang-vi>Trả về</span>
            </span>
            <button type="button" className={retMode === 'typed-nil' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setRetMode('typed-nil')}>
              var err *ValidationError = nil
            </button>
            <button type="button" className={retMode === 'untyped-nil' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setRetMode('untyped-nil')}>
              return nil
            </button>
            <button type="button" className={retMode === 'real-err' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setRetMode('real-err')}>
              &amp;ValidationError{'{'}...{'}'}
            </button>
          </div>
        ) : (
          <>
            <div className="sd-group">
              <span>
                <span data-lang-en>Verb</span>
                <span data-lang-vi>Format</span>
              </span>
              <button type="button" className={verb === 'pct-w' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setVerb('pct-w')}>
                %w (wrap)
              </button>
              <button type="button" className={verb === 'pct-v' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setVerb('pct-v')}>
                %v (mask)
              </button>
            </div>
            <div className="sd-group">
              <span>
                <span data-lang-en>Check</span>
                <span data-lang-vi>Kiểm tra</span>
              </span>
              <button type="button" className={checkFn === 'eq' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setCheckFn('eq')}>
                ==
              </button>
              <button type="button" className={checkFn === 'is' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setCheckFn('is')}>
                errors.Is
              </button>
              <button type="button" className={checkFn === 'as' ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setCheckFn('as')}>
                errors.As
              </button>
            </div>
          </>
        )}
      </div>

      {/* Side-by-side Code + SVG runtime state */}
      <div className="gaie-grid">
        <div className="gaie-pane">
          <div className="gaie-pane-hdr">
            <span data-lang-en>Go code</span>
            <span data-lang-vi>Code Go đối chiếu</span>
          </div>
          <div className="gaie-code-body">
            {(tab === 'nil-trap' ? nilState.code : wrapCode).map((line, i) => {
              const active = tab === 'nil-trap' ? i === nilState.activeLine : i === 1;
              const cls = !active
                ? ''
                : tab === 'nil-trap'
                  ? nilState.isTrap
                    ? 'is-bad'
                    : 'is-good'
                  : matchResult
                    ? 'is-good'
                    : 'is-bad';
              return (
                <div key={i} className={`gaie-line ${active ? 'is-active' : ''} ${cls}`}>
                  <span className="gaie-ln">{active ? '▶' : `L${i + 1}`}</span>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="gaie-pane">
          <div className="gaie-pane-hdr">
            <span data-lang-en>Runtime representation</span>
            <span data-lang-vi>Luồng runtime bên dưới</span>
          </div>
          {tab === 'nil-trap' ? (
            <svg viewBox="0 0 460 132" className="gaie-flow-svg" role="img" aria-label="runtime.iface packing diagram">
              <rect x="12" y="18" width="174" height="44" rx="6" className={`gaie-box ${nilState.isTrap ? 'is-bad' : !nilState.notNil ? 'is-good' : ''}`} />
              <text x="24" y="37" className="gaie-svg-b">iface.tab</text>
              <text x="24" y="53" className={nilState.isTrap ? 'gaie-svg-red' : 'gaie-svg-sm'}>{nilState.tab}</text>

              <rect x="12" y="72" width="174" height="44" rx="6" className="gaie-box" />
              <text x="24" y="91" className="gaie-svg-b">iface.data</text>
              <text x="24" y="107" className="gaie-svg-sm">{nilState.data}</text>

              <line x1="186" x2="274" y1="66" y2="66" stroke={nilState.isTrap ? 'var(--red)' : 'rgb(21, 128, 61)'} strokeWidth="1.8" />

              <rect x="276" y="34" width="172" height="64" rx="8" className={`gaie-box ${nilState.isTrap ? 'is-bad' : 'is-good'}`} />
              <text x="362" y="61" textAnchor="middle" className={nilState.isTrap ? 'gaie-svg-red' : 'gaie-svg-good'}>
                if err != nil → {String(nilState.notNil)}
              </text>
              <text x="362" y="81" textAnchor="middle" className="gaie-svg-sm">
                {nilState.isTrap ? 'FALSE POSITIVE TRAP' : !nilState.notNil ? 'BOTH WORDS ZERO' : 'VALID ERROR'}
              </text>
            </svg>
          ) : (
            <svg viewBox="0 0 460 132" className="gaie-flow-svg" role="img" aria-label="Error wrap traversal flow">
              <rect x="12" y="36" width="132" height="60" rx="7" className="gaie-box" />
              <text x="78" y="62" textAnchor="middle" className="gaie-svg-b">Outer error</text>
              <text x="78" y="80" textAnchor="middle" className="gaie-svg-sm">fmt.Errorf("{verb === 'pct-w' ? '%w' : '%v'}")</text>

              <line
                x1="144"
                x2="244"
                y1="66"
                y2="66"
                stroke={matchResult ? 'rgb(21, 128, 61)' : 'var(--red)'}
                strokeWidth="1.8"
                strokeDasharray={verb === 'pct-v' ? '4 3' : undefined}
              />

              <rect x="246" y="36" width="202" height="60" rx="7" className={`gaie-box ${matchResult ? 'is-good' : 'is-bad'}`} />
              <text x="347" y="62" textAnchor="middle" className={matchResult ? 'gaie-svg-good' : 'gaie-svg-red'}>
                sql.ErrNoRows ({matchResult ? 'MATCHED' : 'BLOCKED'})
              </text>
              <text x="347" y="80" textAnchor="middle" className="gaie-svg-sm">
                {checkFn === 'eq' ? '== skips Unwrap()' : verb === 'pct-w' ? 'Unwrap() reaches leaf' : '%v cut the link'}
              </text>
            </svg>
          )}
        </div>
      </div>

      {tab === 'nil-trap' ? (
        <div>
          <div className="sd-stats">
            <div className="sd-stat">
              <b>{nilState.tab}</b>
              <span>iface.tab</span>
            </div>
            <div className="sd-stat">
              <b>{nilState.data}</b>
              <span>iface.data</span>
            </div>
            <div className={`sd-stat ${nilState.isTrap ? 'is-bad' : !nilState.notNil ? 'is-good' : ''}`}>
              <b>{String(nilState.notNil)}</b>
              <span>if err != nil</span>
            </div>
          </div>
          <p className={`gaie-msg ${nilState.isTrap ? 'is-bad' : ''}`}>
            <span data-lang-en>{nilState.en}</span>
            <span data-lang-vi>{nilState.vi}</span>
          </p>
        </div>
      ) : (
        <div>
          <div className="sd-stats">
            <div className="sd-stat">
              <b>{verb === 'pct-w' ? 'Unwrap() error' : 'plain string'}</b>
              <span><span data-lang-en>wrapping tree</span><span data-lang-vi>cấu trúc chuỗi lỗi</span></span>
            </div>
            <div className="sd-stat">
              <b>{verb === 'pct-w' ? 'Coupled' : 'Decoupled'}</b>
              <span><span data-lang-en>caller coupling</span><span data-lang-vi>mức phụ thuộc caller</span></span>
            </div>
            <div className={`sd-stat ${matchResult ? 'is-good' : 'is-bad'}`}>
              <b>{String(matchResult)}</b>
              <span><span data-lang-en>check matches</span><span data-lang-vi>kết quả khớp lỗi</span></span>
            </div>
          </div>
          <p className="gaie-msg">
            {checkFn === 'eq' ? (
              <>
                <span data-lang-en>Direct == always fails once an error is wrapped (because the outer wrapper is a new error value). Always switch to errors.Is or errors.As.</span>
                <span data-lang-vi>Phép so sánh == luôn trả về false khi lỗi đã bị bọc ngữ cảnh bên ngoài. Luôn chuyển sang errors.Is hoặc errors.As.</span>
              </>
            ) : verb === 'pct-w' ? (
              <>
                <span data-lang-en>%w preserves the original error chain so errors.Is and errors.As walk down to sql.ErrNoRows—at the cost of exposing internal error types to callers.</span>
                <span data-lang-vi>%w giữ nguyên mắt xích lỗi gốc để errors.Is và errors.As truy ngược về sql.ErrNoRows — đánh đổi bằng việc caller có thể phụ thuộc vào kiểu lỗi tầng dưới.</span>
              </>
            ) : (
              <>
                <span data-lang-en>%v formats the message text only and severs the unwrap chain. Use %v intentionally when you want to hide internal storage types across a public package boundary.</span>
                <span data-lang-vi>%v chỉ nối chuỗi text và cắt đứt nhánh unwrap. Hãy chủ động dùng %v khi muốn giấu kín kiểu lỗi nội bộ trước public API.</span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
