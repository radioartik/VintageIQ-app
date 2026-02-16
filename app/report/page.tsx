"use client";

import { generatePortfolioData, formatCurrency, formatPercent, formatMultiple } from "@/lib/analytics";
import { AllocationBar } from "@/components/portfolio/allocation-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ReportPage() {
    const data = generatePortfolioData();
    const top10 = [
        ...data.activeFunds.map(f => ({ name: f.name, typeName: f.typeName, value: f.nav })),
        ...data.stocks.map(s => ({ name: s.ticker, typeName: 'Direct Equity', value: s.marketValue })),
    ].sort((a, b) => b.value - a.value).slice(0, 10);

    const topStocks = data.stocks.sort((a, b) => b.unrealizedGL - a.unrealizedGL).slice(0, 5);
    const bottomStocks = data.stocks.sort((a, b) => a.unrealizedGL - b.unrealizedGL).slice(0, 5);

    return (
        <div className="max-w-4xl mx-auto space-y-8 print:space-y-4">
            {/* Report Header */}
            <div className="text-center py-8 border-b border-border print:py-4">
                <div className="text-blue-500 text-2xl font-bold mb-2">◆ VintageIQ</div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Quarterly Portfolio Report</h1>
                <p className="text-muted-foreground mt-2">Family Office Alpha | Q1 2025 | Confidential</p>
                <button
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-foreground rounded-lg text-sm font-medium transition-colors print:hidden"
                    onClick={() => window.print()}
                >
                    Print / Export PDF
                </button>
            </div>

            {/* Executive Summary */}
            <section>
                <h2 className="text-xl font-bold text-foreground mb-3">Executive Summary</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    The portfolio ended Q1 2025 with a total AUM of <strong className="text-foreground">{formatCurrency(data.currentAUM, true)}</strong> across{" "}
                    <strong className="text-foreground">{data.holdingCount} holdings</strong> spanning {data.allocation.length} asset classes.
                    Fund investments generated a weighted IRR of <strong className="text-foreground">{formatPercent(data.portfolioIRR)}</strong> with
                    a TVPI of <strong className="text-foreground">{formatMultiple(data.portfolioTVPI)}</strong>.
                    The direct equity portfolio of {data.stocks.length} US stocks is valued at{" "}
                    <strong className="text-foreground">{formatCurrency(data.totalStockValue)}</strong> with unrealized gains of{" "}
                    <strong className="text-foreground">{formatCurrency(data.totalStockGL)}</strong>.
                    Annual income from dividends and bond coupons totals{" "}
                    <strong className="text-foreground">{formatCurrency(data.totalDividendIncome + data.totalBondIncome)}</strong>.
                </p>
            </section>

            <Separator className="bg-white/[0.06]" />

            {/* Portfolio Summary Metrics */}
            <section>
                <h2 className="text-xl font-bold text-foreground mb-3">Portfolio Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total AUM', value: formatCurrency(data.currentAUM, true) },
                        { label: 'Fund Commitments', value: formatCurrency(data.totalCommitment, true) },
                        { label: 'Direct Equities', value: formatCurrency(data.totalStockValue, true) },
                        { label: 'Fixed Income', value: formatCurrency(data.totalBondValue, true) },
                        { label: 'Alternatives', value: formatCurrency(data.totalAltsValue, true) },
                        { label: 'Cash', value: formatCurrency(data.cashPosition, true) },
                        { label: 'Fund IRR', value: formatPercent(data.portfolioIRR) },
                        { label: 'TVPI', value: formatMultiple(data.portfolioTVPI) },
                        { label: 'Equity P&L', value: `${data.totalStockGL >= 0 ? '+' : ''}${formatCurrency(data.totalStockGL, true)}` },
                        { label: 'Annual Income', value: formatCurrency(data.totalDividendIncome + data.totalBondIncome, true) },
                        { label: 'Holdings', value: String(data.holdingCount) },
                        { label: 'Unfunded', value: formatCurrency(data.totalUnfunded, true) },
                    ].map((m) => (
                        <div key={m.label} className="p-3 rounded-lg bg-muted/50 border border-border/70">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
                            <div className="text-lg font-bold text-foreground mt-0.5">{m.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            <Separator className="bg-white/[0.06]" />

            {/* Asset Allocation */}
            <section>
                <h2 className="text-xl font-bold text-foreground mb-3">Asset Allocation</h2>
                <AllocationBar items={data.allocation} />
            </section>

            <Separator className="bg-white/[0.06]" />

            {/* Top 10 Holdings */}
            <section>
                <h2 className="text-xl font-bold text-foreground mb-3">Top 10 Holdings by Value</h2>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left text-xs font-medium text-muted-foreground py-2">#</th>
                            <th className="text-left text-xs font-medium text-muted-foreground py-2">Holding</th>
                            <th className="text-left text-xs font-medium text-muted-foreground py-2">Type</th>
                            <th className="text-right text-xs font-medium text-muted-foreground py-2">Value</th>
                            <th className="text-right text-xs font-medium text-muted-foreground py-2">% of AUM</th>
                        </tr>
                    </thead>
                    <tbody>
                        {top10.map((h, i) => (
                            <tr key={i} className="border-b border-border/50">
                                <td className="py-2 text-muted-foreground">{i + 1}</td>
                                <td className="py-2 text-foreground font-medium">{h.name}</td>
                                <td className="py-2 text-muted-foreground">{h.typeName}</td>
                                <td className="py-2 text-right text-foreground">{formatCurrency(h.value, true)}</td>
                                <td className="py-2 text-right text-muted-foreground">{formatPercent(h.value / data.currentAUM)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <Separator className="bg-white/[0.06]" />

            {/* Fund Performance */}
            <section>
                <h2 className="text-xl font-bold text-foreground mb-3">Fund Performance</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-xs font-medium text-muted-foreground py-2">Fund</th>
                                <th className="text-left text-xs font-medium text-muted-foreground py-2">Type</th>
                                <th className="text-left text-xs font-medium text-muted-foreground py-2">Status</th>
                                <th className="text-right text-xs font-medium text-muted-foreground py-2">NAV</th>
                                <th className="text-right text-xs font-medium text-muted-foreground py-2">IRR</th>
                                <th className="text-right text-xs font-medium text-muted-foreground py-2">TVPI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.funds.sort((a, b) => b.nav - a.nav || b.tvpi - a.tvpi).map((f) => (
                                <tr key={f.id} className="border-b border-border/50">
                                    <td className="py-2 text-foreground text-xs">{f.name}</td>
                                    <td className="py-2 text-muted-foreground text-xs">{f.typeName}</td>
                                    <td className="py-2 text-xs">{f.status}</td>
                                    <td className="py-2 text-right text-foreground text-xs">{f.status === 'Written Off' ? '—' : formatCurrency(f.nav, true)}</td>
                                    <td className={`py-2 text-right text-xs font-medium ${f.irr > 0 ? 'text-positive' : 'text-negative'}`}>
                                        {formatPercent(f.irr)}
                                    </td>
                                    <td className="py-2 text-right text-foreground text-xs">{formatMultiple(f.tvpi)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <Separator className="bg-white/[0.06]" />

            {/* Equity Highlights */}
            <section>
                <h2 className="text-xl font-bold text-foreground mb-3">Equity Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-card border-border">
                        <CardContent className="pt-4">
                            <h3 className="text-sm font-semibold text-foreground mb-2">Top Winners</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    {topStocks.map((s) => (
                                        <tr key={s.id} className="border-b border-border/50">
                                            <td className="py-1.5 text-foreground font-mono font-semibold text-xs">{s.ticker}</td>
                                            <td className="py-1.5 text-muted-foreground text-xs">{s.name}</td>
                                            <td className="py-1.5 text-right text-positive text-xs">+{formatCurrency(s.unrealizedGL, true)}</td>
                                            <td className="py-1.5 text-right text-positive text-xs">{formatPercent(s.unrealizedPct)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardContent className="pt-4">
                            <h3 className="text-sm font-semibold text-foreground mb-2">Notable Losses</h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    {bottomStocks.map((s) => (
                                        <tr key={s.id} className="border-b border-border/50">
                                            <td className="py-1.5 text-foreground font-mono font-semibold text-xs">{s.ticker}</td>
                                            <td className="py-1.5 text-muted-foreground text-xs">{s.name}</td>
                                            <td className="py-1.5 text-right text-negative text-xs">{formatCurrency(s.unrealizedGL, true)}</td>
                                            <td className="py-1.5 text-right text-negative text-xs">{formatPercent(s.unrealizedPct)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Separator className="bg-white/[0.06]" />

            {/* Risk Dashboard */}
            <section>
                <h2 className="text-xl font-bold text-foreground mb-3">Risk Dashboard</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Volatility', value: '14.2%' },
                        { label: 'Sharpe', value: '1.28' },
                        { label: 'Max Drawdown', value: '-18.4%', cls: 'text-negative' },
                        { label: 'LCR', value: '1.84x', cls: 'text-positive' },
                    ].map((m) => (
                        <div key={m.label} className="p-3 rounded-lg bg-muted/50 border border-border/70 text-center">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
                            <div className={`text-xl font-bold mt-0.5 ${m.cls || 'text-foreground'}`}>{m.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Report Footer */}
            <div className="text-center py-6 border-t border-border text-xs text-muted-foreground space-y-1">
                <p>Prepared by <strong className="text-foreground">VintageIQ</strong> — Family Office Intelligence Platform</p>
                <p>This report is confidential and intended for authorized recipients only.</p>
                <p>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
        </div>
    );
}
