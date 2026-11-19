import React, { useId, useState } from 'react';

// Chapter 8 interactive Empty State & Border Detox Playground:
// Tab 1 steps through 3 levels of an empty "Projects" screen.
// Tab 2 switches a live notification/settings list across 4 separation styles
// so readers feel visual noise drop when redundant 1px borders disappear.

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

type TabKey = 'empty' | 'borders';
type EmptyLevel = 1 | 2 | 3;
type BorderMode = 'borders' | 'spacing' | 'tint' | 'elevated';

const NOTIFICATIONS = [
  {
    id: 'deploy',
    titleEn: 'Production deploy succeeded',
    titleVi: 'Triển khai production thành công',
    descEn: 'api-gateway v2.14.0 went live on 3 regions',
    descVi: 'api-gateway v2.14.0 đã chạy trên 3 vùng',
    timeEn: '4 min ago',
    timeVi: '4 phút trước',
    unread: true,
  },
  {
    id: 'ssl',
    titleEn: 'TLS certificate renewed',
    titleVi: 'Đã gia hạn chứng chỉ TLS',
    descEn: 'Auto-renewed for docs.example.dev until Nov 2027',
    descVi: 'Tự động gia hạn cho docs.example.dev tới tháng 11/2027',
    timeEn: '1 hr ago',
    timeVi: '1 giờ trước',
    unread: false,
  },
  {
    id: 'member',
    titleEn: 'New reviewer added to billing',
    titleVi: 'Thêm người duyệt mới cho mục thanh toán',
    descEn: 'Minh accepted the workspace invite with read-only access',
    descVi: 'Minh đã nhận lời mời với quyền chỉ đọc',
    timeEn: '3 hr ago',
    timeVi: '3 giờ trước',
    unread: false,
  },
  {
    id: 'backup',
    titleEn: 'Nightly database snapshot verified',
    titleVi: 'Đã kiểm tra bản sao lưu cơ sở dữ liệu',
    descEn: 'Restore check passed in 18 s on staging replica',
    descVi: 'Kiểm thử khôi phục xong trong 18 giây trên bản staging',
    timeEn: 'Yesterday',
    timeVi: 'Hôm qua',
    unread: false,
  },
];

