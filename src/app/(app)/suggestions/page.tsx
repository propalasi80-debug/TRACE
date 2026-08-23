import { requireUser } from "@/lib/auth";
import { getRecommendations } from "@/lib/engine";
import { getUserSummary } from "@/lib/stats";
import { PageHead, Empty, Grid } from "@/components/app/ui";
import { ChipLink } from "@/components/app/PendingLink";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suggestions" };

const TAGS = ["All", "Action", "Roguelike", "Metroidvania", "Co-op", "Under 20 hours"];

export default async function SuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const user = await requireUser();
  const [summary, params] = await Promise.all([getUserSummary(user.id), searchParams]);
  const tag = params.tag && TAGS.includes(params.tag) ? params.tag : "All";

  if (summary.games === 0) {
    return (
      <>
        <PageHead
          title="Suggestions"
          subtitle="Scored against your own attribute profile rather than a generic popularity list."
        />
        <Empty
          title="Nothing to score against yet"
          body="Suggestions are ranked using your attributes, which are computed from a synced library. Connect a platform first."
          cta={{ href: "/settings", label: "Connect an account" }}
        />
      </>
    );
  }

  const all = await getRecommendations(user.id, 12);
  const list = tag === "All" ? all : all.filter((r) => r.tags.includes(tag));

  return (
    <>
      <PageHead
        title="Suggestions"
        subtitle="Scored against your own attribute profile. Recomputed every time you sync."
      />

      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 24 }}>
        {TAGS.map((t) => {
          const count = t === "All" ? all.length : all.filter((r) => r.tags.includes(t)).length;
          if (count === 0 && t !== "All") return null;
          return (
            <ChipLink
              key={t}
              href={t === "All" ? "/suggestions" : `/suggestions?tag=${encodeURIComponent(t)}`}
              active={tag === t}
            >
              {t}
              <span className="tnum" style={{ color: "var(--text-4)" }}>
                {count}
              </span>
            </ChipLink>
          );
        })}
      </div>

      {list.length === 0 ? (
        <Empty title="Nothing in that filter" body="Try another tag. The catalogue is still small." />
      ) : (
        <Grid cols={2} gap={16}>
          {list.map((s) => (
            <article key={s.title} className="card card-hover" style={{ padding: 22 }}>
              <div className="flex items-start justify-between" style={{ gap: 14, marginBottom: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <h2 className="t-h2" style={{ fontSize: 17 }}>
                    {s.title}
                  </h2>
                  <div className="t-label" style={{ fontSize: 10, marginTop: 6 }}>
                    {s.meta}
                  </div>
                </div>
                <div style={{ textAlign: "right", flex: "none" }}>
                  <div className="t-num" style={{ fontSize: 24, color: "var(--accent-text)" }}>
                    {s.match}%
                  </div>
                  <div className="t-label" style={{ fontSize: 9, marginTop: 2 }}>
                    match
                  </div>
                </div>
              </div>
              <p className="t-body" style={{ margin: 0, fontSize: 13.5 }}>
                {s.why}
              </p>
            </article>
          ))}
        </Grid>
      )}

      <p className="t-sm" style={{ marginTop: 24, maxWidth: "70ch" }}>
        Suggestions are drawn from a small hand written catalogue and weighted against your
        attributes. Nothing here is sponsored, and nothing is inferred from data TRACE does not have.
      </p>
    </>
  );
}
