import { generatePortfolioData, formatCurrency } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AttributionPage() {
    const data = generatePortfolioData();

    const attributionData = [
        { factor: 'Selection', bps: 450, color: '#10b981' },
        { factor: 'Allocation', bps: 280, color: '#2563eb' },
        { factor: 'Timing', bps: 120, color: '#0d9488' },
        { factor: 'FX', bps: -60, color: '#d97706' },
        { factor: 'Fees', bps: -180, color: '#ef4444' },
    ];
    const maxBps = Math.max(...attributionData.map(a => Math.abs(a.bps)));

    const totalAnnualIncome = data.totalDividendIncome + data.totalBondIncome + data.totalDistributions * 0.12;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Attribution & Fees</h1>
                <p className="text-sm text-muted-foreground mt-1">Return attribution and fee impact analysis</p>
            </div>

            {/* Return Attribution Bar Chart */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Return Attribution (bps)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {attributionData.map((item) => {
                            const widthPct = (Math.abs(item.bps) / maxBps) * 100;
                            const isNeg = item.bps < 0;
                            return (
                                <div key={item.factor}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-foreground font-medium">{item.factor}</span>
                                        <span className={`font-semibold ${isNeg ? "text-negative" : "text-positive"}`}>
                                            {isNeg ? "" : "+"}{item.bps} bps
                                        </span>
                                    </div>
                                    <div className="h-6 bg-muted/50 rounded overflow-hidden">
                                        <div
                                            className="h-full rounded transition-all duration-700"
                                            style={{
                                                width: `${widthPct}%`,
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
                        <span className="text-muted-foreground">Net Alpha (after fees)</span>
                        <span className="text-positive font-bold">
                            +{attributionData.reduce((s, a) => s + a.bps, 0)} bps
                        </span>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Fee Summary */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Fee Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <tbody>
                                {[
                                    { label: 'Fund Management Fees (avg)', value: '1.4%', cls: '' },
                                    { label: 'Carry / Performance Fees', value: '$14.2M accrued', cls: '' },
                                    { label: 'Brokerage Commissions', value: '$82K', cls: '' },
                                    { label: 'Custody & Admin', value: '0.08%', cls: '' },
                                    { label: 'Total Fee Drag', value: '−1.6%', cls: 'text-negative font-bold' },
                                ].map((row) => (
                                    <tr key={row.label} className="border-b border-border/50">
                                        <td className="py-3 text-muted-foreground">{row.label}</td>
                                        <td className={`py-3 text-right font-medium ${row.cls || 'text-foreground'}`}>{row.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Income Summary */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Income Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <tbody>
                                {[
                                    { label: 'Stock Dividends', value: `${formatCurrency(data.totalDividendIncome)}/yr` },
                                    { label: 'Bond Coupon Income', value: `${formatCurrency(data.totalBondIncome)}/yr` },
                                    { label: 'Fund Distributions (TTM)', value: formatCurrency(data.totalDistributions * 0.12, true) },
                                ].map((row) => (
                                    <tr key={row.label} className="border-b border-border/50">
                                        <td className="py-3 text-muted-foreground">{row.label}</td>
                                        <td className="py-3 text-right font-semibold text-positive">{row.value}</td>
                                    </tr>
                                ))}
                                <tr className="border-t-2 border-border">
                                    <td className="py-3 text-foreground font-bold">Total Annual Income</td>
                                    <td className="py-3 text-right font-bold text-positive">{formatCurrency(totalAnnualIncome)}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Yield visualization */}
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="text-xs text-muted-foreground mb-1">Portfolio Yield</div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: `${(totalAnnualIncome / data.currentAUM) * 100 * 20}%` }} />
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-positive">
                                    {((totalAnnualIncome / data.currentAUM) * 100).toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
