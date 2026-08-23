import "server-only";
import { query, one } from "./db";
import type { Platform } from "./types";

export interface GlobalStats {
  hours: number;
  games: number;
  achievements: number;
  platforms: number;
  perPlatform: Record<string, number>;
  topGames: { title: string; hours: number }[];
  hasData: boolean;
}

const EMPTY: GlobalStats = {
  hours: 0,
  games: 0,
  achievements: 0,
  platforms: 3,
  perPlatform: {},
  topGames: [],
  hasData: false,
};

export async function getGlobalStats(): Promise<GlobalStats> {
  try {
    const totals = await one<{ hours: string; games: string; achievements: string }>(
      `select
         coalesce((select sum(playtime_minutes) from user_games), 0) as hours,
         coalesce((select count(*) from games), 0) as games,
         coalesce((select count(*) from user_achievements where unlocked_at is not null), 0) as achievements`
    );
    const per = await query<{ platform: string; n: string }>(
      `select platform, count(*)::text as n from games group by platform`
    );
    const top = await query<{ name: string; minutes: string }>(
      `select g.name, sum(ug.playtime_minutes)::text as minutes
         from user_games ug join games g on g.id = ug.game_id
        where ug.playtime_minutes > 0
        group by g.name order by sum(ug.playtime_minutes) desc limit 12`
    );
    const perPlatform: Record<string, number> = {};
    for (const row of per) perPlatform[row.platform] = Number(row.n);

    const stats: GlobalStats = {
      hours: Math.round(Number(totals?.hours ?? 0) / 60),
      games: Number(totals?.games ?? 0),
      achievements: Number(totals?.achievements ?? 0),
      platforms: 3,
      perPlatform,
      topGames: top.map((t) => ({
        title: t.name,
        hours: Math.round(Number(t.minutes) / 60),
      })),
      hasData: Number(totals?.games ?? 0) > 0,
    };
    return stats;
  } catch {
    return EMPTY;
  }
}

export interface UserSummary {
  games: number;
  minutes: number;
  achievementsEarned: number;
  achievementsTotal: number;
  completionPct: number;
  rating: number;
  ratingDelta: number;
  percentile: number;
  archetype: string;
  connected: Platform[];
  lastSyncedAt: string | null;
}

/**
 * TRACE Rating: deterministic, transparent, computed only from synced data.
 * Breadth, depth, completion and rarity each contribute; the result is mapped
 * onto a 0–1000 scale so it reads like a rating rather than a percentage.
 */
export async function getUserSummary(userId: string): Promise<UserSummary> {
  const row = await one<{
    games: string;
    minutes: string;
    earned: string;
    total: string;
    rare: string;
    platforms: string;
    last_synced: string | null;
  }>(
    `select
       (select count(*) from user_games where user_id = $1)::text as games,
       (select coalesce(sum(playtime_minutes),0) from user_games where user_id = $1)::text as minutes,
       (select count(*) from user_achievements where user_id = $1 and unlocked_at is not null)::text as earned,
       (select coalesce(sum(achievements_total),0) from user_games where user_id = $1)::text as total,
       (select count(*) from user_achievements ua
          join achievements a on a.id = ua.achievement_id
         where ua.user_id = $1 and ua.unlocked_at is not null and a.rarity_pct is not null and a.rarity_pct < 10)::text as rare,
       (select count(*) from platform_accounts where user_id = $1)::text as platforms,
       (select max(last_synced_at)::text from platform_accounts where user_id = $1) as last_synced`,
    [userId]
  );

  const games = Number(row?.games ?? 0);
  const minutes = Number(row?.minutes ?? 0);
  const earned = Number(row?.earned ?? 0);
  const total = Number(row?.total ?? 0);
  const rare = Number(row?.rare ?? 0);
  const platformCount = Number(row?.platforms ?? 0);

  const hours = minutes / 60;
  const completionPct = total > 0 ? (earned / total) * 100 : 0;

  // Each component is 0–1, saturating so no single dimension can dominate.
  const breadth = sat(games / 220);
  const depth = sat(hours / 3200);
  const completion = sat(completionPct / 85);
  const rarity = sat(rare / 120);
  const reach = sat(platformCount / 3);

  const score =
    breadth * 0.22 + depth * 0.26 + completion * 0.24 + rarity * 0.2 + reach * 0.08;
  const rating = Math.round(120 + score * 880);

  const connectedRows = await query<{ platform: Platform }>(
    `select platform from platform_accounts where user_id = $1 order by platform`,
    [userId]
  );

  return {
    games,
    minutes,
    achievementsEarned: earned,
    achievementsTotal: total,
    completionPct: Math.round(completionPct),
    rating,
    ratingDelta: await ratingDelta(userId, rating),
    percentile: percentileFor(rating),
    archetype: archetypeFor({ breadth, depth, completion, rarity }),
    connected: connectedRows.map((r) => r.platform),
    lastSyncedAt: row?.last_synced ?? null,
  };
}

