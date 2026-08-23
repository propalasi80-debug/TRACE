import "server-only";
import { query, one } from "./db";
import { getAttributes } from "./stats";

/* ---------------------------------------------------------------
   Challenges, generated from the player's own library, not canned.
   --------------------------------------------------------------- */

export type ChallengeMetric =
  | "game_achievements"
  | "any_achievements"
  | "game_launched"
  | "game_hours"
  | "games_touched";

export interface ChallengeRow {
  id: string;
  slug: string;
  kind: "Daily" | "Weekly";
  title: string;
  description: string;
  target: number;
  progress: number;
  xp: number;
  badge: string | null;
  metric: ChallengeMetric | null;
  target_game_id: string | null;
  baseline: number;
  expires_at: string;
  completed_at: string | null;
}

const CHALLENGE_COLUMNS = `id, slug, kind, title, description, target, progress, xp, badge,
            metric, target_game_id, baseline, expires_at::text, completed_at::text`;

function endOfDay(): Date {
  const d = new Date();
  d.setUTCHours(23, 59, 59, 0);
  return d;
}

function endOfWeek(): Date {
  const d = new Date();
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + ((7 - day) % 7 || 7));
  d.setUTCHours(23, 59, 59, 0);
  return d;
}

async function listChallenges(userId: string): Promise<ChallengeRow[]> {
  return query<ChallengeRow>(
    `select ${CHALLENGE_COLUMNS}
       from challenges where user_id = $1 and expires_at > now()
      order by (completed_at is not null), kind, xp desc`,
    [userId]
  );
}

interface Draft {
  slug: string;
  kind: "Daily" | "Weekly";
  title: string;
  description: string;
  target: number;
  xp: number;
  badge: string | null;
  metric: ChallengeMetric;
  targetGameId: string | null;
  baseline: number;
  expiresAt: string;
}

export async function ensureChallenges(userId: string): Promise<ChallengeRow[]> {
  const existing = await listChallenges(userId);
  if (existing.length > 0) return existing;

  const day = endOfDay().toISOString();
  const week = endOfWeek().toISOString();
  const drafts: Draft[] = [];

  const nearMiss = await one<{ id: string; name: string; earned: number; total: number }>(
    `select g.id, g.name, ug.achievements_earned as earned, ug.achievements_total as total
       from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1 and ug.achievements_total > 0
        and ug.achievements_earned < ug.achievements_total
        and ug.completion_pct >= 70
      order by ug.completion_pct desc limit 1`,
    [userId]
  );
  if (nearMiss) {
    const left = nearMiss.total - nearMiss.earned;
    drafts.push({
      slug: "closer",
      kind: "Daily",
      title: "Closer",
      description: `You are ${left} achievement${left === 1 ? "" : "s"} from finishing ${nearMiss.name}. Take one of them today.`,
      target: 1,
      xp: 220,
      badge: null,
      metric: "game_achievements",
      targetGameId: nearMiss.id,
      baseline: nearMiss.earned,
      expiresAt: day,
    });
  }

  const untouched = await one<{ id: string; name: string }>(
    `select g.id, g.name from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1 and ug.playtime_minutes = 0
      order by random() limit 1`,
    [userId]
  );
  if (untouched) {
    drafts.push({
      slug: "cold-start",
      kind: "Daily",
      title: "Cold Start",
      description: `Launch ${untouched.name} for the first time. It has been sitting in your library unplayed.`,
      target: 1,
      xp: 150,
      badge: null,
      metric: "game_launched",
      targetGameId: untouched.id,
      baseline: 0,
      expiresAt: day,
    });
  }

  const dusty = await one<{ id: string; name: string; minutes: number }>(
    `select g.id, g.name, ug.playtime_minutes as minutes
       from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1 and ug.playtime_minutes > 120
        and (ug.last_played_at is null or ug.last_played_at < now() - interval '180 days')
      order by ug.playtime_minutes desc limit 1`,
    [userId]
  );
  if (dusty) {
    drafts.push({
      slug: "long-haul",
      kind: "Weekly",
      title: "Long Haul",
      description: `Put six hours back into ${dusty.name}. You have not touched it in months.`,
      target: 6,
      xp: 600,
      badge: "Marathon",
      metric: "game_hours",
      targetGameId: dusty.id,
      baseline: dusty.minutes,
      expiresAt: week,
    });
  }

  const totals = await one<{ earned: string; touched: string }>(
    `select
       (select count(*) from user_achievements where user_id = $1 and unlocked_at is not null)::text as earned,
       (select count(*) from user_games where user_id = $1 and playtime_minutes > 0)::text as touched`,
    [userId]
  );

  drafts.push({
    slug: "clean-sweep",
    kind: "Weekly",
    title: "Clean Sweep",
    description: "Unlock five achievements across any connected platform.",
    target: 5,
    xp: 520,
    badge: "Specialist",
    metric: "any_achievements",
    targetGameId: null,
    baseline: Number(totals?.earned ?? 0),
    expiresAt: week,
  });

  drafts.push({
    slug: "second-opinion",
    kind: "Weekly",
    title: "Second Opinion",
    description: "Start two games you have never played before.",
    target: 2,
    xp: 450,
    badge: null,
    metric: "games_touched",
    targetGameId: null,
    baseline: Number(totals?.touched ?? 0),
    expiresAt: week,
  });

  for (const d of drafts) {
    await query(
      `insert into challenges
         (user_id, slug, kind, title, description, target, xp, badge, metric, target_game_id, baseline, expires_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       on conflict (user_id, slug, expires_at) do nothing`,
      [userId, d.slug, d.kind, d.title, d.description, d.target, d.xp, d.badge,
       d.metric, d.targetGameId, d.baseline, d.expiresAt]
    );
  }

  return listChallenges(userId);
}

