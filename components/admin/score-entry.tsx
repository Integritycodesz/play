"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

// Standard Point System (Fallback)
const PLACEMENT_POINTS: Record<number, number> = {
    1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1
};

interface TeamScore {
    id: string; // Changed from number to string (UUID)
    name: string;
    rank: number | "";
    kills: number | "";
    total: number;
}

export function ScoreEntry() {
    const { toast } = useToast();
    const [selectedTournament, setSelectedTournament] = useState<string>("");
    const [selectedMatchId, setSelectedMatchId] = useState<string>("");
    const [availableMatches, setAvailableMatches] = useState<{ id: string, name: string }[]>([]);
    // Update type to include scoring_config
    const [tournaments, setTournaments] = useState<{ id: string, title: string, scoring_config?: any, matches?: { id: string, name: string, map: string, stage: string }[] }[]>([]);

    // Fetch tournaments on mount
    useEffect(() => {
        const fetchTournaments = async () => {
            const { data, error } = await supabase
                .from('tournaments')
                .select(`
                    id, 
                    title,
                    scoring_config, 
                    matches (
                        id,
                        name,
                        map,
                        stage
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching tournaments:", error);
                // Fallback attempt for older schema capability
                const { data: retryData, error: retryError } = await supabase
                    .from('tournaments')
                    .select(`
                        id, 
                        title, 
                        scoring_config,
                        matches (
                            id,
                            name,
                            map
                        )
                    `)
                    .order('created_at', { ascending: false });

                if (retryError) {
                    toast({ title: "Error", description: "Failed to load tournaments.", variant: "destructive" });
                } else {
                    const mappedData = retryData?.map(t => ({
                        ...t,
                        matches: t.matches?.map((m: any) => ({
                            ...m,
                            stage: 'Group Stage'
                        }))
                    }));
                    setTournaments(mappedData || []);
                }
            } else {
                setTournaments(data || []);
            }
        };

        fetchTournaments();
    }, []);

    // State for scores - initialized as empty, populated on tournament selection
    const [scores, setScores] = useState<TeamScore[]>([]);
    const [matchStatus, setMatchStatus] = useState<string>("scheduled");

    // Fetch registered teams when tournament changes
    useEffect(() => {
        // ... existing code ...
        const fetchTeams = async () => {
            if (!selectedTournament) return;

            const { data: teamsData, error } = await supabase
                .from('teams')
                .select('id, team_name')
                .eq('tournament_id', selectedTournament)
                .eq('status', 'approved');

            if (error) {
                console.error("Error fetching teams:", error);
                toast({ title: "Error", description: "Failed to load teams.", variant: "destructive" });
                return;
            }

            if (teamsData) {
                const initialScores: TeamScore[] = teamsData.map(team => ({
                    id: team.id,
                    name: team.team_name,
                    rank: "",
                    kills: "",
                    total: 0
                }));
                setScores(initialScores);
            }
        };

        fetchTeams();
    }, [selectedTournament]);

    // Update available matches when tournament changes
    useEffect(() => {
        const tournament = tournaments.find(t => t.id === selectedTournament);
        if (tournament && tournament.matches && tournament.matches.length > 0) {
            setAvailableMatches(tournament.matches.map((m: any) => ({
                id: m.id, // Use REAL ID
                name: `[${m.stage || 'Group Stage'}] ${m.name} (${m.map})`
            })));
            setSelectedMatchId(""); // Reset selected match
        } else {
            setAvailableMatches([]);
        }
    }, [selectedTournament, tournaments]);

    // Fetch scores AND status when match changes
    useEffect(() => {
        const fetchScoresAndStatus = async () => {
            if (!selectedMatchId) return;

            // 1. Fetch Status
            const { data: matchData } = await supabase
                .from('matches')
                .select('status')
                .eq('id', selectedMatchId)
                .single();

            if (matchData) {
                setMatchStatus(matchData.status || 'scheduled');
            }

            // 2. Fetch Scores
            const { data } = await supabase
                .from('scores')
                .select('*, teams(team_name)')
                .eq('match_id', selectedMatchId);

            if (data && data.length > 0) {
                // If we have published scores, merge them with the existing teams list
                setScores(prevScores => prevScores.map(team => {
                    const savedScore = data.find((s: any) => s.team_id === team.id);
                    if (savedScore) {
                        return {
                            ...team,
                            rank: savedScore.rank,
                            kills: savedScore.kills,
                            total: savedScore.total_points
                        };
                    }
                    return team;
                }));
            } else {
                setScores(prev => prev.map(p => ({ ...p, rank: "", kills: "", total: 0 })));
            }
        };
        fetchScoresAndStatus();
    }, [selectedMatchId]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedMatchId) return;

        const { error } = await supabase
            .from('matches')
            .update({ status: newStatus })
            .eq('id', selectedMatchId);

        if (error) {
            toast({ title: "Error", description: "Failed to update match status.", variant: "destructive" });
        } else {
            setMatchStatus(newStatus);
            toast({
                title: "Status Updated",
                description: `Match marked as ${newStatus.toUpperCase()}.`,
                className: newStatus === 'live' ? 'bg-red-500 text-white' : newStatus === 'completed' ? 'bg-green-500 text-white' : ''
            });
        }
    };

    // Auto-calculate scores whenever rank or kills change locally
    useEffect(() => {
        setScores(prevScores => prevScores.map(team => {
            const rank = Number(team.rank) || 0;
            const kills = Number(team.kills) || 0;

            // Determine active rules
            const tournament = tournaments.find(t => t.id === selectedTournament);
            const rules = tournament?.scoring_config as { kill_points: number, placement_points: Record<string, number> } | undefined;

            const killPts = kills * (rules?.kill_points ?? 1);

            // Handle placement points: try rules first, then fallback constant
            let placePts = 0;
            if (rules?.placement_points) {
                placePts = rules.placement_points[String(rank)] || 0;
            } else {
                placePts = PLACEMENT_POINTS[rank] || 0;
            }

            return { ...team, total: placePts + killPts };
        }));
    }, [scores.map(s => `${s.rank}-${s.kills}`).join(','), selectedTournament, tournaments]);

    const handleScoreChange = (id: string, field: 'rank' | 'kills', value: string) => {
        const numValue = value === "" ? "" : Number(value);
        setScores(prev => prev.map(s => s.id === id ? { ...s, [field]: numValue } : s));
    };

    const handlePublish = async () => {
        if (!selectedTournament || !selectedMatchId) {
            toast({
                title: "Validation Error",
                description: "Please select a Tournament and Match first.",
                variant: "destructive"
            });
            return;
        }

        // 2. Prepare Data
        // Use the teams currently in state, which are already fetched from the DB
        const upsertData = scores.map(s => ({
            match_id: selectedMatchId,
            team_id: s.id, // This is the real UUID
            rank: Number(s.rank) || 0,
            kills: Number(s.kills) || 0,
            total_points: s.total
        }));

        const { error } = await supabase.from('scores').upsert(upsertData, { onConflict: 'match_id,team_id' });

        if (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to publish scores.", variant: "destructive" });
            return;
        }

        toast({
            title: "Scores Published",
            description: `Results have been updated in the database.`,
        });
    };

    const handleReset = async () => {
        if (!selectedMatchId || !confirm("Are you sure? This will WIPE all scores for this match from the database.")) return;

        const { error } = await supabase
            .from('scores')
            .delete()
            .eq('match_id', selectedMatchId);

        if (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to reset scores.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Match scores cleared." });
            setScores(prev => prev.map(p => ({ ...p, rank: "", kills: "", total: 0 })));
        }
    };

    return (
        <Card className="glass-panel border-white/10">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="font-syne text-xl">Match Score Entry</CardTitle>
                    <div className="flex flex-col md:flex-row gap-3">
                        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                            <SelectTrigger className="w-[240px] bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select Tournament" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-neutral-950 text-popover-foreground">
                                {tournaments.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select Match" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-neutral-950 text-popover-foreground">
                                {availableMatches.map((m, i) => (
                                    <SelectItem key={m.id || i} value={m.id || `temp-${i}`}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Match Status Selector */}
                        {selectedMatchId && (
                            <Select
                                value={matchStatus}
                                onValueChange={(val) => handleStatusUpdate(val)}
                            >
                                <SelectTrigger className={`w-[140px] border-white/10 text-white font-bold ${matchStatus === 'live' ? 'bg-red-500/20 text-red-500 border-red-500/50' :
                                    matchStatus === 'completed' ? 'bg-green-500/20 text-green-500 border-green-500/50' :
                                        'bg-white/5'
                                    }`}>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="border-white/10 bg-neutral-950 text-popover-foreground">
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="live">🔴 Live</SelectItem>
                                    <SelectItem value="completed">✅ Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        <Button
                            onClick={handlePublish}
                            className="bg-neon-green text-white hover:bg-neon-green/90 font-bold"
                        >
                            <Save className="mr-2 h-4 w-4" /> Publish
                        </Button>

                        <Button
                            onClick={handleReset}
                            variant="destructive"
                            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Reset
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10">
                    <div className="h-[500px] overflow-auto">
                        <Table>
                            <TableHeader className="bg-white/5 sticky top-0 z-10">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white">Team Name</TableHead>
                                    <TableHead className="text-white w-[120px] text-center">Rank #</TableHead>
                                    <TableHead className="text-white w-[120px] text-center">Kills</TableHead>
                                    <TableHead className="text-neon-yellow w-[120px] text-center font-bold">Total Pts</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scores.map((team) => (
                                    <TableRow key={team.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">{team.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="h-9 bg-black/50 border-white/10 text-center text-white focus:border-neon-blue"
                                                value={team.rank}
                                                onChange={(e) => handleScoreChange(team.id, 'rank', e.target.value)}
                                                placeholder="-"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="h-9 bg-black/50 border-white/10 text-center text-white focus:border-neon-red"
                                                value={team.kills}
                                                onChange={(e) => handleScoreChange(team.id, 'kills', e.target.value)}
                                                placeholder="-"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center justify-center h-8 w-12 rounded bg-neon-yellow/10 text-neon-yellow font-bold text-lg">
                                                {team.total}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
