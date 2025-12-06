import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Card className="glass-panel w-full max-w-md border-white/10">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon-blue/10">
                        <UserPlus className="h-6 w-6 text-neon-blue" />
                    </div>
                    <CardTitle className="font-syne text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>Join the elite community of gamers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="IGN (In-Game Name)" className="bg-white/5 border-white/10" />
                        <Input placeholder="PUBG ID" className="bg-white/5 border-white/10" />
                    </div>
                    <Input placeholder="Email" type="email" className="bg-white/5 border-white/10" />
                    <Input placeholder="Password" type="password" className="bg-white/5 border-white/10" />
                    <Input placeholder="Confirm Password" type="password" className="bg-white/5 border-white/10" />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full bg-neon-blue text-black font-bold hover:bg-neon-blue/90">Register</Button>
                    </Link>
                    <div className="text-center text-sm text-gray-400">
                        Already have an account? <Link href="/login" className="text-neon-yellow hover:underline">Log in</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
