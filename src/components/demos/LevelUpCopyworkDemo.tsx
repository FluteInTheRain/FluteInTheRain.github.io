import React, { useId, useState } from 'react';

// Part 9 interactive lab: blind UI copywork.
// Readers tune 5 subtle CSS properties by eye to match a reference card,
// then reveal the "DevTools diff" to see what their eye caught or missed.

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

const TARGET = {
  tracking: 0.08,
  leading: 1.15,
  padding: 24,
  mutedBody: true,
  layeredShadow: true,
};

const INITIAL = {
  tracking: 0.0,
  leading: 1.55,
  padding: 12,
  mutedBody: false,
  layeredShadow: false,
};

const SHADOW_LAYERED =
  '0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 20px rgba(0, 0, 0, 0.07)';
const SHADOW_HEAVY = '0 10px 25px rgba(0, 0, 0, 0.18)';

interface CardPreviewProps {
  tracking: number;
  leading: number;
  padding: number;
  mutedBody: boolean;
  layeredShadow: boolean;
  labelEn: string;
  labelVi: string;
  accentLabel?: boolean;
}

function CardPreview({
  tracking,
  leading,
  padding,
  mutedBody,
  layeredShadow,
  labelEn,
  labelVi,
  accentLabel,
}: CardPreviewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: accentLabel ? 'var(--red)' : 'var(--text-muted)',
        }}
      >
        {L(labelEn, labelVi)}
      </div>
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding,
          boxShadow: layeredShadow ? SHADOW_LAYERED : SHADOW_HEAVY,
          transition: 'padding 120ms ease, box-shadow 120ms ease',
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: `${tracking.toFixed(2)}em`,
            color: 'var(--red)',
            marginBottom: 8,
          }}
        >
          {L('Team plan', 'Gói đội nhóm')}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            lineHeight: leading,
            color: 'var(--text)',
            marginBottom: 10,
          }}
        >
          {L('Ship faster with shared design tokens', 'Ra sản phẩm nhanh hơn với hệ token dùng chung')}
        </div>
        <p
          style={{
            margin: '0 0 16px',
            fontSize: 14,
            lineHeight: 1.55,
            color: mutedBody ? 'var(--text-muted)' : 'var(--text)',
          }}
        >
          {L(
            'Includes unlimited environments, automated contrast checks, and audit history for up to 15 engineers.',
            'Bao gồm không giới hạn môi trường thử, kiểm tra độ tương phản tự động và lịch sử chỉnh sửa cho tối đa 15 kỹ sư.'
          )}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border)',
            paddingTop: 12,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
            $29
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>
              {L(' / month', ' / tháng')}
            </span>
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#ffffff',
              background: 'var(--red)',
              padding: '6px 12px',
              borderRadius: 6,
            }}
          >
            {L('Start trial', 'Dùng thử')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LevelUpCopyworkDemo() {
  const id = useId();
  const [tracking, setTracking] = useState(INITIAL.tracking);
  const [leading, setLeading] = useState(INITIAL.leading);
  const [padding, setPadding] = useState(INITIAL.padding);
  const [mutedBody, setMutedBody] = useState(INITIAL.mutedBody);
  const [layeredShadow, setLayeredShadow] = useState(INITIAL.layeredShadow);
  const [revealed, setRevealed] = useState(false);

  const checks = [
    {
      labelEn: 'Eyebrow letter-spacing',
      labelVi: 'Giãn chữ dòng nhãn trên',
      yours: `${tracking.toFixed(2)}em`,
      target: `${TARGET.tracking.toFixed(2)}em`,
      ok: Math.abs(tracking - TARGET.tracking) <= 0.02,
    },
    {
      labelEn: 'Heading line-height',
      labelVi: 'Dãn dòng tiêu đề',
      yours: leading.toFixed(2),
      target: TARGET.leading.toFixed(2),
      ok: Math.abs(leading - TARGET.leading) <= 0.08,
    },
    {
      labelEn: 'Card padding',
      labelVi: 'Khoảng đệm trong thẻ',
      yours: `${padding}px`,
      target: `${TARGET.padding}px`,
      ok: Math.abs(padding - TARGET.padding) <= 4,
    },
    {
      labelEn: 'Body text tone',
      labelVi: 'Sắc độ văn bản phụ',
      yours: mutedBody ? 'muted' : 'full',
      target: 'muted',
      ok: mutedBody === TARGET.mutedBody,
    },
    {
      labelEn: 'Shadow depth',
      labelVi: 'Đổ bóng thẻ',
      yours: layeredShadow ? 'two-part' : 'single heavy',
      target: 'two-part',
      ok: layeredShadow === TARGET.layeredShadow,
    },
  ];

  const score = checks.filter((c) => c.ok).length;

  const reset = () => {
    setTracking(INITIAL.tracking);
    setLeading(INITIAL.leading);
    setPadding(INITIAL.padding);
    setMutedBody(INITIAL.mutedBody);
    setLayeredShadow(INITIAL.layeredShadow);
    setRevealed(false);
  };

  const snap = () => {
    setTracking(TARGET.tracking);
    setLeading(TARGET.leading);
    setPadding(TARGET.padding);
    setMutedBody(TARGET.mutedBody);
    setLayeredShadow(TARGET.layeredShadow);
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid',
    borderColor: active ? 'var(--red)' : 'var(--border)',
    background: active ? 'var(--red)' : 'var(--bg)',
    color: active ? '#ffffff' : 'var(--text)',
    cursor: 'pointer',
    fontWeight: 500,
  });

  return (
    <div
      style={{
        margin: '1.25em 0',
        padding: 18,
        border: '1px solid var(--border)',
        borderRadius: 10,
        background: 'var(--bg-alt)',
      }}
    >
      {/* Side-by-side comparison */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
          alignItems: 'start',
          marginBottom: 20,
        }}
      >
        <CardPreview
          tracking={TARGET.tracking}
          leading={TARGET.leading}
          padding={TARGET.padding}
          mutedBody={TARGET.mutedBody}
          layeredShadow={TARGET.layeredShadow}
          labelEn="Reference (eyeball this — no DevTools)"
          labelVi="Bản mẫu (nhìn bằng mắt — không mở DevTools)"
        />
        <CardPreview
          tracking={tracking}
          leading={leading}
          padding={padding}
          mutedBody={mutedBody}
          layeredShadow={layeredShadow}
          labelEn="Your rebuild"
          labelVi="Bản bạn tự chỉnh"
          accentLabel
        />
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          paddingTop: 14,
          borderTop: '1px solid var(--border)',
          marginBottom: 16,
        }}
      >
        <label htmlFor={`${id}-track`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 8px', fontSize: 13 }}>
          <span style={{ color: 'var(--text-body)' }}>{L('Eyebrow letter-spacing', 'Giãn chữ dòng nhãn')}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text)' }}>
            {tracking.toFixed(2)}em
          </span>
          <input
            id={`${id}-track`}
            type="range"
            min={0}
            max={0.14}
            step={0.01}
            value={tracking}
            onChange={(e) => setTracking(Number(e.target.value))}
            style={{ gridColumn: '1 / -1', accentColor: 'var(--red)' }}
          />
        </label>

        <label htmlFor={`${id}-lead`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 8px', fontSize: 13 }}>
          <span style={{ color: 'var(--text-body)' }}>{L('Heading line-height', 'Dãn dòng tiêu đề')}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text)' }}>
            {leading.toFixed(2)}
          </span>
          <input
            id={`${id}-lead`}
            type="range"
            min={1.0}
            max={1.65}
            step={0.05}
            value={leading}
            onChange={(e) => setLeading(Number(e.target.value))}
            style={{ gridColumn: '1 / -1', accentColor: 'var(--red)' }}
          />
        </label>

        <label htmlFor={`${id}-pad`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 8px', fontSize: 13 }}>
          <span style={{ color: 'var(--text-body)' }}>{L('Card padding', 'Khoảng đệm thẻ')}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text)' }}>
            {padding}px
          </span>
          <input
            id={`${id}-pad`}
            type="range"
            min={10}
            max={32}
            step={2}
            value={padding}
            onChange={(e) => setPadding(Number(e.target.value))}
            style={{ gridColumn: '1 / -1', accentColor: 'var(--red)' }}
          />
        </label>
      </div>

      {/* Toggle controls + Reveal actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" onClick={() => setMutedBody((v) => !v)} style={btnStyle(mutedBody)}>
            {mutedBody
              ? L('Body tone: muted', 'Chữ phụ: dịu màu')
              : L('Body tone: full contrast', 'Chữ phụ: đen đậm')}
          </button>
          <button type="button" onClick={() => setLayeredShadow((v) => !v)} style={btnStyle(layeredShadow)}>
            {layeredShadow
              ? L('Shadow: two-part layered', 'Bóng: hai lớp mềm')
              : L('Shadow: single heavy', 'Bóng: một lớp nặng')}
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" onClick={() => setRevealed((v) => !v)} style={btnStyle(revealed)}>
            {revealed
              ? L('Hide DevTools diff', 'Ẩn đối chiếu DevTools')
              : L('Reveal DevTools diff', 'Mở đối chiếu DevTools')}
          </button>
          <button type="button" onClick={snap} style={btnStyle(false)}>
            {L('Snap to reference', 'Khớp bản mẫu')}
          </button>
          <button type="button" onClick={reset} style={btnStyle(false)}>
            {L('Reset', 'Đặt lại')}
          </button>
        </div>
      </div>

      {/* DevTools diff reveal */}
      {revealed && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg)',
            fontSize: 13.5,
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
            {L(
              `Matched ${score} of ${checks.length} details by eye`,
              `Khớp bằng mắt ${score} / ${checks.length} chi tiết`
            )}
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {checks.map((c) => (
              <div
                key={c.labelEn}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '4px 0',
                  borderBottom: '1px solid var(--border)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span style={{ color: 'var(--text-body)' }}>{L(c.labelEn, c.labelVi)}</span>
                <span style={{ color: c.ok ? 'var(--text)' : 'var(--red)', fontWeight: c.ok ? 500 : 600 }}>
                  {c.yours} {L('vs', 'so với')} {c.target} ({c.ok ? L('close', 'khớp') : L('off', 'lệch')})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
