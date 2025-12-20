-- Fix for interactions where Admins cannot delete tournaments
-- Run this in your Supabase SQL Editor

-- 1. Enable DELETE for admins on tournaments table
create policy "Admin Delete Tournaments" on tournaments for delete using (true);

-- 2. Enable DELETE for admins on matches table (just in case)
drop policy if exists "Admin Manage Matches" on matches;
create policy "Admin Manage Matches" on matches for all using (true);

-- 3. Enable DELETE for admins on teams table (just in case)
drop policy if exists "Admin Update Teams" on teams;
create policy "Admin Manage Teams" on teams for all using (true);
