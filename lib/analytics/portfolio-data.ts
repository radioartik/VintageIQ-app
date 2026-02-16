// ═══════════════════════════════════════════════════════════
//  VintageIQ — Portfolio Data Generator (TypeScript)
//  Deterministic data engine ported from data.js
// ═══════════════════════════════════════════════════════════

import type { PortfolioData, Fund, FundInput, FundTransaction, Stock, Bond, Alternative, HistoryYear, WaterfallItem, AllocationItem, SectorBreakdown } from './types';
import { calcIRR } from './calculations';

// ── Seeded PRNG ──
let seed = 42;
function seededRandom(): number {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
}

// ── Asset Name & Color Maps ──
const ASSET_NAMES: Record<string, string> = {
    PE: 'Private Equity', VC: 'Venture Capital', RE: 'Real Estate',
    PC: 'Private Credit', EQ_FUNDS: 'Equity Funds', PUBLIC_EQ: 'Public Equity',
    BONDS: 'Bond Funds', CRYPTO: 'Crypto', HEDGE: 'Hedge Fund',
    DIRECT_EQ: 'Direct Equity', DIRECT_BONDS: 'Direct Bonds', ALTS: 'Alternatives', CASH: 'Cash',
};
const ASSET_COLORS: Record<string, string> = {
    PE: '#0f172a', VC: '#3730a3', RE: '#0d9488', PC: '#b45309',
    EQ_FUNDS: '#1d4ed8', PUBLIC_EQ: '#2563eb', BONDS: '#064e3b',
    CRYPTO: '#5b21b6', HEDGE: '#701a75', DIRECT_EQ: '#0369a1',
    DIRECT_BONDS: '#15803d', ALTS: '#334155', CASH: '#64748b',
};

