import React, { useId, useState } from 'react';

// Pick a format and a schema change; see what an old reader makes of new data and what a
// new reader makes of old data. Every outcome below was checked by running the change with
// the real libraries (protobuf 7.36.2 and fastavro 1.13.1, Python 3.15) before writing it here,
// except Avro "reuse a name", which follows directly from Avro matching fields by name.
// No randomness: the first render is the default selection.

type Fmt = 'proto' | 'avro';
type Verdict = 'ok' | 'default' | 'error' | 'wrong';
type Side = { verdict: Verdict; en: string; vi: string };
type Case = {
  oldSchema: string[];
  newSchema: string[];
  backward: Side; // new reader, old data
  forward: Side; // old reader, new data
  noteEn: string;
  noteVi: string;
};
type Change = 'add-default' | 'add-nodefault' | 'remove' | 'rename' | 'widen' | 'reuse';

const CHANGES: { id: Change; en: string; vi: string }[] = [
  { id: 'add-default', en: 'Add a field with a default', vi: 'Thêm trường có giá trị mặc định' },
  { id: 'add-nodefault', en: 'Add a field with no default', vi: 'Thêm trường không có mặc định' },
  { id: 'remove', en: 'Remove a field', vi: 'Xoá một trường' },
  { id: 'rename', en: 'Rename a field', vi: 'Đổi tên trường' },
  { id: 'widen', en: 'Widen int to long', vi: 'Nới int thành long' },
  { id: 'reuse', en: 'Reuse a retired field', vi: 'Dùng lại một trường đã bỏ' },
];

const P_OLD = ['message Product {', '  string product_name = 1;', '  int64 price_cents = 2;', '}'];
const A_OLD = ['record Product {', '  string productName;', '  long priceCents;', '}'];

