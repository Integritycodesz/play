import { Card } from "@/components/ui/card";
import { Trophy, Users, Zap, Shield, Globe, Coins } from "lucide-react";

export function Features() {
    return (
        <section className="container mx-auto px-4 py-24">
            <div className="mb-16 text-center">
                <h2 className="font-syne text-4xl font-bold text-white md:text-5xl">Why Choose PMPL.GG</h2>
                <p className="mt-4 text-gray-400">Built by pros, for pros. Experience the next level of competitive gaming.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2">
                {/* Large Item */}
                <Card className="glass-panel col-span-1 p-8 md:col-span-2 md:row-span-2 border-none">
                    <div className="flex h-full flex-col justify-between">
                        <div className="rounded-full bg-neon-violet/20 p-3 w-fit">
                            <Trophy className="h-8 w-8 text-neon-violet" />
                        </div>
                        <div>
                            <h3 className="font-syne text-3xl font-bold text-white">Automated Scoring System</h3>
                            <p className="mt-2 text-gray-400">
                                Forget screenshots. Our API connects directly to game lobbies to fetch results, kill feeds, and placement points instantly.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Small Items */}
                <FeatureCard
                    icon={<Zap className="text-neon-yellow" />}
                    title="Instant Payouts"
                    desc="Winnings transferred to your wallet within 24 hours."
                />
                <FeatureCard
                    icon={<Shield className="text-neon-blue" />}
                    title="Anti-Cheat Verified"
                    desc="Kernel-level integration ensuring fair play for everyone."
                />

                {/* Medium Items */}
                <FeatureCard
                    icon={<Users className="text-neon-green" />}
                    title="Team Management"
                    desc="Manage rosters, roles, and invites easily."
                />
                <FeatureCard
                    icon={<Globe className="text-neon-red" />}
                    title="Global Region Locks"
                    desc="Play in your region with optimal ping."
                />
            </div>
        </section>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <Card className="glass-panel p-6 border-none hover:bg-white/5 transition-colors">
            <div className="mb-4 rounded-full bg-white/5 p-3 w-fit">
                {icon}
            </div>
            <h4 className="font-syne text-xl font-bold text-white">{title}</h4>
            <p className="mt-2 text-sm text-gray-400">{desc}</p>
        </Card>
    );
}
