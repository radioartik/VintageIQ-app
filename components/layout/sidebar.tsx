"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Briefcase,
    TrendingUp,
    Droplets,
    Shield,
    Globe,
    PieChart,
    Scale,
    FileCheck,
    FileText,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavGroup {
    label: string;
    items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navGroups: NavGroup[] = [
    {
        label: "Core",
        items: [
            { href: "/dashboard", label: "Portfolio Overview", icon: LayoutDashboard },
            { href: "/holdings", label: "Fund Holdings", icon: Briefcase },
            { href: "/equities", label: "Equity Holdings", icon: TrendingUp },
            { href: "/performance", label: "Performance", icon: PieChart },
            { href: "/liquidity", label: "Liquidity & Cash", icon: Droplets },
        ],
    },
    {
        label: "Analysis",
        items: [
            { href: "/risk", label: "Risk", icon: Shield },
            { href: "/exposure", label: "Exposure", icon: Globe },
            { href: "/attribution", label: "Attribution & Fees", icon: PieChart },
        ],
    },
    {
        label: "Structure",
        items: [
            { href: "/leverage", label: "Leverage", icon: Scale },
            { href: "/governance", label: "Governance", icon: FileCheck },
        ],
    },
    {
        label: "Reports",
        items: [
            { href: "/report", label: "Quarterly Report", icon: FileText },
        ],
    },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-[#0D1B2A] border-r border-[#1e293b] flex flex-col transition-transform duration-300 ease-in-out",
                    "lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-6 h-16 border-b border-[#1e293b]">
                    <Link href="/" className="flex items-center gap-3" onClick={onClose}>
                        <span className="text-xl text-blue-500">◆</span>
                        <span className="text-lg font-bold tracking-tight text-white">
                            VintageIQ
                        </span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {navGroups.map((group) => (
                        <div key={group.label} className="mb-2">
                            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                {group.label}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                                                    : "text-[#8896AB] hover:text-white hover:bg-white/10"
                                            )}
                                        >
                                            <item.icon className={cn("w-4 h-4", isActive && "text-blue-400")} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-[#1e293b]">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                            FO
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Family Office Alpha</p>
                            <p className="text-xs text-slate-400">Administrator</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
