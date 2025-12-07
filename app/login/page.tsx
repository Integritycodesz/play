"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Gamepad2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. Try Supabase Login
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (data.user && !error) {
                // Success: Get Profile Data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                // Use profile data or metadata
                const ign = profile?.ign || data.user.user_metadata?.ign || "Player";
                const role = profile?.role || "user";

                const sessionUser = {
                    id: data.user.id,
                    ign: ign,
                    email: data.user.email,
                    role: role,
                    created_at: data.user.created_at
                };

                localStorage.setItem("user_session", JSON.stringify(sessionUser));
                window.dispatchEvent(new Event("user-login"));

                toast({
                    title: "Welcome back, " + ign,
                    description: "Successfully logged in via Supabase.",
                    className: "bg-neon-green text-black border-none"
                });

                if (role === 'admin') router.push("/admin");
                else router.push("/dashboard");

                return; // Stop here if successful
            }
        } catch (err: any) {
            console.error("Login error", err);
            toast({
                title: "Login Failed",
                description: err.message || "Invalid credentials.",
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
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon-yellow/10">
                        <Gamepad2 className="h-6 w-6 text-neon-yellow" />
                    </div>
                    <CardTitle className="font-syne text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your account.</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                name="email"
                                placeholder="Email"
                                type="email"
                                className="bg-white/5 border-white/10"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                name="password"
                                placeholder="Password"
                                type="password"
                                className="bg-white/5 border-white/10"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full bg-neon-yellow text-black font-bold hover:bg-neon-yellow/90" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Button>

                        <div className="text-center text-sm text-gray-400">
                            Don't have an account? <Link href="/register" className="text-neon-blue hover:underline">Sign up</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div >
    );
}
