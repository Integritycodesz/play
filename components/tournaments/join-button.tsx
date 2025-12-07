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
        const session = localStorage.getItem("user_session");

        if (!session) {
            toast({
                title: "Login Required",
                description: "You must be logged in to join tournaments.",
                variant: "destructive"
            });
            router.push("/login");
            return;
        }

        const user = JSON.parse(session);

        // Try Supabase Insert
        try {
            const { error } = await supabase
                .from('teams')
                .insert({
                    tournament_id: tournamentId,
                    captain_id: user.id,
                    team_name: `${user.ign}'s Team`,
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
