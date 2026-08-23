import "server-only";
import { query, one } from "./db";
import type { Platform, PlatformAccountRow } from "./types";

export interface LibraryRow {
  id: string;
  name: string;
  platform: Platform;
  cover_url: string | null;
  icon_url: string | null;
  playtime_minutes: number;
  completion_pct: number;
  achievements_earned: number;
  achievements_total: number;
  last_played_at: string | null;
}

export async function getLibrary(
  userId: string,
  opts: { platform?: string; search?: string; limit?: number; sort?: string } = {}
): Promise<LibraryRow[]> {
  const params: unknown[] = [userId];
  let where = "ug.user_id = $1";

  if (opts.platform && opts.platform !== "all") {
    params.push(opts.platform);
    where += ` and g.platform = $${params.length}`;
  }
  if (opts.search) {
    params.push(`%${opts.search.toLowerCase()}%`);
    where += ` and lower(g.name) like $${params.length}`;
  }
  if (opts.platform === "unplayed") {
    where = where.replace(" and g.platform = $2", "") + " and ug.playtime_minutes = 0";
  }

  const order =
    opts.sort === "name"
      ? "g.name asc"
      : opts.sort === "completion"
        ? "ug.completion_pct desc, ug.playtime_minutes desc"
        : opts.sort === "recent"
          ? "ug.last_played_at desc nulls last"
          : "ug.playtime_minutes desc";

  params.push(opts.limit ?? 500);

  return query<LibraryRow>(
    `select g.id, g.name, g.platform, g.cover_url, g.icon_url,
            ug.playtime_minutes, ug.completion_pct::float8 as completion_pct,
            ug.achievements_earned, ug.achievements_total, ug.last_played_at::text
       from user_games ug join games g on g.id = ug.game_id
      where ${where}
      order by ${order}
      limit $${params.length}`,
    params
  );
}

export interface AchievementRow {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  rarity_pct: number | null;
  points: number;
  unlocked_at: string | null;
  game_name: string;
  platform: Platform;
}

export async function getRecentAchievements(userId: string, limit = 12): Promise<AchievementRow[]> {
  return query<AchievementRow>(
    `select a.id, a.name, a.description, a.icon_url, a.rarity_pct::float8 as rarity_pct,
            a.points, ua.unlocked_at::text, g.name as game_name, g.platform
       from user_achievements ua
       join achievements a on a.id = ua.achievement_id
       join games g on g.id = a.game_id
      where ua.user_id = $1 and ua.unlocked_at is not null
      order by ua.unlocked_at desc
      limit $2`,
    [userId, limit]
  );
}

export async function getRarestAchievements(userId: string, limit = 6): Promise<AchievementRow[]> {
  return query<AchievementRow>(
    `select a.id, a.name, a.description, a.icon_url, a.rarity_pct::float8 as rarity_pct,
            a.points, ua.unlocked_at::text, g.name as game_name, g.platform
       from user_achievements ua
       join achievements a on a.id = ua.achievement_id
       join games g on g.id = a.game_id
      where ua.user_id = $1 and ua.unlocked_at is not null and a.rarity_pct is not null
      order by a.rarity_pct asc
      limit $2`,
    [userId, limit]
  );
}

export async function getConnections(userId: string): Promise<PlatformAccountRow[]> {
  return query<PlatformAccountRow>(
    `select id, user_id, platform, platform_user_id, handle, avatar_url, profile_url,
            last_synced_at::text, sync_status, sync_error
       from platform_accounts where user_id = $1 order by platform`,
    [userId]
  );
}

export async function getPlatformBreakdown(
  userId: string
): Promise<{ platform: Platform; games: number; minutes: number; earned: number }[]> {
  return query(
    `select g.platform,
            count(*)::int as games,
            coalesce(sum(ug.playtime_minutes),0)::int as minutes,
            coalesce(sum(ug.achievements_earned),0)::int as earned
       from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1
      group by g.platform order by minutes desc`,
    [userId]
  );
}

export async function getUserByUsername(username: string) {
  return one<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
    is_public: boolean;
  }>(
    `select id, username, display_name, avatar_url, bio, is_public
       from users where lower(username) = lower($1)`,
    [username]
  );
}

export async function getXpBalance(userId: string): Promise<number> {
  const row = await one<{ total: string }>(
    `select coalesce(sum(amount),0)::text as total from xp_ledger where user_id = $1`,
    [userId]
  );
  return Number(row?.total ?? 0);
}

export async function getBadges(userId: string) {
  return query<{ slug: string; name: string; earned_at: string }>(
    `select slug, name, earned_at::text from user_badges where user_id = $1 order by earned_at desc`,
    [userId]
  );
}

export async function getFriends(userId: string) {
  return query<{
    id: string;
    username: string;
    display_name: string;
    status: string;
    playing: string | null;
    last_played_at: string | null;
  }>(
    `select u.id, u.username, u.display_name, f.status,
            (select g.name from user_games ug join games g on g.id = ug.game_id
              where ug.user_id = u.id order by ug.last_played_at desc nulls last limit 1) as playing,
            (select max(ug.last_played_at)::text from user_games ug where ug.user_id = u.id) as last_played_at
       from friendships f
       join users u on u.id = case when f.user_id = $1 then f.friend_id else f.user_id end
      where (f.user_id = $1 or f.friend_id = $1) and f.status = 'accepted'
      order by u.display_name`,
    [userId]
  );
}

export async function getFriendRequests(userId: string) {
  return query<{ id: string; username: string; display_name: string; friendship_id: string }>(
    `select u.id, u.username, u.display_name, f.id as friendship_id
       from friendships f join users u on u.id = f.user_id
      where f.friend_id = $1 and f.status = 'pending'
      order by f.created_at desc`,
    [userId]
  );
}
