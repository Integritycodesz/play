"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

export function TournamentFilters() {
    return (
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                    placeholder="Search tournaments..."
                    className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-gray-500 focus-visible:ring-neon-blue"
                />
            </div>
            <div className="flex gap-2">
                <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                </Button>
                <Button className="bg-white text-black hover:bg-gray-200">
                    Create Tournament
                </Button>
            </div>
        </div>
    );
}
