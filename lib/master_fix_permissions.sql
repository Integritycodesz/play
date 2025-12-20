-- MASTER FIX: Enable Admin Delete for ALL Tables
-- Run this in Supabase SQL Editor to resolve "Delete" button issues.

-- 0. FIX FOREIGN KEYS (Ensure Cascading Delete)
-- This ensures that when you delete a Tournament, all Matches, Teams, and Scores are also deleted automatically.
alter table matches drop constraint if exists matches_tournament_id_fkey;
alter table matches add constraint matches_tournament_id_fkey foreign key (tournament_id) references tournaments(id) on delete cascade;

alter table teams drop constraint if exists teams_tournament_id_fkey;
alter table teams add constraint teams_tournament_id_fkey foreign key (tournament_id) references tournaments(id) on delete cascade;

alter table scores drop constraint if exists scores_match_id_fkey;
alter table scores add constraint scores_match_id_fkey foreign key (match_id) references matches(id) on delete cascade;

alter table scores drop constraint if exists scores_team_id_fkey;
alter table scores add constraint scores_team_id_fkey foreign key (team_id) references teams(id) on delete cascade;


-- 1. Tournaments: Allow Delete
drop policy if exists "Admin Delete Tournaments" on tournaments;
create policy "Admin Delete Tournaments" on tournaments for delete using (true);

-- 2. Matches: Allow Full Management (including cascading delete from tournament)
drop policy if exists "Admin Manage Matches" on matches;
create policy "Admin Manage Matches" on matches for all using (true);

-- 3. Teams: Allow Full Management (including cascading delete from tournament)
drop policy if exists "Admin Manage Teams" on teams;
drop policy if exists "Admin Update Teams" on teams; -- Remove old narrow policy
create policy "Admin Manage Teams" on teams for all using (true);

-- 4. Scores: Allow Full Management (including cascading delete from match)
alter table scores enable row level security;
drop policy if exists "Admin Manage Scores" on scores;
create policy "Admin Manage Scores" on scores for all using (true);

-- 5. Broadcasts & News (Cleanup)
drop policy if exists "Admin Manage Broadcasts" on broadcasts;
create policy "Admin Manage Broadcasts" on broadcasts for all using (true);

drop policy if exists "Admin Manage News" on news;
create policy "Admin Manage News" on news for all using (true);

