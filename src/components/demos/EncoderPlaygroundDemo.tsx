import React, { useId, useState } from 'react';

// One record, four encodings, every byte labelled.
// The encoders below follow the published wire formats closely enough to give the same bytes
// as the real libraries for this record shape (checked against Python json, msgpack 1.2.4,
// protobuf 7.36.2 and fastavro 1.13.1 for the default record: 73, 58, 31 and 29 bytes).
// Supported on purpose: one string, one non-negative integer, a list of short strings.
// The first render uses fixed default values, so server and client HTML match.

type Part = 'name' | 'syntax' | 'tag' | 'len' | 'value';
type Byte = { b: number; field: number; part: Part }; // field -1 = the record itself
type Rec = { name: string; price: number; tags: string[] };

const FIELDS = [
  { json: 'productName', proto: 'product_name', tag: 1 },
  { json: 'priceCents', proto: 'price_cents', tag: 2 },
  { json: 'tags', proto: 'tags', tag: 3 },
];
const TAG_CHOICES = ['outdoor', 'sale', 'new', 'kids'];
const MAX_PRICE = 9_999_999_999;

const utf8 = (s: string) => Array.from(new TextEncoder().encode(s));
const push = (out: Byte[], bytes: number[], field: number, part: Part) => bytes.forEach((b) => out.push({ b, field, part }));

// Unsigned LEB128 varint, written with division so values above 2^31 stay exact.
function varint(n: number): number[] {
  const out: number[] = [];
  let v = n;
  while (v >= 128) {
    out.push((v % 128) + 128);
    v = Math.floor(v / 128);
  }
  out.push(v);
  return out;
}
const zigzag = (n: number) => (n >= 0 ? n * 2 : -n * 2 - 1);

function encodeJson(r: Rec): Byte[] {
  const out: Byte[] = [];
  const str = (s: string) => utf8(JSON.stringify(s));
  push(out, utf8('{'), -1, 'syntax');
  push(out, str(FIELDS[0].json), 0, 'name');
  push(out, utf8(':'), 0, 'syntax');
  push(out, str(r.name), 0, 'value');
  push(out, utf8(','), -1, 'syntax');
  push(out, str(FIELDS[1].json), 1, 'name');
  push(out, utf8(':'), 1, 'syntax');
  push(out, utf8(String(r.price)), 1, 'value');
  push(out, utf8(','), -1, 'syntax');
  push(out, str(FIELDS[2].json), 2, 'name');
  push(out, utf8(':['), 2, 'syntax');
  r.tags.forEach((t, i) => {
    if (i > 0) push(out, utf8(','), 2, 'syntax');
    push(out, str(t), 2, 'value');
  });
  push(out, utf8(']'), 2, 'syntax');
  push(out, utf8('}'), -1, 'syntax');
  return out;
}

function msgpackStr(out: Byte[], s: string, field: number, part: Part) {
  const b = utf8(s);
  if (b.length < 32) push(out, [0xa0 | b.length], field, 'len');
  else push(out, [0xd9, b.length], field, 'len');
  push(out, b, field, part);
}
function msgpackUint(n: number): number[] {
  if (n < 128) return [n];
  if (n < 256) return [0xcc, n];
  if (n < 65536) return [0xcd, n >> 8, n & 255];
  if (n < 4294967296) return [0xce, Math.floor(n / 16777216) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255];
  const hi = Math.floor(n / 4294967296);
  const lo = n % 4294967296;
  return [0xcf, 0, 0, (hi >> 8) & 255, hi & 255, Math.floor(lo / 16777216) & 255, (lo >> 16) & 255, (lo >> 8) & 255, lo & 255];
}
function encodeMsgpack(r: Rec): Byte[] {
  const out: Byte[] = [];
  push(out, [0x80 | 3], -1, 'syntax');
  msgpackStr(out, FIELDS[0].json, 0, 'name');
  msgpackStr(out, r.name, 0, 'value');
  msgpackStr(out, FIELDS[1].json, 1, 'name');
  const num = msgpackUint(r.price);
  if (num.length === 1) push(out, num, 1, 'value');
  else {
    push(out, [num[0]], 1, 'syntax');
    push(out, num.slice(1), 1, 'value');
  }
  msgpackStr(out, FIELDS[2].json, 2, 'name');
  push(out, [0x90 | r.tags.length], 2, 'syntax');
  r.tags.forEach((t) => msgpackStr(out, t, 2, 'value'));
  return out;
}