// ── Raw Fund Data ──
const FUNDS_DB: FundInput[] = [
    { id: 'PE001', name: 'KKR North America XII', type: 'PE', strategy: 'Buyout', vintage: 2012, commitment: 50e6, status: 'Exited', exitYear: 2019, geography: 'North America', sector: 'Industrials', description: 'Flagship North American large-cap buyout fund focused on industrials, consumer, and financial services sectors.' },
    { id: 'PE002', name: 'Blackstone Capital Partners VII', type: 'PE', strategy: 'Buyout', vintage: 2015, commitment: 45e6, status: 'Active', geography: 'Global', sector: 'Technology', description: 'Upper middle-market buyout fund targeting global growth opportunities in enterprise software and IT services.' },
    { id: 'PE003', name: 'Apollo Investment Fund IX', type: 'PE', strategy: 'Value', vintage: 2018, commitment: 40e6, status: 'Active', geography: 'North America', sector: 'Healthcare', description: 'Complexity-oriented investment vehicle focusing on distressed debt and corporate carve-outs in the healthcare space.' },
    { id: 'PE004', name: 'Carlyle Partners VII', type: 'PE', strategy: 'Buyout', vintage: 2020, commitment: 35e6, status: 'Active', geography: 'Global', sector: 'Consumer', description: 'Large-cap buyout vehicle with a strong focus on defensive growth in global consumer markets and supply chain logistics.' },
    { id: 'PE005', name: 'Warburg Pincus XIII', type: 'PE', strategy: 'Growth', vintage: 2019, commitment: 30e6, status: 'Active', geography: 'Global', sector: 'Financial Services', description: 'Growth-equity powerhouse targeting fintech, healthcare technology, and specialty retail on a global scale.' },
    { id: 'PE006', name: 'TPG Capital Asia VII', type: 'PE', strategy: 'Buyout', vintage: 2021, commitment: 25e6, status: 'Active', geography: 'Asia', sector: 'Technology', description: 'Asia-focused private equity fund targeting pan-regional technology leaders and consumer platforms.' },
    { id: 'PE007', name: 'Silver Lake Partners VI', type: 'PE', strategy: 'Tech Buyout', vintage: 2017, commitment: 35e6, status: 'Exited', exitYear: 2023, geography: 'North America', sector: 'Technology', description: 'Tech-specialized buyout fund focused on large-scale digital transformations and legacy software portfolio optimization.' },
    { id: 'VC001', name: 'Sequoia Capital Fund XIX', type: 'VC', strategy: 'Early Stage', vintage: 2018, commitment: 20e6, status: 'Active', geography: 'North America', sector: 'Technology', description: 'Premier early-stage venture fund targeting AI-first infrastructure and consumer internet innovators.' },
    { id: 'VC002', name: 'Andreessen Horowitz Fund VII', type: 'VC', strategy: 'Growth', vintage: 2020, commitment: 25e6, status: 'Active', geography: 'North America', sector: 'Software', description: 'Late-stage venture vehicle focusing on "software eats the world" themes across biotech, fintech, and enterprise SaaS.' },
    { id: 'VC003', name: 'Benchmark Capital Partners', type: 'VC', strategy: 'Early Stage', vintage: 2016, commitment: 15e6, status: 'Exited', exitYear: 2022, geography: 'North America', sector: 'Technology', description: 'Concentrated early-stage venture strategy focusing on high-conviction founders in the collaborative software space.' },
    { id: 'VC004', name: 'Accel Growth Fund V', type: 'VC', strategy: 'Growth', vintage: 2019, commitment: 18e6, status: 'Active', geography: 'Global', sector: 'Fintech', description: 'Global growth-stage vehicle focusing on scaling fintech and cybersecurity leaders across the US and EMEA.' },
    { id: 'VC005', name: 'Tiger Global PIP 15', type: 'VC', strategy: 'Late Stage', vintage: 2021, commitment: 30e6, status: 'Active', geography: 'Global', sector: 'Technology', isLoss: true, description: 'High-velocity late-stage strategy focused on global consumer internet and high-growth SaaS platforms.' },
    { id: 'RE001', name: 'Blackstone Real Estate IX', type: 'RE', strategy: 'Opportunistic', vintage: 2018, commitment: 35e6, status: 'Active', geography: 'Global', sector: 'Real Estate', description: 'Opportunistic global real estate fund focusing on logistics, rental housing, and hospitality recovery themes.' },
    { id: 'RE002', name: 'Brookfield Strategic RE III', type: 'RE', strategy: 'Value-Add', vintage: 2019, commitment: 25e6, status: 'Active', geography: 'North America', sector: 'Real Estate', description: 'Value-add vehicle targeting premier office assets in gateway cities and cold-storage logistics infrastructure.' },
    { id: 'RE003', name: 'Starwood Hospitality Fund', type: 'RE', strategy: 'Sector Focus', vintage: 2019, commitment: 20e6, status: 'Active', geography: 'North America', sector: 'Hospitality', isLoss: true, description: 'Thematic vehicle focused on acquisition and rebranding of luxury hospitality assets across North America.' },
    { id: 'RE004', name: 'Prologis Logistics Venture', type: 'RE', strategy: 'Core-Plus', vintage: 2020, commitment: 30e6, status: 'Active', geography: 'Global', sector: 'Logistics', description: 'Strategic logistics venture focused on last-mile delivery infrastructure and institutional-grade warehouse assets.' },
    { id: 'PC001', name: 'Ares Capital Corp Senior', type: 'PC', strategy: 'Direct Lending', vintage: 2019, commitment: 25e6, status: 'Active', geography: 'North America', sector: 'Multi-Sector', description: 'Middle-market direct lending platform providing senior secured financing to defensive, cash-flow stable businesses.' },
    { id: 'PC002', name: 'Oaktree Opportunities XI', type: 'PC', strategy: 'Distressed', vintage: 2020, commitment: 20e6, status: 'Active', geography: 'Global', sector: 'Multi-Sector', description: 'Distressed debt and opportunistic credit fund targeting out-of-favor assets and corporate restructuring opportunities.' },
    { id: 'PC003', name: 'Apollo Hybrid Value Fund', type: 'PC', strategy: 'Mezzanine', vintage: 2021, commitment: 15e6, status: 'Active', geography: 'North America', sector: 'Energy', description: 'Flexible capital vehicle providing mezzanine and preferred equity solutions to established energy and infrastructure firms.' },
    { id: 'EQ001', name: 'Vanguard Total Stock Market', type: 'EQ_FUNDS', strategy: 'Passive Index', vintage: 2010, commitment: 40e6, status: 'Active', geography: 'North America', sector: 'Broad Market', description: 'Broad-based US equity indexing vehicle providing exposure to over 3,500 small, mid, and large-cap companies.' },
    { id: 'EQ002', name: 'Fidelity Contrafund', type: 'EQ_FUNDS', strategy: 'Active Growth', vintage: 2012, commitment: 25e6, status: 'Active', geography: 'North America', sector: 'Growth', description: 'Actively managed growth-oriented equity fund focused on companies with sustainable long-term competitive advantages.' },
    { id: 'EQ003', name: 'T. Rowe Price Blue Chip', type: 'EQ_FUNDS', strategy: 'Large Cap', vintage: 2014, commitment: 20e6, status: 'Active', geography: 'North America', sector: 'Blue Chip', description: 'Core large-cap strategy targeting institutional-grade businesses with strong fundamentals and cash flow profiles.' },
    { id: 'EQ004', name: 'MSCI World ETF (iShares)', type: 'PUBLIC_EQ', strategy: 'Global Index', vintage: 2015, commitment: 30e6, status: 'Active', geography: 'Global', sector: 'Broad Market', description: 'Diversified global equity index vehicle covering developed markets across 23 countries.' },
    { id: 'BD001', name: 'PIMCO Total Return Fund', type: 'BONDS', strategy: 'Active Core', vintage: 2013, commitment: 20e6, status: 'Active', geography: 'Global', sector: 'Fixed Income', description: 'Institutional core bond fund utilizing active duration management and global credit selection.' },
    { id: 'BD002', name: 'Vanguard Total Bond Market', type: 'BONDS', strategy: 'Passive Index', vintage: 2014, commitment: 15e6, status: 'Active', geography: 'North America', sector: 'Fixed Income', description: 'Comprehensive US investment-grade bond market exposure including government, corporate, and MBS securities.' },
    { id: 'CR001', name: 'Bitcoin Direct Holdings', type: 'CRYPTO', strategy: 'Digital Asset', vintage: 2020, commitment: 10e6, status: 'Active', geography: 'Global', sector: 'Cryptocurrency', description: 'Direct custodial holdings of Bitcoin (BTC) as a long-term digital store of value and macro hedge.' },
    { id: 'CR002', name: 'FTX Venture Fund', type: 'CRYPTO', strategy: 'Digital Asset', vintage: 2022, commitment: 5e6, status: 'Written Off', exitYear: 2022, geography: 'Global', sector: 'Cryptocurrency', isLoss: true, totalLoss: true, description: 'Early-stage crypto ecosystem investment vehicle, currently under liquidation.' },
    { id: 'HF001', name: 'Citadel Wellington Fund', type: 'HEDGE', strategy: 'Multi-Strategy', vintage: 2017, commitment: 30e6, status: 'Active', geography: 'Global', sector: 'Multi-Strategy', description: 'Multi-strategy flagship fund employing quantitative, global macro, and relative value credit sub-strategies.' },
];

