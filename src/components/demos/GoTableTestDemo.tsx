import React, { useState } from 'react';

// Every row is a case of the table in the post. "got" and "err" come from a real Go 1.27.1 run (darwin/arm64)
// of port.Parse for each input. The FAIL line is the real output of `go test` after changing the
// "highest port" want from 65535 to 65534.
type Row = { name: string; input: string; want: number; wantErr: boolean; got: number; err: string | null };

const ROWS: Row[] = [
  { name: 'normal port', input: '8080', want: 8080, wantErr: false, got: 8080, err: null },
  { name: 'lowest port', input: '1', want: 1, wantErr: false, got: 1, err: null },
  { name: 'highest port', input: '65535', want: 65535, wantErr: false, got: 65535, err: null },
  { name: 'zero', input: '0', want: 0, wantErr: true, got: 0, err: 'port 0 is out of range 1-65535' },
  { name: 'too big', input: '65536', want: 0, wantErr: true, got: 0, err: 'port 65536 is out of range 1-65535' },
  { name: 'not a number', input: 'http', want: 0, wantErr: true, got: 0, err: 'port "http" is not a number' },
  { name: 'empty', input: '', want: 0, wantErr: true, got: 0, err: 'port "" is not a number' },
];

export default function GoTableTestDemo() {
  const [done, setDone] = useState(0); // how many cases have run
  const [typo, setTypo] = useState(false); // make the "highest port" row expect 65534

  const rows = ROWS.map((r) => (typo && r.name === 'highest port' ? { ...r, want: 65534 } : r));
  const verdict = (r: Row) => (r.err !== null) === r.wantErr && r.got === r.want;
  const cur = done > 0 ? rows[done - 1] : null;
  const failed = rows.slice(0, done).filter((r) => !verdict(r));

  return (
    <div className="sd gtt">
      <div className="sd-controls">
        <button type="button" className="sd-btn is-on" disabled={done >= rows.length} onClick={() => setDone(done + 1)}>
          <span data-lang-en>Run next case</span>
          <span data-lang-vi>Chạy case tiếp theo</span>
        </button>
        <button type="button" className="sd-btn" onClick={() => setDone(rows.length)}>
          <span data-lang-en>Run all</span>
          <span data-lang-vi>Chạy hết</span>
        </button>
        <button type="button" className="sd-btn" onClick={() => setDone(0)}>
          <span data-lang-en>Reset</span>
          <span data-lang-vi>Làm lại</span>
        </button>
        <button type="button" className={typo ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={typo} onClick={() => setTypo(!typo)}>
          <span data-lang-en>Put a typo in the table</span>
          <span data-lang-vi>Gõ sai một giá trị trong bảng</span>
        </button>
      </div>

      <div className="gtt-scroll">
        <table className="gtt-table">
          <thead>
            <tr>
              <th>name</th>
              <th>input</th>
              <th>want</th>
              <th>wantErr</th>
              <th><span data-lang-en>result</span><span data-lang-vi>kết quả</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const ran = i < done;
              const ok = ran && verdict(r);
              const cls = !ran ? (i === done ? 'gtt-next' : '') : ok ? 'gtt-pass' : 'gtt-fail';
              return (
                <tr key={r.name} className={cls}>
                  <td>{r.name}</td>
                  <td><code>{JSON.stringify(r.input)}</code></td>
                  <td>{r.want}</td>
                  <td>{String(r.wantErr)}</td>
                  <td>{!ran ? '-' : ok ? 'PASS' : 'FAIL'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <pre className="gtt-code" aria-live="polite">
        {cur
          ? [
              `t.Run(${JSON.stringify(cur.name)}, ...)`,
              `got, err := Parse(${JSON.stringify(cur.input)})   // got = ${cur.got}, err = ${cur.err === null ? 'nil' : JSON.stringify(cur.err)}`,
              `(err != nil) != wantErr  ->  ${(cur.err !== null) !== cur.wantErr}`,
              `got != want              ->  ${cur.got !== cur.want}   // ${cur.got} vs ${cur.want}`,
            ].join('\n')
          : '// press "Run next case"'}
      </pre>

      {done >= rows.length && (
        <pre className={failed.length ? 'gtt-code gtt-out is-bad' : 'gtt-code gtt-out'}>
          {failed.length
            ? '--- FAIL: TestParse (0.00s)\n    --- FAIL: TestParse/highest_port (0.00s)\n        port_test.go:27: Parse("65535") = 65535, want 65534\nFAIL'
            : 'PASS'}
        </pre>
      )}
    </div>
  );
}