export default function FinishEmptyStateDemo() {
  const uid = useId();
  const [tab, setTab] = useState<TabKey>('empty');
  const [level, setLevel] = useState<EmptyLevel>(1);
  const [borderMode, setBorderMode] = useState<BorderMode>('borders');

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px',
    fontSize: 13.5,
    fontWeight: active ? 600 : 500,
    border: 'none',
    borderBottom: active ? '3px solid var(--red)' : '3px solid transparent',
    background: 'transparent',
    color: active ? 'var(--red)' : 'var(--text-muted)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: -1,
  });

  const pillBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 11px',
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    borderRadius: 6,
    border: '1px solid',
    borderColor: active ? 'var(--red)' : 'var(--border)',
    background: active ? 'var(--red)' : 'var(--bg)',
    color: active ? '#ffffff' : 'var(--text)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  });

  const borderSummary = (() => {
    switch (borderMode) {
      case 'borders':
        return {
          linesEn: '12 visible box edges',
          linesVi: '12 cạnh viền hiện rõ',
          noteEn: 'Heavy lines cage every row and compete with timestamps.',
          noteVi: 'Đường viền dày đóng khung từng hàng và tranh mắt với nội dung.',
        };
      case 'spacing':
        return {
          linesEn: '0 row borders',
          linesVi: '0 đường viền giữa các hàng',
          noteEn: 'Generous vertical gap lets proximity group each item naturally.',
          noteVi: 'Khoảng cách dọc rộng giúp mắt tự gom từng mục theo định luật gần gũi.',
        };
      case 'tint':
        return {
          linesEn: '0 row borders',
          linesVi: '0 đường viền giữa các hàng',
          noteEn: 'Alternating subtle background tones separate rows without lines.',
          noteVi: 'Hai tông nền xen kẽ tách hàng rõ ràng mà không cần đường kẻ.',
        };
      case 'elevated':
        return {
          linesEn: '0 hard borders',
          linesVi: '0 đường viền cứng',
          noteEn: 'Soft shadows on a tinted canvas lift each item gently off the page.',
          noteVi: 'Bóng đổ nhẹ trên nền ngả màu giúp từng mục tách khối êm mắt.',
        };
    }
  })();

  return (
    <div
      style={{
        padding: 18,
        border: '1px solid var(--border)',
        borderRadius: 12,
        background: 'var(--bg-alt)',
        fontFamily: 'inherit',
      }}
    >
      {/* Top tab bar */}
      <div
        role="tablist"
        aria-label="Finishing touches playground tabs"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          borderBottom: '1px solid var(--border)',
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          role="tab"
          id={`${uid}-tab-empty`}
          aria-selected={tab === 'empty'}
          onClick={() => setTab('empty')}
          style={tabBtnStyle(tab === 'empty')}
        >
          {L('1. Empty state upgrade', '1. Nâng cấp màn hình trống')}
        </button>
        <button
          type="button"
          role="tab"
          id={`${uid}-tab-borders`}
          aria-selected={tab === 'borders'}
          onClick={() => setTab('borders')}
          style={tabBtnStyle(tab === 'borders')}
        >
          {L('2. Border detox', '2. Giảm bớt đường viền')}
        </button>
      </div>

      {/* TAB 1: Empty State Upgrade */}
      {tab === 'empty' && (
        <div role="tabpanel" aria-labelledby={`${uid}-tab-empty`}>
          {/* Stepper controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" onClick={() => setLevel(1)} style={pillBtnStyle(level === 1)}>
                {L('Level 1: Raw dead-end', 'Mức 1: Ngõ cụt thô')}
              </button>
              <button type="button" onClick={() => setLevel(2)} style={pillBtnStyle(level === 2)}>
                {L('Level 2: Context + CTA', 'Mức 2: Giải thích + nút chính')}
              </button>
              <button type="button" onClick={() => setLevel(3)} style={pillBtnStyle(level === 3)}>
                {L('Level 3: Visual + template', 'Mức 3: Minh họa + mẫu sẵn')}
              </button>
            </div>
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              {level === 1
                ? L('Dead chrome still visible', 'Thanh công cụ vô dụng vẫn hiện')
                : L('Dead table chrome hidden', 'Đã ẩn thanh công cụ thừa')}
            </span>
          </div>

          {/* Simulated Projects screen */}
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            {/* Header bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-alt)',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                {L('Projects', 'Dự án')}
              </span>
              <span
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {L('0 items', '0 mục')}
              </span>
            </div>

            {level === 1 ? (
              <div style={{ padding: 16 }}>
                {/* Useless dead chrome */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <span
                    style={{
                      padding: '5px 10px',
                      fontSize: 12.5,
                      color: 'var(--text-faint)',
                      border: '1px solid var(--border)',
                      borderRadius: 5,
                      flex: '1 1 160px',
                    }}
                  >
                    {L('Search projects...', 'Tìm kiếm dự án...')}
                  </span>
                  <span
                    style={{
                      padding: '5px 10px',
                      fontSize: 12.5,
                      color: 'var(--text-faint)',
                      border: '1px solid var(--border)',
                      borderRadius: 5,
                    }}
                  >
                    {L('Owner: All', 'Chủ sở hữu: Tất cả')}
                  </span>
                  <span
                    style={{
                      padding: '5px 10px',
                      fontSize: 12.5,
                      color: 'var(--text-faint)',
                      border: '1px solid var(--border)',
                      borderRadius: 5,
                    }}
                  >
                    {L('Export CSV', 'Xuất CSV')}
                  </span>
                </div>

                {/* Empty table grid */}
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr',
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-alt)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span>{L('Name', 'Tên')}</span>
                    <span>{L('Environment', 'Môi trường')}</span>
                    <span>{L('Last deploy', 'Lần deploy cuối')}</span>
                  </div>
                  <div
                    style={{
                      padding: '34px 16px',
                      textAlign: 'center',
                      fontSize: 13.5,
                      color: 'var(--text-faint)',
                    }}
                  >
                    {L('No projects found.', 'Không tìm thấy dự án nào.')}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  maxWidth: 440,
                  margin: '0 auto',
                }}
              >
                {level === 3 && (
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: 'var(--red-tint-bg)',
                      margin: '0 auto 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 28 28"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="4"
                        y="6"
                        width="20"
                        height="16"
                        rx="3"
                        stroke="var(--red)"
                        strokeWidth="1.8"
                      />
                      <path d="M4 11H24" stroke="var(--red)" strokeWidth="1.6" />
                      <path
                        d="M14 14.5V19.5M11.5 17H16.5"
                        stroke="var(--red)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: 6,
                  }}
                >
                  {L('No projects in this workspace yet', 'Không gian làm việc này chưa có dự án nào')}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: 18,
                  }}
                >
                  {L(
                    'Projects group your repositories, preview URLs, and environment variables in one place.',
                    'Mỗi dự án gom kho mã nguồn, liên kết xem trước và biến môi trường vào chung một nơi.'
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 10,
                    justifyContent: 'center',
                  }}
                >
                  <button
                    type="button"
                    style={{
                      padding: '8px 16px',
                      fontSize: 13.5,
                      fontWeight: 600,
                      borderRadius: 7,
                      border: 'none',
                      background: 'var(--red)',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {L('Create first project', 'Tạo dự án đầu tiên')}
                  </button>

                  {level === 3 && (
                    <button
                      type="button"
                      style={{
                        padding: '8px 14px',
                        fontSize: 13.5,
                        fontWeight: 500,
                        borderRadius: 7,
                        border: '1px solid var(--border)',
                        background: 'var(--bg-alt)',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {L('Start from template', 'Dùng mẫu có sẵn')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Border Detox */}
      {tab === 'borders' && (
        <div role="tabpanel" aria-labelledby={`${uid}-tab-borders`}>
          {/* Mode selector */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => setBorderMode('borders')}
                style={pillBtnStyle(borderMode === 'borders')}
              >
                {L('1px borders everywhere', 'Viền 1px khắp nơi')}
              </button>
              <button
                type="button"
                onClick={() => setBorderMode('spacing')}
                style={pillBtnStyle(borderMode === 'spacing')}
              >
                {L('Extra spacing only', 'Chỉ tăng khoảng trống')}
              </button>
              <button
                type="button"
                onClick={() => setBorderMode('tint')}
                style={pillBtnStyle(borderMode === 'tint')}
              >
                {L('Alternating surface tint', 'Xen kẽ tông nền')}
              </button>
              <button
                type="button"
                onClick={() => setBorderMode('elevated')}
                style={pillBtnStyle(borderMode === 'elevated')}
              >
                {L('Elevated cards', 'Thẻ đổ bóng nhẹ')}
              </button>
            </div>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: borderMode === 'borders' ? 'var(--red)' : 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {L(borderSummary.linesEn, borderSummary.linesVi)}
            </span>
          </div>

          {/* Live notification list */}
          <div
            style={{
              background: borderMode === 'elevated' ? 'var(--bg-alt)' : 'var(--bg)',
              border: borderMode === 'borders' ? '1.5px solid var(--text-muted)' : '1px solid var(--border)',
              borderRadius: 10,
              padding: borderMode === 'borders' ? 12 : 16,
              transition: 'all 180ms ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap:
                  borderMode === 'borders'
                    ? 8
                    : borderMode === 'spacing'
                      ? 18
                      : borderMode === 'tint'
                        ? 4
                        : 10,
              }}
            >
              {NOTIFICATIONS.map((item, idx) => {
                const rowStyle: React.CSSProperties =
                  borderMode === 'borders'
                    ? {
                        padding: '10px 12px',
                        border: '1.25px solid var(--text-muted)',
                        borderRadius: 4,
                        background: 'var(--bg)',
                      }
                    : borderMode === 'spacing'
                      ? {
                          padding: '2px 4px',
                          background: 'transparent',
                        }
                      : borderMode === 'tint'
                        ? {
                            padding: '10px 12px',
                            borderRadius: 7,
                            background: idx % 2 === 0 ? 'var(--bg-alt)' : 'transparent',
                          }
                        : {
                            padding: '11px 14px',
                            borderRadius: 8,
                            background: 'var(--bg)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                          };

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                      transition: 'all 180ms ease',
                      ...rowStyle,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: 'var(--text)',
                        }}
                      >
                        {item.unread && (
                          <span
                            aria-hidden="true"
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: 'var(--red)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span>{L(item.titleEn, item.titleVi)}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: 'var(--text-muted)',
                          marginTop: 2,
                        }}
                      >
                        {L(item.descEn, item.descVi)}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--text-faint)',
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {L(item.timeEn, item.timeVi)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p
            style={{
              margin: '10px 2px 0',
              fontSize: 13,
              color: borderMode === 'borders' ? 'var(--red)' : 'var(--text-muted)',
            }}
          >
            {L(borderSummary.noteEn, borderSummary.noteVi)}
          </p>
        </div>
      )}
    </div>
  );
}
