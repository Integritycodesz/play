"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Gamepad2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchUserProfile, syncUserSession } from "@/lib/auth-helpers";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Auto-Redirect if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { profile } = await fetchUserProfile(session.user.id);
                // We run syncUserSession to get the object, even if we don't store it manually here
                // (The original code commented out localStorage.setItem)
                const userMeta = syncUserSession(session.user, profile);

                toast({ title: "Welcome Back", description: "Redirecting to dashboard..." });

                if (userMeta.role === 'admin') router.push("/admin");
                else router.push("/dashboard");
            }
        };
        checkSession();
    }, [router, toast]);

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        toast({ title: "Authenticating...", description: "Verifying credentials..." });

        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email.trim(),
                password: data.password,
            });

            if (error) {
                throw error;
            }

            if (authData.user) {
                toast({ title: "Authenticated", description: "Fetching user profile..." });

                // Fetch profile with error handling
                let userMeta;
                try {
                    const { profile, error: profileError } = await fetchUserProfile(authData.user.id);
                    if (profileError) console.warn("Profile fetch warning:", profileError);
                    userMeta = syncUserSession(authData.user, profile);
                } catch (profileCatch) {
                    console.error("Profile sync failed", profileCatch);
                    // Fallback to basic user session
                    userMeta = {
                        id: authData.user.id,
                        ign: authData.user.email?.split('@')[0] || "User",
                        email: authData.user.email,
                        role: "user",
                        created_at: new Date().toISOString()
                    };
                }

                toast({
                    title: "Welcome back, " + userMeta.ign,
                    description: "Successfully logged in.",
                    className: "bg-neon-green text-black border-none",
                });

                if (userMeta.role === 'admin') router.push("/admin");
                else router.push("/dashboard");
            }
        } catch (err) {
            console.error("Login error", err);
            toast({
                title: "Login Failed",
                description: (err as Error).message || "Invalid credentials.",
                variant: "destructive",
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
                <CardContent className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Email"
                                                type="email"
                                                className="bg-white/5 border-white/10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Password"
                                                type="password"
                                                className="bg-white/5 border-white/10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-white hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <Button className="w-full bg-neon-yellow text-black font-bold hover:bg-neon-yellow/90" disabled={isLoading} type="submit">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isLoading ? "Signing In..." : "Sign In"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-gray-400">
                        Don&apos;t have an account? <Link href="/register" className="text-neon-blue hover:underline">Sign up</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
