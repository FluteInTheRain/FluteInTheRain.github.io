import React, { useState } from 'react';

// Interactive Flat Depth & Dark Mode Elevation Lab for Chapter 6 (Creating Depth).
// Lets readers switch between Light Mode and Dark Mode on a realistic mini UI
// (page canvas + card + raised popover + recessed search input + overlapping avatars)
// and compare drop shadows vs surface lightness steps, 1px top highlights, and inset shadows.

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

type ThemeMode = 'light' | 'dark';
type DepthMethod = 'shadow' | 'tonal';

export default function DepthSurfaceDemo() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [method, setMethod] = useState<DepthMethod>('tonal');
  const [topHighlight, setTopHighlight] = useState(true);
  const [recessedInput, setRecessedInput] = useState(true);

  const isDark = theme === 'dark';
  const isTonal = method === 'tonal';

  // Surface colors per mode & strategy
  const canvasBg = isDark ? '#15120e' : '#f5f2ec';
  const cardBg = isDark
    ? isTonal
      ? '#231e18'
      : '#191612'
    : isTonal
      ? '#fbfaf7'
      : '#ffffff';
  const popoverBg = isDark
    ? isTonal
      ? '#332c23'
      : '#191612'
    : isTonal
      ? '#ffffff'
      : '#ffffff';
  const inputBg = isDark
    ? recessedInput
      ? '#0e0c09'
      : cardBg
    : recessedInput
      ? '#eeebe4'
      : '#ffffff';

  const textPrimary = isDark ? '#f3efe9' : '#262421';
  const textMuted = isDark ? '#a89f92' : '#6b665f';
  const borderColor = isDark
    ? isTonal
      ? '#3a3228'
      : '#26211b'
    : '#e2dcd2';
  const popoverBorder = isDark
    ? isTonal
      ? '#4e4438'
      : '#26211b'
    : '#dfd9ce';

  // Shadows & highlights
  const cardTopEdge = topHighlight
    ? isDark
      ? 'inset 0 1px 0 rgba(255, 244, 228, 0.14)'
      : 'inset 0 1px 0 rgba(255, 255, 255, 0.9)'
    : '';
  const popoverTopEdge = topHighlight
    ? isDark
      ? 'inset 0 1px 0 rgba(255, 244, 228, 0.22)'
      : 'inset 0 1px 0 rgba(255, 255, 255, 0.95)'
    : '';

  const cardDrop = !isTonal
    ? isDark
      ? '0 6px 14px -2px rgba(0, 0, 0, 0.45), 0 2px 5px -1px rgba(0, 0, 0, 0.35)'
      : '0 4px 10px -2px hsl(30 14% 12% / 0.12), 0 2px 4px -2px hsl(30 14% 12% / 0.08)'
    : '';

  const popoverDrop = !isTonal
    ? isDark
      ? '0 18px 34px -6px rgba(0, 0, 0, 0.55), 0 6px 12px -4px rgba(0, 0, 0, 0.4)'
      : '0 16px 28px -6px hsl(30 14% 12% / 0.16), 0 4px 8px -3px hsl(30 14% 12% / 0.08)'
    : isDark
      ? ''
      : '0 1px 2px hsl(30 14% 12% / 0.05)';

  const joinShadows = (...parts: string[]) => {
    const clean = parts.filter(Boolean);
    return clean.length ? clean.join(', ') : 'none';
  };

  const cardShadow = joinShadows(cardTopEdge, cardDrop);
  const popoverShadow = joinShadows(popoverTopEdge, popoverDrop);
  const inputShadow = recessedInput
    ? isDark
      ? 'inset 0 2px 4px rgba(0, 0, 0, 0.65), 0 1px 0 rgba(255, 244, 228, 0.08)'
      : 'inset 0 2px 3px hsl(30 14% 12% / 0.12), 0 1px 0 #ffffff'
    : 'none';

  // Diagnostic message
  let diagEn = '';
  let diagVi = '';
  let diagWarn = false;

  if (isDark && !isTonal) {
    diagWarn = true;
    diagEn =
      'Notice how the card and popover nearly vanish into the dark canvas: black drop shadows have almost zero contrast on #15120E.';
    diagVi =
      'Để ý thẻ và hộp nổi gần như chìm nghỉm vào nền tối: bóng đổ màu đen gần như mất tương phản trên nền #15120E.';
  } else if (isDark && isTonal) {
    diagEn = topHighlight
      ? 'Clean dark-mode depth: stepping lightness (#15120E → #231E18 → #332C23) plus 1px top highlights separates every layer with zero blur.'
      : 'Tonal steps separate the layers cleanly. Turn on the 1px top highlight edge to catch overhead light on the upper rim.';
    diagVi = topHighlight
      ? 'Chiều sâu dark mode rõ nét: nâng dần độ sáng (#15120E → #231E18 → #332C23) kèm viền sáng 1px mép trên tách lớp mà không cần blur.'
      : 'Các bậc sáng đã tách lớp khá rõ. Thử bật thêm viền sáng 1px mép trên để bắt ánh sáng từ trên cao.';
  } else if (!isDark && !isTonal) {
    diagEn =
      'In light mode, two-part drop shadows clearly lift the white card and popover off the warm canvas without changing their fill color.';
    diagVi =
      'Ở giao diện sáng, bóng đổ hai lớp nhấc rõ thẻ trắng và hộp nổi khỏi nền kem mà không cần đổi màu nền của thẻ.';
  } else {
    diagEn =
      'Flat tonal depth in light mode: subtle surface lightness steps (#F5F2EC → #FBFAF7 → #FFFFFF) and cutout avatar rings build hierarchy with 0px blur.';
    diagVi =
      'Chiều sâu phẳng ở giao diện sáng: nhích nhẹ độ sáng bề mặt (#F5F2EC → #FBFAF7 → #FFFFFF) kết hợp viền cắt avatar tạo tầng lớp với 0px blur.';
  }

  const segBtn = (active: boolean): React.CSSProperties => ({
    padding: '5px 12px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid',
    borderColor: active ? 'var(--red)' : 'var(--border)',
    background: active ? 'var(--red)' : 'var(--bg)',
    color: active ? '#ffffff' : 'var(--text)',
    cursor: 'pointer',
    fontWeight: 500,
  });

  const cssSummary = [
    `/* ${isDark ? 'Dark mode' : 'Light mode'} · ${isTonal ? 'Tonal surface steps' : 'Drop shadow'} */`,
    `--surface-canvas:  ${canvasBg};`,
    `--surface-card:    ${cardBg};`,
    `--surface-popover: ${popoverBg};`,
    `--popover-shadow:  ${popoverShadow};`,
    `--input-shadow:    ${inputShadow};`,
  ].join('\n');

  return (
    <div
      style={{
        margin: '1.5em 0',
        padding: 20,
        border: '1px solid var(--border)',
        borderRadius: 12,
        background: 'var(--bg-alt)',
        fontFamily: 'inherit',
      }}
    >
      {/* Controls bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginBottom: 16,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', minWidth: 54 }}>
              {L('Theme:', 'Chế độ:')}
            </span>
            <button type="button" style={segBtn(theme === 'light')} onClick={() => setTheme('light')}>
              {L('Light mode', 'Sáng (Light)')}
            </button>
            <button type="button" style={segBtn(theme === 'dark')} onClick={() => setTheme('dark')}>
              {L('Dark mode', 'Tối (Dark)')}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', minWidth: 54 }}>
              {L('Depth:', 'Kỹ thuật:')}
            </span>
            <button type="button" style={segBtn(method === 'shadow')} onClick={() => setMethod('shadow')}>
              {L('Drop shadow', 'Đổ bóng mờ')}
            </button>
            <button type="button" style={segBtn(method === 'tonal')} onClick={() => setMethod('tonal')}>
              {L('Surface lightness steps', 'Nấc sáng bề mặt')}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13, color: 'var(--text)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={topHighlight}
              onChange={(e) => setTopHighlight(e.target.checked)}
              style={{ accentColor: 'var(--red)' }}
            />
            <span>{L('1px top highlight edge', 'Viền sáng 1px ở mép trên')}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={recessedInput}
              onChange={(e) => setRecessedInput(e.target.checked)}
              style={{ accentColor: 'var(--red)' }}
            />
            <span>{L('Recessed inset shadow on search input', 'Bóng lõm inset trên ô tìm kiếm')}</span>
          </label>
        </div>
      </div>

      {/* Live Mini UI Stage */}
      <div
        style={{
          padding: '22px 20px 26px',
          borderRadius: 10,
          background: canvasBg,
          border: `1px solid ${borderColor}`,
          transition: 'background 0.2s ease, border-color 0.2s ease',
          marginBottom: 14,
        }}
      >
        {/* Top bar: Canvas label + recessed search input */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: textMuted, fontVariantNumeric: 'tabular-nums' }}>
            {L(`Canvas · ${canvasBg}`, `Nền trang · ${canvasBg}`)}
          </span>
          <div
            style={{
              flex: '1 1 180px',
              maxWidth: 250,
              padding: '6px 11px',
              borderRadius: 7,
              background: inputBg,
              border: `1px solid ${borderColor}`,
              boxShadow: inputShadow,
              fontSize: 12.5,
              color: textMuted,
              transition: 'background 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            {L('Search releases…', 'Tìm bản phát hành…')}
          </div>
        </div>

        {/* Main Card + Overlapping Raised Popover */}
        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto' }}>
          {/* Summary Card */}
          <div
            style={{
              padding: '16px 18px 22px',
              borderRadius: 10,
              background: cardBg,
              border: `1px solid ${borderColor}`,
              boxShadow: cardShadow,
              transition: 'background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: textPrimary }}>
                  {L('Design system release v2.4', 'Bản phát hành Design System v2.4')}
                </div>
                <div style={{ fontSize: 12, color: textMuted, fontVariantNumeric: 'tabular-nums' }}>
                  {L(`Card surface · ${cardBg}`, `Bề mặt thẻ · ${cardBg}`)}
                </div>
              </div>

              {/* Overlapping avatars with cutout border matching cardBg */}
              <div style={{ display: 'flex', alignItems: 'center' }} aria-label="Reviewers">
                {[
                  { initials: 'NK', bg: '#b3402f' },
                  { initials: 'AL', bg: '#a9821e' },
                  { initials: 'TM', bg: '#5d6b7a' },
                ].map((av, idx) => (
                  <div
                    key={av.initials}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: av.bg,
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: idx === 0 ? 0 : -8,
                      border: `2.5px solid ${cardBg}`,
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    {av.initials}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 13, color: textMuted, lineHeight: 1.5, maxWidth: 320 }}>
              {L(
                'Cutout avatar borders match the card fill so each circle carves a clean gap instead of colliding.',
                'Viền cắt của avatar trùng màu nền thẻ nên từng vòng tròn tách nhau gọn gàng thay vì dính chùm.',
              )}
            </div>
          </div>

          {/* Raised Popover overlapping bottom-right of card */}
          <div
            style={{
              marginTop: -14,
              marginLeft: 'auto',
              width: '100%',
              maxWidth: 260,
              padding: '13px 15px',
              borderRadius: 9,
              background: popoverBg,
              border: `1px solid ${popoverBorder}`,
              boxShadow: popoverShadow,
              position: 'relative',
              zIndex: 2,
              transition: 'background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>
              {L('Quick actions popover', 'Hộp thao tác nhanh (Popover)')}
            </div>
            <div style={{ fontSize: 11.5, color: textMuted, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
              {L(`Raised layer · ${popoverBg}`, `Lớp nổi cao · ${popoverBg}`)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#ffffff',
                  background: '#b3402f',
                  padding: '4px 10px',
                  borderRadius: 5,
                  boxShadow: topHighlight ? 'inset 0 1px 0 #e68c7c' : 'none',
                }}
              >
                {L('Approve', 'Duyệt bản này')}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: textMuted,
                  padding: '4px 8px',
                }}
              >
                {L('View diff', 'Xem thay đổi')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostic callout */}
      <div
        style={{
          padding: '10px 13px',
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 13,
          lineHeight: 1.5,
          background: diagWarn ? 'var(--red-tint-bg)' : 'var(--bg)',
          border: `1px solid ${diagWarn ? 'var(--red)' : 'var(--border)'}`,
          color: 'var(--text)',
        }}
      >
        {L(diagEn, diagVi)}
      </div>

      {/* Live CSS token readout */}
      <pre
        style={{
          margin: 0,
          padding: '11px 14px',
          borderRadius: 8,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          fontSize: 12,
          lineHeight: 1.55,
          overflowX: 'auto',
          color: 'var(--text-body)',
        }}
      >
        <code>{cssSummary}</code>
      </pre>
    </div>
  );
}
