import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tournament } from "@/types";

export function TournamentOverview({ tournament }: { tournament: Tournament }) {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Rules */}
            <Card className="glass-panel md:col-span-2">
                <CardHeader>
                    <CardTitle className="font-syne text-xl">Rules & Format</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-gray-400">
                    <p>
                        <strong>Map Pool:</strong> Erangel, Miramar, Sanhok
                    </p>
                    <p>
                        <strong>Scoring:</strong> Official 2025 SUPER Point System.
                        <br />
                        1st: 10pts, Elimination: 1pt
                    </p>
                    <div className="rounded-lg bg-white/5 p-4">
                        <h4 className="mb-2 font-bold text-white">General Rules:</h4>
                        <ul className="list-disc pl-5">
                            <li>No emulators allowed.</li>
                            <li>Team Captain must join Discord.</li>
                            <li>Screenshots required for rank verification.</li>
                            {tournament.rules.map((rule, i) => (
                                <li key={i}>{rule}</li>
                            ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Prize Pool */}
            <Card className="glass-panel h-fit">
                <CardHeader>
                    <CardTitle className="font-syne text-xl">Prize Pool Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        <span className="text-3xl font-bold text-neon-yellow">${tournament.prize_pool.toLocaleString()}</span>
                        <p className="text-sm text-gray-500">Total Prize Pool</p>
                    </div>
                    <div className="mt-6 space-y-3">
                        <PrizeRow rank="1st" percent="50%" amount={tournament.prize_pool * 0.5} color="text-yellow-400" />
                        <PrizeRow rank="2nd" percent="30%" amount={tournament.prize_pool * 0.3} color="text-gray-300" />
                        <PrizeRow rank="3rd" percent="20%" amount={tournament.prize_pool * 0.2} color="text-orange-400" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function PrizeRow({ rank, percent, amount, color }: { rank: string; percent: string; amount: number; color: string }) {
    return (
        <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
            <span className={`font-bold ${color}`}>{rank}</span>
            <div className="text-right">
                <span className="block text-sm font-medium text-white">${amount}</span>
                <span className="text-xs text-gray-500">{percent}</span>
            </div>
        </div>
    );
}
