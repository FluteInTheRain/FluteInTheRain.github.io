import React, { useId, useState } from 'react';

// Chapter 8 interactive finishing-touches board:
// Toggle each low-cost polish upgrade independently on the same workspace screen
// to feel how small surface decisions separate a raw wireframe from a finished UI.

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

type Touches = {
  defaults: boolean;
  accentBorder: boolean;
  quietSurface: boolean;
  dropBorders: boolean;
  emptyState: boolean;
};

const RAW: Touches = {
  defaults: false,
  accentBorder: false,
  quietSurface: false,
  dropBorders: false,
  emptyState: false,
};

const POLISHED: Touches = {
  defaults: true,
  accentBorder: true,
  quietSurface: true,
  dropBorders: true,
  emptyState: true,
};

export default function FinishPolishDemo() {
  const id = useId();
  const [t, setT] = useState<Touches>(RAW);
  const [alertsOn, setAlertsOn] = useState(true);

  const toggle = (key: keyof Touches) =>
    setT((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeCount = Object.values(t).filter(Boolean).length;

  const controls: { key: keyof Touches; en: string; vi: string }[] = [
    { key: 'defaults', en: '1. Upgrade defaults', vi: '1. Nâng cấp mặc định' },
    { key: 'accentBorder', en: '2. Accent borders', vi: '2. Viền nhấn (accent)' },
    { key: 'quietSurface', en: '3. Quiet background tone', vi: '3. Nền tách lớp nhẹ' },
    { key: 'dropBorders', en: '4. Drop redundant borders', vi: '4. Bỏ đường kẻ thừa' },
    { key: 'emptyState', en: '5. First-class empty state', vi: '5. Màn hình trống có chủ đích' },
  ];

  const isRaw = activeCount === 0;
  const isPolished = activeCount === controls.length;

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
      {/* Presets & counter */}
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setT(RAW)}
            style={{
              padding: '5px 12px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid',
              borderColor: isRaw ? 'var(--red)' : 'var(--border)',
              background: isRaw ? 'var(--red)' : 'var(--bg)',
              color: isRaw ? '#ffffff' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            {L('Raw wireframe (0/5)', 'Bản nháp thô (0/5)')}
          </button>
          <button
            type="button"
            onClick={() => setT(POLISHED)}
            style={{
              padding: '5px 12px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid',
              borderColor: isPolished ? 'var(--red)' : 'var(--border)',
              background: isPolished ? 'var(--red)' : 'var(--bg)',
              color: isPolished ? '#ffffff' : 'var(--text)',
              cursor: 'pointer',
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            {L('Finished UI (5/5)', 'Giao diện hoàn thiện (5/5)')}
          </button>
        </div>
        <span
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {L(`${activeCount} of 5 touches active`, `Đang bật ${activeCount}/5 chi tiết`)}
        </span>
      </div>

      {/* Individual toggles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {controls.map((c) => {
          const checked = t[c.key];
          return (
            <label
              key={c.key}
              htmlFor={`${id}-${c.key}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                borderRadius: 7,
                border: '1px solid',
                borderColor: checked ? 'var(--red)' : 'var(--border)',
                background: checked ? 'var(--red-tint-bg)' : 'var(--bg)',
                fontSize: 13,
                color: 'var(--text)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                id={`${id}-${c.key}`}
                type="checkbox"
                checked={checked}
                onChange={() => toggle(c.key)}
                style={{ accentColor: 'var(--red)', cursor: 'pointer', margin: 0 }}
              />
              <span>{L(c.en, c.vi)}</span>
            </label>
          );
        })}
      </div>

      {/* Live Preview Canvas */}
      <div
        style={{
          background: t.quietSurface ? 'var(--bg-alt)' : 'var(--bg)',
          border: t.dropBorders ? '1px solid var(--border)' : '1.5px solid var(--text-muted)',
          borderTop: t.accentBorder ? '3px solid var(--red)' : t.dropBorders ? '1px solid var(--border)' : '1.5px solid var(--text-muted)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: t.dropBorders ? '0 4px 14px rgba(0, 0, 0, 0.06)' : 'none',
          transition: 'all 180ms ease',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(130px, 165px) 1fr',
            minHeight: 245,
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              background: t.quietSurface ? 'var(--bg)' : 'var(--bg)',
              borderRight: t.dropBorders ? 'none' : '1px solid var(--text-muted)',
              padding: '14px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div
              style={{
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 600,
                color: t.accentBorder ? 'var(--red)' : 'var(--text)',
                background: t.accentBorder ? 'var(--red-tint-bg)' : 'transparent',
                borderLeft: t.accentBorder ? '3px solid var(--red)' : '3px solid transparent',
              }}
            >
              {L('Deployments', 'Triển khai')}
            </div>
            <div style={{ padding: '7px 17px', fontSize: 13, color: 'var(--text-muted)' }}>
              {L('Webhooks', 'Webhooks')}
            </div>
            <div style={{ padding: '7px 17px', fontSize: 13, color: 'var(--text-muted)' }}>
              {L('Environment', 'Biến môi trường')}
            </div>
          </div>

          {/* Main panel */}
          <div
            style={{
              padding: 18,
              background: t.quietSurface
                ? 'radial-gradient(circle at 96% 10%, var(--red-tint-bg) 0%, transparent 42%), var(--bg-alt)'
                : 'var(--bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {/* Empty state area */}
            {t.emptyState ? (
              <div
                style={{
                  background: 'var(--bg)',
                  borderRadius: 8,
                  padding: '18px 16px',
                  textAlign: 'center',
                  border: t.dropBorders ? 'none' : '1px solid var(--text-muted)',
                  boxShadow: t.dropBorders ? '0 1px 4px rgba(0, 0, 0, 0.05)' : 'none',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                  {L('No deployments yet', 'Chưa có bản triển khai nào')}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  {L(
                    'Connect a Git branch to trigger your first automatic build.',
                    'Kết nối một nhánh Git để kích hoạt bản build tự động đầu tiên.'
                  )}
                </div>
                <button
                  type="button"
                  style={{
                    padding: '7px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: 'none',
                    background: 'var(--red)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {L('Connect repository', 'Kết nối kho mã nguồn')}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      fontSize: 12,
                      color: 'var(--text-faint)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      background: 'var(--bg)',
                    }}
                  >
                    {L('Search deploys...', 'Tìm bản deploy...')}
                  </span>
                  <span
                    style={{
                      padding: '4px 8px',
                      fontSize: 12,
                      color: 'var(--text-faint)',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      background: 'var(--bg)',
                    }}
                  >
                    {L('Branch: All', 'Nhánh: Tất cả')}
                  </span>
                </div>
                <div
                  style={{
                    padding: '18px 12px',
                    textAlign: 'center',
                    fontSize: 13,
                    color: 'var(--text-faint)',
                    border: '1px solid var(--text-muted)',
                    background: 'var(--bg)',
                  }}
                >
                  {L('No deployments found.', 'Không tìm thấy bản triển khai nào.')}
                </div>
              </div>
            )}

            {/* Checklist + checkbox + link */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: t.dropBorders ? 8 : 0,
              }}
            >
              {[
                { en: 'Zero-downtime rollbacks enabled', vi: 'Bật rollback không gián đoạn' },
                { en: 'Preview URLs for every pull request', vi: 'Tạo URL xem trước cho mỗi pull request' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: t.dropBorders ? '6px 10px' : '7px 8px',
                    background: t.dropBorders ? 'var(--bg)' : 'transparent',
                    borderRadius: t.dropBorders ? 6 : 0,
                    border: t.dropBorders ? 'none' : '1px solid var(--text-muted)',
                    marginTop: !t.dropBorders && idx > 0 ? -1 : 0,
                    fontSize: 13,
                    color: 'var(--text-body)',
                  }}
                >
                  {t.defaults ? (
                    <span
                      aria-hidden="true"
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: 'var(--red-tint-bg)',
                        color: 'var(--red)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                  ) : (
                    <span aria-hidden="true" style={{ color: 'var(--text-muted)', paddingLeft: 2 }}>
                      •
                    </span>
                  )}
                  <span>{L(item.en, item.vi)}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                paddingTop: 2,
                fontSize: 13,
              }}
            >
              <label
                htmlFor={`${id}-alerts`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer', color: 'var(--text-body)' }}
              >
                <input
                  id={`${id}-alerts`}
                  type="checkbox"
                  checked={alertsOn}
                  onChange={(e) => setAlertsOn(e.target.checked)}
                  style={{
                    accentColor: t.defaults ? 'var(--red)' : undefined,
                    cursor: 'pointer',
                    margin: 0,
                  }}
                />
                <span>{L('Notify team on failed build', 'Báo nhóm khi build lỗi')}</span>
              </label>

              <span
                style={{
                  color: t.defaults ? 'var(--text)' : 'var(--text-muted)',
                  fontWeight: t.defaults ? 600 : 400,
                  textDecoration: t.defaults ? 'none' : 'underline',
                  boxShadow: t.defaults ? 'inset 0 -6px 0 var(--red-tint-bg)' : 'none',
                  padding: t.defaults ? '0 2px' : 0,
                }}
              >
                {L('View deploy docs', 'Xem tài liệu deploy')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