function sat(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function percentileFor(rating: number): number {
  // Smooth mapping from rating to "top N%" until there is a real population.
  if (rating >= 900) return 1;
  if (rating >= 850) return 4;
  if (rating >= 780) return 9;
  if (rating >= 700) return 18;
  if (rating >= 600) return 32;
  if (rating >= 480) return 50;
  return 72;
}

function archetypeFor(parts: {
  breadth: number;
  depth: number;
  completion: number;
  rarity: number;
}): string {
  const ranked = Object.entries(parts).sort((a, b) => b[1] - a[1]);
  switch (ranked[0][0]) {
    case "breadth":
      return "The Explorer";
    case "depth":
      return "The Devotee";
    case "completion":
      return "The Completionist";
    default:
      return "The Tactician";
  }
}

async function ratingDelta(userId: string, current: number): Promise<number> {
  const prev = await one<{ rating: string }>(
    `select rating::text from rating_history
      where user_id = $1 and captured_at < now() - interval '1 day'
      order by captured_at desc limit 1`,
    [userId]
  ).catch(() => null);
  if (!prev) return 0;
  return current - Number(prev.rating);
}

export interface AttributeScore {
  name: string;
  value: number;
  note: string;
}

const ATTRIBUTE_NOTES: Record<string, string> = {
  Skill: "You consistently outperform in competitive scenarios and high-pressure moments.",
  Mastery: "You tend to develop deep knowledge of the games you spend significant time playing.",
  Versatility: "You adapt well across multiple genres and play styles.",
  Strategy: "Your decision-making reflects strong tactical thinking and long-term planning.",
  Precision: "You consistently perform strongly in accuracy-based gameplay.",
  Completion: "You pursue thorough completion but prioritise quality over sheer volume.",
  Teamwork: "You coordinate effectively and elevate group performance in co-op sessions.",
  Adaptability: "You adjust quickly to new mechanics, metas and unfamiliar game systems.",
  Consistency: "Your performance remains stable across sessions with minimal drop-off.",
};

/** Nine attributes, each derived from a different real signal in the library. */
export async function getAttributes(userId: string): Promise<AttributeScore[]> {
  const s = await one<{
    games: string;
    minutes: string;
    finished: string;
    started: string;
    earned: string;
    rare: string;
    ultra: string;
    platforms: string;
    top_minutes: string;
    active_months: string;
  }>(
    `select
      (select count(*) from user_games where user_id = $1)::text as games,
      (select coalesce(sum(playtime_minutes),0) from user_games where user_id = $1)::text as minutes,
      (select count(*) from user_games where user_id = $1 and completion_pct >= 95)::text as finished,
      (select count(*) from user_games where user_id = $1 and playtime_minutes > 0)::text as started,
      (select count(*) from user_achievements where user_id = $1 and unlocked_at is not null)::text as earned,
      (select count(*) from user_achievements ua join achievements a on a.id = ua.achievement_id
        where ua.user_id = $1 and ua.unlocked_at is not null and a.rarity_pct < 10)::text as rare,
      (select count(*) from user_achievements ua join achievements a on a.id = ua.achievement_id
        where ua.user_id = $1 and ua.unlocked_at is not null and a.rarity_pct < 2)::text as ultra,
      (select count(*) from platform_accounts where user_id = $1)::text as platforms,
      (select coalesce(max(playtime_minutes),0) from user_games where user_id = $1)::text as top_minutes,
      (select count(distinct date_trunc('month', unlocked_at)) from user_achievements
        where user_id = $1 and unlocked_at is not null)::text as active_months`,
    [userId]
  );

  const n = (k: keyof NonNullable<typeof s>) => Number(s?.[k] ?? 0);
  const games = n("games");
  const hours = n("minutes") / 60;
  const started = n("started");
  const finished = n("finished");
  const rare = n("rare");
  const ultra = n("ultra");
  const platforms = n("platforms");
  const topHours = n("top_minutes") / 60;
  const months = n("active_months");

  const scale = (x: number, ceiling: number) =>
    Math.round(Math.max(0, Math.min(1, x / ceiling)) * 100);

  const values: Record<string, number> = {
    Skill: scale(rare * 2 + ultra * 6, 900),
    Mastery: scale(topHours, 700),
    Versatility: scale(started, 140),
    Strategy: scale(hours / Math.max(1, started), 110),
    Precision: scale(ultra, 70),
    Completion: scale(finished / Math.max(1, started), 0.45),
    Teamwork: scale(platforms * 22 + started / 4, 100),
    Adaptability: scale(started - finished, 100),
    Consistency: scale(months, 42),
  };

  return Object.entries(values).map(([name, value]) => ({
    name,
    value: Math.max(games > 0 ? 12 : 0, value),
    note: ATTRIBUTE_NOTES[name],
  }));
}
