-- Focus Room: Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. room_updates table
create table room_updates (
  id uuid primary key default gen_random_uuid(),
  room_id text not null default 'default',
  user_id text not null,
  type text not null check (type in ('start', 'progress', 'done', 'idea')),
  text varchar(40) not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 minutes'
);

-- Index for fast room queries
create index idx_room_updates_room_created
  on room_updates (room_id, created_at desc);

-- 2. focus_sessions table
create table focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  started_at timestamptz,
  ended_at timestamptz,
  focus_minutes int,
  created_at timestamptz not null default now()
);

create index idx_focus_sessions_user_created
  on focus_sessions (user_id, created_at desc);

-- 3. Enable Row Level Security (allow all for MVP with anon key)
alter table room_updates enable row level security;
alter table focus_sessions enable row level security;

create policy "Anyone can read room_updates"
  on room_updates for select using (true);

create policy "Anyone can insert room_updates"
  on room_updates for insert with check (true);

create policy "Anyone can read focus_sessions"
  on focus_sessions for select using (true);

create policy "Anyone can insert focus_sessions"
  on focus_sessions for insert with check (true);

-- 4. Enable Realtime for room_updates
alter publication supabase_realtime add table room_updates;
