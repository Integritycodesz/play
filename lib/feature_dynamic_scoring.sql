-- Feature: Dynamic Scoring Config
-- Run this in Supabase SQL Editor

-- 1. Add 'scoring_config' column to tournaments
-- Format: JSONB { "kill_points": 1, "placement_points": { "1": 15, "2": 12, ... } }
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'tournaments' and column_name = 'scoring_config') then
        alter table tournaments add column scoring_config jsonb default '{"kill_points": 1, "placement_points": {"1": 15, "2": 12, "3": 10, "4": 8, "5": 6, "6": 4, "7": 2, "8": 1}}'::jsonb;
    end if;
end $$;
