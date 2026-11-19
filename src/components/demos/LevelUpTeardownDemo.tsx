import React, { useState } from 'react';

// Part 9 interactive lab 2: Design Eye X-Ray Inspector.
// Displays a realistic SaaS upgrade card with 5 numbered X-Ray hotspots and a
// master toggle between "Raw beginner version" and "Trained-eye version".

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

interface HotspotInfo {
  id: number;
  shortEn: string;
  shortVi: string;
  titleEn: string;
  titleVi: string;
  trainedEn: string;
  trainedVi: string;
  rawEn: string;
  rawVi: string;
  whyEn: string;
  whyVi: string;
}

const HOTSPOTS: HotspotInfo[] = [
  {
    id: 1,
    shortEn: 'Tinted slate grey',
    shortVi: 'Xám pha sắc lạnh',
    titleEn: '1. Tinted slate grey instead of muddy pure grey',
    titleVi: '1. Xám pha sắc lạnh thay vì xám thuần bị đục',
    trainedEn: 'Cool slate-tinted secondary copy with clean contrast against the card surface.',
    trainedVi: 'Chữ phụ dùng tông xám pha lạnh, tách nền rõ và dịu mắt.',
    rawEn: 'Flat neutral #808080 grey that looks washed out and lifeless on light or dark backgrounds.',
    rawVi: 'Xám trung tính #808080 phẳng lì, nhìn bạc màu và thiếu sức sống.',
    whyEn: 'Real surfaces rarely reflect pure neutral grey. Adding a hint of cool slate ties body copy and checklist items into the UI palette without stealing focus from the headline.',
    whyVi: 'Bề mặt ngoài đời hiếm khi có màu xám thuần tuyệt đối. Pha nhẹ sắc lạnh giúp chữ mô tả và danh sách tính năng hòa vào bảng màu mà không tranh sự chú ý của tiêu đề.',
  },
  {
    id: 2,
    shortEn: 'De-emphasized $ & /mo',
    shortVi: 'Hạ sắc độ $ và /tháng',
    titleEn: '2. De-emphasized $ currency and /mo period beside bold tabular price',
    titleVi: '2. Hạ sắc độ ký hiệu $ và /tháng cạnh con số giá nổi bật',
    trainedEn: 'Large bold tabular "49" anchored by a smaller muted "$" prefix and "/ month" suffix.',
    trainedVi: 'Số "49" lớn, đậm, căn đều cột số; ký hiệu "$" và "/ tháng" thu nhỏ và hạ sắc độ.',
    rawEn: 'Uniform "$49/month" rendered in one size and weight, making the eye parse punctuation before the number.',
    rawVi: 'Cả cụm "$49/tháng" chung một cỡ chữ và độ đậm, khiến mắt phải đọc ký tự phụ trước con số.',
    whyEn: 'Users scan pricing cards for one number. Softening the unit and billing cadence lets the price land in a single glance without shrinking readability.',
    whyVi: 'Người xem thẻ giá chỉ tìm đúng một con số. Làm dịu đơn vị tiền tệ và chu kỳ thanh toán giúp mức giá đập vào mắt ngay lập tức mà vẫn rõ nghĩa.',
  },
  {
    id: 3,
    shortEn: 'Two-part shadow + top border',
    shortVi: 'Bóng hai lớp + viền trên',
    titleEn: '3. Two-part soft shadow and subtle top accent instead of heavy outline',
    titleVi: '3. Bóng hai lớp mềm và viền nhấn trên cùng thay cho khung viền thô',
    trainedEn: 'Tight contact shadow + soft ambient shadow + crisp 3px top accent edge on a hairline border.',
    trainedVi: 'Bóng tiếp xúc sát cạnh + bóng tán xạ mềm + đường nhấn 3px phía trên cùng viền mảnh.',
    rawEn: 'Thick 2px flat grey border paired with a dark, heavy single drop shadow.',
    rawVi: 'Viền xám dày 2px đi kèm một lớp bóng đơn tối và nặng nề.',
    whyEn: 'A tight shadow grounds the card while a wide low-opacity shadow lifts it gently off the page. Adding a thin top accent signals "featured tier" without painting the whole card bright red.',
    whyVi: 'Lớp bóng sát giữ thẻ bám nền, còn lớp bóng rộng độ mờ thấp nâng thẻ nổi lên tự nhiên. Đường viền mảnh phía trên báo hiệu gói nổi bật mà không cần tô rực cả khung.',
  },
  {
    id: 4,
    shortEn: 'Micro-tracked eyebrow',
    shortVi: 'Nhãn trên giãn chữ nhẹ',
    titleEn: '4. Micro-tracking and muted uppercase eyebrow label',
    titleVi: '4. Nhãn trên in hoa giãn chữ nhẹ và hạ độ chói',
    trainedEn: 'Small 11px uppercase label with +0.08em letter-spacing and generous breathing room above the title.',
    trainedVi: 'Nhãn nhỏ 11px in hoa, giãn chữ +0.08em, tách thoáng phía trên tiêu đề chính.',
    rawEn: 'Regular 14px mixed-case label cramped right against the heading, competing with the plan name.',
    rawVi: 'Nhãn 14px thường, dính sát tiêu đề khiến hai dòng tranh vai trò với nhau.',
    whyEn: 'Small uppercase text becomes hard to scan when letters crowd together. Widening letter-spacing slightly and reducing size turns the eyebrow into a crisp structural cue instead of a second headline.',
    whyVi: 'Chữ in hoa cỡ nhỏ sẽ khó đọc nếu các ký tự dính nhau. Giãn nhẹ khoảng cách chữ và thu nhỏ cỡ giúp dòng nhãn thành dấu hiệu dẫn mắt gọn gàng thay vì cạnh tranh với tiêu đề.',
  },
  {
    id: 5,
    shortEn: 'Generous grouped padding',
    shortVi: 'Khoảng đệm phân nhóm',
    titleEn: '5. Generous inner padding with more space between groups than within',
    titleVi: '5. Khoảng đệm trong rộng rãi — giữa các nhóm thoáng hơn trong nhóm',
    trainedEn: '28px outer card padding, tight 6px gap inside header copy, and 20–24px separation between price, perks, and CTA.',
    trainedVi: 'Đệm ngoài 28px, khoảng cách sát 6px trong cụm tiêu đề, và tách 20–24px giữa giá, danh sách và nút hành động.',
    rawEn: 'Uniform 12px padding and equal 12px gaps everywhere so related and unrelated items blur together.',
    rawVi: 'Đệm 12px đều tăm tắp khắp nơi khiến các phần liên quan và không liên quan dính lẫn vào nhau.',
    whyEn: 'Proximity is silent grouping. Giving the card generous outer margins and wider gaps between distinct sections lets readers parse the layout before reading a single word.',
    whyVi: 'Khoảng cách là cách phân nhóm không cần lời. Đệm ngoài rộng và khoảng trống giữa các khối lớn hơn bên trong khối giúp người đọc nắm cấu trúc thẻ trước cả khi đọc chữ.',
  },
];

