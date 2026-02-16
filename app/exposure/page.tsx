import { generatePortfolioData, formatCurrency, formatPercent } from "@/lib/analytics";
import { AllocationBar } from "@/components/portfolio/allocation-bar";
import { ProgressBar } from "@/components/portfolio/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExposurePage() {
    const data = generatePortfolioData();

    const geoBreakdown = [
        { label: 'United States', pct: 72, color: '#2563eb' },
        { label: 'Global / Multi', pct: 16, color: '#7c3aed' },
        { label: 'International', pct: 8, color: '#0d9488' },
        { label: 'Emerging Markets', pct: 4, color: '#8b5cf6' },
    ];

    const sectorBreakdown = [
        { label: 'Technology', pct: 34, color: '#2563eb' },
        { label: 'Financials', pct: 14, color: '#1B2A4A' },
        { label: 'Healthcare', pct: 10, color: '#0d9488' },
        { label: 'Real Assets / RE', pct: 12, color: '#d97706' },
        { label: 'Consumer', pct: 9, color: '#7c3aed' },
        { label: 'Energy', pct: 5, color: '#8b5cf6' },
        { label: 'Fixed Income', pct: 10, color: '#10b981' },
        { label: 'Other', pct: 6, color: '#64748b' },
    ];

    // Vintage year breakdown
    const vintageMap: Record<number, number> = {};
    data.activeFunds.forEach(f => { vintageMap[f.vintage] = (vintageMap[f.vintage] || 0) + f.nav; });
    const vintageYears = Object.keys(vintageMap).map(Number).sort();
    const maxVintageNAV = Math.max(...Object.values(vintageMap));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Exposure & Allocation</h1>
                <p className="text-sm text-muted-foreground mt-1">Strategy, geography, sector, and vintage breakdowns</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Full Asset Allocation */}
                <Card className="bg-card border-border hover-lift">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Full Asset Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AllocationBar items={data.allocation} />
                    </CardContent>
                </Card>

                {/* Geographic Breakdown */}
                <Card className="bg-card border-border hover-lift">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Geographic Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {geoBreakdown.map((geo) => (
                                <ProgressBar key={geo.label} label={geo.label} value={`${geo.pct}%`} pct={geo.pct} color={geo.color} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Sector Exposure */}
                <Card className="bg-card border-border hover-lift">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Sector Exposure (All Holdings)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {sectorBreakdown.map((sector) => (
                                <ProgressBar key={sector.label} label={sector.label} value={`${sector.pct}%`} pct={sector.pct} color={sector.color} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Vintage Year */}
                <Card className="bg-card border-border hover-lift">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Vintage Year (Fund NAV by Vintage)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-1.5 h-48 w-full px-1">
                            {vintageYears.map((year) => {
                                const nav = vintageMap[year];
                                const heightPct = (nav / maxVintageNAV) * 100;
                                return (
                                    <div key={year} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-foreground font-medium mb-1 whitespace-nowrap">
                                            {formatCurrency(nav, true)}
                                        </div>
                                        <div
                                            className="w-full max-w-8 rounded-t bg-gradient-to-t from-primary/80 to-primary/40 transition-all duration-500"
                                            style={{ height: `${heightPct}%` }}
                                        />
                                        <span className="text-[10px] text-muted-foreground mt-1 font-mono">{year}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Strategy Breakdown */}
            <Card className="bg-card border-border hover-lift">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Strategy Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Strategy</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Funds</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">NAV</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">% of Fund NAV</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Avg IRR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(data.assetNames)
                                    .filter(([k]) => ['PE', 'VC', 'RE', 'PC', 'EQ_FUNDS', 'PUBLIC_EQ', 'BONDS', 'CRYPTO', 'HEDGE'].includes(k))
                                    .map(([type, name]) => {
                                        const tf = data.funds.filter(f => f.type === type);
                                        if (!tf.length) return null;
                                        const totalNAV = tf.reduce((s, f) => s + f.nav, 0);
                                        const avgIRR = tf.reduce((s, f) => s + f.irr, 0) / tf.length;
                                        return (
                                            <tr key={type} className="data-table-row">
                                                <td className="py-2.5 px-2 text-foreground font-medium">{name}</td>
                                                <td className="py-2.5 px-2 text-right text-muted-foreground">{tf.length}</td>
                                                <td className="py-2.5 px-2 text-right text-foreground">{formatCurrency(totalNAV, true)}</td>
                                                <td className="py-2.5 px-2 text-right text-muted-foreground">{formatPercent(data.fundNAV > 0 ? totalNAV / data.fundNAV : 0)}</td>
                                                <td className={`py-2.5 px-2 text-right font-medium ${avgIRR >= 0 ? "text-positive" : "text-negative"}`}>
                                                    {formatPercent(avgIRR)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
