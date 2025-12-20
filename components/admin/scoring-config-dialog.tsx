"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Settings, Save } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ScoringRules {
    kill_points: number;
    placement_points: Record<string, number>; // using string keys for JSON compatibility
}

const PRESETS: Record<string, ScoringRules> = {
    "standard": {
        kill_points: 1,
        placement_points: { "1": 15, "2": 12, "3": 10, "4": 8, "5": 6, "6": 4, "7": 2, "8": 1 }
    },
    "aggressive": {
        kill_points: 2,
        placement_points: { "1": 10, "2": 6, "3": 5, "4": 4, "5": 3, "6": 2, "7": 1, "8": 0 }
    },
    "survival": {
        kill_points: 0.5,
        placement_points: { "1": 30, "2": 20, "3": 15, "4": 10, "5": 5 }
    }
};

export function ScoringConfigDialog({ tournamentId, currentConfig, onSave }: { tournamentId: string, currentConfig?: any, onSave: () => void }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<ScoringRules>(currentConfig || PRESETS["standard"]);
    const [preset, setPreset] = useState("standard");
    const [jsonError, setJsonError] = useState("");

    // Temporary string state for editing the JSON manually
    const [jsonInput, setJsonInput] = useState(JSON.stringify(currentConfig || PRESETS["standard"], null, 2));

    const handlePresetChange = (value: string) => {
        setPreset(value);
        const newConfig = PRESETS[value];
        setConfig(newConfig);
        setJsonInput(JSON.stringify(newConfig, null, 2));
    };

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonInput(e.target.value);
        try {
            const parsed = JSON.parse(e.target.value);
            setConfig(parsed);
            setJsonError("");
        } catch (err) {
            setJsonError("Invalid JSON format");
        }
    };

    const handleSave = async () => {
        if (jsonError) {
            toast({ title: "Invalid Config", description: "Please fix JSON errors before saving.", variant: "destructive" });
            return;
        }

        const { error } = await supabase
            .from('tournaments')
            .update({ scoring_config: config })
            .eq('id', tournamentId);

        if (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save scoring rules.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Scoring rules updated." });
            setIsOpen(false);
            onSave();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-neon-blue hover:text-neon-blue/80 hover:bg-neon-blue/10">
                    <Settings className="h-4 w-4 mr-2" /> Rules
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950 border-white/10 text-white sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="font-syne text-xl">Scoring Configuration</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Customize how points are calculated for this tournament.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Preset</Label>
                        <Select value={preset} onValueChange={handlePresetChange}>
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-950 border-white/10">
                                <SelectItem value="standard">Standard (Balanced)</SelectItem>
                                <SelectItem value="aggressive">Aggressive (High Kill Pts)</SelectItem>
                                <SelectItem value="survival">Survival (High Placement Pts)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Configuration (JSON)</Label>
                            {jsonError && <span className="text-xs text-red-500">{jsonError}</span>}
                        </div>
                        <Textarea
                            value={jsonInput}
                            onChange={handleJsonChange}
                            className={`font-mono text-xs h-[200px] bg-black/50 ${jsonError ? 'border-red-500' : 'border-white/10'}`}
                        />
                        <p className="text-[10px] text-gray-500">
                            Edit manually or use a preset. Keys in 'placement_points' represent the Rank #.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 hover:bg-white/5">Cancel</Button>
                    <Button onClick={handleSave} className="bg-neon-blue text-black font-bold hover:bg-neon-blue/90">
                        <Save className="h-4 w-4 mr-2" /> Save Rules
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
