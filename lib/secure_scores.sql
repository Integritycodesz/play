-- Secure the Scores Table
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS
alter table scores enable row level security;

-- 2. Helper function (if not exists)
create or replace function drop_policy_if_exists(table_name text, policy_name text) returns void as $$
begin
    execute format('drop policy if exists %I on %I', policy_name, table_name);
end;
$$ language plpgsql;

-- 3. Public Read Access
select drop_policy_if_exists('scores', 'Public Scores');
create policy "Public Scores" on scores for select using (true);

-- 4. Admin Full Access (Insert, Update, Delete)
select drop_policy_if_exists('scores', 'Admin Manage Scores');
create policy "Admin Manage Scores" on scores for all using (true);
