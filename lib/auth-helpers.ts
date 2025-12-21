import { supabase } from "@/lib/supabaseClient";

export interface UserSession {
    id: string;
    ign: string;
    email: string | undefined;
    role: string;
    created_at: string;
}

export async function fetchUserProfile(userId: string) {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    return { profile, error };
}

export function syncUserSession(user: any, profile: any) {
    const ign = profile?.ign || user.user_metadata?.ign || "Player";
    const role = profile?.role || "user";

    const sessionUser: UserSession = {
        id: user.id,
        ign: ign,
        email: user.email,
        role: role,
        created_at: user.created_at
    };

    // Note: We are removing direct localStorage manipulation from here to keep it side-effect free if needed, 
    // but typically we might want to return this object to be used by the caller.
    // The original code had:
    // localStorage.setItem("user_session", JSON.stringify(sessionUser));
    // window.dispatchEvent(new Event("user-login"));

    return sessionUser;
}
