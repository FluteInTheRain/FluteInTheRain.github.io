import React, { useState } from 'react';

type Archetype = 'clean' | 'paper' | 'debt';

const FIRMS: Record<Archetype, {
  labelEn: string;
  labelVi: string;
  auditEn: string;
  auditVi: string;
  cashB: number;
  debtB: number;
  recvB: number;
  assetsB: number;
  revB: number;
  grossB: number;
  coreOpB: number;
  oneOffB: number;
  netProfitB: number;
  cfoB: number;
  verdict: 'ok' | 'warn' | 'bad';
  noteEn: string;
  noteVi: string;
}> = {
  clean: {
    labelEn: 'Firm A: Cash compounder',
    labelVi: 'Mã A: Doanh nghiệp tiền tươi',
    auditEn: 'Unqualified (clean, consolidated)',
    auditVi: 'Chấp nhận toàn phần (Hợp nhất)',
    cashB: 320, debtB: 120, recvB: 180, assetsB: 1000,
    revB: 1200, grossB: 420, coreOpB: 180, oneOffB: 2, netProfitB: 150, cfoB: 195,
    verdict: 'ok',
    noteEn: 'Net cash (+200B), steady 35% gross margin, 99% core profit, and CFO (+195B) exceeds Net Profit (+150B).',
    noteVi: 'Tiền ròng dương +200 tỷ, biên gộp 35% ổn định, 99% lãi đến từ kinh doanh chính và CFO (+195 tỷ) vượt Lãi ròng (+150 tỷ).',
  },
  paper: {
    labelEn: 'Firm B: Paper profit trap',
    labelVi: 'Mã B: Bẫy lãi trên giấy',
    auditEn: 'Unqualified (consolidated)',
    auditVi: 'Chấp nhận toàn phần (Hợp nhất)',
    cashB: 38, debtB: 280, recvB: 640, assetsB: 1000,
    revB: 900, grossB: 115, coreOpB: -22, oneOffB: 210, netProfitB: 150, cfoB: -165,
    verdict: 'bad',
    noteEn: 'Alert: identical +150B Net Profit masks −22B core operating loss (via +210B one-off sale), 64% assets stuck in receivables, and −165B CFO bleed!',
    noteVi: 'Cảnh báo: cũng lãi +150 tỷ nhưng ngành chính lỗ −22 tỷ (nhờ bán tài sản +210 tỷ), 64% tài sản kẹt ở Phải thu và CFO âm −165 tỷ!',
  },
  debt: {
    labelEn: 'Firm C: Over-leveraged cycler',
    labelVi: 'Mã C: Vay nợ căng chu kỳ',
    auditEn: 'Emphasis of matter: going concern risk',
    auditVi: 'Nhấn mạnh kiểm toán: rủi ro thanh khoản ngắn hạn',
    cashB: 25, debtB: 680, recvB: 220, assetsB: 1000,
    revB: 1400, grossB: 210, coreOpB: 95, oneOffB: -45, netProfitB: 40, cfoB: 35,
    verdict: 'warn',
    noteEn: 'Debt (680B) equals 27× Cash (25B); interest expenses devour operating profit whenever revenue dips or rates rise.',
    noteVi: 'Nợ vay (680 tỷ) gấp 27 lần Tiền mặt (25 tỷ); chỉ cần doanh thu sụt hoặc lãi suất tăng là chi phí lãi vay nuốt trọn lợi nhuận.',
  },
};

export default function SbP06StatementScannerDemo() {
  const [pick, setPick] = useState<Archetype>('clean');
  const [step, setStep] = useState<'all' | 'bs' | 'pl' | 'cf'>('all');
  const f = FIRMS[pick];

  const netCash = f.cashB - f.debtB;
  const grossMarginPct = ((f.grossB / f.revB) * 100).toFixed(1);
  const cfoRatio = (f.cfoB / f.netProfitB).toFixed(2);
  const recvPct = Math.round((f.recvB / f.assetsB) * 100);

  return (
    <div className="sd sbp6d">
      <div className="sd-controls">
        <div className="sd-group">
          <span>
            <span data-lang-en>Company</span>
            <span data-lang-vi>Hồ sơ</span>
          </span>
          {(['clean', 'paper', 'debt'] as Archetype[]).map((k) => (
            <button
              key={k}
              type="button"
              className={pick === k ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={pick === k}
              onClick={() => setPick(k)}
            >
              <span data-lang-en>{FIRMS[k].labelEn}</span>
              <span data-lang-vi>{FIRMS[k].labelVi}</span>
            </button>
          ))}
        </div>

        <div className="sd-group">
          <span>
            <span data-lang-en>Lens</span>
            <span data-lang-vi>Góc soi</span>
          </span>
          {(
            [
              ['all', 'All 5 min', 'Toàn bộ 5 phút'],
              ['bs', 'Balance Sheet', 'Cân đối KT'],
              ['pl', 'Income', 'KQKD'],
              ['cf', 'Cash Flow', 'Dòng tiền CFO'],
            ] as const
          ).map(([id, en, vi]) => (
            <button
              key={id}
              type="button"
              className={step === id ? 'sd-btn is-on' : 'sd-btn'}
              aria-pressed={step === id}
              onClick={() => setStep(id)}
            >
              <span data-lang-en>{en}</span>
              <span data-lang-vi>{vi}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="sbp6d-audit">
        <strong>
          <span data-lang-en>Min 1 Audit: </span>
          <span data-lang-vi>Phút 1 Kiểm toán: </span>
        </strong>
        <span data-lang-en>{f.auditEn}</span>
        <span data-lang-vi>{f.auditVi}</span>
      </p>

      <div className="sd-stats">
        {(step === 'all' || step === 'bs') && (
          <div className="sd-stat">
            <span>
              <span data-lang-en>Min 2: Net Cash (Cash − Debt)</span>
              <span data-lang-vi>Phút 2: Tiền ròng (Tiền − Nợ vay)</span>
            </span>
            <b>
              {netCash >= 0 ? '+' : ''}
              {netCash}B ({f.cashB} / {f.debtB})
            </b>
          </div>
        )}
        {(step === 'all' || step === 'pl') && (
          <div className="sd-stat">
            <span>
              <span data-lang-en>Min 3: Gross Margin &amp; Core Op</span>
              <span data-lang-vi>Phút 3: Biên gộp &amp; Lãi chính</span>
            </span>
            <b>
              {grossMarginPct}% · {f.coreOpB >= 0 ? '+' : ''}
              {f.coreOpB}B
            </b>
          </div>
        )}
        {(step === 'all' || step === 'cf') && (
          <div className="sd-stat">
            <span>
              <span data-lang-en>Min 4: CFO ÷ Net Profit</span>
              <span data-lang-vi>Phút 4: Dòng tiền CFO ÷ LNST</span>
            </span>
            <b>
              {f.cfoB >= 0 ? '+' : ''}
              {f.cfoB}B / +{f.netProfitB}B ({cfoRatio}×)
            </b>
          </div>
        )}
        {(step === 'all' || step === 'bs' || step === 'cf') && (
          <div className="sd-stat">
            <span>
              <span data-lang-en>Min 5: Receivables / Assets</span>
              <span data-lang-vi>Phút 5: Phải thu / Tổng TS</span>
            </span>
            <b>
              {recvPct}% ({f.recvB}B / {f.assetsB}B)
            </b>
          </div>
        )}
      </div>

      <p className={`sbp6d-verdict is-${f.verdict}`}>
        <span data-lang-en>{f.noteEn}</span>
        <span data-lang-vi>{f.noteVi}</span>
      </p>
    </div>
  );
}
