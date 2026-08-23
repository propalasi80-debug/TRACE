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

export type LibrarySort = "playtime" | "recent" | "name" | "completion";

export interface LibraryFilter {
  /** A platform key, "all", or "unplayed". */
  platform?: string;
  search?: string;
  sort?: string;
  limit?: number;
}

const SORTS: Record<LibrarySort, string> = {
  playtime: "ug.playtime_minutes desc, g.name asc",
  recent: "ug.last_played_at desc nulls last, ug.playtime_minutes desc",
  name: "g.name asc",
  completion: "ug.completion_pct desc, ug.playtime_minutes desc",
};

export function normaliseSort(value: string | undefined): LibrarySort {
  return value && value in SORTS ? (value as LibrarySort) : "playtime";
}

export async function getLibrary(
  userId: string,
  opts: LibraryFilter = {}
): Promise<LibraryRow[]> {
  const params: unknown[] = [userId];
  const where: string[] = ["ug.user_id = $1"];

  const platform = opts.platform ?? "all";
  if (platform === "unplayed") {
    where.push("ug.playtime_minutes = 0");
  } else if (platform !== "all") {
    params.push(platform);
    where.push(`g.platform = $${params.length}`);
  }

  const search = opts.search?.trim();
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    where.push(`lower(g.name) like $${params.length}`);
  }

  params.push(opts.limit ?? 400);

  return query<LibraryRow>(
    `select g.id, g.name, g.platform, g.cover_url, g.icon_url,
            ug.playtime_minutes, ug.completion_pct::float8 as completion_pct,
            ug.achievements_earned, ug.achievements_total, ug.last_played_at::text
       from user_games ug join games g on g.id = ug.game_id
      where ${where.join(" and ")}
      order by ${SORTS[normaliseSort(opts.sort)]}
      limit $${params.length}`,
    params
  );
}

/** Total rows matching a filter, so the UI can show an honest count. */
export async function countLibrary(userId: string, opts: LibraryFilter = {}): Promise<number> {
  const params: unknown[] = [userId];
  const where: string[] = ["ug.user_id = $1"];
  const platform = opts.platform ?? "all";
  if (platform === "unplayed") {
    where.push("ug.playtime_minutes = 0");
  } else if (platform !== "all") {
    params.push(platform);
    where.push(`g.platform = $${params.length}`);
  }
  const search = opts.search?.trim();
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    where.push(`lower(g.name) like $${params.length}`);
  }
  const row = await one<{ n: string }>(
    `select count(*)::text as n from user_games ug join games g on g.id = ug.game_id
      where ${where.join(" and ")}`,
    params
  );
  return Number(row?.n ?? 0);
}

