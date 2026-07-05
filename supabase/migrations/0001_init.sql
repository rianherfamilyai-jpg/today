-- Baseline schema. Every table enables RLS; profiles mirror auth.users and carry
-- the entitlement `plan` (default 'beta'). Payments later just flip this column.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'beta',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by the owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are updatable by the owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Data-deletion path (PDPA/GDPR-class hygiene). A user can delete only themselves;
-- the on-delete cascade removes their profile and any table referencing auth.users.
create or replace function public.delete_current_user()
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_current_user() from anon;
grant execute on function public.delete_current_user() to authenticated;
