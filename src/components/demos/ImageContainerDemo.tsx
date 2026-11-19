import React, { useState } from 'react';

// Interactive playground for Chapter 7: User-Upload Chaos Simulator.
// Shows a 3-card feed fed with wildly mismatched user uploads (3:1 panorama,
// 2:3 tall portrait with face near the top, and 1:1 pure-white studio product photo)
// and lets readers step through progressive CSS container defenses.

type Stage = 'raw' | 'cover' | 'polished';

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. Ultra-wide 3:1 panorama (600x200)
const PANORAMA_SRC = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="65%" stop-color="#93c5fd"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </linearGradient>
  </defs>
  <rect width="600" height="200" fill="url(#sky)"/>
  <circle cx="485" cy="52" r="22" fill="#fffbeb" opacity="0.9"/>
  <polygon points="0,165 95,88 185,152 290,72 415,155 510,92 600,145 600,200 0,200" fill="#334155"/>
  <polygon points="0,200 130,130 265,172 420,122 600,168 600,200" fill="#1e293b"/>
  <line x1="0" y1="176" x2="600" y2="176" stroke="#94a3b8" stroke-width="2" opacity="0.45"/>
</svg>
`);

// 2. Tall 2:3 portrait (300x450) with subject's face near the top third
const PORTRAIT_SRC = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#bg)"/>
  <!-- Subtle studio wall panel -->
  <rect x="24" y="20" width="252" height="410" rx="8" fill="#f1f5f9" opacity="0.5"/>
  <!-- Hair / top of head near y=32..105 (gets clipped when center-cropped!) -->
  <ellipse cx="150" cy="82" rx="46" ry="50" fill="#1e293b"/>
  <!-- Face -->
  <ellipse cx="150" cy="96" rx="37" ry="42" fill="#f1c29b"/>
  <!-- Hair fringe -->
  <path d="M112 84 C118 48, 182 48, 188 84 C174 68, 126 68, 112 84 Z" fill="#1e293b"/>
  <!-- Eyes & smile -->
  <circle cx="136" cy="94" r="3.2" fill="#1e293b"/>
  <circle cx="164" cy="94" r="3.2" fill="#1e293b"/>
  <path d="M138 112 Q150 122 162 112" fill="none" stroke="#9a5b3b" stroke-width="2.6" stroke-linecap="round"/>
  <!-- Neck -->
  <rect x="137" y="132" width="26" height="28" rx="8" fill="#e5b087"/>
  <!-- Jacket & torso filling the middle and lower 2/3 -->
  <path d="M62 215 C68 165, 110 155, 150 155 C190 155, 232 165, 238 215 L252 450 L48 450 Z" fill="#334155"/>
  <!-- Shirt collar -->
  <polygon points="130,155 150,210 170,155" fill="#f8fafc"/>
  <!-- Lanyard / pocket detail in center of tall image -->
  <rect x="176" y="240" width="38" height="24" rx="4" fill="#475569"/>
  <line x1="150" y1="210" x2="150" y2="450" stroke="#1e293b" stroke-width="2" opacity="0.4"/>
</svg>
`);

// 3. Square 1:1 pure-white studio product photo (400x400)
const PRODUCT_SRC = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="#ffffff"/>
  <!-- Soft contact shadow under object -->
  <ellipse cx="200" cy="306" rx="108" ry="14" fill="#0f172a" opacity="0.1"/>
  <!-- Minimal studio camera body -->
  <rect x="92" y="138" width="216" height="154" rx="16" fill="#1e293b"/>
  <rect x="116" y="114" width="76" height="28" rx="6" fill="#334155"/>
  <rect x="248" y="124" width="32" height="14" rx="4" fill="#94a3b8"/>
  <!-- Lens barrel -->
  <circle cx="206" cy="215" r="56" fill="#0f172a" stroke="#64748b" stroke-width="6"/>
  <circle cx="206" cy="215" r="36" fill="#1e293b" stroke="#475569" stroke-width="3"/>
  <circle cx="206" cy="215" r="18" fill="#020617"/>
  <circle cx="194" cy="202" r="6" fill="#e2e8f0" opacity="0.65"/>
  <!-- Small red accent dot -->
  <circle cx="122" cy="166" r="5" fill="#b3402f"/>
