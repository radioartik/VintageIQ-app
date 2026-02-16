import { ProgressBar } from "@/components/portfolio/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GovernancePage() {
    const complianceItems = [
        { label: 'Annual Audit 2024 — Clean Opinion', checked: true },
        { label: 'Quarterly Valuation — Q4 Certified', checked: true },
        { label: 'Side Letter Compliance — All 6 Active', checked: true },
        { label: 'Tax Filings — Current Through FY2024', checked: true },
        { label: 'AML / KYC — Annual Review Complete', checked: true },
        { label: 'Data Privacy — GDPR/CCPA Compliant', checked: true },
        { label: 'Succession Planning — Board Approved', checked: true },
        { label: 'Insurance Coverage — Reviewed Q4 2024', checked: true },
        { label: 'Cybersecurity Audit — Q3 2024 Pass', checked: true },
        { label: 'Conflicts of Interest — Disclosed & Managed', checked: true },
    ];

    const esgScores = [
        { label: 'Environmental', score: 72, color: '#0d9488' },
        { label: 'Social', score: 81, color: '#2563eb' },
        { label: 'Governance', score: 80, color: '#1B2A4A' },
    ];

    const upcomingDeadlines = [
        { date: 'Mar 15, 2025', item: 'Q4 2024 Performance Reporting', status: 'Due Soon' },
        { date: 'Mar 31, 2025', item: 'Annual Audit Finalization', status: 'In Progress' },
        { date: 'Apr 15, 2025', item: 'Tax Filing Deadline (Partnerships)', status: 'Pending' },
        { date: 'Jun 30, 2025', item: 'Mid-Year Portfolio Review', status: 'Scheduled' },
        { date: 'Sep 30, 2025', item: 'LPAC Annual Meeting', status: 'Scheduled' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Governance & Compliance</h1>
                <p className="text-sm text-muted-foreground mt-1">Regulatory compliance, ESG scoring, and fiduciary oversight</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Compliance Checklist */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">Compliance Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {complianceItems.map((item) => (
                                <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${item.checked ? 'bg-emerald-500/20 text-positive' : 'bg-red-500/20 text-negative'
                                        }`}>
                                        {item.checked ? '✓' : '✗'}
                                    </div>
                                    <span className="text-sm text-foreground">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
                            <span className="text-muted-foreground">Compliance Score</span>
                            <span className="text-positive font-bold">
                                {complianceItems.filter(c => c.checked).length}/{complianceItems.length} — 100%
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* ESG Composite Score */}
                <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-foreground">ESG Composite Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Score Display */}
                        <div className="text-center py-6">
                            <div className="relative inline-flex items-center justify-center">
                                <svg viewBox="0 0 120 120" className="w-32 h-32">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                    <circle
                                        cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${78 * 3.14} ${100 * 3.14}`}
                                        transform="rotate(-90 60 60)"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-positive">78</span>
                                    <span className="text-xs text-muted-foreground">out of 100</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Above peer median</p>
                        </div>

                        {/* E/S/G Breakdown */}
                        <div className="space-y-4 mt-4 pt-4 border-t border-border">
                            {esgScores.map((score) => (
                                <ProgressBar
                                    key={score.label}
                                    label={score.label}
                                    value={`${score.score}/100`}
                                    pct={score.score}
                                    color={score.color}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Deadlines */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Upcoming Deadlines & Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Date</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Item</th>
                                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingDeadlines.map((deadline) => (
                                    <tr key={deadline.item} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                        <td className="py-2.5 px-2 text-foreground font-medium text-xs">{deadline.date}</td>
                                        <td className="py-2.5 px-2 text-foreground text-xs">{deadline.item}</td>
                                        <td className="py-2.5 px-2">
                                            <Badge variant="outline" className={`text-[10px] ${deadline.status === 'Due Soon' ? 'border-amber-500/30 text-amber-400' :
                                                    deadline.status === 'In Progress' ? 'border-blue-500/30 text-blue-400' :
                                                        deadline.status === 'Pending' ? 'border-slate-500/30 text-slate-400' :
                                                            'border-emerald-500/30 text-positive'
                                                }`}>
                                                {deadline.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Document Vault Summary */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-foreground">Document Vault Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { category: 'Capital Statements', count: 156, icon: '📄' },
                            { category: 'Audited Financials', count: 42, icon: '📊' },
                            { category: 'Tax Documents', count: 89, icon: '🏦' },
                            { category: 'Legal / Side Letters', count: 24, icon: '⚖️' },
                        ].map((doc) => (
                            <div key={doc.category} className="p-4 rounded-xl bg-muted/50 border border-border/70 text-center hover:border-border transition-all">
                                <div className="text-2xl mb-2">{doc.icon}</div>
                                <div className="text-2xl font-bold text-foreground">{doc.count}</div>
                                <div className="text-xs text-muted-foreground mt-1">{doc.category}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
