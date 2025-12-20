"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Users, UserPlus, Copy, Check, LogOut, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

interface TeamRegistrationProps {
    tournamentId: string;
}

export function TeamRegistration({ tournamentId }: TeamRegistrationProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [myTeam, setMyTeam] = useState<any>(null);
    const [inviteCode, setInviteCode] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Initial Load
    useEffect(() => {
        const checkStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setIsLoading(false);
                return;
            }

            setUser(session.user);

            // 1. Check Admin
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
            if (profile?.role === 'admin') {
                setIsAdmin(true);
                setIsLoading(false);
                return;
            }

            // 2. Check if user is in a team for this tournament
            // We join team_members -> teams -> filter by tournamentId
            const { data, error } = await supabase
                .from('team_members')
                .select(`
                    role,
                    team:teams!inner (
                        id,
                        team_name,
                        invite_code,
                        status
                    )
                `)
                .eq('user_id', session.user.id)
                .eq('teams.tournament_id', tournamentId)
                .maybeSingle();

            if (data?.team) {
                setMyTeam({
                    ...data.team,
                    myRole: data.role
                });
            }

            setIsLoading(false);
        };

        checkStatus();
    }, [tournamentId]);

    const handleCreateTeam = async () => {
        setIsJoining(true);
        // ... (Logic currently in JoinButton, moved here)
        // 1. Validate Tournament ID
        if (tournamentId.length < 20) {
            toast({ title: "Configuration Error", description: "Invalid Tournament ID.", variant: "destructive" });
            setIsJoining(false);
            return;
        }

        // 2. Foreign Key Check: Ensure Profile Exists
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
        if (!profile) {
            // Auto-Fix
            await supabase.from('profiles').insert({ id: user.id, email: user.email, ign: user.user_metadata.ign || "Player" });
        }

        try {
            const { error } = await supabase
                .from('teams')
                .insert({
                    tournament_id: tournamentId,
                    captain_id: user.id,
                    team_name: `${user.user_metadata.ign || 'Player'}'s Team`,
                    status: 'pending'
                });

            if (error) throw error;

            toast({ title: "Team Created", description: "You are now the captain. Invite your friends!", className: "bg-neon-green text-black" });
            window.location.reload(); // Simple reload to refresh state
        } catch (err: any) {
            console.error("Join failed:", err);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsJoining(false);
        }
    };

    const handleJoinViaCode = async () => {
        if (inviteCode.length < 6) return;
        setIsJoining(true);

        // Call our PCR function
        const { data, error } = await supabase
            .rpc('join_team_via_code', {
                p_invite_code: inviteCode,
                p_user_id: user.id
            });

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else if (data && !data.success) {
            toast({ title: "Join Failed", description: data.message, variant: "destructive" });
        } else {
            toast({ title: "Success!", description: "You have joined the team.", className: "bg-neon-green text-black" });
            window.location.reload();
        }
        setIsJoining(false);
    };

    const copyCode = () => {
        if (myTeam?.invite_code) {
            navigator.clipboard.writeText(myTeam.invite_code);
            toast({ title: "Copied!", description: "Invite code copied to clipboard." });
        }
    };

    if (isLoading) return <Button disabled className="w-full bg-white/5">Loading...</Button>;

    if (!user) {
        return (
            <Link href="/login" className="w-full">
                <Button className="w-full bg-[var(--neon-blue)] text-black font-bold h-12 text-lg hover:opacity-90">
                    Log in to Register
                </Button>
            </Link>
        );
    }

    if (isAdmin) {
        return (
            <Link href="/admin">
                <Button className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold h-12 text-lg border border-red-500/50">
                    <ShieldAlert className="mr-2 h-5 w-5" /> Manage This Tournament
                </Button>
            </Link>
        );
    }

    if (myTeam) {
        return (
            <Card className="glass-panel border-neon-green/30">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center text-lg text-neon-green">
                        <span>{myTeam.team_name}</span>
                        <span className="text-xs px-2 py-1 bg-neon-green/10 rounded border border-neon-green/20 uppercase">{myTeam.status}</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        You are a {myTeam.myRole} of this team.
                    </CardDescription>
                </CardHeader>
                {myTeam.myRole === 'captain' && (
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 uppercase font-bold">Invite Teammates</label>
                            <div className="flex gap-2">
                                <Input readOnly value={myTeam.invite_code || "Generating..."} className="bg-black/50 border-white/10 font-mono text-center tracking-widest text-lg" />
                                <Button onClick={copyCode} variant="outline" className="border-neon-blue text-neon-blue hover:bg-neon-blue/10">
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-gray-400">Share this code with your teammates. They can use it to join this team instantly.</p>
                        </div>
                    </CardContent>
                )}
                {myTeam.myRole === 'member' && (
                    <CardContent>
                        <p className="text-sm text-gray-400">Waiting for captain to manage the team.</p>
                    </CardContent>
                )}
            </Card>
        );
    }

    return (
        <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger value="create">Create Team</TabsTrigger>
                <TabsTrigger value="join">Join Team</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4 mt-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-sm text-gray-400">
                    Create a new team and become the <strong>Captain</strong>. You will get an invite code to add other players.
                </div>
                <Button
                    onClick={handleCreateTeam}
                    disabled={isJoining}
                    className="w-full bg-[var(--neon-blue)] text-black font-bold h-12 text-lg hover:opacity-90 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                >
                    {isJoining ? "Creating..." : "Create New Team"}
                </Button>
            </TabsContent>

            <TabsContent value="join" className="space-y-4 mt-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-sm text-gray-400">
                    Enter the <strong>6-character invite code</strong> shared by your team captain.
                </div>
                <div className="flex gap-2">
                    <Input
                        placeholder="ENTER CODE"
                        className="h-12 text-center uppercase tracking-widest text-lg bg-black/50 border-white/20"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        maxLength={6}
                    />
                </div>
                <Button
                    onClick={handleJoinViaCode}
                    disabled={isJoining || inviteCode.length < 6}
                    className="w-full bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/50 font-bold h-12 text-lg hover:bg-neon-yellow/30"
                >
                    {isJoining ? "Joining..." : "Join Team"}
                </Button>
            </TabsContent>
        </Tabs>
    );
}
