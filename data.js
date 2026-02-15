/**
 * VintageIQ — Data Engine v3.0
 * 100+ Holdings | 15-Year History (2010-2025)
 * 30 Funds + 55 Stocks + 10 Bonds + 8 Alternatives + Cash
 *
 * ═══════════════════════════════════════════════════════════
 *  BACKEND INTEGRATION SCHEMA
 * ═══════════════════════════════════════════════════════════
 *
 * This file exports a single global `window.PortfolioData` object.
 * When migrating to a backend, each top-level key maps to an
 * API endpoint or database table:
 *
 *  KEY                  → ENDPOINT / TABLE         DESCRIPTION
 *  ─────────────────────────────────────────────────────────
 *  funds[]              → /api/funds               All fund holdings (PE, VC, RE, etc.)
 *  stocks[]             → /api/stocks              Direct equity positions (55 US stocks)
 *  bonds[]              → /api/bonds               Fixed income holdings (10 bonds)
 *  alternatives[]       → /api/alternatives         Alt investments (art, wine, gold, etc.)
 *  cashPosition         → /api/cash                Cash & money market balance
 *  history.yearly[]     → /api/history/yearly       Annual AUM & cash flow history
 *  history.ytdWaterfall  → /api/history/ytd         YTD cash flow waterfall data
 *
 *  AGGREGATES (computed, can be derived or cached):
 *  currentAUM           → Total assets under management ($)
 *  totalCommitment      → Sum of all fund commitments ($)
 *  totalPaidIn          → Sum of all capital called ($)
 *  totalDistributions   → Sum of all distributions received ($)
 *  totalUnfunded        → Unfunded commitments remaining ($)
 *  fundNAV              → Sum of active fund NAVs ($)
 *  totalStockValue      → Sum of equity market values ($)
 *  totalStockCost       → Sum of equity cost bases ($)
 *  totalStockGL         → Unrealized stock gains/losses ($)
 *  totalDividendIncome  → Est. annual dividend income ($)
 *  totalBondValue       → Sum of bond market values ($)
 *  totalBondIncome      → Annual bond coupon income ($)
 *  totalAltsValue       → Sum of alternative values ($)
 *
 *  PERFORMANCE METRICS (computed):
 *  portfolioIRR         → Weighted fund IRR (decimal, e.g., 0.16 = 16%)
 *  portfolioMOIC        → Portfolio MOIC (multiple, e.g., 1.8x)
 *  portfolioDPI         → Distribution to Paid-In ratio
 *  portfolioTVPI        → Total Value to Paid-In ratio
 *  portfolioRVPI        → Residual Value to Paid-In ratio
 *  eqReturnYTD          → Value-weighted equity YTD return (decimal, nullable)
 *  eqReturn1Y           → Value-weighted equity 1Y return (decimal, nullable)
 *  eqReturn3Y           → Value-weighted equity 3Y CAGR (decimal, nullable)
 *  eqReturn5Y           → Value-weighted equity 5Y CAGR (decimal, nullable)
 *  eqReturnSI           → Value-weighted equity Since Inception CAGR (decimal)
 *  realizedGains        → Total realized gains from exits ($)
 *  unrealizedGains      → Total unrealized gains ($)
 *
 *  REFERENCE DATA:
 *  allocation[]         → Asset allocation breakdown (type, pct, value, color)
 *  stockSectors[]       → Equity sector breakdown (sector, value, pct)
 *  assetNames{}         → Map of type codes → display names
 *  assetColors{}        → Map of type codes → hex colors
 *  glossary{}           → Financial term definitions
 * ═══════════════════════════════════════════════════════════
 */
function seededRandom(seed) {
    let s = seed;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const rand = seededRandom(42);

function calcIRR(cf) {
    if (!cf || cf.length < 2) return 0;
    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
        let npv = 0, dnpv = 0;
        const t0 = cf[0].date.getTime();
        for (const c of cf) {
            const y = (c.date.getTime() - t0) / (365.25 * 864e5);
            const d = Math.pow(1 + rate, y);
            npv += c.amount / d;
            dnpv -= y * c.amount / (d * (1 + rate));
        }
        if (Math.abs(npv) < 0.01) break;
        if (Math.abs(dnpv) < 1e-10) break;
        rate -= npv / dnpv;
        if (rate < -0.99) rate = -0.5;
        if (rate > 10) rate = 2;
    }
    return rate;
}

// ═══════════════════════════════════════
//  FUND DATABASE (30 funds)
//  Backend Table: funds
// ═══════════════════════════════════════
/**
 * @typedef {Object} FundInput
 * @property {string}  id          - Unique fund ID (e.g., 'PE001')
 * @property {string}  name        - Full fund name
 * @property {string}  type        - Asset class code: PE|VC|RE|PC|EQ_FUNDS|PUBLIC_EQ|BONDS|CRYPTO|HEDGE
 * @property {string}  strategy    - Investment strategy (e.g., 'Buyout', 'Growth')
 * @property {number}  vintage     - Vintage year (YYYY)
 * @property {number}  commitment  - Total commitment in USD (e.g., 50e6 = $50M)
 * @property {string}  status      - 'Active' | 'Exited' | 'Written Off'
 * @property {number}  [exitYear]  - Year of exit (only for exited funds)
 * @property {string}  geography   - Geographic focus
 * @property {string}  sector      - Sector focus
 * @property {boolean} [isLoss]    - True if fund is underperforming / partial loss
 * @property {boolean} [totalLoss] - True if fund is a complete write-off
 */
