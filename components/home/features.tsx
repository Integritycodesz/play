import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export function Features() {
    return (
        <section className="container mx-auto px-4 py-24">
            <div className="mb-16 text-center">
                <h2 className="font-syne text-4xl font-bold text-white md:text-5xl">Why Choose PMPL.GG</h2>
                <p className="mt-4 text-gray-400">Built by pros, for pros. Experience the next level of competitive gaming.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2">
                {/* Large Item */}
                <Card className="glass-panel col-span-1 p-8 md:col-span-2 md:row-span-2 border-none relative overflow-hidden group">
                    {/* Checkered Overlay */}
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
                    <div className="flex h-full flex-col justify-between relative z-10">
                        <div className="rounded-2xl bg-black/40 p-3 w-fit border border-white/10">
                            <Trophy className="h-8 w-8 text-neon-violet" />
                        </div>
                        <div className="mt-8">
                            <h3 className="font-syne text-3xl font-bold text-white">Automated Scoring System</h3>
                            <p className="mt-2 text-gray-400 max-w-md">
                                Forget screenshots. Our API connects directly to game lobbies to fetch results, kill feeds, and placement points instantly.
                            </p>
                        </div>
                    </div>
                    {/* Image Decoration */}
                    <img
                        src="/feature-stats.png"
                        alt="Stats"
                        className="absolute -right-10 -bottom-10 w-64 h-64 object-contain opacity-50 group-hover:scale-110 group-hover:opacity-80 transition-all duration-500"
                    />
                </Card>

                {/* Small Items */}
                <FeatureCard
                    image="/feature-payouts.png"
                    title="Instant Payouts"
                    desc="Winnings transferred to your wallet within 24 hours."
                />
                <FeatureCard
                    image="/feature-anticheat.png"
                    title="Anti-Cheat Verified"
                    desc="Kernel-level integration ensuring fair play for everyone."
                />

                {/* Medium Items */}
                <FeatureCard
                    image="/feature-scrims.png"
                    title="Automated Scrims"
                    desc="Daily practice matches with tracked stats."
                />
                {/* Reusing Scrims image for generic team feature or just keep logic simple */}
                <FeatureCard
                    image="/feature-stats.png"
                    title="Advanced Analytics"
                    desc="Deep dive into your K/D, survival time, and heatmap."
                />
            </div>
        </section>
    );
}

function FeatureCard({ image, title, desc }: { image: string; title: string; desc: string }) {
    return (
        <Card className="glass-panel p-6 border-none hover:bg-white/5 transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <img src={image} alt={title} className="w-16 h-16 object-contain" />
            </div>
            <div className="mt-12">
                <h4 className="font-syne text-xl font-bold text-white">{title}</h4>
                <p className="mt-2 text-sm text-gray-400">{desc}</p>
            </div>
        </Card>
    );
}
