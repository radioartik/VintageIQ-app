import { generatePortfolioData, formatCurrency } from "@/lib/analytics";
import { StatCard } from "@/components/portfolio/stat-card";
import { ProgressBar } from "@/components/portfolio/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LiquidityPage() {
    const data = generatePortfolioData();
    const shortTermLiquidity = data.totalStockValue * 0.15 + data.totalBondValue * 0.2 + data.cashPosition;
    const expectedCalls = data.totalUnfunded * 0.3;

    const monthlyFlows = [
        { month: 'Jan', flow: 8 }, { month: 'Feb', flow: -5 }, { month: 'Mar', flow: 12 },
        { month: 'Apr', flow: -18 }, { month: 'May', flow: 6 }, { month: 'Jun', flow: -3 },
        { month: 'Jul', flow: 22 }, { month: 'Aug', flow: -10 }, { month: 'Sep', flow: 15 },
        { month: 'Oct', flow: -7 }, { month: 'Nov', flow: 9 }, { month: 'Dec', flow: -4 },
    ];

    const liquidityBuckets = [
        { label: 'Immediate (Cash)', pct: 4, color: '#0d9488' },
        { label: '\u003c 30 Days (Public Eq)', pct: 15, color: '#2563eb' },
        { label: '30-90 Days (Bonds)', pct: 10, color: '#d97706' },
        { label: '1-3 Years (PE/VC)', pct: 22, color: '#8b5cf6' },
        { label: '\u003e 3 Years (Illiquid)', pct: 49, color: '#1B2A4A' },
    ];

    const maxFlow = Math.max(...monthlyFlows.map(m => Math.abs(m.flow)));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Liquidity & Cash Flow</h1>
                <p className="text-sm text-muted-foreground mt-1">Cash flow forecasting and liquidity coverage</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard label="Cash & MM" value={formatCurrency(data.cashPosition, true)} subValue="Immediately available" />
                <StatCard label="\u003c 90 Days" value={formatCurrency(shortTermLiquidity, true)} subValue="Public equity + bonds + cash" />
                <StatCard label="Expected Calls (12m)" value={formatCurrency(expectedCalls, true)} trend="down" trendValue={`${data.activeFunds.filter(f => f.unfunded > 0).length} funds pending`} />
                <StatCard label="LCR" value="1.84x" trend="up" trendValue="Above target" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Net Cash Flow Forecast */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Net Cash Flow Forecast (Monthly $M)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 h-48">
                            {monthlyFlows.map((m) => {
                                const heightPct = (Math.abs(m.flow) / maxFlow) * 100;
                                const isNeg = m.flow < 0;
                                return (
                                    <div key={m.month} className="flex-1 flex flex-col items-center h-full group">
                                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                                            {!isNeg && (
                                                <div className="mt-auto w-full max-w-5 rounded-t transition-all duration-500" style={{ height: `${heightPct / 2}%`, backgroundColor: '#10b981' }} />
                                            )}
                                            <div className="w-full h-px bg-border" />
                                            {isNeg && (
                                                <div className="w-full max-w-5 rounded-b transition-all duration-500" style={{ height: `${heightPct / 2}%`, backgroundColor: '#ef4444' }} />
                                            )}
                                        </div>
                                        <div className="text-[9px] text-muted-foreground mt-1">{m.month}</div>
                                        <div className={`text-[9px] font-medium ${isNeg ? 'text-negative' : 'text-positive'} opacity-0 group-hover:opacity-100`}>
                                            {isNeg ? '' : '+'}${m.flow}M
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Liquidity Buckets */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Liquidity Buckets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {liquidityBuckets.map((bucket) => (
                                <ProgressBar
                                    key={bucket.label}
                                    label={bucket.label}
                                    value={`${bucket.pct}%`}
                                    pct={bucket.pct}
                                    color={bucket.color}
                                />
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground">{"Liquid (< 90d)"}</div>
                                <div className="text-lg font-bold text-foreground">29%</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">{"Illiquid (> 1Y)"}</div>
                                <div className="text-lg font-bold text-foreground">71%</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Capital Call Schedule */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Upcoming Capital Calls (12-Month Projection)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Fund</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Type</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Unfunded</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Est. Calls (12m)</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">% Called</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.activeFunds
                                    .filter(f => f.unfunded > 0)
                                    .sort((a, b) => b.unfunded - a.unfunded)
                                    .map((fund) => {
                                        const estCall = fund.unfunded * 0.3;
                                        const calledPct = fund.paidIn / fund.commitment;
                                        return (
                                            <tr key={fund.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                                <td className="py-2.5 px-2 text-foreground font-medium text-xs">{fund.name}</td>
                                                <td className="py-2.5 px-2 text-muted-foreground text-xs">{fund.typeName}</td>
                                                <td className="py-2.5 px-2 text-right text-foreground text-xs">{formatCurrency(fund.unfunded, true)}</td>
                                                <td className="py-2.5 px-2 text-right text-negative font-medium text-xs">{formatCurrency(estCall, true)}</td>
                                                <td className="py-2.5 px-2 text-right">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${calledPct * 100}%` }} />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{(calledPct * 100).toFixed(0)}%</span>
                                                    </div>
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