const FUNDS_DB = [
    // Private Equity
    { id: 'PE001', name: 'KKR North America XII', type: 'PE', strategy: 'Buyout', vintage: 2012, commitment: 50e6, status: 'Exited', exitYear: 2019, geography: 'North America', sector: 'Industrials' },
    { id: 'PE002', name: 'Blackstone Capital Partners VII', type: 'PE', strategy: 'Buyout', vintage: 2015, commitment: 45e6, status: 'Active', geography: 'Global', sector: 'Technology' },
    { id: 'PE003', name: 'Apollo Investment Fund IX', type: 'PE', strategy: 'Distressed', vintage: 2017, commitment: 40e6, status: 'Active', geography: 'North America', sector: 'Financial Services' },
    { id: 'PE004', name: 'Carlyle Partners VII', type: 'PE', strategy: 'Buyout', vintage: 2018, commitment: 35e6, status: 'Active', geography: 'North America', sector: 'Healthcare' },
    { id: 'PE005', name: 'Warburg Pincus Global Growth', type: 'PE', strategy: 'Growth Equity', vintage: 2020, commitment: 30e6, status: 'Active', geography: 'Global', sector: 'Technology' },
    { id: 'PE006', name: 'TPG Rise Climate Fund', type: 'PE', strategy: 'Impact', vintage: 2021, commitment: 25e6, status: 'Active', geography: 'Global', sector: 'Energy Transition' },
    { id: 'PE007', name: 'Silver Lake Partners VI', type: 'PE', strategy: 'Tech Buyout', vintage: 2019, commitment: 38e6, status: 'Active', geography: 'North America', sector: 'Technology' },
    // Venture Capital
    { id: 'VC001', name: 'Sequoia Capital Growth III', type: 'VC', strategy: 'Growth', vintage: 2014, commitment: 20e6, status: 'Exited', exitYear: 2021, geography: 'North America', sector: 'Technology' },
    { id: 'VC002', name: 'Andreessen Horowitz Fund V', type: 'VC', strategy: 'Multi-Stage', vintage: 2018, commitment: 25e6, status: 'Active', geography: 'North America', sector: 'Software' },
    { id: 'VC003', name: 'Benchmark Capital Partners X', type: 'VC', strategy: 'Early Stage', vintage: 2019, commitment: 18e6, status: 'Active', geography: 'North America', sector: 'Consumer Tech' },
    { id: 'VC004', name: 'Accel Growth Fund IV', type: 'VC', strategy: 'Growth', vintage: 2021, commitment: 15e6, status: 'Active', geography: 'Global', sector: 'Enterprise SaaS' },
    { id: 'VC005', name: 'Tiger Global Fund XV', type: 'VC', strategy: 'Late Stage', vintage: 2021, commitment: 22e6, status: 'Active', geography: 'Global', sector: 'Technology', isLoss: true },
    // Real Estate
    { id: 'RE001', name: 'Blackstone Real Estate IX', type: 'RE', strategy: 'Opportunistic', vintage: 2016, commitment: 45e6, status: 'Active', geography: 'North America', sector: 'Commercial RE' },
    { id: 'RE002', name: 'Brookfield Strategic RE III', type: 'RE', strategy: 'Value-Add', vintage: 2018, commitment: 35e6, status: 'Active', geography: 'Global', sector: 'Mixed Use' },
    { id: 'RE003', name: 'Starwood Opportunity XII', type: 'RE', strategy: 'Opportunistic', vintage: 2020, commitment: 25e6, status: 'Active', geography: 'North America', sector: 'Hospitality', isLoss: true },
    { id: 'RE004', name: 'Prologis Targeted US Fund', type: 'RE', strategy: 'Core-Plus', vintage: 2013, commitment: 30e6, status: 'Exited', exitYear: 2020, geography: 'North America', sector: 'Logistics' },
    // Private Credit
    { id: 'PC001', name: 'Ares Direct Lending V', type: 'PC', strategy: 'Direct Lending', vintage: 2019, commitment: 30e6, status: 'Active', geography: 'North America', sector: 'Diversified' },
    { id: 'PC002', name: 'Oaktree Opportunities XI', type: 'PC', strategy: 'Distressed', vintage: 2020, commitment: 25e6, status: 'Active', geography: 'Global', sector: 'Special Situations' },
    { id: 'PC003', name: 'Apollo Hybrid Value Fund', type: 'PC', strategy: 'Mezzanine', vintage: 2021, commitment: 20e6, status: 'Active', geography: 'North America', sector: 'Diversified' },
    // Equity & Bond Funds
    { id: 'EQ001', name: 'Vanguard Total Stock Market (VTI)', type: 'EQ_FUNDS', strategy: 'Passive Index', vintage: 2010, commitment: 50e6, status: 'Active', geography: 'North America', sector: 'Broad Market' },
    { id: 'EQ002', name: 'Fidelity Contrafund', type: 'EQ_FUNDS', strategy: 'Active Growth', vintage: 2011, commitment: 35e6, status: 'Active', geography: 'North America', sector: 'Large Cap Growth' },
    { id: 'EQ003', name: 'T. Rowe Price Global Tech', type: 'EQ_FUNDS', strategy: 'Sector', vintage: 2016, commitment: 30e6, status: 'Active', geography: 'Global', sector: 'Technology' },
    { id: 'PUB001', name: 'MSCI World ex-US ETF (VXUS)', type: 'PUBLIC_EQ', strategy: 'Passive Intl', vintage: 2012, commitment: 25e6, status: 'Active', geography: 'International', sector: 'Broad Market' },
    { id: 'BD001', name: 'PIMCO Total Return Fund', type: 'BONDS', strategy: 'Core Fixed Income', vintage: 2010, commitment: 40e6, status: 'Active', geography: 'North America', sector: 'Investment Grade' },
    { id: 'BD002', name: 'Vanguard Total Bond (BND)', type: 'BONDS', strategy: 'Passive Index', vintage: 2010, commitment: 35e6, status: 'Active', geography: 'North America', sector: 'Aggregate Bond' },
    // Crypto
    { id: 'CRY001', name: 'Bitcoin (Direct Custody)', type: 'CRYPTO', strategy: 'Direct', vintage: 2020, commitment: 15e6, status: 'Active', geography: 'Global', sector: 'Digital Assets' },
    { id: 'CRY002', name: 'FTX Venture Fund', type: 'CRYPTO', strategy: 'Venture', vintage: 2021, commitment: 8e6, status: 'Written Off', exitYear: 2022, geography: 'Global', sector: 'Digital Assets', isLoss: true, totalLoss: true },
    // Hedge Fund
    { id: 'HF001', name: 'Citadel Wellington Fund', type: 'HEDGE', strategy: 'Multi-Strategy', vintage: 2015, commitment: 30e6, status: 'Exited', exitYear: 2023, geography: 'Global', sector: 'Absolute Return' },
];

// ═══════════════════════════════════════
//  INDIVIDUAL US STOCKS (55 positions)
//  Backend Table: stocks
// ═══════════════════════════════════════
/**
 * Raw stock data: [ticker, name, sector, shares, avgCost, currentPrice, divYield%, acquired, strategy]
 *
 * Processed stock fields (see processStocks() return):
 * @typedef {Object} Stock
 * @property {string}  id              - Unique ID (e.g., 'STK-AAPL')
 * @property {string}  ticker          - Stock ticker symbol
 * @property {string}  name            - Company name
 * @property {string}  sector          - GICS sector
 * @property {number}  shares          - Number of shares held
 * @property {number}  avgCost         - Average cost per share ($)
 * @property {number}  currentPrice    - Current market price per share ($)
 * @property {number}  costBasis       - Total cost basis (shares × avgCost) ($)
 * @property {number}  marketValue     - Current market value (shares × currentPrice) ($)
 * @property {number}  unrealizedGL    - Unrealized gain/loss ($, positive = gain)
 * @property {number}  unrealizedPct   - Unrealized gain/loss as decimal (e.g., 0.25 = +25%)
 * @property {number}  divYield        - Annual dividend yield (%)
 * @property {number}  annualDividend  - Estimated annual dividend income ($)
 * @property {number}  acquired        - Year acquired (YYYY)
 * @property {string}  strategy        - 'Core' | 'Tactical' | 'Income' | 'Speculative'
 * @property {number|null} returnYTD   - YTD return (decimal, not annualized). Null if no YTD data.
 * @property {number|null} return1Y    - 1-year return (decimal). Null if held < 1 year.
 * @property {number|null} return3Y    - 3-year CAGR (decimal). Null if held < 3 years.
 * @property {number|null} return5Y    - 5-year CAGR (decimal). Null if held < 5 years.
 * @property {number}  returnSI        - Since-inception annualized CAGR (decimal)
 * @property {number}  totalReturn     - Cumulative total return (decimal, e.g., 1.5 = +150%)
 * @property {Array}   priceHistory    - Quarterly prices: [{year, quarter, price}]
 * @property {string}  holdingType     - Always 'stock'
 */
