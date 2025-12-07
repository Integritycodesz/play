import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Crown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface TournamentTeamsProps {
    tournamentId: string;
}

export function TournamentTeams({ tournamentId }: TournamentTeamsProps) {
    const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => {
        const loadTeams = async () => {
            try {
                const { data, error } = await supabase
                    .from('teams')
                    .select('*, captain:profiles(ign)')
                    .eq('tournament_id', tournamentId)
                    .eq('status', 'approved'); // Only show Approved teams

                if (data && !error) {
                    const realTeams = data.map((t: any) => ({
                        id: t.id,
                        name: t.team_name,
                        captain: t.captain?.ign || "Unknown",
                        status: "Ready",
                        avatarSeed: t.captain?.ign || t.team_name
                    }));
                    setTeams(realTeams);
                }
            } catch (err) {
                console.warn("Supabase fetch error", err);
            }
        };

        loadTeams();
        const interval = setInterval(loadTeams, 5000);
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
