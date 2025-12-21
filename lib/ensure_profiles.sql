-- Ensure Profiles Table and Roles exist
-- Run this in Supabase SQL Editor

-- 1. Create Profiles Table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  ign text, -- In-Game Name
  pubg_id text, -- PUBG ID
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Enable RLS on Profiles
alter table public.profiles enable row level security;

-- 3. Profiles Policies
drop policy if exists "Public Profiles Access" on profiles;
create policy "Public Profiles Access" on profiles for select using (true);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

-- 4. Auto-Profile Trigger (Optional but recommended)
-- This ensures every new user gets a profile automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, ign, role, pubg_id)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'ign', 
    'user',
    new.raw_user_meta_data->>'pubg_id'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger ONLY if it doesn't exist to avoid errors
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. SET ADMIN ROLE (run this manually for your specific user ID if needed)
-- Replace 'YOUR_USER_ID_HERE' with your actual Supabase User ID from Authentication tab.
-- update public.profiles set role = 'admin' where id = 'YOUR_USER_ID_HERE';
