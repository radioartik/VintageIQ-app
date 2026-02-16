"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generatePortfolioData, formatCurrency, formatPercent, formatMultiple } from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/portfolio/progress-bar";
import { Button } from "@/components/ui/button";
import { Download, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HoldingsPage() {
    const data = generatePortfolioData();
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState("All");

    const sortedFunds = [...data.funds].sort((a, b) => b.nav - a.nav || b.distributions - a.distributions);
    const filteredFunds = sortedFunds.filter(f =>
        statusFilter === "All" ? true :
            statusFilter === "Active" ? f.status === "Active" :
                (f.status === "Exited" || f.status === "Written Off")
    );

    const top5IRR = [...data.funds].filter(f => f.irr > 0).sort((a, b) => b.irr - a.irr).slice(0, 5);
    const maxIRR = top5IRR.length > 0 ? top5IRR[0].irr : 0.3;
    const lossFunds = data.funds.filter(f => f.irr < 0 || f.status === "Written Off");

    const exportCSV = () => {
        const headers = ["Fund Name", "Type", "Status", "Vintage", "Commitment", "Paid In", "NAV", "Distributions", "IRR", "MOIC"];
        const rows = filteredFunds.map(f => [
            `"${f.name}"`, f.typeName, f.status, f.vintage, f.commitment, f.paidIn, f.nav, f.distributions, (f.irr * 100).toFixed(2) + "%", f.moic.toFixed(2) + "x"
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "fund_holdings.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate totals for visible rows
    const totalCommit = filteredFunds.reduce((s, f) => s + f.commitment, 0);
    const totalPaidIn = filteredFunds.reduce((s, f) => s + f.paidIn, 0);
    const totalNAV = filteredFunds.reduce((s, f) => s + f.nav, 0);
    const totalDist = filteredFunds.reduce((s, f) => s + f.distributions, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Fund Holdings</h1>
                    <p className="text-sm text-muted-foreground mt-1">{filteredFunds.length} funds visible</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-muted/50 p-1 rounded-lg">
                        {["All", "Active", "Exited"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                                    statusFilter === s ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={exportCSV} title="Export CSV">
                        <Download className="w-3.5 h-3.5 mr-2" /> Export
                    </Button>
                </div>
            </div>

            <Card className="bg-card border-border">
                <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Fund Name</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Type</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Vintage</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Status</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Commitment</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Paid In</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">NAV</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Distributions</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">IRR</th>
                                    <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">MOIC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFunds.length === 0 && (
                                    <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">No funds match this filter</td></tr>
                                )}
                                {filteredFunds.map((fund) => (
                                    <tr
                                        key={fund.id}
                                        className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/holdings/${fund.id}`)}
                                    >
                                        <td className="py-2.5 px-2">
                                            <div>
                                                <span className="font-medium text-primary group-hover:underline text-xs">{fund.name}</span>
                                                <p className="text-[10px] text-muted-foreground">{fund.strategy} · {fund.geography}</p>
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-2">
                                            <Badge variant="outline" className="text-[10px]" style={{ borderColor: fund.color + '40', color: fund.color }}>
                                                {fund.typeName}
                                            </Badge>
                                        </td>
                                        <td className="py-2.5 px-2 text-muted-foreground text-xs">{fund.vintage}</td>
                                        <td className="py-2.5 px-2">
                                            <Badge variant="outline" className={`text-[10px] ${fund.status === 'Active' ? 'border-emerald-500/30 text-positive' :
                                                fund.status === 'Written Off' ? 'border-red-500/30 text-negative' :
                                                    'border-amber-500/30 text-amber-500'
                                                }`}>
                                                {fund.status}
                                            </Badge>
                                        </td>
                                        <td className="py-2.5 px-2 text-right text-foreground text-xs">{formatCurrency(fund.commitment, true)}</td>
                                        <td className="py-2.5 px-2 text-right text-foreground text-xs">{formatCurrency(fund.paidIn, true)}</td>
                                        <td className="py-2.5 px-2 text-right text-foreground font-medium text-xs">
                                            {fund.status === "Written Off" ? "—" : formatCurrency(fund.nav, true)}
                                        </td>
                                        <td className="py-2.5 px-2 text-right text-positive text-xs">{formatCurrency(fund.distributions, true)}</td>
                                        <td className={`py-2.5 px-2 text-right font-medium text-xs ${fund.irr >= 0 ? 'text-positive' : 'text-negative'}`}>
                                            {formatPercent(fund.irr)}
                                        </td>
                                        <td className="py-2.5 px-2 text-right text-foreground text-xs">{formatMultiple(fund.moic)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-muted/30 font-semibold border-t-2 border-border">
                                <tr>
                                    <td className="py-3 px-2 text-xs" colSpan={4}>Total ({filteredFunds.length} funds)</td>
                                    <td className="py-3 px-2 text-right text-xs">{formatCurrency(totalCommit, true)}</td>
                                    <td className="py-3 px-2 text-right text-xs">{formatCurrency(totalPaidIn, true)}</td>
                                    <td className="py-3 px-2 text-right text-xs">{formatCurrency(totalNAV, true)}</td>
                                    <td className="py-3 px-2 text-right text-positive text-xs">{formatCurrency(totalDist, true)}</td>
                                    <td className="py-3 px-2 text-right text-xs" colSpan={2}>
                                        {statusFilter === "All" ? (
                                            <span className="text-muted-foreground font-normal text-[10px]">See Overview</span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Top 5 by IRR</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {top5IRR.map((f) => (
                            <ProgressBar
                                key={f.id}
                                label={f.name}
                                value={formatPercent(f.irr)}
                                percentage={(f.irr / maxIRR) * 100}
                                color={f.color}
                            />
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Losses & Write-Offs</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {lossFunds.length === 0 && (
                            <p className="text-sm text-muted-foreground italic py-2">No losses</p>
                        )}
                        {lossFunds.map((f) => (
                            <ProgressBar
                                key={f.id}
                                label={f.name}
                                value={f.status === "Written Off" ? "Total Loss" : formatPercent(f.irr)}
                                percentage={Math.min(Math.abs(f.irr) * 100, 100)}
                                color="#ef4444"
                            />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
