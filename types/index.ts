export type UserRole = "admin" | "moderator" | "user";

export interface User {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
    role: UserRole;
    pubg_id?: string;
    team_id?: string;
    created_at: string;
}

export interface Team {
    id: string;
    name: string;
    logo_url?: string;
    captain_id: string;
    players: User[];
    stats: {
        wins: number;
        kills: number;
        matches_played: number;
    };
    created_at: string;
}

export type TournamentStatus = "upcoming" | "open" | "live" | "completed";

export interface Tournament {
    id: string;
    title: string;
    description: string;
    banner_url: string;
    start_date: string;
    status: TournamentStatus;
    prize_pool: number;
    max_slots: number;
    registered_teams: number;
    format: "solo" | "duo" | "squad";
    rules: string[];
    map_pool?: string[];
    scoring_rules?: string;
    matches?: { name: string; map: string }[];
}