const STOCKS_RAW = [
    ['AAPL', 'Apple Inc.', 'Technology', 45000, 21.50, 228.00, 0.44, 2013, 'Core'],
    ['MSFT', 'Microsoft Corp', 'Technology', 18000, 42.00, 415.00, 0.72, 2014, 'Core'],
    ['AMZN', 'Amazon.com', 'Technology', 32000, 68.00, 215.00, 0, 2016, 'Core'],
    ['GOOGL', 'Alphabet Inc.', 'Technology', 38000, 32.00, 178.00, 0.45, 2015, 'Core'],
    ['NVDA', 'NVIDIA Corp', 'Technology', 50000, 12.50, 132.00, 0.03, 2019, 'Core'],
    ['META', 'Meta Platforms', 'Technology', 14000, 165.00, 590.00, 0.36, 2018, 'Core'],
    ['BRK.B', 'Berkshire Hathaway', 'Financials', 18000, 210.00, 455.00, 0, 2016, 'Core'],
    ['JPM', 'JPMorgan Chase', 'Financials', 28000, 92.00, 248.00, 2.10, 2017, 'Core'],
    ['V', 'Visa Inc.', 'Financials', 18000, 115.00, 310.00, 0.75, 2017, 'Core'],
    ['UNH', 'UnitedHealth Group', 'Healthcare', 10000, 195.00, 525.00, 1.40, 2018, 'Core'],
    ['LLY', 'Eli Lilly & Co', 'Healthcare', 5500, 280.00, 820.00, 0.62, 2021, 'Tactical'],
    ['AVGO', 'Broadcom Inc.', 'Technology', 20000, 65.00, 228.00, 1.25, 2020, 'Tactical'],
    ['COST', 'Costco Wholesale', 'Consumer', 4500, 450.00, 920.00, 0.53, 2022, 'Core'],
    ['MA', 'Mastercard Inc.', 'Financials', 8000, 285.00, 520.00, 0.57, 2020, 'Core'],
    ['HD', 'Home Depot', 'Consumer', 10000, 265.00, 395.00, 2.35, 2019, 'Core'],
    ['JNJ', 'Johnson & Johnson', 'Healthcare', 22000, 135.00, 155.00, 3.10, 2018, 'Income'],
    ['PG', 'Procter & Gamble', 'Consumer', 20000, 120.00, 165.00, 2.40, 2019, 'Income'],
    ['CRM', 'Salesforce Inc.', 'Technology', 10000, 175.00, 330.00, 0.56, 2020, 'Tactical'],
    ['ADBE', 'Adobe Inc.', 'Technology', 7000, 310.00, 475.00, 0, 2021, 'Tactical'],
    ['NFLX', 'Netflix Inc.', 'Technology', 3500, 350.00, 920.00, 0, 2020, 'Tactical'],
    ['XOM', 'ExxonMobil Corp', 'Energy', 28000, 82.00, 112.00, 3.40, 2020, 'Income'],
    ['KO', 'Coca-Cola Co', 'Consumer', 48000, 48.00, 62.00, 2.90, 2017, 'Income'],
    ['PEP', 'PepsiCo Inc.', 'Consumer', 18000, 125.00, 155.00, 2.75, 2019, 'Income'],
    ['AMD', 'AMD Inc.', 'Technology', 22000, 85.00, 115.00, 0, 2021, 'Tactical'],
    ['TSLA', 'Tesla Inc.', 'Technology', 8000, 205.00, 350.00, 0, 2021, 'Tactical'],
    ['CVX', 'Chevron Corp', 'Energy', 14000, 98.00, 155.00, 4.10, 2020, 'Income'],
    ['WMT', 'Walmart Inc.', 'Consumer', 22000, 72.00, 92.00, 1.30, 2021, 'Core'],
    ['TMO', 'Thermo Fisher', 'Healthcare', 3500, 410.00, 560.00, 0.23, 2022, 'Tactical'],
    ['ACN', 'Accenture plc', 'Technology', 5000, 280.00, 360.00, 1.55, 2021, 'Tactical'],
    ['GS', 'Goldman Sachs', 'Financials', 3000, 320.00, 580.00, 2.15, 2022, 'Tactical'],
    ['ISRG', 'Intuitive Surgical', 'Healthcare', 3200, 310.00, 545.00, 0, 2022, 'Tactical'],
    ['CAT', 'Caterpillar Inc.', 'Industrials', 4500, 245.00, 375.00, 1.55, 2022, 'Tactical'],
    ['NOW', 'ServiceNow Inc.', 'Technology', 1800, 520.00, 950.00, 0, 2023, 'Tactical'],
    ['ORCL', 'Oracle Corp', 'Technology', 9500, 88.00, 175.00, 1.15, 2021, 'Tactical'],
    ['TXN', 'Texas Instruments', 'Technology', 8500, 155.00, 185.00, 2.80, 2022, 'Income'],
    ['QCOM', 'Qualcomm Inc.', 'Technology', 9000, 128.00, 165.00, 2.05, 2022, 'Income'],
    ['UNP', 'Union Pacific', 'Industrials', 6000, 195.00, 240.00, 2.10, 2022, 'Income'],
    ['HON', 'Honeywell Intl', 'Industrials', 6500, 185.00, 215.00, 2.00, 2023, 'Income'],
    ['GE', 'GE Aerospace', 'Industrials', 7500, 108.00, 185.00, 0.62, 2023, 'Tactical'],
    ['ABBV', 'AbbVie Inc.', 'Healthcare', 7800, 145.00, 175.00, 3.45, 2022, 'Income'],
    ['DIS', 'Walt Disney Co', 'Consumer', 9500, 95.00, 112.00, 0.82, 2023, 'Tactical'],
    ['SBUX', 'Starbucks Corp', 'Consumer', 10000, 82.00, 98.00, 2.45, 2023, 'Income'],
    ['COIN', 'Coinbase Global', 'Technology', 3500, 68.00, 260.00, 0, 2023, 'Speculative'],
    ['PLTR', 'Palantir Tech', 'Technology', 12000, 15.00, 78.00, 0, 2023, 'Speculative'],
    ['UBER', 'Uber Technologies', 'Technology', 11000, 42.00, 78.00, 0, 2023, 'Tactical'],
    ['PANW', 'Palo Alto Networks', 'Technology', 4500, 175.00, 185.00, 0, 2024, 'Tactical'],
    // Loss positions
    ['NKE', 'Nike Inc.', 'Consumer', 8500, 165.00, 72.00, 1.75, 2021, 'Core'],
    ['BA', 'Boeing Co', 'Industrials', 3200, 340.00, 175.00, 0, 2018, 'Tactical'],
    ['INTC', 'Intel Corp', 'Technology', 25000, 52.00, 20.00, 1.60, 2019, 'Core'],
    ['T', 'AT&T Inc.', 'Telecom', 28000, 32.00, 22.00, 6.50, 2020, 'Income'],
    ['VZ', 'Verizon Comm', 'Telecom', 15000, 55.00, 42.00, 6.35, 2021, 'Income'],
    ['F', 'Ford Motor Co', 'Industrials', 45000, 14.00, 11.00, 4.80, 2021, 'Tactical'],
    ['RIVN', 'Rivian Auto', 'Industrials', 8500, 85.00, 14.00, 0, 2021, 'Speculative'],
    ['SNOW', 'Snowflake Inc.', 'Technology', 3500, 215.00, 170.00, 0, 2022, 'Speculative'],
    ['SQ', 'Block Inc.', 'Technology', 5500, 145.00, 82.00, 0, 2021, 'Speculative'],
];

