"use client";

import { useState, useEffect } from "react";
import { Trophy, Crosshair, Medal, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";

interface TournamentBracketProps {
    tournamentId: string;
}

interface TeamStats {
    teamId: string;
    teamName: string;
    matchesPlayed: number;
    wwcd: number; // Wins
    kills: number;
    totalPoints: number;
}

export function TournamentBracket({ tournamentId }: TournamentBracketProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<TeamStats[]>([]);
    const [stages, setStages] = useState<string[]>([]);
    const [selectedStage, setSelectedStage] = useState<string>("Overall");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Matches with Scores and Teams
                const { data: matches, error } = await supabase
                    .from('matches')
                    .select(`
                        id,
                        stage,
                        scores (
                            team_id,
                            rank,
                            kills,
                            total_points,
                            teams (
                                team_name
                            )
                        )
                    `)
                    .eq('tournament_id', tournamentId)
                    .eq('status', 'completed'); // Only count completed matches? Or all? Usually only completed have scores.

                if (error) throw error;
                if (!matches) return;

                // 2. Extract Unique Stages
                const uniqueStages = Array.from(new Set(matches.map(m => m.stage).filter(Boolean)));
                setStages(uniqueStages);

                // 3. Process Data
                processStats(matches, selectedStage);

            } catch (err) {
                console.error("Error fetching leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tournamentId, selectedStage]);

    const processStats = (matches: any[], stageFilter: string) => {
        const teamMap = new Map<string, TeamStats>();

        matches.forEach(match => {
            // Filter by stage if not "Overall"
            if (stageFilter !== "Overall" && match.stage !== stageFilter) return;

            match.scores.forEach((score: any) => {
                if (!score.teams) return; // Skip if team data missing
                const teamId = score.team_id;
                const teamName = score.teams.team_name;

                const current = teamMap.get(teamId) || {
                    teamId,
                    teamName,
                    matchesPlayed: 0,
                    wwcd: 0,
                    kills: 0,
                    totalPoints: 0
                };

                current.matchesPlayed += 1;
                current.kills += (score.kills || 0);
                current.totalPoints += (score.total_points || 0);
                if (score.rank === 1) current.wwcd += 1;

                teamMap.set(teamId, current);
            });
        });

        // Convert to Array and Sort
        const sortedStats = Array.from(teamMap.values()).sort((a, b) => {
            // Priority: Total Points -> WWCD -> Kills
            if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
            if (b.wwcd !== a.wwcd) return b.wwcd - a.wwcd;
            return b.kills - a.kills;
        });

        setStats(sortedStats);
    };

    return (
        <div className="glass-panel w-full p-6 text-white">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h3 className="font-syne text-2xl text-white mb-1">Standings</h3>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        Battle Royale •
                        <span className="text-neon-yellow">{selectedStage}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-4 text-xs text-gray-500 hidden md:flex">
                        <span className="flex items-center gap-1"><Trophy className="h-3 w-3 text-neon-yellow" /> 1st = 15 pts</span>
                        <span className="flex items-center gap-1"><Crosshair className="h-3 w-3 text-red-500" /> 1 Kill = 1 pt</span>
                    </div>

                    <div className="w-[180px]">
                        <Select value={selectedStage} onValueChange={setSelectedStage}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <span className="flex items-center gap-2">
                                    <Filter className="h-3 w-3 text-neon-blue" />
                                    <SelectValue placeholder="Select Stage" />
                                </span>
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-950 border-white/10 text-gray-200">
                                <SelectItem value="Overall">Overall Standings</SelectItem>
                                {stages.map(stage => (
                                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-hidden rounded-lg border border-white/10 relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <div className="animate-spin h-8 w-8 border-4 border-neon-yellow border-t-transparent rounded-full mb-2"></div>
                            <span className="text-xs text-neon-yellow font-mono animate-pulse">CALCULATING POINTS...</span>
                        </div>
                    </div>
                )}

                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4 w-16 text-center">Rank</th>
                            <th className="p-4">Team</th>
                            <th className="p-4 text-center">Matches</th>
                            <th className="p-4 text-center text-neon-yellow">WWCD</th>
                            <th className="p-4 text-center">Elims</th>
                            <th className="p-4 text-right">Total Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {stats.length > 0 ? (
                            stats.map((team, idx) => (
                                <tr key={team.teamId} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-center font-bold font-mono">
                                        {idx === 0 ? <Medal className="h-5 w-5 text-yellow-500 mx-auto" /> :
                                            idx === 1 ? <Medal className="h-5 w-5 text-gray-400 mx-auto" /> :
                                                idx === 2 ? <Medal className="h-5 w-5 text-amber-700 mx-auto" /> :
                                                    `#${idx + 1}`}
                                    </td>
                                    <td className="p-4 font-bold text-white text-lg">{team.teamName}</td>
                                    <td className="p-4 text-center text-gray-400 font-mono">{team.matchesPlayed}</td>
                                    <td className="p-4 text-center text-neon-yellow font-bold font-mono">{team.wwcd}</td>
                                    <td className="p-4 text-center text-red-400 font-mono">{team.kills}</td>
                                    <td className="p-4 text-right font-bold text-xl font-mono text-white">{team.totalPoints}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                    No matches completed or scores yet for this stage.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center flex justify-center gap-4">
                <span>Points System: Standard PMPL</span>
                <span>•</span>
                <span>Tie-Breaker: Total Wins &gt; Total Kills</span>
            </div>
        </div>
    );
}
