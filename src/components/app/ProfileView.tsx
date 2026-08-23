import { Avatar, Progress } from "@/components/app/ui";
import { CopyLink } from "@/components/app/CopyLink";
import { formatHours } from "@/lib/utils";
import { PLATFORM_META, type Platform } from "@/lib/types";
import type { UserSummary, AttributeScore } from "@/lib/stats";
import type { LibraryRow } from "@/lib/queries";

export function ProfileView({
  user,
  summary,
  attributes,
  topGames,
  shareUrl,
  owner,
}: {
  user: { username: string; display_name: string; avatar_url: string | null; bio: string | null };
  summary: UserSummary;
  attributes: AttributeScore[];
  topGames: LibraryRow[];
  shareUrl: string;
  owner: boolean;
}) {
  const top4 = [...attributes].sort((a, b) => b.value - a.value).slice(0, 4);

  return (
    <div>
      <div
        className="flex flex-wrap gap-[14px] items-center justify-between"
        style={{ marginBottom: 26 }}
      >
        <div
          style={{ fontSize: 12.5, color: "var(--text-4)", fontFamily: "ui-monospace,Menlo,monospace" }}
        >
          {shareUrl.replace(/^https?:\/\//, "")}
        </div>
        <div className="flex gap-[10px]">
          <CopyLink url={shareUrl} />
          {owner && (
            <a href="/settings" className="btn-primary" style={{ minHeight: 40, fontSize: 13 }}>
              Edit profile
            </a>
          )}
        </div>
      </div>

      <div
        className="card flex flex-wrap items-center"
        style={{ padding: 30, marginBottom: 22, gap: 26 }}
      >
        <Avatar src={user.avatar_url} size={104} radius={14} />
        <div className="flex-1" style={{ minWidth: 240 }}>
          <div className="font-display font-bold" style={{ fontSize: 32, letterSpacing: ".06em" }}>
            {user.display_name.toUpperCase()}
          </div>
          <div style={{ fontSize: 15, color: "var(--accent)", margin: "4px 0 10px" }}>
            {summary.archetype} · Top {summary.percentile}% of Trace players
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--text-2)", margin: 0, maxWidth: "60ch" }}>
            {user.bio ??
              `${summary.games.toLocaleString()} games across ${summary.connected.length} ${
                summary.connected.length === 1 ? "platform" : "platforms"
              }, ${formatHours(summary.minutes)} logged.`}
          </p>
          {summary.connected.length > 0 && (
            <div className="flex gap-2" style={{ marginTop: 14 }}>
              {summary.connected.map((p: Platform) => (
                <span
                  key={p}
                  className="uppercase"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: ".14em",
                    border: "1px solid rgba(255,255,255,.12)",
                    borderRadius: 5,
                    padding: "4px 9px",
                    color: "var(--text-3)",
                  }}
                >
                  {PLATFORM_META[p].label}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <div className="tile text-center" style={{ padding: "16px 20px" }}>
            <div className="tnum" style={{ fontSize: 24, fontWeight: 700 }}>
              {summary.rating}
            </div>
            <div
              className="uppercase"
              style={{ fontSize: 9.5, letterSpacing: ".14em", color: "var(--text-4)", marginTop: 4 }}
            >
              Rating
            </div>
          </div>
          <div className="tile text-center" style={{ padding: "16px 20px" }}>
            <div className="tnum" style={{ fontSize: 24, fontWeight: 700 }}>
              {summary.achievementsEarned.toLocaleString()}
            </div>
            <div
              className="uppercase"
              style={{ fontSize: 9.5, letterSpacing: ".14em", color: "var(--text-4)", marginTop: 4 }}
            >
              Awards
            </div>
          </div>
        </div>
      </div>

      <div data-cols2 className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 22 }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            Top attributes
          </div>
          <div className="flex flex-col gap-4">
            {top4.map((a) => (
              <div key={a.name}>
                <div
                  className="flex justify-between uppercase"
                  style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".14em", marginBottom: 8 }}
                >
                  <span>{a.name}</span>
                  <span style={{ color: "var(--accent)" }}>{a.value}</span>
                </div>
                <Progress pct={a.value} />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>
            Most played
          </div>
          {topGames.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--text-3)", margin: 0 }}>Nothing synced yet.</p>
          ) : (
            <div className="flex flex-col gap-[14px]">
              {topGames.map((g) => (
                <div key={g.id} className="flex items-center gap-[14px]">
                  <Avatar src={g.icon_url ?? g.cover_url} size={38} radius={8} />
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {g.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-4)" }}>
                      {PLATFORM_META[g.platform as Platform].label}
                    </div>
                  </div>
                  <div className="tnum" style={{ fontSize: 13.5, fontWeight: 600 }}>
                    {formatHours(g.playtime_minutes)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
