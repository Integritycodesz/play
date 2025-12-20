"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";

export function NewsManager() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("update");
    const [image, setImage] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const { toast } = useToast();
    const [recentNews, setRecentNews] = useState<any[]>([]);

    const fetchNews = async () => {
        const { data } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setRecentNews(data);
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const handlePublish = async () => {
        if (!title || !excerpt) {
            toast({ title: "Validation Error", description: "Headline and content are required.", variant: "destructive" });
            return;
        }

        const { error } = await supabase
            .from('news')
            .insert({
                title,
                category,
                image: image || "/news-patch-v2.png", // fallback
                excerpt,
                author: "Admin" // Could be dynamic based on session
            });

        if (error) {
            toast({ title: "Error", description: "Failed to post news.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Article published successfully." });
            setTitle("");
            setExcerpt("");
            setImage("");
            fetchNews();
        }
    };

    const handleDelete = async (id: string) => {
        await supabase.from('news').delete().eq('id', id);
        fetchNews();
        toast({ title: "Deleted", description: "Article removed." });
    };

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
                            <Input
                                id="title"
                                placeholder="e.g. Season 6 Patch Notes"
                                className="bg-white/5 border-white/10 text-white"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-gray-400">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-900 border-white/10 text-white">
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
                            <Input
                                id="image"
                                placeholder="https://..."
                                className="bg-white/5 border-white/10 text-white"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                            <Button variant="outline" className="border-white/10 px-3"><ImageIcon className="h-4 w-4" /></Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt" className="text-gray-400">Content / Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            placeholder="Brief summary of the news..."
                            className="bg-white/5 border-white/10 text-white min-h-[100px]"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                        />
                    </div>

                    <Button onClick={handlePublish} className="w-full bg-neon-blue text-black font-bold hover:bg-neon-blue/90">
                        <Plus className="mr-2 h-4 w-4" /> Publish Article
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-syne text-lg font-bold text-white">Recent Articles</h3>
                {recentNews.map((i) => (
                    <div key={i.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 hover:bg-white/10">
                        <div>
                            <p className="font-bold text-white">{i.title}</p>
                            <p className="text-xs text-gray-500">
                                Posted on {new Date(i.created_at).toLocaleDateString()} • {i.category}
                            </p>
                        </div>
                        <Button onClick={() => handleDelete(i.id)} variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
