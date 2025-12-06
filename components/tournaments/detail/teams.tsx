import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TournamentTeams() {
    // Mock Teams
    const teams = Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        name: `Team ${String.fromCharCode(65 + i)}`,
        captain: `Player ${i}`,
        status: "Confirmed",
    }));

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {teams.map((team) => (
                <div key={team.id} className="glass-panel flex items-center gap-3 rounded-lg p-4 transition-colors hover:bg-white/5">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${team.name}`} />
                        <AvatarFallback>{team.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="truncate font-bold text-white">{team.name}</h4>
                        <p className="truncate text-xs text-gray-400">Cpt: {team.captain}</p>
                    </div>
                    <Badge variant="outline" className="border-green-500/50 text-green-500 text-[10px]">
                        Ready
                    </Badge>
                </div>
            ))}
        </div>
    );
}
