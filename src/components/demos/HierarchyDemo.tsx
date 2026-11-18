import React, { useState } from 'react';

// Chapter 2 on one support-ticket card: how size, weight, colour and labels change what reads first.
// Three switches: text styling (flat / size only / weight + colour), labels (label: value / merged),
// and the inactive tabs (same colour / softened). The card is a fixed light "screen" on purpose.

type Style = 'flat' | 'size' | 'weight';
type Labels = 'labels' | 'merged';
type Tabs = 'same' | 'soft';

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

const INK = { primary: '#1f2328', secondary: '#5b6470', tertiary: '#8b939e' };

function textStyle(style: Style, level: 1 | 2 | 3): React.CSSProperties {
  if (style === 'flat') return { fontSize: 16, fontWeight: 400, color: INK.primary };
  if (style === 'size') return level === 1 ? { fontSize: 26, fontWeight: 400, color: INK.primary } : { fontSize: 12, fontWeight: 400, color: INK.primary };
  if (level === 1) return { fontSize: 19, fontWeight: 650, color: INK.primary };
  if (level === 2) return { fontSize: 15, fontWeight: 400, color: INK.secondary };
  return { fontSize: 14, fontWeight: 400, color: INK.tertiary };
}

function Choice<T extends string>({ label, value, opts, onPick }: { label: [string, string]; value: T; opts: { id: T; en: string; vi: string }[]; onPick: (v: T) => void }) {
  return (
    <div className="sd-group">
      <span>{L(label[0], label[1])}</span>
      {opts.map((o) => (
        <button key={o.id} type="button" className={o.id === value ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={o.id === value} onClick={() => onPick(o.id)}>
          {L(o.en, o.vi)}
        </button>
      ))}
    </div>
  );
}

export default function HierarchyDemo() {
  const [style, setStyle] = useState<Style>('flat');
  const [labels, setLabels] = useState<Labels>('labels');
  const [tabs, setTabs] = useState<Tabs>('same');

  const withLabels = labels === 'labels';
  const row = (lvl: 1 | 2 | 3, en: string, vi: string, labelEn: string, labelVi: string) => (
    <p style={{ margin: '0 0 6px', lineHeight: 1.4, ...textStyle(style, lvl) }}>
      {withLabels ? (
        <>
          <span data-lang-en>{labelEn}: </span>
          <span data-lang-vi>{labelVi}: </span>
        </>
      ) : null}
      {L(en, vi)}
    </p>
  );

  const tabNames: [string, string][] = [
    ['Open', 'Đang mở'],
    ['Waiting', 'Đang chờ'],
    ['Closed', 'Đã đóng'],
  ];

  return (
    <div className="sd">
      <div className="sd-controls">
        <Choice
          label={['Text', 'Chữ']}
          value={style}
          onPick={setStyle}
          opts={[
            { id: 'flat', en: 'All equal', vi: 'Ngang nhau' },
            { id: 'size', en: 'Size only', vi: 'Chỉ cỡ chữ' },
            { id: 'weight', en: 'Weight + colour', vi: 'Độ đậm + màu' },
          ]}
        />
        <Choice
          label={['Labels', 'Nhãn']}
          value={labels}
          onPick={setLabels}
          opts={[
            { id: 'labels', en: 'Label: value', vi: 'Nhãn: giá trị' },
            { id: 'merged', en: 'Merged', vi: 'Gộp vào giá trị' },
          ]}
        />
        <Choice
          label={['Other tabs', 'Tab khác']}
          value={tabs}
          onPick={setTabs}
          opts={[
            { id: 'same', en: 'Same colour', vi: 'Cùng màu' },
            { id: 'soft', en: 'Softened', vi: 'Làm mờ' },
          ]}
        />
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #dcd8cf', borderRadius: 10, padding: '14px 20px 20px', maxWidth: 560 }}>
        <div style={{ display: 'flex', gap: 18, borderBottom: '1px solid #ebe8e1', marginBottom: 16, paddingBottom: 8, fontSize: 15 }}>
          {tabNames.map(([en, vi], i) => (
            <span
              key={en}
              style={{
                fontWeight: i === 0 ? 650 : 500,
                color: i === 0 ? '#2754b8' : tabs === 'soft' ? INK.tertiary : '#3a5fb0',
              }}
            >
              {L(en, vi)}
            </span>
          ))}
        </div>

        {withLabels ? row(1, 'Refund not received for order 4821', 'Chưa nhận được tiền hoàn cho đơn 4821', 'Subject', 'Tiêu đề') : row(1, 'Refund not received for order 4821', 'Chưa nhận được tiền hoàn cho đơn 4821', '', '')}
        {withLabels ? row(2, 'Linh Tran', 'Linh Trần', 'Customer', 'Khách hàng') : row(2, 'Linh Tran', 'Linh Trần', '', '')}
        {withLabels
          ? row(2, 'High', 'Cao', 'Priority', 'Độ ưu tiên')
          : row(2, 'High priority', 'Ưu tiên cao', '', '')}
        {withLabels
          ? row(3, '2 hours ago', '2 giờ trước', 'Updated', 'Cập nhật')
          : row(3, 'Updated 2 hours ago', 'Cập nhật 2 giờ trước', '', '')}
      </div>

      <p style={{ margin: '12px 0 0', fontSize: 14 }}>
        {style === 'flat' && L('Everything competes, so nothing leads.', 'Mọi thứ tranh nhau, nên chẳng có gì dẫn dắt.')}
        {style === 'size' && L('The title shouts and the details are hard to read.', 'Tiêu đề hét to còn chi tiết thì khó đọc.')}
        {style === 'weight' && L('The title leads at a normal size; the rest steps back by colour.', 'Tiêu đề dẫn ở cỡ chữ bình thường; phần còn lại lùi lại nhờ màu.')}
      </p>
    </div>
  );
}
