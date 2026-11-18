import React, { useState } from 'react';

// Chapter 2, "semantics are secondary": the same four actions styled by meaning
// (every button solid, the destructive one big and red) and by importance
// (one solid primary, an outline secondary, link-style tertiary, delete as a quiet link).
// In the importance mode, Delete opens a confirmation where the red button IS the primary action.

type Mode = 'meaning' | 'importance';

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

const BLUE = '#2754b8';
const RED = '#c62828';

const base: React.CSSProperties = {
  font: 'inherit',
  fontSize: 15,
  fontWeight: 600,
  padding: '9px 16px',
  borderRadius: 6,
  cursor: 'pointer',
  border: '1px solid transparent',
};
const solid = (bg: string): React.CSSProperties => ({ ...base, background: bg, color: '#fff' });
const outline: React.CSSProperties = { ...base, background: '#fff', color: BLUE, borderColor: '#b7c4e4' };
const link = (color: string): React.CSSProperties => ({ ...base, background: 'none', color, padding: '9px 4px', fontWeight: 500, textDecoration: 'underline' });

export default function ActionPyramidDemo() {
  const [mode, setMode] = useState<Mode>('meaning');
  const [confirming, setConfirming] = useState(false);

  const pick = (m: Mode) => {
    setMode(m);
    setConfirming(false);
  };

  return (
    <div className="sd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>{L('Style by', 'Tạo kiểu theo')}</span>
          <button type="button" className={mode === 'meaning' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={mode === 'meaning'} onClick={() => pick('meaning')}>
            {L('Meaning', 'Ý nghĩa')}
          </button>
          <button type="button" className={mode === 'importance' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={mode === 'importance'} onClick={() => pick('importance')}>
            {L('Importance', 'Mức quan trọng')}
          </button>
        </div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #dcd8cf', borderRadius: 10, padding: 20, color: '#1f2328', maxWidth: 620 }}>
        <p style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 650 }}>{L('Project settings', 'Cài đặt dự án')}</p>
        <p style={{ margin: '0 0 18px', fontSize: 14, color: '#5b6470' }}>{L('You changed the project name and the deploy branch.', 'Bạn đã đổi tên dự án và nhánh deploy.')}</p>

        {!confirming ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            {mode === 'meaning' ? (
              <>
                <button type="button" style={{ ...solid(RED), fontSize: 17, padding: '11px 20px', fontWeight: 800 }}>{L('Delete project', 'Xoá dự án')}</button>
                <button type="button" style={solid('#5b6470')}>{L('Cancel', 'Huỷ')}</button>
                <button type="button" style={solid('#2e7d32')}>{L('Preview', 'Xem trước')}</button>
                <button type="button" style={solid(BLUE)}>{L('Save changes', 'Lưu thay đổi')}</button>
              </>
            ) : (
              <>
                <button type="button" style={solid(BLUE)}>{L('Save changes', 'Lưu thay đổi')}</button>
                <button type="button" style={outline}>{L('Preview', 'Xem trước')}</button>
                <button type="button" style={link('#5b6470')}>{L('Cancel', 'Huỷ')}</button>
                <span style={{ flex: 1 }} />
                <button type="button" style={link(RED)} onClick={() => setConfirming(true)}>
                  {L('Delete project', 'Xoá dự án')}
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ border: '1px solid #f0c7c7', background: '#fdf3f3', borderRadius: 8, padding: 16 }}>
            <p style={{ margin: '0 0 12px', fontSize: 15 }}>{L('Delete this project and all its deploys? This cannot be undone.', 'Xoá dự án này và mọi bản deploy? Không thể hoàn tác.')}</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="button" style={{ ...solid(RED), fontWeight: 700 }} onClick={() => setConfirming(false)}>
                {L('Yes, delete it', 'Có, xoá nó')}
              </button>
              <button type="button" style={link('#5b6470')} onClick={() => setConfirming(false)}>
                {L('Keep it', 'Giữ lại')}
              </button>
            </div>
          </div>
        )}
      </div>

      <p style={{ margin: '12px 0 0', fontSize: 14 }}>
        {mode === 'meaning'
          ? L('Four solid buttons and a big red one: the eye lands on Delete, the thing you almost never want.', 'Bốn nút đặc và một nút đỏ to: mắt rơi vào Xoá, thứ bạn gần như không bao giờ muốn bấm.')
          : confirming
            ? L('Only in the confirmation step is the red button the primary action.', 'Chỉ ở bước xác nhận thì nút đỏ mới là hành động chính.')
            : L('One obvious next step. Try Delete: the red button appears only when it is the main choice.', 'Một bước tiếp theo rõ ràng. Thử bấm Xoá: nút đỏ chỉ xuất hiện khi nó là lựa chọn chính.')}
      </p>
    </div>
  );
}
