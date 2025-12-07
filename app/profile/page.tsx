"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Trophy, Crown, Loader2, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Auth Guard & Data Fetching
        const loadProfile = async () => {
            const session = localStorage.getItem("user_session");
            if (!session) {
                router.push("/login");
                return;
            }

            const userData = JSON.parse(session);
            setUser(userData);

            // Fetch Registrations from Supabase
            try {
                const { data, error } = await supabase
                    .from('teams')
                    .select('*')
                    .eq('captain_id', userData.id);

                if (data && !error) {
                    const dbRegs = data.map((t: any) => ({
                        id: t.id,
                        tournamentId: t.tournament_id,
                        teamName: t.team_name,
                        isCaptain: true,
                        status: t.status,
                        requestedAt: t.created_at
                    }));
                    setRegistrations(dbRegs);
                }
            } catch (err) {
                console.error("Profile fetch error", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user_session");
        window.dispatchEvent(new Event("user-login"));
        toast({ title: "Logged Out", description: "See you next time!" });
        router.push("/");
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neon-yellow" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="font-syne text-4xl font-bold text-white mb-8"> <span className="text-neon-blue">Player</span> Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Info Card */}
                <Card className="glass-panel border-white/10 h-fit">
                    <CardHeader className="text-center pb-2">
                        <Avatar className="h-24 w-24 mx-auto mb-4 border-2 border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                            <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.ign}`} />
                            <AvatarFallback>{user.ign[0]}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-2xl font-bold text-white">{user.ign}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-2">
                            <Badge variant="outline" className="border-neon-yellow/50 text-neon-yellow">
                                {user.role === 'admin' ? 'Administrator' : 'Verified Player'}
                            </Badge>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Email Address</p>
                                <p className="text-sm font-medium text-white">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Joined</p>
                                <p className="text-sm font-medium text-white">
                                    {new Date(user.created_at || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" /> Log Out
                        </Button>
                    </CardContent>
                </Card>

                {/* Tournament History */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white font-syne flex items-center gap-2">
                        <Trophy className="text-neon-yellow" /> Tournament Registrations
                    </h2>

                    {registrations.length === 0 ? (
                        <Card className="glass-panel border-white/10 border-dashed p-8 text-center bg-white/5">
                            <p className="text-gray-400 mb-4">You haven't joined any tournaments yet.</p>
                            <Button
                                className="bg-neon-yellow text-black font-bold hover:bg-neon-yellow/90"
                                onClick={() => router.push("/tournaments")}
                            >
                                Browse Tournaments
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {registrations.map((reg) => (
                                <Card key={reg.id} className="glass-panel border-white/10 transition-colors hover:bg-white/5">
                                    <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-white">{reg.teamName}</h3>
                                                {reg.isCaptain && (
                                                    <Badge className="bg-neon-yellow/20 text-neon-yellow hover:bg-neon-yellow/30 border-none">
                                                        <Crown className="h-3 w-3 mr-1" /> Captain
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                Registered for Tournament #{reg.tournamentId} • {new Date(reg.requestedAt).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <Badge
                                                variant="outline"
                                                className={`
                                                    ${reg.status === 'approved' ? 'border-neon-green/50 text-neon-green' : ''}
                                                    ${reg.status === 'pending' ? 'border-yellow-500/50 text-yellow-500' : ''}
                                                    ${reg.status === 'rejected' ? 'border-red-500/50 text-red-500' : ''}
                                                    capitalize px-3 py-1
                                                `}
                                            >
                                                {reg.status}
                                            </Badge>

                                            {reg.isCaptain && reg.status === 'approved' && (
                                                <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/10">
                                                    Manage Team
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
