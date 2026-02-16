# VintageIQ Migration Gap Analysis
## Vanilla (vacant-eclipse) → Next.js (vintageiq-next)

---

## 🔴 CRITICAL: Missing Features (Functional Gaps)

### 1. Fund Detail View (`renderFundDetail`)
**Status: NOT MIGRATED**
The vanilla app has a **full fund detail page** accessible by clicking any fund row. It includes:
- Back button navigation
- Fund metadata header (name, status badge, type, strategy, vintage, geography)
- Action buttons ("Upload Document", "Record Transaction")
- **7 stat cards**: Commitment, Paid-In, Current NAV, Distributions, Net IRR, Total Value, TVPI/DPI/RVPI
- **NAV History line chart** with interactive tooltips (SVG)
- **Recent Transactions table** (capital calls, distributions, exits)
- **Documents & Files section** with doc list and upload zone
- **Route**: In vanilla, this is `renderFundDetail(fundId)` triggered by row click; needs `/holdings/[fundId]/page.tsx`

### 2. Stock Detail View (`renderStockDetail`)
**Status: NOT MIGRATED**
The vanilla app has a **full stock detail page** accessible by clicking any stock row. It includes:
- Back button navigation
- Stock metadata header (ticker, name, active badge, sector, strategy, acquired year)
- "Trade" action button
- **4 stat cards**: Market Value, Cost Basis, Unrealized P&L, Dividend Income
- **Price History line chart** with interactive tooltips (SVG)
- **Returns by Period table**: YTD, 1Y, 3Y CAGR, 5Y CAGR, Since Inception, Total Return
- **Position & Income table**: Shares, Price, Avg Cost, Holding Period, Portfolio Weight, Dividend details
- **Route**: Needs `/equities/[ticker]/page.tsx`

### 3. Interactive Chart Tooltips
**Status: NOT MIGRATED**
The vanilla app has **interactive SVG charts** with:
- **Line chart tooltips**: Hover to see value at any point, with animated dot tracking
- **Bar chart tooltips**: Hover over any bar to see its value
- **Stacked bar chart tooltips**: Hover over segments to see component values
- The Next.js version uses static bar/SVG renders without any tooltip or hover interactivity

### 4. Glossary Tooltips (`ⓘ` info triggers)
**Status: NOT MIGRATED**
The vanilla app displays `ⓘ` icons next to financial terms (IRR, NAV, MOIC, PME, TVPI, LTV, ISCR, LCR) that show tooltip definitions on hover. This uses a `tip()` helper and the `data-tip` attribute with CSS `::after` pseudo-element. The glossary data exists in the data generator but is never used in the Next.js pages.

---

## 🟡 PARTIAL: Missing Sub-Features on Existing Pages

### 5. Dashboard — Missing Sections
The vanilla Dashboard has these sections that are missing from the Next.js version:

| Sub-section | Vanilla | Next.js |
|---|---|---|
| "As of Q1 2025" period selector | ✅ Dropdown | ❌ Missing |
| "Generate Report" button | ✅ Links to report | ❌ Missing |
| AUM Growth — SVG line chart | ✅ Interactive SVG chart | ⚠️ Replaced with bar indicators |
| Portfolio Metrics compact panel (IRR, TVPI, Equity Return, Bond Income) | ✅ 4-cell grid | ❌ Missing |
| Realized vs. Unrealized progress bars | ✅ With exited funds count | ❌ Missing |

### 6. Fund Holdings — Missing Sections
| Sub-section | Vanilla | Next.js |
|---|---|---|
| Filter dropdown (All/Active/Exited) | ✅ | ❌ Missing |
| "Export CSV" button | ✅ | ❌ Missing |
| Table footer with totals row | ✅ Bold totals for all columns | ❌ Missing |
| **Row click → Fund Detail** | ✅ Navigates to detail view | ❌ Not wired |
| "Top 5 by IRR" progress bars card | ✅ | ❌ Missing |
| "Losses & Write-Offs" card | ✅ | ❌ Missing |

