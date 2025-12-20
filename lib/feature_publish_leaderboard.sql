-- Feature: Publish Leaderboard
-- Run this in Supabase SQL Editor

-- 1. Add 'is_published' column to tournaments
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'is_published') then
        alter table tournaments add column is_published boolean default false;
    end if;
end $$;

-- 2. Update Leaderboard View to respect 'is_published'
create or replace view leaderboard as
select 
    t.id as id,
    t.team_name,
    t.tournament_id,
    tr.title as tournament_title,
    coalesce(sum(s.kills), 0) as kills,
    coalesce(sum(s.total_points), 0) as total_points,
    tr.is_published
from teams t
join tournaments tr on t.tournament_id = tr.id
left join scores s on t.id = s.team_id
where t.status = 'approved' AND tr.is_published = true
group by t.id, t.team_name, t.tournament_id, tr.title, tr.is_published;
