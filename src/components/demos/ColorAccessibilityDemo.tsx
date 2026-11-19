import React, { useState } from 'react';

// Interactive Color-Blindness & Semantic UI Simulator for Chapter 5 of Refactoring UI.
// Applies Vienot, Brettel & Mollon (1999) linear-sRGB simulation matrices in JS so
// every browser renders identical, crisp simulated colors without SVG filter quirks.

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

type VisionMode = 'normal' | 'deuteranopia' | 'protanopia' | 'grayscale';

function srgbToLin(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linToSrgb(v: number): number {
  const clamped = Math.max(0, Math.min(1, v));
  const s = clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Vienot et al. (1999) 3x3 matrices in linear RGB for dichromacy simulation
const MATRICES: Record<Exclude<VisionMode, 'normal'>, number[][]> = {
  deuteranopia: [
    [0.29031, 0.70969, 0.0],
    [0.29031, 0.70969, 0.0],
    [-0.02197, 0.02197, 1.0],
  ],
  protanopia: [
    [0.11238, 0.88762, 0.0],
    [0.11238, 0.88762, 0.0],
    [0.00401, -0.00401, 1.0],
  ],
  grayscale: [
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
  ],
};

function simColor(hex: string, mode: VisionMode): string {
  if (mode === 'normal') return hex;
  const [r, g, b] = hexToRgb(hex);
  const lr = srgbToLin(r);
  const lg = srgbToLin(g);
  const lb = srgbToLin(b);
  const m = MATRICES[mode];
  const nr = linToSrgb(m[0][0] * lr + m[0][1] * lg + m[0][2] * lb);
  const ng = linToSrgb(m[1][0] * lr + m[1][1] * lg + m[1][2] * lb);
  const nb = linToSrgb(m[2][0] * lr + m[2][1] * lg + m[2][2] * lb);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

const VISION_OPTIONS: { id: VisionMode; en: string; vi: string }[] = [
  { id: 'normal', en: 'Normal vision', vi: 'Thị giác thường' },
  { id: 'deuteranopia', en: 'Deuteranopia (red–green)', vi: 'Mù màu xanh lá (Deuteranopia)' },
  { id: 'protanopia', en: 'Protanopia (red-weak)', vi: 'Mù màu đỏ (Protanopia)' },
  { id: 'grayscale', en: 'Grayscale', vi: 'Đen trắng' },
];

export default function ColorAccessibilityDemo() {
  const [vision, setVision] = useState<VisionMode>('deuteranopia');
  const [withCues, setWithCues] = useState<boolean>(false);

  const c = (hex: string) => simColor(hex, vision);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 11px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid',
    borderColor: active ? 'var(--red)' : 'var(--border)',
    background: active ? 'var(--red)' : 'var(--bg)',
    color: active ? '#ffffff' : 'var(--text)',
    cursor: 'pointer',
    fontWeight: 500,
  });

  const panelBg = '#f8fafc';
  const cardBg = '#ffffff';
  const borderCol = '#e2e8f0';
  const textDark = '#0f172a';
  const textMuted = '#475569';

  const green = c('#15803d');
  const greenBg = c('#dcfce7');
  const greenBorder = c('#86efac');

  const amber = c('#b45309');
  const amberBg = c('#fef3c7');
  const amberBorder = c('#fcd34d');

  const red = c('#b91c1c');
  const redBg = c('#fee2e2');
  const redBorder = c('#fca5a5');

  const dotGreen = c('#16a34a');
  const dotAmber = c('#d97706');
  const dotRed = c('#dc2626');

  return (
    <div style={{ margin: '1.2em 0', padding: 18, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-alt)' }}>
      {/* Vision mode controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
          {L('Simulate vision:', 'Mô phỏng thị giác:')}
        </span>
        {VISION_OPTIONS.map((opt) => (
          <button key={opt.id} type="button" onClick={() => setVision(opt.id)} style={btnStyle(vision === opt.id)}>
            {L(opt.en, opt.vi)}
          </button>
        ))}
      </div>

      {/* Encoding mode controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
          {L('UI encoding:', 'Cách mã hóa UI:')}
        </span>
        <button type="button" onClick={() => setWithCues(false)} style={btnStyle(!withCues)}>
          {L('Color only', 'Chỉ dùng màu')}
        </button>
        <button type="button" onClick={() => setWithCues(true)} style={btnStyle(withCues)}>
          {L('Color + icon + sign/label', 'Màu + biểu tượng + nhãn')}
        </button>
      </div>

      {/* Simulated mini UI panel */}
      <div
        style={{
          background: panelBg,
          border: `1px solid ${borderCol}`,
          borderRadius: 10,
          padding: 14,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          color: textDark,
        }}
      >
        {/* Card 1: Metric deltas */}
        <div style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: textMuted, marginBottom: 10 }}>
            {L('Weekly metrics', 'Chỉ số tuần')}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${borderCol}` }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: textDark }}>API latency</div>
              <div style={{ fontSize: 12, color: textMuted, fontVariantNumeric: 'tabular-nums' }}>42 ms</div>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: green, fontVariantNumeric: 'tabular-nums' }}>
              {withCues ? '↓ -12%' : '12%'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0 2px' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: textDark }}>Error rate</div>
              <div style={{ fontSize: 12, color: textMuted, fontVariantNumeric: 'tabular-nums' }}>1.8%</div>
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 700, color: red, fontVariantNumeric: 'tabular-nums' }}>
              {withCues ? '↑ +12%' : '12%'}
            </span>
          </div>
        </div>

        {/* Card 2: Form validation */}
        <div style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: textMuted, marginBottom: 10 }}>
            {L('Form validation', 'Kiểm tra biểu mẫu')}
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 600, color: textDark, marginBottom: 5 }}>
            {L('Billing email', 'Email thanh toán')}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: 6,
              border: `2px solid ${dotRed}`,
              background: '#ffffff',
              fontSize: 13,
              color: textDark,
            }}
          >
            <span>dev@company</span>
            {withCues && (
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: redBg,
                  color: red,
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                !
              </span>
            )}
          </div>
          {withCues ? (
            <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: red }}>
              {L('Missing top-level domain (e.g. .com)', 'Thiếu tên miền cuối (ví dụ .com)')}
            </div>
          ) : (
            <div style={{ marginTop: 6, fontSize: 12, color: textMuted }}>
              {L('Red border only — no text or icon', 'Chỉ đổi viền đỏ — không chữ, không icon')}
            </div>
          )}
        </div>

        {/* Card 3: Service status */}
        <div style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: textMuted, marginBottom: 10 }}>
            {L('Service health', 'Trạng thái dịch vụ')}
          </div>

          {[
            { name: 'Payments API', dot: dotGreen, fg: green, bg: greenBg, bd: greenBorder, icon: '✓', en: 'Healthy', vi: 'Ổn định' },
            { name: 'Webhook queue', dot: dotAmber, fg: amber, bg: amberBg, bd: amberBorder, icon: '▲', en: 'Degraded', vi: 'Chậm' },
            { name: 'Auth service', dot: dotRed, fg: red, bg: redBg, bd: redBorder, icon: '✕', en: 'Down', vi: 'Lỗi' },
          ].map((svc, idx) => (
            <div
              key={svc.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: idx === 0 ? '4px 0 6px' : '6px 0',
                borderBottom: idx < 2 ? `1px solid ${borderCol}` : 'none',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: textDark }}>{svc.name}</span>
              {withCues ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: svc.bg,
                    border: `1px solid ${svc.bd}`,
                    color: svc.fg,
                  }}
                >
                  <span aria-hidden="true">{svc.icon}</span>
                  <span>{L(svc.en, svc.vi)}</span>
                </span>
              ) : (
                <span
                  aria-label={svc.en}
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: svc.dot,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic readout */}
      <div
        style={{
          marginTop: 12,
          padding: '9px 12px',
          borderRadius: 8,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          fontSize: 13,
          color: 'var(--text-body)',
        }}
      >
        {!withCues && vision !== 'normal' && (
          <>
            <strong style={{ color: 'var(--red)' }}>{L('Broken signal: ', 'Tín hiệu bị gãy: ')}</strong>
            {L(
              'Without arrows, icons, or labels, green/amber/red collapse into nearly identical muted tones. Switch to "Color + icon + sign/label" to see every widget stay clear.',
              'Khi không có mũi tên, biểu tượng hay nhãn chữ, xanh–vàng–đỏ bị gộp thành các tông gần giống hệt nhau. Thử bật "Màu + biểu tượng + nhãn" để thấy giao diện rõ ràng trở lại.'
            )}
          </>
        )}
        {!withCues && vision === 'normal' && (
          <>
            <strong style={{ color: 'var(--text)' }}>{L('Looks fine to trichromatic eyes: ', 'Mắt thường nhìn vẫn ổn: ')}</strong>
            {L(
              'Now click Deuteranopia or Grayscale above—the exact same UI immediately hides which metric improved and which service is down.',
              'Bây giờ hãy bấm thử Deuteranopia hoặc Đen trắng ở trên — chính giao diện này lập tức không còn phân biệt nổi chỉ số nào tốt hay dịch vụ nào đang sập.'
            )}
          </>
        )}
        {withCues && (
          <>
            <strong style={{ color: '#15803d' }}>{L('Resilient in every vision mode: ', 'Đọc rõ ở mọi chế độ thị giác: ')}</strong>
            {L(
              'Arrows, explicit +/- signs, distinct shapes, and flipped high-contrast labels carry the full meaning even in pure grayscale.',
              'Mũi tên, dấu +/-, hình khối riêng biệt và nhãn đảo tương phản truyền đạt trọn vẹn ý nghĩa ngay cả khi màn hình chỉ còn đen trắng.'
            )}
          </>
        )}
      </div>
    </div>
  );
}
