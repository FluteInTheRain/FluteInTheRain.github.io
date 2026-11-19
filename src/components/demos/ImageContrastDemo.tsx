import React, { useId, useState } from 'react';

// Interactive playground for Chapter 7: making text readable over a high-contrast photograph.
// Compares raw photo vs flat dark overlay, directional gradient scrim, colorized low-contrast,
// and soft zero-offset text glow, with a live opacity slider and approximate WCAG contrast readout.

type Mode = 'none' | 'overlay' | 'scrim' | 'colorize' | 'glow';

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

// Relative luminance (WCAG 2.1 formula) for sRGB 0..255
function relLuminance(r: number, g: number, b: number): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastWhiteOver(r: number, g: number, b: number): number {
  const lum = relLuminance(r, g, b);
  return (1.0 + 0.05) / (lum + 0.05);
}

// Blend an overlay color (or, og, ob, alpha) on top of a bright sky pixel (232, 238, 245)
function blendOverBrightSky(or: number, og: number, ob: number, alpha: number) {
  const br = 232;
  const bg = 238;
  const bb = 245;
  return [
    Math.round(or * alpha + br * (1 - alpha)),
    Math.round(og * alpha + bg * (1 - alpha)),
    Math.round(ob * alpha + bb * (1 - alpha)),
  ];
}

