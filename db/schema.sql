-- GameVault schema (idempotent)
create extension if not exists "pgcrypto";

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique,
  password_hash text,
  username      text not null unique,
  display_name  text not null,
  avatar_url    text,
  bio           text,
  is_public     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists users_username_lower_idx on users (lower(username));

create table if not exists sessions (
  token_hash text primary key,
  user_id    uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on sessions(user_id);

create table if not exists platform_accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  platform         text not null check (platform in ('steam','psn','xbox')),
  platform_user_id text not null,
  handle           text,
  avatar_url       text,
  profile_url      text,
  secret           text,              -- encrypted credential blob
  last_synced_at   timestamptz,
  sync_status      text not null default 'idle',
  sync_error       text,
  created_at       timestamptz not null default now(),
  unique (user_id, platform),
  unique (platform, platform_user_id)
);

create table if not exists games (
  id               uuid primary key default gen_random_uuid(),
  platform         text not null,
  platform_game_id text not null,
  name             text not null,
  cover_url        text,
  icon_url         text,
  updated_at       timestamptz not null default now(),
  unique (platform, platform_game_id)
);
create index if not exists games_name_idx on games (lower(name));

create table if not exists user_games (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references users(id) on delete cascade,
  game_id              uuid not null references games(id) on delete cascade,
  playtime_minutes     integer not null default 0,
  last_played_at       timestamptz,
  achievements_earned  integer not null default 0,
  achievements_total   integer not null default 0,
  completion_pct       numeric(5,2) not null default 0,
  updated_at           timestamptz not null default now(),
  unique (user_id, game_id)
);
create index if not exists user_games_user_idx on user_games(user_id);
create index if not exists user_games_playtime_idx on user_games(user_id, playtime_minutes desc);

create table if not exists achievements (
  id                      uuid primary key default gen_random_uuid(),
  game_id                 uuid not null references games(id) on delete cascade,
  platform_achievement_id text not null,
  name                    text not null,
  description             text,
  icon_url                text,
  rarity_pct              numeric(6,3),
  points                  integer not null default 0,
  tier                    text,
  unique (game_id, platform_achievement_id)
);
create index if not exists achievements_game_idx on achievements(game_id);

create table if not exists user_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  unlocked_at    timestamptz,
  unique (user_id, achievement_id)
);
create index if not exists user_achievements_user_idx on user_achievements(user_id, unlocked_at desc nulls last);

create table if not exists sync_runs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  platform    text not null,
  status      text not null,
  message     text,
  games       integer not null default 0,
  achievements integer not null default 0,
  started_at  timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists sync_runs_user_idx on sync_runs(user_id, started_at desc);

create table if not exists rating_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  rating      integer not null,
  captured_at timestamptz not null default now()
);
create index if not exists rating_history_user_idx on rating_history(user_id, captured_at desc);

create table if not exists friendships (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  friend_id   uuid not null references users(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','accepted')),
  created_at  timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);
create index if not exists friendships_friend_idx on friendships(friend_id, status);

create table if not exists challenges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  slug        text not null,
  kind        text not null check (kind in ('Daily','Weekly')),
  title       text not null,
  description text not null,
  target      integer not null default 1,
  progress    integer not null default 0,
  xp          integer not null default 0,
  badge       text,
  expires_at  timestamptz not null,
  completed_at timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, slug, expires_at)
);
create index if not exists challenges_user_idx on challenges(user_id, expires_at desc);

create table if not exists xp_ledger (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  amount     integer not null,
  reason     text not null,
  created_at timestamptz not null default now()
);
create index if not exists xp_ledger_user_idx on xp_ledger(user_id, created_at desc);

create table if not exists user_badges (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  slug       text not null,
  name       text not null,
  earned_at  timestamptz not null default now(),
  unique (user_id, slug)
);

-- ---------------------------------------------------------------
-- Row Level Security
--
-- Trace connects to Postgres directly as the owner role, which bypasses RLS.
-- But if this database is hosted on Supabase, every table in the public schema
-- is also reachable through Supabase's REST API using the publishable anon key
-- and that key is public by design. Enabling RLS with no policies denies that path
-- entirely while leaving the app's own direct connection untouched.
-- ---------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'users','sessions','platform_accounts','games','user_games','achievements',
    'user_achievements','sync_runs','rating_history','friendships','challenges',
    'xp_ledger','user_badges'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- The app's connection must be able to bypass RLS. Supabase's `postgres` role
-- and any table owner already can, EXCEPT under `force row level security`,
-- which applies to owners too, so grant the owner an explicit allow-all policy.
do $$
declare t text;
begin
  foreach t in array array[
    'users','sessions','platform_accounts','games','user_games','achievements',
    'user_achievements','sync_runs','rating_history','friendships','challenges',
    'xp_ledger','user_badges'
  ] loop
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'app_owner_all'
    ) then
      execute format(
        'create policy app_owner_all on %I for all to %I using (true) with check (true)',
        t, current_user
      );
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------
-- Privacy preferences (added after the first release)
-- ---------------------------------------------------------------
alter table users add column if not exists show_playtime   boolean not null default true;
alter table users add column if not exists share_activity  boolean not null default true;