const SHADOW_TRAINED =
  '0 1px 2px rgba(15, 23, 42, 0.06), 0 12px 28px rgba(15, 23, 42, 0.08)';
const SHADOW_RAW = '0 10px 20px rgba(0, 0, 0, 0.22)';

export default function LevelUpTeardownDemo() {
  const [mode, setMode] = useState<'trained' | 'raw'>('trained');
  const [active, setActive] = useState<number>(1);

  const isTrained = mode === 'trained';
  const current = HOTSPOTS.find((h) => h.id === active) ?? HOTSPOTS[0];

  const ringStyle = (spotId: number): React.CSSProperties => {
    const selected = active === spotId;
    return {
      position: 'relative',
      borderRadius: 8,
      outline: selected ? '2px solid var(--red)' : '1px dashed transparent',
      outlineOffset: 4,
      background: selected ? 'var(--red-tint-bg)' : 'transparent',
      transition: 'outline-color 140ms ease, background 140ms ease',
      cursor: 'pointer',
    };
  };

  const badgeStyle = (spotId: number): React.CSSProperties => {
    const selected = active === spotId;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 22,
      height: 22,
      borderRadius: '50%',
      fontSize: 12,
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      border: '1.5px solid var(--red)',
      background: selected ? 'var(--red)' : 'var(--bg)',
      color: selected ? '#ffffff' : 'var(--red)',
      cursor: 'pointer',
      flexShrink: 0,
      padding: 0,
      lineHeight: 1,
    };
  };

  const toggleBtnStyle = (selected: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 6,
    border: '1px solid',
    borderColor: selected ? 'var(--red)' : 'var(--border)',
    background: selected ? 'var(--red)' : 'var(--bg)',
    color: selected ? '#ffffff' : 'var(--text)',
    cursor: 'pointer',
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
      {/* Top toolbar: master mode switch + hotspot selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 14,
          marginBottom: 18,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            onClick={() => setMode('raw')}
            style={toggleBtnStyle(!isTrained)}
          >
            {L('Raw beginner version', 'Bản mặc định sơ khai')}
          </button>
          <button
            type="button"
            onClick={() => setMode('trained')}
            style={toggleBtnStyle(isTrained)}
          >
            {L('Trained-eye version', 'Bản mắt đã rèn')}
          </button>
        </div>

        <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          {L('Click any numbered callout (1–5) to X-ray', 'Bấm số 1–5 trên thẻ để soi từng quyết định')}
        </div>
      </div>

      {/* Main 2-column layout: Interactive card + X-Ray inspector panel */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 22,
          alignItems: 'start',
        }}
      >
        {/* Left: Realistic SaaS Pricing Card with clickable X-Ray regions */}
        <div style={{ position: 'relative', paddingTop: 10 }}>
          {/* Hotspot #3 (Shadow + top accent) & #5 (Outer padding) badges on card frame */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <button
              type="button"
              onClick={() => setActive(3)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: 12,
                color: active === 3 ? 'var(--red)' : 'var(--text-muted)',
                fontWeight: active === 3 ? 600 : 500,
              }}
            >
              <span style={badgeStyle(3)}>3</span>
              {L('Shadow & top border', 'Bóng & viền trên')}
            </button>

            <button
              type="button"
              onClick={() => setActive(5)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontSize: 12,
                color: active === 5 ? 'var(--red)' : 'var(--text-muted)',
                fontWeight: active === 5 ? 600 : 500,
              }}
            >
              <span style={badgeStyle(5)}>5</span>
              {L('Padding rhythm', 'Nhịp khoảng đệm')}
            </button>
          </div>

          <div
            style={{
              background: 'var(--bg)',
              borderRadius: isTrained ? 12 : 4,
              border: isTrained ? '1px solid var(--border)' : '2px solid #8c8c8c',
              borderTop: isTrained ? '3px solid var(--red)' : '2px solid #8c8c8c',
              boxShadow: isTrained ? SHADOW_TRAINED : SHADOW_RAW,
              padding: isTrained ? 26 : 12,
              outline:
                active === 3 || active === 5
                  ? '2px solid var(--red)'
                  : '2px solid transparent',
              outlineOffset: active === 5 ? -10 : 4,
              transition: 'all 160ms ease',
            }}
          >
            {/* Region 4: Eyebrow + Plan Title */}
            <div
              onClick={() => setActive(4)}
              style={{
                ...ringStyle(4),
                marginBottom: isTrained ? 18 : 10,
                padding: 2,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginBottom: isTrained ? 6 : 2,
                }}
              >
                <span
                  style={{
                    fontSize: isTrained ? 11 : 14,
                    fontWeight: isTrained ? 700 : 500,
                    textTransform: isTrained ? 'uppercase' : 'none',
                    letterSpacing: isTrained ? '0.08em' : '0em',
                    color: isTrained ? 'var(--red)' : '#7a7a7a',
                  }}
                >
                  {L('Recommended · Engineering teams', 'Khuyên dùng · Đội kỹ thuật')}
                </span>
                <button
                  type="button"
                  aria-label="Inspect eyebrow label"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(4);
                  }}
                  style={badgeStyle(4)}
                >
                  4
                </button>
              </div>
              <div
                style={{
                  fontSize: isTrained ? 21 : 19,
                  fontWeight: 700,
                  lineHeight: isTrained ? 1.2 : 1.45,
                  color: 'var(--text)',
                }}
              >
                {L('Pro Workspace', 'Không gian làm việc Pro')}
              </div>
            </div>

            {/* Region 2: Price block */}
            <div
              onClick={() => setActive(2)}
              style={{
                ...ringStyle(2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                marginBottom: isTrained ? 20 : 10,
                padding: '4px 2px',
              }}
            >
              {isTrained ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 3,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      alignSelf: 'flex-start',
                      marginTop: 5,
                    }}
                  >
                    $
                  </span>
                  <span
                    style={{
                      fontSize: 38,
                      fontWeight: 800,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: 'var(--text)',
                    }}
                  >
                    49
                  </span>
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 400,
                      color: 'var(--text-muted)',
                      marginLeft: 2,
                    }}
                  >
                    {L('/ seat / mo', '/ người / tháng')}
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--text)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {L('$49 / seat / mo', '$49 / người / tháng')}
                </div>
              )}
              <button
                type="button"
                aria-label="Inspect price hierarchy"
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(2);
                }}
                style={badgeStyle(2)}
              >
                2
              </button>
            </div>

            {/* Region 1: Tinted slate grey body copy & feature list */}
            <div
              onClick={() => setActive(1)}
              style={{
                ...ringStyle(1),
                marginBottom: isTrained ? 22 : 12,
                padding: '4px 2px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginBottom: isTrained ? 12 : 8,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 13.5,
                    lineHeight: isTrained ? 1.55 : 1.35,
                    color: isTrained ? 'var(--text-muted)' : '#8a8a8a',
                  }}
                >
                  {L(
                    'Shared preview branches, visual regression diffs, and role-based audit logs.',
                    'Nhánh xem trước dùng chung, so sánh lệch giao diện và nhật ký phân quyền.'
                  )}
                </p>
                <button
                  type="button"
                  aria-label="Inspect tinted grey tone"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(1);
                  }}
                  style={badgeStyle(1)}
                >
                  1
                </button>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  display: 'grid',
                  gap: isTrained ? 7 : 4,
                  fontSize: 13,
                  color: isTrained ? 'var(--text-body)' : '#8a8a8a',
                }}
              >
                <li>{L('Unlimited preview deployments', 'Không giới hạn bản dựng xem trước')}</li>
                <li>{L('90-day visual diff history', 'Lưu lịch sử so sánh giao diện 90 ngày')}</li>
                <li>{L('SSO and team permission presets', 'Đăng nhập SSO và bộ quyền đội nhóm')}</li>
              </ul>
            </div>

            {/* CTA Footer */}
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: isTrained ? 16 : 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  color: isTrained ? 'var(--text-muted)' : '#8a8a8a',
                }}
              >
                {L('Cancel anytime', 'Hủy bất cứ lúc nào')}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  padding: isTrained ? '9px 16px' : '6px 10px',
                  borderRadius: isTrained ? 7 : 3,
                  background: 'var(--red)',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 600,
                }}
              >
                {L('Upgrade workspace', 'Nâng cấp gói')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: X-Ray Explanation Panel */}
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* 5 quick-jump pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {HOTSPOTS.map((h) => {
              const selected = h.id === active;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setActive(h.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 9px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: selected ? 600 : 500,
                    border: '1px solid',
                    borderColor: selected ? 'var(--red)' : 'var(--border)',
                    background: selected ? 'var(--red-tint-bg)' : 'var(--bg-alt)',
                    color: selected ? 'var(--red)' : 'var(--text-body)',
                    cursor: 'pointer',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <span>{h.id}.</span>
                  {L(h.shortEn, h.shortVi)}
                </button>
              );
            })}
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.35,
            }}
          >
            {L(current.titleEn, current.titleVi)}
          </div>

          <div
            style={{
              display: 'grid',
              gap: 8,
              fontSize: 13.5,
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                padding: '9px 11px',
                borderRadius: 7,
                border: '1px solid var(--border)',
                background: isTrained ? 'var(--red-tint-bg)' : 'var(--bg-alt)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', marginBottom: 3 }}>
                {L('Trained-eye choice', 'Lựa chọn của mắt đã rèn')}
              </div>
              <div style={{ color: 'var(--text-body)' }}>
                {L(current.trainedEn, current.trainedVi)}
              </div>
            </div>

            <div
              style={{
                padding: '9px 11px',
                borderRadius: 7,
                border: '1px solid var(--border)',
                background: !isTrained ? 'var(--red-tint-bg)' : 'var(--bg-alt)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 3 }}>
                {L('Raw beginner reflex', 'Phản xạ mặc định sơ khai')}
              </div>
              <div style={{ color: 'var(--text-body)' }}>
                {L(current.rawEn, current.rawVi)}
              </div>
            </div>

            <div style={{ paddingTop: 2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                {L('Why a trained eye makes this choice', 'Vì sao mắt đã rèn lại chọn cách này')}
              </div>
              <p style={{ margin: 0, color: 'var(--text-body)' }}>
                {L(current.whyEn, current.whyVi)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
