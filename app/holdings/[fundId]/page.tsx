"use client";

import { useParams, useRouter } from "next/navigation";
import { generatePortfolioData, formatCurrency, formatPercent, formatMultiple } from "@/lib/analytics";
import { StatCard } from "@/components/portfolio/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleLineChart } from "@/components/portfolio/simple-line-chart";

export default function FundDetailPage() {
    const params = useParams();
    const router = useRouter();
    const data = generatePortfolioData();
    const fund = data.funds.find((f) => f.id === params.fundId);

    if (!fund) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p>Fund not found</p>
                <Button variant="outline" className="mt-4" onClick={() => router.push("/holdings")}>
                    ← Back to Holdings
                </Button>
            </div>
        );
    }

    const unrealizedGain = fund.nav - fund.paidIn;
    const totalValue = fund.nav + fund.distributions;
    const totalGain = totalValue - fund.paidIn;
    const navPoints = fund.quarterlyNAVs.map((n) => n.nav);
    const navLabels = fund.quarterlyNAVs.map((n) => {
        const d = n.date;
        const q = Math.ceil((d.getMonth() + 1) / 3);
        return `Q${q} ${d.getFullYear()}`;
    });
    const recentTx = fund.transactions
        .filter((t) => t.type !== "NAV Update" && t.type !== "Management Fee")
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 50);

    // Build SVG line chart data
    const maxNav = Math.max(...navPoints);
    const minNav = Math.min(...navPoints);
    const navRange = maxNav - minNav || 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground mb-3"
                    onClick={() => router.push("/holdings")}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Fund Holdings
                </Button>
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                            {fund.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge
                                variant="outline"
                                className={`text-xs ${fund.status === "Active"
                                    ? "border-emerald-500/30 text-positive"
                                    : fund.status === "Written Off"
                                        ? "border-red-500/30 text-negative"
                                        : "border-amber-500/30 text-amber-500"
                                    }`}
                            >
                                {fund.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs" style={{ borderColor: fund.color + "40", color: fund.color }}>
                                {fund.typeName}
                            </Badge>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{fund.strategy}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Vintage {fund.vintage}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{fund.geography}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"><Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Doc</Button>
                        <Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" /> Record Transaction</Button>
                    </div>
                </div>
            </div>

            {/* About Section */}
            {fund.description && (
                <div className="bg-muted/30 border border-border/50 rounded-xl p-4 md:p-5">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fund Overview</h3>
                    <p className="text-base text-foreground/80 leading-relaxed max-w-4xl">
                        {fund.description}
                    </p>
                </div>
            )}

            {/* Primary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard label="Commitment" value={formatCurrency(fund.commitment)} subValue={`Unfunded: ${formatCurrency(fund.unfunded, true)}`} />
                <StatCard label="Paid-In Capital" value={formatCurrency(fund.paidIn)} subValue={`${formatPercent(fund.paidIn / fund.commitment)} deployed`} />
                <StatCard
                    label="Current NAV"
                    value={fund.status === "Written Off" ? "$0" : formatCurrency(fund.nav)}
                    trend={unrealizedGain >= 0 ? "up" : "down"}
                    trendValue={`Unrealized: ${unrealizedGain >= 0 ? "+" : ""}${formatCurrency(unrealizedGain, true)}`}
                />
                <StatCard label="Distributions" value={formatCurrency(fund.distributions)} subValue={fund.distributions > 0 ? "Cash received" : "No distributions yet"} />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <StatCard
                    label="Net IRR"
                    value={formatPercent(fund.irr)}
                    trend={fund.irr >= 0 ? "up" : "down"}
                    trendValue={fund.irr > 0.15 ? "Top Quartile" : fund.irr > 0 ? "Median" : "Below Median"}
                />
                <StatCard
                    label="Total Value"
                    value={formatCurrency(totalValue)}
                    trend={totalGain >= 0 ? "up" : "down"}
                    trendValue={`Total Gain: ${totalGain >= 0 ? "+" : ""}${formatCurrency(totalGain, true)}`}
                />
                <StatCard
                    label="TVPI"
                    value={formatMultiple(fund.tvpi)}
                    subValue={`DPI: ${formatMultiple(fund.dpi)} | RVPI: ${formatMultiple(fund.rvpi)}`}
                />
            </div>

            {/* NAV History Chart */}
            {navPoints.length > 2 && (
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">NAV History (Quarterly)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleLineChart
                            data={fund.quarterlyNAVs.map(n => ({
                                label: `Q${Math.ceil((n.date.getMonth() + 1) / 3)} ${n.date.getFullYear()}`,
                                value: n.nav,
                                formattedValue: formatCurrency(n.nav),
                                date: n.date
                            }))}
                            color={fund.color}
                            height={180}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Transactions + Documents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Recent Transactions */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Date</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Type</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTx.length === 0 && (
                                    <tr><td colSpan={3} className="py-4 text-center text-muted-foreground italic">No transactions yet</td></tr>
                                )}
                                {recentTx.map((t, i) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                        <td className="py-2 px-2 text-muted-foreground text-xs">
                                            {t.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                        </td>
                                        <td className="py-2 px-2">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] ${t.type === "Distribution" || t.type === "Exit / Realization"
                                                    ? "border-emerald-500/30 text-positive"
                                                    : t.type === "Capital Call"
                                                        ? "border-amber-500/30 text-amber-500"
                                                        : ""
                                                    }`}
                                            >
                                                {t.type}
                                            </Badge>
                                        </td>
                                        <td className={`py-2 px-2 text-right font-medium text-xs ${t.amount > 0 ? "text-positive" : "text-negative"}`}>
                                            {t.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(t.amount), true)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Documents & Files</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {fund.documents.map((doc, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/20 transition-all cursor-pointer"
                            >
                                <span className="text-lg">{doc.type === "Tax" ? "📋" : doc.type === "Audit" ? "🔍" : "📄"}</span>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                    <p className="text-xs text-muted-foreground">{doc.date} · {doc.type}</p>
                                </div>
                            </div>
                        ))}
                        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer mt-4">
                            <p className="text-lg mb-1">📁</p>
                            <p className="text-sm text-muted-foreground">
                                Drag & drop files here or <strong>browse</strong>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Supports PDF, CSV, XLSX</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
