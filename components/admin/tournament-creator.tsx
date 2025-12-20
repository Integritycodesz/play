"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, Users, Calendar, Trash2, Map, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tournament } from "@/types";
import { supabase } from "@/lib/supabaseClient";

export function TournamentCreator() {
    const { toast } = useToast();

    // State
    const [title, setTitle] = useState("");
    const [format, setFormat] = useState("squad");
    const [prizePool, setPrizePool] = useState("");
    const [maxSlots, setMaxSlots] = useState("");
    const [startDate, setStartDate] = useState("");
    const [description, setDescription] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");

    // Management State
    const [existingTournaments, setExistingTournaments] = useState<any[]>([]);

    // Match Schedule State
    const [matches, setMatches] = useState<{ name: string; map: string; stage: string }[]>([]);
    const [matchName, setMatchName] = useState("");
    const [matchMap, setMatchMap] = useState("Erangel");
    const [matchStage, setMatchStage] = useState("Group Stage");

    const fetchTournaments = async () => {
        const { data } = await supabase
            .from('tournaments')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setExistingTournaments(data);
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const addMatch = () => {
        if (!matchName) return;
        setMatches([...matches, { name: matchName, map: matchMap, stage: matchStage }]);
        setMatchName("");
    };

    const removeMatch = (index: number) => {
        setMatches(matches.filter((_, i) => i !== index));
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This will remove all matches and teams associated with it.`)) return;

        const { error } = await supabase.from('tournaments').delete().eq('id', id);

        if (error) {
            toast({ title: "Error", description: "Failed to delete tournament.", variant: "destructive" });
        } else {
            toast({ title: "Deleted", description: "Tournament deleted successfully.", variant: "default" });
            setExistingTournaments(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleLaunch = async () => {
        // Validation
        if (!title || !startDate || !prizePool || !maxSlots) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields (Title, Pool, Slots, Date).",
                variant: "destructive"
            });
            return;
        }

        const payload = {
            title,
            description: description || "No description provided.",
            banner_url: bannerUrl || "/tournament_scrims.png",
            start_date: startDate,
            status: "open",
            prize_pool: parseInt(prizePool) || 0,
            max_slots: parseInt(maxSlots) || 0,
            registered_teams: 0,
            format: format as "solo" | "duo" | "squad",
            rules: ["Standard PMPL Rules"],
        };
        console.log("Creating Tournament with payload:", payload);

        const { data: tournamentData, error: tError } = await supabase
            .from('tournaments')
            .insert(payload)
            .select()
            .single();

        if (tError || !tournamentData) {
            console.error(tError);
            toast({
                title: "Error",
                description: `Failed to create tournament: ${tError?.message || "Unknown Error"}`,
                variant: "destructive"
            });
            return;
        }

        // Create Matches linked to Tournament
        if (matches.length > 0) {
            const matchesToInsert = matches.map(m => ({
                tournament_id: tournamentData.id,
                name: m.name,
                map: m.map,
                stage: m.stage,
                status: 'scheduled'
            }));

            const { error: mError } = await supabase.from('matches').insert(matchesToInsert);
            if (mError) {
                console.error(mError);
                toast({ title: "Warning", description: "Tournament created but matches failed to save.", variant: "warning" });
            }
        }

        // Feedback
        toast({
            title: "Success",
            description: "Tournament Launched!",
            className: "bg-neon-green text-black border-none"
        });

        // Reset
        setTitle("");
        setPrizePool("");
        setMaxSlots("");
        setStartDate("");
        setMatches([]);
        fetchTournaments(); // Refresh list
    };

    return (
        <div className="space-y-8">
            <Card className="glass-panel border-white/10">
                <CardHeader>
                    <CardTitle className="font-syne text-xl text-white">New Tournament Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Tournament Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Winter Championship 2025"
                                className="bg-black/50 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Format</Label>
                            <Select value={format} onValueChange={setFormat}>
                                <SelectTrigger className="bg-black/50 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="solo">Solo</SelectItem>
                                    <SelectItem value="duo">Duo</SelectItem>
                                    <SelectItem value="squad">Squad (4v4)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Prize Pool ($)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-neon-green" />
                                <Input
                                    value={prizePool}
                                    onChange={(e) => setPrizePool(e.target.value)}
                                    type="number"
                                    className="pl-9 bg-black/50 border-white/10"
                                    placeholder="5000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Max Slots</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 h-4 w-4 text-neon-blue" />
                                <Input
                                    value={maxSlots}
                                    onChange={(e) => setMaxSlots(e.target.value)}
                                    type="number"
                                    className="pl-9 bg-black/50 border-white/10"
                                    placeholder="64"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <div className="relative">
                                <Input
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    type="datetime-local"
                                    className="bg-black/50 border-white/10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Match Schedule</Label>
                        <div className="flex gap-2">
                            <Select value={matchStage} onValueChange={setMatchStage}>
                                <SelectTrigger className="w-[140px] bg-black/50 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Group Stage">Group Stage</SelectItem>
                                    <SelectItem value="Quarter Finals">Quarter Finals</SelectItem>
                                    <SelectItem value="Semi Finals">Semi Finals</SelectItem>
                                    <SelectItem value="Grand Finals">Grand Finals</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                value={matchName}
                                onChange={(e) => setMatchName(e.target.value)}
                                placeholder="Match Name (e.g. Group A - Match 1)"
                                className="bg-black/50 border-white/10"
                            />
                            <Select value={matchMap} onValueChange={setMatchMap}>
                                <SelectTrigger className="w-[140px] bg-black/50 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Erangel">Erangel</SelectItem>
                                    <SelectItem value="Miramar">Miramar</SelectItem>
                                    <SelectItem value="Sanhok">Sanhok</SelectItem>
                                    <SelectItem value="Vikendi">Vikendi</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={addMatch} size="icon" className="bg-neon-blue hover:bg-neon-blue/80">
                                <Plus className="h-4 w-4 text-black" />
                            </Button>
                        </div>

                        {matches.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {matches.map((match, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3">
                                            <Map className="h-4 w-4 text-gray-400" />
                                            <span className="text-neon-yellow font-bold text-xs uppercase tracking-wider">{match.stage}</span>
                                            <span>{match.name}</span>
                                            <span className="text-xs px-2 py-1 rounded bg-black/50 text-gray-300">{match.map}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => removeMatch(index)} className="text-red-500 hover:text-red-400">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {matches.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No matches added yet.</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Banner Image URL (Optional)</Label>
                        <Input
                            value={bannerUrl}
                            onChange={(e) => setBannerUrl(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="bg-black/50 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tournament details, rules, etc."
                            className="bg-black/50 border-white/10 min-h-[100px]"
                        />
                    </div>

                    <Button onClick={handleLaunch} className="w-full bg-neon-yellow text-black font-bold hover:bg-neon-yellow/80">
                        <Plus className="mr-2 h-4 w-4" /> Launch Tournament
                    </Button>
                </CardContent>
            </Card>

            <Card className="glass-panel border-white/10">
                <CardHeader>
                    <CardTitle className="font-syne text-xl text-white flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        Manage Tournaments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {existingTournaments.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                <div>
                                    <h4 className="font-bold text-white">{t.title}</h4>
                                    <p className="text-sm text-gray-400">
                                        Format: {t.format} • Slots: {t.registered_teams}/{t.max_slots} • Prize: ${t.prize_pool}
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(t.id, t.title)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                            </div>
                        ))}
                        {existingTournaments.length === 0 && (
                            <p className="text-gray-500">No active tournaments found.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
