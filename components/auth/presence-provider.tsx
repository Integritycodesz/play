"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { usePathname } from 'next/navigation';

interface PresenceContextType {
    onlineUsers: Set<string>;
}

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: new Set() });

export const usePresence = () => useContext(PresenceContext);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const pathname = usePathname();

    useEffect(() => {
        const trackPresence = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const channel = supabase.channel('global_presence', {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            });

            channel
                .on('presence', { event: 'sync' }, () => {
                    const newState = channel.presenceState();
                    const newOnlineUsers = new Set(Object.keys(newState));
                    setOnlineUsers(newOnlineUsers);
                })
                .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                    setOnlineUsers((prev) => {
                        const newSet = new Set(prev);
                        newSet.add(key);
                        return newSet;
                    });
                })
                .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                    setOnlineUsers((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(key);
                        return newSet;
                    });
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({
                            online_at: new Date().toISOString(),
                            user_id: user.id,
                        });
                    }
                });

            return () => {
                supabase.removeChannel(channel);
            };
        };

        trackPresence();
    }, [pathname]); // Re-track on navigation to ensure persistence if needed, though simple mount is usually enough.

    return (
        <PresenceContext.Provider value={{ onlineUsers }}>
            {children}
        </PresenceContext.Provider>
    );
}
