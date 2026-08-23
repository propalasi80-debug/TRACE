import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { countLibrary, getLibrary, getPlatformBreakdown, normaliseSort } from "@/lib/queries";
import { PageHead, Meter, CoverArt, Empty, Grid, PlatformTag } from "@/components/app/ui";
import { PlatformMark } from "@/components/PlatformMark";
import { Icon } from "@/components/Icon";
import { formatHours } from "@/lib/utils";
import type { Platform } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Library" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "steam", label: "Steam" },
  { key: "psn", label: "PlayStation" },
  { key: "xbox", label: "Xbox" },
  { key: "unplayed", label: "Unplayed" },
] as const;

const SORTS = [
  { key: "playtime", label: "Most played" },
  { key: "recent", label: "Recently played" },
  { key: "completion", label: "Most complete" },
  { key: "name", label: "Name (A to Z)" },
] as const;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; q?: string; sort?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const platform = params.p ?? "all";
  const search = params.q?.trim() ?? "";
  const sort = normaliseSort(params.sort);

  const [games, total, breakdown] = await Promise.all([
    getLibrary(user.id, { platform, search, sort }),
    countLibrary(user.id, { platform, search }),
    getPlatformBreakdown(user.id),
  ]);

  const allGames = breakdown.reduce((a, b) => a + b.games, 0);
  const allMinutes = breakdown.reduce((a, b) => a + b.minutes, 0);

  const linkFor = (next: Partial<{ p: string; q: string; sort: string }>) => {
    const sp = new URLSearchParams();
    const p = next.p ?? platform;
    const q = next.q ?? search;
    const s = next.sort ?? sort;
    if (p !== "all") sp.set("p", p);
    if (q) sp.set("q", q);
    if (s !== "playtime") sp.set("sort", s);
    const qs = sp.toString();
    return qs ? `/library?${qs}` : "/library";
  };

  if (allGames === 0) {
    return (
      <>
        <PageHead title="Library" subtitle="Every game you own, merged into one place." />
        <Empty
          title="Nothing synced yet"
          body="Connect a platform and run a sync. Your games, playtime and achievements land here."
          cta={{ href: "/settings", label: "Connect an account" }}
        />
      </>
    );
  }

  return (
    <>
      <PageHead
        title="Library"
        subtitle={`${allGames.toLocaleString()} games across ${breakdown.length} ${
          breakdown.length === 1 ? "platform" : "platforms"
        }, ${formatHours(allMinutes)} logged.`}
        actions={
          <form action="/library" className="field" style={{ minWidth: 240, maxWidth: 320 }}>
            {platform !== "all" && <input type="hidden" name="p" value={platform} />}
            {sort !== "playtime" && <input type="hidden" name="sort" value={sort} />}
            <span style={{ color: "var(--text-4)", display: "flex" }}>
              <Icon name="search" size={15} />
            </span>
            <input
              name="q"
              defaultValue={search}
              placeholder="Search your library"
              aria-label="Search your library"
            />
            <button type="submit" className="sr-only">
              Search
            </button>
          </form>
        }
      />

      <div
        className="flex flex-wrap items-center justify-between"
        style={{ gap: 12, marginBottom: 22 }}
      >
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? allGames
                : f.key === "unplayed"
                  ? undefined
                  : breakdown.find((b) => b.platform === f.key)?.games;
            if (f.key !== "all" && f.key !== "unplayed" && !count) return null;
            return (
              <Link
                key={f.key}
                href={linkFor({ p: f.key })}
                className="chip"
                data-active={platform === f.key}
              >
                {f.key !== "all" && f.key !== "unplayed" && (
                  <PlatformMark platform={f.key as Platform} size={12} />
                )}
                {f.label}
                {count !== undefined && (
                  <span className="tnum" style={{ color: "var(--text-4)" }}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center" style={{ gap: 8 }}>
          <span className="t-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="sort" size={13} />
            Sort
          </span>
          <div className="flex flex-wrap" style={{ gap: 6 }}>
            {SORTS.map((s) => (
              <Link
                key={s.key}
                href={linkFor({ sort: s.key })}
                className="chip"
                data-active={sort === s.key}
                style={{ minHeight: 30, fontSize: 12, padding: "0 10px" }}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {search && (
        <p className="t-sm" style={{ marginBottom: 16 }}>
          {total.toLocaleString()} {total === 1 ? "result" : "results"} for &ldquo;{search}&rdquo;.{" "}
          <Link href={linkFor({ q: "" })}>Clear search</Link>
        </p>
      )}

      {games.length === 0 ? (
        <Empty
          title="No matches"
          body={
            search
              ? `Nothing in your library matches "${search}". Try a shorter search, or clear the filters.`
              : "No games match those filters."
          }
        />
      ) : (
        <Grid min={172} gap={14}>
          {games.map((g) => (
            <article key={g.id} className="card card-hover" style={{ overflow: "hidden" }}>
              <CoverArt
                src={g.cover_url}
                name={g.name}
                corner={<PlatformTag platform={g.platform as Platform} />}
              />
              <div style={{ padding: "12px 14px" }}>
                <div className="flex justify-between" style={{ fontSize: 12, marginBottom: 8 }}>
                  <span className="tnum" style={{ color: "var(--text-3)" }}>
                    {user.show_playtime ? formatHours(g.playtime_minutes) : "Hidden"}
                  </span>
                  <span className="tnum" style={{ color: "var(--text-4)" }}>
                    {g.achievements_total > 0
                      ? `${g.achievements_earned}/${g.achievements_total}`
                      : "No achievements"}
                  </span>
                </div>
                <Meter pct={g.completion_pct} />
              </div>
            </article>
          ))}
        </Grid>
      )}

      {games.length >= 400 && (
        <p className="t-sm" style={{ marginTop: 20, textAlign: "center" }}>
          Showing the first 400 of {total.toLocaleString()}. Narrow it with search or a filter.
        </p>
      )}
    </>
  );
}
