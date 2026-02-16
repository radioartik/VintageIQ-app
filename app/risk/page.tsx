import { generatePortfolioData, formatCurrency, formatPercent } from "@/lib/analytics";
import { StatCard } from "@/components/portfolio/stat-card";
import { ProgressBar } from "@/components/portfolio/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RiskPage() {
    const data = generatePortfolioData();
    const drawdownData = [0, -1, -3, 0, 2, 1, -2, 0, 3, -5, -12, 0, 8, 12, -8, -18, -10, 0, 5, 8];

    // Build top 10 holdings from all active assets
    const allHoldings = [
        ...data.activeFunds.map(f => ({ name: f.name, value: f.nav, color: f.color })),
        ...data.stocks.map(s => ({ name: s.ticker, value: s.marketValue, color: s.color })),
    ].sort((a, b) => b.value - a.value).slice(0, 10);

    const riskLevels = [
        { label: 'PE/VC (Illiquid)', level: 'High', pct: 100, color: '#ef4444' },
        { label: 'Real Estate', level: 'Medium-High', pct: 75, color: '#8b5cf6' },
        { label: 'Direct Equities', level: 'Medium', pct: 50, color: '#2563eb' },
        { label: 'Bonds/Credit', level: 'Low-Medium', pct: 35, color: '#0d9488' },
        { label: 'Cash', level: 'Low', pct: 10, color: '#10b981' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Risk & Concentration</h1>
                <p className="text-sm text-muted-foreground mt-1">Portfolio risk metrics and stress testing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <StatCard label="Portfolio Vol" value="14.2%" subValue="Annualized std dev" />
                <StatCard label="Max Drawdown" value="-18.4%" trend="down" trendValue="Peak-to-trough (2022)" />
                <StatCard label="Sharpe Ratio" value="1.28" trend="up" trendValue="Risk-adjusted" />
            </div>

            {/* Drawdown Profile */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Drawdown Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-40 flex items-center">
                        <svg viewBox="0 0 400 140" className="w-full h-full" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                            <line x1="0" y1="35" x2="400" y2="35" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                            <line x1="0" y1="105" x2="400" y2="105" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                            {/* Area fill */}
                            <path
                                d={`M0,${70 - drawdownData[0] * 3.5} ${drawdownData.map((d, i) => `L${(i / (drawdownData.length - 1)) * 400},${70 - d * 3.5}`).join(' ')} L400,70 L0,70 Z`}
                                fill="url(#drawdownGradient)"
                                opacity="0.3"
                            />

                            {/* Line */}
                            <polyline
                                points={drawdownData.map((d, i) => `${(i / (drawdownData.length - 1)) * 400},${70 - d * 3.5}`).join(' ')}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Gradient definition */}
                            <defs>
                                <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        {data.history.yearly.filter((_, i) => i % 4 === 0).map(y => (
                            <span key={y.year}>{y.year}</span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Top 10 Concentration */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Top 10 Concentration (All Holdings)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {allHoldings.map((h, i) => (
                                <ProgressBar
                                    key={i}
                                    label={h.name}
                                    value={formatPercent(h.value / data.currentAUM)}
                                    pct={(h.value / data.currentAUM) * 100 * 3}
                                    color={h.color}
                                />
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-border">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Top 10 Concentration</span>
                                <span className="text-foreground font-medium">
                                    {formatPercent(allHoldings.reduce((s, h) => s + h.value, 0) / data.currentAUM)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Asset Class Risk */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Asset Class Risk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {riskLevels.map((risk) => (
                                <ProgressBar
                                    key={risk.label}
                                    label={risk.label}
                                    value={risk.level}
                                    pct={risk.pct}
                                    color={risk.color}
                                />
                            ))}
                        </div>

                        {/* VaR Summary */}
                        <div className="mt-6 pt-4 border-t border-border space-y-3">
                            <div className="text-sm font-medium text-foreground mb-2">Value at Risk (VaR)</div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <div className="text-xs text-muted-foreground">95% VaR</div>
                                    <div className="text-lg font-bold text-negative">-$42M</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <div className="text-xs text-muted-foreground">99% VaR</div>
                                    <div className="text-lg font-bold text-negative">-$78M</div>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-muted/50">
                                    <div className="text-xs text-muted-foreground">CVaR (ES)</div>
                                    <div className="text-lg font-bold text-negative">-$95M</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
