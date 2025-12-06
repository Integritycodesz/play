"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Save } from "lucide-react";

export function ScoreEntry() {
    // Mock Match Data
    const teams = Array.from({ length: 16 }).map((_, i) => ({ id: i, name: `Team ${String.fromCharCode(65 + i)}`, kills: 0, rank: 0 }));

    return (
        <Card className="glass-panel border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-syne text-xl">Match 1 - Score Entry</CardTitle>
                <Button className="bg-neon-green text-black hover:bg-neon-green/90 font-bold">
                    <Save className="mr-2 h-4 w-4" /> Publish Results
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10">
                    <div className="h-[400px] overflow-auto">
                        <Table>
                            <TableHeader className="bg-white/5 sticky top-0">
                                <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white">Team Name</TableHead>
                                    <TableHead className="text-white w-[100px]">Rank #</TableHead>
                                    <TableHead className="text-white w-[100px]">Kills</TableHead>
                                    <TableHead className="text-white w-[100px]">Total Pts</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teams.map((team) => (
                                    <TableRow key={team.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">{team.name}</TableCell>
                                        <TableCell>
                                            <Input type="number" className="h-8 bg-black/50 border-white/10 text-center" defaultValue={team.rank || ""} />
                                        </TableCell>
                                        <TableCell>
                                            <Input type="number" className="h-8 bg-black/50 border-white/10 text-center" defaultValue={team.kills} />
                                        </TableCell>
                                        <TableCell className="font-bold text-neon-yellow">0</TableCell>
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
