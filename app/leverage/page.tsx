import { StatCard } from "@/components/portfolio/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeveragePage() {
    const debtMaturity = [
        { year: '2025', amount: 45, color: '#ef4444' },
        { year: '2026', amount: 62, color: '#d97706' },
        { year: '2027', amount: 38, color: '#f59e0b' },
        { year: '2028', amount: 85, color: '#2563eb' },
        { year: '2029', amount: 28, color: '#0d9488' },
        { year: '2030+', amount: 15, color: '#10b981' },
    ];

    const maxDebt = Math.max(...debtMaturity.map(d => d.amount));
    const totalDebt = debtMaturity.reduce((s, d) => s + d.amount, 0);

    const loanFacilities = [
        { name: 'Morgan Stanley Credit Line', type: 'Revolving', drawn: 42, limit: 100, rate: '5.25%', maturity: '2027' },
        { name: 'JP Morgan Term Loan', type: 'Term', drawn: 85, limit: 85, rate: '5.50%', maturity: '2028' },
        { name: 'Goldman Sachs PAL', type: 'Securities-Based', drawn: 65, limit: 150, rate: '4.80%', maturity: '2026' },
        { name: 'Real Estate Mortgage', type: 'Mortgage', drawn: 55, limit: 55, rate: '4.25%', maturity: '2032' },
        { name: 'Capital Call Facility', type: 'Subscription', drawn: 26, limit: 75, rate: '5.75%', maturity: '2025' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Leverage & Financing</h1>
                <p className="text-sm text-muted-foreground mt-1">LTV ratios and debt maturity analysis</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard label="LTV" value="28.4%" subValue="Target < 35%" />
                <StatCard label="Fixed Rate" value="60%" subValue="Floating: 40%" />
                <StatCard label="Wtd Avg Cost" value="5.4%" subValue="Blended rate" />
                <StatCard label="ISCR" value="4.2x" trend="up" trendValue="Healthy" />
            </div>

            {/* Debt Maturity Profile */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Debt Maturity Profile ($M)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-3 h-48">
                        {debtMaturity.map((d) => {
                            const heightPct = (d.amount / maxDebt) * 100;
                            return (
                                <div key={d.year} className="flex-1 flex flex-col items-center justify-end h-full group">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-foreground font-medium mb-1">
                                        ${d.amount}M
                                    </div>
                                    <div
                                        className="w-full max-w-12 rounded-t transition-all duration-500"
                                        style={{ height: `${heightPct}%`, backgroundColor: d.color }}
                                    />
                                    <span className="text-xs text-muted-foreground mt-2">{d.year}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Outstanding Debt</span>
                        <span className="text-foreground font-bold">${totalDebt}M</span>
                    </div>
                </CardContent>
            </Card>

            {/* Loan Facilities */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Loan Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Facility</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Type</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Drawn</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Limit</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Utilization</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Rate</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Maturity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loanFacilities.map((loan) => {
                                    const utilization = loan.drawn / loan.limit;
                                    return (
                                        <tr key={loan.name} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                            <td className="py-2.5 px-2 text-foreground font-medium text-xs">{loan.name}</td>
                                            <td className="py-2.5 px-2 text-muted-foreground text-xs">{loan.type}</td>
                                            <td className="py-2.5 px-2 text-right text-foreground text-xs">${loan.drawn}M</td>
                                            <td className="py-2.5 px-2 text-right text-muted-foreground text-xs">${loan.limit}M</td>
                                            <td className="py-2.5 px-2 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${utilization > 0.8 ? 'bg-red-500' : utilization > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${utilization * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{(utilization * 100).toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-2 text-right text-foreground text-xs">{loan.rate}</td>
                                            <td className="py-2.5 px-2 text-right text-muted-foreground text-xs">{loan.maturity}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Covenant Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Covenant Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { covenant: 'LTV < 35%', actual: '28.4%', status: true },
                                { covenant: 'ISCR > 2.0x', actual: '4.2x', status: true },
                                { covenant: 'Minimum Liquidity > $25M', actual: '$42M', status: true },
                                { covenant: 'Max Single Exposure < 15%', actual: '8.2%', status: true },
                            ].map((c) => (
                                <div key={c.covenant} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div>
                                        <span className="text-sm text-foreground">{c.covenant}</span>
                                        <span className="text-xs text-muted-foreground ml-2">Actual: {c.actual}</span>
                                    </div>
                                    <span className={`text-sm font-semibold ${c.status ? 'text-positive' : 'text-negative'}`}>
                                        {c.status ? '✓ Pass' : '✗ Breach'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Interest Rate Sensitivity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { scenario: '+100 bps', impact: '-$2.8M', desc: 'Annual interest cost increase' },
                                { scenario: '+200 bps', impact: '-$5.6M', desc: 'Annual interest cost increase' },
                                { scenario: '-100 bps', impact: '+$2.8M', desc: 'Annual interest cost saving' },
                            ].map((s) => (
                                <div key={s.scenario} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div>
                                        <span className="text-sm text-foreground font-medium">{s.scenario}</span>
                                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                                    </div>
                                    <span className={`text-sm font-semibold ${s.impact.startsWith('+') ? 'text-positive' : 'text-negative'}`}>
                                        {s.impact}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
