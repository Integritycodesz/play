"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, Users, Calendar, Trash2, Map } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tournament } from "@/types";

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

    // Match Schedule State
    const [matches, setMatches] = useState<{ name: string; map: string }[]>([]);
    const [matchName, setMatchName] = useState("");
    const [matchMap, setMatchMap] = useState("Erangel");

    const addMatch = () => {
        if (!matchName) return;
        setMatches([...matches, { name: matchName, map: matchMap }]);
        setMatchName("");
    };

    const removeMatch = (index: number) => {
        setMatches(matches.filter((_, i) => i !== index));
    };

    const handleLaunch = () => {
        // Validation
        if (!title || !startDate || !prizePool || !maxSlots) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields (Title, Pool, Slots, Date).",
                variant: "destructive"
            });
            return;
        }

        // Create new object
        const newTournament: Tournament = {
            id: Date.now().toString(),
            title,
            description: description || "No description provided.",
            banner_url: bannerUrl || "/tournament_scrims.png", // Use input or fallback
            start_date: startDate,
            status: "open", // Default to open for registration
            prize_pool: parseInt(prizePool) || 0,
            max_slots: parseInt(maxSlots) || 0,
            registered_teams: 0,
            format: format as "solo" | "duo" | "squad",
            rules: ["Standard PMPL Rules"],
            matches: matches,
        };

        // Save to LocalStorage
        const existingData = localStorage.getItem("custom_tournaments");
        const tournaments = existingData ? JSON.parse(existingData) : [];
        tournaments.push(newTournament);
        localStorage.setItem("custom_tournaments", JSON.stringify(tournaments));

        // Feedback
        toast({
            title: "Tournament Launched!",
            description: `"${title}" has been created and is now visible.`,
            className: "bg-neon-green text-black border-none"
        });

        // Reset Form
        setTitle("");
        setPrizePool("");
        setMaxSlots("");
        setStartDate("");
        setDescription("");
        setBannerUrl("");

        // Redirect to tournaments page to see the result
        // We use a small timeout to let the toast be seen
        setTimeout(() => {
            window.location.href = "/tournaments";
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <Card className="glass-panel border-white/10">
                <CardHeader>
                    <CardTitle className="font-syne text-xl text-white">Create New Tournament</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="t-title" className="text-gray-400">Tournament Title</Label>
                            <Input
                                id="t-title"
                                placeholder="e.g. Winter Championship 2025"
                                className="bg-white/5 border-white/10 text-white"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="t-format" className="text-gray-400">Format</Label>
                            <Select value={format} onValueChange={setFormat}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select Format" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                    <SelectItem value="squad">Squad (4v4)</SelectItem>
                                    <SelectItem value="duo">Duo (2v2)</SelectItem>
                                    <SelectItem value="solo">Solo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="t-pool" className="text-gray-400">Prize Pool ($)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="t-pool"
                                    type="number"
                                    placeholder="10000"
                                    className="pl-9 bg-white/5 border-white/10 text-white"
                                    value={prizePool}
                                    onChange={(e) => setPrizePool(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="t-slots" className="text-gray-400">Max Slots</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="t-slots"
                                    type="number"
                                    placeholder="100"
                                    className="pl-9 bg-white/5 border-white/10 text-white"
                                    value={maxSlots}
                                    onChange={(e) => setMaxSlots(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="t-date" className="text-gray-400">Start Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    id="t-date"
                                    type="date"
                                    className="pl-9 bg-white/5 border-white/10 text-white block w-full"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-gray-400">Match Schedule</Label>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Match Name (e.g. QF 1)"
                                className="bg-white/5 border-white/10 text-white flex-1"
                                value={matchName}
                                onChange={(e) => setMatchName(e.target.value)}
                            />
                            <Select value={matchMap} onValueChange={setMatchMap}>
                                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                    <SelectItem value="Erangel">Erangel</SelectItem>
                                    <SelectItem value="Miramar">Miramar</SelectItem>
                                    <SelectItem value="Sanhok">Sanhok</SelectItem>
                                    <SelectItem value="Vikendi">Vikendi</SelectItem>
                                    <SelectItem value="Livik">Livik</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={addMatch} className="bg-neon-blue text-black hover:bg-neon-blue/80">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {matches.map((m, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <Map className="h-4 w-4 text-neon-yellow" />
                                        <span className="text-white font-medium">{m.name}</span>
                                        <span className="text-xs text-gray-400 uppercase tracking-wider border border-white/20 px-2 py-0.5 rounded">{m.map}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeMatch(i)} className="text-gray-500 hover:text-red-500 h-8 w-8 p-0">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {matches.length === 0 && (
                                <p className="text-xs text-gray-600 italic">No matches added yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="t-banner" className="text-gray-400">Banner Image URL (Optional)</Label>
                        <Input
                            id="t-banner"
                            placeholder="https://example.com/image.jpg"
                            className="bg-white/5 border-white/10 text-white"
                            value={bannerUrl}
                            onChange={(e) => setBannerUrl(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="t-desc" className="text-gray-400">Description</Label>
                        <Textarea
                            id="t-desc"
                            placeholder="Tournament rules, maps, and details..."
                            className="bg-white/5 border-white/10 text-white min-h-[100px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={handleLaunch}
                        className="w-full bg-[#f2a900] text-black font-bold hover:bg-[#d69500] h-12 text-lg"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Launch Tournament
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