// ═══════════════════════════════════════
//  INDIVIDUAL BONDS (10 positions)
//  Backend Table: bonds
// ═══════════════════════════════════════
/**
 * Raw bond data: [name, type, maturityYear, coupon%, faceValue, acquiredPrice, currentPrice, acquired]
 *
 * Processed bond fields (see processBonds() return):
 * @typedef {Object} Bond
 * @property {string}  id              - Unique ID (e.g., 'BND-1')
 * @property {string}  name            - Bond name / issuer
 * @property {string}  bondType        - 'UST' | 'CORP' | 'MUNI' | 'TIPS'
 * @property {number}  maturityYear    - Year of maturity (YYYY)
 * @property {number}  coupon          - Annual coupon rate (%)
 * @property {number}  faceValue       - Face/par value ($)
 * @property {number}  acquiredPrice   - Purchase price (as % of par, e.g., 99.50)
 * @property {number}  currentPrice    - Current price (as % of par)
 * @property {number}  acquired        - Year acquired (YYYY)
 * @property {number}  marketValue     - Current market value ($)
 * @property {number}  costBasis       - Purchase cost ($)
 * @property {number}  unrealizedGL    - Unrealized gain/loss ($)
 * @property {number}  annualIncome    - Annual coupon income ($)
 * @property {number}  yieldToMaturity - Yield to maturity (%)
 * @property {string}  holdingType     - Always 'bond'
 */
const BONDS_RAW = [
    ['US Treasury 10Y 4.25%', 'UST', 2034, 4.25, 10e6, 99.50, 98.20, 2024],
    ['US Treasury 30Y 4.75%', 'UST', 2054, 4.75, 8e6, 95.50, 93.80, 2024],
    ['US Treasury 2Y 4.50%', 'UST', 2027, 4.50, 12e6, 99.80, 99.90, 2025],
    ['Apple Corp 3.85% 2030', 'CORP', 2030, 3.85, 5e6, 97.50, 98.80, 2023],
    ['Microsoft Corp 3.50% 2029', 'CORP', 2029, 3.50, 5e6, 98.00, 99.20, 2023],
    ['JPMorgan 4.25% 2032', 'CORP', 2032, 4.25, 4e6, 96.80, 97.50, 2023],
    ['Goldman Sachs 4.50% 2031', 'CORP', 2031, 4.50, 3e6, 97.20, 98.10, 2022],
    ['California GO Muni 3.75% 2033', 'MUNI', 2033, 3.75, 5e6, 101.50, 102.00, 2023],
    ['New York GO Muni 3.50% 2032', 'MUNI', 2032, 3.50, 4e6, 100.80, 101.20, 2022],
    ['US TIPS 2.25% 2034', 'TIPS', 2034, 2.25, 6e6, 99.00, 100.50, 2024],
];

// ═══════════════════════════════════════
//  ALTERNATIVE INVESTMENTS (8 positions)
//  Backend Table: alternatives
// ═══════════════════════════════════════
/**
 * @typedef {Object} Alternative
 * @property {string}  id              - Unique ID (e.g., 'ALT-1')
 * @property {string}  name            - Asset description
 * @property {string}  type            - 'ART' | 'REAL_ASSET' | 'DIRECT_RE' | 'COLLECTIBLE' | 'COMMODITY'
 * @property {number}  value           - Current estimated value ($)
 * @property {number}  costBasis       - Original purchase cost ($)
 * @property {number}  acquired        - Year acquired (YYYY)
 * @property {number}  marketValue     - Same as value (for consistency) ($)
 * @property {number}  unrealizedGL    - Unrealized gain/loss ($)
 * @property {number}  unrealizedPct   - Unrealized gain/loss as decimal
 * @property {string}  holdingType     - Always 'alt'
 */
const ALTS_DB = [
    { name: 'Art Collection (Rothko, Basquiat)', type: 'ART', value: 12e6, costBasis: 6.5e6, acquired: 2016 },
    { name: 'Napa Valley Vineyard Estate', type: 'REAL_ASSET', value: 8.5e6, costBasis: 5.2e6, acquired: 2018 },
    { name: 'Aspen Ski Property', type: 'DIRECT_RE', value: 6.2e6, costBasis: 4.1e6, acquired: 2017 },
    { name: 'Vintage Car Collection', type: 'COLLECTIBLE', value: 3.8e6, costBasis: 2.4e6, acquired: 2015 },
    { name: 'Gold Bullion (Physical)', type: 'COMMODITY', value: 5e6, costBasis: 3.8e6, acquired: 2019 },
    { name: 'Private REIT: Student Housing', type: 'DIRECT_RE', value: 4.5e6, costBasis: 4e6, acquired: 2021 },
    { name: 'Timber & Farmland (OR)', type: 'REAL_ASSET', value: 3.2e6, costBasis: 2.8e6, acquired: 2020 },
    { name: 'Rare Wine Collection', type: 'COLLECTIBLE', value: 2.1e6, costBasis: 1.2e6, acquired: 2014 },
];

const ASSET_NAMES = {
    PE: 'Private Equity', VC: 'Venture Capital', RE: 'Real Estate', PC: 'Private Credit',
    EQ_FUNDS: 'Equity Funds', PUBLIC_EQ: 'Public Equities', BONDS: 'Bonds',
    CRYPTO: 'Crypto', HEDGE: 'Hedge Funds', DIRECT_EQ: 'Direct Equities',
    DIRECT_BONDS: 'Direct Bonds', ALTS: 'Alternatives', CASH: 'Cash'
};
const ASSET_COLORS = {
    PE: '#1B2A4A', VC: '#2563eb', RE: '#0d9488', PC: '#6366f1',
    EQ_FUNDS: '#3b82f6', PUBLIC_EQ: '#d97706', BONDS: '#8b5cf6',
    CRYPTO: '#f59e0b', HEDGE: '#0ea5e9', DIRECT_EQ: '#10b981',
    DIRECT_BONDS: '#a855f7', ALTS: '#ec4899', CASH: '#94a3b8'
};

// ═══════════════════════════════════════
//  FUND PERFORMANCE GENERATOR
//  Backend: /api/funds/:id (enriched fund data)
// ═══════════════════════════════════════
/**
 * Takes a FundInput and returns an enriched Fund object with calculated metrics.
 *
 * @typedef {Object} Fund (extends FundInput)
 * @property {number}  paidIn          - Total capital called / paid in ($)
 * @property {number}  unfunded        - Remaining unfunded commitment ($)
 * @property {number}  nav             - Current net asset value ($, 0 if exited)
 * @property {number}  distributions   - Total distributions received ($)
 * @property {number}  irr             - Internal rate of return (decimal, e.g., 0.18 = 18%)
 * @property {number}  moic            - Multiple on invested capital (e.g., 1.8)
 * @property {number}  dpi             - Distribution to Paid-In ratio
 * @property {number}  tvpi            - Total Value to Paid-In ratio
 * @property {number}  rvpi            - Residual Value to Paid-In ratio
 * @property {Array}   transactions    - Array of {date, type, amount, description}
 * @property {Array}   quarterlyNAVs   - Array of {date, nav} for J-curve chart
 * @property {Array}   documents       - Array of {name, date, type} for document vault
 * @property {string}  typeName        - Display name (e.g., 'Private Equity')
 * @property {string}  color           - Hex color for charts
 * @property {string}  holdingType     - Always 'fund'
 */
