import { generatePortfolioData, formatCurrency, formatPercent, formatMultiple } from "@/lib/analytics";
import { StatCard } from "@/components/portfolio/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WaterfallChart } from "@/components/portfolio/waterfall-chart";

export default function PerformancePage() {
    const data = generatePortfolioData();
    const benchmarks: Record<string, number> = { PE: 0.16, VC: 0.22, RE: 0.11, PC: 0.08, EQ_FUNDS: 0.10 };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Performance</h1>
                <p className="text-sm text-muted-foreground mt-1">Strategy benchmarking and return attribution</p>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard label="Fund IRR" value={formatPercent(data.portfolioIRR)} trend="up" trendValue="+2.1% alpha vs benchmark" />
                <StatCard label="Gross MOIC" value={formatMultiple(data.portfolioMOIC)} subValue={`Net: ${formatMultiple(data.portfolioMOIC * 0.92)}`} />
                <StatCard label="Equity SI Return (Ann.)" value={formatPercent(data.eqReturnSI)} trend={data.eqReturnSI && data.eqReturnSI >= 0 ? "up" : "down"} trendValue={`1Y: ${formatPercent(data.eqReturn1Y)}`} />
                <StatCard label="PME" value="1.14x" subValue="vs S&P 500" />
            </div>

            {/* Equity Returns by Period */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Equity Returns by Period (Annualized, Value-Weighted)</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Period</th>
                                <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Return</th>
                                <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { period: "YTD", value: data.eqReturnYTD, desc: "Q4 2024 → Q1 2025 (not annualized)" },
                                { period: "1 Year", value: data.eqReturn1Y, desc: "Q1 2024 → Q1 2025" },
                                { period: "3 Year CAGR", value: data.eqReturn3Y, desc: "Annualized, positions held ≥ 3Y" },
                                { period: "5 Year CAGR", value: data.eqReturn5Y, desc: "Annualized, positions held ≥ 5Y" },
                                { period: "Since Inception", value: data.eqReturnSI, desc: "Value-weighted CAGR across all positions" },
                            ].map((row) => (
                                <tr key={row.period} className={`border-b border-border/50 ${row.period === "Since Inception" ? "border-t-2 border-t-border" : ""}`}>
                                    <td className="py-2.5 px-2 font-medium text-foreground">{row.period}</td>
                                    <td className={`py-2.5 px-2 text-right font-semibold ${row.value !== null && row.value !== undefined && row.value >= 0 ? "text-positive" : "text-negative"}`}>
                                        {formatPercent(row.value)}
                                    </td>
                                    <td className="py-2.5 px-2 text-muted-foreground text-xs">{row.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Annual Returns Bar Chart */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Annual Returns</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-1 h-48">
                        {data.history.yearly.map((year) => {
                            const pctVal = parseFloat(year.returnPct);
                            const maxAbs = Math.max(...data.history.yearly.map(y => Math.abs(parseFloat(y.returnPct))));
                            const heightPct = Math.abs(pctVal) / maxAbs * 100;
                            const isNeg = pctVal < 0;
                            return (
                                <div key={year.year} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                                    <div className="absolute -top-1 text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {pctVal >= 0 ? "+" : ""}{year.returnPct}%
                                    </div>
                                    <div className="w-full flex flex-col items-center justify-end flex-1">
                                        {!isNeg && (
                                            <div className="mt-auto w-full max-w-6 rounded-t transition-all duration-500" style={{ height: `${heightPct}%`, backgroundColor: '#10b981' }} />
                                        )}
                                        {isNeg && (
                                            <div className="mt-auto w-full max-w-6 rounded-b transition-all duration-500" style={{ height: `${heightPct}%`, backgroundColor: '#ef4444' }} />
                                        )}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground mt-1">{year.year}</span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Cash Flow Analysis */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Cash Flow Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Waterfalls Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                        <WaterfallChart title="YTD Waterfall (2025)" items={data.history.ytdWaterfall} />
                        <WaterfallChart title="Since Inception Waterfall" items={data.history.siWaterfall} />
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        {/* Cumulative Cash Flows */}
                        <h3 className="text-sm font-semibold text-muted-foreground mb-6">Cumulative Cash Flows — Since Inception</h3>
                        <div className="flex items-end gap-1 h-56">
                            {data.history.yearly.map((year) => {
                                const maxCum = Math.max(...data.history.yearly.map(y => y.cumInjections + y.cumGains + y.cumDistributions));
                                const total = year.cumInjections + year.cumGains + year.cumDistributions;
                                const injPct = (year.cumInjections / maxCum) * 100;
                                const gainsPct = (year.cumGains / maxCum) * 100;
                                const distPct = (year.cumDistributions / maxCum) * 100;
                                return (
                                    <div key={year.year} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                        <div className="w-full max-w-6 flex flex-col justify-end transition-all duration-300 group-hover:scale-x-110" style={{ height: '100%' }}>
                                            <div className="rounded-t-sm" style={{ height: `${distPct}%`, backgroundColor: '#d97706', minHeight: distPct > 0 ? '1px' : 0 }} />
                                            <div style={{ height: `${gainsPct}%`, backgroundColor: '#10b981', minHeight: gainsPct > 0 ? '1px' : 0 }} />
                                            <div className="rounded-b-sm" style={{ height: `${injPct}%`, backgroundColor: '#2563eb', minHeight: injPct > 0 ? '1px' : 0 }} />
                                        </div>
                                        <span className="text-[9px] text-muted-foreground mt-2 font-medium">{year.year}</span>

                                        {/* Tooltip on hover */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] p-2 rounded shadow-lg border border-border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap">
                                            <div className="font-bold border-b border-border pb-1 mb-1">{year.year}</div>
                                            <div className="flex justify-between gap-4"><span>Inj:</span> <span>{formatCurrency(year.cumInjections, true)}</span></div>
                                            <div className="flex justify-between gap-4"><span>Gains:</span> <span>{formatCurrency(year.cumGains, true)}</span></div>
                                            <div className="flex justify-between gap-4"><span>Dist:</span> <span>{formatCurrency(year.cumDistributions, true)}</span></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-6 mt-6 justify-center">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded-sm bg-[#2563eb]" /> Cumulative Injections</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded-sm bg-[#10b981]" /> Investment Gains</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-3 h-3 rounded-sm bg-[#d97706]" /> Distributions</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Annual Cash Flow Breakdown Table */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Annual Cash Flow Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Year</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Injections</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Gains</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Distributions</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Income</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Net Cash Flow</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Ending AUM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.history.yearly.slice().reverse().map((h) => (
                                    <tr key={h.year} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                        <td className="py-2 px-2 font-medium text-foreground">{h.year}</td>
                                        <td className="py-2 px-2 text-right text-foreground">{formatCurrency(h.injection, true)}</td>
                                        <td className={`py-2 px-2 text-right font-medium ${h.gains >= 0 ? "text-positive" : "text-negative"}`}>
                                            {h.gains >= 0 ? "+" : ""}{formatCurrency(h.gains, true)}
                                        </td>
                                        <td className="py-2 px-2 text-right text-positive">{formatCurrency(h.distributions, true)}</td>
                                        <td className="py-2 px-2 text-right text-foreground">{formatCurrency(h.income, true)}</td>
                                        <td className={`py-2 px-2 text-right font-semibold ${h.netCashFlow >= 0 ? "text-positive" : "text-negative"}`}>
                                            {h.netCashFlow >= 0 ? "+" : ""}{formatCurrency(h.netCashFlow, true)}
                                        </td>
                                        <td className="py-2 px-2 text-right text-foreground font-medium">{formatCurrency(h.aum, true)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Strategy Benchmarking */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Strategy Benchmarking</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Strategy</th>
                                <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Funds</th>
                                <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">IRR</th>
                                <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Benchmark</th>
                                <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Alpha</th>
                                <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Quartile</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(['PE', 'VC', 'RE', 'PC', 'EQ_FUNDS'] as const).map((type) => {
                                const tf = data.funds.filter(f => f.type === type);
                                if (!tf.length) return null;
                                const avg = tf.reduce((s, f) => s + f.irr, 0) / tf.length;
                                const bm = benchmarks[type] || 0.10;
                                const alpha = avg - bm;
                                return (
                                    <tr key={type} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                        <td className="py-2.5 px-2 text-foreground font-medium">{data.assetNames[type]}</td>
                                        <td className="py-2.5 px-2 text-muted-foreground">{tf.length}</td>
                                        <td className="py-2.5 px-2 text-right text-foreground">{formatPercent(avg)}</td>
                                        <td className="py-2.5 px-2 text-right text-muted-foreground">{formatPercent(bm)}</td>
                                        <td className={`py-2.5 px-2 text-right font-medium ${alpha > 0 ? "text-positive" : "text-negative"}`}>
                                            {alpha > 0 ? "+" : ""}{formatPercent(alpha)}
                                        </td>
                                        <td className="py-2.5 px-2">
                                            <Badge variant="outline" className={`text-[10px] ${alpha > 0.02 ? "border-emerald-500/30 text-positive" :
                                                alpha > 0 ? "border-blue-500/30 text-blue-400" :
                                                    "border-amber-500/30 text-amber-400"
                                                }`}>
                                                {alpha > 0.02 ? "Top Quartile" : alpha > 0 ? "Upper Half" : "Lower Half"}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
