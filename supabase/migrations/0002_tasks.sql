-- Slice 1 of "Today": one tasks table.
-- Two buckets (today | someday), an optional due date, gentle completion.
-- RLS: a user can only ever see and touch their own rows. Financial-grade default:
-- deny by default, grant the authenticated role explicitly, gate rows with policies.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  bucket text not null default 'today',
  due_at timestamptz,
  completed_at timestamptz,
  -- Fractional sort key so items can be reordered/inserted-between without a
  -- full renumber later. Defaults to wall-clock epoch => new items append.
  sort double precision not null default extract(epoch from clock_timestamp()),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_not_blank check (length(btrim(title)) > 0),
  constraint tasks_bucket_valid check (bucket in ('today', 'someday'))
);

alter table public.tasks enable row level security;

-- Hot path: "my tasks in a bucket, incomplete first, in sort order".
create index if not exists tasks_user_bucket_idx
  on public.tasks (user_id, bucket, completed_at, sort);

-- This Supabase project does not auto-expose new tables to the Data API roles,
-- so the grant is required in addition to RLS.
grant select, insert, update, delete on public.tasks to authenticated;

create policy "Tasks are selectable by the owner"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Tasks are insertable by the owner"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Tasks are updatable by the owner"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Tasks are deletable by the owner"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Keep updated_at honest on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
