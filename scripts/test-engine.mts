/**
 * Behaviour test for the challenge and milestone engine.
 *
 * Needs a throwaway Postgres, because the whole point is to prove progress
 * moves against real rows. It truncates users and games, so never point it at
 * anything you care about.
 *
 *   npm run test:engine
 */
import pg from "pg";
import { ensureChallenges, evaluateChallenges, awardMilestones } from "../src/lib/engine";
import { query, one } from "../src/lib/db";

const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
await c.connect();
await c.query("truncate users, games cascade");

const { rows: [u] } = await c.query(
  `insert into users (email, username, display_name) values ('t@e.com','tester','Tester') returning id`);
const uid = u.id as string;
await c.query(`insert into platform_accounts (user_id, platform, platform_user_id) values ($1,'steam','x')`, [uid]);

// one nearly-finished game, one untouched game, one dusty game
const mk = async (name: string, minutes: number, earned: number, total: number, daysAgo: number) => {
  const { rows: [g] } = await c.query(
    `insert into games (platform, platform_game_id, name) values ('steam',$1,$2) returning id`, [name, name]);
  await c.query(
    `insert into user_games (user_id, game_id, playtime_minutes, last_played_at, achievements_earned, achievements_total, completion_pct)
     values ($1,$2,$3, now() - ($4 || ' days')::interval, $5,$6,$7)`,
    [uid, g.id, minutes, String(daysAgo), earned, total, total ? (earned / total) * 100 : 0]);
  for (let i = 0; i < total; i++) {
    const { rows: [a] } = await c.query(
      `insert into achievements (game_id, platform_achievement_id, name, rarity_pct) values ($1,$2,$3,$4) returning id`,
      [g.id, `a${i}`, `Ach ${i}`, 20]);
    if (i < earned) {
      await c.query(`insert into user_achievements (user_id, achievement_id, unlocked_at) values ($1,$2, now())`, [uid, a.id]);
    }
  }
  return g.id as string;
};

const nearMiss = await mk("Near Miss", 600, 9, 10, 0);
const untouched = await mk("Untouched", 0, 0, 0, 0);
const dusty = await mk("Dusty", 900, 0, 0, 300);

const issued = await ensureChallenges(uid);
console.log("issued:", issued.map((x) => `${x.slug}(target ${x.target}, base ${x.baseline}, ${x.metric})`).join(", "));

const before = await evaluateChallenges(uid);
console.log("evaluate with no new play ->", JSON.stringify(before));

// simulate a sync: one more achievement in Near Miss, Untouched launched, 7h into Dusty
const { rows: [extra] } = await c.query(
  `select id from achievements where game_id = $1 and id not in
     (select achievement_id from user_achievements where user_id = $2) limit 1`, [nearMiss, uid]);
await c.query(`insert into user_achievements (user_id, achievement_id, unlocked_at) values ($1,$2, now())`, [uid, extra.id]);
await c.query(`update user_games set achievements_earned = 10, completion_pct = 100 where user_id=$1 and game_id=$2`, [uid, nearMiss]);
await c.query(`update user_games set playtime_minutes = 45 where user_id=$1 and game_id=$2`, [uid, untouched]);
await c.query(`update user_games set playtime_minutes = 900 + 430 where user_id=$1 and game_id=$2`, [uid, dusty]);

const after = await evaluateChallenges(uid);
console.log("evaluate after play ->", JSON.stringify(after));

const rows = await query<{ slug: string; progress: number; target: number; completed_at: string | null }>(
  `select slug, progress, target, completed_at::text from challenges where user_id = $1 order by slug`, [uid]);
console.table(rows);

const xp = await one<{ total: string }>(`select coalesce(sum(amount),0)::text as total from xp_ledger where user_id=$1`, [uid]);
console.log("xp balance:", xp?.total);
const badges = await query<{ slug: string }>(`select slug from user_badges where user_id=$1 order by slug`, [uid]);
console.log("badges:", badges.map((b) => b.slug).join(", ") || "(none)");

const awarded = await awardMilestones(uid, { games: 3, hours: 40, achievements: 11, completionPct: 70 });
console.log("milestones awarded:", awarded.join(", ") || "(none)");
const again = await awardMilestones(uid, { games: 3, hours: 40, achievements: 11, completionPct: 70 });
console.log("re-run is idempotent:", again.length === 0);

await c.end();
process.exit(0);
