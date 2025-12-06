export function TournamentBracket() {
    return (
        <div className="glass-panel relative min-h-[500px] w-full overflow-x-auto p-8">
            {/* Mock Bracket Visual */}
            <div className="flex w-[800px] justify-between text-center">
                <BracketColumn stage="Quarter Finals" matches={[1, 2, 3, 4]} />
                <BracketColumn stage="Semi Finals" matches={[1, 2]} />
                <BracketColumn stage="Grand Finals" matches={[1]} />
            </div>

            <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                * Bracket view is simplified for demo
            </div>
        </div>
    );
}

function BracketColumn({ stage, matches }: { stage: string; matches: number[] }) {
    return (
        <div className="flex flex-col justify-around">
            <h4 className="mb-4 font-syne text-sm font-bold uppercase text-neon-blue">{stage}</h4>
            <div className="flex flex-1 flex-col justify-around gap-8">
                {matches.map((m) => (
                    <div key={m} className="relative w-48 rounded border border-white/10 bg-black/50 p-3">
                        <div className="mb-2 flex justify-between text-sm">
                            <span className="text-gray-400">Team A</span>
                            <span className="font-mono">0</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white font-bold">Team B</span>
                            <span className="font-mono text-neon-yellow">2</span>
                        </div>
                        {/* Visual connector lines would go here */}
                    </div>
                ))}
            </div>
        </div>
    );
}