const CASES: Record<Fmt, Record<Change, Case>> = {
  proto: {
    'add-default': {
      oldSchema: P_OLD,
      newSchema: ['message Product {', '  string product_name = 1;', '  int64 price_cents = 2;', '  string currency = 4;  // new', '}'],
      backward: { verdict: 'default', en: 'Reads it. currency is "" (the type default), because old data never had tag 4.', vi: 'Đọc được. currency là "" (mặc định của kiểu), vì dữ liệu cũ không có tag 4.' },
      forward: { verdict: 'ok', en: 'Reads it. Tag 4 is unknown, so it is skipped, and kept if the record is written back in binary.', vi: 'Đọc được. Tag 4 lạ nên bị bỏ qua, và vẫn được giữ nếu bản ghi được ghi lại ở dạng nhị phân.' },
      noteEn: 'In proto3 every field already has a default (0, "", false), so adding a field is safe both ways.',
      noteVi: 'Trong proto3 trường nào cũng có sẵn giá trị mặc định (0, "", false), nên thêm trường an toàn cả hai chiều.',
    },
    'add-nodefault': {
      oldSchema: P_OLD,
      newSchema: ['message Product {', '  string product_name = 1;', '  int64 price_cents = 2;', '  string currency = 4;  // "required" in a comment only', '}'],
      backward: { verdict: 'default', en: 'Reads it, with currency = "". proto3 has no required fields, so it cannot refuse.', vi: 'Đọc được, với currency = "". proto3 không có trường bắt buộc, nên không thể từ chối.' },
      forward: { verdict: 'ok', en: 'Reads it and skips tag 4.', vi: 'Đọc được và bỏ qua tag 4.' },
      noteEn: 'proto2 had required fields; the protobuf docs call them harmful, and proto3 removed them. Your code must still handle the empty default.',
      noteVi: 'proto2 có trường required; tài liệu protobuf gọi chúng là có hại, và proto3 đã bỏ hẳn. Code của bạn vẫn phải xử lý giá trị rỗng mặc định.',
    },
    remove: {
      oldSchema: P_OLD,
      newSchema: ['message Product {', '  string product_name = 1;', '  reserved 2;  // was price_cents', '}'],
      backward: { verdict: 'ok', en: 'Reads it. Tag 2 is unknown now and is skipped.', vi: 'Đọc được. Tag 2 giờ là tag lạ nên bị bỏ qua.' },
      forward: { verdict: 'default', en: 'Reads it, but price_cents comes back as 0. Old code cannot tell "free" from "missing".', vi: 'Đọc được, nhưng price_cents thành 0. Code cũ không phân biệt được "miễn phí" với "không có".' },
      noteEn: 'Wire-safe, but check what old code does with a 0 price. Reserve the number so nobody reuses it.',
      noteVi: 'An toàn ở mức byte, nhưng hãy xem code cũ làm gì với giá 0. Đánh dấu reserved số tag để không ai dùng lại.',
    },
    rename: {
      oldSchema: P_OLD,
      newSchema: ['message Product {', '  string product_name = 1;', '  int64 price = 2;  // renamed', '}'],
      backward: { verdict: 'ok', en: 'Reads it. The bytes carry tag 2, never the name.', vi: 'Đọc được. Trong byte chỉ có tag 2, không bao giờ có tên.' },
      forward: { verdict: 'ok', en: 'Reads it, for the same reason.', vi: 'Đọc được, cùng lý do.' },
      noteEn: 'Safe in binary. If the message is ever stored or sent as JSON, the name is in the data and the rename breaks it.',
      noteVi: 'An toàn khi dùng nhị phân. Nếu message từng được lưu hay gửi dưới dạng JSON thì tên nằm trong dữ liệu, và đổi tên sẽ làm hỏng nó.',
    },
    widen: {
      oldSchema: ['message Product {', '  string product_name = 1;', '  int32 price_cents = 2;', '}'],
      newSchema: ['message Product {', '  string product_name = 1;', '  int64 price_cents = 2;  // was int32', '}'],
      backward: { verdict: 'ok', en: 'Reads it. Every int32 fits in an int64.', vi: 'Đọc được. Mọi giá trị int32 đều vừa int64.' },
      forward: { verdict: 'wrong', en: 'New code writes 5,000,000,000. Old code reads 705,032,704: the top bits are cut off, with no error.', vi: 'Code mới ghi 5.000.000.000. Code cũ đọc ra 705.032.704: các bit cao bị cắt mất, không có lỗi nào.' },
      noteEn: 'The docs call this wire-compatible but lossy. Keep writing values that fit in 32 bits until every reader is upgraded.',
      noteVi: 'Tài liệu gọi đây là tương thích ở mức byte nhưng có thể mất dữ liệu. Chỉ ghi giá trị vừa 32 bit cho tới khi mọi bên đọc đã nâng cấp.',
    },
    reuse: {
      oldSchema: P_OLD,
      newSchema: ['message Product {', '  string product_name = 1;', '  int64 discount_percent = 2;  // tag 2 reused', '}'],
      backward: { verdict: 'wrong', en: 'An old record with price_cents = 4999 is read as discount_percent = 4999.', vi: 'Bản ghi cũ có price_cents = 4999 bị đọc thành discount_percent = 4999.' },
      forward: { verdict: 'wrong', en: 'A new record with discount_percent = 20 is read by old code as a price of 20 cents.', vi: 'Bản ghi mới có discount_percent = 20 bị code cũ đọc thành giá 20 cent.' },
      noteEn: 'Both directions decode without error and both are wrong. This is the Knight Capital shape: an old meaning still alive somewhere.',
      noteVi: 'Cả hai chiều đều giải mã không lỗi và cả hai đều sai. Đây đúng là kiểu của Knight Capital: một ý nghĩa cũ vẫn còn sống ở đâu đó.',
    },
  },
  avro: {
    'add-default': {
      oldSchema: A_OLD,
      newSchema: ['record Product {', '  string productName;', '  long priceCents;', '  string currency = "USD";  // new', '}'],
      backward: { verdict: 'default', en: 'Reads it. The writer had no currency, so the reader fills in "USD".', vi: 'Đọc được. Bên ghi không có currency, nên bên đọc điền "USD".' },
      forward: { verdict: 'ok', en: 'Reads it. currency is not in the reader schema, so it is ignored.', vi: 'Đọc được. currency không có trong schema của bên đọc nên bị bỏ qua.' },
      noteEn: 'Fully compatible: a registry in BACKWARD, FORWARD or FULL mode accepts it.',
      noteVi: 'Tương thích cả hai chiều: registry ở chế độ BACKWARD, FORWARD hay FULL đều chấp nhận.',
    },
    'add-nodefault': {
      oldSchema: A_OLD,
      newSchema: ['record Product {', '  string productName;', '  long priceCents;', '  string currency;  // new, no default', '}'],
      backward: { verdict: 'error', en: 'Fails: "No default value for field currency". Old data has no value to give.', vi: 'Lỗi: "No default value for field currency". Dữ liệu cũ không có giá trị nào để đưa ra.' },
      forward: { verdict: 'ok', en: 'Reads it and ignores currency.', vi: 'Đọc được và bỏ qua currency.' },
      noteEn: 'Forward compatible only: old readers are fine, but new readers choke on every record written before the change. Confluent Schema Registry is BACKWARD by default.',
      noteVi: 'Chỉ tương thích xuôi (forward): bên đọc cũ vẫn ổn, nhưng bên đọc mới nghẹn với mọi bản ghi ghi trước khi đổi. Confluent Schema Registry mặc định là BACKWARD.',
    },
    remove: {
      oldSchema: A_OLD,
      newSchema: ['record Product {', '  string productName;', '  // priceCents removed', '}'],
      backward: { verdict: 'ok', en: 'Reads it. The writer has priceCents, the reader does not, so it is skipped.', vi: 'Đọc được. Bên ghi có priceCents, bên đọc không có, nên bỏ qua.' },
      forward: { verdict: 'error', en: 'Fails: "No default value for field priceCents". The old reader needs it and new data lacks it.', vi: 'Lỗi: "No default value for field priceCents". Bên đọc cũ cần nó mà dữ liệu mới không có.' },
      noteEn: 'Only fields that had a default can be removed safely. Had priceCents been declared with a default, both sides would work.',
      noteVi: 'Chỉ xoá an toàn được những trường có giá trị mặc định. Nếu priceCents được khai báo kèm mặc định thì cả hai phía đều chạy.',
    },
    rename: {
      oldSchema: A_OLD,
      newSchema: ['record Product {', '  string productName;', '  @aliases(["priceCents"]) long price;', '}'],
      backward: { verdict: 'ok', en: 'Reads it. The alias maps the writer’s priceCents to price.', vi: 'Đọc được. Alias ánh xạ priceCents của bên ghi sang price.' },
      forward: { verdict: 'error', en: 'Fails: the old reader looks for priceCents by name and finds nothing.', vi: 'Lỗi: bên đọc cũ tìm priceCents theo tên và không thấy.' },
      noteEn: 'Avro matches fields by name, so a rename is backward compatible only, as the book says.',
      noteVi: 'Avro khớp trường theo tên, nên đổi tên chỉ tương thích ngược (backward), đúng như sách nói.',
    },
    widen: {
      oldSchema: ['record Product {', '  string productName;', '  int priceCents;', '}'],
      newSchema: ['record Product {', '  string productName;', '  long priceCents;  // was int', '}'],
      backward: { verdict: 'ok', en: 'Reads it. The spec lets an int be promoted to a long.', vi: 'Đọc được. Spec cho phép nâng int lên long.' },
      forward: { verdict: 'error', en: 'Fails: "long is not int". There is no demotion rule, so it refuses instead of truncating.', vi: 'Lỗi: "long is not int". Không có luật hạ kiểu, nên nó từ chối thay vì cắt bớt.' },
      noteEn: 'Compare with Protocol Buffers: same change, but Avro fails loudly where protobuf silently truncates.',
      noteVi: 'So với Protocol Buffers: cùng thay đổi, nhưng Avro báo lỗi rõ ràng còn protobuf thì lặng lẽ cắt bớt.',
    },
    reuse: {
      oldSchema: A_OLD,
      newSchema: ['record Product {', '  string productName;', '  long priceCents;  // now means price in dollars', '}'],
      backward: { verdict: 'wrong', en: 'Old 4999 (cents) is read as 4999 dollars.', vi: '4999 cũ (cent) bị đọc thành 4999 đô.' },
      forward: { verdict: 'wrong', en: 'New 50 (dollars) is read by old code as 50 cents.', vi: '50 mới (đô) bị code cũ đọc thành 50 cent.' },
      noteEn: 'Names, types and bytes all match, so no check can catch it. A new meaning needs a new field.',
      noteVi: 'Tên, kiểu và byte đều khớp, nên không bước kiểm tra nào bắt được. Ý nghĩa mới cần một trường mới.',
    },
  },
};

