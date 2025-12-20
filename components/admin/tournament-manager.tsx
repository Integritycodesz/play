"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trash2, AlertTriangle, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { ScoringConfigDialog } from "./scoring-config-dialog";

interface Tournament {
    id: string;
    title: string;
    status: string;
    created_at: string;
    registered_teams: number;
    is_published: boolean;
    scoring_config?: any;
}

export function TournamentManager() {
    const { toast } = useToast();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isToggling, setIsToggling] = useState<string | null>(null);

    const fetchTournaments = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('tournaments')
            .select('id, title, status, created_at, registered_teams, is_published, scoring_config')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load tournaments.", variant: "destructive" });
        } else {
            setTournaments(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const togglePublish = async (id: string, currentStatus: boolean) => {
        setIsToggling(id);
        const { error } = await supabase
            .from('tournaments')
            .update({ is_published: !currentStatus })
            .eq('id', id);

        if (error) {
            toast({ title: "Update Failed", description: error.message, variant: "destructive" });
        } else {
            toast({
                title: !currentStatus ? "Leaderboard Published" : "Leaderboard Hidden",
                description: `Tournament is now ${!currentStatus ? 'visible' : 'hidden'} on the leaderboard.`
            });
            setTournaments(prev => prev.map(t => t.id === id ? { ...t, is_published: !currentStatus } : t));
        }
        setIsToggling(null);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?\nThis will permanently remove the tournament and ALL associated data (matches, teams, scores).`)) {
            return;
        }

        setIsDeleting(id);

        const { error } = await supabase
            .from('tournaments')
            .delete()
            .eq('id', id);

        if (error) {
            console.error(error);
            toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Tournament deleted successfully." });
            setTournaments(prev => prev.filter(t => t.id !== id));
        }
        setIsDeleting(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Card className="glass-panel border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-syne text-xl">Manage Tournaments</CardTitle>
                <Button variant="ghost" size="icon" onClick={fetchTournaments} className="hover:bg-white/5">
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-white">Tournament Title</TableHead>
                                <TableHead className="text-white">Status</TableHead>
                                <TableHead className="text-white">Leaderboard</TableHead>
                                <TableHead className="text-white">Teams</TableHead>
                                <TableHead className="text-white">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tournaments.length === 0 && !isLoading && (
                                <TableRow className="border-white/5">
                                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                        No tournaments found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {tournaments.map((tournament) => (
                                <TableRow key={tournament.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">
                                        {tournament.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`
                                            ${tournament.status === 'open' ? 'border-neon-green text-neon-green' : ''}
                                            ${tournament.status === 'ongoing' ? 'border-neon-yellow text-neon-yellow' : ''}
                                            ${tournament.status === 'completed' ? 'border-gray-500 text-gray-400' : ''}
                                        `}>
                                            {tournament.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={isToggling === tournament.id}
                                            onClick={() => togglePublish(tournament.id, tournament.is_published)}
                                            className={tournament.is_published ? "text-neon-green hover:text-neon-green/80" : "text-gray-500 hover:text-gray-400"}
                                        >
                                            {tournament.is_published ? (
                                                <><Eye className="h-4 w-4 mr-2" /> Live</>
                                            ) : (
                                                <><EyeOff className="h-4 w-4 mr-2" /> Hidden</>
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-gray-300">{tournament.registered_teams}</TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                        <ScoringConfigDialog
                                            tournamentId={tournament.id}
                                            currentConfig={tournament.scoring_config}
                                            onSave={fetchTournaments}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            disabled={isDeleting === tournament.id}
                                            onClick={() => handleDelete(tournament.id, tournament.title)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