// proto3: fields equal to their default (empty string, 0) are not written at all.
function encodeProto(r: Rec): Byte[] {
  const out: Byte[] = [];
  const name = utf8(r.name);
  if (name.length) {
    push(out, [(1 << 3) | 2], 0, 'tag');
    push(out, varint(name.length), 0, 'len');
    push(out, name, 0, 'value');
  }
  if (r.price !== 0) {
    push(out, [(2 << 3) | 0], 1, 'tag');
    push(out, varint(r.price), 1, 'value');
  }
  r.tags.forEach((t) => {
    const b = utf8(t);
    push(out, [(3 << 3) | 2], 2, 'tag');
    push(out, varint(b.length), 2, 'len');
    push(out, b, 2, 'value');
  });
  return out;
}

function encodeAvro(r: Rec): Byte[] {
  const out: Byte[] = [];
  const name = utf8(r.name);
  push(out, varint(zigzag(name.length)), 0, 'len');
  push(out, name, 0, 'value');
  push(out, varint(zigzag(r.price)), 1, 'value');
  if (r.tags.length) {
    push(out, varint(zigzag(r.tags.length)), 2, 'len');
    r.tags.forEach((t) => {
      const b = utf8(t);
      push(out, varint(zigzag(b.length)), 2, 'len');
      push(out, b, 2, 'value');
    });
  }
  push(out, [0], 2, 'syntax'); // end of array blocks
  return out;
}

const FORMATS = [
  { id: 'json', label: 'JSON', enc: encodeJson, noteEn: 'text; every field name spelled out', noteVi: 'dạng chữ; tên trường viết đầy đủ' },
  { id: 'msgpack', label: 'MessagePack', enc: encodeMsgpack, noteEn: 'binary JSON; names still inside', noteVi: 'JSON dạng nhị phân; vẫn chứa tên trường' },
  { id: 'proto', label: 'Protocol Buffers', enc: encodeProto, noteEn: 'tag numbers instead of names', noteVi: 'số tag thay cho tên trường' },
  { id: 'avro', label: 'Avro', enc: encodeAvro, noteEn: 'values only; the schema says what they are', noteVi: 'chỉ có giá trị; schema cho biết chúng là gì' },
] as const;

const PART_LABEL: Record<Part, { en: string; vi: string }> = {
  name: { en: 'field name', vi: 'tên trường' },
  syntax: { en: 'structure', vi: 'cấu trúc' },
  tag: { en: 'tag and type', vi: 'tag và kiểu' },
  len: { en: 'length', vi: 'độ dài' },
  value: { en: 'value', vi: 'giá trị' },
};

const hex = (b: number) => b.toString(16).padStart(2, '0');
const printable = (b: number) => (b >= 32 && b < 127 ? String.fromCharCode(b) : '');
const fmt = (n: number, lang: 'en' | 'vi') => n.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN');

