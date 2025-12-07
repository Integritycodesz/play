"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Gamepad2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            const savedUsers = localStorage.getItem("registered_users");
            const users = savedUsers ? JSON.parse(savedUsers) : [];

            // Find user matching credentials logic would go here
            // For now, since we didn't implement robust password hashing in register, 
            // we'll just check if the email exists. 
            // In a real app, verify password hash.
            const user = users.find((u: any) => u.email === formData.email);

            if (user) {
                if (user.password === formData.password) {
                    // Don't store password in session
                    const { password, ...sessionUser } = user;
                    localStorage.setItem("user_session", JSON.stringify(sessionUser));
                    window.dispatchEvent(new Event("user-login"));

                    toast({
                        title: "Welcome back, " + user.ign,
                        description: "Successfully logged in.",
                        className: "bg-neon-green text-black border-none"
                    });

                    if (user.role === 'admin') {
                        router.push("/admin");
                    } else {
                        router.push("/dashboard");
                    }
                } else {
                    toast({ title: "Login Failed", description: "Invalid password.", variant: "destructive" });
                    setIsLoading(false);
                }
            } else {
                // Fallback for Admin testing: If email is "admin@pmpl.gg" and password "admin", allow
                if (formData.email === "admin@pmpl.gg" && formData.password === "admin") {
                    const adminUser = { id: "admin", ign: "SuperAdmin", email: "admin@pmpl.gg", role: "admin" };
                    localStorage.setItem("user_session", JSON.stringify(adminUser));
                    window.dispatchEvent(new Event("user-login"));
                    toast({ title: "Admin Access", description: "Logged in as Super Admin" });
                    router.push("/admin");
                } else if (formData.email === "demo@pmpl.gg" && formData.password === "demo123") {
                    const demoUser = {
                        id: "demo-user",
                        ign: "DemoPlayer",
                        email: "demo@pmpl.gg",
                        role: "user",
                        created_at: new Date().toISOString()
                    };
                    localStorage.setItem("user_session", JSON.stringify(demoUser));
                    window.dispatchEvent(new Event("user-login"));
                    toast({ title: "Demo Access", description: "Logged in as Demo Player" });
                    router.push("/dashboard");
                } else {
                    toast({
                        title: "Login Failed",
                        description: "Invalid email or password. Try registering first.",
                        variant: "destructive"
                    });
                    setIsLoading(false);
                }
            }
        }, 1000);
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

                        {/* Demo Credentials Helper */}
                        <div className="bg-white/5 p-4 rounded-lg text-xs space-y-2 border border-white/10 w-full">
                            <p className="font-bold text-gray-300 mb-1">Demo Credentials:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <span className="block text-neon-blue">Admin</span>
                                    <span className="text-gray-500">admin@pmpl.gg</span>
                                    <br />
                                    <span className="text-gray-500">Pass: admin</span>
                                </div>
                                <div>
                                    <span className="block text-neon-yellow">Player</span>
                                    <span className="text-gray-500">demo@pmpl.gg</span>
                                    <br />
                                    <span className="text-gray-500">Pass: demo123</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-400">
                            Don't have an account? <Link href="/register" className="text-neon-blue hover:underline">Sign up</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div >
    );
}
