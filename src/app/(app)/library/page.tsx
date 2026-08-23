import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getLibrary, getPlatformBreakdown } from "@/lib/queries";
import { PageHeading, Progress, GameArt, EmptyState } from "@/components/app/ui";
import { PLATFORM_META, type Platform } from "@/lib/types";
import { formatHours } from "@/lib/utils";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Library · Trace" };

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All platforms" },
  { key: "steam", label: "Steam" },
  { key: "psn", label: "PlayStation" },
  { key: "xbox", label: "Xbox" },
  { key: "unplayed", label: "Unplayed" },
];

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; q?: string; sort?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const platform = params.p ?? "all";
  const search = params.q ?? "";

  const [games, breakdown] = await Promise.all([
    getLibrary(user.id, { platform, search, sort: params.sort }),
    getPlatformBreakdown(user.id),
  ]);

  const totalGames = breakdown.reduce((a, b) => a + b.games, 0);
  const totalMinutes = breakdown.reduce((a, b) => a + b.minutes, 0);
  const chipHref = (key: string) => {
    const sp = new URLSearchParams();
    if (key !== "all") sp.set("p", key);
    if (search) sp.set("q", search);
    if (params.sort) sp.set("sort", params.sort);
    const qs = sp.toString();
    return qs ? `/library?${qs}` : "/library";
  };

  return (
    <div>
      <PageHeading
        title="Library"
        subtitle={
          totalGames > 0
            ? `${totalGames.toLocaleString()} games across ${breakdown.length} connected ${
                breakdown.length === 1 ? "platform" : "platforms"
              } · ${formatHours(totalMinutes)} logged`
            : "Nothing here yet."
        }
        right={
          <form action="/library" className="field" style={{ height: 42, minWidth: 260 }}>
            {platform !== "all" && <input type="hidden" name="p" value={platform} />}
            <span style={{ color: "rgba(245,246,247,.45)" }}>
              <Icon name="search" size={15} />
            </span>
            <input name="q" defaultValue={search} placeholder="Search your library" style={{ fontSize: 13.5 }} />
          </form>
        }
      />

      <div className="flex flex-wrap gap-[9px]" style={{ marginBottom: 26 }}>
        {FILTERS.map((f) => {
          const on = platform === f.key;
          return (
            <Link
              key={f.key}
              href={chipHref(f.key)}
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
              {f.label}
            </Link>
          );
        })}
      </div>

      {games.length === 0 ? (
        <EmptyState
          title={search ? "No matches" : "Your library is empty"}
          body={
            search
              ? `Nothing in your library matches “${search}”.`
              : "Connect a platform and run a sync — your games, playtime and achievements land here."
          }
          cta={search ? undefined : { href: "/settings", label: "Connect a platform" }}
        />
      ) : (
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(178px,1fr))", gap: 16 }}
        >
          {games.map((g) => (
            <div key={g.id} className="card" style={{ borderRadius: 12, overflow: "hidden" }}>
              <GameArt src={g.cover_url} name={g.name}>
                <span className="absolute" style={{ top: 10, left: 10, zIndex: 2 }}>
                  <span
                    className="uppercase"
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: ".14em",
                      background: "rgba(0,0,0,.6)",
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 5,
                      padding: "3px 7px",
                      color: "rgba(245,246,247,.7)",
                    }}
                  >
                    {PLATFORM_META[g.platform as Platform].label}
                  </span>
                </span>
              </GameArt>
              <div style={{ padding: "13px 14px" }}>
                <div
                  className="flex justify-between"
                  style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 9 }}
                >
                  <span className="tnum">{formatHours(g.playtime_minutes)}</span>
                  <span className="tnum">
                    {g.achievements_total > 0 ? `${Math.round(g.completion_pct)}% done` : "—"}
                  </span>
                </div>
                <Progress pct={g.completion_pct} height={4} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
