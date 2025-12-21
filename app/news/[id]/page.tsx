"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User, Share2, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ArticlePage() {
    const { id } = useParams();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching article:", error);
                // Optionally redirect to 404 or news home
            } else {
                setArticle(data);
            }
            setLoading(false);
        };

        fetchArticle();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#030303]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-syne">Decryption in progress...</p>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] text-center px-4">
                <h1 className="font-syne text-4xl font-bold text-white mb-4">Intel Not Found</h1>
                <p className="text-gray-400 mb-8">The requested transmission could not be located.</p>
                <Link href="/news">
                    <Button className="bg-neon-blue text-black hover:bg-neon-blue/80 font-bold">
                        Return to Base
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030303] pb-20">
            {/* Hero Section */}
            <div className="relative h-[60vh] w-full lg:h-[70vh]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/80 via-transparent to-[#030303]/80 z-10" />

                {article.image && (
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                )}

                <div className="absolute top-8 left-4 md:left-8 z-20">
                    <Link href="/news">
                        <Button variant="outline" className="border-white/10 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 hover:text-neon-blue">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Intel
                        </Button>
                    </Link>
                </div>

                <div className="absolute bottom-0 left-0 w-full z-20 container mx-auto px-4 pb-12 md:pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl"
                    >
                        <Badge className="mb-6 bg-neon-yellow text-black hover:bg-neon-yellow font-bold text-sm uppercase tracking-widest px-4 py-1.5 rounded-full border-none">
                            {article.category}
                        </Badge>
                        <h1 className="font-syne text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1]">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-300">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md">
                                    <User className="h-4 w-4 text-neon-blue" />
                                </div>
                                <span className="uppercase tracking-wider">{article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md">
                                    <Calendar className="h-4 w-4 text-neon-blue" />
                                </div>
                                <span>{new Date(article.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md">
                                    <Clock className="h-4 w-4 text-neon-blue" />
                                </div>
                                <span>5 min read</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 -mt-10 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-12"
                        >
                            <div className="prose prose-invert prose-lg max-w-none prose-headings:font-syne prose-headings:text-white prose-p:text-gray-300 prose-a:text-neon-blue prose-img:rounded-2xl">
                                {/* Currently using excerpt as content placeholder. In a real app, this would be a rich text field */}
                                <p className="lead text-xl md:text-2xl text-white font-medium mb-8 leading-relaxed">
                                    {article.excerpt}
                                </p>

                                <div className="space-y-6 text-gray-300">
                                    <p>
                                        [Additional content would populate here. Since we only have an excerpt field currently,
                                        we are displaying standard placeholder text to demonstrate the layout.]
                                    </p>
                                    <p>
                                        The competitive landscape is shifting. Teams are refining their strategies, and the
                                        meta is evolving faster than ever. Stay tuned for more updates as we approach the
                                        final stages of the tournament.
                                    </p>
                                    <h3>Tournament Implications</h3>
                                    <p>
                                        With these changes, we expect to see a shift in drop locations and engagement ranges.
                                        Squads that adapt quickly will secure their place on the leaderboard.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        {/* Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
                        >
                            <h3 className="font-syne text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Share2 className="h-5 w-5 text-neon-blue" />
                                Share Intel
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                                    Twitter
                                </Button>
                                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                                    Facebook
                                </Button>
                                <Button variant="outline" className="w-full col-span-2 border-white/10 hover:bg-white/5">
                                    Copy Link
                                </Button>
                            </div>
                        </motion.div>

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-neon-blue/10 to-neon-violet/10 border border-white/10">
                            <h3 className="font-syne text-xl font-bold text-white mb-2">Join the Action</h3>
                            <p className="text-sm text-gray-400 mb-4">Don&apos;t just read about it. Register for the upcoming tournament now.</p>
                            <Link href="/tournaments">
                                <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold">
                                    View Tournaments
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
