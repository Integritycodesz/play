"use client";

import { useState, useEffect } from "react";
import { TournamentFilters } from "@/components/tournaments/filters";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { Tournament } from "@/types";

// Mock Data
const tournaments: Tournament[] = [
    {
        id: "1",
        title: "Winter Championship 2025",
        description: "The biggest event of the season.",
        banner_url: "/tournament_winter.png",
        start_date: "2025-12-15",
        status: "open",
        prize_pool: 10000,
        max_slots: 100,
        registered_teams: 64,
        format: "squad",
        rules: ["T1 Rules"],
    },
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
    {
        id: "3",
        title: "Sniper Only Bash",
        description: "Headshots only.",
        banner_url: "/tournament_sniper.png",
        start_date: "2025-12-10",
        status: "live",
        prize_pool: 200,
        max_slots: 50,
        registered_teams: 48,
        format: "solo",
        rules: ["Snipers Only"],
    },
];

export default function TournamentsPage() {
    const [allTournaments, setAllTournaments] = useState<Tournament[]>(tournaments);

    useEffect(() => {
        // Load custom tournaments from local storage
        const saved = localStorage.getItem("custom_tournaments");
        if (saved) {
            try {
                const custom: Tournament[] = JSON.parse(saved);
                // Combine mock data + custom data
                // We add custom first so they appear at top
                setAllTournaments([...custom, ...tournaments]);
            } catch (e) {
                console.error("Failed to parse custom tournaments", e);
            }
        }
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="font-syne text-4xl font-bold text-white">Tournaments</h1>
                <p className="text-gray-400">Join the battle and prove your worth.</p>
            </div>

            <TournamentFilters />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allTournaments.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                ))}
            </div>
        </div>
    );
}
