"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/lib/supabaseClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Realtime Subscription
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
                fetchNotifications();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id);

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    return (
        <Popover onOpenChange={(open: boolean) => { if (open) markAllAsRead(); }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/10 text-white">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-neon-green animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 border-white/10 bg-black/90 backdrop-blur-md p-0">
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <h4 className="font-syne font-bold text-white">Notifications</h4>
                    {unreadCount > 0 && <Badge variant="secondary" className="bg-neon-green text-black">{unreadCount} New</Badge>}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">
                            No new transmissions.
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {notifications.map((notification) => (
                                <div key={notification.id} className={`p-4 ${!notification.is_read ? 'bg-white/5' : ''}`}>
                                    <div className="mb-1 text-sm font-bold text-white">{notification.title}</div>
                                    <p className="text-xs text-gray-400 leading-relaxed mb-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-[10px] text-gray-600 uppercase font-mono">
                                        {new Date(notification.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
