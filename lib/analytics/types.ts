// ═══════════════════════════════════════════════════════════
//  VintageIQ — TypeScript Type Definitions
//  Backend Table Mappings for Supabase / PostgreSQL
// ═══════════════════════════════════════════════════════════

/** Asset class type codes */
export type AssetType =
    | 'PE' | 'VC' | 'RE' | 'PC'
    | 'EQ_FUNDS' | 'PUBLIC_EQ' | 'BONDS'
    | 'CRYPTO' | 'HEDGE' | 'DIRECT_EQ'
    | 'DIRECT_BONDS' | 'ALTS' | 'CASH';

/** Fund status */
export type FundStatus = 'Active' | 'Exited' | 'Written Off';

/** Fund holding type codes */
export type FundType = 'PE' | 'VC' | 'RE' | 'PC' | 'EQ_FUNDS' | 'PUBLIC_EQ' | 'BONDS' | 'CRYPTO' | 'HEDGE';

// ── Fund Entity → /api/funds ──
export interface FundInput {
    id: string;
    name: string;
    type: FundType;
    strategy: string;
    vintage: number;
    commitment: number;
    status: FundStatus;
    exitYear?: number;
    geography: string;
    sector: string;
    isLoss?: boolean;
    totalLoss?: boolean;
    description?: string;
}

export interface FundTransaction {
    date: Date;
    type: string;
    amount: number;
    description: string;
}

export interface FundNAVPoint {
    date: Date;
    nav: number;
}

export interface FundDocument {
    name: string;
    date: string;
    type: string;
}

export interface Fund extends FundInput {
    paidIn: number;
    unfunded: number;
    nav: number;
    distributions: number;
    irr: number;
    moic: number;
    dpi: number;
    tvpi: number;
    rvpi: number;
    transactions: FundTransaction[];
    quarterlyNAVs: FundNAVPoint[];
    documents: FundDocument[];
    typeName: string;
    color: string;
    holdingType: 'fund';
}

// ── Stock Entity → /api/stocks ──
export interface Stock {
    id: string;
    ticker: string;
    name: string;
    sector: string;
    shares: number;
    avgCost: number;
    currentPrice: number;
    costBasis: number;
    marketValue: number;
    unrealizedGL: number;
    unrealizedPct: number;
    divYield: number;
    annualDividend: number;
    acquired: number;
    strategy: string;
    returnYTD: number | null;
    return1Y: number | null;
    return3Y: number | null;
    return5Y: number | null;
    returnSI: number;
    totalReturn: number;
    annualizedReturn: number;
    priceHistory: { year: number; quarter: number; price: number }[];
    typeName: string;
    type: 'DIRECT_EQ';
    color: string;
    holdingType: 'stock';
    status: 'Active';
    description?: string;
}

// ── Bond Entity → /api/bonds ──
export interface Bond {
    id: string;
    name: string;
    bondType: string;
    maturityYear: number;
    coupon: number;
    faceValue: number;
    acquiredPrice: number;
    currentPrice: number;
    acquired: number;
    marketValue: number;
    costBasis: number;
    unrealizedGL: number;
    annualIncome: number;
    yieldToMaturity: number;
    typeName: string;
    type: 'DIRECT_BONDS';
    color: string;
    holdingType: 'bond';
    status: 'Active';
}

// ── Alternative Entity → /api/alternatives ──
export interface Alternative {
    id: string;
    name: string;
    type: string;
    value: number;
    costBasis: number;
    acquired: number;
    marketValue: number;
    unrealizedGL: number;
    unrealizedPct: number;
    typeName: string;
    color: string;
    holdingType: 'alt';
    status: 'Active';
}

// ── History → /api/history ──
export interface HistoryYear {
    year: number;
    aum: number;
    injection: number;
    gains: number;
    distributions: number;
    income: number;
    returnPct: string;
    cumInjections: number;
    cumGains: number;
    cumDistributions: number;
    cumIncome: number;
    netCashFlow: number;
    cumNetCashFlow: number;
}

export interface WaterfallItem {
    label: string;
    value: number;
    type: 'balance' | 'inflow' | 'gain' | 'loss';
}

// ── Allocation ──
export interface AllocationItem {
    name: string;
    type: string;
    pct: number;
    value: number;
    color: string;
}

export interface SectorBreakdown {
    sector: string;
    value: number;
    pct: number;
}

// ── Portfolio Aggregate → /api/portfolio ──
export interface PortfolioData {
    funds: Fund[];
    stocks: Stock[];
    bonds: Bond[];
    alternatives: Alternative[];
    cashPosition: number;
    activeFunds: Fund[];
    exitedFunds: Fund[];
    currentAUM: number;
    holdingCount: number;
    totalCommitment: number;
    totalPaidIn: number;
    totalDistributions: number;
    totalUnfunded: number;
    fundNAV: number;
    totalStockValue: number;
    totalStockCost: number;
    totalStockGL: number;
    totalDividendIncome: number;
    totalBondValue: number;
    totalBondIncome: number;
    totalAltsValue: number;
    eqReturnYTD: number | null;
    eqReturn1Y: number | null;
    eqReturn3Y: number | null;
    eqReturn5Y: number | null;
    eqReturnSI: number | null;
    portfolioDPI: number;
    portfolioTVPI: number;
    portfolioRVPI: number;
    portfolioIRR: number;
    portfolioMOIC: number;
    realizedGains: number;
    unrealizedGains: number;
    allocation: AllocationItem[];
    stockSectors: SectorBreakdown[];
    history: { yearly: HistoryYear[]; ytdWaterfall: WaterfallItem[]; siWaterfall: WaterfallItem[] };
    assetNames: Record<string, string>;
    assetColors: Record<string, string>;
    glossary: Record<string, string>;
}
