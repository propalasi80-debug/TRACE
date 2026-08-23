import "server-only";
import { query, one, pool } from "./db";
import { decrypt, encrypt } from "./crypto";
import type { Platform, SyncAchievement, SyncGame } from "./types";
import * as steam from "./platforms/steam";
import * as psn from "./platforms/psn";
import * as xbox from "./platforms/xbox";

export interface SyncResult {
  platform: Platform;
  games: number;
  achievements: number;
  remaining: number;
  message: string;
}

/** How many games get their achievement list pulled per sync pass. */
const ACH_BATCH: Record<Platform, number> = { steam: 25, psn: 12, xbox: 10 };

async function upsertGames(platform: Platform, games: SyncGame[]): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  if (games.length === 0) return ids;

  const client = await pool().connect();
  try {
    await client.query("begin");
    for (const g of games) {
      const res = await client.query<{ id: string }>(
        `insert into games (platform, platform_game_id, name, cover_url, icon_url, updated_at)
         values ($1,$2,$3,$4,$5, now())
         on conflict (platform, platform_game_id)
         do update set name = excluded.name,
                       cover_url = coalesce(excluded.cover_url, games.cover_url),
                       icon_url = coalesce(excluded.icon_url, games.icon_url),
                       updated_at = now()
         returning id`,
        [platform, g.platformGameId, g.name, g.coverUrl ?? null, g.iconUrl ?? null]
      );
      ids.set(g.platformGameId, res.rows[0].id);
    }
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
  return ids;
}

