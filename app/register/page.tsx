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

const registrationSchema = z.object({
    ign: z.string().min(3, "IGN must be at least 3 characters").max(20, "IGN must be at most 20 characters"),
    pubgId: z.string().regex(/^\d{8,15}$/, "PUBG ID must be 8-15 numeric digits"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            ign: "",
            pubgId: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    // Auto-Redirect & Restore Session if already logged in
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { profile } = await fetchUserProfile(session.user.id);
                // Sync session just in case, though we are redirecting
                const userMeta = syncUserSession(session.user, profile);

                toast({ title: "Already Logged In", description: "Taking you to dashboard..." });

                if (userMeta.role === 'admin') router.push("/admin");
                else router.push("/dashboard");
            }
        };
        checkSession();
    }, [router, toast]);

    const onSubmit = async (data: RegistrationFormValues) => {
        setIsLoading(true);

        try {
            // 1. SignUp with Supabase
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        ign: data.ign,
                        pubg_id: data.pubgId, // Store PUBG ID in metadata
                    },
                },
            });

            if (error) throw error;

            if (authData.user) {
                toast({
                    title: "Welcome, " + data.ign,
                    description: "Registration successful! Please check your email to confirm.",
                    className: "bg-neon-green text-black border-none",
                });

                router.push("/dashboard");
            }
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: (error as Error).message || "Something went wrong.",
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
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon-blue/10">
                        <UserPlus className="h-6 w-6 text-neon-blue" />
                    </div>
                    <CardTitle className="font-syne text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>Join the elite community of gamers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="ign"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="IGN (In-Game Name)"
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
                                    name="pubgId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    placeholder="PUBG ID"
                                                    className="bg-white/5 border-white/10"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="text-[10px] text-gray-500 pl-1">8-15 numeric digits</p>
                                        </FormItem>
                                    )}
                                />
                            </div>
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
                                        <div className="text-xs text-gray-500 space-y-1 pl-1">
                                            <p>Password must include:</p>
                                            <ul className="list-disc list-inside space-y-0.5 ml-1">
                                                <li>8+ characters</li>
                                                <li>Uppercase & Lowercase letters</li>
                                                <li>Number & Special character (e.g., !@#)</li>
                                            </ul>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Confirm Password"
                                                type="password"
                                                className="bg-white/5 border-white/10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                className="w-full bg-neon-blue text-black font-bold hover:bg-neon-blue/90"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isLoading ? "Signing Up..." : "Register"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-gray-400">
                        Already have an account? <Link href="/login" className="text-neon-yellow hover:underline">Log in</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
