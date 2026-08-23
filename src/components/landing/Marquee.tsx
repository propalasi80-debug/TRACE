import { PlatformMark } from "@/components/PlatformMark";
import { MARQUEE_ORDER, PLATFORM_BRANDS } from "@/lib/platforms/registry";

function Tile({
  platformKey,
  count,
  duplicate,
}: {
  platformKey: (typeof MARQUEE_ORDER)[number];
  count: number;
  duplicate?: boolean;
}) {
  const brand = PLATFORM_BRANDS[platformKey];
  const status = brand.live
    ? count > 0
      ? `${count.toLocaleString()} games tracked`
      : "Ready to connect"
    : "Not yet supported";

  return (
    <div
      aria-hidden={duplicate}
      className="flex items-center"
      style={{
        gap: 14,
        padding: "16px 22px",
        minWidth: 232,
        border: `1px solid ${brand.live ? "var(--line-2)" : "var(--line)"}`,
        borderRadius: "var(--r-md)",
        background: "var(--surface)",
        whiteSpace: "nowrap",
        opacity: brand.live ? 1 : 0.62,
      }}
    >
      <span
        className="grid place-items-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--r-sm)",
          background: "var(--surface-3)",
          border: "1px solid var(--line)",
          flex: "none",
        }}
      >
        <PlatformMark platform={platformKey} size={20} />
      </span>
      <span className="stack" style={{ gap: 3 }}>
        <span className="t-h3" style={{ fontSize: 14.5 }}>
          {brand.label}
        </span>
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: brand.live ? "var(--text-4)" : "var(--text-5)",
          }}
        >
          {status}
        </span>
      </span>
    </div>
  );
}

export function PlatformMarquee({ perPlatform }: { perPlatform: Record<string, number> }) {
  const count = (k: string) => perPlatform[k] ?? 0;
  const lane = [...MARQUEE_ORDER, ...MARQUEE_ORDER];

  return (
    <div data-marquee-row style={{ overflow: "hidden", padding: "4px 0" }}>
      <div
        data-marquee
        className="flex"
        style={{ gap: 14, width: "max-content", animationDuration: "56s" }}
      >
        {lane.map((k, i) => (
          <Tile
            key={`${k}-${i}`}
            platformKey={k}
            count={count(k)}
            duplicate={i >= MARQUEE_ORDER.length}
          />
        ))}
      </div>
    </div>
  );
}

export function TitleMarquee({ games }: { games: { title: string; hours: number }[] }) {
  if (games.length === 0) return null;
  const lane = [...games, ...games];

  return (
    <div data-marquee-row style={{ overflow: "hidden", padding: "4px 0" }}>
      <div
        data-marquee
        className="flex"
        style={{
          gap: 10,
          width: "max-content",
          animationDuration: "72s",
          animationDirection: "reverse",
        }}
      >
        {lane.map((g, i) => (
          <div
            key={`${g.title}-${i}`}
            aria-hidden={i >= games.length}
            className="flex items-baseline"
            style={{
              gap: 12,
              padding: "10px 16px",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-sm)",
              background: "var(--surface)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text-2)" }}>
              {g.title}
            </span>
            <span className="t-num" style={{ fontSize: 12, color: "var(--accent-text)" }}>
              {g.hours.toLocaleString()}h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