export interface AchievementRow {
  id: string;
  game_id?: string;
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
            a.points, ua.unlocked_at::text, g.name as game_name, g.platform, g.id as game_id
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
            a.points, ua.unlocked_at::text, g.name as game_name, g.platform, g.id as game_id
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
    show_playtime: boolean;
  }>(
    `select id, username, display_name, avatar_url, bio, is_public, show_playtime
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

/* ---------------------------------------------------------------
   Single game
   --------------------------------------------------------------- */

export interface GameDetail extends LibraryRow {
  platform_game_id: string;
}

export async function getGameDetail(userId: string, gameId: string): Promise<GameDetail | null> {
  return one<GameDetail>(
    `select g.id, g.name, g.platform, g.platform_game_id, g.cover_url, g.icon_url,
            ug.playtime_minutes, ug.completion_pct::float8 as completion_pct,
            ug.achievements_earned, ug.achievements_total, ug.last_played_at::text
       from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1 and g.id = $2`,
    [userId, gameId]
  );
}

export interface GameAchievement {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  rarity_pct: number | null;
  points: number;
  tier: string | null;
  unlocked_at: string | null;
}

export async function getGameAchievements(
  userId: string,
  gameId: string
): Promise<GameAchievement[]> {
  return query<GameAchievement>(
    `select a.id, a.name, a.description, a.icon_url, a.rarity_pct::float8 as rarity_pct,
            a.points, a.tier, ua.unlocked_at::text
       from achievements a
       left join user_achievements ua on ua.achievement_id = a.id and ua.user_id = $1
      where a.game_id = $2
      order by (ua.unlocked_at is null), ua.unlocked_at desc nulls last, a.rarity_pct asc nulls last`,
    [userId, gameId]
  );
}

/* ---------------------------------------------------------------
   Achievement browser
   --------------------------------------------------------------- */

export type AchievementSort = "recent" | "rarest" | "game";
export type AchievementState = "unlocked" | "locked";

export interface AchievementFilter {
  state?: string;
  platform?: string;
  rarity?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

const RARITY_BANDS: Record<string, [number, number]> = {
  mythic: [0, 1],
  ultra: [1, 5],
  rare: [5, 15],
  uncommon: [15, 40],
  common: [40, 101],
};

export async function getAchievements(
  userId: string,
  opts: AchievementFilter = {}
): Promise<AchievementRow[]> {
  const locked = opts.state === "locked";
  const params: unknown[] = [userId];
  const where: string[] = [
    "ug.user_id = $1",
    locked ? "ua.unlocked_at is null" : "ua.unlocked_at is not null",
  ];

  if (opts.platform && opts.platform !== "all") {
    params.push(opts.platform);
    where.push(`g.platform = $${params.length}`);
  }

  const band = opts.rarity ? RARITY_BANDS[opts.rarity] : undefined;
  if (band) {
    params.push(band[0], band[1]);
    where.push(`a.rarity_pct >= $${params.length - 1} and a.rarity_pct < $${params.length}`);
  }

  const order = locked
    ? "a.rarity_pct desc nulls last, g.name asc"
    : opts.sort === "rarest"
      ? "a.rarity_pct asc nulls last"
      : opts.sort === "game"
        ? "g.name asc, ua.unlocked_at desc nulls last"
        : "ua.unlocked_at desc nulls last";

  const limit = opts.limit ?? 60;
  params.push(limit, Math.max(0, opts.offset ?? 0));

  return query<AchievementRow>(
    `select a.id, a.name, a.description, a.icon_url, a.rarity_pct::float8 as rarity_pct,
            a.points, ua.unlocked_at::text, g.name as game_name, g.platform, g.id as game_id
       from achievements a
       join games g on g.id = a.game_id
       join user_games ug on ug.game_id = g.id and ug.user_id = $1
       left join user_achievements ua on ua.achievement_id = a.id and ua.user_id = $1
      where ${where.join(" and ")}
      order by ${order}, a.id
      limit $${params.length - 1} offset $${params.length}`,
    params
  );
}

/** How many rows the current filter matches, for pagination. */
export async function countAchievements(
  userId: string,
  opts: AchievementFilter = {}
): Promise<number> {
  const locked = opts.state === "locked";
  const params: unknown[] = [userId];
  const where: string[] = [
    "ug.user_id = $1",
    locked ? "ua.unlocked_at is null" : "ua.unlocked_at is not null",
  ];
  if (opts.platform && opts.platform !== "all") {
    params.push(opts.platform);
    where.push(`g.platform = $${params.length}`);
  }
  const band = opts.rarity ? RARITY_BANDS[opts.rarity] : undefined;
  if (band) {
    params.push(band[0], band[1]);
    where.push(`a.rarity_pct >= $${params.length - 1} and a.rarity_pct < $${params.length}`);
  }
  const row = await one<{ n: string }>(
    `select count(*)::text as n
       from achievements a
       join games g on g.id = a.game_id
       join user_games ug on ug.game_id = g.id and ug.user_id = $1
       left join user_achievements ua on ua.achievement_id = a.id and ua.user_id = $1
      where ${where.join(" and ")}`,
    params
  );
  return Number(row?.n ?? 0);
}

export async function getAchievementCounts(userId: string): Promise<{
  unlocked: number;
  total: number;
  byBand: Record<string, number>;
}> {
  const totals = await one<{ unlocked: string; total: string }>(
    `select
       (select count(*) from user_achievements where user_id = $1 and unlocked_at is not null)::text as unlocked,
       (select coalesce(sum(achievements_total),0) from user_games where user_id = $1)::text as total`,
    [userId]
  );
  const bands = await query<{ band: string; n: string }>(
    `select case
              when a.rarity_pct < 1 then 'mythic'
              when a.rarity_pct < 5 then 'ultra'
              when a.rarity_pct < 15 then 'rare'
              when a.rarity_pct < 40 then 'uncommon'
              else 'common' end as band,
            count(*)::text as n
       from user_achievements ua
       join achievements a on a.id = ua.achievement_id
      where ua.user_id = $1 and ua.unlocked_at is not null and a.rarity_pct is not null
      group by 1`,
    [userId]
  );
  const byBand: Record<string, number> = {};
  for (const b of bands) byBand[b.band] = Number(b.n);
  return {
    unlocked: Number(totals?.unlocked ?? 0),
    total: Number(totals?.total ?? 0),
    byBand,
  };
}
