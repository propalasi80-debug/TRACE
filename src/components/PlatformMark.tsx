import { PLATFORM_BRANDS, type PlatformKey } from "@/lib/platforms/registry";

/**
 * Renders a platform's official mark where one is available under a licence we
 * can ship, and a clean wordmark where it is not. No lookalike glyphs.
 */
export function PlatformMark({
  platform,
  size = 20,
  color,
  className,
}: {
  platform: PlatformKey;
  size?: number;
  color?: string;
  className?: string;
}) {
  const brand = PLATFORM_BRANDS[platform];
  const fill = color ?? brand.color;

  if (brand.path) {
    return (
      <svg
        role="img"
        aria-label={brand.label}
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={fill}
        className={className}
        style={{ display: "block", flex: "none" }}
      >
        <path d={brand.path} />
      </svg>
    );
  }

  return (
    <span
      aria-label={brand.label}
      role="img"
      className={className}
      style={{
        display: "grid",
        placeItems: "center",
        width: size,
        height: size,
        flex: "none",
        fontFamily: "var(--font-display)",
        fontStretch: "112%",
        fontWeight: 700,
        fontSize: Math.max(9, Math.round(size * 0.42)),
        letterSpacing: "0.04em",
        color: fill,
        border: `1.5px solid ${fill}`,
        borderRadius: 4,
      }}
    >
      {brand.short}
    </span>
  );
}
