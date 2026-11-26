# Stocks basics series: Posts 2–10 design

Date: 2026-11-26 · Series: `stocks-basics` ("Chứng khoán cơ bản", skeleton in `src/data/series.ts`)

## Goal

Complete the remaining 9 posts of `stocks-basics` (Posts 2–10), building on Post 1 (`what-is-a-stock-ownership-dividends`). Each post teaches Vietnamese first-time investors practical market mechanics, valuation, or risk discipline using verified Vietnamese rules (HOSE, HNX, UPCoM, VSDC, Ministry of Finance circulars) and real Vietnamese market cases.

## Wave Breakdown

| Wave | Branch | Posts | Act(s) |
| :--- | :--- | :--- | :--- |
| **A** | `feat/stocks-basics-wave-a` | 2. `vietnam-stock-market-venues-open-account`<br>3. `vietnam-order-types-order-book-ato-atc`<br>4. `stock-fees-taxes-settlement-t2-vsd` | `ground` (2–3), `money` (4) |
| **B** | `feat/stocks-basics-wave-b` | 5. `shareholder-rights-dividends-corporate-actions`<br>6. `reading-financial-statements-investors-5-minutes`<br>7. `pe-pb-roe-valuation-ratios-in-context` | `money` (5), `read` (6–7) |
| **C** | `feat/stocks-basics-wave-c` | 8. `macro-industry-what-moves-stock-prices`<br>9. `margin-trading-risks-beginner-psychology`<br>10. `portfolio-dca-first-investment-plan` | `read` (8), `discipline` (9–10) |

## Per-Post Standard (Post 2–10)

Every post ships together with:
1. **Bilingual MDX body (`<En>` and `<Vi>`)** in `src/content/blog/<slug>.mdx`, `category: "finance"`, `tags: ["stocks", "investing-basics", "stocks-basics"]`, `draft: true` until user review.
   - Top of `<En>` and `<Vi>`: Hero `<Figure />` metaphor (zero preamble), attributed epigraph, hook narrative, `<Callout type="note" title="TL;DR">` / `<Callout type="note" title="Tóm tắt nhanh">`, and intro `<Concepts>`.
   - 5 numbered `##` sections with identical heading count/hierarchy between `<En>` and `<Vi>`, ending each concept section with `<Concepts>`.
   - Closing `## Key takeaways` / `## Điểm rút ra (Key takeaways)` and `## Review questions` / `## Câu hỏi ôn tập (Review questions)` with link to `/blog/<slug>/quiz/`.
2. **Real-world visuals (`src/assets/blog/<slug>/`):** 3–4 verified Wikimedia Commons / official photos (`<= 1600px` wide), each credited in `sources`.
3. **On-page Astro SVG diagrams (`src/components/mdx/SbP<NN>*.astro`):** 6 SVG diagrams per post using site CSS tokens (`var(--text)`, `var(--border)`, `var(--red)`, etc. — zero hardcoded hex), `DiagramIcon`, bilingual `<tspan data-lang-en>` / `<tspan data-lang-vi>`, plain `<polygon>` arrowheads, and optional subtle `fig-motion.css` classes (≤2 per figure).
4. **Interactive React demo (`src/components/mdx/SbP<NN>*Demo.astro` + `src/components/demos/SbP<NN>*Demo.tsx`):** 1 interactive playground per post inside `<DemoFrame>` with a static bilingual no-JS fallback.
5. **Quiz (`src/data/quiz/<slug>/set-01.json` … `set-08.json`):**
   - Registered as `'human'` in `src/data/quiz/domains.ts`.
   - 8 sets × 5 questions = 40 questions: 20 `interview` + 20 `case`; levels `remember: 3`, `understand: 7`, `apply: 14`, `analyze: 9`, `evaluate: 7`; `multi` questions placed in sets `04`, `06`, `07`, `08`; `context.text` formatted with short lines and `• ` bullets; no AI mentions; no "illustrative / minh họa" labels; all math verified with `python3` in `verifiedBy`.
   - 2–3 quiz SVG figures per post (`src/components/quiz/figures/Sbq<NN>*.astro`).

## Market Mechanics Truth Table (Wave A)