// ── Raw Stock Data ──
const STOCKS_RAW: (string | number)[][] = [
    ['AAPL', 'Apple Inc.', 'Technology', 45000, 21.50, 228.00, 0.44, 2013, 'Core', 'Global consumer electronics leader with dominant market share in premium smartphones and expanding services ecosystem.'],
    ['MSFT', 'Microsoft Corp', 'Technology', 18000, 42.00, 415.00, 0.72, 2014, 'Core', 'Diversified technology giant leading in enterprise cloud (Azure), productivity software, and AI infrastructure integration.'],
    ['GOOGL', 'Alphabet Inc.', 'Technology', 8000, 55.00, 175.00, 0.0, 2015, 'Core', 'Dominant player in global search and digital advertising with significant long-term optionality in AI and Waymo autonomous driving.'],
    ['AMZN', 'Amazon.com Inc.', 'Technology', 12000, 25.00, 185.00, 0.0, 2014, 'Core', 'Hybrid leader in global e-commerce and high-margin cloud infrastructure (AWS) with growing advertising revenue lines.'],
    ['NVDA', 'NVIDIA Corp', 'Technology', 25000, 8.50, 875.00, 0.03, 2016, 'Core', 'Semiconductor powerhouse and primary beneficiary of global AI infrastructure build-out, providing critical GPU and H100 hardware.'],
    ['META', 'Meta Platforms', 'Technology', 6000, 165.00, 510.00, 0.36, 2018, 'Tactical', 'Social media infrastructure leader with dominant reach via Instagram/WhatsApp and significant investment in AI-driven ad targeting.'],
    ['BRK.B', 'Berkshire Hathaway', 'Financial', 5000, 180.00, 425.00, 0.0, 2015, 'Core', 'Diversified holding company with massive cash reserves and high-quality exposure to insurance, energy, and transportation.'],
    ['JPM', 'JPMorgan Chase', 'Financial', 12000, 75.00, 198.00, 2.25, 2016, 'Income', 'Premier global financial institution with "fortress balance sheet" and dominant market share in commercial and retail banking.'],
    ['V', 'Visa Inc.', 'Financial', 8000, 85.00, 280.00, 0.76, 2017, 'Core', 'Global toll-booth on commerce, benefiting from the long-term secular shift from cash to digital and cross-border payments.'],
    ['JNJ', 'Johnson & Johnson', 'Healthcare', 10000, 95.00, 155.00, 3.0, 2014, 'Income', 'Diversified healthcare leader with top-tier pharmaceutical pipeline and stable medical device segment cash flows.'],
    ['UNH', 'UnitedHealth Group', 'Healthcare', 3500, 145.00, 525.00, 1.42, 2017, 'Core', 'Leading managed healthcare and insurance platform with deep data-driven edge via the Optum health services segment.'],
    ['PG', 'Procter & Gamble', 'Consumer', 8000, 72.00, 165.00, 2.40, 2015, 'Income', 'Consumer staples giant with best-in-class brand portfolio and strong defensive positioning in inflationary environments.'],
    ['XOM', 'Exxon Mobil', 'Energy', 15000, 45.00, 105.00, 3.35, 2016, 'Income', 'Integrated energy major with disciplined capital allocation and significant participation in upstream oil/gas recovery.'],
    ['HD', 'Home Depot', 'Consumer', 4500, 120.00, 365.00, 2.50, 2017, 'Core', 'Dominant home improvement retailer benefiting from professional contractor demand and aging US home stock.'],
    ['DIS', 'Walt Disney Co', 'Media', 7000, 90.00, 112.00, 0.0, 2018, 'Tactical', 'Premium content powerhouse with unmatched IP library, recovering parks business, and scaling streaming platform (Disney+).'],
    ['CRM', 'Salesforce Inc.', 'Technology', 5000, 95.00, 265.00, 0.58, 2019, 'Tactical', 'SaaS pioneer and CRM leader with a growing ecosystem of AI-enhanced enterprise data and marketing tools.'],
    ['TSLA', 'Tesla Inc.', 'Auto', 4000, 45.00, 245.00, 0.0, 2020, 'Speculative', 'EV market leader with disruptive potential in autonomous driving (FSD), battery storage, and energy software.'],
    ['AMD', 'Advanced Micro Devices', 'Technology', 8000, 22.00, 155.00, 0.0, 2019, 'Tactical', 'High-performance computing innovator gaining market share in data center CPUs and AI accelerators.'],
    ['NFLX', 'Netflix Inc.', 'Media', 3000, 120.00, 620.00, 0.0, 2018, 'Tactical', 'Global streaming leader with proprietary content edge and successful ad-tier expansion driving subscriber growth.'],
    ['COST', 'Costco Wholesale', 'Consumer', 2500, 210.00, 745.00, 0.58, 2019, 'Core', 'High-loyalty warehouse membership model with exceptional inventory turnover and stable recurring fee revenue.'],
];

