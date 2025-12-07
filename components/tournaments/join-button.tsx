"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Check, Clock, XCircle } from "lucide-react";

export function TournamentJoinButton({ tournamentId }: { tournamentId: string }) {
    const { toast } = useToast();
    const router = useRouter();
    const [status, setStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkStatus = () => {
            const session = localStorage.getItem("user_session");
            if (session) {
                const user = JSON.parse(session);
                const requests = JSON.parse(localStorage.getItem("tournament_requests") || "[]");

                // Find explicit request for this user & tournament
                const myRequest = requests.find((r: any) => r.userId === user.id && r.tournamentId === tournamentId);

                if (myRequest) {
                    setStatus(myRequest.status);
                }
            }
        };

        checkStatus();
        // Poll for updates in case admin approves while user is on page
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, [tournamentId]);

    const handleJoin = () => {
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
        const requests = JSON.parse(localStorage.getItem("tournament_requests") || "[]");

        // Create Request
        const newRequest = {
            id: Date.now().toString(),
            tournamentId,
            userId: user.id,
            ign: user.ign,
            teamName: user.ign + "'s Team",
            isCaptain: true, // Mark registrant as captain
            captainId: user.id,
            status: "pending", // Now PENDING by default
            requestedAt: new Date().toISOString()
        };

        requests.push(newRequest);
        localStorage.setItem("tournament_requests", JSON.stringify(requests));

        setTimeout(() => {
            setStatus("pending");
            setIsLoading(false);
            toast({
                title: "Request Sent",
                description: "Your participation request is awaiting admin approval.",
                className: "bg-yellow-500 text-black border-none"
            });
        }, 600);
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
