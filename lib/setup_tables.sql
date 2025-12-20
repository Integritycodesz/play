-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Broadcasts: System-wide announcements
create table if not exists broadcasts (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    message text not null,
    type text not null check (type in ('info', 'warning', 'destructive')),
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- 2. Tournaments: Main event table
create table if not exists tournaments (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text,
    banner_url text,
    start_date timestamp with time zone,
    status text default 'open',
    prize_pool integer default 0,
    max_slots integer default 100,
    registered_teams integer default 0,
    format text check (format in ('solo', 'duo', 'squad')),
    rules text[],
    created_at timestamp with time zone default now()
);

-- 3. Matches: Individual games within a tournament
create table if not exists matches (
    id uuid primary key default uuid_generate_v4(),
    tournament_id uuid references tournaments(id) on delete cascade,
    name text not null, -- e.g. "Match 1", "Qualifier A"
    map text not null,
    status text default 'scheduled',
    created_at timestamp with time zone default now()
);

-- 4. Teams: Teams registered for a tournament
-- Note: 'profiles' table should already exist from previous setup.
create table if not exists teams (
    id uuid primary key default uuid_generate_v4(),
    tournament_id uuid references tournaments(id) on delete cascade,
    captain_id uuid references auth.users(id),
    team_name text not null,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default now()
);

-- 5. Scores: Results for each team in a match
create table if not exists scores (
    id uuid primary key default uuid_generate_v4(),
    match_id uuid references matches(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,
    rank integer,
    kills integer,
    total_points integer,
    created_at timestamp with time zone default now(),
    unique(match_id, team_id)
);

-- 6. News: Announcements and Updates
create table if not exists news (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    category text not null check (category in ('update', 'esports', 'community', 'system')),
    image text,
    excerpt text,
    author text default 'System',
    created_at timestamp with time zone default now()
);

-- Enable Realtime for all tables (Idempotent) - MOVED AFTER TABLES EXIST
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'broadcasts') then
    alter publication supabase_realtime add table broadcasts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'tournaments') then
    alter publication supabase_realtime add table tournaments;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'matches') then
    alter publication supabase_realtime add table matches;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'teams') then
    alter publication supabase_realtime add table teams;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'scores') then
    alter publication supabase_realtime add table scores;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'news') then
    alter publication supabase_realtime add table news;
  end if;
end $$;

-- 7. Leaderboard View: Aggregated scores
-- Drop it if it exists as a table or view to avoid collision (Error 42809)
-- Safely drop leaderboard whether it is a table or a view
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'leaderboard') then
    drop table public.leaderboard;
  elsif exists (select 1 from pg_views where schemaname = 'public' and viewname = 'leaderboard') then
    drop view public.leaderboard;
  end if;
end $$;

create or replace view leaderboard as
select 
    t.id as id,
    t.team_name,
    t.tournament_id,
    tr.title as tournament_title,
    coalesce(sum(s.kills), 0) as kills,
    coalesce(sum(s.total_points), 0) as total_points
from teams t
join tournaments tr on t.tournament_id = tr.id
left join scores s on t.id = s.team_id
where t.status = 'approved'
group by t.id, t.team_name, t.tournament_id, tr.title;

-- Create storage bucket for detailed tournament rules or banners if needed (Optional)
insert into storage.buckets (id, name, public) 
values ('tournament-assets', 'tournament-assets', true)
on conflict (id) do nothing;

-- SAFE SCHEMA UPDATES (Run this if you get errors about missing columns)
do $$ 
begin
    -- 1. Rules
    if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'rules') then
        alter table tournaments add column rules text[];
    end if;
    -- 2. Format
    if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'format') then
        alter table tournaments add column format text check (format in ('solo', 'duo', 'squad'));
    end if;
    -- 3. Banner URL
    if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'banner_url') then
        alter table tournaments add column banner_url text;
    end if;
    -- 4. Description
    if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'description') then
        alter table tournaments add column description text;
    end if;
    -- 5. Start Date
    if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'start_date') then
        alter table tournaments add column start_date timestamp with time zone;
    end if;
    -- 6. Prize Pool
     if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'prize_pool') then
        alter table tournaments add column prize_pool integer default 0;
    end if;
    -- 7. Max Slots
     if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'max_slots') then
        alter table tournaments add column max_slots integer default 100;
    end if;
    -- 8. Registered Teams
     if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'registered_teams') then
        alter table tournaments add column registered_teams integer default 0;
    end if;

    -- 9. Match Stage (e.g., 'Quarter Finals', 'Semi Finals')
    if not exists (select 1 from information_schema.columns where table_name = 'matches' and column_name = 'stage') then
        alter table matches add column stage text default 'Group Stage';
    end if;
end $$;

-- RLS POLICIES (Essential for public access)
alter table tournaments enable row level security;
alter table matches enable row level security;
alter table teams enable row level security;
alter table broadcasts enable row level security;
alter table news enable row level security;

-- Helper function to drop policy if exists
create or replace function drop_policy_if_exists(table_name text, policy_name text) returns void as $$
begin
    execute format('drop policy if exists %I on %I', policy_name, table_name);
end;
$$ language plpgsql;

-- Apply Policies (Drop first to avoid errors)
select drop_policy_if_exists('tournaments', 'Public Tournaments');
create policy "Public Tournaments" on tournaments for select using (true);

select drop_policy_if_exists('tournaments', 'Admin Insert Tournaments');
create policy "Admin Insert Tournaments" on tournaments for insert with check (true); 

select drop_policy_if_exists('tournaments', 'Admin Update Tournaments');
create policy "Admin Update Tournaments" on tournaments for update using (true);

select drop_policy_if_exists('tournaments', 'Admin Delete Tournaments');
create policy "Admin Delete Tournaments" on tournaments for delete using (true);

select drop_policy_if_exists('matches', 'Public Matches');
create policy "Public Matches" on matches for select using (true);

select drop_policy_if_exists('matches', 'Admin Manage Matches');
create policy "Admin Manage Matches" on matches for all using (true);

select drop_policy_if_exists('teams', 'Public Teams');
create policy "Public Teams" on teams for select using (true);

select drop_policy_if_exists('teams', 'User Join Team');
create policy "User Join Team" on teams for insert with check (auth.uid() = captain_id);

select drop_policy_if_exists('teams', 'Admin Update Teams');
-- Allow Admin to do ANYTHING (Update, Delete, Select) on teams
create policy "Admin Manage Teams" on teams for all using (true);

select drop_policy_if_exists('news', 'Public News');
create policy "Public News" on news for select using (true);

select drop_policy_if_exists('news', 'Admin Manage News');
create policy "Admin Manage News" on news for all using (true);

select drop_policy_if_exists('broadcasts', 'Public Broadcasts');
create policy "Public Broadcasts" on broadcasts for select using (true);

select drop_policy_if_exists('broadcasts', 'Admin Manage Broadcasts');
create policy "Admin Manage Broadcasts" on broadcasts for all using (true);

alter table scores enable row level security;

select drop_policy_if_exists('scores', 'Public Scores');
create policy "Public Scores" on scores for select using (true);

select drop_policy_if_exists('scores', 'Admin Manage Scores');
create policy "Admin Manage Scores" on scores for all using (true);
