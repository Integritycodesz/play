"use client";

import { Button } from "@/components/ui/button";
import { ScoreEntry } from "@/components/admin/score-entry";
import { NewsManager } from "@/components/admin/news-manager";
import { TournamentCreator } from "@/components/admin/tournament-creator";
import { VerifyTeams } from "@/components/admin/verify-teams";
import { BroadcastManager } from "@/components/admin/broadcast-manager";
import { Users, Trophy, AlertCircle, FileText, Swords, FileOutput, Shield, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("scores");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Stats State
    const [stats, setStats] = useState({
        players: "0",
        tournaments: "0",
        disputes: "0",
        signups: "0"
    });

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // Verify Role in Profiles Table
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                toast({
                    title: "Access Denied",
                    description: "You do not have permission to view this page.",
                    variant: "destructive"
                });
                router.push("/dashboard");
                return;
            }

            setIsAdmin(true);

            // Load Stats (Step 2)
            await loadStats();
            setIsLoading(false);
        };

        const loadStats = async () => {
            try {
                // 1. Players (Profiles)
                const { count: playersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

                // 2. Tournaments
                const { count: tournamentsCount } = await supabase.from('tournaments').select('*', { count: 'exact', head: true });

                // 3. Pending Requests (Teams with status='pending')
                const { count: pendingCount } = await supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'pending');

                // 4. Total Signups (Total Teams)
                const { count: signupsCount } = await supabase.from('teams').select('*', { count: 'exact', head: true });

                setStats({
                    players: (playersCount || 0).toLocaleString(),
                    tournaments: (tournamentsCount || 0).toLocaleString(),
                    disputes: (pendingCount || 0).toLocaleString(),
                    signups: (signupsCount || 0).toLocaleString()
                });
            } catch (e) {
                console.error("Failed to load admin stats", e);
            }
        };

        checkAdmin();
    }, [router, toast]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-neon-blue">Verifying Admin Privileges...</div>;
    }

    if (!isAdmin) return null;

    const handleAction = (action: string) => {
        toast({
            title: "Action Initiated",
            description: `Started: ${action}`,
        });
    };

    const handleQuickAction = (action: string) => {
        if (action === "create") {
            setActiveTab("create");
            toast({ title: "Navigation", description: "Switched to Tournament Creator" });
        } else if (action === "verify") {
            setActiveTab("verify");
            toast({ title: "Navigation", description: "Switched to Team Verification" });
        } else if (action === "broadcast") {
            setActiveTab("broadcast");
            toast({ title: "Broadcast", description: "Opening Global Announcement Interface..." });
        }
    };
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="font-syne text-4xl font-bold text-white text-neon-red">Admin Control Center</h1>
                <div className="flex gap-2">
                    <Button variant="destructive" className="font-bold">Reset System</Button>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">Logs</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-8">
                <AdminStat icon={<Users className="text-neon-blue" />} label="Active Players" value={stats.players} />
                <AdminStat icon={<Trophy className="text-neon-yellow" />} label="Active Tournaments" value={stats.tournaments} />
                <AdminStat icon={<AlertCircle className="text-neon-red" />} label="Pending Requests" value={stats.disputes} />
                <AdminStat icon={<Users className="text-neon-green" />} label="Total Signups" value={stats.signups} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-white/5 border border-white/10 w-full justify-start h-auto p-1 mb-6 flex-wrap">
                            <TabsTrigger value="scores" className="data-[state=active]:bg-neon-red data-[state=active]:text-white font-syne py-2 px-6 flex items-center gap-2">
                                <Swords className="h-4 w-4" /> Match Scores
                            </TabsTrigger>
                            <TabsTrigger value="news" className="data-[state=active]:bg-neon-blue data-[state=active]:text-black font-syne py-2 px-6 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> News Manager
                            </TabsTrigger>
                            <TabsTrigger value="create" className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black font-syne py-2 px-6 flex items-center gap-2">
                                <Trophy className="h-4 w-4" /> Create
                            </TabsTrigger>
                            <TabsTrigger value="verify" className="data-[state=active]:bg-neon-green data-[state=active]:text-black font-syne py-2 px-6 flex items-center gap-2">
                                <Shield className="h-4 w-4" /> Verify
                            </TabsTrigger>
                            <TabsTrigger value="broadcast" className="data-[state=active]:bg-neon-red data-[state=active]:text-white font-syne py-2 px-6 flex items-center gap-2">
                                <Megaphone className="h-4 w-4" /> Broadcast
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="scores" className="mt-0">
                            <ScoreEntry />
                        </TabsContent>

                        <TabsContent value="news" className="mt-0">
                            <NewsManager />
                        </TabsContent>

                        <TabsContent value="create" className="mt-0">
                            <TournamentCreator />
                        </TabsContent>

                        <TabsContent value="verify" className="mt-0">
                            <VerifyTeams />
                        </TabsContent>

                        <TabsContent value="broadcast" className="mt-0">
                            <BroadcastManager />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="glass-panel border-white/10">
                        <CardHeader>
                            <CardTitle className="font-syne text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full justify-start bg-white/5 hover:bg-white/10 text-white"
                                variant="ghost"
                                onClick={() => handleQuickAction("create")}
                            >
                                <Trophy className="mr-2 h-4 w-4 text-neon-yellow" /> Create Tournament
                            </Button>
                            <Button
                                className="w-full justify-start bg-white/5 hover:bg-white/10 text-white"
                                variant="ghost"
                                onClick={() => handleQuickAction("verify")}
                            >
                                <Users className="mr-2 h-4 w-4 text-neon-blue" /> Verify Teams
                            </Button>
                            <Button
                                className="w-full justify-start bg-white/5 hover:bg-white/10 text-white"
                                variant="ghost"
                                onClick={() => handleQuickAction("broadcast")}
                            >
                                <AlertCircle className="mr-2 h-4 w-4 text-neon-red" /> Broadcast Message
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    );
}

function AdminStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <Card className="glass-panel border-white/10">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/5">{icon}</div>
                <div>
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