export default function ImageContrastDemo() {
  const id = useId();
  const [mode, setMode] = useState<Mode>('scrim');
  const [strength, setStrength] = useState(55); // 20..85 (%)

  const alpha = strength / 100;

  // Compute worst-case contrast (white text against the brightest pixel behind the headline)
  let worstContrast = contrastWhiteOver(232, 238, 245); // ~1.18:1 on bright sunlit sky
  if (mode === 'overlay') {
    const [r, g, b] = blendOverBrightSky(15, 18, 24, alpha);
    worstContrast = contrastWhiteOver(r, g, b);
  } else if (mode === 'scrim') {
    // Bottom-up scrim reaches ~92% of chosen strength behind the lower headline
    const [r, g, b] = blendOverBrightSky(12, 16, 22, Math.min(0.95, alpha * 1.15));
    worstContrast = contrastWhiteOver(r, g, b);
  } else if (mode === 'colorize') {
    // Desaturated + darkened + multiplied brand navy/slate
    const [r, g, b] = blendOverBrightSky(26, 48, 86, Math.min(0.92, alpha * 1.1));
    worstContrast = contrastWhiteOver(r, g, b);
  } else if (mode === 'glow') {
    // Soft halo lowers local luminance right behind glyphs
    const [r, g, b] = blendOverBrightSky(18, 18, 22, alpha * 0.72);
    worstContrast = contrastWhiteOver(r, g, b);
  }

  const passesLarge = worstContrast >= 3.0;
  const passesNormal = worstContrast >= 4.5;

  const modes: { key: Mode; en: string; vi: string }[] = [
    { key: 'none', en: 'No treatment', vi: 'Không xử lý' },
    { key: 'overlay', en: 'Flat dark overlay', vi: 'Lớp phủ tối đều' },
    { key: 'scrim', en: 'Directional scrim', vi: 'Scrim chuyển sắc' },
    { key: 'colorize', en: 'Colorize + low contrast', vi: 'Nhuộm màu + giảm tương phản' },
    { key: 'glow', en: 'Soft text glow', vi: 'Đổ bóng tỏa mềm' },
  ];

  // Background filter when colorize mode is active
  const sceneFilter =
    mode === 'colorize'
      ? `grayscale(100%) contrast(75%) brightness(${Math.round(105 - strength * 0.35)}%)`
      : 'none';

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Mode selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {modes.map((m) => {
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                borderRadius: 6,
                border: '1px solid',
                borderColor: active ? 'var(--red)' : 'var(--border)',
                background: active ? 'var(--red)' : 'var(--bg)',
                color: active ? '#ffffff' : 'var(--text)',
                cursor: 'pointer',
                fontWeight: active ? 600 : 500,
              }}
            >
              {L(m.en, m.vi)}
            </button>
          );
        })}
      </div>

      {/* Strength slider */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <label
          htmlFor={`${id}-strength`}
          style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text)', flex: '1 1 240px' }}
        >
          <span>{L('Treatment strength', 'Độ mạnh lớp xử lý')}</span>
          <input
            id={`${id}-strength`}
            type="range"
            min={20}
            max={85}
            value={strength}
            disabled={mode === 'none'}
            onChange={(e) => setStrength(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, minWidth: 38, textAlign: 'right' }}>
            {mode === 'none' ? '0%' : `${strength}%`}
          </span>
        </label>

        {/* Live WCAG contrast indicator */}
        <div
          style={{
            fontSize: 13,
            color: passesNormal ? 'var(--text)' : 'var(--red)',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
          }}
        >
          {L('Worst-case contrast:', 'Tương phản thấp nhất:')}{' '}
          <span>{worstContrast.toFixed(1)}:1</span>{' '}
          <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
            (
            {passesNormal
              ? L('WCAG AA normal pass', 'Đạt WCAG AA chữ thường')
              : passesLarge
                ? L('Large text only (≥ 3:1)', 'Chỉ đạt chữ lớn (≥ 3:1)')
                : L('Fails WCAG AA', 'Không đạt WCAG AA')}
            )
          </span>
        </div>
      </div>

      {/* Live preview card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          maxHeight: 320,
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        {/* High-contrast photographic-style SVG scene: bright sunlit sky + snow peaks + dark ridge */}
        <svg
          viewBox="0 0 800 450"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            filter: sceneFilter,
            transition: 'filter 180ms ease',
          }}
        >
          <defs>
            <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8bb8e8" />
              <stop offset="55%" stopColor="#e8eef5" />
              <stop offset="100%" stopColor="#f5f3ec" />
            </linearGradient>
          </defs>
          {/* Bright sky */}
          <rect width="800" height="450" fill={`url(#${id}-sky)`} />
          {/* Bright sun & cloud bank right behind left/middle text area */}
          <circle cx="620" cy="110" r="56" fill="#fffdf6" opacity="0.92" />
          <ellipse cx="220" cy="240" rx="230" ry="62" fill="#ffffff" opacity="0.88" />
          <ellipse cx="520" cy="270" rx="210" ry="54" fill="#f7f8fa" opacity="0.82" />
          {/* Distant sunlit snow peaks */}
          <polygon points="0,330 160,175 310,310 470,155 660,320 800,210 800,450 0,450" fill="#cfd8e3" />
          {/* Bright sunlit slope on left, dark shadowed cliff on right (mixed luminance!) */}
          <polygon points="0,330 160,175 230,360 0,450" fill="#eef2f6" />
          <polygon points="470,155 560,360 350,380" fill="#2b3a4a" />
          <polygon points="0,450 260,315 510,410 800,295 800,450" fill="#1e293b" />
          {/* Bright sunlit water reflection streak right across lower-left */}
          <polygon points="40,390 360,350 420,410 60,440" fill="#f1f5f9" opacity="0.9" />
        </svg>

        {/* Treatment layer */}
        {mode === 'overlay' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `rgba(15, 18, 24, ${alpha})`,
              pointerEvents: 'none',
            }}
          />
        )}

        {mode === 'scrim' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to top, rgba(12, 16, 22, ${Math.min(0.95, alpha * 1.15)}) 0%, rgba(12, 16, 22, ${alpha * 0.65}) 45%, rgba(12, 16, 22, 0) 85%)`,
              pointerEvents: 'none',
            }}
          />
        )}

        {mode === 'colorize' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `rgba(26, 48, 86, ${Math.min(0.9, alpha * 1.05)})`,
              mixBlendMode: 'multiply',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Headline + body text over the mixed bright/dark area */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '24px 28px',
            maxWidth: 540,
            color: '#ffffff',
            textShadow:
              mode === 'glow'
                ? `0 0 18px rgba(10, 12, 18, ${Math.min(0.95, alpha + 0.15)}), 0 0 6px rgba(10, 12, 18, ${alpha})`
                : 'none',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 6 }}>
            {L('Plan your ridge traverse before sunrise', 'Lên lịch vượt sống núi trước bình minh')}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.95 }}>
            {L(
              'Notice how the sunlit snow on the left fights white text unless the image itself is tamed.',
              'Để ý mảng tuyết sáng bên trái nuốt chửng chữ trắng nếu bạn không hãm lại độ sáng của ảnh.'
            )}
          </div>
        </div>
      </div>

      {/* Short CSS snippet reflecting current choice */}
      <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
        {mode === 'none' &&
          L(
            'Raw photo: white text passes over the dark ridge on the right, then disappears over the sunlit slope on the left.',
            'Ảnh thô: chữ trắng đọc được trên vách đá tối bên phải, nhưng biến mất ngay trên sườn tuyết sáng bên trái.'
          )}
        {mode === 'overlay' &&
          L(
            `Flat overlay (rgba(15, 18, 24, ${alpha.toFixed(2)})): uniform legibility everywhere, at the cost of dimming the upper sky too.`,
            `Lớp phủ tối đều (rgba(15, 18, 24, ${alpha.toFixed(2)})): chữ rõ đều khắp ảnh, nhưng phần bầu trời phía trên cũng bị xỉn theo.`
          )}
        {mode === 'scrim' &&
          L(
            'Directional scrim: darkens only the bottom zone behind the copy, leaving the sky and peaks bright and natural.',
            'Scrim chuyển sắc: chỉ hạ sáng vùng đáy sau dòng chữ, giữ nguyên bầu trời và đỉnh núi trong trẻo.'
          )}
        {mode === 'colorize' &&
          L(
            'Colorize (desaturate + lower contrast + multiply): turns a busy photo into a cohesive brand backdrop.',
            'Nhuộm màu (khử bão hòa + giảm tương phản + multiply): biến bức ảnh rối mắt thành phông nền đồng bộ màu thương hiệu.'
          )}
        {mode === 'glow' &&
          L(
            'Soft zero-offset text-shadow: preserves the untouched photo while carving a gentle halo around each letter.',
            'Đổ bóng tỏa mềm không lệch trục: giữ nguyên bức ảnh gốc nhưng tạo quầng tối nhẹ tách từng con chữ ra khỏi nền.'
          )}
      </p>
    </div>
  );
}
