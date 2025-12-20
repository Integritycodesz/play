"use client";

import { useEffect, useState } from "react";
import { AlertCircle, X, Info, AlertTriangle, ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface BroadcastMessage {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "destructive";
    timestamp: string;
    active: boolean;
}

export function GlobalBroadcast() {
    const [broadcast, setBroadcast] = useState<BroadcastMessage | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const fetchActive = async () => {
            const { data } = await supabase
                .from('broadcasts')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data) {
                setBroadcast({
                    id: data.id,
                    title: data.title,
                    message: data.message,
                    type: data.type as any,
                    timestamp: data.created_at,
                    active: data.is_active
                });
                setIsVisible(true);
            } else {
                setBroadcast(null);
            }
        };

        fetchActive();

        const channel = supabase
            .channel('public:broadcasts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcasts', filter: 'is_active=eq.true' }, (payload) => {
                setBroadcast({
                    id: payload.new.id,
                    title: payload.new.title,
                    message: payload.new.message,
                    type: payload.new.type as any,
                    timestamp: payload.new.created_at,
                    active: payload.new.is_active
                });
                setIsVisible(true);
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'broadcasts' }, (payload) => {
                if (payload.new.is_active === false) {
                    // Check if it was the current one
                    setBroadcast(current => current?.id === payload.new.id ? null : current);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [pathname]);

    // Debugging: If no broadcast, render nothing but log? 
    // Actually, let's keep it simple: if no broadcast, return null. 
    // But let's bump z-index and remove animation to ensure it's not hidden.
    if (!broadcast || !isVisible) return null;

    // Show everywhere for now for better feedback
    // if (pathname?.startsWith("/admin")) return null;

    // Style: Dark Glass background with colored text/border to match 'Ethereal' aesthetic.
    const styles = {
        info: "border-neon-blue/30 bg-neon-blue/10 text-neon-blue",
        warning: "border-neon-yellow/30 bg-neon-yellow/10 text-neon-yellow",
        destructive: "border-neon-red/30 bg-neon-red/10 text-neon-red",
    };

    const icons = {
        info: <Info className="h-5 w-5" />,
        warning: <AlertTriangle className="h-5 w-5" />,
        destructive: <ShieldAlert className="h-5 w-5" />,
    };

    // Use relative positioning so it pushes the Navbar down.
    return (
        <div className={`w-full px-4 py-3 relative z-40 shadow-[0_4px_30px_-5px_rgba(0,0,0,0.5)] border-b backdrop-blur-md ${styles[broadcast.type]}`}>
            <div className="container mx-auto flex items-center justify-center relative">
                <div className="flex items-center gap-3 text-center">
                    <span className="p-1 bg-black/10 rounded-full hidden md:inline-flex">
                        {icons[broadcast.type]}
                    </span>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-sm md:text-base font-medium">
                        <span className="uppercase tracking-wider font-bold opacity-80 text-xs md:text-sm border border-black/20 px-2 py-0.5 rounded inline-block">
                            {broadcast.title}
                        </span>
                        <span>{broadcast.message}</span>
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-0 p-1 hover:bg-black/10 rounded-full transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