/** Where a challenge's metric stands right now. */
async function currentValue(userId: string, c: ChallengeRow): Promise<number> {
  switch (c.metric) {
    case "game_achievements": {
      if (!c.target_game_id) return 0;
      const r = await one<{ n: string }>(
        `select coalesce(achievements_earned, 0)::text as n from user_games
          where user_id = $1 and game_id = $2`,
        [userId, c.target_game_id]
      );
      return Number(r?.n ?? 0);
    }
    case "game_hours": {
      if (!c.target_game_id) return 0;
      const r = await one<{ n: string }>(
        `select coalesce(playtime_minutes, 0)::text as n from user_games
          where user_id = $1 and game_id = $2`,
        [userId, c.target_game_id]
      );
      return Number(r?.n ?? 0);
    }
    case "game_launched": {
      if (!c.target_game_id) return 0;
      const r = await one<{ n: string }>(
        `select (playtime_minutes > 0)::int::text as n from user_games
          where user_id = $1 and game_id = $2`,
        [userId, c.target_game_id]
      );
      return Number(r?.n ?? 0);
    }
    case "any_achievements": {
      const r = await one<{ n: string }>(
        `select count(*)::text as n from user_achievements
          where user_id = $1 and unlocked_at is not null`,
        [userId]
      );
      return Number(r?.n ?? 0);
    }
    case "games_touched": {
      const r = await one<{ n: string }>(
        `select count(*)::text as n from user_games
          where user_id = $1 and playtime_minutes > 0`,
        [userId]
      );
      return Number(r?.n ?? 0);
    }
    default:
      return 0;
  }
}

/** Convert a raw metric reading into progress against the challenge target. */
function toProgress(c: ChallengeRow, value: number): number {
  const delta = value - c.baseline;
  if (c.metric === "game_hours") return Math.max(0, Math.floor(delta / 60));
  if (c.metric === "game_launched") return Math.max(0, Math.min(1, value));
  return Math.max(0, delta);
}

export interface ChallengeOutcome {
  completed: string[];
  xpAwarded: number;
}

/**
 * Re-measure every open challenge. Called after a sync, because a sync is the
 * only moment TRACE learns anything new about what was played.
 */
