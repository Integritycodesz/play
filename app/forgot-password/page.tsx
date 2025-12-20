"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Gamepad2, Loader2, ArrowLeft, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState("");

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/update-password` : undefined;

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });

        if (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to send reset email.",
                variant: "destructive"
            });
            setIsLoading(false);
        } else {
            setIsSubmitted(true);
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center px-4">
                <Card className="glass-panel w-full max-w-md border-white/10 text-center p-6">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                        <Mail className="h-8 w-8 text-green-500" />
                    </div>
                    <CardTitle className="font-syne text-2xl font-bold mb-2 text-white">Check your Email</CardTitle>
                    <CardDescription className="mb-6">
                        We have sent a password reset link to <span className="text-neon-yellow">{email}</span>.
                        <br />
                        Please check your inbox (and spam folder).
                    </CardDescription>
                    <Link href="/login">
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                            Return to Login
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Card className="glass-panel w-full max-w-md border-white/10">
                <CardHeader>
                    <Link href="/login" className="flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                    </Link>
                    <CardTitle className="font-syne text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>Enter your email to receive a recovery link.</CardDescription>
                </CardHeader>
                <form onSubmit={handleReset}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                name="email"
                                placeholder="Email Address"
                                type="email"
                                className="bg-white/5 border-white/10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-neon-yellow text-black font-bold hover:bg-neon-yellow/90" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div >
    );
}
