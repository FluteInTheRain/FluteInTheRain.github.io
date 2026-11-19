import React, { useId, useState } from 'react';

// Chapter 4 on typography: line length (Bringhurst's 45-75 chars), proportional line-height,
// and headline leading. Three presets show common mistakes (AI default unconstrained vs balanced).

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

const PRESETS = {
  aiDefault: { ch: 105, bodyLeading: 1.25, titleSize: 32, titleLeading: 1.6 },
  balanced: { ch: 65, bodyLeading: 1.6, titleSize: 28, titleLeading: 1.15 },
  squeezed: { ch: 32, bodyLeading: 1.4, titleSize: 24, titleLeading: 1.2 },
};

export default function TypographyDemo() {
  const id = useId();
  const [ch, setCh] = useState(PRESETS.balanced.ch);
  const [bodyLeading, setBodyLeading] = useState(PRESETS.balanced.bodyLeading);
  const [titleSize, setTitleSize] = useState(PRESETS.balanced.titleSize);
  const [titleLeading, setTitleLeading] = useState(PRESETS.balanced.titleLeading);

  const apply = (p: typeof PRESETS.balanced) => {
    setCh(p.ch);
    setBodyLeading(p.bodyLeading);
    setTitleSize(p.titleSize);
    setTitleLeading(p.titleLeading);
  };

  const isPreset = (p: typeof PRESETS.balanced) =>
    p.ch === ch &&
    p.bodyLeading === bodyLeading &&
    p.titleSize === titleSize &&
    p.titleLeading === titleLeading;

  const isIdealLength = ch >= 45 && ch <= 75;
  const isTooLong = ch > 75;

  return (
    <div className="tyd" style={{ margin: '2em 0', padding: 20, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-alt)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{L('Presets:', 'Thiết lập sẵn:')}</span>
        <button
          type="button"
          onClick={() => apply(PRESETS.balanced)}
          style={{
            padding: '5px 12px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid',
            borderColor: isPreset(PRESETS.balanced) ? 'var(--accent)' : 'var(--border)',
            background: isPreset(PRESETS.balanced) ? 'var(--accent)' : 'var(--bg)',
            color: isPreset(PRESETS.balanced) ? '#ffffff' : 'var(--text)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {L('Balanced UI (~65ch)', 'Cân bằng chuẩn (~65 ký tự)')}
        </button>
        <button
          type="button"
          onClick={() => apply(PRESETS.aiDefault)}
          style={{
            padding: '5px 12px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid',
            borderColor: isPreset(PRESETS.aiDefault) ? 'var(--accent)' : 'var(--border)',
            background: isPreset(PRESETS.aiDefault) ? 'var(--accent)' : 'var(--bg)',
            color: isPreset(PRESETS.aiDefault) ? '#ffffff' : 'var(--text)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {L('AI Unconstrained (105ch)', 'AI thả trôi (105 ký tự, dãn dòng lỗi)')}
        </button>
        <button
          type="button"
          onClick={() => apply(PRESETS.squeezed)}
          style={{
            padding: '5px 12px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid',
            borderColor: isPreset(PRESETS.squeezed) ? 'var(--accent)' : 'var(--border)',
            background: isPreset(PRESETS.squeezed) ? 'var(--accent)' : 'var(--bg)',
            color: isPreset(PRESETS.squeezed) ? '#ffffff' : 'var(--text)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          {L('Squeezed (32ch)', 'Quá hẹp (32 ký tự)')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
        <label htmlFor={`${id}-ch`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 8px', fontSize: 13 }}>
          <span>{L('Line length measure', 'Độ rộng tối đa')}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{ch}ch</span>
          <input
            id={`${id}-ch`}
            type="range"
            min={28}
            max={110}
            value={ch}
            onChange={(e) => setCh(Number(e.target.value))}
            style={{ gridColumn: '1 / -1' }}
          />
        </label>

        <label htmlFor={`${id}-bodyLeading`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 8px', fontSize: 13 }}>
          <span>{L('Body line-height', 'Dãn dòng văn bản')}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{bodyLeading.toFixed(2)}</span>
          <input
            id={`${id}-bodyLeading`}
            type="range"
            min={1.1}
            max={2.0}
            step={0.05}
            value={bodyLeading}
            onChange={(e) => setBodyLeading(Number(e.target.value))}
            style={{ gridColumn: '1 / -1' }}
          />
        </label>

        <label htmlFor={`${id}-titleLeading`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 8px', fontSize: 13 }}>
          <span>{L('Headline line-height', 'Dãn dòng tiêu đề')}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{titleLeading.toFixed(2)}</span>
          <input
            id={`${id}-titleLeading`}
            type="range"
            min={1.0}
            max={1.8}
            step={0.05}
            value={titleLeading}
            onChange={(e) => setTitleLeading(Number(e.target.value))}
            style={{ gridColumn: '1 / -1' }}
          />
        </label>
      </div>

      {/* Preview Container */}
      <div style={{ overflowX: 'auto', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
        <div style={{ maxWidth: `${ch}ch`, transition: 'max-width 0.2s ease' }}>
          <h4
            style={{
              fontSize: titleSize,
              lineHeight: titleLeading,
              fontWeight: 700,
              margin: '0 0 12px',
              color: 'var(--text)',
              letterSpacing: titleSize >= 28 ? '-0.02em' : 'normal',
              transition: 'all 0.2s ease',
            }}
          >
            {L(
              'The typography system behind reliable developer interfaces',
              'Hệ thống typography đằng sau những giao diện phần mềm tin cậy'
            )}
          </h4>
          <p
            style={{
              fontSize: 15,
              lineHeight: bodyLeading,
              color: 'var(--text-body)',
              margin: 0,
              transition: 'line-height 0.2s ease',
            }}
          >
            {L(
              'Text is the primary interface for software. When lines stretch across a 1440-pixel screen without boundaries, reader eyes struggle to leap from the end of one sentence to the beginning of the next. Capping line length at 45 to 75 characters keeps reading effortless and maintains natural reading rhythm across all viewports.',
              'Văn bản là giao diện cốt lõi của phần mềm. Khi các dòng chữ kéo dài vô tận trên màn hình 1440px mà không có giới hạn, mắt người đọc sẽ rất vất vả khi phải nhảy từ cuối dòng này sang đầu dòng kế tiếp. Khống chế độ dài dòng ở mức 45 đến 75 ký tự giúp trải nghiệm đọc nhẹ nhàng và giữ nhịp đọc tự nhiên trên mọi độ phân giải.'
            )}
          </p>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isIdealLength ? 'var(--green, #10b981)' : isTooLong ? 'var(--red, #ef4444)' : '#f59e0b',
          }}
        />
        <span style={{ fontWeight: 600, color: isIdealLength ? 'var(--green, #10b981)' : isTooLong ? 'var(--red, #ef4444)' : '#f59e0b' }}>
          {isIdealLength
            ? L('Sweet spot: 45–75 characters (Robert Bringhurst rule)', 'Khoảng lý tưởng: 45–75 ký tự (Quy tắc Robert Bringhurst)')
            : isTooLong
            ? L('Too wide: eye tracking fatigue; readers easily skip lines', 'Dòng quá dài: mắt bị mỏi và rất dễ đọc nhầm dòng')
            : L('Too narrow: jerky reading rhythm; ping-pong eye movements', 'Dòng quá hẹp: mắt phải đảo liên tục làm đứt nhịp đọc')}
        </span>
      </div>
    </div>
  );
}
