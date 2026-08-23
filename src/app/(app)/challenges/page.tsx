import { requireUser } from "@/lib/auth";
import { ensureChallenges } from "@/lib/engine";
import { getUserSummary } from "@/lib/stats";
import { PageHead, Meter, Empty, Grid } from "@/components/app/ui";
import { Icon } from "@/components/Icon";
import { ofLabel, timeUntil } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Challenges" };

export default async function ChallengesPage() {
  const user = await requireUser();
  const summary = await getUserSummary(user.id);

  if (summary.games === 0) {
    return (
      <>
        <PageHead title="Challenges" subtitle="Written from your own library, not a generic list." />
        <Empty
          title="No challenges yet"
          body="Challenges are generated from the games you nearly finished, the ones gathering dust and the ones you never launched. They appear after your first sync."
          cta={{ href: "/settings", label: "Connect an account" }}
        />
      </>
    );
  }

  const challenges = await ensureChallenges(user.id);
  const daily = challenges.filter((c) => c.kind === "Daily");
  const weekly = challenges.filter((c) => c.kind === "Weekly");

  const Card = ({ c }: { c: (typeof challenges)[number] }) => {
    const done = Boolean(c.completed_at);
    return (
      <article
        className="card"
        style={{ padding: 20, opacity: done ? 0.6 : 1 }}
      >
        <div className="flex items-start justify-between" style={{ gap: 12, marginBottom: 12 }}>
          <h3 className="t-display" style={{ fontSize: 16 }}>
            {c.title}
          </h3>
          <span className={done ? "badge" : "badge badge-accent"}>{done ? "Done" : c.kind}</span>
        </div>
        <p className="t-body" style={{ margin: "0 0 16px", fontSize: 13.5 }}>
          {c.description}
        </p>
        <Meter pct={(c.progress / Math.max(1, c.target)) * 100} />
        <div
          className="flex items-center justify-between"
          style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}
        >
          <span className="t-sm flex items-center" style={{ gap: 7, fontSize: 12.5 }}>
            <Icon name="trophy" size={13} />
            {c.xp} XP{c.badge ? ` and ${c.badge}` : ""}
          </span>
          <span className="t-sm" style={{ fontSize: 12.5 }}>
            {c.target > 1 ? `${ofLabel(c.progress, c.target)} · ` : ""}
            {timeUntil(c.expires_at)}
          </span>
        </div>
      </article>
    );
  };

  return (
    <>
      <PageHead
        title="Challenges"
        subtitle="Generated from how you actually play. They refresh as they expire."
      />

      <div className="card" style={{ padding: "14px 18px", marginBottom: 26 }}>
        <p className="t-sm" style={{ margin: 0 }}>
          Progress currently updates when a sync detects the relevant achievements. Live tracking
          during a session is not something any platform exposes, so treat these as targets to sync
          against rather than a live counter.
        </p>
      </div>

      {daily.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 className="t-h2" style={{ marginBottom: 16 }}>
            Daily
          </h2>
          <Grid cols={2} gap={14}>
            {daily.map((c) => (
              <Card key={c.id} c={c} />
            ))}
          </Grid>
        </section>
      )}

      {weekly.length > 0 && (
        <section>
          <h2 className="t-h2" style={{ marginBottom: 16 }}>
            This week
          </h2>
          <Grid cols={2} gap={14}>
            {weekly.map((c) => (
              <Card key={c.id} c={c} />
            ))}
          </Grid>
        </section>
      )}
    </>
  );
}
