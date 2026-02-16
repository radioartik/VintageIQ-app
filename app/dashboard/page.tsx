import Link from "next/link";
import { generatePortfolioData, formatCurrency, formatPercent, formatMultiple } from "@/lib/analytics";
import { StatCard } from "@/components/portfolio/stat-card";
import { AllocationBar } from "@/components/portfolio/allocation-bar";
import { ProgressBar } from "@/components/portfolio/progress-bar";
import { GlossaryTip } from "@/components/portfolio/glossary-tip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SimpleLineChart } from "@/components/portfolio/simple-line-chart";
import { FileText } from "lucide-react";

export default function DashboardPage() {
  const data = generatePortfolioData();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Portfolio Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Family Office — As of Q1 2025
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-slate-500/30 text-slate-600 bg-slate-50">
            {data.holdingCount} Holdings
          </Badge>
          <Link href="/report">
            <Button size="sm" variant="default">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Generate Report
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Total AUM"
          value={formatCurrency(data.currentAUM, true)}
          trend="up"
          trendValue={`${data.holdingCount} holdings across ${data.allocation.length} asset classes`}
        />
        <StatCard
          label="Fund Commitments"
          value={formatCurrency(data.totalCommitment, true)}
          subValue={`${formatPercent(data.totalPaidIn / data.totalCommitment)} deployed`}
        />
        <StatCard
          label="Direct Equities"
          value={formatCurrency(data.totalStockValue, true)}
          trend={data.totalStockGL >= 0 ? "up" : "down"}
          trendValue={`SI: ${formatPercent(data.eqReturnSI)} | YTD: ${formatPercent(data.eqReturnYTD)}`}
        />
        <StatCard
          label="Total Distributions"
          value={formatCurrency(data.totalDistributions, true)}
          subValue={`DPI: ${formatMultiple(data.portfolioDPI)}`}
        />
      </div>

      {/* Allocation + AUM History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* AUM Growth Chart */}
        <Card className="bg-card border-border hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">AUM Growth — 15 Year History</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={data.history.yearly.map(y => ({
                label: y.year.toString(),
                value: y.aum,
                formattedValue: formatCurrency(y.aum, true)
              }))}
              height={180}
              color="#0f172a"
            />
          </CardContent>
        </Card>

        {/* Allocation Card */}
        <Card className="bg-card border-border hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <AllocationBar items={data.allocation} />
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Metrics + Realized vs Unrealized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Portfolio Metrics */}
        <Card className="bg-card border-border hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Portfolio Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center">
                  Fund IRR <GlossaryTip term="IRR" />
                </p>
                <p className="text-xl font-bold text-foreground mt-1">{formatPercent(data.portfolioIRR)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center">
                  TVPI <GlossaryTip term="TVPI" />
                </p>
                <p className="text-xl font-bold text-foreground mt-1">{formatMultiple(data.portfolioTVPI)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Equity Return (Ann.)</p>
                <p className={`text-xl font-bold mt-1 ${data.eqReturnSI !== null && data.eqReturnSI >= 0 ? "text-positive" : "text-negative"}`}>
                  {data.eqReturnSI !== null && data.eqReturnSI >= 0 ? "+" : ""}{formatPercent(data.eqReturnSI)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Bond Income</p>
                <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(data.totalBondIncome, true)}/yr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Realized vs Unrealized */}
        <Card className="bg-card border-border hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Realized vs. Unrealized</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar
              label="Realized Gains"
              value={formatCurrency(data.realizedGains, true)}
              percentage={(data.realizedGains / (data.realizedGains + Math.abs(data.unrealizedGains))) * 100}
              color="#10b981"
            />
            <ProgressBar
              label="Unrealized Gains"
              value={formatCurrency(data.unrealizedGains, true)}
              percentage={(Math.abs(data.unrealizedGains) / (data.realizedGains + Math.abs(data.unrealizedGains))) * 100}
              color="#3730a3"
            />
            <ProgressBar
              label="Exited Funds"
              value={`${data.exitedFunds.length} of ${data.funds.length}`}
              percentage={(data.exitedFunds.length / data.funds.length) * 100}
              color="#ec4899"
            />
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-border" />

      {/* Top Holdings */}
      <Card className="bg-card border-border hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground">Top Equity Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Ticker</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Name</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Market Value</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Gain/Loss</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">Return</th>
                </tr>
              </thead>
              <tbody>
                {data.stocks
                  .sort((a, b) => b.marketValue - a.marketValue)
                  .slice(0, 10)
                  .map((stock) => (
                    <tr
                      key={stock.id}
                      className="data-table-row"
                    >
                      <td className="py-2.5 px-2">
                        <span className="font-mono font-semibold text-foreground">{stock.ticker}</span>
                      </td>
                      <td className="py-2.5 px-2 text-muted-foreground">{stock.name}</td>
                      <td className="py-2.5 px-2 text-right text-foreground font-medium">
                        {formatCurrency(stock.marketValue, true)}
                      </td>
                      <td className={`py-2.5 px-2 text-right font-medium ${stock.unrealizedGL >= 0 ? "text-positive" : "text-negative"
                        }`}>
                        {stock.unrealizedGL >= 0 ? "+" : ""}{formatCurrency(stock.unrealizedGL, true)}
                      </td>
                      <td className={`py-2.5 px-2 text-right font-medium ${stock.annualizedReturn >= 0 ? "text-positive" : "text-negative"
                        }`}>
                        {formatPercent(stock.annualizedReturn)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Funds */}
      <Card className="bg-card border-border hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground">Fund Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Fund</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">NAV</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">IRR</th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-2 px-2">MOIC</th>
                </tr>
              </thead>
              <tbody>
                {data.funds
                  .sort((a, b) => b.nav - a.nav)
                  .slice(0, 10)
                  .map((fund) => (
                    <tr
                      key={fund.id}
                      className="data-table-row cursor-pointer"
                    >
                      <td className="py-2.5 px-2">
                        <span className="font-medium text-foreground">{fund.name}</span>
                      </td>
                      <td className="py-2.5 px-2">
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{ borderColor: fund.color + '40', color: fund.color }}
                        >
                          {fund.typeName}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${fund.status === 'Active'
                            ? 'border-emerald-500/30 text-positive'
                            : fund.status === 'Written Off'
                              ? 'border-red-500/30 text-negative'
                              : 'border-muted-foreground/30 text-muted-foreground'
                            }`}
                        >
                          {fund.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-2 text-right text-foreground font-medium">
                        {formatCurrency(fund.nav, true)}
                      </td>
                      <td className={`py-2.5 px-2 text-right font-medium ${fund.irr >= 0 ? "text-positive" : "text-negative"
                        }`}>
                        {formatPercent(fund.irr)}
                      </td>
                      <td className="py-2.5 px-2 text-right text-foreground font-medium">
                        {formatMultiple(fund.moic)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
