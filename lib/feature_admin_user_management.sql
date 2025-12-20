-- Feature: Admin User Management
-- Run this in Supabase SQL Editor

-- 1. Add 'is_banned' to profiles
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_banned') then
        alter table profiles add column is_banned boolean default false;
    end if;
end $$;

-- 2. Update Policies to Block Banned Users

-- Block creating teams if banned
drop policy if exists "Users can create teams" on teams;
create policy "Users can create teams" on teams for insert with check (
  auth.uid() = captain_id
  and not exists (select 1 from profiles where id = auth.uid() and is_banned = true)
);

-- Block joining teams if banned
drop policy if exists "Public Team Members" on team_members;
create policy "Public Team Members" on team_members for select using (true);

drop policy if exists "Users leave team" on team_members;
create policy "Users leave team" on team_members for delete using (auth.uid() = user_id);

-- Only allow insert if NOT banned
drop policy if exists "Users join team" on team_members;
create policy "Users join team" on team_members for insert with check (
  auth.uid() = user_id
  and not exists (select 1 from profiles where id = auth.uid() and is_banned = true)
);


-- 3. Admin Policies for Profiles (Manage Ban/Role)
-- Allow admins to UPDATE any profile (to ban/unban/promote)
drop policy if exists "Admins can update profiles" on profiles;
create policy "Admins can update profiles" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Allow admins to SELECT all profiles (for the dashboard)
-- (The existing public select policy covers this, but good to be explicit if that changes)

