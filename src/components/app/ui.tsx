import Link from "next/link";
import type { ReactNode } from "react";
import { PlatformMark } from "@/components/PlatformMark";
import { PLATFORM_BRANDS } from "@/lib/platforms/registry";
import { PLATFORM_META, type Platform } from "@/lib/types";

export function PageHead({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className="flex flex-wrap items-end justify-between"
      style={{ gap: 16, marginBottom: 28 }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div className="t-label" style={{ marginBottom: 10 }}>
            {eyebrow}
          </div>
        )}
        <h1 className="t-h1">{title}</h1>
        {subtitle && (
          <p className="t-sm" style={{ margin: "8px 0 0", maxWidth: "68ch" }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}

export function Stat({
  value,
  label,
  tone = "default",
}: {
  value: string | number;
  label: string;
  tone?: "default" | "accent";
}) {
  return (
    <div className="tile" style={{ padding: "16px 14px" }}>
      <div
        className="t-num"
        style={{ fontSize: 22, color: tone === "accent" ? "var(--accent-text)" : "var(--text)" }}
      >
        {value}
      </div>
      <div className="t-label" style={{ fontSize: 9.5, letterSpacing: "0.16em", marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}

export function Meter({ pct }: { pct: number }) {
  const v = Math.max(0, Math.min(100, pct));
  return (
    <div className="meter" role="presentation">
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function PlatformTag({ platform }: { platform: Platform }) {
  // Platforms without a licensable mark already render as lettering, so showing
  // the glyph and the name together would read as "XB Xbox".
  const hasGlyph = Boolean(PLATFORM_BRANDS[platform].path);
  return (
    <span className="badge" style={{ background: "rgba(5,6,9,0.72)", gap: 5 }}>
      {hasGlyph && <PlatformMark platform={platform} size={11} />}
      {PLATFORM_META[platform].label}
    </span>
  );
}

export function Avatar({
  src,
  size = 44,
  radius = 10,
  name,
}: {
  src?: string | null;
  size?: number;
  radius?: number;
  name?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          objectFit: "cover",
          flex: "none",
          border: "1px solid var(--line)",
        }}
      />
    );
  }
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "";
  return (
    <div
      aria-hidden="true"
      className="grid place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "var(--surface-3)",
        border: "1px solid var(--line)",
        color: "var(--text-4)",
        fontFamily: "var(--font-display)",
        fontStretch: "110%",
        fontWeight: 700,
        fontSize: Math.max(11, Math.round(size * 0.36)),
        flex: "none",
      }}
    >
      {initial}
    </div>
  );
}

export function CoverArt({
  src,
  name,
  ratio = "3 / 4",
  corner,
}: {
  src?: string | null;
  name: string;
  ratio?: string;
  corner?: ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: ratio,
        background: "var(--surface-3)",
        display: "grid",
        alignItems: "end",
        padding: 12,
        overflow: "hidden",
      }}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: src
            ? "linear-gradient(180deg, rgba(5,6,9,0.1) 30%, rgba(5,6,9,0.88) 100%)"
            : "linear-gradient(180deg, transparent, rgba(5,6,9,0.4))",
        }}
      />
      {corner && (
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}>{corner}</div>
      )}
      <span
        style={{
          position: "relative",
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.3,
          textWrap: "balance",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {name}
      </span>
    </div>
  );
}

export function Empty({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div
      className="card"
      style={{ padding: "clamp(36px, 6vw, 60px) 28px", textAlign: "center" }}
    >
      <h2 className="t-display" style={{ fontSize: 18, marginBottom: 12 }}>
        {title}
      </h2>
      <p
        className="t-body"
        style={{ margin: "0 auto", maxWidth: "50ch" }}
      >
        {body}
      </p>
      {cta && (
        <div style={{ marginTop: 24 }}>
          <Link href={cta.href} className="btn btn-primary">
            {cta.label}
          </Link>
        </div>
      )}
    </div>
  );
}

export function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "ok" | "bad";
  children: ReactNode;
}) {
  const tone = {
    info: { border: "var(--accent-45)", bg: "var(--accent-08)", color: "var(--text-2)" },
    ok: { border: "rgba(62,207,142,0.32)", bg: "var(--ok-bg)", color: "var(--ok)" },
    bad: { border: "rgba(255,107,107,0.32)", bg: "var(--bad-bg)", color: "var(--bad)" },
  }[kind];

  return (
    <p
      role={kind === "bad" ? "alert" : "status"}
      style={{
        fontSize: 13.5,
        lineHeight: 1.55,
        border: `1px solid ${tone.border}`,
        background: tone.bg,
        color: tone.color,
        borderRadius: "var(--r-sm)",
        padding: "11px 14px",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

export function RatingPill({ value, delta }: { value: number; delta?: number }) {
  return (
    <span className="flex items-center" style={{ gap: 8 }}>
      <span className="t-num" style={{ fontSize: 15 }}>
        {value.toLocaleString()}
      </span>
      {delta !== undefined && delta !== 0 && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: delta > 0 ? "var(--ok)" : "var(--bad)",
          }}
        >
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      )}
    </span>
  );
}

export function Grid({
  cols,
  gap = 16,
  children,
  min,
}: {
  cols?: 2 | 3 | 4;
  gap?: number;
  min?: number;
  children: ReactNode;
}) {
  return (
    <div
      data-cols={cols ? String(cols) : undefined}
      style={{
        display: "grid",
        gap,
        gridTemplateColumns: min
          ? `repeat(auto-fill, minmax(${min}px, 1fr))`
          : `repeat(${cols ?? 3}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  );
}
