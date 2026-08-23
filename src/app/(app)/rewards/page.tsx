import { requireUser } from "@/lib/auth";
import { getBadges, getXpBalance, getRarestAchievements } from "@/lib/queries";
import { getUserSummary } from "@/lib/stats";
import { PageHeading, EmptyState } from "@/components/app/ui";
import { Icon } from "@/components/Icon";
import { rarityTier, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rewards · Trace" };

/** Milestone badges are derived from real totals, so they can't be faked. */
function milestones(summary: { games: number; minutes: number; achievementsEarned: number; completionPct: number }) {
  const hours = summary.minutes / 60;
  return [
    { slug: "first-light", name: "First Light", need: "Sync your first platform", got: summary.games > 0 },
    { slug: "collector", name: "Collector", need: "50 games in your library", got: summary.games >= 50 },
    { slug: "archivist", name: "Archivist", need: "250 games in your library", got: summary.games >= 250 },
    { slug: "marathon", name: "Marathon", need: "1,000 hours played", got: hours >= 1000 },
    { slug: "decade", name: "Decade", need: "4,000 hours played", got: hours >= 4000 },
    { slug: "specialist", name: "Specialist", need: "500 achievements", got: summary.achievementsEarned >= 500 },
    { slug: "completionist", name: "Completionist", need: "60% average completion", got: summary.completionPct >= 60 },
    { slug: "perfectionist", name: "Perfectionist", need: "85% average completion", got: summary.completionPct >= 85 },
  ];
}

export default async function RewardsPage() {
  const user = await requireUser();
  const [summary, xp, badges, rarest] = await Promise.all([
    getUserSummary(user.id),
    getXpBalance(user.id),
    getBadges(user.id),
    getRarestAchievements(user.id, 6),
  ]);

  if (summary.games === 0) {
    return (
      <div>
        <PageHeading title="Rewards" subtitle="Everything you have earned from challenges, streaks and milestones." />
        <EmptyState
          title="Nothing earned yet"
          body="Badges unlock off real totals — games synced, hours played, achievements taken. Connect a platform to start the count."
          cta={{ href: "/settings", label: "Connect a platform" }}
        />
      </div>
    );
  }

  const earnedSlugs = new Set(badges.map((b) => b.slug));
  const list = milestones(summary);
  const earnedCount = list.filter((m) => m.got).length;

  return (
    <div>
      <PageHeading title="Rewards" subtitle="Everything you have earned from challenges, streaks and milestones." />

      <div
        data-cols3
        className="grid"
        style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 18, marginBottom: 40 }}
      >
        {[
          { v: xp.toLocaleString(), l: "XP balance", accent: true },
          { v: earnedCount, l: "Badges earned" },
          { v: summary.achievementsEarned.toLocaleString(), l: "Achievements" },
        ].map((s) => (
          <div key={s.l} className="card" style={{ borderRadius: 12, padding: 22 }}>
            <div
              className="tnum"
              style={{ fontSize: 34, fontWeight: 700, color: s.accent ? "var(--accent)" : undefined }}
            >
              {s.v}
            </div>
            <div
              className="uppercase"
              style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--text-4)", marginTop: 6 }}
            >
              {s.l}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px" }}>Badges</h2>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(auto-fill,minmax(168px,1fr))", gap: 16, marginBottom: 40 }}
      >
        {list.map((b) => (
          <div
            key={b.slug}
            className="card text-center"
            style={{ borderRadius: 12, padding: 20, opacity: b.got ? 1 : 0.45 }}
          >
            <div
              className="grid place-items-center"
              style={{
                width: 46,
                height: 46,
                margin: "0 auto 14px",
                borderRadius: 12,
                background: "rgba(46,125,255,.14)",
                border: "1px solid rgba(46,125,255,.32)",
                color: "var(--accent)",
              }}
            >
              <Icon name="trophy" size={20} />
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 5 }}>{b.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-4)" }}>
              {b.got
                ? earnedSlugs.has(b.slug)
                  ? `Earned ${timeAgo(badges.find((x) => x.slug === b.slug)?.earned_at)}`
                  : "Earned"
                : b.need}
            </div>
          </div>
        ))}
      </div>

      {rarest.length > 0 && (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px" }}>Your rarest unlocks</h2>
          <div className="flex flex-col gap-3">
            {rarest.map((a) => {
              const tier = rarityTier(a.rarity_pct);
              return (
                <div
                  key={a.id}
                  className="card flex items-center gap-[18px]"
                  style={{ borderRadius: 12, padding: "16px 20px" }}
                >
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-4)", marginTop: 3 }}>
                      {a.game_name} · {timeAgo(a.unlocked_at)}
                    </div>
                  </div>
                  <span
                    className={tier.className}
                    style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 6, padding: "5px 10px" }}
                  >
                    {tier.label}
                  </span>
                  <span className="tnum" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                    {a.rarity_pct?.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
