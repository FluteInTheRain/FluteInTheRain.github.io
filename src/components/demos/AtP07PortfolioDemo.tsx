import { useId, useState } from 'react';

// Two small experiments. All numbers come from Python runs recorded in the quiz verifiedBy fields
// (numpy, default_rng seeds 7 and 5; 2,000 trials per window; 10 assets, 15% to 30% volatility,
// pairwise correlation 0.35, true annual returns 4% to 9%).
// Tab 2 is closed-form: fall to margin call x = 1 - D / (A (1 - m)), with A the assets, D the debt, m the maintenance ratio.

type Row = { years: number; mv: number; gmv: number; gmvLw: number };
const ROWS: Row[] = [
  { years: 5, mv: 0.244, gmv: 0.496, gmvLw: 0.5 },
  { years: 10, mv: 0.317, gmv: 0.518, gmvLw: 0.517 },
  { years: 20, mv: 0.409, gmv: 0.528, gmvLw: 0.527 },
  { years: 30, mv: 0.459, gmv: 0.532, gmvLw: 0.53 },
  { years: 50, mv: 0.51, gmv: 0.534, gmvLw: 0.533 },
  { years: 100, mv: 0.563, gmv: 0.537, gmvLw: 0.537 },
];
const EQUAL = 0.447;
const INVVOL = 0.468;
const ORACLE = 0.628;

const LEVERS = [1.25, 1.5, 2, 2.5];
const MAINT = [0.3, 0.35, 0.4];
const LIMIT = 0.07;

const pct = (x: number, d = 1) => (x * 100).toFixed(d);

