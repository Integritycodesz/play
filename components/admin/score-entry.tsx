"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Standard Point System
const PLACEMENT_POINTS: Record<number, number> = {
    1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1
};

interface TeamScore {
    id: number;
    name: string;
    rank: number | "";
    kills: number | "";
    total: number;
}

export function ScoreEntry() {
    const { toast } = useToast();
    const [selectedTournament, setSelectedTournament] = useState<string>("");
    const [selectedMatch, setSelectedMatch] = useState<string>("");
    const [availableMatches, setAvailableMatches] = useState<{ id: string, name: string }[]>([]);
    const [tournaments, setTournaments] = useState<{ id: string, title: string, matches?: { name: string, map: string }[] }[]>([
        { id: "1", title: "Winter Championship 2025" },
        { id: "2", title: "Friday Night Scrims" },
        { id: "3", title: "Sniper Only Bash" }
    ]);

    // Mock initial teams - in real app, fetch based on selectedTournament
    const [scores, setScores] = useState<TeamScore[]>(
        Array.from({ length: 16 }).map((_, i) => ({
            id: i,
            name: `Team ${String.fromCharCode(65 + i)}`,
            rank: "",
            kills: "",
            total: 0
        }))
    );

    useEffect(() => {
        const saved = localStorage.getItem("custom_tournaments");
        if (saved) {
            const custom = JSON.parse(saved);
            setTournaments(prev => [...prev, ...custom]);
        }
    }, []);

    // Update available matches when tournament changes
    useEffect(() => {
        const tournament = tournaments.find(t => t.id === selectedTournament);
        if (tournament && tournament.matches && tournament.matches.length > 0) {
            setAvailableMatches(tournament.matches.map((m, i) => ({
                id: `m-${i}`,
                name: `${m.name} (${m.map})`
            })));
            setSelectedMatch(""); // Reset selected match
        } else {
            // Default matches if none defined
            setAvailableMatches([
                { id: "m1", name: "Match 1 (Erangel)" },
                { id: "m2", name: "Match 2 (Miramar)" },
                { id: "m3", name: "Match 3 (Sanhok)" }
            ]);
        }
    }, [selectedTournament, tournaments]);

    // Auto-calculate scores whenever rank or kills change
    useEffect(() => {
        setScores(prevScores => prevScores.map(team => {
            const rank = Number(team.rank) || 0;
            const kills = Number(team.kills) || 0;
            const placePts = PLACEMENT_POINTS[rank] || 0;
            return { ...team, total: placePts + kills };
        }));
    }, [scores.map(s => `${s.rank}-${s.kills}`).join(',')]);

    const handleScoreChange = (id: number, field: 'rank' | 'kills', value: string) => {
        const numValue = value === "" ? "" : Number(value);
        setScores(prev => prev.map(s => s.id === id ? { ...s, [field]: numValue } : s));
    };

    const handlePublish = () => {
        if (!selectedTournament || !selectedMatch) {
            toast({
                title: "Validation Error",
                description: "Please select a Tournament and Match first.",
                variant: "destructive"
            });
            return;
        }

        // Save to Local Storage for Leaderboard Page
        localStorage.setItem("leaderboard_data", JSON.stringify(scores));

        // Also save a timestamp for "Last Updated"
        localStorage.setItem("leaderboard_updated", new Date().toISOString());

        console.log("Submitting Scores for", selectedTournament, selectedMatch, scores);
        toast({
            title: "Scores Published",
            description: `Results for ${selectedMatch} have been updated live on the Leaderboard.`,
        });
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to completely wipe the leaderboard? This cannot be undone.")) {
            localStorage.removeItem("leaderboard_data");
            localStorage.removeItem("leaderboard_updated");

            toast({
                title: "Leaderboard Reset",
                description: "All ranking data has been wiped. The public page now shows 'Coming Soon'."
            });
        }
    }

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

                        <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select Match" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-neutral-950 text-popover-foreground">
                                {availableMatches.map(m => (
                                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

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
