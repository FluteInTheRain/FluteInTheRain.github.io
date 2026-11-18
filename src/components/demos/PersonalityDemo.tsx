import React, { useState } from 'react';

// The four personality levers from chapter 1 on one small sign-up card:
// typeface, colour, border radius and wording. Change one and watch how the same card feels.
// The "what it says" notes paraphrase the book's mapping; the card itself is illustrative.

type Opt<T extends string> = { id: T; en: string; vi: string };

const FONTS: Opt<'serif' | 'sans'>[] = [
  { id: 'serif', en: 'Serif', vi: 'Có chân' },
  { id: 'sans', en: 'Sans', vi: 'Không chân' },
];
const COLOURS: Opt<'blue' | 'gold' | 'pink'>[] = [
  { id: 'blue', en: 'Blue', vi: 'Xanh dương' },
  { id: 'gold', en: 'Gold', vi: 'Vàng gold' },
  { id: 'pink', en: 'Pink', vi: 'Hồng' },
];
const RADII: Opt<'none' | 'small' | 'large'>[] = [
  { id: 'none', en: 'None', vi: 'Không bo' },
  { id: 'small', en: 'Small', vi: 'Bo nhỏ' },
  { id: 'large', en: 'Large', vi: 'Bo lớn' },
];
const TONES: Opt<'official' | 'friendly'>[] = [
  { id: 'official', en: 'Official', vi: 'Chính thức' },
  { id: 'friendly', en: 'Friendly', vi: 'Thân thiện' },
];

const FONT_STACK = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: '"Noto Sans", system-ui, Arial, sans-serif',
};
const COLOUR = {
  blue: { bg: '#2563eb', fg: '#ffffff' },
  gold: { bg: '#b8892b', fg: '#ffffff' },
  pink: { bg: '#d6336c', fg: '#ffffff' },
};
const RADIUS = { none: 0, small: 6, large: 20 };

const NOTES = {
  serif: { en: 'Serif: elegant, classic', vi: 'Chữ có chân: thanh lịch, cổ điển' },
  sans: { en: 'Sans: plain, lets other things carry the feeling', vi: 'Chữ không chân: giản dị, để thứ khác mang cảm giác' },
  blue: { en: 'Blue: safe and familiar', vi: 'Xanh dương: an toàn, quen thuộc' },
  gold: { en: 'Gold: expensive, refined', vi: 'Vàng gold: đắt tiền, tinh tế' },
  pink: { en: 'Pink: lighter, less serious', vi: 'Hồng: nhẹ nhàng, bớt nghiêm túc' },
  none: { en: 'No rounding: formal', vi: 'Không bo góc: trang trọng' },
  small: { en: 'Small radius: neutral', vi: 'Bo nhỏ: trung tính' },
  large: { en: 'Large radius: playful', vi: 'Bo lớn: vui tươi' },
  official: { en: 'Impersonal wording: sounds official', vi: 'Ngôn từ khách quan: nghe chính thức' },
  friendly: { en: 'Casual wording: feels friendlier', vi: 'Ngôn từ thoải mái: gần gũi hơn' },
};

const COPY = {
  official: {
    title: { en: 'Account registration', vi: 'Đăng ký tài khoản' },
    body: { en: 'Enter your email address to create an account.', vi: 'Nhập địa chỉ email để tạo tài khoản.' },
    button: { en: 'Submit', vi: 'Gửi' },
  },
  friendly: {
    title: { en: 'Come on in!', vi: 'Vào chơi nào!' },
    body: { en: 'Pop in your email and you are good to go.', vi: 'Điền email là xong, dễ lắm.' },
    button: { en: "Let's go", vi: 'Đi thôi' },
  },
};

const L = (t: { en: string; vi: string }) => (
  <>
    <span data-lang-en>{t.en}</span>
    <span data-lang-vi>{t.vi}</span>
  </>
);

function Group<T extends string>({ label, opts, value, onPick }: { label: { en: string; vi: string }; opts: Opt<T>[]; value: T; onPick: (v: T) => void }) {
  return (
    <div className="sd-group">
      <span>{L(label)}</span>
      {opts.map((o) => (
        <button key={o.id} type="button" className={o.id === value ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={o.id === value} onClick={() => onPick(o.id)}>
          {L(o)}
        </button>
      ))}
    </div>
  );
}

export default function PersonalityDemo() {
  const [font, setFont] = useState<'serif' | 'sans'>('sans');
  const [colour, setColour] = useState<'blue' | 'gold' | 'pink'>('blue');
  const [radius, setRadius] = useState<'none' | 'small' | 'large'>('small');
  const [tone, setTone] = useState<'official' | 'friendly'>('official');

  const r = RADIUS[radius];
  const c = COLOUR[colour];
  const copy = COPY[tone];

  return (
    <div className="sd">
      <div className="sd-controls">
        <Group label={{ en: 'Typeface', vi: 'Kiểu chữ' }} opts={FONTS} value={font} onPick={setFont} />
        <Group label={{ en: 'Colour', vi: 'Màu' }} opts={COLOURS} value={colour} onPick={setColour} />
        <Group label={{ en: 'Corners', vi: 'Góc' }} opts={RADII} value={radius} onPick={setRadius} />
        <Group label={{ en: 'Wording', vi: 'Ngôn từ' }} opts={TONES} value={tone} onPick={setTone} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, alignItems: 'start' }}>
        <div
          style={{
            background: '#ffffff',
            color: '#1f2937',
            border: '1px solid #d9d6cf',
            borderRadius: r,
            padding: 22,
            fontFamily: FONT_STACK[font],
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          <p style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{L(copy.title)}</p>
          <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.5, color: '#4b5563' }}>{L(copy.body)}</p>
          <div
            style={{
              border: '1px solid #c9c5bc',
              borderRadius: r,
              padding: '10px 12px',
              fontSize: 15,
              color: '#6b7280',
              marginBottom: 12,
              background: '#ffffff',
            }}
          >
            name@example.com
          </div>
          <div
            style={{
              background: c.bg,
              color: c.fg,
              borderRadius: r,
              padding: '10px 14px',
              fontSize: 15,
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            {L(copy.button)}
          </div>
        </div>

        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: 'var(--text-body)' }}>
          {[font, colour, radius, tone].map((k) => (
            <li key={k}>{L(NOTES[k])}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