async function upsertUserGames(
  userId: string,
  games: SyncGame[],
  ids: Map<string, string>
): Promise<void> {
  const client = await pool().connect();
  try {
    await client.query("begin");
    for (const g of games) {
      const gameId = ids.get(g.platformGameId);
      if (!gameId) continue;
      await client.query(
        `insert into user_games (user_id, game_id, playtime_minutes, last_played_at, updated_at)
         values ($1,$2,$3,$4, now())
         on conflict (user_id, game_id)
         do update set playtime_minutes = greatest(user_games.playtime_minutes, excluded.playtime_minutes),
                       last_played_at = coalesce(excluded.last_played_at, user_games.last_played_at),
                       updated_at = now()`,
        [userId, gameId, Math.max(0, Math.round(g.playtimeMinutes ?? 0)), g.lastPlayedAt ?? null]
      );
    }
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

async function writeAchievements(
  userId: string,
  gameId: string,
  list: SyncAchievement[]
): Promise<number> {
  if (list.length === 0) {
    await query(
      `update user_games set achievements_total = 0, achievements_earned = 0,
              completion_pct = 0, updated_at = now()
        where user_id = $1 and game_id = $2`,
      [userId, gameId]
    );
    return 0;
  }

  const client = await pool().connect();
  let earned = 0;
  try {
    await client.query("begin");
    for (const a of list) {
      const res = await client.query<{ id: string }>(
        `insert into achievements (game_id, platform_achievement_id, name, description, icon_url, rarity_pct, points, tier)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         on conflict (game_id, platform_achievement_id)
         do update set name = excluded.name,
                       description = coalesce(excluded.description, achievements.description),
                       icon_url = coalesce(excluded.icon_url, achievements.icon_url),
                       rarity_pct = coalesce(excluded.rarity_pct, achievements.rarity_pct),
                       points = greatest(excluded.points, achievements.points)
         returning id`,
        [
          gameId,
          a.platformAchievementId,
          a.name,
          a.description ?? null,
          a.iconUrl ?? null,
          a.rarityPct ?? null,
          a.points ?? 0,
          a.tier ?? null,
        ]
      );
      const achievementId = res.rows[0].id;
      if (a.unlocked) {
        earned++;
        await client.query(
          `insert into user_achievements (user_id, achievement_id, unlocked_at)
           values ($1,$2,$3)
           on conflict (user_id, achievement_id)
           do update set unlocked_at = coalesce(excluded.unlocked_at, user_achievements.unlocked_at)`,
          [userId, achievementId, a.unlockedAt ?? null]
        );
      }
    }
    await client.query(
      `update user_games set achievements_total = $3, achievements_earned = $4,
              completion_pct = case when $3 > 0 then round(($4::numeric / $3) * 100, 2) else 0 end,
              updated_at = now()
        where user_id = $1 and game_id = $2`,
      [userId, gameId, list.length, earned]
    );
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
  return earned;
}

/** Games that still need an achievement pass, most-played first. */
async function staleGames(
  userId: string,
  platform: Platform,
  limit: number
): Promise<{ game_id: string; platform_game_id: string }[]> {
  return query(
    `select ug.game_id, g.platform_game_id
       from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1 and g.platform = $2
        and (ug.updated_at < now() - interval '20 hours' or ug.achievements_total = 0)
      order by ug.playtime_minutes desc, ug.last_played_at desc nulls last
      limit $3`,
    [userId, platform, limit]
  );
}

async function remainingCount(userId: string, platform: Platform): Promise<number> {
  const row = await one<{ n: string }>(
    `select count(*)::text as n from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1 and g.platform = $2
        and (ug.updated_at < now() - interval '20 hours' or ug.achievements_total = 0)`,
    [userId, platform]
  );
  return Number(row?.n ?? 0);
}

export async function syncPlatform(userId: string, platform: Platform): Promise<SyncResult> {
  const account = await one<{
    id: string;
    platform_user_id: string;
    secret: string | null;
  }>(
    `select id, platform_user_id, secret from platform_accounts where user_id = $1 and platform = $2`,
    [userId, platform]
  );
  if (!account) throw new Error(`No ${platform} account is linked.`);

  const run = await one<{ id: string }>(
    `insert into sync_runs (user_id, platform, status) values ($1,$2,'running') returning id`,
    [userId, platform]
  );
  await query(
    `update platform_accounts set sync_status = 'syncing', sync_error = null where id = $1`,
    [account.id]
  );

  try {
    let result: SyncResult;
    if (platform === "steam") result = await syncSteam(userId, account.platform_user_id);
    else if (platform === "psn") result = await syncPsn(userId, account.id, account.secret);
    else result = await syncXbox(userId, account.platform_user_id, account.secret);

    await query(
      `update platform_accounts set sync_status = 'idle', sync_error = null, last_synced_at = now() where id = $1`,
      [account.id]
    );
    await query(
      `update sync_runs set status = 'ok', finished_at = now(), games = $2, achievements = $3, message = $4 where id = $1`,
      [run?.id, result.games, result.achievements, result.message]
    );
    await recordRating(userId);
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await query(
      `update platform_accounts set sync_status = 'error', sync_error = $2 where id = $1`,
      [account.id, message.slice(0, 400)]
    );
    await query(
      `update sync_runs set status = 'error', finished_at = now(), message = $2 where id = $1`,
      [run?.id, message.slice(0, 400)]
    );
    throw err;
  }
}

async function syncSteam(userId: string, steamId: string): Promise<SyncResult> {
  const owned = await steam.fetchOwnedGames(steamId);
  const ids = await upsertGames("steam", owned);
  await upsertUserGames(userId, owned, ids);

  const batch = await staleGames(userId, "steam", ACH_BATCH.steam);
  const lists = await steam.fetchAchievementsForGames(
    steamId,
    batch.map((b) => b.platform_game_id)
  );

  let achievements = 0;
  for (const b of batch) {
    achievements += await writeAchievements(userId, b.game_id, lists.get(b.platform_game_id) ?? []);
  }

  const remaining = await remainingCount(userId, "steam");
  return {
    platform: "steam",
    games: owned.length,
    achievements,
    remaining,
    message:
      remaining > 0
        ? `${owned.length} games synced. ${remaining} still need achievements. Run sync again.`
        : `${owned.length} games synced and fully up to date.`,
  };
}

async function syncPsn(userId: string, accountRowId: string, secret: string | null): Promise<SyncResult> {
  if (!secret) throw new Error("PSN credentials are missing. Reconnect your account.");
  let creds = JSON.parse(decrypt(secret)) as psn.PsnCredentials;
  const refreshed = await psn.refreshIfNeeded(creds);
  if (refreshed.accessToken !== creds.accessToken) {
    creds = refreshed;
    await query(`update platform_accounts set secret = $2 where id = $1`, [
      accountRowId,
      encrypt(JSON.stringify(creds)),
    ]);
  }

  const titles = await psn.fetchPsnTitles(creds);
  const ids = await upsertGames("psn", titles);
  await upsertUserGames(userId, titles, ids);

  const serviceByGameId = new Map(titles.map((t) => [t.platformGameId, t.npServiceName]));
  const batch = await staleGames(userId, "psn", ACH_BATCH.psn);

  let achievements = 0;
  for (const b of batch) {
    try {
      const list = await psn.fetchPsnTrophies(
        creds,
        b.platform_game_id,
        serviceByGameId.get(b.platform_game_id) ?? "trophy2"
      );
      achievements += await writeAchievements(userId, b.game_id, list);
    } catch {
      await writeAchievements(userId, b.game_id, []);
    }
  }

  const remaining = await remainingCount(userId, "psn");
  return {
    platform: "psn",
    games: titles.length,
    achievements,
    remaining,
    message:
      remaining > 0
        ? `${titles.length} titles synced. ${remaining} still need trophies. Run sync again.`
        : `${titles.length} titles synced and fully up to date.`,
  };
}

async function syncXbox(userId: string, xuid: string, secret: string | null): Promise<SyncResult> {
  if (!secret) throw new Error("Xbox API key is missing. Reconnect your account.");
  const apiKey = decrypt(secret);

  const titles = await xbox.fetchXboxTitles(apiKey, xuid);
  const ids = await upsertGames("xbox", titles);
  await upsertUserGames(userId, titles, ids);

  const batch = await staleGames(userId, "xbox", ACH_BATCH.xbox);
  let achievements = 0;
  for (const b of batch) {
    try {
      const list = await xbox.fetchXboxAchievements(apiKey, xuid, b.platform_game_id);
      achievements += await writeAchievements(userId, b.game_id, list);
    } catch {
      await writeAchievements(userId, b.game_id, []);
    }
  }

  const remaining = await remainingCount(userId, "xbox");
  return {
    platform: "xbox",
    games: titles.length,
    achievements,
    remaining,
    message:
      remaining > 0
        ? `${titles.length} titles synced. ${remaining} still need achievements. Run sync again.`
        : `${titles.length} titles synced and fully up to date.`,
  };
}

/** Snapshot the rating once a day so deltas mean something. */
async function recordRating(userId: string): Promise<void> {
  const { getUserSummary } = await import("./stats");
  const summary = await getUserSummary(userId);
  const last = await one<{ captured_at: string }>(
    `select captured_at::text from rating_history where user_id = $1 order by captured_at desc limit 1`,
    [userId]
  );
  const stale = !last || Date.now() - new Date(last.captured_at).getTime() > 20 * 3600 * 1000;
  if (stale) {
    await query(`insert into rating_history (user_id, rating) values ($1,$2)`, [
      userId,
      summary.rating,
    ]);
  }
}
