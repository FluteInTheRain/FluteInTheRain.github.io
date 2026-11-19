import React, { useState } from 'react';

// "Turn the colour off" check from the post: the same two real screenshots, with a switch that
// removes all colour (CSS grayscale filter). If the main action stops being obvious, colour was
// doing the work that spacing, contrast and size should do.

type Props = { before: string; after: string };

const L = (en: string, vi: string) => (
  <>
    <span data-lang-en>{en}</span>
    <span data-lang-vi>{vi}</span>
  </>
);

export default function GrayscaleDemo({ before, after }: Props) {
  const [gray, setGray] = useState(false);
  const img: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: 8,
    border: '1px solid var(--border)',
    filter: gray ? 'grayscale(1)' : 'none',
    transition: 'filter 0.35s ease',
  };
  const cap: React.CSSProperties = { margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' };

  return (
    <div className="sd">
      <div className="sd-controls">
        <div className="sd-group">
          <span>{L('Colour', 'Màu')}</span>
          <button type="button" className={gray ? 'sd-btn' : 'sd-btn is-on'} aria-pressed={!gray} onClick={() => setGray(false)}>
            {L('On', 'Bật')}
          </button>
          <button type="button" className={gray ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={gray} onClick={() => setGray(true)}>
            {L('Off', 'Tắt')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        <div>
          <img src={before} alt="" style={img} loading="lazy" />
          <p style={cap}>{L('Unguided result', 'Kết quả không có hướng dẫn')}</p>
        </div>
        <div>
          <img src={after} alt="" style={img} loading="lazy" />
          <p style={cap}>{L('Result with a design brief', 'Kết quả khi có brief thiết kế')}</p>
        </div>
      </div>

      <p style={{ margin: '12px 0 0', fontSize: 14 }}>
        {gray
          ? L(
              'Without colour: can you still tell which thing to click first, and what comes second?',
              'Không còn màu: bạn còn nhận ra nên bấm cái nào trước, và cái nào đến sau không?',
            )
          : L('Press Off and look for the main action.', 'Bấm Tắt rồi tìm hành động chính.')}
      </p>
    </div>
  );
}
