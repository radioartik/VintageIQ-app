"use client";

import { useId } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ChartPoint {
    label: string;
    value: number;
    formattedValue?: string;
    date?: Date;
}

interface SimpleLineChartProps {
    data: ChartPoint[];
    color?: string;
    height?: number;
    showArea?: boolean;
    className?: string;
}

export function SimpleLineChart({
    data,
    color = "#2563eb",
    height = 200,
    showArea = true,
    className,
}: SimpleLineChartProps) {
    const id = useId();
    if (!data || data.length < 2) return null;

    const values = data.map((d) => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    // Config: 5% padding top and bottom to prevent clipping
    const padding = 5;

    // Map data to percentages 0..100
    // x: 0 to 100
    // y: 100 (bottom) to 0 (top)
    // We map normalized value (0..1) to (padding..100-padding)
    // So distinct dots are never at the very edge
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const normalized = (d.value - min) / range;
        // Invert Y because SVG/CSS 0 is top
        const y = 100 - (padding + normalized * (100 - padding * 2));
        return { x, y, ...d };
    });

    const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
    const areaD = `${pathD} L 100,100 L 0,100 Z`;

    // Unique ID for gradient to allow multiple charts on same page
    const gradientId = `grad-${id}`;

    return (
        <div className={cn("relative w-full", className)} style={{ height }}>
            {/* SVG Layer */}
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full overflow-visible"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>

                {showArea && (
                    <path
                        d={areaD}
                        fill={`url(#${gradientId})`}
                        vectorEffect="non-scaling-stroke"
                    />
                )}

                <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* Interactive Overlay Layer */}
            <div className="absolute inset-0">
                {points.map((p, i) => (
                    <div
                        key={i}
                        className="absolute w-5 h-5 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-crosshair group z-10"
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="w-2 h-2 rounded-full bg-background border-2 transition-all opacity-0 group-hover:opacity-100 group-hover:scale-150"
                                    style={{ borderColor: color }}
                                />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs bg-foreground text-background border-border z-50">
                                <div className="text-center font-semibold">
                                    {p.formattedValue || formatCurrency(p.value)}
                                </div>
                                <div className="text-[10px] text-muted opacity-80">{p.label}</div>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                ))}
            </div>

            {/* X-Axis Labels */}
            <div className="absolute left-0 right-0 top-full mt-2 flex justify-between text-[9px] text-muted-foreground px-1">
                {points.filter((_, i) => i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 6) === 0).map((p, i) => (
                    <span key={i} style={{ transform: i === 0 ? '' : i === points.length - 1 ? 'translateX(-50%)' : 'translateX(-50%)' }}>
                        {p.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