### 7. Equities — Missing Sections
| Sub-section | Vanilla | Next.js |
|---|---|---|
| Header stats ("20 positions", "+$XM P&L") | ✅ Inline badges | ❌ Missing |
| "Export CSV" button | ✅ | ❌ Missing |
| Table footer with totals row | ✅ | ❌ Missing |
| **Row click → Stock Detail** | ✅ Navigates to detail view | ❌ Not wired |
| "Top 5 Winners" progress bars | ✅ | ❌ Missing |
| "Loss Positions" progress bars | ✅ | ❌ Missing |
| Sector Allocation progress bars | ✅ | ❌ Missing |

### 8. Leverage — Missing Sections
| Sub-section | Vanilla | Next.js |
|---|---|---|
| Debt maturity bar chart | ✅ Interactive with tooltips | ⚠️ Static bars, no tooltips |
| Loan facilities table | ❌ Not in vanilla | ✅ In Next.js (enhanced) |
| Covenant compliance | ❌ Not in vanilla | ✅ In Next.js (enhanced) |
| Interest rate sensitivity | ❌ Not in vanilla | ✅ In Next.js (enhanced) |

---

## 🟢 NOT MISSING: Sections Present or Enhanced in Next.js

These are areas where the Next.js version matches or exceeds the vanilla:

| View | Status |
|---|---|
| Performance — Equity returns table | ✅ Full parity |
| Performance — Annual returns bar chart | ✅ |
| Performance — YTD Waterfall | ✅ |
| Performance — Cash flow breakdown table | ✅ |
| Performance — Strategy benchmarking | ✅ |
| Liquidity — KPIs, buckets, capital calls | ✅ |
| Risk — KPIs, drawdown, concentration, asset class risk, VaR | ✅ Enhanced |
| Exposure — Allocation, geo, sector, vintage, strategy table | ✅ |
| Attribution — Return attribution, fees, income | ✅ |
| Governance — Compliance, ESG, deadlines, doc vault | ✅ Enhanced |
| Quarterly Report — Full report | ✅ |

---

## 🔵 STYLING: Vanilla Design Features Not Yet Ported

### 9. Navigation Grouping
The vanilla sidebar groups nav items under section headers:
- **Core**: Dashboard, Fund Holdings, Equity Holdings, Performance, Liquidity
- **Analysis**: Risk, Exposure, Attribution & Fees
- **Structure**: Leverage, Governance
- **Reports**: Quarterly Report

The Next.js sidebar has a flat list without these groupings.

### 10. Sidebar "Family Office Alpha" → "Family Office"
The vanilla footer shows "Family Office Alpha" with "Administrator" role. Next.js shows "Family Office" with "CIO Access".

### 11. Table Sticky Headers
The vanilla CSS includes `position: sticky; top: 0;` for table headers. This is useful for long scrollable tables.

### 12. View Transition Animation
The vanilla app fades views in/out with `opacity: 0` → `1` transitions. Not present in Next.js (Next.js handles page transitions differently via loading states).

---

## 📊 Summary: Priority Order

| Priority | Gap | Effort | Impact |
|---|---|---|---|
| 🔴 P0 | Fund Detail View | High | Critical — core user workflow |
| 🔴 P0 | Stock Detail View | High | Critical — core user workflow |
| 🟡 P1 | Holdings page totals row + Top 5/Losses cards | Medium | Important data visibility |
| 🟡 P1 | Equities page totals, winners/losers, sectors | Medium | Important data visibility |
| 🟡 P1 | Dashboard missing sections (metrics, realized/unrealized) | Medium | Dashboard completeness |
| 🟡 P2 | Glossary tooltips (ⓘ) | Low | Nice to have |
| 🟡 P2 | Interactive chart tooltips | Medium | Polish |
| 🟢 P3 | Sidebar nav grouping | Low | Visual organization |
| 🟢 P3 | Filter dropdowns / Export CSV | Low | Non-functional in vanilla too |
| 🟢 P3 | View transitions | Low | Already handled by Next.js |

---

*Analysis performed: Feb 15, 2025*
*Files compared: app.js (826 lines), index.css (1249 lines), index.html (88 lines)*
