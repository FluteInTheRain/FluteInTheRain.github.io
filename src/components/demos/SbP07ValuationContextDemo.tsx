import React, { useId, useState } from 'react';

type SectorPreset = 'it' | 'bank' | 'steel' | 'trap';

const PRESETS: Record<SectorPreset, {
  labelEn: string;
  labelVi: string;
  price: number;
  bvps: number;
  headlineRoe: number;
  normalizedRoe: number;
  welfareCutPct: number;
  noteEn: string;
  noteVi: string;
}> = {
  it: {
    labelEn: 'IT / Consumer Growth',
    labelVi: 'CNTT / Tiêu dùng tăng trưởng',
    price: 80_000, bvps: 25_000, headlineRoe: 24, normalizedRoe: 24, welfareCutPct: 10,
    noteEn: 'High-quality compounder: 24% ROE justifies P/B 3.20x at P/E ~14.8x (after 10% welfare cut). Compare E/P yield + growth against 5.5% deposit rate.',
    noteVi: 'Tăng trưởng bền vững: ROE 24% lý giải mức P/B 3,20x ở P/E ~14,8x (sau trừ 10% quỹ KTPL). Kết hợp E/P + tăng trưởng để so với gửi tiết kiệm 5,5%.',
  },
  bank: {
    labelEn: 'Commercial Bank',
    labelVi: 'Ngân hàng thương mại',
    price: 30_000, bvps: 20_000, headlineRoe: 20, normalizedRoe: 19, welfareCutPct: 0,
    noteEn: 'Banks are valued primarily via P/B × ROE: at P/B 1.50x and 20% ROE, implied P/E is just 7.5x (always verify NPL/bad-debt coverage).',
    noteVi: 'Ngân hàng định giá chính qua P/B đi kèm ROE: ở P/B 1,50x với ROE 20%, P/E tương ứng chỉ là 7,5x (luôn kiểm tra tỷ lệ nợ xấu đi kèm).',
  },
  steel: {
    labelEn: 'Cyclical Steel (Peak)',
    labelVi: 'Thép chu kỳ (Vùng đỉnh)',
    price: 45_000, bvps: 20_000, headlineRoe: 50, normalizedRoe: 12, welfareCutPct: 5,
    noteEn: 'Cyclical Peak Alert: headline P/E = 4.7x looks super cheap strictly from a temporary 50% boom ROE! Normalized mid-cycle P/E (~19.7x) exposes how expensive P/B = 2.25x actually is.',
    noteVi: 'Cảnh báo Đỉnh chu kỳ: P/E bề mặt 4,7x trông siêu rẻ do ROE sốt tạm thời lên 50%! Quy về ROE bình quân chu kỳ 12%, P/E thật lên tới ~19,7x tương ứng P/B 2,25x khá đắt.',
  },
  trap: {
    labelEn: 'One-off Asset Sale Trap',
    labelVi: 'Bẫy P/E rẻ do lãi đột biến',
    price: 18_000, bvps: 15_000, headlineRoe: 25, normalizedRoe: 6, welfareCutPct: 5,
    noteEn: 'Value Trap: trailing ROE spiked to 25% via a one-off subsidiary/land sale (headline P/E ~5.1x), masking a weak 6% core ROE (~21.1x normalized P/E!).',
    noteVi: 'Bẫy giá rẻ: ROE bề mặt vọt 25% nhờ bán đất/công ty con một lần (P/E chỉ ~5,1x), che giấu ROE cốt lõi yếu 6% (P/E thật tới ~21,1x!).',
  },
};

const fmt = (n: number, vi: boolean) => Math.round(n).toLocaleString(vi ? 'vi-VN' : 'en-US');

