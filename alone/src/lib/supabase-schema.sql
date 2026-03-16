-- Alone: Supabase Schema

-- Profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Statuses (real-time work status)
create table if not exists statuses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null check (char_length(content) <= 100),
  started_at timestamptz default now(),
  ended_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table statuses enable row level security;

create policy "Statuses are viewable by everyone"
  on statuses for select using (true);

create policy "Users can insert own status"
  on statuses for insert with check (auth.uid() = user_id);

create policy "Users can update own status"
  on statuses for update using (auth.uid() = user_id);

-- Follows (one-directional, Twitter-style)
create table if not exists follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

alter table follows enable row level security;

create policy "Follows are viewable by everyone"
  on follows for select using (true);

create policy "Users can follow others"
  on follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete using (auth.uid() = follower_id);

-- Stories (24-hour ephemeral posts)
create table if not exists stories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null check (char_length(content) <= 200),
  image_url text,
  expires_at timestamptz default now() + interval '24 hours',
  created_at timestamptz default now()
);

alter table stories enable row level security;

create policy "Active stories are viewable by everyone"
  on stories for select using (expires_at > now());

create policy "Users can insert own story"
  on stories for insert with check (auth.uid() = user_id);

-- Work Together Requests
create table if not exists work_together_requests (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  status_id uuid references statuses(id) on delete cascade not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table work_together_requests enable row level security;

create policy "Users can see their own requests"
  on work_together_requests for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send requests"
  on work_together_requests for insert
  with check (auth.uid() = sender_id);

create policy "Receiver can update request"
  on work_together_requests for update
  using (auth.uid() = receiver_id);

-- Enable realtime for statuses and stories
alter publication supabase_realtime add table statuses;
alter publication supabase_realtime add table stories;
alter publication supabase_realtime add table work_together_requests;

-- Index for performance
create index if not exists idx_statuses_user_active on statuses(user_id, is_active) where is_active = true;
create index if not exists idx_follows_follower on follows(follower_id);
create index if not exists idx_follows_following on follows(following_id);
create index if not exists idx_stories_expires on stories(expires_at) where expires_at > now();
