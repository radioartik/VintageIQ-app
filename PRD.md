# Product Requirements Document (PRD): VintageIQ v3.0

## 1. Executive Summary
**Project Name:** VintageIQ  
**Version:** 3.0  
**Status:** MVP / Prototype  
**Concept:** A high-performance, institutional-grade portfolio monitoring platform designed specifically for Family Offices and High-Net-Worth Individuals (HNWIs). VintageIQ centralizes complex alternative investments (PE/VC/RE), public equities, and fixed income into a unified dashboard with zero external dependencies.

---

## 2. Problem Statement
Family offices currently manage billions in assets using "Excel sprawl"—fragmented spreadsheets that are:
1. **Error-prone**: Manual IRR and TVPI calculations often contain formula errors.
2. **Lagging**: Performance data for private funds is often buried in PDFs and not easily visualized.
3. **Fragmented**: No single view exists for combined public equity risk and private equity J-curve metrics.
4. **Desktop-bound**: Legacy tools do not provide a premium, mobile-first experience for principals on the move.

---

## 3. Goals & Objectives
*   **Centralization**: Consolidate 100+ multi-asset holdings into a single source of truth.
*   **High Performance**: Achieve sub-second page loads using a lightweight, dependency-free architecture.
*   **Transparency**: Standardize complex performance metrics (XIRR, DPI, TVPI) across all asset classes.
*   **Mobile Readiness**: Provide a "C-suite ready" interface optimized for high-end mobile devices.

---

## 4. Target Audience
*   **CIO / Portfolio Manager**: Needs deep-dive analytics, attribution, and risk metrics.
*   **Family Principal**: Needs high-level AUM tracking, liquidity status, and mobile access.
*   **Analysts**: Need a structured repository for capital calls and quarterly letters.

---

## 5. Functional Requirements

### 5.1. Multi-Asset Portfolio Management
*   **Fund Vault**: Tracking for 30 private funds with automated J-curve generation.
*   **Equity Intelligence**: Management of 55+ direct equity positions with annualized return attribution.
*   **Bond Ledger**: Tracking of 10+ fixed income instruments with Yield-To-Maturity (YTM) modeling.
*   **Alternatives Tracker**: Valuation tracking for Art, Wine, Real Assets, and Crypto.

### 5.2. Analytics Engine
*   **XIRR Calculation**: Time-weighted internal rate of return using Newton-Raphson approximation.
*   **Multi-Tier Performance**: Automated calculation of YTD, 1Y, 3Y, 5Y, and Since Inception returns.
*   **Cash Flow Waterfall**: Visualization of portfolio bridges (Inflows, Gains, Distributions, Income).

### 5.3. User Interface (UI/UX)
*   **9 Core Views**: Dashboard, Holdings, Performance, Liquidity, Risk, Exposure, Attribution, Leverage, and Governance.
*   **Mobile Navigation**: Adaptive hamburger menu with a slide-in drawer layout.
*   **Interactive Visualization**: Custom SVG-based line, bar, and waterfall charts with real-time tooltips.

### 5.4. Document Management
*   **The Vault**: A centralized repository for capital account statements, audited financials, and K-1 tax documents.

---

## 6. Technical Requirements
*   **Tech Stack**: Vanilla HTML5, CSS3 (variables/grid), and ES6+ JavaScript.
*   **External Dependencies**: Zero (0).
*   **Data Strategy**: Seeded deterministic PRNG for stable, high-fidelity mock data generation.
*   **Architecture**: Modular "View-Render" pattern with state-based client-side routing.
*   **Schema**: Backend-ready JSDoc types mapping to a future SQL/API layer.

---

## 7. Roadmap

### Phase 1: Foundation (Current)
*   100+ Holdings Dataset.
*   Annualized Returns Logic.
*   Mobile-First UI Overhaul.
*   Backend-ready Schema Documentation.

### Phase 2: Interactivity & Persistence
*   CSV/Excel Import Engine.
*   Local persistence via IndexedDB / LocalStorage.
*   Live market data integration via WebSockets.

### Phase 3: Reporting & Compliance
*   Automated PDF Quarterly Board Deck generation.
*   Multi-currency (EUR/GBP) support with real-time FX hedging visualization.
*   Role-Based Access Control (RBAC) frontend logic.

---

## 8. Success Metrics
*   **Performance**: Dashboards must load in under 200ms.
*   **Accuracy**: Calculated IRR must match Excel XIRR within 0.01%.
*   **Usability**: Zero scroll-bars on mobile (except for data tables).

---

## 9. Governance & Compliance
*   Standardized ESG Composite Scoring.
*   Compliance Checklist for regulatory filings.
*   Audit trail preparation for transactions.

---
*Document generated on: 2026-02-15*
