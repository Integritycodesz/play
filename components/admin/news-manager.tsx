"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export function NewsManager() {
    return (
        <div className="space-y-6">
            <Card className="glass-panel border-white/10">
                <CardHeader>
                    <CardTitle className="font-syne text-xl text-white">Post New Update</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-gray-400">Headline</Label>
                            <Input id="title" placeholder="e.g. Season 6 Patch Notes" className="bg-white/5 border-white/10 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-gray-400">Category</Label>
                            <Select>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="update">Game Update</SelectItem>
                                    <SelectItem value="esports">Esports</SelectItem>
                                    <SelectItem value="community">Community</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-gray-400">Banner Image URL</Label>
                        <div className="flex gap-2">
                            <Input id="image" placeholder="https://..." className="bg-white/5 border-white/10 text-white" />
                            <Button variant="outline" className="border-white/10 px-3"><ImageIcon className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt" className="text-gray-400">Content / Excerpt</Label>
                        <Textarea id="excerpt" placeholder="Brief summary of the news..." className="bg-white/5 border-white/10 text-white min-h-[100px]" />
                    </div>

                    <Button className="w-full bg-neon-blue text-black font-bold hover:bg-neon-blue/90">
                        <Plus className="mr-2 h-4 w-4" /> Publish Article
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-syne text-lg font-bold text-white">Recent Articles</h3>
                {/* Mock List of Managed Articles */}
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 hover:bg-white/10">
                        <div>
                            <p className="font-bold text-white">Season 6 Patch Notes</p>
                            <p className="text-xs text-gray-500">Posted on Dec 05, 2025 • Update</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
