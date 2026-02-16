// ═══════════════════════════════════════════════════════════
//  VintageIQ — IRR & Returns Calculator (TypeScript)
//  Ported from data.js Newton-Raphson XIRR
// ═══════════════════════════════════════════════════════════

interface CashFlow {
    date: Date;
    amount: number;
}

/**
 * Calculates Internal Rate of Return using Newton-Raphson XIRR.
 * @param cf - Array of cash flows (negative = outflow, positive = inflow)
 * @returns IRR as decimal (e.g., 0.18 = 18%)
 */
export function calcIRR(cf: CashFlow[]): number {
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

/**
 * Calculates period return. Sub-annual periods return raw return;
 * multi-year periods return annualized CAGR.
 * @param startPrice - Price at start of period
 * @param endPrice   - Price at end of period
 * @param years      - Period length (e.g., 0.25 for YTD, 3 for 3Y)
 * @returns Return as decimal (0.15 = 15%), or null if insufficient data
 */
export function calcPeriodReturn(startPrice: number, endPrice: number, years: number): number | null {
    if (!startPrice || startPrice <= 0) return null;
    const totalRet = endPrice / startPrice;
    if (years <= 0) return null;
    if (years < 1) return totalRet - 1;
    return Math.pow(totalRet, 1 / years) - 1;
}

/**
 * Looks up a price from quarterly history.
 */
export function lookupPrice(
    history: { year: number; quarter: number; price: number }[],
    year: number,
    quarter: number
): number | null {
    const exact = history.find(p => p.year === year && p.quarter === quarter);
    if (exact) return exact.price;
    const prior = history.filter(p => p.year < year || (p.year === year && p.quarter <= quarter));
    return prior.length > 0 ? prior[prior.length - 1].price : null;
}

/**
 * Formats a dollar value for display.
 */
export function formatCurrency(value: number, compact = false): string {
    if (compact) {
        if (Math.abs(value) >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
        if (Math.abs(value) >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
        if (Math.abs(value) >= 1e3) return '$' + (value / 1e3).toFixed(0) + 'K';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

/**
 * Formats a percentage for display.
 */
export function formatPercent(value: number | null, decimals = 1): string {
    if (value === null || value === undefined) return '—';
    return (value * 100).toFixed(decimals) + '%';
}

/**
 * Formats a multiple for display.
 */
export function formatMultiple(value: number): string {
    return value.toFixed(2) + 'x';
}
