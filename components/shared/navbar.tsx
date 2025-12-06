"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Gamepad2 className="h-6 w-6 text-neon-yellow" />
                    <span className="font-syne text-xl font-bold uppercase tracking-widest text-white">
                        PMPL <span className="text-neon-yellow">.GG</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden items-center gap-8 md:flex">
                    <NavLink href="/tournaments" icon={<Trophy className="h-4 w-4" />} label="Tournaments" />
                    <NavLink href="/leaderboard" icon={<BarChart2 className="h-4 w-4" />} label="Leaderboard" />
                    <NavLink href="/news" label="News" />
                </div>

                {/* Auth / CTA */}
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-sm font-medium text-white/70 hover:text-white">
                            Log In
                        </Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-neon-yellow text-black hover:bg-neon-yellow/90 font-bold">
                            HOST DASHBOARD
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, icon, label }: { href: string; icon?: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
            {icon && <span className="text-neon-blue transition-transform group-hover:scale-110">{icon}</span>}
            <span className="font-outfit">{label}</span>
        </Link>
    );
}