// ── Raw Bond Data ──
const BONDS_RAW: (string | number)[][] = [
    ['US Treasury 10Y 4.25%', 'UST', 2034, 4.25, 10e6, 99.50, 98.20, 2024],
    ['US Treasury 30Y 4.75%', 'UST', 2054, 4.75, 8e6, 95.50, 93.80, 2024],
    ['Apple Inc. 3.85% 2028', 'CORP', 2028, 3.85, 5e6, 101.00, 99.50, 2023],
    ['Microsoft 4.10% 2032', 'CORP', 2032, 4.10, 5e6, 100.50, 100.80, 2023],
    ['JP Morgan 5.00% 2030', 'CORP', 2030, 5.00, 4e6, 102.00, 101.50, 2024],
    ['CA State GO 3.50% 2035', 'MUNI', 2035, 3.50, 3e6, 98.00, 97.20, 2024],
    ['NYC GO Bond 3.75% 2032', 'MUNI', 2032, 3.75, 2e6, 99.00, 98.50, 2023],
    ['TIPS 2.50% 2030', 'TIPS', 2030, 2.50, 5e6, 100.00, 102.30, 2023],
    ['Goldman Sachs 4.80% 2029', 'CORP', 2029, 4.80, 3e6, 101.50, 100.20, 2024],
    ['US Treasury 5Y 4.00%', 'UST', 2029, 4.00, 6e6, 100.00, 99.10, 2024],
];

// ── Raw Alternatives Data ──
const ALTS_DB = [
    { name: 'Art Collection (Rothko, Basquiat)', type: 'ART', value: 12e6, costBasis: 6.5e6, acquired: 2016 },
    { name: 'Napa Valley Vineyard Estate', type: 'REAL_ASSET', value: 8.5e6, costBasis: 5.2e6, acquired: 2018 },
    { name: 'Tribeca Commercial Property', type: 'DIRECT_RE', value: 15e6, costBasis: 11e6, acquired: 2017 },
    { name: 'Rare Wine Collection (Burgundy)', type: 'COLLECTIBLE', value: 4.2e6, costBasis: 2.8e6, acquired: 2019 },
    { name: 'Physical Gold Holdings', type: 'COMMODITY', value: 6e6, costBasis: 4.5e6, acquired: 2020 },
    { name: 'Classic Car Portfolio (Ferrari)', type: 'COLLECTIBLE', value: 3.8e6, costBasis: 2.2e6, acquired: 2018 },
    { name: 'Miami Beach Penthouse', type: 'DIRECT_RE', value: 9.5e6, costBasis: 7e6, acquired: 2021 },
    { name: 'Rolex Daytona Collection', type: 'COLLECTIBLE', value: 1.8e6, costBasis: 1.1e6, acquired: 2020 },
];

