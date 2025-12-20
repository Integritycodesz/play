"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function NewsPage() {
    const [newsItems, setNewsItems] = useState<any[]>([]);

    useEffect(() => {
        const loadNews = async () => {
            const { data } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                const formatted = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    category: item.category,
                    date: new Date(item.created_at).toLocaleDateString(),
                    author: item.author,
                    image: item.image,
                    excerpt: item.excerpt
                }));
                setNewsItems(formatted);
            }
        };
        loadNews();

        // Optional: Real-time subscription
        const channel = supabase
            .channel('public-news')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => {
                loadNews();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    if (newsItems.length === 0) {
        return (
            <div className="min-h-screen pt-40 pb-20 container mx-auto px-4 text-center">
                <h1 className="font-syne text-5xl font-bold text-white mb-4">Latest <span className="text-neon-blue">Intel</span></h1>
                <p className="text-gray-400">Loading updates...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-40 pb-20 container mx-auto px-4">
            <div className="mb-12">
                <h1 className="font-syne text-5xl font-bold text-white mb-4">Latest <span className="text-neon-blue">Intel</span></h1>
                <p className="text-gray-400 max-w-2xl text-lg">Stay updated with the latest tournament results, game updates, and community highlights.</p>
            </div>

            {/* Featured Article */}
            <div className="mb-16">
                <Link href={`/news/${newsItems[0].id}`} className="group block">
                    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                        <img
                            src={newsItems[0].image}
                            alt={newsItems[0].title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 z-20 p-8 md:p-12">
                            <Badge className="mb-4 bg-neon-yellow text-black hover:bg-neon-yellow font-bold uppercase tracking-wider">
                                {newsItems[0].category}
                            </Badge>
                            <h2 className="font-syne text-4xl md:text-6xl font-bold text-white mb-4 leading-tight max-w-4xl group-hover:text-neon-blue transition-colors">
                                {newsItems[0].title}
                            </h2>
                            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-6 line-clamp-2">
                                {newsItems[0].excerpt}
                            </p>
                            <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-neon-blue" />
                                    <span>{newsItems[0].author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-neon-blue" />
                                    <span>{newsItems[0].date}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent News Grid */}
            <h3 className="font-syne text-2xl font-bold text-white mb-8 border-l-4 border-neon-violet pl-4">Recent Updates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsItems.slice(1).map((item) => (
                    <Link href={`/news/${item.id}`} key={item.id} className="group">
                        <Card className="glass-panel border-none h-full overflow-hidden hover:bg-white/5 transition-colors">
                            <div className="aspect-video w-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <Badge className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md text-white border border-white/10 hover:bg-black/70">
                                    {item.category}
                                </Badge>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                    <span>{item.date}</span>
                                    <span>•</span>
                                    <span>{item.author}</span>
                                </div>
                                <h4 className="font-syne text-xl font-bold text-white mb-3 group-hover:text-neon-violet transition-colors line-clamp-2">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                    {item.excerpt}
                                </p>
                                <Button variant="link" className="p-0 h-auto text-neon-blue hover:text-white group-hover:translate-x-2 transition-transform">
                                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
