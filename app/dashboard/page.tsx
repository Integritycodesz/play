"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Settings } from "lucide-react";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { NotificationsPopover } from "@/components/dashboard/notifications-popover";
import { Tournament } from "@/types";

// Mock Data
const myTournaments: Tournament[] = [
    {
        id: "2",
        title: "Friday Night Scrims",
        description: "Weekly practice for pros.",
        banner_url: "/tournament_scrims.png",
        start_date: "2025-12-08",
        status: "upcoming",
        prize_pool: 500,
        max_slots: 20,
        registered_teams: 5,
        format: "duo",
        rules: ["Standard"],
    },
];

export default function DashboardPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="font-syne text-4xl font-bold text-white">Dashboard</h1>
                    <p className="text-gray-400">Welcome back, Soldier.</p>
                </div>
                <div className="flex items-center gap-2">
                    <NotificationsPopover />
                    <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 gap-2">
                        <Settings className="h-4 w-4" /> Settings
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="tournaments" className="w-full">
                <TabsList className="bg-white/5 border border-white/10 mb-8">
                    <TabsTrigger value="tournaments" className="gap-2"><Trophy className="h-4 w-4" /> My Tournaments</TabsTrigger>
                    <TabsTrigger value="team" className="gap-2"><Users className="h-4 w-4" /> My Team</TabsTrigger>
                </TabsList>

                <TabsContent value="tournaments">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {myTournaments.map((t) => (
                            <TournamentCard key={t.id} tournament={t} />
                        ))}
                    </div>
                    {myTournaments.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <p>You haven&apos;t joined any tournaments yet.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="team">
                    <Card className="glass-panel">
                        <CardHeader>
                            <CardTitle>Team Roster: Team Soul</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-neon-yellow/20 flex items-center justify-center text-neon-yellow font-bold">M</div>
                                        <div>
                                            <p className="font-bold text-white">Mortal (Captain)</p>
                                            <p className="text-xs text-gray-500">ID: 12345678</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="border-white/10">Manage</Button>
                                </div>
                                {/* More players... */}
                            </div>
                            <Button className="mt-6 w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 border-dashed">
                                + Invite Player
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
