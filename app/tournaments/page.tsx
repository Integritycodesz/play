"use client";

import { useState, useEffect } from "react";
import { TournamentFilters } from "@/components/tournaments/filters";
import { TournamentCard } from "@/components/tournaments/tournament-card";
import { Tournament } from "@/types";
import { supabase } from "@/lib/supabaseClient";

export default function TournamentsPage() {
    const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            const { data, error } = await supabase
                .from('tournaments')
                .select('*')
                .order('start_date', { ascending: true });

            if (data) {
                setAllTournaments(data as Tournament[]);
            } else {
                console.error("Error fetching tournaments:", error);
            }
            setLoading(false);
        };

        fetchTournaments();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white bg-black">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-neon-yellow border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="font-syne text-xl">Loading Battlegrounds...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="font-syne text-4xl font-bold text-white">Tournaments</h1>
                <p className="text-gray-400">Join the battle and prove your worth.</p>
            </div>

            <TournamentFilters />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allTournaments.length > 0 ? (
                    allTournaments.map((t) => (
                        <TournamentCard key={t.id} tournament={t} />
                    ))
                ) : (
                    <div className="col-span-3 text-center py-20 text-gray-500">
                        No tournaments found. Run the setup script to create one!
                    </div>
                )}
            </div>
        </div>
    );
}
