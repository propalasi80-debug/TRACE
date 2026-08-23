import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserSummary } from "@/lib/stats";
import { getLibrary, getFriends, getRecentAchievements } from "@/lib/queries";
import { ensureChallenges, getRecommendations } from "@/lib/engine";
import { IdentityCard } from "@/components/app/IdentityCard";
import { Avatar, CoverArt, Empty, Grid, Meter, PlatformTag } from "@/components/app/ui";
import { Icon } from "@/components/Icon";
import { formatHours, ofLabel, rarityTier, timeAgo, timeUntil } from "@/lib/utils";
import type { Platform } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Home" };

export default async function HomePage() {
  const user = await requireUser();
  const summary = await getUserSummary(user.id);

  if (summary.connected.length === 0) {
    return (
      <>
        <div className="t-label" style={{ marginBottom: 10 }}>
          Welcome to TRACE
        </div>
        <h1 className="t-h1" style={{ marginBottom: 28 }}>
          Let us find your history
        </h1>
        <Empty
          title="Nothing connected yet"
          body="TRACE has nothing to read until you link an account. Steam takes one click. PlayStation and Xbox each need a token you can grab in about a minute."
          cta={{ href: "/settings", label: "Connect an account" }}
        />
      </>
    );
  }

  const [recs, challenges, recent, recentlyPlayed, friends] = await Promise.all([
    getRecommendations(user.id, 3),
    ensureChallenges(user.id),
    getRecentAchievements(user.id, 6),
    getLibrary(user.id, { sort: "recent", limit: 4 }),
    getFriends(user.id),
  ]);

  const today = challenges.find((c) => c.kind === "Daily" && !c.completed_at) ?? challenges[0];

  return (
    <>
      <div className="t-label" style={{ marginBottom: 10 }}>
        Welcome back
      </div>
      <h1 className="t-h1" style={{ marginBottom: 28 }}>
        {user.display_name}
      </h1>

      <div
        data-split
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 340px) minmax(0, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <IdentityCard
          displayName={user.display_name}
          username={user.username}
          avatarUrl={user.avatar_url}
          summary={summary}
          href="/rating"
        />

        <section className="card stack" style={{ padding: 22 }}>
          <div className="flex items-start justify-between" style={{ gap: 12 }}>
            <h2 className="t-label">Today</h2>
            {today && <span className="badge badge-accent">{today.kind}</span>}
          </div>

          {today ? (
            <>
              <h3 className="t-display" style={{ fontSize: 22, margin: "18px 0 10px" }}>
                {today.title}
              </h3>
              <p className="t-body" style={{ margin: "0 0 18px", maxWidth: "54ch" }}>
                {today.description}
              </p>
              <div className="flex flex-wrap items-center" style={{ gap: 18, marginBottom: 18 }}>
                <span className="t-sm flex items-center" style={{ gap: 7 }}>
                  <Icon name="trophy" size={14} />
                  {today.xp} XP{today.badge ? ` and the ${today.badge} badge` : ""}
                </span>
                <span className="t-sm flex items-center" style={{ gap: 7 }}>
                  <Icon name="clock" size={14} />
                  {timeUntil(today.expires_at)}
                </span>
              </div>
              <div style={{ maxWidth: 380, marginBottom: 22 }}>
                <div
                  className="flex justify-between t-sm"
                  style={{ fontSize: 12, marginBottom: 7 }}
                >
                  <span>Progress</span>
                  <span className="tnum">{ofLabel(today.progress, today.target)}</span>
                </div>
                <Meter pct={(today.progress / Math.max(1, today.target)) * 100} />
              </div>
              <Link href="/challenges" className="btn btn-secondary btn-sm" style={{ alignSelf: "start" }}>
                All challenges
                <Icon name="arrowRight" size={14} />
              </Link>
            </>
          ) : (
            <p className="t-body" style={{ margin: "18px 0 0" }}>
              No active challenges. They generate from your library the first time you sync.
            </p>
          )}
        </section>
      </div>

      {recentlyPlayed.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h2 className="t-h2">Recently played</h2>
            <Link href="/library" className="t-sm">
              Full library
            </Link>
          </div>
          <Grid min={168} gap={14}>
            {recentlyPlayed.map((g) => (
              <article key={g.id} className="card card-hover" style={{ overflow: "hidden" }}>
                <CoverArt
                  src={g.cover_url}
                  name={g.name}
                  corner={<PlatformTag platform={g.platform as Platform} />}
                />
                <div style={{ padding: "12px 14px" }}>
                  <div
                    className="flex justify-between t-sm"
                    style={{ fontSize: 12, marginBottom: 8 }}
                  >
                    <span className="tnum">
                      {user.show_playtime ? formatHours(g.playtime_minutes) : "Hidden"}
                    </span>
                    <span className="tnum">
                      {g.achievements_total > 0 ? `${Math.round(g.completion_pct)}%` : "No data"}
                    </span>
                  </div>
                  <Meter pct={g.completion_pct} />
                </div>
              </article>
            ))}
          </Grid>
        </section>
      )}

      <section style={{ marginBottom: 32 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <h2 className="t-h2">Suggested for you</h2>
          <Link href="/suggestions" className="t-sm">
            See all
          </Link>
        </div>
        <Grid cols={3} gap={16}>
          {recs.map((r) => (
            <article key={r.title} className="card card-hover stack" style={{ padding: 20 }}>
              <div className="flex items-start justify-between" style={{ gap: 12, marginBottom: 12 }}>
                <h3 className="t-h3" style={{ minWidth: 0 }}>
                  {r.title}
                </h3>
                <span className="badge badge-accent">{r.match}% match</span>
              </div>
              <div className="t-label" style={{ fontSize: 10, marginBottom: 12 }}>
                {r.meta}
              </div>
              <p className="t-body" style={{ margin: 0, fontSize: 13.5 }}>
                {r.why}
              </p>
            </article>
          ))}
        </Grid>
      </section>

      <div
        data-split
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 28,
        }}
      >
        <section>
          <h2 className="t-h2" style={{ marginBottom: 16 }}>
            Latest unlocks
          </h2>
          {recent.length === 0 ? (
            <p className="t-sm">Achievements appear here after your first full sync.</p>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {recent.map((a) => {
                const tier = rarityTier(a.rarity_pct);
                return (
                  <div
                    key={a.id}
                    className="card flex items-center"
                    style={{ gap: 13, padding: "12px 14px" }}
                  >
                    <Avatar src={a.icon_url} size={38} radius={8} name={a.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate-1" style={{ fontSize: 13.5, fontWeight: 600 }}>
                        {a.name}
                      </div>
                      <div className="truncate-1 t-sm" style={{ fontSize: 12 }}>
                        {a.game_name} · {timeAgo(a.unlocked_at)}
                      </div>
                    </div>
                    <span className="badge" style={{ color: tier.color, borderColor: tier.border }}>
                      {a.rarity_pct != null ? `${a.rarity_pct.toFixed(1)}%` : tier.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="t-h2" style={{ marginBottom: 16 }}>
            Friends
          </h2>
          {friends.length === 0 ? (
            <div className="card" style={{ padding: 20 }}>
              <p className="t-sm" style={{ margin: "0 0 14px" }}>
                Add someone by their TRACE username to compare libraries and ratings.
              </p>
              <Link href="/friends" className="btn btn-secondary btn-sm">
                Find friends
              </Link>
            </div>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {friends.slice(0, 4).map((f) => (
                <Link
                  key={f.id}
                  href={`/u/${f.username}`}
                  className="card card-hover flex items-center"
                  style={{ gap: 12, padding: "12px 14px", color: "var(--text)" }}
                >
                  <Avatar size={36} radius={8} name={f.display_name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate-1" style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {f.display_name}
                    </div>
                    <div className="truncate-1 t-sm" style={{ fontSize: 12 }}>
                      {f.playing ? f.playing : "No activity yet"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