- **Custody & Institutions:** SSC regulates; HOSE/HNX run matching; VSDC is the central depository & clearing house (shares sit under the investor's name/ID at VSDC, separate from broker balance sheets); Securities Companies (CTCK) check funds, route orders, and offer cash (`.1`) vs margin (`.6`) sub-accounts.
- **Venues:**
  - **HOSE:** ±7% daily band (±20% first trading day / >25d suspension), lot 100, tick 10 VND (<10k), 50 VND (10k–49.95k), 100 VND (>=50k). Sessions: ATO `09:00–09:15`, Continuous `09:15–11:30` & `13:00–14:30`, ATC `14:30–14:45`, Put-through `09:00–11:30` & `13:00–15:00`.
  - **HNX:** ±10% daily band (±30% first day), lot 100, tick 100 VND. Sessions: Continuous `09:00–11:30` & `13:00–14:30`, ATC `14:30–14:45`, PLO `14:45–15:00`.
  - **UPCoM:** ±15% daily band (±40% first day), lot 100, tick 100 VND. Reference price = weighted-average price of prior session's even-lot continuous trades. Continuous only `09:00–11:30` & `13:00–15:00`.
- **Ceiling / Floor Rounding:** Band bounds `ref * (1 ± band)` round inward toward `ref` to the nearest valid tick so the daily move never exceeds the cap.
- **Fees & Taxes:**
  - Exchange/VSDC transaction fee ~0.027% (embedded or separated depending on broker promo).
  - Broker commission on both buy and sell (typical 0.03%–0.25%).
  - VSDC custody fee: 0.27 VND per share per month.
  - Personal Income Tax (PIT): 0.1% of gross sale proceeds on every sell order (win or lose); 5% withheld on cash dividends.
- **Settlement:** Since 29 Aug 2022, T+2 settlement completes before 13:00 on the second working day after trade `T` (weekends/holidays skipped); shares bought on `T` are sellable in the afternoon session (`13:00–14:45`) of `T+2`. Cash advance (*ứng trước tiền bán*) incurs calendar-day interest until T+2 settlement.

## Market Mechanics Truth Table (Wave B)

- **Dividends & Corporate Actions (Post 5 — HOSE/HNX/UPCoM & Circular 96/111):**
  - **Par value (*Mệnh giá*):** All listed Vietnamese shares have a statutory par value of **10,000 VND**. A "15% cash dividend" always means `15% × 10,000 = 1,500 VND/share`, never 15% of market price.
  - **Ex-date (*Ngày GDKHQ*) vs Record date (*Ngày ĐKCC*):** Under T+2 settlement, *Ngày GDKHQ* falls **1 working day before *Ngày ĐKCC*** (`GDKHQ = ĐKCC - 1 working day`). Buying on `GDKHQ - 1` or earlier grants the right; buying on `GDKHQ` or later does NOT.
  - **Adjusted Reference Price (*Giá tham chiếu điều chỉnh*) on Ex-Date morning:**
    $$P' = \frac{P_{t-1} + I_1 \cdot P_{r1} + I_2 \cdot P_{r2} - C}{1 + I_1 + I_2}$$
    where $P_{t-1}$ is prior close, $C$ is cash dividend per share (VND), $I_1$ is rights issue ratio with subscription price $P_{r1}$, and $I_2$ is stock dividend / bonus ratio ($P_{r2} = 0$). Round $P'$ to the venue's valid tick size (10 / 50 / 100 VND on HOSE, 100 VND on HNX/UPCoM).
  - **Taxes & Delivery:** Cash dividends incur **5% Personal Income Tax (PIT)** withheld at source before payout (2–6 weeks later). Stock dividends / bonus shares pay **0% tax upon receipt** (since Jan 2023 tax timing deferred until eventual sale: 0.1% PIT + 5% par-based tax at sale depending on decree mechanics; note beginners primarily experience 0% deduction on credit date and a 1–3 month VSDC depository lockup before shares become tradable).
- **Vietnamese Financial Statements (Post 6 — VAS / Circular 200 & 202):**
  - Read **Consolidated (*Hợp nhất*)** and **Audited / Reviewed** statements (*Báo cáo kiểm toán / soát xét*), starting with the **Auditor's Opinion** (*Unqualified / Chấp nhận toàn phần* vs *Qualified / Ngoại trừ* vs *Disclaimer / Từ chối*).
  - **Balance Sheet:** Check Cash + Cash Equivalents + Short-term Financial Investments (bank term deposits) against Short-term + Long-term Financial Debt (*Vay và nợ thuê tài chính ngắn/dài hạn*), plus Receivables (*Phải thu*) and Inventory (*Hàng tồn kho*) relative to Total Assets.
  - **Income Statement:** Separate **Gross Profit** (*Lợi nhuận gộp*) and **Core Operating Profit** from **Financial Income / Other Income** (*Doanh thu tài chính / Thu nhập khác*) so one-off asset/FX gains aren't mistaken for recurring business growth.
  - **Cash Flow Statement:** Compare Net Profit (*LNST*) against **Operating Cash Flow (*Lưu chuyển tiền thuần từ HĐKD — CFO*)** over multiple quarters (`CFO >= Net Profit` confirms cash collection).
- **Valuation Ratios in Context (Post 7):**
  - Core identity: $\text{P/B} = \text{P/E} \times \text{ROE}$ where $\text{P/E} = P / \text{EPS}$, $\text{P/B} = P / \text{BVPS}$, and $\text{ROE} = \text{Net Profit} / \text{Average Equity}$.
  - **Vietnamese EPS nuance:** Statutory TTM EPS deducts allocations to the **Bonus & Welfare Fund (*Quỹ khen thưởng, phúc lợi*)**, making screen-displayed P/E slightly higher than raw `Market Cap / Net Profit`.
  - **DuPont 3-factor ROE:** $\text{ROE} = \text{Net Profit Margin} \times \text{Asset Turnover} \times \text{Financial Leverage}$ — distinguishes high-margin / high-turnover operators from debt-heavy ROE.
  - **Sector & Cycle fit:** Banks/Brokers/Real Estate hinge on `P/B` vs sustainable `ROE`; stable Consumer/Tech use `P/E` & Earnings Yield ($E/P$) vs deposit rate (`5–6%`); heavy Cyclicals (steel, fertilizer, shipping) look "cheapest" (`P/E = 4–6x`) at cycle peaks right before earnings collapse (*nghịch lý P/E chu kỳ*).