export default function SbP07ValuationContextDemo() {
  const priceId = useId();
  const welfareId = useId();
  const [preset, setPreset] = useState<SectorPreset>('steel');
  const p = PRESETS[preset];

  const [price, setPrice] = useState<number>(p.price);
  const [welfarePct, setWelfarePct] = useState<number>(p.welfareCutPct);

  const selectPreset = (k: SectorPreset) => {
    setPreset(k);
    setPrice(PRESETS[k].price);
    setWelfarePct(PRESETS[k].welfareCutPct);
  };

  const pb = price / p.bvps;
  const headlineEps = p.bvps * (p.headlineRoe / 100) * (1 - welfarePct / 100);
  const normEps = p.bvps * (p.normalizedRoe / 100) * (1 - welfarePct / 100);
  const headlinePe = headlineEps > 0 ? price / headlineEps : 0;
  const normPe = normEps > 0 ? price / normEps : 0;
  const earningsYieldPct = headlinePe > 0 ? (100 / headlinePe) : 0;

  return (
    <div className="sd sbp7d">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Sector</span>
            <span data-lang-vi>Nhóm ngành</span>
          </span>
          {(Object.keys(PRESETS) as SectorPreset[]).map((k) => (
            <button
              key={k}
              type="button"
              className={preset === k ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={preset === k}
              onClick={() => selectPreset(k)}
            >
              <span data-lang-en>{PRESETS[k].labelEn}</span>
              <span data-lang-vi>{PRESETS[k].labelVi}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sbp7d-sliders">
        <div>
          <div className="sbp7d-row">
            <label htmlFor={priceId} className="sbp7d-lbl">
              <span data-lang-en>Stock Price (BVPS = {fmt(p.bvps, false)} đ)</span>
              <span data-lang-vi>Thị giá (BVPS = {fmt(p.bvps, true)} đ)</span>
            </label>
            <span className="sbp7d-val">
              <span data-lang-en>{fmt(price, false)} VND</span>
              <span data-lang-vi>{fmt(price, true)} đ</span>
            </span>
          </div>
          <input
            id={priceId}
            className="sbp7d-range"
            type="range"
            min={10_000}
            max={120_000}
            step={1_000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <div className="sbp7d-row">
            <label htmlFor={welfareId} className="sbp7d-lbl">
              <span data-lang-en>Bonus &amp; Welfare Fund Cut</span>
              <span data-lang-vi>Trích Quỹ Khen thưởng Phúc lợi</span>
            </label>
            <span className="sbp7d-val">{welfarePct}%</span>
          </div>
          <input
            id={welfareId}
            className="sbp7d-range"
            type="range"
            min={0}
            max={25}
            step={5}
            value={welfarePct}
            onChange={(e) => setWelfarePct(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="sd-stats">
        <div className="sd-stat">
          <span>
            <span data-lang-en>P/B Multiple</span>
            <span data-lang-vi>Hệ số P/B</span>
          </span>
          <b>{pb.toFixed(2)}×</b>
        </div>
        <div className="sd-stat">
          <span>
            <span data-lang-en>Headline Trailing P/E</span>
            <span data-lang-vi>P/E bề mặt (1 năm qua)</span>
          </span>
          <b>
            {headlinePe.toFixed(1)}× ({p.headlineRoe}% ROE)
          </b>
        </div>
        <div className="sd-stat">
          <span>
            <span data-lang-en>Normalized Mid-Cycle P/E</span>
            <span data-lang-vi>P/E bình quân chu kỳ / lõi</span>
          </span>
          <b>
            {normPe.toFixed(1)}× ({p.normalizedRoe}% ROE)
          </b>
        </div>
        <div className="sd-stat">
          <span>
            <span data-lang-en>Earnings Yield (E/P vs ~5.5% bank)</span>
            <span data-lang-vi>Tỷ suất E/P (so gửi NH ~5,5%)</span>
          </span>
          <b>{earningsYieldPct.toFixed(1)}%</b>
        </div>
      </div>

      <p className="sbp7d-note">
        <span data-lang-en>{p.noteEn}</span>
        <span data-lang-vi>{p.noteVi}</span>
      </p>
    </div>
  );
}
