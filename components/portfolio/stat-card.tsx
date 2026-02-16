import { cn } from "@/lib/utils";

interface StatCardProps {
    label: string;
    value: string;
    subValue?: string;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    className?: string;
}

export function StatCard({ label, value, subValue, trend, trendValue, className }: StatCardProps) {
    return (
        <div className={cn(
            "stat-glow rounded-xl bg-card border border-border p-5 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md",
            className
        )}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {label}
            </p>
            <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            <div className="flex items-center gap-2 mt-1">
                {trend && trendValue && (
                    <span className={cn(
                        "text-xs font-semibold",
                        trend === "up" && "text-positive",
                        trend === "down" && "text-negative",
                        trend === "neutral" && "text-muted-foreground"
                    )}>
                        {trend === "up" ? "▲" : trend === "down" ? "▼" : "●"} {trendValue}
                    </span>
                )}
                {subValue && (
                    <span className="text-xs text-muted-foreground">{subValue}</span>
                )}
            </div>
        </div>
    );
}
