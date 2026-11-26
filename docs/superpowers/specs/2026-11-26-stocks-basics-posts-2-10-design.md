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