// ═══ Fund Performance Generator ═══
function generateFundPerformance(fund: FundInput): Fund {
    const currentYear = 2025;
    const yearsActive = fund.exitYear ? fund.exitYear - fund.vintage : currentYear - fund.vintage;

    // 1. Generate Realistic Transactions (Source of Truth)
    const transactions: FundTransaction[] = [];
    const investmentPeriod = Math.min(yearsActive, 5);
    const distStartYear = fund.vintage + 4;

    // Capital Call Weights (Upfront heavy)
    const callWeights = [0.35, 0.25, 0.20, 0.15, 0.05];
    let cumulativePaidIn = 0;

    for (let i = 0; i < investmentPeriod; i++) {
        const year = fund.vintage + i;
        if (year > currentYear) break;

        const annualWeight = callWeights[i] || 0.05;
        const deployFactor = fund.status === 'Exited' ? 1.0 : Math.min(0.4 + yearsActive * 0.1, 1.0);
        const annualAmount = fund.commitment * deployFactor * annualWeight;

        for (let q = 0; q < 2; q++) {
            const callAmount = annualAmount / 2;
            transactions.push({
                date: new Date(year, q * 6 + 2, 15),
                type: 'Capital Call',
                amount: -callAmount,
                description: `Capital Call Q${q === 0 ? 1 : 3} ${year}`
            });
            cumulativePaidIn += callAmount;
        }
    }

    // 2. Synthesize Distributions (Back-heavy, staggered)
    let cumulativeDist = 0;
    if (fund.status !== 'Written Off' && !fund.totalLoss) {
        const yearsForDist = Math.max(0, (fund.exitYear || currentYear) - distStartYear + 1);
        if (yearsForDist > 0) {
            let targetTVPI = 1.0;
            if (fund.isLoss) targetTVPI = 0.4 + seededRandom() * 0.3;
            else if (fund.type === 'VC') targetTVPI = 2.2 + seededRandom() * 2.5;
            else if (fund.type === 'PE') targetTVPI = 1.8 + seededRandom() * 1.2;
            else targetTVPI = 1.3 + seededRandom() * 0.5;

            const totalValueTarget = cumulativePaidIn * targetTVPI;
            const distBase = fund.status === 'Exited' ? totalValueTarget : totalValueTarget * (0.3 + seededRandom() * 0.4);
            const distWeights = Array.from({ length: yearsForDist }).map((_, idx) => (idx + 1) / ((yearsForDist * (yearsForDist + 1)) / 2));

            for (let i = 0; i < yearsForDist; i++) {
                const year = distStartYear + i;
                if (year > currentYear) break;
                const annualAmount = distBase * distWeights[i];
                for (let q = 0; q < 2; q++) {
                    const distAmount = annualAmount / 2;
                    transactions.push({
                        date: new Date(year, q * 6 + 4, 15),
                        type: 'Distribution',
                        amount: distAmount,
                        description: `Distribution ${year} H${q + 1}`
                    });
                    cumulativeDist += distAmount;
                }
            }
        }
    }

    // 3. Derive Final Metrics from Transaction Source of Truth
    const paidIn = cumulativePaidIn;
    const distributions = cumulativeDist;
    const unfunded = fund.commitment - paidIn;

    let finalNAV = 0;
    if (fund.status !== 'Exited' && fund.status !== 'Written Off') {
        const growthRate = fund.type === 'VC' ? 0.25 : fund.type === 'PE' ? 0.18 : 0.12;
        const hypotheticalTotalValue = paidIn * Math.pow(1 + growthRate, yearsActive * 0.7);
        finalNAV = Math.max(0, hypotheticalTotalValue - distributions);
    }

    const moic = paidIn > 0 ? (finalNAV + distributions) / paidIn : 0;
    const tvpi = moic;
    const dpi = paidIn > 0 ? distributions / paidIn : 0;
    const rvpi = paidIn > 0 ? finalNAV / paidIn : 0;

    // Estimate IRR for reporting based on TVPI and Age
    const irr = fund.isLoss ? -0.12 - seededRandom() * 0.2 : (tvpi > 1 ? (Math.pow(tvpi, 1 / Math.max(yearsActive, 1)) - 1) : -0.05);

    // 4. Generate quarterly NAVs for visualization (Time-series)
    const quarterlyNAVs = [];
    for (let y = fund.vintage; y <= (fund.exitYear || currentYear); y++) {
        for (let q = 1; q <= 4; q++) {
            const elapsed = (y - fund.vintage) + (q - 1) / 4;
            const callProgress = Math.min(elapsed / investmentPeriod, 1);
            const valueMultiplier = Math.pow(1 + Math.max(irr, 0.05), elapsed);
            const baseValue = (paidIn * callProgress) * valueMultiplier;

            const distSoFar = transactions
                .filter(t => t.type === 'Distribution' && (t.date.getFullYear() < y || (t.date.getFullYear() === y && t.date.getMonth() < (q - 1) * 3)))
                .reduce((sum, t) => sum + t.amount, 0);

            quarterlyNAVs.push({
                date: new Date(y, (q - 1) * 3, 1),
                nav: fund.status === 'Exited' && y >= fund.exitYear! ? 0 : Math.max(baseValue - distSoFar, 0)
            });
        }
    }

    // 5. Generate Documents
    const documents = [];
    for (let y = fund.vintage; y <= (fund.exitYear || currentYear); y++) {
        documents.push({ name: `Q4 ${y} Capital Account Statement`, date: `${y}-12-31`, type: 'Statement' });
        if (y % 2 === 0) documents.push({ name: `${y} Audited Financial Statements`, date: `${y}-03-31`, type: 'Audit' });
    }

    return {
        ...fund,
        paidIn, unfunded, nav: finalNAV, distributions,
        irr: Math.max(Math.min(irr, 2.5), -1), moic, dpi, tvpi, rvpi,
        transactions: transactions.sort((a, b) => a.date.getTime() - b.date.getTime()),
        quarterlyNAVs, documents,
        typeName: ASSET_NAMES[fund.type] || fund.type,
        color: ASSET_COLORS[fund.type] || '#64748b',
        holdingType: 'fund',
    };
}

