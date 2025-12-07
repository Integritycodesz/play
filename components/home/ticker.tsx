"use client";

import { Trophy } from "lucide-react";

export function Ticker() {
    const items = [
        "💀 Pochinki is my city",
        "🛑 revive me bro I have raygun (jk)",
        "🍳 Pan > AWM",
        "🏃‍♂️ Zone shrinking in 3... 2... 1...",
        "📦 I need 5.56 ammo pls",
        "🎮 One more game then sleep (lies)",
        "🍗 Winner Winner Chicken Dinner",
    ];

    return (
        <div className="border-y border-white/5 bg-black/50 backdrop-blur-sm">
            <div className="relative flex overflow-x-hidden py-3">
                <div className="animate-marquee whitespace-nowrap py-1">
                    {items.concat(items).map((item, i) => (
                        <span key={i} className="mx-8 inline-flex items-center text-sm font-medium text-white/70">
                            <Trophy className="mr-2 h-4 w-4 text-neon-yellow" />
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
