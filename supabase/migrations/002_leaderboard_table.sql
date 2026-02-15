-- Leaderboard table for storing high scores.
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) as a one-time migration.

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  player_name text not null check (char_length(player_name) between 1 and 30),
  score int not null check (score >= 0),
  mode text not null,
  difficulty int not null check (difficulty between 1 and 10),
  moves int not null,
  time_seconds numeric not null,
  result text not null check (result in ('win', 'loss', 'draw')),
  created_at timestamptz not null default now()
);

-- RLS: public read, public insert, no update/delete.
alter table public.leaderboard enable row level security;

create policy "Anyone can view leaderboard"
  on public.leaderboard
  for select
  using (true);

create policy "Anyone can insert to leaderboard"
  on public.leaderboard
  for insert
  with check (true);
