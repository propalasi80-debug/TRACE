import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getUserSummary } from "@/lib/stats";
import { getLibrary, getFriends, getRecentAchievements } from "@/lib/queries";
import { ensureChallenges, getRecommendations } from "@/lib/engine";
import { IdentityCard } from "@/components/app/IdentityCard";
import { EmptyState, GameArt, Avatar, RatingBadge } from "@/components/app/ui";
import { Icon, StarIcon } from "@/components/Icon";
import { PLATFORM_META, type Platform } from "@/lib/types";
import { timeAgo, rarityTier } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Home · Trace" };

export default async function HomePage() {
  const user = await requireUser();
  const summary = await getUserSummary(user.id);

  if (summary.connected.length === 0) {
    return (
      <div>
        <div className="uppercase" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".22em", color: "var(--text-4)", marginBottom: 12 }}>
          Welcome to Trace
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-.015em", margin: "0 0 32px" }}>
          Let&apos;s find your history.
        </h1>
        <EmptyState
          title="Nothing connected yet"
          body="Trace has nothing to read until you link an account. Steam takes one click; PlayStation and Xbox each need a token you can grab in about a minute."
          cta={{ href: "/settings", label: "Connect your accounts" }}
        />
      </div>
    );
  }

  const [recs, challenges, rediscover, friends, recent] = await Promise.all([
    getRecommendations(user.id, 3),
    ensureChallenges(user.id),
    getLibrary(user.id, { sort: "recent", limit: 3 }),
    getFriends(user.id),
    getRecentAchievements(user.id, 5),
  ]);

  const today = challenges.find((c) => c.kind === "Daily") ?? challenges[0];

  return (
    <div>
      <div className="uppercase" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".22em", color: "var(--text-4)", marginBottom: 12 }}>
        Welcome back
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-.015em", margin: "0 0 32px" }}>
        What should I do today?
      </h1>

      <div
        data-cols2
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,.85fr) minmax(0,1.35fr)", gap: 20, marginBottom: 44 }}
      >
        <IdentityCard displayName={user.display_name} avatarUrl={user.avatar_url} summary={summary} />

        <div className="card relative flex flex-col" style={{ padding: "22px 26px" }}>
          <div className="flex justify-between items-start">
            <div className="eyebrow">Today&apos;s challenge</div>
            {today && (
              <span
                className="uppercase"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".16em",
                  color: "var(--accent)",
                  border: "1px solid rgba(46,125,255,.4)",
                  background: "rgba(46,125,255,.1)",
                  borderRadius: 6,
                  padding: "4px 9px",
                }}
              >
                {today.kind}
              </span>
            )}
          </div>

          {today ? (
            <>
              <h2
                className="font-display font-bold uppercase"
                style={{ fontSize: 27, letterSpacing: ".05em", margin: "20px 0 10px" }}
              >
                {today.title}
              </h2>
              <p style={{ fontSize: 14.5, color: "var(--text-2)", margin: "0 0 20px", maxWidth: "52ch" }}>
                {today.description}
              </p>
              <div
                className="flex flex-wrap gap-[22px]"
                style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}
              >
                <span className="flex items-center gap-[7px]">
                  <Icon name="trophy" size={14} />
                  {today.xp} XP{today.badge ? ` + ${today.badge} Badge` : ""}
                </span>
                <span className="flex items-center gap-[7px]">
                  <Icon name="clock" size={14} />
                  {timeAgo(today.expires_at).replace(" ago", " left")}
                </span>
              </div>
              <span className="flex-1" />
              <Link href="/challenges" className="btn-primary self-start" style={{ textDecoration: "none" }}>
                See all challenges
              </Link>
            </>
          ) : (
            <p style={{ fontSize: 14.5, color: "var(--text-3)", margin: "20px 0 0" }}>
              No active challenges — sync a platform and they generate from your library.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
        <div className="flex items-center gap-[10px]">
          <StarIcon size={18} />
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Recommended for you</h2>
        </div>
        <Link href="/suggestions" style={{ fontSize: 13, color: "var(--text-3)" }}>
          View all →
        </Link>
      </div>
      <div
        data-cols3
        className="grid"
        style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 20, marginBottom: 44 }}
      >
        {recs.map((r) => (
          <div key={r.title} className="card flex flex-col" style={{ overflow: "hidden" }}>
            <div
              className="relative grid place-items-center"
              style={{ aspectRatio: "16/9", background: "var(--surface-5)" }}
            >
              <span
                className="font-display uppercase"
                style={{ fontSize: 11, letterSpacing: ".22em", color: "var(--text-5)" }}
              >
                {r.meta.split(" · ")[1]}
              </span>
              <span
                className="absolute flex items-center gap-[5px]"
                style={{
                  top: 12,
                  right: 12,
                  background: "rgba(46,125,255,.92)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 7,
                  padding: "5px 9px",
                }}
              >
                {r.match}% match
              </span>
            </div>
            <div className="flex flex-col flex-1" style={{ padding: "18px 20px 20px" }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 7 }}>{r.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--text-4)", marginBottom: 16 }}>{r.meta}</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text-2)", margin: "0 0 18px" }}>
                {r.why}
              </p>
              <span className="flex-1" />
              <Link
                href="/suggestions"
                className="uppercase"
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: ".16em",
                  paddingTop: 16,
                  borderTop: "1px solid var(--border)",
                }}
              >
                View game →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div
        data-cols2
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,.9fr)", gap: 36 }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px" }}>Rediscover</h2>
          {rediscover.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--text-3)" }}>Sync a platform to fill this in.</p>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14 }}>
              {rediscover.map((g) => (
                <div key={g.id} className="card" style={{ borderRadius: 12, overflow: "hidden" }}>
                  <GameArt src={g.cover_url} name={g.name}>
                    <span className="absolute" style={{ top: 10, left: 10, zIndex: 2 }}>
                      <span
                        className="uppercase"
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          letterSpacing: ".14em",
                          background: "rgba(0,0,0,.6)",
                          border: "1px solid rgba(255,255,255,.12)",
                          borderRadius: 5,
                          padding: "3px 7px",
                          color: "rgba(245,246,247,.7)",
                        }}
                      >
                        {PLATFORM_META[g.platform as Platform].label}
                      </span>
                    </span>
                  </GameArt>
                  <div style={{ padding: "11px 12px", fontSize: 11.5, color: "var(--text-4)" }}>
                    Last played {timeAgo(g.last_played_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 18px" }}>
            {friends.length > 0 ? "Friend activity" : "Latest achievements"}
          </h2>
          <div className="flex flex-col gap-3">
            {friends.length > 0
              ? friends.slice(0, 3).map((f) => (
                  <Link
                    key={f.id}
                    href={`/u/${f.username}`}
                    className="card flex items-center gap-[13px]"
                    style={{ borderRadius: 12, padding: "13px 16px", color: "var(--text)" }}
                  >
                    <Avatar size={40} radius={8} />
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold" style={{ fontSize: 14.5, letterSpacing: ".05em" }}>
                        {f.display_name.toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "var(--accent)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {f.playing ? `Last played ${f.playing}` : "No activity yet"}
                      </div>
                    </div>
                  </Link>
                ))
              : recent.length === 0
                ? <p style={{ fontSize: 14, color: "var(--text-3)" }}>Sync to see achievements land here.</p>
                : recent.map((a) => {
                    const tier = rarityTier(a.rarity_pct);
                    return (
                      <div key={a.id} className="card flex items-center gap-[13px]" style={{ borderRadius: 12, padding: "13px 16px" }}>
                        <Avatar src={a.icon_url} size={40} radius={8} />
                        <div className="flex-1 min-w-0">
                          <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {a.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {a.game_name} · {timeAgo(a.unlocked_at)}
                          </div>
                        </div>
                        <span
                          className={tier.className}
                          style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 5, padding: "3px 7px", flex: "none" }}
                        >
                          {a.rarity_pct != null ? `${a.rarity_pct.toFixed(1)}%` : tier.label}
                        </span>
                      </div>
                    );
                  })}
          </div>
          {friends.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <RatingBadge value={summary.rating} delta={summary.ratingDelta} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
