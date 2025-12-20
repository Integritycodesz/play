"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TeamScore {
    id: string;
    name: string;
    tournament_title?: string;
    rank: number;
    kills: number;
    total: number;
}

export default function LeaderboardPage() {
    const [teams, setTeams] = useState<TeamScore[]>([]);
    const [tournaments, setTournaments] = useState<string[]>([]);
    const [selectedTournament, setSelectedTournament] = useState<string>("all");
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('total_points', { ascending: false });

            if (data) {
                // Map DB columns to UI interface
                const mappedTeams: TeamScore[] = data.map((item: any, index: number) => ({
                    id: item.id,
                    name: item.team_name,
                    tournament_title: item.tournament_title,
                    rank: index + 1,
                    kills: item.kills,
                    total: item.total_points
                }));

                // Calculate total points per tournament to identify active ones
                const tournamentTotalPoints: Record<string, number> = {};
                mappedTeams.forEach(team => {
                    if (team.tournament_title) {
                        tournamentTotalPoints[team.tournament_title] = (tournamentTotalPoints[team.tournament_title] || 0) + team.total;
                    }
                });

                // valid tournaments are those with > 0 points
                const activeTournaments = Object.keys(tournamentTotalPoints).filter(title => tournamentTotalPoints[title] > 0);

                // Filter teams to only include those from active tournaments
                const activeTeams = mappedTeams.filter(team => team.tournament_title && activeTournaments.includes(team.tournament_title));

                setTeams(activeTeams);
                setTournaments(activeTournaments);

                setLastUpdated(new Date().toLocaleTimeString()); // Or use fetched time if available
            } else {
                console.error("Error fetching leaderboard:", error);
            }
            setLoading(false);
        };

        fetchLeaderboard();

        // Realtime Subscription
        const channel = supabase
            .channel('leaderboard_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'scores'
                },
                () => {
                    console.log('Scores updated, refreshing leaderboard...');
                    fetchLeaderboard();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'teams'
                },
                () => {
                    console.log('Teams updated, refreshing leaderboard...');
                    fetchLeaderboard();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="h-6 w-6 text-neon-yellow" />;
        if (index === 1) return <Medal className="h-6 w-6 text-gray-300" />;
        if (index === 2) return <Medal className="h-6 w-6 text-amber-600" />;
        return <span className="text-gray-500 font-bold">#{index + 1}</span>;
    };

    const filteredTeams = selectedTournament === "all"
        ? teams
        : teams.filter(t => t.tournament_title === selectedTournament);

    // Re-rank based on filtered view
    const displayTeams = filteredTeams.map((team, index) => ({
        ...team,
        rank: index + 1
    }));

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading Standings...</div>;
    }

    if (teams.length === 0) {
        return (
            <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-blue/20 blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-2xl">
                    <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                        <Hammer className="h-10 w-10 text-neon-blue animate-pulse" />
                    </div>

                    <h1 className="font-syne text-5xl font-bold uppercase text-white md:text-7xl">
                        Awaiting <span className="text-neon-blue">Data</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-lg text-lg text-gray-400">
                        The leaderboard is currently empty. Waiting for the first match results.
                    </p>

                    <div className="mt-10">
                        <Link href="/">
                            <Button variant="outline" className="h-12 border-white/20 px-8 text-white hover:bg-white/10 hover:text-white">
                                Return Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-10 text-center">
                <h1 className="font-syne text-4xl md:text-6xl font-bold text-white mb-4">
                    Global <span className="text-neon-yellow">Standings</span>
                </h1>
                <p className="text-gray-400">
                    Live updates from the database
                </p>
                {lastUpdated && (
                    <p className="text-xs text-neon-blue mt-2 animate-pulse">
                        Last Fetched: {lastUpdated}
                    </p>
                )}
            </div>

            <Card className="glass-panel border-white/10 max-w-4xl mx-auto">
                <CardHeader className="bg-white/5 border-b border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-neon-yellow" />
                            <CardTitle className="font-syne text-xl text-white">Top Performing Teams</CardTitle>
                        </div>

                        {/* Tournament Filter */}
                        <div className="w-full md:w-[250px]">
                            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                    <SelectValue placeholder="Filter by Tournament" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-950 border-white/10 text-gray-200">
                                    <SelectItem value="all">All Tournaments</SelectItem>
                                    {tournaments.map((title) => (
                                        <SelectItem key={title} value={title}>{title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="w-[100px] text-center text-gray-400 font-bold">Rank</TableHead>
                                    <TableHead className="text-gray-400 font-bold">Team</TableHead>
                                    <TableHead className="text-center text-gray-400 font-bold">Kills</TableHead>
                                    <TableHead className="text-center text-neon-yellow font-bold">Total Pts</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayTeams.length > 0 ? (
                                    displayTeams.map((team, index) => (
                                        <TableRow key={team.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                            <TableCell className="text-center font-medium">
                                                <div className="flex justify-center items-center">
                                                    {getRankIcon(index)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-syne text-lg text-white font-bold">
                                                {team.name}
                                                {team.tournament_title && (
                                                    <span className="block text-xs text-gray-400 font-normal mt-1">
                                                        {team.tournament_title}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center text-gray-300">
                                                {team.kills || 0}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-block px-3 py-1 rounded bg-neon-yellow/10 text-neon-yellow font-bold border border-neon-yellow/20">
                                                    {team.total}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                            No teams found for this selection.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
