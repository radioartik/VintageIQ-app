"use client";

import { WaterfallItem } from "@/lib/analytics/types";
import { formatCurrency } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface WaterfallChartProps {
    title: string;
    items: WaterfallItem[];
}

export function WaterfallChart({ title, items }: WaterfallChartProps) {
    const maxVal = Math.max(...items.map(w => Math.abs(w.value)));

    // Calculate running totals for the "floating" effect if truly a waterfall
    // But for a "column chart" requested, we'll do standard columns for now
    // or a stepping one if it looks better. I'll go with stepping for "waterfall".

    let runningTotal = 0;

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">{title}</h3>
            <div className="flex-1 flex items-end justify-between gap-1 min-h-[240px] px-2">
                {items.map((item, i) => {
                    const isTotal = item.type === 'balance';
                    const heightPct = (Math.abs(item.value) / maxVal) * 80; // Scale to 80% to leave room for labels
                    const color = item.type === 'balance' ? '#1B2A4A' : item.type === 'inflow' ? '#2563eb' : item.type === 'gain' ? '#10b981' : '#ef4444';

                    const value = item.value;
                    const startY = isTotal ? 0 : runningTotal;
                    if (!isTotal) runningTotal += value;

                    // For a "Column Chart" as requested, a staggered waterfall is best
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Value Label */}
                            <div className="absolute -top-6 text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {value >= 0 ? "" : "−"}${(Math.abs(value) / 1e6).toFixed(1)}M
                            </div>

                            {/* Bar */}
                            <div
                                className="w-full max-w-[40px] rounded-sm transition-all duration-500 hover:brightness-110 relative"
                                style={{
                                    height: `${heightPct}%`,
                                    backgroundColor: color,
                                }}
                            />

                            {/* Axis Label */}
                            <div className="mt-2 text-[9px] text-muted-foreground text-center leading-tight h-8 flex items-start justify-center">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