</svg>
`);

interface FeedItem {
  id: string;
  src: string;
  ratioLabel: string;
  titleEn: string;
  titleVi: string;
  metaEn: string;
  metaVi: string;
  isPortrait?: boolean;
  isWhiteBg?: boolean;
}

const ITEMS: FeedItem[] = [
  {
    id: 'panorama',
    src: PANORAMA_SRC,
    ratioLabel: '3:1',
    titleEn: 'Ridge trail camp',
    titleVi: 'Trại trên sống núi',
    metaEn: 'Uploaded 1800 × 600',
    metaVi: 'Tải lên 1800 × 600',
  },
  {
    id: 'portrait',
    src: PORTRAIT_SRC,
    ratioLabel: '2:3',
    titleEn: 'Speaker profile',
    titleVi: 'Hồ sơ diễn giả',
    metaEn: 'Uploaded 600 × 900',
    metaVi: 'Tải lên 600 × 900',
    isPortrait: true,
  },
  {
    id: 'product',
    src: PRODUCT_SRC,
    ratioLabel: '1:1',
    titleEn: 'Rangefinder kit',
    titleVi: 'Bộ máy ảnh phim',
    metaEn: 'Pure white backdrop',
    metaVi: 'Ảnh phông trắng tinh',
    isWhiteBg: true,
  },
];

export default function ImageContainerDemo() {
  const [stage, setStage] = useState<Stage>('raw');

  const stages: { key: Stage; en: string; vi: string }[] = [
    { key: 'raw', en: '1. Raw (no container rules)', vi: '1. Ảnh thô (không khóa khung)' },
    { key: 'cover', en: '2. + aspect-ratio + object-fit: cover', vi: '2. + aspect-ratio + object-fit: cover' },
    {
      key: 'polished',
      en: '3. + object-position: top + 1px inner ring',
      vi: '3. + object-position: top + viền chìm 1px',
    },
  ];

  const isLocked = stage === 'cover' || stage === 'polished';
  const isPolished = stage === 'polished';

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Stage selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {stages.map((s) => {
          const active = stage === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStage(s.key)}
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
              {L(s.en, s.vi)}
            </button>
          );
        })}
      </div>

      {/* Diagnostic status strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px 18px',
          fontSize: 12.5,
          marginBottom: 14,
          color: 'var(--text-muted)',
        }}
      >
        <span>
          {L('Row alignment:', 'Độ thẳng hàng:')}{' '}
          <strong style={{ color: isLocked ? 'var(--text)' : 'var(--red)' }}>
            {isLocked ? L('Locked 4:3 (CLS = 0)', 'Khóa 4:3 (CLS = 0)') : L('Ragged heights', 'Cao thấp lởm chởm')}
          </strong>
        </span>
        <span>
          {L('Portrait framing:', 'Khung ảnh chân dung:')}{' '}
          <strong style={{ color: stage === 'cover' ? 'var(--red)' : 'var(--text)' }}>
            {stage === 'raw'
              ? L('Uncropped (too tall)', 'Không cắt (quá cao)')
              : stage === 'cover'
                ? L('Head clipped (center crop)', 'Bị cắt mất đầu (cắt giữa)')
                : L('Face preserved (top bias)', 'Giữ trọn mặt (neo cạnh trên)')}
          </strong>
        </span>
        <span>
          {L('White-bg edge:', 'Mép ảnh nền trắng:')}{' '}
          <strong style={{ color: isPolished ? 'var(--text)' : 'var(--red)' }}>
            {isPolished ? L('Crisp 1px inner ring', 'Rõ nét với viền chìm 1px') : L('Bleeds into card', 'Hòa tan vào nền thẻ')}
          </strong>
        </span>
      </div>

      {/* 3-card feed stage (explicit light card surface so white-bg bleed is visible in both themes) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
          gap: 14,
          alignItems: 'start',
          padding: 14,
          borderRadius: 10,
          background: 'var(--bg-alt)',
          border: '1px solid var(--border)',
        }}
      >
        {ITEMS.map((item) => {
          const objectPosition = isPolished && item.isPortrait ? 'center top' : 'center center';
          return (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: 8,
                border: '1px solid rgba(15, 23, 42, 0.1)',
                padding: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {/* Media wrapper */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: isLocked ? '4 / 3' : undefined,
                  borderRadius: 6,
                  overflow: 'hidden',
                  background: '#ffffff',
                }}
              >
                <img
                  src={item.src}
                  alt={item.titleEn}
                  style={{
                    width: '100%',
                    height: isLocked ? '100%' : 'auto',
                    objectFit: isLocked ? 'cover' : undefined,
                    objectPosition: isLocked ? objectPosition : undefined,
                    display: 'block',
                  }}
                />
                {/* 1px semi-transparent inner ring overlay (Option B from the post) */}
                {isPolished && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'inherit',
                      boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.12)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>

              {/* Card text */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1e293b' }}>
                  {L(item.titleEn, item.titleVi)}
                </span>
                <span style={{ fontSize: 11.5, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                  {item.ratioLabel}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{L(item.metaEn, item.metaVi)}</div>
            </div>
          );
        })}
      </div>

      {/* Explanatory footer */}
      <p style={{ margin: '12px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
        {stage === 'raw' &&
          L(
            'Without container rules, three user uploads create a jagged row: the 3:1 panorama looks squished flat, the 2:3 portrait stretches its card twice as tall, and the white-background camera melts into the white card.',
            'Không có quy tắc khung chứa, 3 ảnh người dùng làm vỡ hàng ngay lập tức: ảnh 3:1 dẹt lép, ảnh chân dung 2:3 kéo thẻ dài gấp đôi, còn chiếc máy ảnh phông trắng thì tan biến ranh giới vào mặt thẻ.'
          )}
        {stage === 'cover' &&
          L(
            'Adding aspect-ratio: 4 / 3 and object-fit: cover aligns every card immediately with zero distortion — but look closely: center cropping sliced off the speaker’s forehead, and the camera photo still has no visible edge.',
            'Thêm aspect-ratio: 4 / 3 và object-fit: cover lập tức căn phẳng hàng thẻ mà không méo ảnh — nhưng nhìn kỹ sẽ thấy: cắt chính giữa đã xén mất trán diễn giả, và ảnh máy ảnh vẫn chưa thấy mép khung.'
          )}
        {stage === 'polished' &&
          L(
            'Biasing portraits with object-position: center top keeps the face intact, while a 1px rgba(0, 0, 0, 0.12) inner ring defines the white-background product edge without adding heavy borders to the darker photos.',
            'Neo ảnh chân dung bằng object-position: center top giúp giữ trọn khuôn mặt, còn viền chìm 1px rgba(0, 0, 0, 0.12) tách rõ mép ảnh nền trắng mà không làm nặng nề hai bức ảnh còn lại.'
          )}
      </p>
    </div>
  );
}
