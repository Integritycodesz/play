"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Megaphone, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BroadcastMessage {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "destructive";
    timestamp: string;
    active: boolean;
}

export function BroadcastManager() {
    const { toast } = useToast();
    const [activeBroadcast, setActiveBroadcast] = useState<BroadcastMessage | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"info" | "warning" | "destructive">("info");

    useEffect(() => {
        // Load active broadcast from local storage
        const saved = localStorage.getItem("system_broadcast");
        if (saved) {
            setActiveBroadcast(JSON.parse(saved));
        }
    }, []);

    const handleSendBroadcast = () => {
        if (!title || !message) {
            toast({
                title: "Validation Error",
                description: "Title and Message are required.",
                variant: "destructive"
            });
            return;
        }

        const newBroadcast: BroadcastMessage = {
            id: Date.now().toString(),
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            active: true
        };

        setActiveBroadcast(newBroadcast);
        localStorage.setItem("system_broadcast", JSON.stringify(newBroadcast));
        window.dispatchEvent(new Event("broadcast-update"));

        toast({
            title: "Broadcast Sent",
            description: "System message is now live for all users.",
        });

        // Reset form
        setTitle("");
        setMessage("");
    };

    const handleClearBroadcast = () => {
        setActiveBroadcast(null);
        localStorage.removeItem("system_broadcast");
        window.dispatchEvent(new Event("broadcast-update"));
        toast({
            title: "Broadcast Cleared",
            description: "The system message has been removed.",
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-panel border-white/10">
                <CardHeader>
                    <CardTitle className="font-syne text-xl flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-neon-yellow" />
                        Create Announcement
                    </CardTitle>
                    <p className="text-sm text-gray-400">
                        Send a global notification to all active users.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Severity Level</label>
                        <Select value={type} onValueChange={(v: "info" | "warning" | "destructive") => setType(v)}>
                            <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                <SelectItem value="info">Information (Blue)</SelectItem>
                                <SelectItem value="warning">Warning (Yellow)</SelectItem>
                                <SelectItem value="destructive">Urgent / Critical (Red)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Title</label>
                        <Input
                            placeholder="e.g. Server Maintenance, Tournament Delay..."
                            className="bg-black/50 border-white/10 text-white"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Message Content</label>
                        <Textarea
                            placeholder="Enter the details of your announcement here..."
                            className="bg-black/50 border-white/10 text-white min-h-[120px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleSendBroadcast}
                            className="w-full bg-neon-green text-white hover:bg-neon-green/90 font-bold h-12 text-lg"
                        >
                            <Megaphone className="mr-2 h-5 w-5" /> Send Broadcast
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="glass-panel border-white/10 h-full">
                    <CardHeader>
                        <CardTitle className="font-syne text-xl">Live Preview</CardTitle>
                        <p className="text-sm text-gray-400">
                            Current active system status.
                        </p>
                    </CardHeader>
                    <CardContent>
                        {activeBroadcast ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase font-bold text-neon-green tracking-widest">● System Live</span>
                                    <div className="text-xs text-gray-500">
                                        Posted: {new Date(activeBroadcast.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <Alert
                                    className={`
                                        ${activeBroadcast.type === 'info' ? 'border-neon-blue/50 bg-neon-blue/10 text-neon-blue' : ''}
                                        ${activeBroadcast.type === 'warning' ? 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow' : ''}
                                        ${activeBroadcast.type === 'destructive' ? 'border-neon-red/50 bg-neon-red/10 text-neon-red' : ''}
                                    `}
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle className="font-bold">{activeBroadcast.title}</AlertTitle>
                                    <AlertDescription>
                                        {activeBroadcast.message}
                                    </AlertDescription>
                                </Alert>

                                <Button
                                    variant="outline"
                                    onClick={handleClearBroadcast}
                                    className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Clear Broadcast
                                </Button>
                            </div>
                        ) : (title || message) ? (
                            <div className="space-y-4 opacity-70">
                                <span className="text-xs uppercase font-bold text-gray-500 tracking-widest">● Draft Preview</span>
                                <Alert
                                    className={`border-dashed
                                        ${type === 'info' ? 'border-neon-blue/50 bg-neon-blue/5 text-neon-blue' : ''}
                                        ${type === 'warning' ? 'border-neon-yellow/50 bg-neon-yellow/5 text-neon-yellow' : ''}
                                        ${type === 'destructive' ? 'border-neon-red/50 bg-neon-red/5 text-neon-red' : ''}
                                    `}
                                >
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle className="font-bold">{title || "Title Example"}</AlertTitle>
                                    <AlertDescription>
                                        {message || "Message content example..."}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-gray-500 border-2 border-dashed border-white/10 rounded-lg">
                                <CheckCircle2 className="h-12 w-12 mb-2 opacity-50" />
                                <p>No Active Broadcasts</p>
                                <p className="text-xs">System is operating normally.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