// ═══ Stock Processor ═══
function processStocks(): Stock[] {
    return STOCKS_RAW.map(s => {
        const ticker = s[0] as string;
        const name = s[1] as string;
        const sector = s[2] as string;
        const shares = s[3] as number;
        const avgCost = s[4] as number;
        const currentPrice = s[5] as number;
        const divYield = s[6] as number;
        const acquired = s[7] as number;
        const strategy = s[8] as string;
        const description = s[9] as string;

        const costBasis = shares * avgCost;
        const marketValue = shares * currentPrice;
        const unrealizedGL = marketValue - costBasis;
        const unrealizedPct = costBasis > 0 ? unrealizedGL / costBasis : 0;
        const annualDividend = marketValue * (divYield / 100);
        const yearsHeld = 2025 - acquired;
        const totalReturn = costBasis > 0 ? unrealizedGL / costBasis : 0;
        const annualizedReturn = yearsHeld > 0 ? Math.pow(1 + totalReturn, 1 / yearsHeld) - 1 : 0;

        // Generate price history
        const priceHistory: { year: number; quarter: number; price: number }[] = [];
        for (let y = acquired; y <= 2025; y++) {
            for (let q = 1; q <= 4; q++) {
                const elapsed = (y - acquired) + (q - 1) / 4;
                const total = yearsHeld > 0 ? yearsHeld : 1;
                const progress = elapsed / total;
                const noise = (seededRandom() - 0.5) * 0.08;
                const price = avgCost + (currentPrice - avgCost) * Math.min(progress, 1) * (1 + noise);
                priceHistory.push({ year: y, quarter: q, price: Math.max(price, avgCost * 0.5) });
            }
        }

        // Period returns
        const currentQ = priceHistory[priceHistory.length - 1];
        const findPrice = (yearsBack: number) => {
            const targetY = 2025 - yearsBack;
            const p = priceHistory.find(h => h.year === targetY && h.quarter === 1);
            return p ? p.price : null;
        };

        const ytdPrice = priceHistory.find(h => h.year === 2025 && h.quarter === 1);
        const returnYTD = ytdPrice ? (currentPrice / ytdPrice.price) - 1 : null;
        const p1y = findPrice(1);
        const return1Y = p1y ? (currentPrice / p1y) - 1 : null;
        const p3y = findPrice(3);
        const return3Y = p3y && yearsHeld >= 3 ? Math.pow(currentPrice / p3y, 1 / 3) - 1 : null;
        const p5y = findPrice(5);
        const return5Y = p5y && yearsHeld >= 5 ? Math.pow(currentPrice / p5y, 1 / 5) - 1 : null;
        const returnSI = annualizedReturn;

        return {
            id: `STK-${ticker}`,
            ticker, name, sector, shares, avgCost, currentPrice,
            costBasis, marketValue, unrealizedGL, unrealizedPct,
            divYield, annualDividend, acquired, strategy,
            returnYTD, return1Y, return3Y, return5Y, returnSI, totalReturn, annualizedReturn,
            priceHistory,
            typeName: 'Direct Equity', type: 'DIRECT_EQ' as const,
            color: ASSET_COLORS.DIRECT_EQ, holdingType: 'stock' as const, status: 'Active' as const,
        };
    });
}

// ═══ Bond Processor ═══
function processBonds(): Bond[] {
    return BONDS_RAW.map((b, i) => {
        const name = b[0] as string;
        const bondType = b[1] as string;
        const maturityYear = b[2] as number;
        const coupon = b[3] as number;
        const faceValue = b[4] as number;
        const acquiredPrice = b[5] as number;
        const currentPrice = b[6] as number;
        const acquired = b[7] as number;

        const marketValue = faceValue * (currentPrice / 100);
        const costBasis = faceValue * (acquiredPrice / 100);
        const unrealizedGL = marketValue - costBasis;
        const annualIncome = faceValue * (coupon / 100);
        const yearsToMaturity = maturityYear - 2025;
        const yieldToMaturity = yearsToMaturity > 0
            ? ((coupon / 100) + ((100 - currentPrice) / 100) / yearsToMaturity) / ((currentPrice / 100 + 1) / 2) * 100
            : coupon;

        return {
            id: `BND-${i + 1}`, name, bondType, maturityYear, coupon, faceValue,
            acquiredPrice, currentPrice, acquired, marketValue, costBasis, unrealizedGL,
            annualIncome, yieldToMaturity,
            typeName: 'Direct Bonds', type: 'DIRECT_BONDS' as const,
            color: ASSET_COLORS.DIRECT_BONDS, holdingType: 'bond' as const, status: 'Active' as const,
        };
    });
}