function generateFundPerformance(fund) {
    const currentYear = 2025;
    const isExited = fund.status === 'Exited' || fund.status === 'Written Off';
    let deployYears = fund.type === 'VC' ? 4 : fund.type === 'PE' ? 5 : 3;
    if (['EQ_FUNDS', 'PUBLIC_EQ', 'BONDS', 'HEDGE', 'CRYPTO'].includes(fund.type)) deployYears = 1;

    let baseReturn;
    if (fund.totalLoss) baseReturn = -1.0;
    else if (fund.isLoss) baseReturn = fund.type === 'VC' ? -0.35 : -0.18;
    else {
        const rm = { PE: 0.16, VC: 0.25, RE: 0.12, PC: 0.09, EQ_FUNDS: 0.11, PUBLIC_EQ: 0.08, BONDS: 0.035, CRYPTO: 0.40, HEDGE: 0.14 };
        baseReturn = (rm[fund.type] || 0.10) + (rand() - 0.5) * 0.06;
        if (fund.vintage >= 2015 && fund.vintage <= 2018) baseReturn += 0.02;
    }

    const transactions = [];
    let totalCalled = 0, totalDistributed = 0;
    const quarterlyNAVs = [];
    const startQ = fund.vintage, endQ = fund.exitYear || currentYear;

    for (let year = startQ; year <= endQ; year++) {
        for (let q = 1; q <= 4; q++) {
            if (year === startQ && q < 2) continue;
            if (year === endQ && year === currentYear && q > 1) break;
            const date = new Date(year, (q - 1) * 3, 15);
            const yearsIn = year - startQ + (q - 1) / 4;
            if (totalCalled < fund.commitment * 0.95 && yearsIn < deployYears + 1) {
                const callRate = ['EQ_FUNDS', 'PUBLIC_EQ', 'BONDS', 'HEDGE', 'CRYPTO'].includes(fund.type)
                    ? 0.8 + rand() * 0.2 : 0.04 + rand() * 0.06;
                const callAmt = Math.min(fund.commitment * callRate, fund.commitment - totalCalled);
                if (callAmt > 1e5) {
                    totalCalled += callAmt;
                    transactions.push({
                        date, type: 'Capital Call', amount: -callAmt,
                        description: `Capital Call #${transactions.filter(t => t.type === 'Capital Call').length + 1}`
                    });
                }
            }
            let navMul;
            if (fund.totalLoss) navMul = Math.max(0, 1 - yearsIn * 0.3);
            else if (fund.isLoss) navMul = 1 + baseReturn * yearsIn * 0.5;
            else {
                const jDip = ['PE', 'VC', 'RE'].includes(fund.type) ? -0.12 * Math.exp(-yearsIn * 0.8) : 0;
                navMul = 1 + baseReturn * yearsIn + jDip;
            }
            const curNAV = totalCalled * Math.max(navMul, 0);
            quarterlyNAVs.push({ date, nav: curNAV, year, quarter: q });
            // Distributions only for illiquid funds
            const isIlliquid = ['PE', 'VC', 'RE', 'PC'].includes(fund.type);
            if (isIlliquid && !fund.totalLoss && yearsIn > 3 && !fund.isLoss && rand() > 0.6) {
                const dist = curNAV * (0.02 + rand() * 0.05);
                if (dist > 5e5) {
                    totalDistributed += dist;
                    transactions.push({
                        date, type: 'Distribution', amount: dist,
                        description: yearsIn > 6 ? 'Return of Capital + Gains' : 'Interim Distribution'
                    });
                }
            }
            // Yield income for bonds and income-generating funds
            if (['BONDS'].includes(fund.type) && totalCalled > 0) {
                const yieldRate = 0.035 + rand() * 0.01;
                const income = totalCalled * yieldRate / 4;
                transactions.push({
                    date, type: 'Income', amount: income,
                    description: `Q${q} ${year} Coupon/Yield Income`
                });
            }
            if (totalCalled > 0) {
                const feeR = fund.type === 'VC' ? 0.025 : fund.type === 'PE' ? 0.02 : fund.type === 'HEDGE' ? 0.02 : 0.005;
                transactions.push({
                    date, type: 'Management Fee', amount: -(totalCalled * feeR / 4),
                    description: `Q${q} ${year} Management Fee`
                });
            }
            transactions.push({
                date, type: 'NAV Update', amount: 0, navValue: curNAV,
                description: `NAV as of Q${q} ${year}: $${(curNAV / 1e6).toFixed(1)}M`
            });
        }
    }

    if (isExited && !fund.totalLoss) {
        const exitDate = new Date(fund.exitYear, 9, 30);
        let exitMul;
        if (fund.isLoss) exitMul = 0.65 + rand() * 0.15;
        else if (fund.id === 'VC001') exitMul = 3.2;
        else if (fund.id === 'HF001') exitMul = 1.8;
        else if (fund.id === 'RE004') exitMul = 2.1;
        else exitMul = 1.5 + rand();
        const exitAmt = totalCalled * exitMul - totalDistributed;
        if (exitAmt > 0) {
            totalDistributed += exitAmt;
            transactions.push({
                date: exitDate, type: 'Exit / Realization', amount: exitAmt,
                description: `Full exit at ${exitMul.toFixed(1)}x MOIC`
            });
        }
    }

    const finalNAV = isExited ? 0 : (quarterlyNAVs.length > 0 ? quarterlyNAVs[quarterlyNAVs.length - 1].nav : 0);
    const paidIn = totalCalled, unfunded = Math.max(0, fund.commitment - totalCalled);
    const dpi = paidIn > 0 ? totalDistributed / paidIn : 0;
    const rvpi = paidIn > 0 ? finalNAV / paidIn : 0;
    const tvpi = dpi + rvpi, moic = tvpi;

    const irrFlows = transactions
        .filter(t => t.type === 'Capital Call' || t.type === 'Distribution' || t.type === 'Exit / Realization')
        .map(t => ({ date: t.date, amount: t.amount }));
    if (finalNAV > 0) irrFlows.push({ date: new Date(2025, 0, 15), amount: finalNAV });

    let irr;
    if (irrFlows.length < 2) irr = baseReturn;
    else if (fund.totalLoss) irr = -1.0;
    else {
        const inflows = irrFlows.filter(f => f.amount > 0).reduce((s, f) => s + f.amount, 0);
        if (inflows === 0) irr = -1.0;
        else {
            const c = calcIRR(irrFlows);
            irr = (isNaN(c) || c > 3.0 || c < -0.99) ? baseReturn : c;
        }
    }

    const documents = [
        { name: `${fund.name} - Capital Account Q1 2025.pdf`, date: '2025-01-31', type: 'Statement' },
        { name: `${fund.name} - Audited Financials 2024.pdf`, date: '2024-12-31', type: 'Audit' },
        { name: `K-1 Tax Document FY2024.pdf`, date: '2025-03-15', type: 'Tax' },
        { name: `Quarterly Letter Q4 2024.pdf`, date: '2024-12-31', type: 'Letter' },
    ];
    if (fund.type === 'PE' || fund.type === 'VC')
        documents.push({ name: 'Portfolio Company Update Q1 2025.pdf', date: '2025-01-31', type: 'Report' });

    return {
        ...fund, paidIn, unfunded, nav: finalNAV, distributions: totalDistributed,
        irr: Math.max(Math.min(irr, 2), -1), moic, dpi, tvpi, rvpi,
        transactions: transactions.sort((a, b) => a.date - b.date), quarterlyNAVs, documents,
        typeName: ASSET_NAMES[fund.type], color: ASSET_COLORS[fund.type], holdingType: 'fund'
    };
}

