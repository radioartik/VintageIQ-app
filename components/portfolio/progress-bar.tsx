import { cn } from "@/lib/utils";

interface ProgressBarProps {
    label: string;
    value: string;
    /** Percentage fill (0-100) */
    pct?: number;
    /** Alias for pct */
    percentage?: number;
    color?: string;
    className?: string;
}

export function ProgressBar({ label, value, pct, percentage, color = '#2563eb', className }: ProgressBarProps) {
    const fillPct = pct ?? percentage ?? 0;
    return (
        <div className={cn("space-y-1", className)}>
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate">{label}</span>
                <span className="text-foreground font-medium ml-2 shrink-0">{value}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(fillPct, 100)}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}
