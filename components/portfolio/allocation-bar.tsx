"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AllocationItem {
    name: string;
    pct: number;
    color: string;
}

interface AllocationBarProps {
    items: AllocationItem[];
}

export function AllocationBar({ items }: AllocationBarProps) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    return (
        <div className="space-y-6">
            {/* Stacked bar with richer visuals */}
            <div className="flex h-5 rounded-lg overflow-hidden bg-muted/30 ring-1 ring-border/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                {items.map((item, i) => (
                    <div
                        key={i}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        style={{
                            width: `${item.pct * 100}%`,
                            backgroundColor: item.color,
                        }}
                        className={cn(
                            "transition-all duration-300 cursor-pointer relative",
                            hoveredIdx !== null && hoveredIdx !== i ? "opacity-25 grayscale-[0.3]" : "opacity-100",
                            "hover:brightness-110"
                        )}
                        title={`${item.name}: ${(item.pct * 100).toFixed(1)}%`}
                    >
                        {/* Shimmer effect on hover */}
                        {hoveredIdx === i && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                        )}
                    </div>
                ))}
            </div>

            {/* Legend - 2 Column Grid for clarity and room */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
                {items.map((item, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex items-center gap-3 text-sm transition-all duration-200 group cursor-default",
                            hoveredIdx !== null && hoveredIdx !== i ? "opacity-40" : "opacity-100"
                        )}
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                    >
                        <div
                            className={cn(
                                "w-3 h-3 rounded-full shrink-0 transition-transform duration-300 ring-offset-2 ring-offset-background",
                                hoveredIdx === i && "scale-125 ring-2"
                            )}
                            style={{
                                backgroundColor: item.color,
                                // @ts-ignore
                                "--tw-ring-color": item.color
                            }}
                        />
                        <span className={cn(
                            "text-muted-foreground font-medium flex-1 transition-colors capitalize",
                            hoveredIdx === i && "text-foreground font-semibold"
                        )}>
                            {item.name.toLowerCase()}
                        </span>
                        <span className={cn(
                            "text-foreground font-bold tabular-nums ml-2 flex items-center gap-1",
                            hoveredIdx === i && "text-blue-600 scale-105"
                        )}>
                            {(item.pct * 100).toFixed(1)}
                            <span className="text-[10px] opacity-60 font-medium">%</span>
                        </span>
                    </div>
                ))}
            </div>

            {/* Interactive indicator */}
            <div className="h-0.5 w-full bg-muted/20 relative overflow-hidden">
                {hoveredIdx !== null && (
                    <div
                        className="absolute h-full transition-all duration-500 ease-out"
                        style={{
                            left: `${items.slice(0, hoveredIdx).reduce((acc, curr) => acc + curr.pct, 0) * 100}%`,
                            width: `${items[hoveredIdx].pct * 100}%`,
                            backgroundColor: items[hoveredIdx].color
                        }}
                    />
                )}
            </div>
        </div>
    );
}