// ═══════════════════════════════════════
//  STOCK DATA PROCESSOR
//  Backend: /api/stocks (returns Stock[])
// ═══════════════════════════════════════

/** Looks up a price from quarterly history. Returns exact match or closest prior entry. */
function lookupPrice(history, year, quarter) {
    // Find exact match first
    const exact = history.find(p => p.year === year && p.quarter === quarter);
    if (exact) return exact.price;
    // Find closest prior entry
    const prior = history.filter(p => p.year < year || (p.year === year && p.quarter <= quarter));
    return prior.length > 0 ? prior[prior.length - 1].price : null;
}

/**
 * Calculates period return. Sub-annual periods return raw return;
 * multi-year periods return annualized CAGR.
 * @param {number} startPrice - Price at start of period
 * @param {number} endPrice   - Price at end of period
 * @param {number} years      - Period length in years (e.g., 0.25 for YTD, 3 for 3Y)
 * @returns {number|null}     - Return as decimal (0.15 = 15%), or null if insufficient data
 */
function calcPeriodReturn(startPrice, endPrice, years) {
    if (!startPrice || startPrice <= 0) return null;
    const totalRet = endPrice / startPrice;
    if (years <= 0) return null;
    if (years < 1) return totalRet - 1; // sub-annual: raw return
    return Math.pow(totalRet, 1 / years) - 1; // annualized CAGR
}

function processStocks() {
    return STOCKS_RAW.map(s => {
        const [ticker, name, sector, shares, avgCost, currentPrice, divYield, acquired, strategy] = s;
        const costBasis = shares * avgCost;
        const marketValue = shares * currentPrice;
        const unrealizedGL = marketValue - costBasis;
        const unrealizedPct = costBasis > 0 ? unrealizedGL / costBasis : 0;
        const annualDividend = marketValue * (divYield / 100);
        const years = Math.max(2025 - acquired, 1);
        const totalReturn = currentPrice / avgCost;
        // Generate quarterly price history
        const priceHistory = [];
        let price = avgCost;
        const qReturn = Math.pow(totalReturn, 1 / (years * 4)) - 1;
        for (let y = acquired; y <= 2025; y++) {
            for (let q = 1; q <= 4; q++) {
                if (y === 2025 && q > 1) break;
                const noise = 1 + (rand() - 0.5) * 0.12;
                price = price * (1 + qReturn) * noise;
                if (price < 0.5) price = 0.5;
                priceHistory.push({ year: y, quarter: q, price: Math.round(price * 100) / 100 });
            }
        }
        if (priceHistory.length > 0) priceHistory[priceHistory.length - 1].price = currentPrice;

        // ── Time-Period Returns ──
        // YTD: Q4 2024 → Q1 2025 (raw, not annualized — sub-annual)
        const priceYTDStart = lookupPrice(priceHistory, 2024, 4);
        const returnYTD = priceYTDStart ? calcPeriodReturn(priceYTDStart, currentPrice, 0.25) : null;

        // 1Y: Q1 2024 → Q1 2025 (1 year = raw is same as annualized)
        const price1YAgo = lookupPrice(priceHistory, 2024, 1);
        const return1Y = price1YAgo ? calcPeriodReturn(price1YAgo, currentPrice, 1) : null;

        // 3Y: Q1 2022 → Q1 2025 (annualized CAGR)
        const price3YAgo = lookupPrice(priceHistory, 2022, 1);
        const return3Y = price3YAgo ? calcPeriodReturn(price3YAgo, currentPrice, 3) : null;

        // 5Y: Q1 2020 → Q1 2025 (annualized CAGR)
        const price5YAgo = lookupPrice(priceHistory, 2020, 1);
        const return5Y = price5YAgo ? calcPeriodReturn(price5YAgo, currentPrice, 5) : null;

        // Since Inception: annualized CAGR from avg cost to current
        const returnSI = Math.pow(totalReturn, 1 / years) - 1;

        return {
            id: `STK-${ticker}`, ticker, name, sector, shares, avgCost, currentPrice,
            costBasis, marketValue, unrealizedGL, unrealizedPct,
            divYield, annualDividend, acquired, strategy,
            annualizedReturn: returnSI, priceHistory,
            returnYTD, return1Y, return3Y, return5Y, returnSI,
            totalReturn: unrealizedPct,
            typeName: 'Direct Equities', type: 'DIRECT_EQ',
            color: ASSET_COLORS.DIRECT_EQ, holdingType: 'stock',
            status: 'Active'
        };
    });
}

// ═══════════════════════════════════════
//  BOND DATA PROCESSOR
//  Backend: /api/bonds (returns Bond[])
// ═══════════════════════════════════════
function processBonds() {
    return BONDS_RAW.map((b, i) => {
        const [name, type, maturityYear, coupon, faceValue, acquiredPrice, currentPrice, acquired] = b;
        const marketValue = faceValue * (currentPrice / 100);
        const costBasis = faceValue * (acquiredPrice / 100);
        const unrealizedGL = marketValue - costBasis;
        const annualIncome = faceValue * (coupon / 100);
        const yieldToMaturity = coupon + ((100 - currentPrice) / (maturityYear - 2025)) / ((100 + currentPrice) / 2) * 100;
        return {
            id: `BND-${i + 1}`, name, bondType: type, maturityYear, coupon, faceValue,
            acquiredPrice, currentPrice, acquired, marketValue, costBasis, unrealizedGL,
            annualIncome, yieldToMaturity: Math.max(yieldToMaturity, coupon * 0.8),
            typeName: 'Direct Bonds', type: 'DIRECT_BONDS',
            color: ASSET_COLORS.DIRECT_BONDS, holdingType: 'bond', status: 'Active'
        };
    });
}

// ═══════════════════════════════════════
//  ALTERNATIVES PROCESSOR
//  Backend: /api/alternatives (returns Alternative[])
// ═══════════════════════════════════════
function processAlternatives() {
    return ALTS_DB.map((a, i) => ({
        ...a, id: `ALT-${i + 1}`, marketValue: a.value, unrealizedGL: a.value - a.costBasis,
        unrealizedPct: (a.value - a.costBasis) / a.costBasis,
        typeName: 'Alternatives', type: 'ALTS',
        color: ASSET_COLORS.ALTS, holdingType: 'alt', status: 'Active'
    }));
}

