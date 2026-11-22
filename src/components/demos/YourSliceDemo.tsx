import React, { useState } from 'react';

// Pinned numbers (Task 2 report, audited FY2025 annual reports):
// - FPT: net profit attributable to parent shareholders 9,376 bn VND,
//   1,703,507,121 shares outstanding (end-2025), cash dividend 2,000 VND/share.
// - Vinamilk: consolidated profit for the year 9,414 bn VND,
//   2,089,955,445 shares outstanding, cash dividend 4,350 VND/share.
// Each company's profit basis is stated faithfully (they differ).

type CompanyId = 'fpt' | 'vnm';

interface CompanySpec {
  ticker: string;
  sharesOutstanding: number;
  netProfit: number; // VND, for fiscal year 2025
  cashDividendPerShare: number; // VND
  profitBasisEn: string;
  profitBasisVi: string;
  sourceLabelEn: string;
  sourceLabelVi: string;
  dividendNoteEn: string;
  dividendNoteVi: string;
}

const COMPANIES: Record<CompanyId, CompanySpec> = {
  fpt: {
    ticker: 'FPT',
    sharesOutstanding: 1_703_507_121,
    netProfit: 9_376_000_000_000,
    cashDividendPerShare: 2_000,
    profitBasisEn: 'net profit attributable to parent shareholders',
    profitBasisVi: 'lợi nhuận sau thuế thuộc cổ đông công ty mẹ',
    sourceLabelEn: 'FPT Annual Report 2025 (audited)',
    sourceLabelVi: 'Báo cáo thường niên 2025 của FPT (đã kiểm toán)',
    dividendNoteEn: 'paid in two installments of 1,000 VND',
    dividendNoteVi: 'trả hai đợt, mỗi đợt 1.000 đồng',
  },
  vnm: {
    ticker: 'VNM',
    sharesOutstanding: 2_089_955_445,
    netProfit: 9_414_000_000_000,
    cashDividendPerShare: 4_350,
    profitBasisEn: 'consolidated profit for the year',
    profitBasisVi: 'lợi nhuận sau thuế hợp nhất cả năm',
    sourceLabelEn: 'Vinamilk Annual Report 2025 (audited)',
    sourceLabelVi: 'Báo cáo thường niên 2025 của Vinamilk (đã kiểm toán)',
    dividendNoteEn: '2,500 VND interim + 1,850 VND final',
    dividendNoteVi: '2.500 đồng tạm ứng + 1.850 đồng cuối năm',
  },
};

// Log-ish slider: track position 0..600 maps to 10^0..10^6 shares.
const SLIDER_MAX = 600;
const DEFAULT_POS = 300; // 1,000 shares — the same default the prose works through

function sharesAt(pos: number): number {
  const raw = 10 ** (pos / 100);
  if (raw < 1000) return Math.max(1, Math.round(raw)); // 1..999 stay whole shares
  const step = 10 ** (Math.floor(Math.log10(raw)) - 2); // 3 significant figures
  return Math.round(raw / step) * step;
}

const money = (v: number, vi: boolean) =>
  v.toLocaleString(vi ? 'vi-VN' : 'en-US', { maximumFractionDigits: 0 });
const pct = (v: number, vi: boolean) =>
  v.toLocaleString(vi ? 'vi-VN' : 'en-US', { maximumSignificantDigits: 3 });

export default function YourSliceDemo() {
  const [companyId, setCompanyId] = useState<CompanyId>('fpt');
  const [pos, setPos] = useState(DEFAULT_POS);

  const c = COMPANIES[companyId];
  const shares = sharesAt(pos);
  const ownershipPct = (shares / c.sharesOutstanding) * 100;
  const profitSlice = (shares * c.netProfit) / c.sharesOutstanding;
  const dividend = shares * c.cashDividendPerShare;

  return (
    <div className="sd yourslice">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Company</span>
            <span data-lang-vi>Công ty</span>
          </span>
          {(Object.keys(COMPANIES) as CompanyId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={companyId === id ? 'sd-btn is-on' : 'sd-btn'}
              onClick={() => setCompanyId(id)}
            >
              {COMPANIES[id].ticker}
            </button>
          ))}
        </div>
        <div className="sd-group yourslice-slider-group">
          <label className="yourslice-label" htmlFor="yourslice-range">
            <span data-lang-en>Your shares</span>
            <span data-lang-vi>Số cổ phiếu của bạn</span>
          </label>
          <output className="yourslice-count">
            <span data-lang-en>{money(shares, false)} shares</span>
            <span data-lang-vi>{money(shares, true)} cổ phiếu</span>
          </output>
        </div>
      </div>

      <input
        id="yourslice-range"
        className="yourslice-range"
        type="range"
        min={0}
        max={SLIDER_MAX}
        step={1}
        value={pos}
        onChange={(e) => setPos(Number(e.currentTarget.value))}
      />
      <div className="yourslice-scale" aria-hidden="true">
        <span>1</span>
        <span>
          <span data-lang-en>{money(1_000_000, false)}</span>
          <span data-lang-vi>{money(1_000_000, true)}</span>
        </span>
      </div>

      <div className="sd-stats">
        <div className="sd-stat yourslice-stat">
          <b>
            <span data-lang-en>{pct(ownershipPct, false)}%</span>
            <span data-lang-vi>{pct(ownershipPct, true)}%</span>
          </b>
          <span>
            <span data-lang-en>Ownership</span>
            <span data-lang-vi>Tỷ lệ sở hữu</span>
          </span>
        </div>
        <div className="sd-stat yourslice-stat">
          <b>
            <span data-lang-en>{money(profitSlice, false)} VND</span>
            <span data-lang-vi>{money(profitSlice, true)} đồng</span>
          </b>
          <span>
            <span data-lang-en>Your slice of the year's profit</span>
            <span data-lang-vi>Phần lợi nhuận cả năm của bạn</span>
          </span>
        </div>
        <div className="sd-stat yourslice-stat">
          <b>
            <span data-lang-en>{money(dividend, false)} VND</span>
            <span data-lang-vi>{money(dividend, true)} đồng</span>
          </b>
          <span>
            <span data-lang-en>Your annual cash dividend</span>
            <span data-lang-vi>Cổ tức tiền mặt hằng năm của bạn</span>
          </span>
        </div>
      </div>

      <p className="yourslice-src">
        <span data-lang-en>
          {c.ticker}, FY2025: {c.profitBasisEn} ÷ {money(c.sharesOutstanding, false)} shares · dividend {money(c.cashDividendPerShare, false)} VND/share ({c.dividendNoteEn}). Source: {c.sourceLabelEn}.
        </span>
        <span data-lang-vi>
          {c.ticker}, năm 2025: {c.profitBasisVi} ÷ {money(c.sharesOutstanding, true)} cổ phiếu · cổ tức {money(c.cashDividendPerShare, true)} đồng/cổ phiếu ({c.dividendNoteVi}). Nguồn: {c.sourceLabelVi}.
        </span>
      </p>
    </div>
  );
}
