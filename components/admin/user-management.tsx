"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, ShieldAlert, Ban, CheckCircle, Search } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { usePresence } from "@/components/auth/presence-provider";

interface UserProfile {
    id: string;
    email: string;
    ign: string;
    role: 'user' | 'admin';
    is_banned: boolean;
    created_at: string;
}

export function UserManagement() {
    const { toast } = useToast();
    const { onlineUsers } = usePresence();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
        } else {
            setUsers(data as UserProfile[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBanToggle = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_banned: !currentStatus })
            .eq('id', userId);

        if (error) {
            toast({ title: "Error", description: "Failed to update ban status.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: `User ${!currentStatus ? 'Banned' : 'Unbanned'}.` });
            setUsers(users.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u));
        }
    };

    const handleRoleToggle = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: `User role updated to ${newRole}.` });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
    };

    const filteredUsers = users.filter(u =>
        u.ign?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10 max-w-sm">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search by IGN or Email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 h-8"
                />
            </div>

            <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-gray-400">User</TableHead>
                            <TableHead className="text-gray-400">Role</TableHead>
                            <TableHead className="text-gray-400">Status</TableHead>
                            <TableHead className="text-gray-400 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                    Loading profiles...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-white/5 hover:bg-white/5 data-[banned=true]:opacity-50" data-banned={user.is_banned}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.ign}`} />
                                                <AvatarFallback>{user.ign?.[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white">{user.ign || "Unknown"}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.role === 'admin' ? (
                                            <Badge className="bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30">
                                                <ShieldAlert className="w-3 h-3 mr-1" /> Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-400 border-white/10">
                                                User
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {user.is_banned ? (
                                            <Badge className="bg-red-900/50 text-red-200 border-red-800">BANNED</Badge>
                                        ) : onlineUsers.has(user.id) ? (
                                            <Badge variant="outline" className="text-neon-green border-neon-green/30 bg-neon-green/5 flex w-fit items-center gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-500 border-white/10">Offline</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-black/90 border-white/20 text-white">
                                                <DropdownMenuItem onClick={() => handleRoleToggle(user.id, user.role.toLowerCase())}>
                                                    {user.role === 'admin' ? (
                                                        <> <Shield className="mr-2 h-4 w-4" /> Revoke Admin </>
                                                    ) : (
                                                        <> <ShieldAlert className="mr-2 h-4 w-4" /> Make Admin </>
                                                    )}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleBanToggle(user.id, user.is_banned)}
                                                    className={user.is_banned ? "text-green-500" : "text-red-500"}
                                                >
                                                    {user.is_banned ? (
                                                        <> <CheckCircle className="mr-2 h-4 w-4" /> Unban User </>
                                                    ) : (
                                                        <> <Ban className="mr-2 h-4 w-4" /> Ban User </>
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