export async function evaluateChallenges(userId: string): Promise<ChallengeOutcome> {
  const open = await query<ChallengeRow>(
    `select ${CHALLENGE_COLUMNS}
       from challenges
      where user_id = $1 and expires_at > now() and completed_at is null and metric is not null`,
    [userId]
  );

  const completed: string[] = [];
  let xpAwarded = 0;

  for (const c of open) {
    const progress = Math.min(c.target, toProgress(c, await currentValue(userId, c)));
    if (progress === c.progress) continue;

    const done = progress >= c.target;
    await query(
      `update challenges set progress = $2, completed_at = case when $3 then now() else null end
        where id = $1`,
      [c.id, progress, done]
    );

    if (done) {
      completed.push(c.title);
      xpAwarded += c.xp;
      await query(`insert into xp_ledger (user_id, amount, reason) values ($1,$2,$3)`, [
        userId,
        c.xp,
        `Challenge complete: ${c.title}`,
      ]);
      if (c.badge) {
        await query(
          `insert into user_badges (user_id, slug, name) values ($1,$2,$3)
           on conflict (user_id, slug) do nothing`,
          [userId, c.badge.toLowerCase().replace(/[^a-z0-9]+/g, "-"), c.badge]
        );
      }
    }
  }

  return { completed, xpAwarded };
}

/* ---------------------------------------------------------------
   Milestones, awarded from real totals rather than displayed live.
   --------------------------------------------------------------- */

export interface MilestoneDef {
  slug: string;
  name: string;
  requirement: string;
  /** Current value and the value needed, from a user's summary. */
  read: (s: MilestoneInput) => { current: number; target: number };
}

export interface MilestoneInput {
  games: number;
  hours: number;
  achievements: number;
  completionPct: number;
}

export const MILESTONES: MilestoneDef[] = [
  { slug: "first-light", name: "First Light", requirement: "Sync your first platform",
    read: (s) => ({ current: s.games > 0 ? 1 : 0, target: 1 }) },
  { slug: "collector", name: "Collector", requirement: "50 games in your library",
    read: (s) => ({ current: s.games, target: 50 }) },
  { slug: "archivist", name: "Archivist", requirement: "250 games in your library",
    read: (s) => ({ current: s.games, target: 250 }) },
  { slug: "marathon", name: "Marathon", requirement: "1,000 hours played",
    read: (s) => ({ current: s.hours, target: 1000 }) },
  { slug: "decade", name: "Decade", requirement: "4,000 hours played",
    read: (s) => ({ current: s.hours, target: 4000 }) },
  { slug: "specialist", name: "Specialist", requirement: "500 achievements",
    read: (s) => ({ current: s.achievements, target: 500 }) },
  { slug: "completionist", name: "Completionist", requirement: "60% average completion",
    read: (s) => ({ current: s.completionPct, target: 60 }) },
  { slug: "perfectionist", name: "Perfectionist", requirement: "85% average completion",
    read: (s) => ({ current: s.completionPct, target: 85 }) },
];

/** Write newly reached milestones so their earned date is real, not inferred. */
export async function awardMilestones(userId: string, input: MilestoneInput): Promise<string[]> {
  const awarded: string[] = [];
  for (const m of MILESTONES) {
    const { current, target } = m.read(input);
    if (current < target) continue;
    const row = await one<{ slug: string }>(
      `insert into user_badges (user_id, slug, name) values ($1,$2,$3)
       on conflict (user_id, slug) do nothing returning slug`,
      [userId, m.slug, m.name]
    );
    if (row) awarded.push(m.name);
  }
  return awarded;
}

/* ---------------------------------------------------------------
   Suggestions: a curated catalogue scored against real attributes.
   --------------------------------------------------------------- */

interface CatalogEntry {
  title: string;
  platform: string;
  genre: string;
  tags: string[];
  weights: Partial<Record<string, number>>;
  why: string;
  hours: number;
}