export default function AtP07PortfolioDemo() {
  const uid = useId();
  const [tab, setTab] = useState<'window' | 'margin'>('window');
  const [yi, setYi] = useState(0);
  const [lev, setLev] = useState(2);
  const [maint, setMaint] = useState(0.35);

  const row = ROWS[yi];
  const bars: { key: string; en: string; vi: string; v: number; bad?: boolean }[] = [
    { key: 'mv', en: 'Mean-variance on estimated returns', vi: 'Mean-variance với lợi suất ước lượng', v: row.mv, bad: row.mv < EQUAL },
    { key: 'gmv', en: 'Minimum variance, sample covariance', vi: 'Phương sai tối thiểu, covariance mẫu', v: row.gmv },
    { key: 'lw', en: 'Minimum variance, shrunk covariance', vi: 'Phương sai tối thiểu, covariance co lại', v: row.gmvLw },
    { key: 'iv', en: 'Inverse volatility', vi: 'Nghịch đảo độ biến động', v: INVVOL },
    { key: 'eq', en: 'Equal weight (1/N)', vi: 'Chia đều (1/N)', v: EQUAL },
  ];

  const A = lev;
  const D = A - 1;
  const x = Math.max(0, 1 - D / (A * (1 - maint)));
  const days = x > 0 ? Math.ceil(Math.log(1 - x) / Math.log(1 - LIMIT) - 1e-9) : 0;
  const callNow = 1 / lev <= maint + 1e-9;

  return (
    <div className="sd atp07" aria-labelledby={uid}>
      <span id={uid} className="atp07-sr">
        <span data-lang-en>Two experiments: how much history an optimizer needs, and how far a price can fall before a margin call</span>
        <span data-lang-vi>Hai thí nghiệm: optimizer cần bao nhiêu lịch sử, và giá rơi bao xa thì bị gọi ký quỹ</span>
      </span>
      <div className="sd-controls">
        <div className="sd-group">
          <button type="button" className={tab === 'window' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={tab === 'window'} onClick={() => setTab('window')}>
            <span data-lang-en>1. History length</span>
            <span data-lang-vi>1. Độ dài lịch sử</span>
          </button>
          <button type="button" className={tab === 'margin' ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={tab === 'margin'} onClick={() => setTab('margin')}>
            <span data-lang-en>2. Margin ladder</span>
            <span data-lang-vi>2. Bậc thang ký quỹ</span>
          </button>
        </div>
      </div>

      {tab === 'window' ? (
        <>
          <div className="sd-controls">
            <div className="sd-group">
              <span>
                <span data-lang-en>History used</span>
                <span data-lang-vi>Lịch sử dùng để ước lượng</span>
              </span>
              {ROWS.map((r, i) => (
                <button key={r.years} type="button" className={i === yi ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={i === yi} onClick={() => setYi(i)}>
                  <span data-lang-en>{r.years} years</span>
                  <span data-lang-vi>{r.years} năm</span>
                </button>
              ))}
            </div>
          </div>
          <p className="atp07-note">
            <span data-lang-en>Ten assets, true Sharpe ratios known to us but not to the optimizer. Each bar is the true Sharpe ratio of the weights it picked, averaged over 2,000 simulated histories. The best possible weights reach {ORACLE.toFixed(3)}.</span>
            <span data-lang-vi>Mười tài sản, Sharpe thật chỉ chúng ta biết còn optimizer thì không. Mỗi thanh là Sharpe thật của bộ trọng số nó chọn, lấy trung bình trên 2.000 lịch sử mô phỏng. Bộ trọng số tốt nhất có thể đạt {ORACLE.toFixed(3)}.</span>
          </p>
          <div className="atp07-bars">
            {bars.map((b) => (
              <div key={b.key} className="atp07-barrow">
                <div className="atp07-barlabel">
                  <span data-lang-en>{b.en}</span>
                  <span data-lang-vi>{b.vi}</span>
                </div>
                <div className="atp07-track">
                  <div className={b.bad ? 'atp07-fill is-bad' : 'atp07-fill'} style={{ width: `${(b.v / ORACLE) * 100}%` }} />
                  <div className="atp07-eqmark" style={{ left: `${(EQUAL / ORACLE) * 100}%` }} />
                </div>
                <div className="atp07-val">{b.v.toFixed(3)}</div>
              </div>
            ))}
          </div>
          <p className="atp07-verdict" aria-live="polite">
            {row.mv < EQUAL ? (
              <>
                <span data-lang-en>After {row.years} years of data the return-chasing optimizer is still below the equal-weight line.</span>
                <span data-lang-vi>Sau {row.years} năm dữ liệu, optimizer đuổi theo lợi suất vẫn nằm dưới vạch chia đều.</span>
              </>
            ) : (
              <>
                <span data-lang-en>Only now, with {row.years} years of data, does the return-chasing optimizer pass the equal-weight line.</span>
                <span data-lang-vi>Phải tới {row.years} năm dữ liệu, optimizer đuổi theo lợi suất mới vượt vạch chia đều.</span>
              </>
            )}
          </p>
        </>
      ) : (
        <>
          <div className="sd-controls">
            <div className="sd-group">
              <span>
                <span data-lang-en>Assets bought per 1 of your own money</span>
                <span data-lang-vi>Tài sản mua trên 1 đồng vốn của bạn</span>
              </span>
              {LEVERS.map((l) => (
                <button key={l} type="button" className={l === lev ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={l === lev} onClick={() => setLev(l)}>
                  {l}x
                </button>
              ))}
            </div>
            <div className="sd-group">
              <span>
                <span data-lang-en>Broker's maintenance ratio</span>
                <span data-lang-vi>Tỷ lệ duy trì của công ty chứng khoán</span>
              </span>
              {MAINT.map((m) => (
                <button key={m} type="button" className={m === maint ? 'sd-btn is-on' : 'sd-btn'} aria-pressed={m === maint} onClick={() => setMaint(m)}>
                  {pct(m, 0)}%
                </button>
              ))}
            </div>
          </div>
          <div className="sd-stats">
            <div className="sd-stat"><b>{pct(1 / lev, 0)}%</b><span><span data-lang-en>starting equity share</span><span data-lang-vi>tỷ lệ vốn tự có ban đầu</span></span></div>
            <div className={x < 0.1 ? 'sd-stat is-bad' : 'sd-stat'}><b>{callNow ? '0' : pct(x)}%</b><span><span data-lang-en>fall to a margin call</span><span data-lang-vi>mức giảm tới lúc gọi ký quỹ</span></span></div>
            <div className={days <= 2 ? 'sd-stat is-bad' : 'sd-stat'}><b>{days}</b><span><span data-lang-en>sessions at the 7% limit</span><span data-lang-vi>phiên giảm sàn 7%</span></span></div>
            <div className="sd-stat"><b>{pct(lev * 0.05, 1)}%</b><span><span data-lang-en>equity lost if the stock falls 5%</span><span data-lang-vi>vốn mất nếu cổ phiếu giảm 5%</span></span></div>
          </div>
          <p className="atp07-verdict" aria-live="polite">
            {callNow ? (
              <>
                <span data-lang-en>The starting equity share is already below the maintenance ratio: the broker would refuse this loan.</span>
                <span data-lang-vi>Tỷ lệ vốn tự có ban đầu đã thấp hơn tỷ lệ duy trì: công ty chứng khoán sẽ không giải ngân khoản vay này.</span>
              </>
            ) : (
              <>
                <span data-lang-en>Say the broker asks for {pct(maint, 0)}% equity. At {lev}x a fall of {pct(x)}% takes you there; if the stock dropped the {pct(LIMIT, 0)}% limit every session, that is {days} sessions.</span>
                <span data-lang-vi>Giả sử công ty chứng khoán đòi {pct(maint, 0)}% vốn tự có. Ở {lev}x, giá giảm {pct(x)}% là chạm ngưỡng; nếu cổ phiếu giảm sàn {pct(LIMIT, 0)}% mỗi phiên thì mất {days} phiên.</span>
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
