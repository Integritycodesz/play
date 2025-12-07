import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Crown } from "lucide-react";

interface TournamentTeamsProps {
    tournamentId: string;
}

export function TournamentTeams({ tournamentId }: TournamentTeamsProps) {
    // 1. Read 'approved' requests from localStorage
    const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => {
        // Initial load
        const loadTeams = () => {
            const requests = JSON.parse(localStorage.getItem("tournament_requests") || "[]");
            // Filter for this tournament AND approved status
            const approvedTeams = requests.filter((r: any) => r.tournamentId === tournamentId && r.status === "approved");

            // Map to UI format
            const uiTeams = approvedTeams.map((t: any, i: number) => ({
                id: i,
                name: t.teamName || t.ign + "'s Team",
                captain: t.ign,
                status: "Ready",
                avatarSeed: t.ign // Use IGN for avatar consistency
            }));

            setTeams(uiTeams);
        };

        loadTeams();
        // Poll for updates (in case admin approves while viewing)
        const interval = setInterval(loadTeams, 3000);
        return () => clearInterval(interval);
    }, [tournamentId]);

    // If no teams, show empty state
    if (teams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                <Users className="h-12 w-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Teams Yet</h3>
                <p className="text-gray-400 max-w-sm">
                    Be the first to register and claim your spot in the bracket!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {teams.map((team) => (
                <div key={team.id} className="glass-panel flex items-center gap-3 rounded-lg p-4 transition-colors hover:bg-white/5 animate-in fade-in duration-500">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${team.avatarSeed}`} />
                        <AvatarFallback>{team.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="truncate font-bold text-white">{team.name}</h4>
                        <p className="truncate text-xs text-gray-400 flex items-center gap-1">
                            <Crown className="h-3 w-3 text-neon-yellow" /> {team.captain}
                        </p>
                    </div>
                    <Badge variant="outline" className="border-green-500/50 text-green-500 text-[10px]">
                        Ready
                    </Badge>
                </div>
            ))}
        </div>
    );
}
