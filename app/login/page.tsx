import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Card className="glass-panel w-full max-w-md border-white/10">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon-yellow/10">
                        <Gamepad2 className="h-6 w-6 text-neon-yellow" />
                    </div>
                    <CardTitle className="font-syne text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Input placeholder="Email" type="email" className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                        <Input placeholder="Password" type="password" className="bg-white/5 border-white/10" />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full bg-neon-yellow text-black font-bold hover:bg-neon-yellow/90">Sign In</Button>
                    </Link>
                    <div className="text-center text-sm text-gray-400">
                        Don't have an account? <Link href="/register" className="text-neon-blue hover:underline">Sign up</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
