import { requireUser } from "@/lib/auth";
import { ensureChallenges } from "@/lib/engine";
import { getUserSummary } from "@/lib/stats";
import { PageHeading, Progress, EmptyState } from "@/components/app/ui";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Challenges · Trace" };

export default async function ChallengesPage() {
  const user = await requireUser();
  const summary = await getUserSummary(user.id);

  if (summary.games === 0) {
    return (
      <div>
        <PageHeading title="Challenges" subtitle="Generated from how you actually play." />
        <EmptyState
          title="No challenges yet"
          body="Challenges are written from your own library — the games you nearly finished, the ones gathering dust, the ones you never launched. Sync first."
          cta={{ href: "/settings", label: "Connect a platform" }}
        />
      </div>
    );
  }

  const challenges = await ensureChallenges(user.id);
  const active = challenges.find((c) => !c.completed_at);

  return (
    <div>
      <PageHeading
        title="Challenges"
        subtitle="Generated from how you actually play. Complete them to move your attributes."
      />

      {active && (
        <div
          className="card grid items-center"
          style={{
            borderColor: "rgba(46,125,255,.3)",
            padding: 26,
            marginBottom: 28,
            gridTemplateColumns: "minmax(0,1fr) auto",
            gap: 26,
          }}
        >
          <div>
            <span
              className="uppercase"
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: "var(--accent)" }}
            >
              Active · {active.kind}
            </span>
            <h2
              className="font-display font-bold uppercase"
              style={{ fontSize: 26, letterSpacing: ".05em", margin: "12px 0 8px" }}
            >
              {active.title}
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--text-2)", margin: "0 0 18px" }}>{active.description}</p>
            <div className="flex items-center gap-[14px]" style={{ maxWidth: 420 }}>
              <div className="flex-1">
                <Progress pct={(active.progress / active.target) * 100} height={6} />
              </div>
              <span style={{ fontSize: 12.5, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                {active.progress} of {active.target} · {timeAgo(active.expires_at).replace(" ago", " left")}
              </span>
            </div>
          </div>
        </div>
      )}

      <div data-cols2 className="grid" style={{ gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 }}>
        {challenges.map((c) => (
          <div key={c.id} className="card" style={{ borderRadius: 12, padding: 20 }}>
            <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
              <span
                className="font-display font-bold uppercase"
                style={{ fontSize: 18, letterSpacing: ".05em" }}
              >
                {c.title}
              </span>
              <span
                className="uppercase"
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: ".14em",
                  color: "var(--text-3)",
                  border: "1px solid rgba(255,255,255,.12)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  whiteSpace: "nowrap",
                }}
              >
                {c.kind}
              </span>
            </div>
            <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--text-2)", margin: "0 0 16px" }}>
              {c.description}
            </p>
            <div
              className="flex justify-between items-center"
              style={{
                fontSize: 12.5,
                color: "var(--text-3)",
                paddingTop: 14,
                borderTop: "1px solid var(--border)",
              }}
            >
              <span>
                {c.xp} XP{c.badge ? ` + ${c.badge}` : ""}
              </span>
              <span>{timeAgo(c.expires_at).replace(" ago", " left")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
