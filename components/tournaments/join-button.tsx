"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Check, Clock, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function TournamentJoinButton({ tournamentId }: { tournamentId: string }) {
    const { toast } = useToast();
    const router = useRouter();
    const [status, setStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const localSession = localStorage.getItem("user_session");
            if (!localSession) return;
            const user = JSON.parse(localSession);

            if (user.id) {
                try {
                    const { data, error } = await supabase
                        .from('teams')
                        .select('status')
                        .eq('tournament_id', tournamentId)
                        .eq('captain_id', user.id)
                        .maybeSingle();

                    if (data) {
                        setStatus(data.status as any);
                    }
                } catch (err) {
                    console.error("Supabase check failed", err);
                }
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, [tournamentId]);

    const handleJoin = async () => {
        setIsLoading(true);

        // Check for real Supabase session
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            toast({
                title: "Login Required",
                description: "Your session has expired. Please log in again.",
                variant: "destructive"
            });
            router.push("/login"); // Redirect to login
            return;
        }

        // 1. Validate Tournament ID
        if (tournamentId.length < 20) {
            toast({ title: "Configuration Error", description: "Invalid Tournament ID. Please clear cache/localStorage.", variant: "destructive" });
            console.error("Invalid UUID:", tournamentId);
            setIsLoading(false);
            return;
        }

        // 2. Foreign Key Check: Ensure Profile Exists
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
        if (!profile) {
            toast({ title: "Profile Missing", description: "Your account is missing a profile. Running auto-fix...", variant: "destructive" });
            // Auto-Fix attempt (Optional, but helpful)
            await supabase.from('profiles').insert({ id: user.id, email: user.email, ign: user.user_metadata.ign || "Player" });
            // Retry? For now just alert user.
        }

        // Try Supabase Insert
        try {
            const { error } = await supabase
                .from('teams')
                .insert({
                    tournament_id: tournamentId,
                    captain_id: user.id, // Use the authenticated ID
                    team_name: `${user.user_metadata.ign || 'Player'}'s Team`, // Use metadata
                    status: 'pending'
                });

            if (error) throw error;

            setStatus("pending");
            toast({
                title: "Request Sent",
                description: "Your participation request is awaiting admin approval.",
                className: "bg-yellow-500 text-black border-none"
            });
        } catch (err: any) {
            // ... existing catch ...
            console.error("Supabase join failed:", err);
            toast({
                title: "Error",
                description: "Could not register team. " + err.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "approved") {
        return (
            <Button disabled className="w-full bg-neon-green/20 text-neon-green font-bold h-12 text-lg border border-neon-green/50">
                <Check className="mr-2 h-5 w-5" /> Joined
            </Button>
        );
    }

    if (status === "pending") {
        return (
            <Button disabled className="w-full bg-yellow-500/20 text-yellow-500 font-bold h-12 text-lg border border-yellow-500/50">
                <Clock className="mr-2 h-5 w-5" /> Pending Approval
            </Button>
        );
    }

    if (status === "rejected") {
        return (
            <Button disabled className="w-full bg-red-500/20 text-red-500 font-bold h-12 text-lg border border-red-500/50">
                <XCircle className="mr-2 h-5 w-5" /> Request Rejected
            </Button>
        );
    }

    return (
        <Button
            onClick={handleJoin}
            disabled={isLoading}
            className="w-full bg-[var(--neon-blue)] text-black font-bold h-12 text-lg hover:opacity-90 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
        >
            {isLoading ? "Sending Request..." : "Register Team"}
        </Button>
    );
}