const VERDICT: Record<Verdict, { en: string; vi: string }> = {
  ok: { en: 'Works', vi: 'Chạy được' },
  default: { en: 'Works, fills a default', vi: 'Chạy được, điền giá trị mặc định' },
  error: { en: 'Fails loudly', vi: 'Báo lỗi rõ ràng' },
  wrong: { en: 'Silently wrong', vi: 'Sai mà không báo' },
};

function registryLine(c: Case) {
  const back = c.backward.verdict === 'ok' || c.backward.verdict === 'default';
  const fwd = c.forward.verdict === 'ok' || c.forward.verdict === 'default';
  const yes = { en: 'accepts', vi: 'nhận' };
  const no = { en: 'rejects', vi: 'từ chối' };
  return {
    back: back ? yes : no,
    fwd: fwd ? yes : no,
    full: back && fwd ? yes : no,
  };
}

export default function SchemaEvolutionDemo() {
  const groupId = useId();
  const [fmt, setFmt] = useState<Fmt>('avro');
  const [change, setChange] = useState<Change>('add-nodefault');
  const c = CASES[fmt][change];
  const reg = registryLine(c);
  const silent = c.backward.verdict === 'wrong' || c.forward.verdict === 'wrong';

  const sideCard = (side: Side, titleEn: string, titleVi: string, subEn: string, subVi: string) => (
    <div className={`sev-card is-${side.verdict}`}>
      <p className="sev-card-title">
        <span data-lang-en>{titleEn}</span>
        <span data-lang-vi>{titleVi}</span>
      </p>
      <p className="sev-card-sub">
        <span data-lang-en>{subEn}</span>
        <span data-lang-vi>{subVi}</span>
      </p>
      <p className="sev-verdict">
        <span data-lang-en>{VERDICT[side.verdict].en}</span>
        <span data-lang-vi>{VERDICT[side.verdict].vi}</span>
      </p>
      <p className="sev-detail">
        <span data-lang-en>{side.en}</span>
        <span data-lang-vi>{side.vi}</span>
      </p>
    </div>
  );

  return (
    <div className="sd sev">
      <div className="sd-controls">
        <div className="sd-group" role="group" aria-labelledby={groupId}>
          <span id={groupId} className="sev-label">
            <span data-lang-en>Format</span>
            <span data-lang-vi>Định dạng</span>
          </span>
          {(['proto', 'avro'] as Fmt[]).map((f) => (
            <button key={f} type="button" className={fmt === f ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={fmt === f} onClick={() => setFmt(f)}>
              {f === 'proto' ? 'Protocol Buffers' : 'Avro'}
            </button>
          ))}
        </div>
      </div>
      <div className="sev-changes" role="group" aria-label="Schema change">
        {CHANGES.map((ch) => (
          <button key={ch.id} type="button" className={change === ch.id ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={change === ch.id} onClick={() => setChange(ch.id)}>
            <span data-lang-en>{ch.en}</span>
            <span data-lang-vi>{ch.vi}</span>
          </button>
        ))}
      </div>

      <div className="sev-schemas">
        <div className="sev-schema">
          <p className="sev-schema-title">
            <span data-lang-en>Old schema (v1)</span>
            <span data-lang-vi>Schema cũ (v1)</span>
          </p>
          <pre>{c.oldSchema.join('\n')}</pre>
        </div>
        <div className="sev-schema">
          <p className="sev-schema-title">
            <span data-lang-en>New schema (v2)</span>
            <span data-lang-vi>Schema mới (v2)</span>
          </p>
          <pre>{c.newSchema.join('\n')}</pre>
        </div>
      </div>

      <div className="sev-cards">
        {sideCard(c.backward, 'Backward: new reader, old data', 'Tương thích ngược: code mới đọc dữ liệu cũ', 'v2 code reads a record written by v1', 'code v2 đọc bản ghi do v1 ghi')}
        {sideCard(c.forward, 'Forward: old reader, new data', 'Tương thích xuôi: code cũ đọc dữ liệu mới', 'v1 code reads a record written by v2', 'code v1 đọc bản ghi do v2 ghi')}
      </div>

      <p className="sev-note">
        <span data-lang-en>{c.noteEn}</span>
        <span data-lang-vi>{c.noteVi}</span>
      </p>
      <p className="sev-registry">
        {silent ? (
          <>
            <span data-lang-en>Nothing fails at runtime and the bytes still decode, so a check that only asks "can the reader parse it?" lets this through. Only a person reading the diff catches it.</span>
            <span data-lang-vi>Lúc chạy không có gì báo lỗi và byte vẫn giải mã được, nên bước kiểm tra chỉ hỏi "bên đọc có parse được không?" sẽ cho qua. Chỉ người đọc diff mới bắt được.</span>
          </>
        ) : fmt === 'avro' ? (
          <>
            <span data-lang-en>So a schema registry set to BACKWARD {reg.back.en} this version, FORWARD {reg.fwd.en} it, FULL {reg.full.en} it.</span>
            <span data-lang-vi>Vậy schema registry đặt ở BACKWARD sẽ {reg.back.vi} phiên bản này, FORWARD sẽ {reg.fwd.vi}, FULL sẽ {reg.full.vi}.</span>
          </>
        ) : (
          <>
            <span data-lang-en>Protocol Buffers never fails on a missing or unknown tag; the risk is in what your code does with the default.</span>
            <span data-lang-vi>Protocol Buffers không bao giờ lỗi vì thiếu tag hay gặp tag lạ; rủi ro nằm ở việc code của bạn làm gì với giá trị mặc định.</span>
          </>
        )}
      </p>
    </div>
  );
}
