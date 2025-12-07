import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { Tournament } from "@/types";

interface TournamentCardProps {
    tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
    return (
        <Card className="glass-panel group relative overflow-hidden transition-all hover:-translate-y-1 hover:border-white/20">
            {/* Banner */}
            <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <img
                    src={tournament.banner_url}
                    alt={tournament.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute left-4 top-4 z-20 bg-neon-yellow text-black font-bold uppercase">
                    {tournament.status}
                </Badge>
                <div className="absolute bottom-4 left-4 z-20">
                    <h3 className="font-syne text-xl font-bold text-white leading-tight">{tournament.title}</h3>
                </div>
            </div>

            <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={<Trophy className="text-neon-yellow" />} label="Prize Pool" value={`$${tournament.prize_pool.toLocaleString()}`} />
                    <InfoItem icon={<Users className="text-neon-blue" />} label="Slots" value={`${tournament.registered_teams}/${tournament.max_slots}`} />
                    <InfoItem icon={<Calendar className="text-neon-green" />} label="Start Date" value={new Date(tournament.start_date).toLocaleDateString('en-GB')} />
                    <InfoItem icon={<MapPin className="text-neon-red" />} label="Format" value={(tournament.format || "SQUAD").toUpperCase()} />
                </div>
            </CardContent>

            <CardFooter className="p-6 pt-0">
                <Link href={`/tournaments/${tournament.id}`} className="w-full">
                    <Button className="w-full bg-white/5 text-white hover:bg-white/10 border border-white/10">
                        View Details
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 h-4 w-4 shrink-0">{icon}</div>
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium text-white">{value}</p>
            </div>
        </div>
    );
}
