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
                    .select(`
                        id, 
                        team_name,
                        members:team_members(
                            role,
                            profile:profiles(ign)
                        )
                    `)
                    .eq('tournament_id', tournamentId)
                    .eq('status', 'approved');

                if (data && !error) {
                    const realTeams = data.map((t: any) => ({
                        id: t.id,
                        name: t.team_name,
                        members: t.members?.map((m: any) => ({
                            ign: m.profile?.ign || "Unknown",
                            role: m.role
                        })).sort((a: any, b: any) => a.role === 'captain' ? -1 : 1), // Captain first
                        status: "Ready",
                        avatarSeed: t.team_name
                    }));
                    setTeams(realTeams);
                }
            } catch (err) {
                console.warn("Supabase fetch error", err);
            }
        };

        loadTeams();
        const interval = setInterval(loadTeams, 10000); // 10s poll
        return () => clearInterval(interval);
    }, [tournamentId]);

    // ... (empty state check) ...

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {teams.map((team) => (
                <div key={team.id} className="glass-panel rounded-lg p-4 transition-colors hover:bg-white/5 animate-in fade-in duration-500 border border-white/10 group">
                    <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
                        <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${team.avatarSeed}`} />
                            <AvatarFallback>{team.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <h4 className="truncate font-bold text-white text-lg font-syne group-hover:text-neon-blue transition-colors">{team.name}</h4>
                            <Badge variant="outline" className="border-neon-green/30 text-neon-green text-[10px] h-5">
                                {team.members.length} Players
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {team.members.map((member: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-white/5">
                                <span className={`flex items-center gap-2 ${member.role === 'captain' ? 'text-neon-yellow font-medium' : 'text-gray-400'}`}>
                                    {member.role === 'captain' && <Crown className="h-3 w-3" />}
                                    {member.ign}
                                </span>
                                {member.role === 'captain' && <span className="text-[10px] text-gray-600 uppercase">CPT</span>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
