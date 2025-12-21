"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import Image from "next/image";

const newsSchema = z.object({
    title: z.string().min(5, "Headline must be at least 5 characters"),
    category: z.string().min(1, "Category is required"),
    excerpt: z.string().min(10, "Content must be at least 10 characters"),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export function NewsManager() {
    const { toast } = useToast();
    const [recentNews, setRecentNews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const form = useForm<NewsFormValues>({
        resolver: zodResolver(newsSchema),
        defaultValues: {
            title: "",
            category: "update",
            excerpt: "",
        },
    });

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                return;
            }
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('news-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('news-images').getPublicUrl(filePath);
            setImageUrl(data.publicUrl);
            toast({ title: "Image Uploaded", description: "Image uploaded successfully." });
        } catch (error) {
            toast({
                title: "Upload Failed",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: NewsFormValues) => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('news')
                .insert({
                    title: data.title,
                    category: data.category,
                    image: imageUrl || "/news-patch-v2.png", // fallback
                    excerpt: data.excerpt,
                    author: "Admin" // Could be dynamic based on session
                });

            if (error) throw error;

            toast({ title: "Success", description: "Article published successfully." });
            form.reset();
            setImageUrl("");
            fetchNews();
        } catch (error) {
            toast({ title: "Error", description: (error as Error).message || "Failed to post news.", variant: "destructive" });
        } finally {
            setIsLoading(false);
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
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-400">Headline</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g. Season 6 Patch Notes"
                                                    className="bg-white/5 border-white/10 text-white"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-400">Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                                    <SelectItem value="update">Game Update</SelectItem>
                                                    <SelectItem value="esports">Esports</SelectItem>
                                                    <SelectItem value="community">Community</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <FormLabel className="text-gray-400">Banner Image</FormLabel>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="bg-white/5 border-white/10 text-white file:text-white file:bg-white/10 file:rounded-md file:border-0 file:px-2 file:mr-4 hover:file:bg-white/20"
                                        />
                                    </div>
                                    {uploading && <Loader2 className="h-5 w-5 animate-spin text-neon-blue" />}
                                </div>
                                {imageUrl && (
                                    <div className="relative mt-2 w-full h-40 rounded-md overflow-hidden border border-white/10">
                                        <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 text-white"
                                            onClick={() => setImageUrl("")}
                                            type="button"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <FormField
                                control={form.control}
                                name="excerpt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-400">Content / Excerpt</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief summary of the news..."
                                                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isLoading || uploading} className="w-full bg-neon-blue text-black font-bold hover:bg-neon-blue/90">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Publish Article
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-syne text-lg font-bold text-white">Recent Articles</h3>
                {recentNews.map((i) => (
                    <div key={i.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 hover:bg-white/10">
                        <div className="flex items-center gap-4">
                            {i.image && (
                                <div className="h-12 w-12 rounded bg-gray-800 overflow-hidden relative">
                                    <Image src={i.image} alt={i.title} fill className="object-cover" />
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-white">{i.title}</p>
                                <p className="text-xs text-gray-500">
                                    Posted on {new Date(i.created_at).toLocaleDateString()} • {i.category}
                                </p>
                            </div>
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
