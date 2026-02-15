# VintageIQ — Family Office Portfolio Platform (v3.0)

> **Institutional-grade portfolio monitoring, analytics, and reporting.**
> $1.1B+ AUM | 100+ Holdings | 15-Year History (2010–2025)

---

## 🏛️ Project Mission
VintageIQ is a high-performance wealth management platform built for family offices. It solves the "Excel sprawl" problem by centralizing alternative investments, liquid equities, and fixed income into a single source of truth with institutional-grade performance metrics.

**Zero Dependencies.** Powered by Vanilla JS, CSS, and HTML. Blazing fast. 100% Client-Side.

---

## 📊 The "100+ Holdings" Dataset
The platform includes a deterministic, high-fidelity mock portfolio featuring:
- **30 Funds**: Private Equity (KKR, Blackstone, etc.), Venture Capital (a16z, Sequoia, etc.), Real Estate, and Private Credit.
- **55 Individual Stocks**: A diversified US equity portfolio with 12+ years of historical price data.
- **10 Direct Bonds**: US Treasuries and Corporate debt with live YTM calculations.
- **8 Alternative Assets**: From Blue Chip Art and Vintage Wine to Napa Vineyards and Physical Gold.

### Advanced Performance Modeling
- **Annualized Returns**: Full time-period analysis (YTD, 1Y, 3Y, 5Y, Since Inception) using value-weighted CAGR.
- **Fund Metrics**: Real-time calculation of **IRR (XIRR)**, MOIC, TVPI, DPI, and RVPI.
- **Cash Flow Waterfall**: Bridge waterfall chart modeling quarterly flows (injections, gains, distributions, income).
- **J-Curve Analysis**: Realized vs. Unrealized gain tracking across the full 15-year fund lifecycle.

---

## 🚀 Key Features

### 🖥️ 9 Core Dashboards
- **Portfolio Overview**: High-level AUM, allocation, and growth tracking.
- **Equity Intelligence**: Detailed breakdown of 55 stocks by sector, strategy, and annualized return period.
- **Fund Vault**: Full transparency into 30 private funds with J-curve charts and document management.
- **Performance Benchmarking**: Strategy-level alpha vs. benchmarks (S&P 500, Cambridge PE Index).
- **Liquidity & Cash Flow**: YTD Waterfall charts and 15-year cumulative cash flow analysis.
- **Quarterly Report**: Board-ready deck generation with high-fidelity print styles.

### 📱 Responsive & Mobile-First
- Custom **Hamburger Navigation** and slide-in drawer for phone/tablet.
- **Horizontal Scrolling Tables** with momentum scrolling for data-heavy views.
- **Touch-Optimized** tap targets (44px min) and responsive chart scaling.

### 🏗️ Backend-Ready Architecture
- **Documented Schema**: `data.js` includes full JSDoc @typedefs mapping every front-end field to future SQL/API endpoints.
- **Seeded PRNG**: Deterministic data generation for consistent testing.

---

## 🛠️ Tech Stack
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid, View Transitions).
- **Logic**: Vanilla ES6+ JavaScript.
- **Charts**: Custom-built SVG & HTML Canvas renderers (0 dependencies).
- **Navigation**: Client-side state-based routing.

---

## 📋 Roadmap
- [x] **v3.0**: 100+ Holdings + Annualized Stock Returns + Mobile UI
- [x] **Cash Flow Waterfall**: Running total bridge chart for YTD flows
- [ ] **Data Persistence**: IndexedDB / LocalStorage for user-saved portfolios
- [ ] **Excel/CSV Import**: Auto-map columns to the internal schema
- [ ] **Live Market Data**: WebSocket integration for real-time stock pricing
- [ ] **AI Portfolio Analyst**: LLM-driven commentary on risk and performance

---

*Built with ❤️ by a 6-agent AI SDLC Framework (PM, Architect, Engineer, Vibe Master, QA, Data Analyst).*

**© 2026 VintageIQ | Family Office Intelligence**
