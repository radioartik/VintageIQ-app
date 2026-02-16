"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const GLOSSARY: Record<string, string> = {
    IRR: "Internal Rate of Return — time-weighted annualized return",
    MOIC: "Multiple on Invested Capital — total value / paid-in capital",
    DPI: "Distribution to Paid-In — cash returned / paid-in",
    TVPI: "Total Value to Paid-In — (NAV + distributions) / paid-in",
    RVPI: "Residual Value to Paid-In — NAV / paid-in",
    NAV: "Net Asset Value — current fair market value of holdings",
    AUM: "Assets Under Management — total market value of all holdings",
    PME: "Public Market Equivalent — fund return vs public benchmark",
    LTV: "Loan-to-Value — total debt / total asset value",
    ISCR: "Interest Service Coverage Ratio — income / interest expense",
    LCR: "Liquidity Coverage Ratio — liquid assets / near-term obligations",
};

interface GlossaryTipProps {
    term: string;
}

export function GlossaryTip({ term }: GlossaryTipProps) {
    const definition = GLOSSARY[term] || term;
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex items-center ml-1 cursor-help">
                    <Info className="w-3 h-3 text-muted-foreground hover:text-foreground transition-colors" />
                </span>
            </TooltipTrigger>
            <TooltipContent
                side="top"
                className="bg-foreground text-background text-xs max-w-xs px-3 py-2"
            >
                <p>{definition}</p>
            </TooltipContent>
        </Tooltip>
    );
}
