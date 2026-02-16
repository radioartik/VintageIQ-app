"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex items-center gap-4 h-14 px-4 bg-background/80 backdrop-blur-xl border-b border-border lg:hidden">
            <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle navigation"
            >
                <Menu className="w-5 h-5 text-foreground" />
            </button>
            <Link href="/" className="flex items-center gap-2">
                <span className="text-blue-500">◆</span>
                <span className="font-semibold text-foreground">VintageIQ</span>
            </Link>
        </header>
    );
}
