const PLATFORM_TILES = [
  { name: "Steam", key: "steam", c: "#66C0F4", d: "M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8M3 15.6l4.4 1.8M16.4 6.4a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2M13.9 12.6a3 3 0 1 1-5.6 2.2 3 3 0 0 1 5.6-2.2" },
  { name: "PlayStation", key: "psn", c: "#2E7DFF", d: "M9.4 20.4V4l6 2v10.2M4 15.4l7 2.6M13 17l7-2.4-5-1.6" },
  { name: "Xbox", key: "xbox", c: "#52B043", d: "M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8M5.6 5.2C9 8 12 11.6 14.4 15.8M18.4 5.2C15 8 12 11.6 9.6 15.8" },
  { name: "Epic Games", key: "epic", c: "#F5F6F7", d: "M4.6 2.6h14.8v13l-7.4 5.8-7.4-5.8zM9 7h6M9 11h4.6M9 15h6" },
  { name: "Nintendo", key: "nintendo", c: "#E4404A", d: "M8.4 3h7.2A3.4 3.4 0 0 1 19 6.4v11.2A3.4 3.4 0 0 1 15.6 21H8.4A3.4 3.4 0 0 1 5 17.6V6.4A3.4 3.4 0 0 1 8.4 3M12 3v18M8.4 8.4v.1" },
  { name: "GOG", key: "gog", c: "#A05CE0", d: "M3.4 6.6h17.2v10.8H3.4zM7.6 10h3.2v4H7.6zM14 10h2.8M14 14h2.8" },
  { name: "Battle.net", key: "battlenet", c: "#00AEFF", d: "M12 3.4c3 3.4 3 13.8 0 17.2-3-3.4-3-13.8 0-17.2M3.4 12c3.4-3 13.8-3 17.2 0-3.4 3-13.8 3-17.2 0" },
  { name: "Riot", key: "riot", c: "#FF4655", d: "M3.6 5.4 20.4 9v9.6H8.4L6.8 12l9.4 2.2" },
  { name: "itch.io", key: "itch", c: "#FA5C5C", d: "M3.4 7.6 6 4.4h12l2.6 3.2v2.2a2.2 2.2 0 0 1-4.4 0 2.2 2.2 0 0 1-4.4 0 2.2 2.2 0 0 1-4.4 0 2.2 2.2 0 0 1-4.4 0zM5 11.6V19.6h14v-8" },
];

const LIVE = new Set(["steam", "psn", "xbox"]);

function Tile({ p, meta, hidden }: { p: (typeof PLATFORM_TILES)[number]; meta: string; hidden?: boolean }) {
  return (
    <div
      data-brand
      aria-hidden={hidden}
      className="relative flex items-center gap-[18px] whitespace-nowrap overflow-hidden"
      style={{
        padding: "20px 28px",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 18,
        background: "linear-gradient(152deg,rgba(255,255,255,.055),rgba(255,255,255,.012))",
        boxShadow: `0 0 0 1px ${p.c}2e, 0 18px 44px -24px ${p.c}`,
      }}
    >
      <span className="absolute inset-0 pointer-events-none" style={{ background: `${p.c}14` }} />
      <span
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg,${p.c}00,${p.c}99,${p.c}00)` }}
      />
      <span
        className="relative grid place-items-center"
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "rgba(255,255,255,.05)",
          border: "1px solid rgba(255,255,255,.1)",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={p.c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={p.d} />
        </svg>
      </span>
      <span className="relative flex flex-col gap-1">
        <span className="font-display font-bold uppercase" style={{ fontSize: 21, letterSpacing: ".13em" }}>
          {p.name}
        </span>
        <span className="uppercase" style={{ fontSize: 11.5, letterSpacing: ".16em", color: "var(--text-4)" }}>
          {meta}
        </span>
      </span>
    </div>
  );
}

export function Marquee({
  perPlatform,
  topGames,
}: {
  perPlatform: Record<string, number>;
  topGames: { title: string; hours: number }[];
}) {
  const metaFor = (k: string) => {
    if (!LIVE.has(k)) return "Coming soon";
    const n = perPlatform[k] ?? 0;
    return n > 0 ? `${n.toLocaleString()} games` : "Connect now";
  };

  const games =
    topGames.length > 0
      ? topGames
      : [
          { title: "Elden Ring", hours: 0 },
          { title: "Counter-Strike 2", hours: 0 },
          { title: "Hades", hours: 0 },
          { title: "Hollow Knight", hours: 0 },
          { title: "Baldur's Gate 3", hours: 0 },
          { title: "God of War Ragnarok", hours: 0 },
          { title: "Forza Horizon 5", hours: 0 },
          { title: "Returnal", hours: 0 },
        ];

  const words = ["Rating", "·", "Library", "·", "Attributes", "·", "Challenges", "·", "Timeline", "·"];

  return (
    <section className="relative" style={{ padding: "26px 0 96px" }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          inset: "-40px 0 20px",
          background: "radial-gradient(60% 70% at 50% 40%,rgba(46,125,255,.16),transparent 72%)",
        }}
      />

      <div data-mqrow className="relative overflow-hidden" style={{ padding: "10px 0" }}>
        <div data-mq className="flex gap-[18px] w-max" style={{ animation: "mqA 42s linear infinite" }}>
          {PLATFORM_TILES.map((p) => (
            <Tile key={p.key} p={p} meta={metaFor(p.key)} />
          ))}
          {PLATFORM_TILES.map((p) => (
            <Tile key={`d-${p.key}`} p={p} meta={metaFor(p.key)} hidden />
          ))}
        </div>
      </div>

      <div data-mqrow className="overflow-hidden" style={{ padding: "10px 0" }}>
        <div
          data-mq
          className="flex gap-[14px] w-max"
          style={{ animation: "mqB 58s linear infinite", animationDirection: "reverse" }}
        >
          {[...games, ...games].map((g, i) => (
            <div
              key={i}
              data-brand
              aria-hidden={i >= games.length}
              className="flex items-baseline gap-[14px] whitespace-nowrap"
              style={{
                padding: "14px 22px",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 12,
                background: "linear-gradient(150deg,rgba(255,255,255,.045),rgba(255,255,255,.008))",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(245,246,247,.82)" }}>{g.title}</span>
              {g.hours > 0 && (
                <span className="tnum" style={{ fontSize: 12.5, color: "#8FB7FF", textShadow: "0 0 16px rgba(46,125,255,.7)" }}>
                  {g.hours.toLocaleString()}h
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div data-mqrow className="overflow-hidden" style={{ padding: "10px 0" }}>
        <div data-mq className="flex w-max" style={{ animation: "mqA 74s linear infinite" }}>
          {[...words, ...words].map((w, i) => (
            <span
              key={i}
              aria-hidden={i >= words.length}
              className="font-display font-bold uppercase whitespace-nowrap"
              style={{
                fontSize: 74,
                letterSpacing: ".06em",
                color: "transparent",
                WebkitTextStroke: "1px rgba(143,183,255,.22)",
                padding: "0 28px",
              }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
