-- Helper Script: Seed Mock Teams
-- Run this in Supabase SQL Editor to generate 48 approved teams for the latest tournament.

do $$
declare
  v_tournament_id uuid;
  v_user_id uuid;
begin
  -- 1. Get the latest 'open' tournament
  select id into v_tournament_id from tournaments where status = 'open' order by created_at desc limit 1;
  
  -- 2. Get your user ID (assuming you are the one running this and exist in users)
  select id into v_user_id from auth.users order by created_at desc limit 1;

  if v_tournament_id is null then
    raise exception 'No open tournament found. Please create one first.';
  end if;

  if v_user_id is null then
    raise exception 'No user found. Please sign up first.';
  end if;

  -- 3. Insert 48 Teams (divisible by 16 for perfect groups, or usable for round robin)
  insert into teams (tournament_id, captain_id, team_name, status, created_at)
  select 
    v_tournament_id,
    v_user_id,
    'Mock Team ' || i,
    'approved',
    now()
  from generate_series(1, 48) as i;
  
end $$;
