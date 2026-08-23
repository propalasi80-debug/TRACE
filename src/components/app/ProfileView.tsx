import { Avatar, Meter, Grid, PlatformTag } from "@/components/app/ui";
import { CopyLink } from "@/components/app/CopyLink";
import { formatHours } from "@/lib/utils";
import type { Platform } from "@/lib/types";
import type { UserSummary, AttributeScore } from "@/lib/stats";
import type { LibraryRow } from "@/lib/queries";

export function ProfileView({
  user,
  summary,
  attributes,
  topGames,
  shareUrl,
  owner,
  showPlaytime,
}: {
  user: { username: string; display_name: string; avatar_url: string | null; bio: string | null };
  summary: UserSummary;
  attributes: AttributeScore[];
  topGames: LibraryRow[];
  shareUrl: string;
  owner: boolean;
  showPlaytime: boolean;
}) {
  const top = [...attributes].sort((a, b) => b.value - a.value).slice(0, 6);
  const pretty = shareUrl.replace(/^https?:\/\//, "");

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-between"
        style={{ gap: 12, marginBottom: 20 }}
      >
        <span
          className="t-sm"
          style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 12.5 }}
        >
          {pretty}
        </span>
        <div className="flex" style={{ gap: 8 }}>
          <CopyLink url={shareUrl} />
          {owner && (
            <a href="/settings" className="btn btn-primary btn-sm">
              Edit profile
            </a>
          )}
        </div>
      </div>

      <section
        className="card flex flex-wrap items-center"
        style={{ padding: "clamp(20px, 3vw, 30px)", gap: 24, marginBottom: 18 }}
      >
        <Avatar src={user.avatar_url} size={88} radius={14} name={user.display_name} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 className="t-display" style={{ fontSize: "clamp(22px, 3.2vw, 30px)" }}>
            {user.display_name}
          </h1>
          <p style={{ fontSize: 14, color: "var(--accent-text)", margin: "6px 0 10px" }}>
            {summary.archetype} · top {summary.percentile}% of TRACE players
          </p>
          <p className="t-body" style={{ margin: 0, maxWidth: "56ch" }}>
            {user.bio ??
              `${summary.games.toLocaleString()} games across ${summary.connected.length} ${
                summary.connected.length === 1 ? "platform" : "platforms"
              }.`}
          </p>
          {summary.connected.length > 0 && (
            <div className="flex flex-wrap" style={{ gap: 8, marginTop: 14 }}>
              {summary.connected.map((p: Platform) => (
                <PlatformTag key={p} platform={p} />
              ))}
            </div>
          )}
        </div>
        <div className="flex" style={{ gap: 10 }}>
          <div className="tile" style={{ padding: "16px 20px", textAlign: "center" }}>
            <div className="t-num" style={{ fontSize: 24 }}>
              {summary.rating}
            </div>
            <div className="t-label" style={{ fontSize: 9.5, marginTop: 5 }}>
              Rating
            </div>
          </div>
          <div className="tile" style={{ padding: "16px 20px", textAlign: "center" }}>
            <div className="t-num" style={{ fontSize: 24 }}>
              {summary.achievementsEarned.toLocaleString()}
            </div>
            <div className="t-label" style={{ fontSize: 9.5, marginTop: 5 }}>
              Unlocks
            </div>
          </div>
        </div>
      </section>

      <Grid cols={2} gap={18}>
        <section className="card" style={{ padding: 24 }}>
          <h2 className="t-label" style={{ marginBottom: 18 }}>
            Strongest attributes
          </h2>
          <div className="stack" style={{ gap: 16 }}>
            {top.map((a) => (
              <div key={a.name}>
                <div
                  className="flex justify-between"
                  style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 7 }}
                >
                  <span>{a.name}</span>
                  <span className="tnum" style={{ color: "var(--accent-text)" }}>
                    {a.value}
                  </span>
                </div>
                <Meter pct={a.value} />
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: 24 }}>
          <h2 className="t-label" style={{ marginBottom: 18 }}>
            Most played
          </h2>
          {topGames.length === 0 ? (
            <p className="t-sm" style={{ margin: 0 }}>
              Nothing synced yet.
            </p>
          ) : (
            <div className="stack" style={{ gap: 14 }}>
              {topGames.map((g) => (
                <div key={g.id} className="flex items-center" style={{ gap: 12 }}>
                  <Avatar src={g.icon_url ?? g.cover_url} size={34} radius={7} name={g.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate-1" style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {g.name}
                    </div>
                    <div className="t-sm" style={{ fontSize: 11.5 }}>
                      {g.achievements_total > 0
                        ? `${Math.round(g.completion_pct)}% complete`
                        : "No achievements"}
                    </div>
                  </div>
                  {showPlaytime && (
                    <span className="t-num" style={{ fontSize: 13, color: "var(--text-3)" }}>
                      {formatHours(g.playtime_minutes)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </Grid>
    </>
  );
}
