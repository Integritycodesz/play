"use client";


import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight, User, Hash } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import Image from "next/image";

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

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (newsItems.length === 0) {
        return (
            <div className="min-h-screen pt-40 pb-20 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="font-syne text-5xl font-bold text-white mb-4">Latest <span className="text-neon-blue">Intel</span></h1>
                    <p className="text-gray-400">Loading updates...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16 text-center"
            >
                <div className="inline-block mb-4 px-4 py-1 rounded-full border border-neon-blue/20 bg-neon-blue/5 backdrop-blur-sm">
                    <span className="text-neon-blue text-sm font-medium tracking-wider uppercase">Esports News & Updates</span>
                </div>
                <h1 className="font-syne text-6xl md:text-7xl font-bold text-white mb-6 uppercase tracking-tight">
                    Battle <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-violet">Intel</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    Stay ahead of the competition with the latest tournament results, game updates, and exclusive community highlights.
                </p>
            </motion.div>

            {/* Featured Article */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-20 relative group"
            >
                <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue to-neon-violet rounded-3xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500" />
                <Link href={`/news/${newsItems[0].id}`} className="block relative h-[600px] w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                    <motion.img
                        layoutId={`news-image-${newsItems[0].id}`}
                        src={newsItems[0].image}
                        alt={newsItems[0].title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 z-20 p-8 md:p-16 w-full max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Badge className="mb-6 bg-neon-yellow text-black hover:bg-neon-yellow font-bold text-sm uppercase tracking-widest px-4 py-1.5 rounded-full border-none">
                                {newsItems[0].category}
                            </Badge>
                            <h2 className="font-syne text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1] group-hover:text-neon-blue transition-colors duration-300">
                                {newsItems[0].title}
                            </h2>
                            <p className="text-gray-200 text-lg md:text-xl max-w-3xl mb-8 line-clamp-2 md:line-clamp-none opacity-90">
                                {newsItems[0].excerpt}
                            </p>
                            <div className="flex items-center gap-8 text-sm font-medium text-gray-300">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md">
                                        <User className="h-4 w-4 text-neon-blue" />
                                    </div>
                                    <span>{newsItems[0].author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md">
                                        <Calendar className="h-4 w-4 text-neon-blue" />
                                    </div>
                                    <span>{newsItems[0].date}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </Link>
            </motion.div>

            {/* Recent News Grid */}
            <div className="relative">
                <div className="flex items-center gap-4 mb-10">
                    <Hash className="text-neon-violet h-8 w-8" />
                    <h3 className="font-syne text-3xl font-bold text-white">Latest Transmissions</h3>
                    <div className="h-px bg-white/10 flex-1 ml-4" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {newsItems.slice(1).map((item) => (
                        <motion.div key={item.id} variants={itemVariants}>
                            <Link href={`/news/${item.id}`} className="group h-full block">
                                <Card className="glass-panel border-white/5 bg-white/5 h-full overflow-hidden hover:bg-white/10 transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-neon-blue/5 rounded-2xl">
                                    <div className="aspect-[16/9] w-full overflow-hidden relative">
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 z-20">
                                            <Badge className="bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 px-3 py-1 text-xs uppercase tracking-wider font-bold">
                                                {item.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col h-[calc(100%-aspect-[16/9])]">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-mono">
                                            <span className="text-neon-blue">{item.date}</span>
                                            <span>{"//"}</span>
                                            <span>{item.author}</span>
                                        </div>
                                        <h4 className="font-syne text-xl font-bold text-white mb-3 group-hover:text-neon-violet transition-colors line-clamp-2 leading-tight">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1 leading-relaxed">
                                            {item.excerpt}
                                        </p>
                                        <div className="flex items-center text-neon-blue text-sm font-bold group-hover:translate-x-2 transition-transform duration-300">
                                            READ FULL BRIEFING <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