const CATALOG: CatalogEntry[] = [
  { title: "Sekiro: Shadows Die Twice", platform: "Steam", genre: "Action", tags: ["Action"], hours: 40,
    weights: { Precision: 1, Skill: 0.9, Mastery: 0.7 },
    why: "Deflect-timing combat that rewards mastery over grinding. Your precision and skill scores are the two this leans on hardest." },
  { title: "Returnal", platform: "PlayStation", genre: "Roguelike Shooter", tags: ["Roguelike"], hours: 30,
    weights: { Adaptability: 1, Consistency: 0.8, Precision: 0.6 },
    why: "Every run resets the board. Your adaptability score suggests you recover from a bad start faster than most." },
  { title: "Hollow Knight: Silksong", platform: "Steam", genre: "Metroidvania", tags: ["Metroidvania"], hours: 35,
    weights: { Completion: 1, Mastery: 0.7, Versatility: 0.4 },
    why: "A map that rewards thorough sweeps. Fits the way your completion score already trends." },
  { title: "Deep Rock Galactic", platform: "Steam", genre: "Co-op Shooter", tags: ["Co-op"], hours: 60,
    weights: { Teamwork: 1, Consistency: 0.6 },
    why: "Your teamwork score is your most underused strength, and this is the cheapest way to exercise it." },
  { title: "Into the Breach", platform: "Steam", genre: "Tactics", tags: ["Under 20 hours"], hours: 15,
    weights: { Strategy: 1, Precision: 0.5 },
    why: "Perfect-information tactics in twenty-minute runs. Straight at your strategy score, and short enough to actually finish." },
  { title: "Nine Sols", platform: "Steam", genre: "Action Platformer", tags: ["Action", "Metroidvania"], hours: 25,
    weights: { Precision: 0.9, Completion: 0.6, Mastery: 0.5 },
    why: "Deflect-heavy combat in a tight 25-hour run. It suits the way you finish games you commit to." },
  { title: "Outer Wilds", platform: "Steam", genre: "Exploration", tags: ["Under 20 hours"], hours: 20,
    weights: { Versatility: 0.8, Strategy: 0.7, Adaptability: 0.6 },
    why: "No upgrades, only understanding. It rewards curiosity and lateral thinking over reflexes." },
  { title: "Forza Horizon 5", platform: "Xbox", genre: "Racing", tags: ["Action"], hours: 50,
    weights: { Precision: 0.8, Consistency: 0.7 },
    why: "Low friction, high consistency progression. Good for keeping a streak alive between heavier games." },
  { title: "Hades II", platform: "Steam", genre: "Roguelike", tags: ["Roguelike", "Action"], hours: 45,
    weights: { Adaptability: 0.9, Mastery: 0.8, Consistency: 0.6 },
    why: "Build variety that punishes rigid play. Your adaptability and mastery both feed directly into how fast this opens up." },
  { title: "Baldur's Gate 3", platform: "Steam", genre: "CRPG", tags: ["Co-op"], hours: 120,
    weights: { Strategy: 1, Versatility: 0.8, Completion: 0.5 },
    why: "The deepest strategy sandbox on this list, and it scales with how much systems-thinking you bring to it." },
];

export interface Recommendation {
  title: string;
  meta: string;
  match: number;
  why: string;
  tags: string[];
}

export async function getRecommendations(userId: string, limit = 6): Promise<Recommendation[]> {
  const attrs = await getAttributes(userId);
  const byName = new Map(attrs.map((a) => [a.name, a.value]));

  const owned = await query<{ name: string }>(
    `select lower(g.name) as name from user_games ug join games g on g.id = ug.game_id where ug.user_id = $1`,
    [userId]
  );
  const ownedSet = new Set(owned.map((o) => o.name));

  const scored = CATALOG.filter((c) => !ownedSet.has(c.title.toLowerCase())).map((c) => {
    let num = 0;
    let den = 0;
    for (const [attr, w] of Object.entries(c.weights)) {
      num += (byName.get(attr) ?? 40) * (w ?? 0);
      den += (w ?? 0);
    }
    const base = den > 0 ? num / den : 40;
    // Compress into a believable 62–97 match band.
    const match = Math.round(62 + (base / 100) * 35);
    return { title: c.title, meta: `${c.platform} · ${c.genre}`, match, why: c.why, tags: c.tags };
  });

  return scored.sort((a, b) => b.match - a.match).slice(0, limit);
}