// ═══════════════════════════════════════
//  HISTORICAL AUM & CASH FLOW (2010-2025)
//  Backend: /api/history/yearly  → HistoryYear[]
//           /api/history/ytd     → WaterfallItem[]
// ═══════════════════════════════════════
/**
 * @typedef {Object} HistoryYear
 * @property {number} year              - Calendar year (YYYY)
 * @property {number} aum               - Ending AUM ($)
 * @property {number} injection         - Capital injected during year ($)
 * @property {number} gains             - Investment gains/losses during year ($, can be negative)
 * @property {number} distributions     - Distributions received during year ($)
 * @property {number} income            - Dividend + coupon income received ($)
 * @property {string} returnPct         - Annual return as string pct (e.g., '14.2')
 * @property {number} cumInjections     - Cumulative capital injected since inception ($)
 * @property {number} cumGains          - Cumulative investment gains ($)
 * @property {number} cumDistributions  - Cumulative distributions ($)
 * @property {number} cumIncome         - Cumulative income ($)
 * @property {number} netCashFlow       - Net cash flow for year: distributions + income - injections ($)
 * @property {number} cumNetCashFlow    - Cumulative net cash flow ($)
 *
 * @typedef {Object} WaterfallItem
 * @property {string} label  - Display label (e.g., 'Starting AUM (Dec 2024)')
 * @property {number} value  - Dollar amount ($)
 * @property {string} type   - 'balance' | 'inflow' | 'gain' | 'loss'
 */
function generateHistory() {
    const h = [], dp = [
        { y: 2010, r: 0.142, inj: 15 }, { y: 2011, r: 0.021, inj: 20 }, { y: 2012, r: 0.138, inj: 25 },
        { y: 2013, r: 0.243, inj: 30 }, { y: 2014, r: 0.112, inj: 28 }, { y: 2015, r: 0.048, inj: 32 },
        { y: 2016, r: 0.097, inj: 35 }, { y: 2017, r: 0.178, inj: 40 }, { y: 2018, r: -0.042, inj: 45 },
        { y: 2019, r: 0.215, inj: 42 }, { y: 2020, r: 0.156, inj: 38 }, { y: 2021, r: 0.224, inj: 50 },
        { y: 2022, r: -0.128, inj: 35 }, { y: 2023, r: 0.168, inj: 40 }, { y: 2024, r: 0.122, inj: 44 },
        { y: 2025, r: 0.015, inj: 10 }
    ];
    // Distribution rates roughly matching fund lifecycle (lower early, higher later)
    const distRates = [0.01, 0.01, 0.02, 0.03, 0.04, 0.05, 0.05, 0.06, 0.07, 0.07, 0.08, 0.09, 0.06, 0.06, 0.05, 0.02];
    let aum = 250e6;
    let cumulativeInjections = 0, cumulativeGains = 0, cumulativeDistributions = 0, cumulativeIncome = 0;
    for (let i = 0; i < dp.length; i++) {
        const d = dp[i];
        const startAUM = aum;
        const injection = d.inj * 1e6;
        const gains = startAUM * d.r;
        const distRate = distRates[i] || 0.04;
        const distributions = Math.max(0, (startAUM + gains) * distRate);
        // Income: grows with portfolio size (dividends + bond coupons)
        const income = startAUM * (0.012 + i * 0.001);
        aum = startAUM + injection + gains;
        cumulativeInjections += injection;
        cumulativeGains += gains;
        cumulativeDistributions += distributions;
        cumulativeIncome += income;
        h.push({
            year: d.y,
            aum: Math.round(aum),
            injection,
            gains: Math.round(gains),
            distributions: Math.round(distributions),
            income: Math.round(income),
            returnPct: (d.r * 100).toFixed(1),
            cumInjections: Math.round(cumulativeInjections),
            cumGains: Math.round(cumulativeGains),
            cumDistributions: Math.round(cumulativeDistributions),
            cumIncome: Math.round(cumulativeIncome),
            // Net cash flow: distributions + income - injections
            netCashFlow: Math.round(distributions + income - injection),
            cumNetCashFlow: Math.round(cumulativeDistributions + cumulativeIncome - cumulativeInjections)
        });
    }

    // YTD waterfall for 2025 (quarterly breakdown)
    const ytd2024End = h.find(r => r.year === 2024);
    const startingAUM2025 = ytd2024End ? ytd2024End.aum : aum;
    const ytdWaterfall = [
        { label: 'Starting AUM (Dec 2024)', value: startingAUM2025, type: 'balance' },
        { label: 'Capital Injected', value: h[h.length - 1].injection, type: 'inflow' },
        { label: 'Investment Gains', value: h[h.length - 1].gains, type: h[h.length - 1].gains >= 0 ? 'gain' : 'loss' },
        { label: 'Distributions Received', value: h[h.length - 1].distributions, type: 'inflow' },
        { label: 'Income (Div + Bond)', value: h[h.length - 1].income, type: 'inflow' },
        { label: 'Ending AUM (Q1 2025)', value: Math.round(aum), type: 'balance' }
    ];

    return { yearly: h, ytdWaterfall };
}

