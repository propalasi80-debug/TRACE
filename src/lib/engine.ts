import "server-only";
import { query, one } from "./db";
import { getAttributes } from "./stats";

/* ---------------------------------------------------------------
   Challenges — generated from the player's own library, not canned.
   --------------------------------------------------------------- */

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
  expires_at: string;
  completed_at: string | null;
}

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

export async function ensureChallenges(userId: string): Promise<ChallengeRow[]> {
  const existing = await query<ChallengeRow>(
    `select id, slug, kind, title, description, target, progress, xp, badge,
            expires_at::text, completed_at::text
       from challenges where user_id = $1 and expires_at > now()
      order by kind, xp desc`,
    [userId]
  );
  if (existing.length > 0) return existing;

  const nearMiss = await one<{ name: string; earned: number; total: number }>(
    `select g.name, ug.achievements_earned as earned, ug.achievements_total as total
       from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1 and ug.achievements_total > 0
        and ug.achievements_earned < ug.achievements_total
        and ug.completion_pct >= 70
      order by ug.completion_pct desc limit 1`,
    [userId]
  );

  const dusty = await one<{ name: string }>(
    `select g.name from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1 and ug.playtime_minutes > 120
        and (ug.last_played_at is null or ug.last_played_at < now() - interval '180 days')
      order by ug.playtime_minutes desc limit 1`,
    [userId]
  );

  const untouched = await one<{ name: string }>(
    `select g.name from user_games ug join games g on g.id = ug.game_id
      where ug.user_id = $1 and ug.playtime_minutes = 0
      order by random() limit 1`,
    [userId]
  );

  const drafts: Omit<ChallengeRow, "id" | "progress" | "completed_at">[] = [];
  const day = endOfDay().toISOString();
  const week = endOfWeek().toISOString();

  if (nearMiss) {
    drafts.push({
      slug: "closer",
      kind: "Daily",
      title: "Closer",
      description: `You are ${nearMiss.total - nearMiss.earned} achievement${
        nearMiss.total - nearMiss.earned === 1 ? "" : "s"
      } from finishing ${nearMiss.name}. Take one of them today.`,
      target: 1,
      xp: 220,
      badge: null,
      expires_at: day,
    });
  }
  if (untouched) {
    drafts.push({
      slug: "cold-start",
      kind: "Daily",
      title: "Cold Start",
      description: `Launch ${untouched.name} for the first time. It has been sitting in your library unplayed.`,
      target: 1,
      xp: 150,
      badge: null,
      expires_at: day,
    });
  }
  if (dusty) {
    drafts.push({
      slug: "long-haul",
      kind: "Weekly",
      title: "Long Haul",
      description: `Put six hours back into ${dusty.name}. You have not touched it in months.`,
      target: 6,
      xp: 600,
      badge: "Marathon",
      expires_at: week,
    });
  }
  drafts.push({
    slug: "second-opinion",
    kind: "Weekly",
    title: "Second Opinion",
    description: "Play two games from your Suggestions list this week.",
    target: 2,
    xp: 450,
    badge: null,
    expires_at: week,
  });
  drafts.push({
    slug: "clean-sweep",
    kind: "Weekly",
    title: "Clean Sweep",
    description: "Unlock five achievements across any connected platform.",
    target: 5,
    xp: 520,
    badge: "Specialist",
    expires_at: week,
  });

  for (const d of drafts) {
    await query(
      `insert into challenges (user_id, slug, kind, title, description, target, xp, badge, expires_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (user_id, slug, expires_at) do nothing`,
      [userId, d.slug, d.kind, d.title, d.description, d.target, d.xp, d.badge, d.expires_at]
    );
  }

  return query<ChallengeRow>(
    `select id, slug, kind, title, description, target, progress, xp, badge,
            expires_at::text, completed_at::text
       from challenges where user_id = $1 and expires_at > now()
      order by kind, xp desc`,
    [userId]
  );
}

/* ---------------------------------------------------------------
   Suggestions — a curated catalogue scored against real attributes.
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
    why: "Your teamwork score is your most underused strength — this is the cheapest way to exercise it." },
  { title: "Into the Breach", platform: "Steam", genre: "Tactics", tags: ["Under 20 hours"], hours: 15,
    weights: { Strategy: 1, Precision: 0.5 },
    why: "Perfect-information tactics in twenty-minute runs. Straight at your strategy score, and short enough to actually finish." },
  { title: "Nine Sols", platform: "Steam", genre: "Action Platformer", tags: ["Action", "Metroidvania"], hours: 25,
    weights: { Precision: 0.9, Completion: 0.6, Mastery: 0.5 },
    why: "Deflect-heavy combat in a tight 25-hour run — suits the way you finish games you commit to." },
  { title: "Outer Wilds", platform: "Steam", genre: "Exploration", tags: ["Under 20 hours"], hours: 20,
    weights: { Versatility: 0.8, Strategy: 0.7, Adaptability: 0.6 },
    why: "No upgrades, only understanding. It rewards curiosity and lateral thinking over reflexes." },
  { title: "Forza Horizon 5", platform: "Xbox", genre: "Racing", tags: ["Action"], hours: 50,
    weights: { Precision: 0.8, Consistency: 0.7 },
    why: "Low-friction, high-consistency progression — good for keeping a streak alive between heavier games." },
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
