"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function UpdatePasswordPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSessionCheck, setIsSessionCheck] = useState(true);

    useEffect(() => {
        // Verify we have a session (which happens after clicking the email link)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast({
                    title: "Access Denied",
                    description: "Invalid or expired recovery link. Please try again.",
                    variant: "destructive"
                });
                router.push("/forgot-password");
            }
            setIsSessionCheck(false);
        };
        checkSession();
    }, [router, toast]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
            return;
        }

        if (password.length < 6) {
            toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive"
            });
            setIsLoading(false);
        } else {
            toast({
                title: "Success",
                description: "Your password has been updated! Redirecting...",
                className: "bg-neon-green text-black"
            });
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);
        }
    };

    if (isSessionCheck) {
        return <div className="flex min-h-screen items-center justify-center text-white">Verifying link...</div>;
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <Card className="glass-panel w-full max-w-md border-white/10">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neon-blue/10">
                        <Lock className="h-6 w-6 text-neon-blue" />
                    </div>
                    <CardTitle className="font-syne text-2xl font-bold text-center">Set New Password</CardTitle>
                    <CardDescription className="text-center">Enter your new secure password below.</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdate}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                name="password"
                                placeholder="New Password"
                                type="password"
                                className="bg-white/5 border-white/10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                name="confirmPassword"
                                placeholder="Confirm New Password"
                                type="password"
                                className="bg-white/5 border-white/10"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-neon-blue text-white font-bold hover:bg-neon-blue/90" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div >
    );
}
