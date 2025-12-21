"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Gamepad2, Trophy, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

export function Navbar() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.is_banned) {
                    toast({
                        title: "ACCOUNT SUSPENDED",
                        description: "Your account is banned. Access is restricted.",
                        variant: "destructive",
                        duration: 10000
                    });
                }

                setUser({
                    ...session.user,
                    ign: profile?.ign || session.user.user_metadata?.ign,
                    role: profile?.role || 'user',
                    is_banned: profile?.is_banned || false
                });
            } else {
                setUser(null);
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.is_banned) {
                    toast({
                        title: "ACCOUNT SUSPENDED",
                        description: "You have been banned by an administrator.",
                        variant: "destructive"
                    });
                }

                setUser({
                    ...session.user,
                    ign: profile?.ign || session.user.user_metadata?.ign,
                    role: profile?.role || 'user',
                    is_banned: profile?.is_banned || false
                });
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/");
    };

    return (
        <nav className="sticky top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
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
                    {user?.role === 'admin' && (
                        <NavLink href="/admin" label="Admin" icon={<User className="h-4 w-4" />} />
                    )}
                </div>

                {/* Auth / CTA */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/profile">
                                <Button variant="outline" className="border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10 gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="hidden sm:inline">{user.ign}</span>
                                    <span className="sm:hidden">Profile</span>
                                </Button>
                            </Link>
                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                className="text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                Log Out
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="ghost" className="text-sm font-medium text-white/70 hover:text-white">
                                Log In
                            </Button>
                        </Link>
                    )}
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