export default function EncoderPlaygroundDemo() {
  const nameId = useId();
  const priceId = useId();
  const [name, setName] = useState('Rain jacket');
  const [price, setPrice] = useState(4999);
  const [tags, setTags] = useState<string[]>(['outdoor', 'sale']);
  const [focus, setFocus] = useState<number | null>(null);

  const rec: Rec = { name, price, tags };
  const encoded = FORMATS.map((f) => ({ ...f, bytes: f.enc(rec) }));
  const maxLen = Math.max(...encoded.map((e) => e.bytes.length));

  const toggleTag = (t: string) =>
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : TAG_CHOICES.filter((x) => x === t || cur.includes(x))));

  return (
    <div className="sd encp">
      <div className="sd-controls encp-controls">
        <div className="sd-group">
          <label htmlFor={nameId} className="encp-label">
            <span data-lang-en>productName</span>
            <span data-lang-vi>productName (tên)</span>
          </label>
          <input id={nameId} className="encp-input" type="text" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="sd-group">
          <label htmlFor={priceId} className="encp-label">
            <span data-lang-en>priceCents</span>
            <span data-lang-vi>priceCents (giá)</span>
          </label>
          <input
            id={priceId}
            className="encp-input encp-num"
            type="number"
            min={0}
            max={MAX_PRICE}
            step={1}
            value={price}
            onChange={(e) => {
              const v = Math.floor(Number(e.target.value));
              setPrice(Number.isFinite(v) ? Math.min(Math.max(v, 0), MAX_PRICE) : 0);
            }}
          />
          {[0, 99, 4999, 5_000_000_000].map((p) => (
            <button key={p} type="button" className={price === p ? 'sd-btn is-on' : 'sd-btn'} onClick={() => setPrice(p)}>
              <span data-lang-en>{fmt(p, 'en')}</span>
              <span data-lang-vi>{fmt(p, 'vi')}</span>
            </button>
          ))}
        </div>
        <div className="sd-group">
          <span className="encp-label">
            <span data-lang-en>tags</span>
            <span data-lang-vi>tags (nhãn)</span>
          </span>
          {TAG_CHOICES.map((t) => (
            <button key={t} type="button" className={tags.includes(t) ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={tags.includes(t)} onClick={() => toggleTag(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="encp-fields" role="group" aria-label="Highlight a field">
        <span className="encp-label">
          <span data-lang-en>Highlight a field:</span>
          <span data-lang-vi>Tô sáng một trường:</span>
        </span>
        {FIELDS.map((f, i) => (
          <button key={f.json} type="button" className={focus === i ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={focus === i} onClick={() => setFocus(focus === i ? null : i)}>
            {f.json}
          </button>
        ))}
      </div>

      {encoded.map((e) => {
        const nameBytes = e.bytes.filter((x) => x.part === 'name' || x.part === 'tag').length;
        const focusBytes = focus === null ? 0 : e.bytes.filter((x) => x.field === focus).length;
        return (
          <section key={e.id} className="encp-row">
            <div className="encp-head">
              <p className="encp-format">{e.label}</p>
              <p className="encp-count">
                <b>
                  <span data-lang-en>{fmt(e.bytes.length, 'en')} bytes</span>
                  <span data-lang-vi>{fmt(e.bytes.length, 'vi')} byte</span>
                </b>
                <span className="encp-sub">
                  <span data-lang-en>
                    {e.id === 'avro' ? 'no names or tags' : `${nameBytes} on ${e.id === 'proto' ? 'tags' : 'field names'}`}
                    {focus !== null ? ` · ${focusBytes} for ${FIELDS[focus].json}` : ''}
                    {' · '}{e.noteEn}
                  </span>
                  <span data-lang-vi>
                    {e.id === 'avro' ? 'không có tên hay tag' : `${nameBytes} cho ${e.id === 'proto' ? 'tag' : 'tên trường'}`}
                    {focus !== null ? ` · ${focusBytes} cho ${FIELDS[focus].json}` : ''}
                    {' · '}{e.noteVi}
                  </span>
                </span>
              </p>
            </div>
            <div className="encp-bar" aria-hidden="true">
              <span style={{ width: `${(e.bytes.length / maxLen) * 100}%` }} />
            </div>
            <div className="encp-bytes">
              {e.bytes.map((x, i) => (
                <span
                  key={i}
                  className={`encp-byte is-${x.part}${focus !== null && x.field === focus ? ' is-focus' : ''}${focus !== null && x.field !== focus ? ' is-dim' : ''}`}
                  title={`${PART_LABEL[x.part].en}${x.field >= 0 ? ` · ${FIELDS[x.field].json}` : ''}`}
                >
                  <b>{hex(x.b)}</b>
                  <small>{printable(x.b) || ' '}</small>
                </span>
              ))}
            </div>
          </section>
        );
      })}

      <p className="encp-legend">
        <span className="encp-key is-name"><b>6e</b></span>
        <span data-lang-en>field name or tag</span>
        <span data-lang-vi>tên trường hoặc tag</span>
        <span className="encp-key is-len"><b>0b</b></span>
        <span data-lang-en>length or type marker</span>
        <span data-lang-vi>độ dài hoặc dấu kiểu</span>
        <span className="encp-key is-value"><b>52</b></span>
        <span data-lang-en>your data</span>
        <span data-lang-vi>dữ liệu thật của bạn</span>
      </p>
    </div>
  );
}
