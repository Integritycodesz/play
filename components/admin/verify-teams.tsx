"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Swords } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface TournamentRequest {
    id: string;
    tournamentId: string;
    userId: string;
    ign: string;
    teamName: string;
    status: "pending" | "approved" | "rejected";
    requestedAt: string;
}

export function VerifyTeams() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<TournamentRequest[]>([]);
    const [search, setSearch] = useState("");

    const loadRequests = () => {
        const saved = localStorage.getItem("tournament_requests");
        if (saved) {
            setRequests(JSON.parse(saved).reverse());
        }
    };

    useEffect(() => {
        loadRequests();
        window.addEventListener('storage', loadRequests);
        return () => window.removeEventListener('storage', loadRequests);
    }, []);

    const updateStatus = (id: string, newStatus: "approved" | "rejected") => {
        const updated = requests.map(r =>
            r.id === id ? { ...r, status: newStatus } : r
        );
        setRequests(updated);
        localStorage.setItem("tournament_requests", JSON.stringify(updated.reverse()));
        setRequests(updated.reverse());

        // If approved, strictly speaking we should also add to 'tournament_participants_[id]'
        // BUT our JoinButton logic now looks at 'tournament_requests' directly, 
        // so upgrading the status there is sufficient for the UI to update.

        toast({
            title: newStatus === "approved" ? "Request Approved" : "Request Rejected",
            description: `Tournament entry has been ${newStatus}.`,
            className: newStatus === "approved" ? "bg-neon-green text-black border-none" : "bg-red-500 text-white border-none"
        });
    };

    const filtered = requests.filter(r =>
        r.ign.toLowerCase().includes(search.toLowerCase()) ||
        r.teamName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card className="glass-panel border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-syne text-xl flex items-center gap-2">
                        <Swords className="h-5 w-5 text-neon-yellow" />
                        Tournament Entries
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                        Verify pending tournament join requests.
                    </p>
                </div>
                <div className="w-64">
                    <Input
                        placeholder="Search requests..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-black/50 border-white/10 text-white"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-white">Team / IGN</TableHead>
                                <TableHead className="text-white">Tournament ID</TableHead>
                                <TableHead className="text-white text-center">Time</TableHead>
                                <TableHead className="text-white text-center">Status</TableHead>
                                <TableHead className="text-white text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((req) => (
                                <TableRow key={req.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">
                                        {req.teamName}
                                        <div className="text-xs text-gray-500">{req.ign}</div>
                                    </TableCell>
                                    <TableCell className="text-gray-300 font-mono text-xs">{req.tournamentId}</TableCell>
                                    <TableCell className="text-center text-gray-400 text-xs">
                                        {new Date(req.requestedAt).toLocaleTimeString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={`
                                            capitalize
                                            ${req.status === 'approved' ? 'bg-neon-green/20 text-neon-green' : ''}
                                            ${req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                                            ${req.status === 'rejected' ? 'bg-red-500/20 text-red-500' : ''}
                                        `}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-neon-green hover:bg-neon-green/10"
                                                    onClick={() => updateStatus(req.id, 'approved')}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                                                    onClick={() => updateStatus(req.id, 'rejected')}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                        {req.status !== 'pending' && (
                                            <span className="text-xs text-gray-500">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No pending requests.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
