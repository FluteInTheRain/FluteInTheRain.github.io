import React, { useId, useState } from 'react';

// Interactive elevation & two-part shadow lab for Chapter 6 (Creating Depth).
// Lets readers compare single blurry drop-shadows against two-part (direct + ambient)
// elevation tokens, tinted vs pure-black shadows, and overhead top-edge highlights.

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

interface LevelSpec {
  level: number;
  token: string;
  roleEn: string;
  roleVi: string;
  // Direct light shadow (offsetY, blur, spread, alpha)
  direct: [number, number, number, number];
  // Tight ambient occlusion shadow (offsetY, blur, spread, alpha) — fades at high elevation
  ambient: [number, number, number, number];
  // Single-layer naive equivalent (what AI tools typically emit)
  single: [number, number, number, number];
}

const LEVELS: LevelSpec[] = [
  {
    level: 0,
    token: 'none',
    roleEn: 'Base canvas',
    roleVi: 'Nền chính',
    direct: [0, 0, 0, 0],
    ambient: [0, 0, 0, 0],
    single: [0, 0, 0, 0],
  },
  {
    level: 1,
    token: 'shadow-sm',
    roleEn: 'Button / control',
    roleVi: 'Nút bấm / điều khiển',
    direct: [1, 3, 0, 0.10],
    ambient: [1, 2, -1, 0.14],
    single: [0, 6, 0, 0.18],
  },
  {
    level: 2,
    token: 'shadow-md',
    roleEn: 'Card / panel',
    roleVi: 'Thẻ nội dung',
    direct: [4, 6, -1, 0.11],
    ambient: [2, 4, -2, 0.11],
    single: [0, 14, 0, 0.20],
  },
  {
    level: 3,
    token: 'shadow-lg',
    roleEn: 'Dropdown / menu',
    roleVi: 'Menu thả xuống',
    direct: [10, 15, -3, 0.12],
    ambient: [4, 6, -4, 0.08],
    single: [0, 22, 0, 0.22],
  },
  {
    level: 4,
    token: 'shadow-xl',
    roleEn: 'Popover / sticky bar',
    roleVi: 'Hộp nổi / thanh dính',
    direct: [18, 25, -5, 0.13],
    ambient: [6, 10, -6, 0.05],
    single: [0, 32, 0, 0.24],
  },
  {
    level: 5,
    token: 'shadow-2xl',
    roleEn: 'Modal / dragged item',
    roleVi: 'Hộp thoại / phần tử đang kéo',
    direct: [25, 45, -12, 0.22],
    ambient: [8, 12, -8, 0.02],
    single: [0, 44, 0, 0.28],
  },
];

function fmtColor(tinted: boolean, alpha: number): string {
  const a = alpha.toFixed(2);
  return tinted ? `hsl(30 14% 12% / ${a})` : `rgb(0 0 0 / ${a})`;
}

function buildShadow(spec: LevelSpec, twoPart: boolean, tinted: boolean, topLight: boolean): string {
  const parts: string[] = [];
  if (topLight && spec.level > 0) {
    parts.push('inset 0 1px 0 hsl(40 30% 96% / 0.75)');
  }
  if (spec.level === 0) {
    return parts.length ? parts.join(', ') : 'none';
  }
  if (twoPart) {
    const [dy, db, ds, da] = spec.direct;
    const [ay, ab, as, aa] = spec.ambient;
    parts.push(`0 ${dy}px ${db}px ${ds}px ${fmtColor(tinted, da)}`);
    if (aa > 0.025) {
      parts.push(`0 ${ay}px ${ab}px ${as}px ${fmtColor(tinted, aa)}`);
    }
  } else {
    const [sy, sb, ss, sa] = spec.single;
    parts.push(`0 ${sy}px ${sb}px ${ss}px ${fmtColor(tinted, sa)}`);
  }
  return parts.join(',\n  ');
}

