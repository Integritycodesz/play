import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, ArrowRight, User } from "lucide-react";
import Link from "next/link";

const newsItems = [
    {
        id: 1,
        title: "Season 6 Patch Notes: New Weapons & Balance Changes",
        category: "Update",
        date: "Dec 05, 2025",
        author: "Dev Team",
        image: "/news-patch-v2.png",
        excerpt: "Everything you need to know about the upcoming season, including the new AMR sniper and vehicle physics overhaul."
    },
    {
        id: 2,
        title: "Winter Championship: Grand Finals Recap",
        category: "Esports",
        date: "Dec 04, 2025",
        author: "PMPL Staff",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        excerpt: "Team Soul takes the trophy in a nail-biting finish on Erangel."
    },
    {
        id: 3,
        title: "Community Spotlight: Top Plays of the Week",
        category: "Community",
        date: "Dec 02, 2025",
        author: "Community Mgr",
        image: "https://images.unsplash.com/photo-1593305841991-05c2e4395270?q=80&w=2070&auto=format&fit=crop",
        excerpt: "Check out these insane 1v4 clutches from our scrims."
    },
    {
        id: 4,
        title: "Server Maintenance Schedule",
        category: "System",
        date: "Dec 01, 2025",
        author: "SysAdmin",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
        excerpt: "Scheduled downtime for improved stability and tick rate upgrades."
    }
];

export default function NewsPage() {
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
