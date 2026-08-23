import { requireUser } from "@/lib/auth";
import { getAttributes, getUserSummary } from "@/lib/stats";
import { getLibrary, getPlatformBreakdown } from "@/lib/queries";
import { PageHead, Meter, Empty, Grid, Stat } from "@/components/app/ui";
import { PlatformMark } from "@/components/PlatformMark";
import { formatHours } from "@/lib/utils";
import type { Platform } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rating" };

/** Semicircular gauge, drawn from the real 120 to 1000 range. */
function Gauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, (value - 120) / 880));
  const r = 104;
  const cx = 128;
  const cy = 128;
  const angle = Math.PI * (1 - pct);
  const x = cx + r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);

  return (
    <svg viewBox="0 0 256 148" width="100%" style={{ maxWidth: 256 }} aria-hidden="true">
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function RatingPage() {
  const user = await requireUser();
  const [summary, attributes, top, breakdown] = await Promise.all([
    getUserSummary(user.id),
    getAttributes(user.id),
    getLibrary(user.id, { limit: 5 }),
    getPlatformBreakdown(user.id),
  ]);

  if (summary.games === 0) {
    return (
      <>
        <PageHead
          title="Rating"
          subtitle="Built from real playtime, completion and achievement rarity across every connected account."
        />
        <Empty
          title="No rating yet"
          body="There is nothing to measure until a platform has synced. The rating is computed, never estimated, so it stays blank until it has data."
          cta={{ href: "/settings", label: "Connect an account" }}
        />
      </>
    );
  }

  const ranked = [...attributes].sort((a, b) => b.value - a.value);

  return (
    <>
      <PageHead
        title="Rating"
        subtitle="Built from real playtime, completion and achievement rarity across every connected account."
      />

      <div
        data-split
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 16,
          marginBottom: 36,
        }}
      >
        <section
          className="card"
          style={{
            padding: 28,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <Gauge value={summary.rating} />
          <div className="t-num" style={{ fontSize: 46, marginTop: -34 }}>
            {summary.rating}
          </div>
          <div className="t-label" style={{ marginTop: 8 }}>
            out of 1000
          </div>
          <p className="t-body" style={{ margin: "18px 0 0", maxWidth: "38ch" }}>
            You sit in the top {summary.percentile}% of TRACE players, from{" "}
            {summary.games.toLocaleString()} games, {formatHours(summary.minutes)} played and{" "}
            {summary.achievementsEarned.toLocaleString()} achievements.
          </p>
        </section>

        <section className="card" style={{ padding: 24 }}>
          <h2 className="t-label" style={{ marginBottom: 18 }}>
            What feeds it
          </h2>
          <div className="stack" style={{ gap: 14 }}>
            {[
              { label: "Depth of play", weight: "26%", note: "Total hours across every platform" },
              { label: "Completion", weight: "24%", note: "Achievements earned against available" },
              { label: "Breadth", weight: "22%", note: "How many games you own and started" },
              { label: "Rarity", weight: "20%", note: "Achievements held by under 10% of players" },
              { label: "Reach", weight: "8%", note: "Platforms connected" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between"
                style={{ gap: 16, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.label}</div>
                  <div className="t-sm" style={{ fontSize: 12 }}>
                    {row.note}
                  </div>
                </div>
                <span className="t-num" style={{ fontSize: 14, color: "var(--accent-text)" }}>
                  {row.weight}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              marginTop: 18,
            }}
          >
            <Stat value={summary.games.toLocaleString()} label="Games" />
            <Stat value={formatHours(summary.minutes)} label="Hours" />
            <Stat value={summary.achievementsEarned.toLocaleString()} label="Unlocks" />
          </div>
        </section>
      </div>

      {breakdown.length > 1 && (
        <section style={{ marginBottom: 36 }}>
          <h2 className="t-h2" style={{ marginBottom: 16 }}>
            By platform
          </h2>
          <Grid cols={3} gap={14}>
            {breakdown.map((b) => (
              <div key={b.platform} className="card" style={{ padding: 20 }}>
                <div className="flex items-center" style={{ gap: 10, marginBottom: 14 }}>
                  <PlatformMark platform={b.platform as Platform} size={16} />
                  <span className="t-h3" style={{ fontSize: 14 }}>
                    {b.platform === "psn" ? "PlayStation" : b.platform === "xbox" ? "Xbox" : "Steam"}
                  </span>
                </div>
                <div className="flex" style={{ gap: 22 }}>
                  <div>
                    <div className="t-num" style={{ fontSize: 19 }}>
                      {b.games.toLocaleString()}
                    </div>
                    <div className="t-label" style={{ fontSize: 9.5, marginTop: 4 }}>
                      Games
                    </div>
                  </div>
                  <div>
                    <div className="t-num" style={{ fontSize: 19 }}>
                      {formatHours(b.minutes)}
                    </div>
                    <div className="t-label" style={{ fontSize: 9.5, marginTop: 4 }}>
                      Hours
                    </div>
                  </div>
                  <div>
                    <div className="t-num" style={{ fontSize: 19 }}>
                      {b.earned.toLocaleString()}
                    </div>
                    <div className="t-label" style={{ fontSize: 9.5, marginTop: 4 }}>
                      Unlocks
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Grid>
        </section>
      )}

      <section style={{ marginBottom: 36 }}>
        <h2 className="t-h2" style={{ marginBottom: 16 }}>
          Attributes
        </h2>
        <Grid cols={3} gap={14}>
          {ranked.map((a) => (
            <div key={a.name} className="card" style={{ padding: 20 }}>
              <div className="flex items-baseline justify-between" style={{ marginBottom: 12 }}>
                <span className="t-label" style={{ color: "var(--text-2)" }}>
                  {a.name}
                </span>
                <span className="t-num" style={{ fontSize: 18, color: "var(--accent-text)" }}>
                  {a.value}
                </span>
              </div>
              <Meter pct={a.value} />
              <p className="t-sm" style={{ margin: "14px 0 0", fontSize: 12.5 }}>
                {a.note}
              </p>
            </div>
          ))}
        </Grid>
      </section>

      {top.length > 0 && (
        <section>
          <h2 className="t-h2" style={{ marginBottom: 16 }}>
            Biggest contributors
          </h2>
          <div className="stack" style={{ gap: 10 }}>
            {top.map((g) => (
              <div
                key={g.id}
                className="card flex items-center"
                style={{ gap: 14, padding: "14px 18px" }}
              >
                <PlatformMark platform={g.platform as Platform} size={16} />
                <span className="truncate-1" style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
                  {g.name}
                </span>
                <span className="t-num" style={{ fontSize: 13, color: "var(--text-3)" }}>
                  {formatHours(g.playtime_minutes)}
                </span>
                <span
                  className="t-num"
                  style={{
                    fontSize: 13,
                    color: g.achievements_total > 0 ? "var(--accent-text)" : "var(--text-5)",
                    minWidth: 52,
                    textAlign: "right",
                  }}
                >
                  {g.achievements_total > 0 ? `${Math.round(g.completion_pct)}%` : "n/a"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
