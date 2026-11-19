import React, { useId, useState } from 'react';

// Interactive color system playground for Chapter 5 of Refactoring UI:
// Explore how hue shifting and saturation boosting keep a 9-step shade ladder vivid,
// how tinted greys change UI temperature, and how flipping contrast hits WCAG 2.1 AA/AAA.

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

const STOPS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

interface HuePreset {
  id: string;
  en: string;
  vi: string;
  hue: number;
  sat: number;
}

const PRESETS: HuePreset[] = [
  { id: 'blue', en: 'Blue (217°)', vi: 'Xanh dương (217°)', hue: 217, sat: 82 },
  { id: 'amber', en: 'Yellow / Amber (45°)', vi: 'Vàng / Hổ phách (45°)', hue: 45, sat: 88 },
  { id: 'emerald', en: 'Emerald (158°)', vi: 'Xanh lục (158°)', hue: 158, sat: 72 },
  { id: 'rose', en: 'Rose (348°)', vi: 'Đỏ hồng (348°)', hue: 348, sat: 80 },
];

type GreyTemp = 'pure' | 'cool' | 'warm';

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const lig = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let r = 0, g = 0, b = 0;
  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const toLin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

function contrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = relLuminance(rgb1);
  const l2 = relLuminance(rgb2);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

// Compute hue shift toward nearest bright hue (60, 180, 300) for light steps
// and nearest dark hue (0, 120, 240) for dark steps, capped within +-22 deg.
function shiftHue(baseHue: number, deltaFrom500: number): number {
  const targets = deltaFrom500 < 0 ? [60, 180, 300] : [0, 120, 240];
  let bestDiff = 0;
  let minAbs = 360;
  for (const t of targets) {
    let diff = ((t - baseHue + 540) % 360) - 180;
    if (Math.abs(diff) < minAbs) {
      minAbs = Math.abs(diff);
      bestDiff = diff;
    }
  }
  const strength = Math.abs(deltaFrom500) / 4; // 0 at 500, 1 at 100 or 900
  const maxShift = 22;
  const applied = Math.sign(bestDiff) * Math.min(Math.abs(bestDiff), maxShift) * strength;
  return Math.round(((baseHue + applied) % 360 + 360) % 360);
}

function buildLadder(baseHue: number, baseSat: number, smart: boolean) {
  const lightnessMap = [94, 86, 75, 63, 50, 42, 34, 26, 18];
  return STOPS.map((stop, idx) => {
    const delta = idx - 4; // -4..+4
    const l = lightnessMap[idx];
    const h = smart ? shiftHue(baseHue, delta) : baseHue;
    const distFromMid = Math.abs(l - 50) / 50;
    const s = smart ? Math.min(98, Math.round(baseSat + distFromMid * 16)) : baseSat;
    const rgb = hslToRgb(h, s, l);
    return { stop, h, s, l, css: `hsl(${h}, ${s}%, ${l}%)`, rgb };
  });
}

