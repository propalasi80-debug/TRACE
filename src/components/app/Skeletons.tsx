/**
 * Shared loading shapes.
 *
 * Each route's loading.tsx composes these so the skeleton matches the layout
 * that is about to appear. A skeleton that looks nothing like the real page is
 * worse than a spinner, because the content jumps when it arrives.
 */

export function Bar({
  w = "100%",
  h = 14,
  r = 6,
  mb = 0,
}: {
  w?: number | string;
  h?: number;
  r?: number;
  mb?: number;
}) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />;
}

export function SkeletonHead({ withAction }: { withAction?: boolean }) {
  return (
    <div
      className="flex items-end justify-between flex-wrap"
      style={{ gap: 16, marginBottom: 28 }}
    >
      <div style={{ flex: 1, minWidth: 220 }}>
        <Bar w={130} h={30} r={8} mb={12} />
        <Bar w="min(420px, 70%)" h={13} />
      </div>
      {withAction && <Bar w={200} h={44} r={10} />}
    </div>
  );
}

export function SkeletonChips({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 22 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Bar key={i} w={72 + ((i * 29) % 60)} h={34} r={6} />
      ))}
    </div>
  );
}

export function SkeletonCovers({ count = 12, min = 172 }: { count?: number; min?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
        gap: 14,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ overflow: "hidden" }}>
          <div className="skeleton" style={{ aspectRatio: "3 / 4", borderRadius: 0 }} />
          <div style={{ padding: "12px 14px" }}>
            <Bar h={11} mb={9} />
            <Bar h={4} r={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ count = 8, height = 62 }: { count?: number; height?: number }) {
  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card flex items-center"
          style={{ gap: 14, padding: "12px 16px", height }}
        >
          <Bar w={38} h={38} r={8} />
          <div style={{ flex: 1 }}>
            <Bar w={`${34 + ((i * 13) % 40)}%`} h={12} mb={7} />
            <Bar w={`${22 + ((i * 17) % 28)}%`} h={10} />
          </div>
          <Bar w={64} h={22} r={6} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPanels({
  cols = 3,
  height = 150,
  count,
}: {
  cols?: number;
  height?: number;
  count?: number;
}) {
  return (
    <div
      data-cols={String(cols)}
      style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 14 }}
    >
      {Array.from({ length: count ?? cols }).map((_, i) => (
        <Bar key={i} h={height} r={14} />
      ))}
    </div>
  );
}
