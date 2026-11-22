# Stocks basics series — skeleton design

Date: 2026-11-21 · Status: draft (user to approve)

## Goal

Add a fourth blog series, `stocks-basics` ("Chứng khoán cơ bản"), targeting Vietnamese
first-time investors. This batch ships the **series skeleton only**: the `series.ts` entry,
the cover art, and the series cover page at `/blog/series/stocks-basics/` rendered with
zero published posts (all parts show as "soon"). The posts themselves are written in later
batches, one per slug below.

## Decisions made with the user

- **Sources:** mixed, not a single book. The series `credit` names the per-topic sources:
  official Vietnamese market mechanics (HOSE/HNX/VSDC rules, fee schedules, issuer filings)
  plus investing classics (Graham, Lynch, Housel). Per-post `sources` will cite exactly
  what each post used when those posts are written.
- **Angle:** the Vietnamese first-timer — opening a broker account, ATO/ATC/LO orders,
  HOSE/HNX/UPCoM, fees, T+2 settlement, dividends, margin. Not a developer/systems angle
  (the existing `fix-gateway` / `nautilus-trader` posts already cover that from the
  engineering side and stay outside this series).
- **Scope of this batch:** skeleton only — no posts written yet.
- **Cover art:** a vintage stock certificate, real photo/scan from Wikimedia Commons
  (site convention: no AI-generated imagery).

## Series structure

- `id`: `stocks-basics`
- `title`: EN "Stock market basics" / VI "Chứng khoán cơ bản" (short, to the point —
  user asked for it)
- `kicker`: "A 10-part series" / "Series 10 bài"
- 4 acts (reading-map columns), 10 parts, 3 paths.

### Acts

| id | EN label | VI label | blurb (EN / VI) |
|----|----------|----------|-----------------|
| `ground` | Foundations | Nền tảng | What a share is, where to buy one / Cổ phiếu là gì, mua ở đâu |
| `money` | The money path | Dòng tiền | Fees, settlement, dividends / Phí, thanh toán, cổ tức |
| `read` | Reading the numbers | Đọc số | Statements, ratios, macro / BCTC, chỉ số, vĩ mô |
| `discipline` | Staying in the game | Trụ lại trên thị trường | Risk, psychology, a plan / Rủi ro, tâm lý, kế hoạch |

### Parts (slug · topic · hook · act · builds)

1. `what-is-a-stock-ownership-dividends` · A share is ownership / Cổ phiếu là sở hữu ·
   One share = one slice of a company: earnings, dividends and why prices move. · ground · —
2. `vietnam-stock-market-venues-open-account` · Open an account / Mở tài khoản ·
   Picking a Vietnamese broker, eKYC, and what HOSE, HNX and UPCoM actually are. · ground · 1
3. `vietnam-order-types-order-book-ato-atc` · Prices & orders / Bảng giá & lệnh ·
   Reading the board and placing LO/ATO/ATC/MP orders without paying the spread. · ground · 2
4. `stock-fees-taxes-settlement-t2-vsd` · Fees & settlement / Phí & thanh toán ·
   Where your money goes after a trade: fees, tax, T+2 settlement through VSDC. · money · 3
5. `shareholder-rights-dividends-corporate-actions` · Dividends & rights / Cổ tức & quyền ·
   Cash vs stock dividends, splits, ex-date traps and dilution from new issuance. · money · 4
6. `reading-financial-statements-investors-5-minutes` · Financial statements / BCTC ·
   Five minutes with a financial statement: what to check, what smells wrong. · read · 1
7. `pe-pb-roe-valuation-ratios-in-context` · Valuation ratios / Chỉ số định giá ·
   PE, PB, ROE mean nothing without context — industry benchmarks and earnings cycles. · read · 6
8. `macro-industry-what-moves-stock-prices` · Macro & industry / Vĩ mô & ngành ·
   Interest rates, FX and cycles move whole sectors; read the current, not the noise. · read · 7
9. `margin-trading-risks-beginner-psychology` · Risk & psychology / Rủi ro & tâm lý ·
   Margin cuts both ways; herd behaviour, FOMO and how beginners actually lose money. · discipline · 4, 8
10. `portfolio-dca-first-investment-plan` · Your first plan / Kế hoạch đầu tiên ·
    A first-year plan: position sizing, DCA and written rules for when to sell. · discipline · 9

### Paths

- `full` — "Read it all" / "Đọc trọn bộ": all 10 parts in order.
- `first-trade` — "Place your first trade" / "Đặt lệnh đầu tiên":
  who — you want to trade this week and need the mechanics only.
  order: 1, 2, 3, 4.
- `long-hold` — "Invest slow, hold long" / "Đầu tư chậm, nắm dài hạn":
  who — you do not want to watch the board every day.
  order: 1, 6, 7, 5, 9, 10.

## Cover art

Chosen image: **File:Original company stock certificate.jpg** on Wikimedia Commons —
a lithographed 1892 stock certificate scan, 3507×1881 (wide, clean scan).

- Credit: author Downingsf, license CC BY-SA 3.0,
  url https://commons.wikimedia.org/wiki/File:Original_company_stock_certificate.jpg
- Saved as `src/assets/series/stock-certificate-1892.jpg` (same folder as the other three
  series covers).
- `subtitle`: EN "Ownership · Orders · Numbers · Discipline" / VI "Sở hữu · Lệnh · Con số · Kỷ luật"
- `imprint`: `STOCKS`
- `alt`: "A lithographed stock certificate from 1892 with ornate borders and a central vignette."
- `position`: tuned by eye on the cover plate (start `50% 55%`).

## Behaviour when the series has no posts

- `/blog/series/stocks-basics/` must render with every part marked "soon" and no broken
  prev/next links. This is the existing contract of the cover page (draft posts are
  skipped in production); it needs verification for the zero-post case.
- The blog index filters series by `publishedCount > 0`, so an empty series adds no card
  there — confirmed by reading `src/pages/blog/index.astro`.
- Nothing else on the site should change: no UI copy updates needed (`statSeries` counts
  derive from the same filtered list).

## Out of scope

- Writing the 10 posts (each is a later batch, following the book-to-post/enrich flow).
- Quiz pages, hero images, per-post cover art.
- The "book-to-post" series page: this series is not book-based, so the cover page will
  show the mixed-source credit instead of a single-book credit line.
