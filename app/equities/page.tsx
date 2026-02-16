"use client";

import { useRouter } from "next/navigation";
import { generatePortfolioData, formatCurrency, formatPercent } from "@/lib/analytics";
import { StatCard } from "@/components/portfolio/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/portfolio/progress-bar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function EquitiesPage() {
    const data = generatePortfolioData();
    const router = useRouter();
    const sortedStocks = [...data.stocks].sort((a, b) => b.marketValue - a.marketValue);
    const winners = [...data.stocks].filter(s => s.unrealizedGL > 0).sort((a, b) => b.unrealizedGL - a.unrealizedGL);
    const losers = [...data.stocks].filter(s => s.unrealizedGL < 0).sort((a, b) => a.unrealizedGL - b.unrealizedGL);
    const chartColors = ['#1B2A4A', '#2563eb', '#0d9488', '#6366f1', '#d97706', '#ec4899'];

    const exportCSV = () => {
        const headers = ["Ticker", "Name", "Sector", "Strategy", "Shares", "Avg Cost", "Current Price", "Market Value", "Unrealized GL", "Unrealized Pct", "Yield"];
        const rows = sortedStocks.map(s => [
            s.ticker, `"${s.name}"`, s.sector, s.strategy, s.shares, s.avgCost, s.currentPrice, s.marketValue, s.unrealizedGL, (s.unrealizedPct * 100).toFixed(2) + "%", s.divYield.toFixed(2) + "%"
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "equity_holdings.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Equity Holdings</h1>
                    <p className="text-sm text-muted-foreground mt-1">{data.stocks.length} direct equity positions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{data.stocks.length} positions</Badge>
                    <Badge variant="outline" className={`text-xs ${data.totalStockGL >= 0 ? "border-emerald-500/30 text-positive" : "border-red-500/30 text-negative"}`}>
                        {data.totalStockGL >= 0 ? "+" : ""}{formatCurrency(data.totalStockGL, true)} P&L
                    </Badge>
                    <Button variant="outline" size="sm" onClick={exportCSV} title="Export CSV" className="ml-2">
                        <Download className="w-3.5 h-3.5 mr-2" /> Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="Market Value" value={formatCurrency(data.totalStockValue, true)} subValue={`${formatPercent(data.totalStockValue / data.currentAUM)} of portfolio`} />
                <StatCard label="Cost Basis" value={formatCurrency(data.totalStockCost, true)} subValue={`${data.stocks.length} positions`} />
                <StatCard label="Unrealized P&L" value={`${data.totalStockGL >= 0 ? "+" : ""}${formatCurrency(data.totalStockGL, true)}`} trend={data.totalStockGL >= 0 ? "up" : "down"} trendValue={formatPercent(data.totalStockGL / data.totalStockCost)} />
                <StatCard label="Dividend Income" value={formatCurrency(data.totalDividendIncome, true)} subValue={`Avg yield: ${(data.totalDividendIncome / data.totalStockValue * 100).toFixed(2)}%`} />
                <StatCard label="SI Return" value={formatPercent(data.eqReturnSI)} trend="up" trendValue="CAGR" />
            </div>

            {/* Positions Table */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">All Positions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Ticker</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Name</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Sector</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Mkt Value</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">P&L</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">YTD</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">1Y</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Since Inception</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Total Return</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStocks.map((stock) => (
                                    <tr
                                        key={stock.id}
                                        className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/equities/${stock.ticker}`)}
                                    >
                                        <td className="py-2.5 px-2 font-mono font-semibold text-primary group-hover:underline">{stock.ticker}</td>
                                        <td className="py-2.5 px-2 text-muted-foreground">{stock.name}</td>
                                        <td className="py-2.5 px-2"><Badge variant="outline" className="text-[10px]">{stock.sector}</Badge></td>
                                        <td className="py-2.5 px-2 text-right text-foreground font-medium">{formatCurrency(stock.marketValue, true)}</td>
                                        <td className={`py-2.5 px-2 text-right font-medium ${stock.unrealizedGL >= 0 ? 'text-positive' : 'text-negative'}`}>
                                            {stock.unrealizedGL >= 0 ? "+" : ""}{formatCurrency(stock.unrealizedGL, true)}
                                        </td>
                                        <td className={`py-2.5 px-2 text-right ${stock.returnYTD !== null && stock.returnYTD >= 0 ? 'text-positive' : 'text-negative'}`}>
                                            {formatPercent(stock.returnYTD)}
                                        </td>
                                        <td className={`py-2.5 px-2 text-right ${stock.return1Y !== null && stock.return1Y >= 0 ? 'text-positive' : 'text-negative'}`}>
                                            {formatPercent(stock.return1Y)}
                                        </td>
                                        <td className={`py-2.5 px-2 text-right font-semibold ${stock.returnSI >= 0 ? 'text-positive' : 'text-negative'}`}>
                                            {stock.returnSI >= 0 ? "+" : ""}{formatPercent(stock.returnSI)}
                                        </td>
                                        <td className={`py-2.5 px-2 text-right ${stock.totalReturn >= 0 ? 'text-positive' : 'text-negative'}`}>
                                            {stock.totalReturn >= 0 ? "+" : ""}{formatPercent(stock.totalReturn)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-border font-semibold bg-muted/30">
                                    <td className="py-2.5 px-2 text-foreground text-xs" colSpan={3}>
                                        Total ({data.stocks.length} positions)
                                    </td>
                                    <td className="py-2.5 px-2 text-right text-foreground font-bold text-xs">{formatCurrency(data.totalStockValue, true)}</td>
                                    <td className={`py-2.5 px-2 text-right font-bold text-xs ${data.totalStockGL >= 0 ? "text-positive" : "text-negative"}`}>
                                        {data.totalStockGL >= 0 ? "+" : ""}{formatCurrency(data.totalStockGL, true)}
                                    </td>
                                    <td className="py-2.5 px-2" colSpan={4}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Top 5 Winners</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {winners.slice(0, 5).map((s) => (
                            <ProgressBar
                                key={s.id}
                                label={`${s.ticker} (${formatPercent(s.unrealizedPct, 0)})`}
                                value={`+${formatCurrency(s.unrealizedGL, true)}`}
                                percentage={winners[0] ? (s.unrealizedGL / winners[0].unrealizedGL) * 100 : 0}
                                color="#10b981"
                            />
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Loss Positions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {losers.length === 0 && <p className="text-sm text-muted-foreground italic py-2">No loss positions</p>}
                        {losers.slice(0, 5).map((s) => (
                            <ProgressBar
                                key={s.id}
                                label={`${s.ticker} (${formatPercent(s.unrealizedPct, 0)})`}
                                value={formatCurrency(s.unrealizedGL, true)}
                                percentage={Math.abs(s.unrealizedPct) * 100}
                                color="#ef4444"
                            />
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Sector Allocation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.stockSectors.map((s, i) => (
                        <ProgressBar
                            key={s.sector}
                            label={s.sector}
                            value={`${s.pct}%`}
                            percentage={data.stockSectors[0] ? (s.pct / data.stockSectors[0].pct) * 100 : 0}
                            color={chartColors[i % chartColors.length]}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
