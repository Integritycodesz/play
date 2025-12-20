-- Feature: Team Rosters & Invite Codes
-- Run this in Supabase SQL Editor

-- 1. Add 'invite_code' to teams (Random 8 char string)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'teams' and column_name = 'invite_code') then
        alter table teams add column invite_code text default upper(substr(md5(random()::text), 1, 6));
    end if;
end $$;

-- 2. Create team_members table
create table if not exists team_members (
    id uuid primary key default uuid_generate_v4(),
    team_id uuid references teams(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text default 'member' check (role in ('captain', 'member')),
    joined_at timestamp with time zone default now(),
    unique(team_id, user_id)
);

-- 3. Enable RLS
alter table team_members enable row level security;

-- 4. Policies
drop policy if exists "Public Team Members" on team_members;
create policy "Public Team Members" on team_members for select using (true);

drop policy if exists "Users leave team" on team_members;
create policy "Users leave team" on team_members for delete using (auth.uid() = user_id);

drop policy if exists "Admin Manage Members" on team_members;
create policy "Admin Manage Members" on team_members for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- 5. Auto-add captain on team creation
create or replace function public.handle_new_team()
returns trigger as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.captain_id, 'captain');
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger
drop trigger if exists on_team_created on teams;
create trigger on_team_created
  after insert on teams
  for each row execute procedure public.handle_new_team();

-- 6. Backfill existing teams (Important!)
insert into team_members (team_id, user_id, role)
select id, captain_id, 'captain' from teams
on conflict (team_id, user_id) do nothing;

-- 7. Helper function to join via code
create or replace function join_team_via_code(p_invite_code text, p_user_id uuid)
returns json as $$
declare
  v_team_id uuid;
  v_count int;
  v_tournament_id uuid;
begin
  -- Find team
  select id, tournament_id into v_team_id, v_tournament_id from teams where invite_code = upper(p_invite_code) limit 1;
  
  if v_team_id is null then
    return json_build_object('success', false, 'message', 'Invalid invite code');
  end if;

  -- Check if already member of THIS team
  select count(*) into v_count from team_members where team_id = v_team_id and user_id = p_user_id;
  if v_count > 0 then
    return json_build_object('success', false, 'message', 'Already in this team');
  end if;

  -- Check if already entered in THIS tournament (via any team)
  -- Check if already entered in THIS tournament (via any team)
  -- This joins team_members -> teams -> filter by tournament_id
  perform 1 
  from team_members tm
  join teams t on tm.team_id = t.id
  where tm.user_id = p_user_id
  and t.tournament_id = v_tournament_id;

  if found then
     return json_build_object('success', false, 'message', 'You are already registered in this tournament');
  end if;

  -- Insert
  insert into team_members (team_id, user_id, role) values (v_team_id, p_user_id, 'member');
  
  return json_build_object('success', true, 'team_id', v_team_id);
end;
$$ language plpgsql security definer;
