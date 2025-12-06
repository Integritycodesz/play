import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy } from "lucide-react";
import { TournamentOverview } from "@/components/tournaments/detail/overview";
import { TournamentBracket } from "@/components/tournaments/detail/bracket";
import { TournamentTeams } from "@/components/tournaments/detail/teams";
import { Tournament } from "@/types";

// Mock Data Fetcher (Server Side)
async function getTournament(id: string): Promise<Tournament> {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
        id,
        title: "Winter Championship 2025",
        description: "The biggest event of the season.",
        banner_url: "/placeholder.jpg",
        start_date: "2025-12-15",
        status: "open",
        prize_pool: 10000,
        max_slots: 100,
        registered_teams: 64,
        format: "squad",
        rules: ["T1 Rules"],
    };
}

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tournament = await getTournament(id);

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Header */}
            <div className="relative h-[40vh] w-full overflow-hidden bg-black">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                <div className="mesh-gradient-primary absolute inset-0 opacity-30" />
                <div className="container relative z-20 mx-auto flex h-full flex-col justify-end px-4 pb-10">
                    <Badge className="mb-4 w-fit bg-neon-yellow text-black hover:bg-neon-yellow/90">
                        {tournament.status.toUpperCase()}
                    </Badge>
                    <h1 className="font-syne text-4xl font-bold uppercase md:text-6xl text-white">{tournament.title}</h1>

                    <div className="mt-6 flex flex-wrap gap-6 text-sm font-medium text-gray-300">
                        <div className="flex items-center gap-2">
                            <Trophy className="text-neon-yellow h-5 w-5" />
                            <span>${tournament.prize_pool.toLocaleString()} Prize</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="text-neon-blue h-5 w-5" />
                            <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="text-neon-green h-5 w-5" />
                            <span>{tournament.registered_teams}/{tournament.max_slots} Teams</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-8 px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content */}
                    <div className="flex-1">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="bg-white/5 border border-white/10 w-full justify-start h-auto p-1 mb-8">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black font-syne text-lg py-2 px-6">Overview</TabsTrigger>
                                <TabsTrigger value="bracket" className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black font-syne text-lg py-2 px-6">Bracket</TabsTrigger>
                                <TabsTrigger value="teams" className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black font-syne text-lg py-2 px-6">Teams</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-0">
                                <TournamentOverview tournament={tournament} />
                            </TabsContent>

                            <TabsContent value="bracket" className="mt-0">
                                <TournamentBracket />
                            </TabsContent>

                            <TabsContent value="teams" className="mt-0">
                                <TournamentTeams />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar CTA */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="glass-panel p-6 rounded-xl sticky top-24">
                            <h3 className="font-syne text-xl font-bold text-white mb-2">Registration Open</h3>
                            <p className="text-sm text-gray-400 mb-6">Slots are filling up fast. Register your team now.</p>
                            <Button className="w-full bg-neon-yellow text-black font-bold h-12 text-lg hover:bg-neon-yellow/90 shadow-[0_0_20px_rgba(242,169,0,0.3)]">
                                Register Team
                            </Button>
                            <p className="mt-4 text-center text-xs text-gray-500">
                                Registration closes in 2 days.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
