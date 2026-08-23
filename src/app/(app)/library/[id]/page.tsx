import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getGameDetail, getGameAchievements } from "@/lib/queries";
import { CoverArt, Meter, PlatformTag, Avatar, Stat, Empty } from "@/components/app/ui";
import { Icon } from "@/components/Icon";
import { formatHours, rarityTier, timeAgo } from "@/lib/utils";
import { PLATFORM_META, type Platform } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const game = await getGameDetail(user.id, id).catch(() => null);
  return { title: game?.name ?? "Game" };
}

const STORE_URL: Partial<Record<Platform, (id: string) => string>> = {
  steam: (id) => `https://store.steampowered.com/app/${id}`,
};

export default async function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const game = await getGameDetail(user.id, id);
  if (!game) notFound();

  const achievements = await getGameAchievements(user.id, id);
  const unlocked = achievements.filter((a) => a.unlocked_at);
  const locked = achievements.filter((a) => !a.unlocked_at);
  const platform = game.platform as Platform;
  const store = STORE_URL[platform]?.(game.platform_game_id);

  return (
    <>
      <Link href="/library" className="t-sm flex items-center" style={{ gap: 6, marginBottom: 18 }}>
        <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
          <Icon name="arrowRight" size={14} />
        </span>
        Back to library
      </Link>

      <div
        data-split
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 220px) minmax(0, 1fr)",
          gap: 24,
          marginBottom: 36,
        }}
      >
        <div className="card" style={{ overflow: "hidden", alignSelf: "start" }}>
          <CoverArt src={game.cover_url} name={game.name} corner={<PlatformTag platform={platform} />} />
        </div>

        <div>
          <h1 className="t-h1" style={{ marginBottom: 10 }}>
            {game.name}
          </h1>
          <p className="t-sm" style={{ margin: "0 0 22px" }}>
            {PLATFORM_META[platform].label}
            {game.last_played_at ? ` · last played ${timeAgo(game.last_played_at)}` : " · never played"}
          </p>

          <div
            data-cols="4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 10,
              maxWidth: 460,
              marginBottom: 22,
            }}
          >
            <Stat
              value={user.show_playtime ? formatHours(game.playtime_minutes) : "Hidden"}
              label="Playtime"
            />
            <Stat
              value={game.achievements_total > 0 ? `${game.achievements_earned}/${game.achievements_total}` : "n/a"}
              label="Unlocked"
            />
            <Stat
              value={game.achievements_total > 0 ? `${Math.round(game.completion_pct)}%` : "n/a"}
              label="Complete"
              tone="accent"
            />
          </div>

          {game.achievements_total > 0 && (
            <div style={{ maxWidth: 460, marginBottom: 22 }}>
              <Meter pct={game.completion_pct} />
            </div>
          )}

          {store && (
            <a href={store} target="_blank" rel="noreferrer noopener" className="btn btn-secondary btn-sm">
              View on Steam
              <Icon name="external" size={13} />
            </a>
          )}
        </div>
      </div>

      {achievements.length === 0 ? (
        <Empty
          title="No achievements tracked"
          body={
            game.achievements_total === 0
              ? "This title does not report achievements, or its list has not been pulled yet. Run a sync from Settings to fill in anything outstanding."
              : "Achievements for this title have not been pulled yet. Run a sync from Settings."
          }
          cta={{ href: "/settings", label: "Go to sync" }}
        />
      ) : (
        <>
          <section style={{ marginBottom: 32 }}>
            <h2 className="t-h2" style={{ marginBottom: 16 }}>
              Unlocked
              <span className="tnum" style={{ color: "var(--text-4)", marginLeft: 8, fontSize: 15 }}>
                {unlocked.length}
              </span>
            </h2>
            {unlocked.length === 0 ? (
              <p className="t-sm">Nothing unlocked here yet.</p>
            ) : (
              <div className="stack" style={{ gap: 8 }}>
                {unlocked.map((a) => (
                  <AchievementRowView key={a.id} a={a} />
                ))}
              </div>
            )}
          </section>

          {locked.length > 0 && (
            <section>
              <h2 className="t-h2" style={{ marginBottom: 16 }}>
                Still locked
                <span className="tnum" style={{ color: "var(--text-4)", marginLeft: 8, fontSize: 15 }}>
                  {locked.length}
                </span>
              </h2>
              <div className="stack" style={{ gap: 8 }}>
                {locked.map((a) => (
                  <AchievementRowView key={a.id} a={a} dim />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function AchievementRowView({
  a,
  dim,
}: {
  a: Awaited<ReturnType<typeof getGameAchievements>>[number];
  dim?: boolean;
}) {
  const tier = rarityTier(a.rarity_pct);
  return (
    <div
      className="card flex items-center"
      style={{ gap: 14, padding: "12px 16px", opacity: dim ? 0.55 : 1 }}
    >
      <Avatar src={a.icon_url} size={38} radius={8} name={a.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.name}</div>
        {a.description && (
          <div className="truncate-1 t-sm" style={{ fontSize: 12 }}>
            {a.description}
          </div>
        )}
      </div>
      {a.unlocked_at && (
        <span className="t-sm" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
          {timeAgo(a.unlocked_at)}
        </span>
      )}
      <span className="badge" style={{ color: tier.color, borderColor: tier.border }}>
        {a.rarity_pct != null ? `${a.rarity_pct.toFixed(1)}%` : tier.label}
      </span>
    </div>
  );
}
