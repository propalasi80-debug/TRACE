import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getAchievements,
  getAchievementCounts,
  countAchievements,
  getPlatformBreakdown,
} from "@/lib/queries";
import { PageHead, Empty, Avatar, Meter } from "@/components/app/ui";
import { PlatformMark } from "@/components/PlatformMark";
import { ChipLink } from "@/components/app/PendingLink";
import { rarityTier, timeAgo } from "@/lib/utils";
import { PLATFORM_META, type Platform } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Achievements" };

const BANDS = [
  { key: "all", label: "All" },
  { key: "mythic", label: "Mythic" },
  { key: "ultra", label: "Ultra rare" },
  { key: "rare", label: "Rare" },
  { key: "uncommon", label: "Uncommon" },
  { key: "common", label: "Common" },
] as const;

const SORTS = [
  { key: "recent", label: "Newest" },
  { key: "rarest", label: "Rarest" },
  { key: "game", label: "By game" },
] as const;

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; p?: string; r?: string; sort?: string; page?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const state = params.state === "locked" ? "locked" : "unlocked";
  const platform = params.p ?? "all";
  const rarity = params.r && params.r !== "all" ? params.r : undefined;
  const sort = params.sort ?? "recent";
  const PER_PAGE = 60;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const filter = { state, platform, rarity, sort };

  const [rows, matching, counts, breakdown] = await Promise.all([
    getAchievements(user.id, { ...filter, limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
    countAchievements(user.id, filter),
    getAchievementCounts(user.id),
    getPlatformBreakdown(user.id),
  ]);
  const pages = Math.max(1, Math.ceil(matching / PER_PAGE));

  if (counts.total === 0) {
    return (
      <>
        <PageHead title="Achievements" subtitle="Everything you have unlocked, and everything left." />
        <Empty
          title="Nothing tracked yet"
          body="Achievements arrive with your first full sync. Steam pulls 25 games per pass, so press Sync a few times until it reports everything up to date."
          cta={{ href: "/settings", label: "Go to sync" }}
        />
      </>
    );
  }

  const link = (next: Partial<{ state: string; p: string; r: string; sort: string; page: number }>) => {
    const sp = new URLSearchParams();
    const s = next.state ?? state;
    const p = next.p ?? platform;
    const r = next.r ?? rarity ?? "all";
    const so = next.sort ?? sort;
    if (s !== "unlocked") sp.set("state", s);
    if (p !== "all") sp.set("p", p);
    if (r !== "all") sp.set("r", r);
    if (so !== "recent") sp.set("sort", so);
    // any filter change resets to the first page
    const pg = next.page ?? (Object.keys(next).some((k) => k !== "page") ? 1 : page);
    if (pg > 1) sp.set("page", String(pg));
    const qs = sp.toString();
    return qs ? `/achievements?${qs}` : "/achievements";
  };

  const pct = counts.total > 0 ? (counts.unlocked / counts.total) * 100 : 0;

  return (
    <>
      <PageHead
        title="Achievements"
        subtitle={`${counts.unlocked.toLocaleString()} unlocked of ${counts.total.toLocaleString()} tracked.`}
      />

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div className="flex items-baseline justify-between" style={{ marginBottom: 10 }}>
          <span className="t-label">Overall completion</span>
          <span className="t-num" style={{ fontSize: 18 }}>
            {Math.round(pct)}%
          </span>
        </div>
        <Meter pct={pct} />
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 16 }}>
          {BANDS.filter((b) => b.key !== "all").map((b) => {
            const n = counts.byBand[b.key] ?? 0;
            if (n === 0) return null;
            const tier = rarityTier(
              b.key === "mythic" ? 0.5 : b.key === "ultra" ? 3 : b.key === "rare" ? 10 : b.key === "uncommon" ? 25 : 60
            );
            return (
              <span key={b.key} className="badge" style={{ color: tier.color, borderColor: tier.border }}>
                {n.toLocaleString()} {b.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center" style={{ gap: 10, marginBottom: 12 }}>
        <div className="flex" style={{ gap: 6 }}>
          <ChipLink href={link({ state: "unlocked" })} active={state === "unlocked"}>
            Unlocked
          </ChipLink>
          <ChipLink href={link({ state: "locked" })} active={state === "locked"}>
            Locked
          </ChipLink>
        </div>
        <span style={{ width: 1, height: 22, background: "var(--line)" }} />
        <div className="flex flex-wrap" style={{ gap: 6 }}>
          {breakdown.length > 1 && (
            <ChipLink href={link({ p: "all" })} active={platform === "all"}>
              All platforms
            </ChipLink>
          )}
          {breakdown.length > 1 &&
            breakdown.map((b) => (
              <ChipLink key={b.platform} href={link({ p: b.platform })} active={platform === b.platform}>
                <PlatformMark platform={b.platform as Platform} size={12} />
                {PLATFORM_META[b.platform as Platform].label}
              </ChipLink>
            ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between" style={{ gap: 10, marginBottom: 22 }}>
        <div className="flex flex-wrap" style={{ gap: 6 }}>
          {BANDS.map((b) => (
            <ChipLink key={b.key} href={link({ r: b.key })} active={(rarity ?? "all") === b.key} small>
              {b.label}
            </ChipLink>
          ))}
        </div>
        {state === "unlocked" && (
          <div className="flex" style={{ gap: 6 }}>
            {SORTS.map((s) => (
              <ChipLink key={s.key} href={link({ sort: s.key })} active={sort === s.key} small>
                {s.label}
              </ChipLink>
            ))}
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <Empty
          title="Nothing matches"
          body="No achievements match those filters. Try widening the rarity band or switching platform."
        />
      ) : (
        <div className="stack" style={{ gap: 8 }}>
          {rows.map((a) => {
            const tier = rarityTier(a.rarity_pct);
            return (
              <Link
                key={a.id}
                href={a.game_id ? `/library/${a.game_id}` : "/library"}
                className="card card-hover flex items-center"
                style={{
                  gap: 14,
                  padding: "12px 16px",
                  color: "var(--text)",
                  opacity: a.unlocked_at ? 1 : 0.62,
                }}
              >
                <Avatar src={a.icon_url} size={38} radius={8} name={a.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate-1" style={{ fontSize: 13.5, fontWeight: 600 }}>
                    {a.name}
                  </div>
                  <div className="truncate-1 t-sm" style={{ fontSize: 12 }}>
                    {a.game_name}
                    {a.unlocked_at ? ` · ${timeAgo(a.unlocked_at)}` : ""}
                  </div>
                </div>
                <PlatformMark platform={a.platform} size={14} color="var(--text-5)" />
                <span
                  className="badge"
                  style={{ color: tier.color, borderColor: tier.border, minWidth: 74, justifyContent: "center" }}
                >
                  {a.rarity_pct != null ? `${a.rarity_pct.toFixed(1)}%` : tier.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <nav
          className="flex items-center justify-center flex-wrap"
          style={{ gap: 10, marginTop: 28 }}
          aria-label="Pagination"
        >
          {page > 1 ? (
            <Link href={link({ page: page - 1 })} className="btn btn-sm btn-secondary">
              Previous
            </Link>
          ) : (
            <span className="btn btn-sm btn-secondary" aria-disabled="true" style={{ opacity: 0.4 }}>
              Previous
            </span>
          )}
          <span className="t-sm tnum">
            Page {page} of {pages} · {matching.toLocaleString()} total
          </span>
          {page < pages ? (
            <Link href={link({ page: page + 1 })} className="btn btn-sm btn-secondary">
              Next
            </Link>
          ) : (
            <span className="btn btn-sm btn-secondary" aria-disabled="true" style={{ opacity: 0.4 }}>
              Next
            </span>
          )}
        </nav>
      )}
    </>
  );
}