export default function DepthElevationDemo() {
  const id = useId();
  const [level, setLevel] = useState(3);
  const [twoPart, setTwoPart] = useState(true);
  const [tinted, setTinted] = useState(true);
  const [topLight, setTopLight] = useState(true);
  const [pressed, setPressed] = useState(false);

  const spec = LEVELS[level];
  const cardShadow = buildShadow(spec, twoPart, tinted, topLight);
  const btnSpec = pressed ? LEVELS[0] : LEVELS[1];
  const btnShadow = buildShadow(btnSpec, twoPart, tinted, topLight);

  const presetBtn = (active: boolean): React.CSSProperties => ({
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

  const isBalanced = level === 3 && twoPart && tinted && topLight;
  const isAiMuddy = level === 3 && !twoPart && !tinted && !topLight;
  const isModal = level === 5 && twoPart && tinted && topLight;

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
      {/* Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
          {L('Presets:', 'Mẫu sẵn:')}
        </span>
        <button
          type="button"
          style={presetBtn(isBalanced)}
          onClick={() => {
            setLevel(3);
            setTwoPart(true);
            setTinted(true);
            setTopLight(true);
          }}
        >
          {L('Two-part dropdown (L3)', 'Menu hai lớp (Bậc 3)')}
        </button>
        <button
          type="button"
          style={presetBtn(isAiMuddy)}
          onClick={() => {
            setLevel(3);
            setTwoPart(false);
            setTinted(false);
            setTopLight(false);
          }}
        >
          {L('Single blurry black (AI default)', 'Một lớp đen nhòe (mặc định AI)')}
        </button>
        <button
          type="button"
          style={presetBtn(isModal)}
          onClick={() => {
            setLevel(5);
            setTwoPart(true);
            setTinted(true);
            setTopLight(true);
          }}
        >
          {L('Modal elevation (L5)', 'Hộp thoại nổi cao (Bậc 5)')}
        </button>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 14,
          marginBottom: 18,
          alignItems: 'center',
        }}
      >
        <label htmlFor={`${id}-lvl`} style={{ display: 'grid', gap: 4, fontSize: 13, color: 'var(--text)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>{L('Elevation level', 'Bậc độ cao')}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--red)', fontWeight: 700 }}>
              L{spec.level} · {spec.token}
            </span>
          </div>
          <input
            id={`${id}-lvl`}
            type="range"
            min={0}
            max={5}
            step={1}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            style={{ accentColor: 'var(--red)', width: '100%' }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {L(spec.roleEn, spec.roleVi)}
          </span>
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={twoPart}
              onChange={(e) => setTwoPart(e.target.checked)}
              style={{ accentColor: 'var(--red)' }}
            />
            <span>{L('Two-part shadow (direct + ambient)', 'Bóng hai lớp (trực tiếp + tiếp xúc)')}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={tinted}
              onChange={(e) => setTinted(e.target.checked)}
              style={{ accentColor: 'var(--red)' }}
            />
            <span>{L('Warm-tinted shadow (not pure black)', 'Pha tông ấm (không dùng đen thuần)')}</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={topLight}
              onChange={(e) => setTopLight(e.target.checked)}
              style={{ accentColor: 'var(--red)' }}
            />
            <span>{L('1px overhead top-edge highlight', 'Viền sáng 1px đón ánh sáng mép trên')}</span>
          </label>
        </div>
      </div>

      {/* Live Preview Stage */}
      <div
        style={{
          padding: '38px 24px',
          borderRadius: 10,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 340,
            padding: '18px 20px',
            borderRadius: 10,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: cardShadow,
            transform: `translateY(${-level * 1.5}px)`,
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
            {L('Deployment ready', 'Bản phát hành sẵn sàng')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
            {L(
              'Hold the button below to feel how dropping elevation on press gives physical feedback.',
              'Nhấn giữ nút bên dưới để cảm nhận cách hạ độ cao khi bấm tạo cảm giác vật lý.',
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              type="button"
              onMouseDown={() => setPressed(true)}
              onMouseUp={() => setPressed(false)}
              onMouseLeave={() => setPressed(false)}
              onTouchStart={() => setPressed(true)}
              onTouchEnd={() => setPressed(false)}
              style={{
                padding: '7px 14px',
                borderRadius: 7,
                border: '1px solid var(--red)',
                background: 'var(--red)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: btnShadow,
                transform: pressed ? 'translateY(1px)' : 'translateY(0)',
                transition: 'box-shadow 0.08s ease, transform 0.08s ease',
              }}
            >
              {L('Hold to press', 'Nhấn giữ để bấm')}
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
              {pressed ? L('Pressed: L0', 'Đang bấm: Bậc 0') : L('Resting: L1', 'Mặc định: Bậc 1')}
            </span>
          </div>
        </div>
      </div>

      {/* Generated CSS readout */}
      <pre
        style={{
          margin: 0,
          padding: '12px 14px',
          borderRadius: 8,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          fontSize: 12.5,
          lineHeight: 1.55,
          overflowX: 'auto',
          color: 'var(--text-body)',
        }}
      >
        <code>{`box-shadow:\n  ${cardShadow};`}</code>
      </pre>
    </div>
  );
}
