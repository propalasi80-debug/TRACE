import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getRecommendations } from "@/lib/engine";
import { getUserSummary } from "@/lib/stats";
import { PageHeading, EmptyState } from "@/components/app/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suggestions · Trace" };

const FILTERS = ["All", "Action", "Roguelike", "Metroidvania", "Co-op", "Under 20 hours"];

export default async function SuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const user = await requireUser();
  const [summary, params] = await Promise.all([getUserSummary(user.id), searchParams]);
  const tag = params.tag ?? "All";

  if (summary.games === 0) {
    return (
      <div>
        <PageHeading title="Suggestions" subtitle="Ranked against your attributes, playtime and completion habits." />
        <EmptyState
          title="Nothing to rank against yet"
          body="Suggestions are scored against your own attribute profile, so they need a synced library first."
          cta={{ href: "/settings", label: "Connect a platform" }}
        />
      </div>
    );
  }

  const all = await getRecommendations(user.id, 12);
  const list = tag === "All" ? all : all.filter((r) => r.tags.includes(tag));

  return (
    <div>
      <PageHeading
        title="Suggestions"
        subtitle="Ranked against your attributes, playtime and completion habits. Recomputed every time you sync."
      />

      <div className="flex flex-wrap gap-[9px]" style={{ marginBottom: 28 }}>
        {FILTERS.map((f) => {
          const on = tag === f;
          return (
            <Link
              key={f}
              href={f === "All" ? "/suggestions" : `/suggestions?tag=${encodeURIComponent(f)}`}
              data-chip
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: on ? "var(--text)" : "var(--text-2)",
                background: on ? "rgba(46,125,255,.16)" : "var(--surface)",
                border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 8,
                minHeight: 36,
                padding: "0 14px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {f}
            </Link>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState title="No matches in that filter" body="Try a different tag — the catalogue is still growing." />
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((s) => (
            <div
              key={s.title}
              className="card grid items-center"
              style={{ gridTemplateColumns: "180px minmax(0,1fr) auto", gap: 22, padding: "16px 20px" }}
            >
              <div
                className="grid place-items-center uppercase"
                style={{
                  aspectRatio: "16/9",
                  borderRadius: 9,
                  background: "var(--surface-5)",
                  fontSize: 10,
                  letterSpacing: ".2em",
                  color: "var(--text-5)",
                }}
              >
                {s.meta.split(" · ")[0]}
              </div>
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span style={{ fontSize: 17, fontWeight: 700 }}>{s.title}</span>
                  <span style={{ fontSize: 12.5, color: "var(--text-4)" }}>{s.meta}</span>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text-2)", margin: "8px 0 0", maxWidth: "74ch" }}>
                  {s.why}
                </p>
              </div>
              <div className="text-right">
                <div className="tnum" style={{ fontSize: 26, fontWeight: 700, color: "var(--accent)" }}>
                  {s.match}%
                </div>
                <div
                  className="uppercase"
                  style={{ fontSize: 9.5, letterSpacing: ".18em", color: "var(--text-4)" }}
                >
                  Match
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
