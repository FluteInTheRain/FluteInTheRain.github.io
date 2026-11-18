import React, { useId, useState } from 'react';

// Chapter 3 on one small form: card padding ("start with too much white space") and the two gaps
// that decide grouping ("avoid ambiguous spacing"): the gap under each label and the gap between
// label+input groups. Two presets show the book's contrast; the sliders let the reader find the line.

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

const PRESETS = {
  added: { pad: 12, label: 10, group: 10 },
  trimmed: { pad: 32, label: 6, group: 26 },
};

const FIELDS: [string, string, string][] = [
  ['Full name', 'Họ và tên', 'Linh Tran'],
  ['Email', 'Email', 'linh@example.com'],
  ['Phone', 'Số điện thoại', '0901 234 567'],
];

export default function SpacingDemo() {
  const id = useId(); // the post renders this twice (EN + VI), so input ids must differ
  const [pad, setPad] = useState(PRESETS.added.pad);
  const [label, setLabel] = useState(PRESETS.added.label);
  const [group, setGroup] = useState(PRESETS.added.group);

  const apply = (p: typeof PRESETS.added) => {
    setPad(p.pad);
    setLabel(p.label);
    setGroup(p.group);
  };
  const isPreset = (p: typeof PRESETS.added) => p.pad === pad && p.label === label && p.group === group;
  const ambiguous = group <= label * 1.5;

  const slider = (key: string, en: string, vi: string, value: number, set: (n: number) => void, max: number) => (
    <label htmlFor={`${id}-${key}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 10px', fontSize: 13, minWidth: 190 }}>
      <span>{L(en, vi)}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{value}px</span>
      <input id={`${id}-${key}`} type="range" min={0} max={max} value={value} onChange={(e) => set(Number(e.target.value))} style={{ gridColumn: '1 / -1' }} />
    </label>
  );

  return (
    <div className="sd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>{L('Start from', 'Bắt đầu từ')}</span>
          <button type="button" className={isPreset(PRESETS.added) ? 'sd-btn is-on' : 'sd-btn'} onClick={() => apply(PRESETS.added)}>
            {L('Space added until OK', 'Thêm dần tới khi tạm ổn')}
          </button>
          <button type="button" className={isPreset(PRESETS.trimmed) ? 'sd-btn is-on' : 'sd-btn'} onClick={() => apply(PRESETS.trimmed)}>
            {L('Too much, then trimmed', 'Thật nhiều rồi bớt đi')}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginBottom: 14 }}>
        {slider('pad', 'Card padding', 'Padding của thẻ', pad, setPad, 48)}
        {slider('label', 'Gap under label', 'Khoảng dưới nhãn', label, setLabel, 32)}
        {slider('group', 'Gap between fields', 'Khoảng giữa các ô', group, setGroup, 48)}
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #dcd8cf', borderRadius: 10, padding: pad, maxWidth: 380, color: '#1f2328', transition: 'padding 0.2s ease' }}>
        <p style={{ margin: `0 0 ${Math.max(group, 12)}px`, fontSize: 18, fontWeight: 650 }}>{L('Contact details', 'Thông tin liên hệ')}</p>
        {FIELDS.map(([en, vi, value], i) => (
          <div key={en} style={{ marginBottom: i === FIELDS.length - 1 ? 0 : group, transition: 'margin 0.2s ease' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: label, transition: 'margin 0.2s ease' }}>{L(en, vi)}</div>
            <div style={{ border: '1px solid #c9c5bc', borderRadius: 6, padding: '9px 12px', fontSize: 15, color: '#4b5563' }}>{value}</div>
          </div>
        ))}
      </div>

      <p style={{ margin: '12px 0 0', fontSize: 14, color: ambiguous ? 'var(--red)' : 'var(--text-body)' }}>
        {ambiguous
          ? L('Ambiguous: a label sits about as close to the box above it as to its own box.', 'Mơ hồ: nhãn nằm gần ô phía trên cũng ngang ô của chính nó.')
          : L('Clear: each label is much closer to its own box than to the one above.', 'Rõ ràng: mỗi nhãn gần ô của nó hơn hẳn ô phía trên.')}
      </p>
    </div>
  );
}
