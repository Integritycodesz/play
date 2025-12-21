-- Feature: Group Division & Notifications
-- Run this in Supabase SQL Editor

-- 1. Add group_name to teams
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'teams' and column_name = 'group_name') then
        alter table teams add column group_name text;
    end if;
end $$;

-- 2. Create Notifications Table
create table if not exists notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    message text not null,
    type text default 'info' check (type in ('info', 'success', 'warning', 'error')),
    is_read boolean default false,
    created_at timestamp with time zone default now()
);

-- 3. Enable RLS for Notifications
alter table notifications enable row level security;

-- 4. Notification Policies
drop policy if exists "Users view own notifications" on notifications;
create policy "Users view own notifications" on notifications for select using (auth.uid() = user_id);

drop policy if exists "Admins manage all notifications" on notifications;
create policy "Admins manage all notifications" on notifications for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 5. Update Leaderboard View to include Group Name
drop view if exists public.leaderboard;
create or replace view leaderboard as
select 
    t.id as id,
    t.team_name,
    t.tournament_id,
    t.group_name,
    tr.title as tournament_title,
    coalesce(sum(s.kills), 0) as kills,
    coalesce(sum(s.total_points), 0) as total_points
from teams t
join tournaments tr on t.tournament_id = tr.id
left join scores s on t.id = s.team_id
where t.status = 'approved'
group by t.id, t.team_name, t.tournament_id, t.group_name, tr.title;