// ═══ Alternatives Processor ═══
function processAlternatives(): Alternative[] {
    return ALTS_DB.map((a, i) => ({
        id: `ALT-${i + 1}`,
        name: a.name, type: a.type, value: a.value, costBasis: a.costBasis,
        acquired: a.acquired, marketValue: a.value,
        unrealizedGL: a.value - a.costBasis,
        unrealizedPct: (a.value - a.costBasis) / a.costBasis,
        typeName: 'Alternatives', color: ASSET_COLORS.ALTS,
        holdingType: 'alt' as const, status: 'Active' as const,
    }));
}

// ═══ Main Generator ═══
export function generatePortfolioData(): PortfolioData {
    seed = 42; // Reset for determinism

    const funds = FUNDS_DB.map(generateFundPerformance);
    const stocks = processStocks();
    const bonds = processBonds();
    const alternatives = processAlternatives();
    const cashPosition = 18500000;

    const activeFunds = funds.filter(f => f.status === 'Active');
    const exitedFunds = funds.filter(f => f.status !== 'Active');

    const fundNAV = funds.reduce((s, f) => s + f.nav, 0);
    const totalStockValue = stocks.reduce((s, st) => s + st.marketValue, 0);
    const totalStockCost = stocks.reduce((s, st) => s + st.costBasis, 0);
    const totalStockGL = totalStockValue - totalStockCost;
    const totalDividendIncome = stocks.reduce((s, st) => s + st.annualDividend, 0);
    const totalBondValue = bonds.reduce((s, b) => s + b.marketValue, 0);
    const totalBondIncome = bonds.reduce((s, b) => s + b.annualIncome, 0);
    const totalAltsValue = alternatives.reduce((s, a) => s + a.marketValue, 0);
    const currentAUM = fundNAV + totalStockValue + totalBondValue + totalAltsValue + cashPosition;

    const totalCommitment = funds.reduce((s, f) => s + f.commitment, 0);
    const totalPaidIn = funds.reduce((s, f) => s + f.paidIn, 0);
    const totalDistributions = funds.reduce((s, f) => s + f.distributions, 0);
    const totalUnfunded = funds.reduce((s, f) => s + f.unfunded, 0);

    // Weighted equity returns
    const calcWeightedReturn = (key: 'returnYTD' | 'return1Y' | 'return3Y' | 'return5Y' | 'returnSI') => {
        const eligible = stocks.filter(s => s[key] !== null);
        if (eligible.length === 0) return null;
        const totalVal = eligible.reduce((s, st) => s + st.marketValue, 0);
        return eligible.reduce((s, st) => s + (st[key] as number) * (st.marketValue / totalVal), 0);
    };

    // Portfolio-level fund metrics
    const portfolioDPI = totalPaidIn > 0 ? totalDistributions / totalPaidIn : 0;
    const portfolioTVPI = totalPaidIn > 0 ? (fundNAV + totalDistributions) / totalPaidIn : 0;
    const portfolioRVPI = totalPaidIn > 0 ? fundNAV / totalPaidIn : 0;
    const portfolioIRR = activeFunds.length > 0
        ? activeFunds.reduce((s, f) => s + f.irr * f.paidIn, 0) / activeFunds.reduce((s, f) => s + f.paidIn, 0)
        : 0;
    const portfolioMOIC = activeFunds.length > 0
        ? activeFunds.reduce((s, f) => s + f.moic * f.paidIn, 0) / activeFunds.reduce((s, f) => s + f.paidIn, 0)
        : 0;

    const realizedGains = exitedFunds.reduce((s, f) => s + f.distributions - f.paidIn, 0);
    const unrealizedGains = activeFunds.reduce((s, f) => s + f.nav - f.paidIn, 0) + totalStockGL;

    // Allocation
    const allocationMap: Record<string, number> = {};
    funds.forEach(f => { allocationMap[f.type] = (allocationMap[f.type] || 0) + f.nav; });
    allocationMap['DIRECT_EQ'] = totalStockValue;
    allocationMap['DIRECT_BONDS'] = totalBondValue;
    allocationMap['ALTS'] = totalAltsValue;
    allocationMap['CASH'] = cashPosition;

    const allocation: AllocationItem[] = Object.entries(allocationMap)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({
            name: ASSET_NAMES[k] || k, type: k, pct: v / currentAUM, value: v, color: ASSET_COLORS[k] || '#64748b',
        }))
        .sort((a, b) => b.pct - a.pct);

    // Stock sectors
    const sectorMap: Record<string, number> = {};
    stocks.forEach(s => { sectorMap[s.sector] = (sectorMap[s.sector] || 0) + s.marketValue; });
    const stockSectors: SectorBreakdown[] = Object.entries(sectorMap)
        .map(([sector, value]) => ({ sector, value, pct: value / totalStockValue }))
        .sort((a, b) => b.value - a.value);

    // History
    const yearly: HistoryYear[] = [];
    let aum = 250e6;
    let cumInj = 0, cumGains = 0, cumDist = 0, cumInc = 0, cumNet = 0;
    for (let y = 2010; y <= 2025; y++) {
        const injection = 15e6 + seededRandom() * 20e6;
        const returnRate = y === 2020 ? -0.08 : y === 2022 ? -0.12 : 0.06 + seededRandom() * 0.12;
        const gains = aum * returnRate;
        const distributions = aum * (0.02 + seededRandom() * 0.02);
        const income = aum * (0.015 + seededRandom() * 0.01);
        aum = aum + injection + gains - distributions + income;
        cumInj += injection; cumGains += gains; cumDist += distributions; cumInc += income;
        const netCF = injection - distributions + income;
        cumNet += netCF;

        yearly.push({
            year: y, aum, injection, gains, distributions, income,
            returnPct: (returnRate * 100).toFixed(1),
            cumInjections: cumInj, cumGains: cumGains, cumDistributions: cumDist,
            cumIncome: cumInc, netCashFlow: netCF, cumNetCashFlow: cumNet,
        });
    }

    const lastYear = yearly[yearly.length - 1];
    const ytdWaterfall: WaterfallItem[] = [
        { label: 'Start (Q4 24)', value: yearly.length > 1 ? yearly[yearly.length - 2].aum : 250e6, type: 'balance' },
        { label: 'Injections', value: lastYear.injection, type: 'inflow' },
        { label: 'Gains', value: lastYear.gains, type: lastYear.gains >= 0 ? 'gain' : 'loss' },
        { label: 'Distributions', value: -lastYear.distributions, type: 'loss' },
        { label: 'Income', value: lastYear.income, type: 'gain' },
        { label: 'Current AUM', value: lastYear.aum, type: 'balance' },
    ];

    const siWaterfall: WaterfallItem[] = [
        { label: 'Initial (2010)', value: yearly[0].aum - (yearly[0].injection + yearly[0].gains - yearly[0].distributions + yearly[0].income), type: 'balance' },
        { label: 'Cum. Injections', value: lastYear.cumInjections, type: 'inflow' },
        { label: 'Cum. Gains', value: lastYear.cumGains, type: lastYear.cumGains >= 0 ? 'gain' : 'loss' },
        { label: 'Cum. Dist.', value: -lastYear.cumDistributions, type: 'loss' },
        { label: 'Cum. Income', value: lastYear.cumIncome, type: 'gain' },
        { label: 'Current AUM', value: lastYear.aum, type: 'balance' },
    ];

    const glossary: Record<string, string> = {
        IRR: 'Internal Rate of Return — time-weighted annualized return',
        MOIC: 'Multiple on Invested Capital — total value / paid-in capital',
        DPI: 'Distribution to Paid-In — cash returned / paid-in',
        TVPI: 'Total Value to Paid-In — (NAV + distributions) / paid-in',
        RVPI: 'Residual Value to Paid-In — NAV / paid-in',
        NAV: 'Net Asset Value — current fair market value of holdings',
        AUM: 'Assets Under Management — total market value of all holdings',
    };

    return {
        funds, stocks, bonds, alternatives, cashPosition,
        activeFunds, exitedFunds, currentAUM,
        holdingCount: funds.length + stocks.length + bonds.length + alternatives.length,
        totalCommitment, totalPaidIn, totalDistributions, totalUnfunded,
        fundNAV, totalStockValue, totalStockCost, totalStockGL,
        totalDividendIncome, totalBondValue, totalBondIncome, totalAltsValue,
        eqReturnYTD: calcWeightedReturn('returnYTD'),
        eqReturn1Y: calcWeightedReturn('return1Y'),
        eqReturn3Y: calcWeightedReturn('return3Y'),
        eqReturn5Y: calcWeightedReturn('return5Y'),
        eqReturnSI: calcWeightedReturn('returnSI'),
        portfolioDPI, portfolioTVPI, portfolioRVPI, portfolioIRR, portfolioMOIC,
        realizedGains, unrealizedGains, allocation, stockSectors,
        history: { yearly, ytdWaterfall, siWaterfall },
        assetNames: ASSET_NAMES, assetColors: ASSET_COLORS, glossary,
    };
}
