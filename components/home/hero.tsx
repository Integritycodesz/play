"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function Hero() {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["Battlegrounds", "Leaderboard", "Competition", "Arena", "Tournaments"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
            {/* Background with Mesh Gradient */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 bg-[url('/hero-bg-v2.png')] bg-cover bg-center opacity-60" />
                <div className="mesh-gradient-primary absolute -left-[20%] -top-[20%] h-[150%] w-[150%] opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mx-auto max-w-4xl"
                >
                    <Link href="/tournaments">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-1.5 backdrop-blur-md hover:bg-black/70 transition-colors cursor-pointer">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green"></span>
                            </span>
                            <span className="text-sm font-medium text-white/80">Season 5 Registration Open</span>
                        </div>
                    </Link>

                    <h1 className="font-syne text-6xl font-bold uppercase leading-tight tracking-tight text-white md:text-8xl">
                        Dominate The <br />
                        <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                            <span className="invisible opacity-0">Battlegrounds</span>
                            {titles.map((title, index) => (
                                <motion.span
                                    key={index}
                                    className="absolute left-0 top-0 w-full font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-violet"
                                    initial={{ opacity: 0, y: "-100" }}
                                    transition={{ type: "spring", stiffness: 50 }}
                                    animate={
                                        titleNumber === index
                                            ? {
                                                y: 0,
                                                opacity: 1,
                                            }
                                            : {
                                                y: titleNumber > index ? -150 : 150,
                                                opacity: 0,
                                            }
                                    }
                                >
                                    {title}
                                </motion.span>
                            ))}
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 md:text-xl">
                        The elite platform for professional PUBG Mobile tournaments.
                        Compete for cash prizes, climb the global leaderboard, and forge your legacy.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="/tournaments">
                            <Button size="lg" className="h-14 rounded-full bg-neon-yellow px-8 text-black hover:bg-neon-yellow/90 font-bold text-lg">
                                Start Competing <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="https://www.youtube.com/watch?v=0yGydjJqK2A" target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="h-14 rounded-full border-white/20 px-8 text-white hover:bg-white/10 hover:text-white">
                                <PlayCircle className="mr-2 h-5 w-5" /> Watch Trailer
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
