import { Avatar, StatTile, RatingBadge } from "@/components/app/ui";
import { formatHours } from "@/lib/utils";
import type { UserSummary } from "@/lib/stats";

export function IdentityCard({
  displayName,
  avatarUrl,
  summary,
  favourites,
  avatarSize = 74,
}: {
  displayName: string;
  avatarUrl: string | null;
  summary: UserSummary;
  favourites?: string[];
  avatarSize?: number;
}) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        Gamer identity
      </div>
      <div
        className="flex gap-4 items-center"
        style={{ paddingBottom: 20, borderBottom: "1px solid var(--border)" }}
      >
        <Avatar src={avatarUrl} size={avatarSize} radius={10} />
        <div>
          <div
            className="font-display font-bold"
            style={{ fontSize: 21, letterSpacing: ".06em" }}
          >
            {displayName.toUpperCase()}
          </div>
          <div style={{ fontSize: 14, color: "var(--accent)", margin: "2px 0 6px" }}>
            {summary.archetype}
          </div>
          <RatingBadge value={summary.rating} delta={summary.ratingDelta} />
        </div>
      </div>

      {favourites && favourites.length > 0 && (
        <>
          <div className="eyebrow" style={{ margin: "20px 0 12px" }}>
            Favourite games
          </div>
          <div className="flex flex-wrap gap-[9px]">
            {favourites.map((f) => (
              <span
                key={f}
                style={{
                  fontSize: 12.5,
                  background: "var(--surface-3)",
                  border: "1px solid rgba(255,255,255,.09)",
                  borderRadius: 7,
                  padding: "7px 12px",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 20 }}>
        <StatTile value={summary.games.toLocaleString()} label="Games" />
        <StatTile value={formatHours(summary.minutes)} label="Hours" />
        <StatTile value={`${summary.completionPct}%`} label="Done" />
      </div>
    </div>
  );
}
