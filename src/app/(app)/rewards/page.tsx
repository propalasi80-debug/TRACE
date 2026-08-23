import { requireUser } from "@/lib/auth";
import { getBadges, getXpBalance, getRarestAchievements } from "@/lib/queries";
import { getUserSummary } from "@/lib/stats";
import { PageHead, Empty, Grid, Meter, Avatar } from "@/components/app/ui";
import { Icon } from "@/components/Icon";
import { rarityTier, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rewards" };

interface Milestone {
  slug: string;
  name: string;
  requirement: string;
  progress: number;
  earned: boolean;
}

function milestones(s: {
  games: number;
  minutes: number;
  achievementsEarned: number;
  completionPct: number;
}): Milestone[] {
  const hours = s.minutes / 60;
  const mk = (
    slug: string,
    name: string,
    requirement: string,
    current: number,
    target: number
  ): Milestone => ({
    slug,
    name,
    requirement,
    progress: Math.min(100, (current / target) * 100),
    earned: current >= target,
  });

  return [
    mk("first-light", "First Light", "Sync your first platform", s.games > 0 ? 1 : 0, 1),
    mk("collector", "Collector", "50 games in your library", s.games, 50),
    mk("archivist", "Archivist", "250 games in your library", s.games, 250),
    mk("marathon", "Marathon", "1,000 hours played", hours, 1000),
    mk("decade", "Decade", "4,000 hours played", hours, 4000),
    mk("specialist", "Specialist", "500 achievements", s.achievementsEarned, 500),
    mk("completionist", "Completionist", "60% average completion", s.completionPct, 60),
    mk("perfectionist", "Perfectionist", "85% average completion", s.completionPct, 85),
  ];
}

export default async function RewardsPage() {
  const user = await requireUser();
  const [summary, xp, badges, rarest] = await Promise.all([
    getUserSummary(user.id),
    getXpBalance(user.id),
    getBadges(user.id),
    getRarestAchievements(user.id, 8),
  ]);

  if (summary.games === 0) {
    return (
      <>
        <PageHead title="Rewards" subtitle="Milestones unlocked from real totals." />
        <Empty
          title="Nothing earned yet"
          body="Every badge here is tied to a real number: games synced, hours played, achievements taken. Connect a platform to start counting."
          cta={{ href: "/settings", label: "Connect an account" }}
        />
      </>
    );
  }

  const earnedAt = new Map(badges.map((b) => [b.slug, b.earned_at]));
  const list = milestones(summary);
  const earnedCount = list.filter((m) => m.earned).length;

  return (
    <>
      <PageHead
        title="Rewards"
        subtitle="Milestones computed from your synced totals, plus your rarest unlocks."
      />

      <Grid cols={3} gap={14}>
        <div className="card" style={{ padding: 22 }}>
          <div className="t-num" style={{ fontSize: 30, color: "var(--accent-text)" }}>
            {xp.toLocaleString()}
          </div>
          <div className="t-label" style={{ marginTop: 8 }}>
            XP balance
          </div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="t-num" style={{ fontSize: 30 }}>
            {earnedCount}
            <span style={{ fontSize: 16, color: "var(--text-4)" }}>/{list.length}</span>
          </div>
          <div className="t-label" style={{ marginTop: 8 }}>
            Milestones
          </div>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div className="t-num" style={{ fontSize: 30 }}>
            {summary.achievementsEarned.toLocaleString()}
          </div>
          <div className="t-label" style={{ marginTop: 8 }}>
            Achievements
          </div>
        </div>
      </Grid>

      <section style={{ margin: "36px 0" }}>
        <h2 className="t-h2" style={{ marginBottom: 16 }}>
          Milestones
        </h2>
        <Grid min={210} gap={14}>
          {list.map((m) => (
            <div
              key={m.slug}
              className="card"
              style={{ padding: 20, opacity: m.earned ? 1 : 0.72 }}
            >
              <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
                <span
                  className="grid place-items-center"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "var(--r-sm)",
                    background: m.earned ? "var(--accent-14)" : "var(--surface-3)",
                    border: `1px solid ${m.earned ? "var(--accent-45)" : "var(--line)"}`,
                    color: m.earned ? "var(--accent-text)" : "var(--text-5)",
                    flex: "none",
                  }}
                >
                  <Icon name="trophy" size={17} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{m.name}</div>
                  <div className="t-sm" style={{ fontSize: 12 }}>
                    {m.earned
                      ? earnedAt.has(m.slug)
                        ? `Earned ${timeAgo(earnedAt.get(m.slug))}`
                        : "Earned"
                      : m.requirement}
                  </div>
                </div>
              </div>
              {!m.earned && <Meter pct={m.progress} />}
            </div>
          ))}
        </Grid>
      </section>

      {rarest.length > 0 && (
        <section>
          <h2 className="t-h2" style={{ marginBottom: 16 }}>
            Your rarest unlocks
          </h2>
          <div className="stack" style={{ gap: 10 }}>
            {rarest.map((a) => {
              const tier = rarityTier(a.rarity_pct);
              return (
                <div
                  key={a.id}
                  className="card flex items-center"
                  style={{ gap: 14, padding: "13px 16px" }}
                >
                  <Avatar src={a.icon_url} size={36} radius={8} name={a.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate-1" style={{ fontSize: 14, fontWeight: 600 }}>
                      {a.name}
                    </div>
                    <div className="truncate-1 t-sm" style={{ fontSize: 12 }}>
                      {a.game_name} · {timeAgo(a.unlocked_at)}
                    </div>
                  </div>
                  <span className="badge" style={{ color: tier.color, borderColor: tier.border }}>
                    {tier.label}
                  </span>
                  <span
                    className="t-num"
                    style={{ fontSize: 13, color: tier.color, minWidth: 52, textAlign: "right" }}
                  >
                    {a.rarity_pct?.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