function greyColor(temp: GreyTemp, l: number): string {
  if (temp === 'pure') return `hsl(0, 0%, ${l}%)`;
  const h = temp === 'cool' ? 216 : 34;
  const dist = Math.abs(l - 50) / 50;
  const s = Math.round((temp === 'cool' ? 14 : 11) + dist * 12);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export default function ColorPaletteDemo() {
  const id = useId();
  const [hue, setHue] = useState(PRESETS[0].hue);
  const [sat, setSat] = useState(PRESETS[0].sat);
  const [smart, setSmart] = useState(true);
  const [greyTemp, setGreyTemp] = useState<GreyTemp>('cool');

  const ladder = buildLadder(hue, sat, smart);
  const c100 = ladder[0];
  const c500 = ladder[4];
  const c700 = ladder[6];
  const c900 = ladder[8];

  const white: [number, number, number] = [255, 255, 255];
  const whiteOn500 = contrastRatio(white, c500.rgb);
  const darkOn100 = contrastRatio(c900.rgb, c100.rgb);

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

  return (
    <div style={{ margin: '1.2em 0', padding: 18, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-alt)' }}>
      {/* Presets */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{L('Base hue:', 'Sắc gốc:')}</span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setHue(p.hue); setSat(p.sat); }}
            style={btnStyle(hue === p.hue && sat === p.sat)}
          >
            {L(p.en, p.vi)}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 16 }}>
        <label htmlFor={`${id}-hue`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 8px', fontSize: 13 }}>
          <span>{L('Hue angle', 'Góc sắc (Hue)')}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{hue}°</span>
          <input id={`${id}-hue`} type="range" min={0} max={359} value={hue} onChange={(e) => setHue(Number(e.target.value))} style={{ gridColumn: '1 / -1' }} />
        </label>

        <label htmlFor={`${id}-sat`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 8px', fontSize: 13 }}>
          <span>{L('Base saturation', 'Độ bão hòa gốc')}</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{sat}%</span>
          <input id={`${id}-sat`} type="range" min={35} max={95} value={sat} onChange={(e) => setSat(Number(e.target.value))} style={{ gridColumn: '1 / -1' }} />
        </label>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{L('Ladder math', 'Cách tạo thang màu')}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => setSmart(true)} style={btnStyle(smart)}>
              {L('Hue shift + sat boost', 'Xoay sắc + tăng bão hòa')}
            </button>
            <button type="button" onClick={() => setSmart(false)} style={btnStyle(!smart)}>
              {L('Naive linear HSL', 'HSL tuyến tính')}
            </button>
          </div>
        </div>
      </div>

      {/* 9-step swatch ladder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, minmax(56px, 1fr))', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {ladder.map((c) => {
          const onLight = contrastRatio([20, 20, 20], c.rgb) > contrastRatio(white, c.rgb);
          return (
            <div
              key={c.stop}
              style={{
                background: c.css,
                color: onLight ? '#18181b' : '#ffffff',
                borderRadius: 6,
                padding: '10px 6px',
                textAlign: 'center',
                border: '1px solid rgba(0,0,0,0.08)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13 }}>{c.stop}</div>
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>{c.h}°</div>
              <div style={{ fontSize: 10.5, opacity: 0.8 }}>{c.s}%/{c.l}%</div>
            </div>
          );
        })}
      </div>

      {/* Live contrast comparison + grey temperature */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 16 }}>
        <div style={{ padding: 12, borderRadius: 8, background: greyColor(greyTemp, 97), border: `1px solid ${greyColor(greyTemp, 86)}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: greyColor(greyTemp, 40), marginBottom: 8 }}>
            {L('White text on 500 button', 'Chữ trắng trên nút 500')}
          </div>
          <div style={{ display: 'inline-block', padding: '7px 14px', borderRadius: 6, background: c500.css, color: '#ffffff', fontWeight: 600, fontSize: 14 }}>
            {L('Save changes', 'Lưu thay đổi')}
          </div>
          <div style={{ marginTop: 8, fontSize: 12.5, fontVariantNumeric: 'tabular-nums', color: whiteOn500 >= 4.5 ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
            {whiteOn500.toFixed(2)}:1 — {whiteOn500 >= 4.5 ? L('Passes WCAG AA (≥ 4.5:1)', 'Đạt WCAG AA (≥ 4.5:1)') : L('Fails WCAG AA for normal text', 'Rớt WCAG AA cho chữ thường')}
          </div>
        </div>

        <div style={{ padding: 12, borderRadius: 8, background: greyColor(greyTemp, 97), border: `1px solid ${greyColor(greyTemp, 86)}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: greyColor(greyTemp, 40), marginBottom: 8 }}>
            {L('Flipped contrast: 900 text on 100 tint', 'Đảo tương phản: chữ 900 trên nền 100')}
          </div>
          <div style={{ padding: '7px 12px', borderRadius: 6, background: c100.css, border: `1px solid ${c700.css}`, color: c900.css, fontWeight: 600, fontSize: 13.5 }}>
            {L('Invoice paid · Receipt sent', 'Đã thanh toán · Đã gửi biên lai')}
          </div>
          <div style={{ marginTop: 8, fontSize: 12.5, fontVariantNumeric: 'tabular-nums', color: darkOn100 >= 7 ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
            {darkOn100.toFixed(2)}:1 — {darkOn100 >= 7 ? L('Passes WCAG AAA (≥ 7:1)', 'Đạt WCAG AAA (≥ 7:1)') : L('Passes WCAG AA', 'Đạt WCAG AA')}
          </div>
        </div>
      </div>

      {/* Grey temperature switcher */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{L('Card grey temperature:', 'Nhiệt độ xám của thẻ:')}</span>
        {(['pure', 'cool', 'warm'] as GreyTemp[]).map((t) => (
          <button key={t} type="button" onClick={() => setGreyTemp(t)} style={btnStyle(greyTemp === t)}>
            {t === 'pure' && L('Pure grey', 'Xám thuần')}
            {t === 'cool' && L('Cool slate', 'Xám lạnh')}
            {t === 'warm' && L('Warm stone', 'Xám ấm')}
          </button>
        ))}
      </div>
    </div>
  );
}
