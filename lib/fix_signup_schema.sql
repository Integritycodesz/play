-- 1. Add pubg_id column to profiles table
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'pubg_id') then
        alter table public.profiles add column pubg_id text;
    end if;
end $$;

-- 2. Update handle_new_user function to include pubg_id
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
