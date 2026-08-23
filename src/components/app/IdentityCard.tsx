import Link from "next/link";
import { Avatar, Meter, Stat } from "@/components/app/ui";
import { PlatformMark } from "@/components/PlatformMark";
import { formatHours } from "@/lib/utils";
import type { UserSummary } from "@/lib/stats";

export function IdentityCard({
  displayName,
  username,
  avatarUrl,
  summary,
  href,
}: {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  summary: UserSummary;
  href?: string;
}) {
  const ratingPct = Math.max(0, Math.min(100, ((summary.rating - 120) / 880) * 100));

  return (
    <section className="card" style={{ padding: 22 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 18 }}>
        <h2 className="t-label">Identity</h2>
        {summary.connected.length > 0 && (
          <div className="flex items-center" style={{ gap: 8 }}>
            {summary.connected.map((p) => (
              <PlatformMark key={p} platform={p} size={13} color="var(--text-4)" />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center" style={{ gap: 16 }}>
        <Avatar src={avatarUrl} size={62} radius={12} name={displayName} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="t-display truncate-1" style={{ fontSize: 19 }}>
            {displayName}
          </div>
          <div style={{ fontSize: 13, color: "var(--accent-text)", marginTop: 3 }}>
            {summary.archetype}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 8 }}>
          <span className="t-label">TRACE rating</span>
          <span className="flex items-baseline" style={{ gap: 8 }}>
            <span className="t-num" style={{ fontSize: 22 }}>
              {summary.rating}
            </span>
            {summary.ratingDelta !== 0 && (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: summary.ratingDelta > 0 ? "var(--ok)" : "var(--bad)",
                }}
              >
                {summary.ratingDelta > 0 ? "+" : ""}
                {summary.ratingDelta}
              </span>
            )}
          </span>
        </div>
        <Meter pct={ratingPct} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
          marginTop: 20,
        }}
      >
        <Stat value={summary.games.toLocaleString()} label="Games" />
        <Stat value={formatHours(summary.minutes)} label="Hours" />
        <Stat value={`${summary.completionPct}%`} label="Complete" />
      </div>

      {href && (
        <Link
          href={href}
          className="btn btn-quiet btn-sm"
          style={{ width: "100%", marginTop: 16 }}
        >
          View full rating
        </Link>
      )}
      {!href && username && (
        <p className="t-sm" style={{ margin: "16px 0 0", fontSize: 12.5 }}>
          Public profile at /u/{username}
        </p>
      )}
    </section>
  );
}
