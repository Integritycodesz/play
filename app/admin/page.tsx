import { Button } from "@/components/ui/button";
import { ScoreEntry } from "@/components/admin/score-entry";
import { Users, Trophy, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <h1 className="font-syne text-4xl font-bold text-white text-neon-red">Admin Control Center</h1>
                <div className="flex gap-2">
                    <Button variant="destructive" className="font-bold">Reset System</Button>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">Logs</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-8">
                <AdminStat icon={<Users className="text-neon-blue" />} label="Active Players" value="1,240" />
                <AdminStat icon={<Trophy className="text-neon-yellow" />} label="Active Tournaments" value="3" />
                <AdminStat icon={<AlertCircle className="text-neon-red" />} label="Pending Disputes" value="12" />
                <AdminStat icon={<Users className="text-neon-green" />} label="New Signups" value="+45" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <ScoreEntry />
                </div>

                <div className="space-y-6">
                    <Card className="glass-panel border-white/10">
                        <CardHeader>
                            <CardTitle className="font-syne text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white" variant="ghost">Create Tournament</Button>
                            <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white" variant="ghost">Verify Teams</Button>
                            <Button className="w-full justify-start bg-white/5 hover:bg-white/10 text-white" variant="ghost">Broadcast Message</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function AdminStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <Card className="glass-panel border-white/10">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/5">{icon}</div>
                <div>
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
