-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) as a one-time migration.

-- Games table: one row per saved game (one current game per user with upsert by user_id).
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  state jsonb not null,
  mode text not null,
  difficulty int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- RLS: users can only access their own games.
alter table public.games enable row level security;

create policy "Users can do everything on own games"
  on public.games
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists games_updated_at on public.games;
create trigger games_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();
