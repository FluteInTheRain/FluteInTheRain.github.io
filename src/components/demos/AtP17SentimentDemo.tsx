import React, { useId, useState } from 'react';

// Three tiny headline scorers. The word lists are small toy lists written for this post, not the
// Harvard or Loughran-McDonald lists. They are built to show the same failures those papers describe.
// Score = positive words minus negative words. The numbers in the table match a Python re-implementation.

export const GENERIC_NEG = ['tax', 'cost', 'costs', 'liability', 'capital', 'board', 'foreign', 'mine', 'loss', 'weak', 'violation', 'default', 'risk'];
export const GENERIC_POS = ['profit', 'record', 'growth', 'wins', 'approval', 'strong', 'beats'];
export const FIN_NEG = ['loss', 'weak', 'default', 'delisting', 'probe', 'violation', 'restates', 'fraud', 'warns'];
export const FIN_POS = ['profit', 'record', 'growth', 'wins', 'approval', 'strong', 'beats', 'upgrade'];
export const NEGATORS = ['not', 'no', 'without', 'never'];
const WINDOW = 3;

export type Mode = 'generic' | 'finance' | 'finance-neg';
export interface Tok { w: string; tag: 'pos' | 'neg' | null; flipped: boolean }

export const HEADLINES: { en: string; vi: string }[] = [
  { en: 'Bank raises capital after board approval, tax liability shrinks', vi: 'Ngân hàng tăng vốn sau khi hội đồng quản trị phê duyệt, nghĩa vụ thuế giảm' },
  { en: 'Profit beats forecast, record growth in exports', vi: 'Lợi nhuận vượt dự báo, xuất khẩu tăng trưởng kỷ lục' },
  { en: 'Firm does not default on bond, no delisting risk', vi: 'Doanh nghiệp không vỡ nợ trái phiếu, không có rủi ro huỷ niêm yết' },
  { en: 'Regulator opens probe into disclosure violation at steelmaker', vi: 'Cơ quan quản lý mở cuộc thanh tra vụ vi phạm công bố thông tin tại nhà sản xuất thép' },
  { en: 'Mine operator wins licence to expand foreign output', vi: 'Doanh nghiệp khai thác mỏ trúng giấy phép mở rộng sản lượng ở nước ngoài' },
  { en: 'Company warns of loss as weak demand hits sales', vi: 'Công ty cảnh báo lỗ vì nhu cầu yếu kéo doanh số xuống' },
];

export function scoreText(text: string, mode: Mode): { tokens: Tok[]; score: number } {
  const neg = new Set(mode === 'generic' ? GENERIC_NEG : FIN_NEG);
  const pos = new Set(mode === 'generic' ? GENERIC_POS : FIN_POS);
  const words = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/-/g, ' ').split(/\s+/).filter(Boolean);
  let score = 0;
  let sinceNegator = 99;
  const tokens: Tok[] = [];
  for (const w of words) {
    let tag: Tok['tag'] = null;
    let flipped = false;
    if (mode === 'finance-neg' && NEGATORS.includes(w)) {
      sinceNegator = 0;
      tokens.push({ w, tag: null, flipped: false });
      continue;
    }
    if (pos.has(w)) tag = 'pos';
    else if (neg.has(w)) tag = 'neg';
    if (tag && mode === 'finance-neg' && sinceNegator < WINDOW) {
      tag = tag === 'pos' ? 'neg' : 'pos';
      flipped = true;
      sinceNegator = 99;
    }
    if (tag === 'pos') score += 1;
    if (tag === 'neg') score -= 1;
    if (sinceNegator < 99) sinceNegator += 1;
    tokens.push({ w, tag, flipped });
  }
  return { tokens, score };
}

export const MODES: { id: Mode; en: string; vi: string }[] = [
  { id: 'generic', en: 'Generic word list', vi: 'Bộ từ phổ thông' },
  { id: 'finance', en: 'Finance word list', vi: 'Bộ từ tài chính' },
  { id: 'finance-neg', en: 'Finance list + negation', vi: 'Bộ từ tài chính + phủ định' },
];

const sign = (n: number) => (n > 0 ? `+${n}` : String(n));

export default function AtP17SentimentDemo() {
  const id = useId();
  const [text, setText] = useState(HEADLINES[2].en);
  const pick = HEADLINES.findIndex((h) => h.en === text);

  return (
    <div className="p17d">
      <div className="p17d-picks" role="group" aria-label="Headlines">
        {HEADLINES.map((h, i) => (
          <button key={i} type="button" className={i === pick ? 'p17d-btn is-on' : 'p17d-btn'} onClick={() => setText(h.en)}>
            {i + 1}
          </button>
        ))}
      </div>
      <label className="p17d-label" htmlFor={`${id}-in`}>
        <span data-lang-en>Headline (edit it, or type your own English headline)</span>
        <span data-lang-vi>Tiêu đề (sửa tuỳ ý, hoặc gõ một tiêu đề tiếng Anh của bạn)</span>
      </label>
      <input id={`${id}-in`} className="p17d-in" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
      {pick >= 0 && (
        <p className="p17d-gloss">
          <span data-lang-vi>{HEADLINES[pick].vi}</span>
        </p>
      )}
      <div className="p17d-rows">
        {MODES.map((m) => {
          const r = scoreText(text, m.id);
          const cls = r.score > 0 ? 'is-pos' : r.score < 0 ? 'is-neg' : 'is-zero';
          return (
            <div key={m.id} className="p17d-row">
              <div className="p17d-rowhead">
                <span className="p17d-mode">
                  <span data-lang-en>{m.en}</span>
                  <span data-lang-vi>{m.vi}</span>
                </span>
                <b className={`p17d-score ${cls}`}>{sign(r.score)}</b>
              </div>
              <div className="p17d-toks">
                {r.tokens.map((t, i) => (
                  <span key={i} className={`p17d-tok ${t.tag ? 'is-' + t.tag : ''} ${t.flipped ? 'is-flip' : ''}`}>
                    {t.w}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="p17d-note">
        <span data-lang-en>Gold = counted as positive, red = counted as negative, dashed outline = sign flipped by a negation word. Score = positive words minus negative words.</span>
        <span data-lang-vi>Vàng = tính là tích cực, đỏ = tính là tiêu cực, viền đứt = bị đảo dấu vì từ phủ định. Điểm = số từ tích cực trừ số từ tiêu cực.</span>
      </p>
    </div>
  );
}