// ═══════════════════════════════════════
//  PORTFOLIO ASSEMBLY
//  Backend: /api/portfolio (aggregate view)
//  This is the main entry point. Returns all data.
// ═══════════════════════════════════════
function generatePortfolioData() {
    const funds = FUNDS_DB.map(f => generateFundPerformance(f));
    const stocks = processStocks();
    const bonds = processBonds();
    const alternatives = processAlternatives();
    const cashPosition = 42e6;

    const activeFunds = funds.filter(f => f.status === 'Active');
    const exitedFunds = funds.filter(f => f.status === 'Exited' || f.status === 'Written Off');

    // Fund aggregates
    const totalCommitment = funds.reduce((s, f) => s + f.commitment, 0);
    const totalPaidIn = funds.reduce((s, f) => s + f.paidIn, 0);
    const fundNAV = activeFunds.reduce((s, f) => s + f.nav, 0);
    const totalDistributions = funds.reduce((s, f) => s + f.distributions, 0);
    const totalUnfunded = activeFunds.reduce((s, f) => s + f.unfunded, 0);

    // Stock aggregates
    const totalStockValue = stocks.reduce((s, st) => s + st.marketValue, 0);
    const totalStockCost = stocks.reduce((s, st) => s + st.costBasis, 0);
    const totalStockGL = totalStockValue - totalStockCost;
    const totalDividendIncome = stocks.reduce((s, st) => s + st.annualDividend, 0);

    // Bond aggregates
    const totalBondValue = bonds.reduce((s, b) => s + b.marketValue, 0);
    const totalBondIncome = bonds.reduce((s, b) => s + b.annualIncome, 0);

    // Alts aggregates
    const totalAltsValue = alternatives.reduce((s, a) => s + a.marketValue, 0);

    // Total AUM
    const currentAUM = fundNAV + totalStockValue + totalBondValue + totalAltsValue + cashPosition;
    const holdingCount = funds.length + stocks.length + bonds.length + alternatives.length;

    // Portfolio metrics
    const portfolioDPI = totalPaidIn > 0 ? totalDistributions / totalPaidIn : 0;
    const portfolioTVPI = totalPaidIn > 0 ? (fundNAV + totalDistributions) / totalPaidIn : 0;
    const portfolioRVPI = totalPaidIn > 0 ? fundNAV / totalPaidIn : 0;
    const totalW = funds.reduce((s, f) => s + (f.status === 'Active' ? f.nav : f.commitment), 0);
    const portfolioIRR = funds.reduce((s, f) => {
        const w = (f.status === 'Active' ? f.nav : f.commitment) / totalW;
        return s + f.irr * w;
    }, 0);

    // Build allocation from ALL holdings
    const allocMap = {};
    activeFunds.forEach(f => { allocMap[f.type] = (allocMap[f.type] || 0) + f.nav; });
    allocMap['DIRECT_EQ'] = totalStockValue;
    allocMap['DIRECT_BONDS'] = totalBondValue;
    allocMap['ALTS'] = totalAltsValue;
    allocMap['CASH'] = cashPosition;

    const allocation = Object.entries(allocMap).map(([type, value]) => ({
        name: ASSET_NAMES[type], type,
        pct: currentAUM > 0 ? Math.round((value / currentAUM) * 100) : 0,
        value, color: ASSET_COLORS[type]
    })).sort((a, b) => b.pct - a.pct);

    const pctSum = allocation.reduce((s, a) => s + a.pct, 0);
    if (pctSum !== 100 && allocation.length > 0) allocation[0].pct += (100 - pctSum);

    // Realized / unrealized
    const realizedGains = exitedFunds.reduce((s, f) => s + (f.distributions - f.paidIn), 0);
    const unrealizedGains = activeFunds.reduce((s, f) => s + (f.nav - f.paidIn + f.distributions), 0)
        + totalStockGL
        + bonds.reduce((s, b) => s + b.unrealizedGL, 0)
        + alternatives.reduce((s, a) => s + a.unrealizedGL, 0);

    // Stock sector breakdown
    const sectorMap = {};
    stocks.forEach(s => { sectorMap[s.sector] = (sectorMap[s.sector] || 0) + s.marketValue; });
    const stockSectors = Object.entries(sectorMap)
        .map(([sector, value]) => ({ sector, value, pct: Math.round(value / totalStockValue * 100) }))
        .sort((a, b) => b.value - a.value);

    // Portfolio-level equity period returns (value-weighted)
    function weightedReturn(field) {
        const eligible = stocks.filter(s => s[field] !== null && s[field] !== undefined);
        const totalMV = eligible.reduce((s, st) => s + st.marketValue, 0);
        if (totalMV === 0 || eligible.length === 0) return null;
        return eligible.reduce((s, st) => s + st[field] * (st.marketValue / totalMV), 0);
    }
    const eqReturnYTD = weightedReturn('returnYTD');
    const eqReturn1Y = weightedReturn('return1Y');
    const eqReturn3Y = weightedReturn('return3Y');
    const eqReturn5Y = weightedReturn('return5Y');
    const eqReturnSI = weightedReturn('returnSI');

    const history = generateHistory();

    // ═══════════════════════════════════════════════════════════
    //  FINAL EXPORT — window.PortfolioData
    //  Each key is labeled with its backend endpoint / table.
    // ═══════════════════════════════════════════════════════════
    return {
        // ── Entity Collections (Backend Tables) ──
        funds,                  // Fund[]           → /api/funds
        stocks,                 // Stock[]          → /api/stocks
        bonds,                  // Bond[]           → /api/bonds
        alternatives,           // Alternative[]    → /api/alternatives
        cashPosition,           // number ($)       → /api/cash

        // ── Filtered Views ──
        activeFunds,            // Fund[] (status === 'Active')
        exitedFunds,            // Fund[] (status === 'Exited' | 'Written Off')

        // ── Portfolio Aggregates → /api/portfolio/summary ──
        currentAUM,             // number ($) — Total assets under management
        holdingCount,           // number    — Total number of holdings

        // ── Fund Aggregates → /api/portfolio/funds-summary ──
        totalCommitment,        // number ($) — Sum of all fund commitments
        totalPaidIn,            // number ($) — Sum of all capital called
        totalDistributions,     // number ($) — Sum of all distributions received
        totalUnfunded,          // number ($) — Remaining unfunded commitments
        fundNAV,                // number ($) — Sum of active fund NAVs

        // ── Equity Aggregates → /api/portfolio/equities-summary ──
        totalStockValue,        // number ($) — Total equity market value
        totalStockCost,         // number ($) — Total equity cost basis
        totalStockGL,           // number ($) — Unrealized equity gain/loss
        totalDividendIncome,    // number ($) — Estimated annual dividend income

        // ── Fixed Income & Alts Aggregates ──
        totalBondValue,         // number ($) — Total bond market value
        totalBondIncome,        // number ($) — Annual coupon income
        totalAltsValue,         // number ($) — Total alternatives value

        // ── Equity Period Returns (value-weighted) → /api/portfolio/equity-returns ──
        eqReturnYTD,            // number|null (decimal) — YTD return, not annualized
        eqReturn1Y,             // number|null (decimal) — 1-year return
        eqReturn3Y,             // number|null (decimal) — 3-year annualized CAGR
        eqReturn5Y,             // number|null (decimal) — 5-year annualized CAGR
        eqReturnSI,             // number|null (decimal) — Since-inception annualized CAGR

        // ── Portfolio Performance Metrics → /api/portfolio/performance ──
        portfolioDPI,           // number — Distribution to Paid-In
        portfolioTVPI,          // number — Total Value to Paid-In
        portfolioRVPI,          // number — Residual Value to Paid-In
        portfolioIRR,           // number (decimal) — Weighted portfolio IRR
        portfolioMOIC: portfolioTVPI, // number — Multiple on Invested Capital

        // ── Gains Analysis → /api/portfolio/gains ──
        realizedGains,          // number ($) — Realized gains from exits
        unrealizedGains,        // number ($) — Unrealized gains across all assets

        // ── Breakdowns → /api/portfolio/allocation ──
        allocation,             // {name, type, pct, value, color}[] — Asset allocation
        stockSectors,           // {sector, value, pct}[] — Equity sector breakdown

        // ── Historical Data → /api/history ──
        history,                // {yearly: HistoryYear[], ytdWaterfall: WaterfallItem[]}

        // ── Reference / Config → /api/config ──
        assetNames: ASSET_NAMES,   // {[typeCode]: displayName}
        assetColors: ASSET_COLORS, // {[typeCode]: hexColor}

        // ── Glossary → /api/glossary ──
        glossary: {
            NAV: "Net Asset Value — Current market value minus liabilities.",
            DPI: "Distribution to Paid-In — Cash returned / capital invested.",
            TVPI: "Total Value to Paid-In — (NAV + Distributions) / Paid-In.",
            RVPI: "Residual Value to Paid-In — Current NAV / Paid-In.",
            IRR: "Internal Rate of Return — Annualized return on all cash flows.",
            MOIC: "Multiple on Invested Capital — Total value / total invested.",
            TWR: "Time-Weighted Return — Performance excluding external cash flows.",
            PME: "Public Market Equivalent — Private vs public index benchmark.",
            LTV: "Loan-to-Value — Debt / total assets.",
            ISCR: "Interest Service Coverage — Income / interest expenses.",
            LCR: "Liquidity Coverage — Liquid assets / near-term obligations.",
            YTM: "Yield to Maturity — Total return if bond held to maturity."
        }
    };
}

const PortfolioData = generatePortfolioData();
window.PortfolioData = PortfolioData;
