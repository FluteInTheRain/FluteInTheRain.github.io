import React, { useState } from 'react';

// Compiler messages captured from real `go build` runs on Go 1.27.1 (darwin/arm64).
// The program declared: Celsius (method String, value receiver), Counter (method Inc,
// pointer receiver), Pair (no methods), and `type Incrementer interface{ Inc() }`.
type TypeId = 'Celsius' | 'Counter' | 'Pair';
type IfaceId = 'Stringer' | 'Incrementer';

const TYPES: Array<{ id: TypeId; decl: string }> = [
  { id: 'Celsius', decl: 'func (c Celsius) String() string' },
  { id: 'Counter', decl: 'func (c *Counter) Inc()' },
  { id: 'Pair', decl: '(no methods)' },
];
const IFACES: Array<{ id: IfaceId; need: string; label: string }> = [
  { id: 'Stringer', need: 'String() string', label: 'fmt.Stringer' },
  { id: 'Incrementer', need: 'Inc()', label: 'Incrementer' },
];

// key = `${type}|${isPointer}|${iface}` -> null when it compiles, else the compiler's reason.
const RESULT: Record<string, string | null> = {
  'Celsius|false|Stringer': null,
  'Celsius|true|Stringer': null,
  'Celsius|false|Incrementer': 'Celsius does not implement Incrementer (missing method Inc)',
  'Celsius|true|Incrementer': '*Celsius does not implement Incrementer (missing method Inc)',
  'Counter|false|Stringer': 'Counter does not implement fmt.Stringer (missing method String)',
  'Counter|true|Stringer': '*Counter does not implement fmt.Stringer (missing method String)',
  'Counter|false|Incrementer': 'Counter does not implement Incrementer (method Inc has pointer receiver)',
  'Counter|true|Incrementer': null,
  'Pair|false|Stringer': 'Pair does not implement fmt.Stringer (missing method String)',
  'Pair|true|Stringer': '*Pair does not implement fmt.Stringer (missing method String)',
  'Pair|false|Incrementer': 'Pair does not implement Incrementer (missing method Inc)',
  'Pair|true|Incrementer': '*Pair does not implement Incrementer (missing method Inc)',
};

const key = (t: TypeId, p: boolean, i: IfaceId) => `${t}|${p}|${i}`;

export default function GoSatisfyCheckerDemo() {
  const [t, setT] = useState<TypeId>('Counter');
  const [ptr, setPtr] = useState(false);
  const [i, setI] = useState<IfaceId>('Incrementer');

  const iface = IFACES.find((x) => x.id === i)!;
  const reason = RESULT[key(t, ptr, i)];
  const ok = reason === null;
  const setup = t === 'Celsius' ? 'c := Celsius(36.6)\n' : '';
  const shown = t === 'Celsius' ? (ptr ? '&c' : 'c') : `${ptr ? '&' : ''}${t}{}`;

  return (
    <div className="sd gsc">
      <div className="sd-controls">
        <div className="sd-group">
          <span><span data-lang-en>Type</span><span data-lang-vi>Kiểu</span></span>
          {TYPES.map((x) => (
            <button key={x.id} type="button" className={t === x.id ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setT(x.id)}>{x.id}</button>
          ))}
        </div>
        <div className="sd-group">
          <span><span data-lang-en>Put in the interface as</span><span data-lang-vi>Đưa vào interface dạng</span></span>
          <button type="button" className={!ptr ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setPtr(false)}>
            <span data-lang-en>a value</span><span data-lang-vi>giá trị</span>
          </button>
          <button type="button" className={ptr ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setPtr(true)}>
            <span data-lang-en>a pointer</span><span data-lang-vi>con trỏ</span>
          </button>
        </div>
        <div className="sd-group">
          <span><span data-lang-en>Interface</span><span data-lang-vi>Interface</span></span>
          {IFACES.map((x) => (
            <button key={x.id} type="button" className={i === x.id ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setI(x.id)}>{x.label}</button>
          ))}
        </div>
      </div>

      <pre className="gsc-code">{`${TYPES.find((x) => x.id === t)!.decl}\n// ${iface.label} needs: ${iface.need}\n\n${setup}var x ${iface.label} = ${shown}`}</pre>

      <div className={ok ? 'gsc-verdict is-ok' : 'gsc-verdict is-no'} role="status">
        <b>{ok ? '✓' : '✗'}</b>
        <span>
          {ok ? (
            <>
              <span data-lang-en>It compiles.</span>
              <span data-lang-vi>Biên dịch được.</span>
            </>
          ) : (
            <>
              <code>{reason}</code>
            </>
          )}
        </span>
      </div>

      <table className="gsc-table">
        <thead>
          <tr>
            <th></th>
            <th>Stringer: value</th>
            <th>Stringer: pointer</th>
            <th>Incrementer: value</th>
            <th>Incrementer: pointer</th>
          </tr>
        </thead>
        <tbody>
          {TYPES.map((x) => (
            <tr key={x.id}>
              <th>{x.id}</th>
              {(['Stringer', 'Incrementer'] as IfaceId[]).flatMap((ifc) =>
                [false, true].map((p) => {
                  const good = RESULT[key(x.id, p, ifc)] === null;
                  const current = x.id === t && p === ptr && ifc === i;
                  return (
                    <td key={`${ifc}${p}`} className={(good ? 'is-ok' : 'is-no') + (current ? ' is-cur' : '')}>
                      {good ? '✓' : '✗'}
                    </td>
                  );
                }),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
