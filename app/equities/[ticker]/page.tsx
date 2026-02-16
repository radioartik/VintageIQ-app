"use client";

import { useParams, useRouter } from "next/navigation";
import { generatePortfolioData, formatCurrency, formatPercent } from "@/lib/analytics";
import { StatCard } from "@/components/portfolio/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleLineChart } from "@/components/portfolio/simple-line-chart";

export default function StockDetailPage() {
    const params = useParams();
    const router = useRouter();
    const data = generatePortfolioData();
    const stock = data.stocks.find((s) => s.ticker === params.ticker);

    if (!stock) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p>Stock not found</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/equities")}>
                    ← Back to Equities
                </Button>
            </div>
        );
    }

    const pts = stock.priceHistory.map((p) => p.price);
    const lbls = stock.priceHistory.map((p) => `Q${p.quarter} ${p.year}`);
    const maxP = Math.max(...pts);
    const minP = Math.min(...pts);
    const range = maxP - minP || 1;
    const lineColor = stock.unrealizedGL >= 0 ? "#10b981" : "#ef4444";

    const returnRows = [
        { period: "YTD", value: stock.returnYTD, note: "Q4 2024 → Q1 2025" },
        { period: "1 Year", value: stock.return1Y, note: "Q1 2024 → Q1 2025" },
        { period: "3 Year (CAGR)", value: stock.return3Y, note: stock.return3Y !== null ? "Annualized" : "Held < 3 years" },
        { period: "5 Year (CAGR)", value: stock.return5Y, note: stock.return5Y !== null ? "Annualized" : "Held < 5 years" },
        { period: "Since Inception", value: stock.returnSI, note: `CAGR since ${stock.acquired} (${2025 - stock.acquired}yr)`, isBold: true },
        { period: "Total Return", value: stock.totalReturn, note: "Cumulative, not annualized" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground mb-3"
                    onClick={() => router.push("/equities")}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Equity Holdings
                </Button>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                            {stock.ticker} — {stock.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs border-emerald-500/30 text-positive">Active</Badge>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{stock.sector}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{stock.strategy}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Acquired {stock.acquired}</span>
                        </div>
                    </div>
                    <Button size="sm">Trade</Button>
                </div>
            </div>

            {/* About Section */}
            {stock.description && (
                <div className="bg-muted/30 border border-border/50 rounded-xl p-4 md:p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Investment Thesis</h3>
                    <p className="text-base text-foreground/80 leading-relaxed max-w-4xl">
                        {stock.description}
                    </p>
                </div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    label="Market Value"
                    value={formatCurrency(stock.marketValue)}
                    subValue={`${stock.shares.toLocaleString()} shares @ $${stock.currentPrice}`}
                />
                <StatCard
                    label="Cost Basis"
                    value={formatCurrency(stock.costBasis)}
                    subValue={`Avg cost: $${stock.avgCost.toFixed(2)}`}
                />
                <StatCard
                    label="Unrealized P&L"
                    value={`${stock.unrealizedGL >= 0 ? "+" : ""}${formatCurrency(stock.unrealizedGL)}`}
                    trend={stock.unrealizedGL >= 0 ? "up" : "down"}
                    trendValue={formatPercent(stock.unrealizedPct)}
                />
                <StatCard
                    label="Dividend Income"
                    value={formatCurrency(stock.annualDividend)}
                    subValue={stock.divYield > 0 ? `Yield: ${stock.divYield.toFixed(2)}%` : "Non-dividend"}
                />
            </div>

            {/* Price History Chart */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Price History (Quarterly)</CardTitle>
                </CardHeader>
                <CardContent>
                    <SimpleLineChart
                        data={stock.priceHistory.map(p => ({
                            label: `Q${p.quarter} ${p.year}`,
                            value: p.price,
                            formattedValue: `$${p.price.toFixed(2)}`
                        }))}
                        color={lineColor}
                        height={180}
                        showArea={true}
                    />
                </CardContent>
            </Card>

            {/* Returns + Position tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Returns Table */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Returns by Period (Annualized)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Period</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Return</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returnRows.map((row) => (
                                    <tr
                                        key={row.period}
                                        className={`border-b border-border/50 ${row.isBold ? "border-t-2 border-t-border" : ""}`}
                                    >
                                        <td className={`py-2 px-2 text-foreground ${row.isBold ? "font-semibold" : "font-medium"}`}>{row.period}</td>
                                        <td className={`py-2 px-2 text-right ${row.isBold ? "font-bold" : "font-medium"} ${row.value !== null && row.value !== undefined && row.value >= 0 ? "text-positive" : row.value !== null ? "text-negative" : "text-muted-foreground"}`}>
                                            {row.value !== null && row.value !== undefined
                                                ? `${row.value >= 0 ? "+" : ""}${formatPercent(row.value)}`
                                                : "—"}
                                        </td>
                                        <td className="py-2 px-2 text-xs text-muted-foreground italic">{row.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Position & Income */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Position & Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <tbody>
                                {[
                                    { label: "Shares", value: stock.shares.toLocaleString() },
                                    { label: "Current Price", value: `$${stock.currentPrice.toFixed(2)}` },
                                    { label: "Average Cost", value: `$${stock.avgCost.toFixed(2)}` },
                                    { label: "Holding Period", value: `${2025 - stock.acquired} years` },
                                    { label: "Portfolio Weight", value: formatPercent(stock.marketValue / data.currentAUM) },
                                ].map((row) => (
                                    <tr key={row.label} className="border-b border-border/50">
                                        <td className="py-2.5 px-2 text-muted-foreground">{row.label}</td>
                                        <td className="py-2.5 px-2 text-right text-foreground font-medium">{row.value}</td>
                                    </tr>
                                ))}
                                {stock.divYield > 0 ? (
                                    <>
                                        <tr className="border-t-2 border-t-border border-b border-border/50">
                                            <td className="py-2.5 px-2 text-muted-foreground">Dividend Yield</td>
                                            <td className="py-2.5 px-2 text-right text-foreground font-medium">{stock.divYield.toFixed(2)}%</td>
                                        </tr>
                                        <tr className="border-b border-border/50">
                                            <td className="py-2.5 px-2 text-muted-foreground">Annual Income</td>
                                            <td className="py-2.5 px-2 text-right text-positive font-medium">{formatCurrency(stock.annualDividend)}</td>
                                        </tr>
                                        <tr className="border-b border-border/50">
                                            <td className="py-2.5 px-2 text-muted-foreground">5Y Income Est.</td>
                                            <td className="py-2.5 px-2 text-right text-positive font-medium">{formatCurrency(stock.annualDividend * 5)}</td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr className="border-b border-border/50">
                                        <td colSpan={2} className="py-2.5 px-2 text-muted-foreground italic">Non-dividend stock</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
