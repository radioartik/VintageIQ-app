"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp, PieChart, Shield, Layout, Globe, Zap, ArrowRight, BarChart3, Lock } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Nav */}
            <header className="px-6 lg:px-12 h-20 flex items-center border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
                <Link className="flex items-center justify-center group" href="/">
                    <Shield className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
                    <span className="ml-2.5 text-2xl font-bold tracking-tight text-foreground">VintageIQ</span>
                </Link>
                <nav className="ml-auto hidden md:flex gap-8">
                    <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#features">Features</Link>
                    <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#solutions">Solutions</Link>
                    <Link className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors" href="#security">Security</Link>
                </nav>
                <div className="ml-auto md:ml-8">
                    <Link href="/dashboard">
                        <Button variant="default" size="sm" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                            Launch Portal
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative w-full py-16 lg:py-24 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse transition-delay-1000" />
                    </div>

                    <div className="container px-6 relative z-10 mx-auto">
                        <div className="flex flex-col items-center space-y-6 text-center">
                            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-bold text-primary animate-in fade-in slide-in-from-bottom-3 duration-1000">
                                <Zap className="mr-2 h-3.5 w-3.5 fill-primary" />
                                Institutional Intelligence for Your Private Capital
                            </div>

                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 max-w-5xl">
                                The Private Markets <br />
                                <span className="bg-gradient-to-r from-primary via-indigo-600 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">Operating System</span>
                            </h1>

                            <p className="mx-auto max-w-[700px] text-muted-foreground text-base sm:text-lg md:text-xl font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
                                Unified portfolio monitoring for family offices, individual investors, and high-net-worth teams. Clarity across every asset class.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mt-2 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
                                <Link href="/dashboard">
                                    <Button size="lg" className="h-12 rounded-full px-8 text-base font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                                        View Demo Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button variant="outline" size="lg" className="h-12 rounded-full px-8 text-base font-bold border-2 hover:bg-muted/50 transition-all">
                                    Request Access
                                </Button>
                            </div>

                            {/* Dashboard Mockup Preview */}
                            <div className="mt-12 w-full max-w-4xl mx-auto p-2 rounded-[1.5rem] border border-border/50 bg-muted/20 backdrop-blur-sm shadow-xl animate-in zoom-in-95 fade-in duration-1000 delay-700">
                                <div className="rounded-[1rem] overflow-hidden border border-border bg-background aspect-[21/9] flex items-center justify-center relative group">
                                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                                    <div className="text-center space-y-3">
                                        <BarChart3 className="h-10 w-10 mx-auto text-primary/40 group-hover:scale-110 transition-transform duration-500" />
                                        <p className="text-lg font-bold text-muted-foreground tracking-tight opacity-60 group-hover:opacity-100 transition-opacity">
                                            Interactive Portfolio Analytics Hub
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full py-24 bg-muted/30">
                    <div className="container px-6">
                        <div className="text-center mb-20 space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Capabilities</h2>
                            <p className="text-4xl sm:text-5xl font-extrabold tracking-tight">Everything in your portfolio, unified.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: PieChart,
                                    title: "Multi-Asset Consolidation",
                                    desc: "Aggregate Private Equity, VC, Real Estate, Crypto, and Bonds into a single live view."
                                },
                                {
                                    icon: TrendingUp,
                                    title: "High-Fidelity Analytics",
                                    desc: "Automated J-Curve modeling, IRR tracking, and TVPI metrics derived from transaction source-of-truth."
                                },
                                {
                                    icon: Layout,
                                    title: "Institutional Reporting",
                                    desc: "One-click generation of professional quarterly investment reports for board meetings."
                                }
                            ].map((feature, i) => (
                                <div key={i} className="group p-8 rounded-3xl border border-border bg-background hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all hover:-translate-y-2">
                                    <div className="mb-6 rounded-2xl bg-primary/5 p-4 w-fit text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <feature.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Solutions Section */}
                <section id="solutions" className="w-full py-24 lg:py-32">
                    <div className="container px-6">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Catered Audience</h2>
                                    <p className="text-5xl sm:text-6xl font-extrabold tracking-tight">Built for the <span className="text-primary italic">Sophisticated</span> Investor.</p>
                                </div>
                                <p className="text-xl text-muted-foreground leading-relaxed">
                                    VintageIQ replaces fragmented shadow-accounting and spreadsheets with a secure, real-time operating system for private capital.
                                </p>
                                <div className="space-y-6">
                                    {[
                                        "Institutional Investors & Individual Capital Base",
                                        "Single & Multi-Family Office Teams",
                                        "High-Net-Worth Investment Ecosystems"
                                    ].map((text, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors">
                                            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                                                <Zap className="h-5 w-5 fill-emerald-600" />
                                            </div>
                                            <span className="text-lg font-bold">{text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-primary/20 to-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative aspect-square sm:aspect-video rounded-[2.5rem] border border-border bg-muted/40 overflow-hidden shadow-2xl flex items-center justify-center">
                                    <div className="text-center p-8">
                                        <Globe className="h-20 w-20 mx-auto text-primary/30 mb-6 animate-spin-slow" />
                                        <p className="text-2xl font-bold text-muted-foreground">Global Market Visibility</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section id="security" className="w-full py-24 bg-navy text-white overflow-hidden relative">
                    <div className="container px-6 relative z-10 text-center space-y-10">
                        <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white mb-4">
                            <Lock className="mr-2 h-3.5 w-3.5 fill-white" />
                            Bank-Grade Infrastructure
                        </div>
                        <h2 className="text-5xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">Your data privacy is our <br /> <span className="text-emerald-400">absolute priority.</span></h2>
                        <p className="max-w-2xl mx-auto text-xl text-slate-300 leading-relaxed">
                            Zero-knowledge architecture. Local-first data patterns. End-to-end encryption. Your family office data stays under your control, always.
                        </p>
                        <div className="pt-8">
                            <Link href="/dashboard">
                                <Button variant="secondary" size="lg" className="h-14 rounded-full px-12 text-lg font-bold hover:scale-105 transition-transform">
                                    Experience the Security
                                </Button>
                            </Link>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                        <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] border-[1px] border-white/20 rounded-full animate-spin-slow" />
                    </div>
                </section>
            </main>

            <footer className="w-full py-12 px-6 lg:px-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8 bg-muted/10">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center group">
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="ml-2.5 text-xl font-bold tracking-tight">VintageIQ</span>
                    </div>
                    <p className="text-sm text-muted-foreground">The premier intelligence layer for private investment teams.</p>
                </div>
                <div className="flex gap-10">
                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-bold uppercase tracking-widest">Product</span>
                        <Link className="text-xs text-muted-foreground hover:text-primary" href="#">Features</Link>
                        <Link className="text-xs text-muted-foreground hover:text-primary" href="#">Security</Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-bold uppercase tracking-widest">Company</span>
                        <Link className="text-xs text-muted-foreground hover:text-primary" href="#">About</Link>
                        <Link className="text-xs text-muted-foreground hover:text-primary" href="#">Contact</Link>
                    </div>
                </div>
                <div className="text-center md:text-right space-y-2">
                    <p className="text-xs text-muted-foreground">© 2025 VintageIQ Intelligence Systems. All rights reserved.</p>
                    <p className="text-[10px] text-muted-foreground/50 italic font-mono uppercase tracking-tighter">Institutional Private Data Infrastructure v4.2.0</p>
                </div>
            </footer>
        </div>
    );
}
