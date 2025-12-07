"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { UserPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [ign, setIgn] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Auto-Redirect & Restore Session if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Sync LocalStorage
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                const userMeta = {
                    id: session.user.id,
                    ign: profile?.ign || session.user.user_metadata?.ign || "Player",
                    email: session.user.email,
                    role: profile?.role || "user",
                    created_at: session.user.created_at
                };

                localStorage.setItem("user_session", JSON.stringify(userMeta));
                window.dispatchEvent(new Event("user-login"));

                toast({ title: "Already Logged In", description: "Taking you to dashboard..." });

                if (profile?.role === 'admin') router.push("/admin");
                else router.push("/dashboard");
            }
        };
        checkSession();
    }, [router, toast]);

    const handleRegister = async () => {
        if (!ign || !email || !password) {
            toast({
                title: "Error",
                description: "Please fill in all fields.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);

        try {
            // 1. SignUp with Supabase
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        ign: ign, // Metadata to be copied to profiles table via trigger
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                // 2. Hybrid Sync: Set LocalStorage Session for existing components
                const userSession = {
                    id: data.user.id,
                    ign: ign,
                    email: email,
                    role: "user", // Default
                    created_at: new Date().toISOString()
                };

                localStorage.setItem("user_session", JSON.stringify(userSession));
                window.dispatchEvent(new Event("user-login"));

                toast({
                    title: "Welcome, " + ign,
                    description: "Registration successful! Please check your email to confirm.",
                    className: "bg-neon-green text-black border-none"
                });

                router.push("/dashboard");
            }
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                        <Input
                            placeholder="IGN (In-Game Name)"
                            className="bg-white/5 border-white/10"
                            value={ign}
                            onChange={(e) => setIgn(e.target.value)}
                        />
                        <Input placeholder="PUBG ID" className="bg-white/5 border-white/10" />
                    </div>
                    <Input
                        placeholder="Email"
                        type="email"
                        className="bg-white/5 border-white/10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                        placeholder="Password"
                        type="password"
                        className="bg-white/5 border-white/10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Input placeholder="Confirm Password" type="password" className="bg-white/5 border-white/10" />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        className="w-full bg-neon-blue text-black font-bold hover:bg-neon-blue/90"
                        onClick={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isLoading ? "Signing Up..." : "Register"}
                    </Button>
                    <div className="text-center text-sm text-gray-400">
                        Already have an account? <Link href="/login" className="text-neon-yellow hover:underline">Log in</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
