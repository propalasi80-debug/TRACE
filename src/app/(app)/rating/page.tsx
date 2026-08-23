import { requireUser } from "@/lib/auth";
import { getAttributes, getUserSummary } from "@/lib/stats";
import { getLibrary } from "@/lib/queries";
import { IdentityCard } from "@/components/app/IdentityCard";
import { PageHeading, Progress, EmptyState } from "@/components/app/ui";
import { formatHours } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gamer Rating · Trace" };

export default async function RatingPage() {
  const user = await requireUser();
  const [summary, attributes, top] = await Promise.all([
    getUserSummary(user.id),
    getAttributes(user.id),
    getLibrary(user.id, { limit: 5 }),
  ]);

  // Arc geometry: 110px radius semicircle from (20,138) to (240,138).
  const pct = Math.max(0, Math.min(1, (summary.rating - 120) / 880));
  const angle = Math.PI * (1 - pct);
  const x = 130 + 110 * Math.cos(angle);
  const y = 138 - 110 * Math.sin(angle);
  const largeArc = pct > 0.5 ? 1 : 0;

  if (summary.games === 0) {
    return (
      <div>
        <PageHeading
          title="Gamer Rating"
          subtitle="Your Trace Rating is built from your gameplay across all connected platforms."
        />
        <EmptyState
          title="No rating yet"
          body="The rating is computed from real playtime, completion and achievement rarity. Connect a platform and sync to generate it."
          cta={{ href: "/settings", label: "Connect a platform" }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeading
        title="Gamer Rating"
        subtitle="Your Trace Rating is built from your gameplay across all connected platforms."
      />

      <div
        data-cols2
        className="grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20, marginBottom: 42 }}
      >
        <IdentityCard
          displayName={user.display_name}
          avatarUrl={user.avatar_url}
          summary={summary}
          avatarSize={76}
          favourites={top.map((g) => g.name).slice(0, 5)}
        />

        <div
          className="card flex flex-col items-center justify-center text-center"
          style={{ padding: 30 }}
        >
          <svg width="260" height="150" viewBox="0 0 260 150" aria-hidden="true">
            <path
              d="M20 138 A110 110 0 0 1 240 138"
              fill="none"
              stroke="rgba(255,255,255,.08)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d={`M20 138 A110 110 0 ${largeArc} 1 ${x.toFixed(1)} ${y.toFixed(1)}`}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>
          <div className="tnum" style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-.02em", marginTop: -46 }}>
            {summary.rating}
          </div>
          <div className="eyebrow" style={{ letterSpacing: ".22em", margin: "6px 0 20px" }}>
            Trace Rating
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-2)", margin: 0, maxWidth: "40ch" }}>
            Your rating places you in the top{" "}
            <strong style={{ color: "var(--accent)" }}>{summary.percentile}%</strong> of Trace players.
            Built from {summary.games.toLocaleString()} games, {formatHours(summary.minutes)} played and{" "}
            {summary.achievementsEarned.toLocaleString()} achievements.
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 18px" }}>Trace Attributes</h2>
      <div
        data-cols3
        className="grid"
        style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 18 }}
      >
        {attributes.map((a) => (
          <div key={a.name} className="card" style={{ borderRadius: 12, padding: 20 }}>
            <div className="flex justify-between items-baseline" style={{ marginBottom: 12 }}>
              <span className="uppercase" style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".14em" }}>
                {a.name}
              </span>
              <span className="tnum" style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}>
                {a.value}
              </span>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Progress pct={a.value} />
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-3)", margin: 0 }}>{a.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
