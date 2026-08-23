import Link from "next/link";
import type { ReactNode } from "react";
import { StarIcon } from "@/components/Icon";
import { PLATFORM_META, type Platform } from "@/lib/types";

export function PageHeading({
  title,
  subtitle,
  eyebrow,
  right,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-4 items-end justify-between" style={{ marginBottom: 26 }}>
      <div>
        {eyebrow && (
          <div
            className="uppercase"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".22em",
              color: "var(--text-4)",
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-.01em", margin: subtitle ? "0 0 8px" : 0 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 14.5, color: "var(--text-3)", margin: 0 }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="tile text-center" style={{ padding: "14px 10px" }}>
      <div className="tnum" style={{ fontSize: 22, fontWeight: 700 }}>
        {value}
      </div>
      <div
        className="uppercase"
        style={{ fontSize: 9.5, letterSpacing: ".16em", color: "var(--text-4)", marginTop: 4 }}
      >
        {label}
      </div>
    </div>
  );
}

export function Progress({ pct, height = 5 }: { pct: number; height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: height / 2 + 0.5,
        background: "rgba(255,255,255,.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          background: "var(--accent)",
          width: `${Math.max(0, Math.min(100, pct))}%`,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
}

export function PlatformChip({ platform }: { platform: Platform }) {
  const meta = PLATFORM_META[platform];
  return (
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
      {meta.label}
    </span>
  );
}

export function Avatar({
  src,
  size = 44,
  radius = 9,
  label = "AVATAR",
}: {
  src?: string | null;
  size?: number;
  radius?: number;
  label?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", flex: "none" }}
      />
    );
  }
  return (
    <div
      className="grid place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "var(--surface-4)",
        color: "var(--text-5)",
        fontSize: 10,
        letterSpacing: ".14em",
        flex: "none",
      }}
    >
      {size >= 60 ? label : ""}
    </div>
  );
}

export function GameArt({
  src,
  name,
  ratio = "3/4",
  children,
}: {
  src?: string | null;
  name: string;
  ratio?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="relative grid"
      style={{
        aspectRatio: ratio,
        background: "var(--surface-5)",
        placeItems: "end center",
        padding: 12,
        overflow: "hidden",
      }}
    >
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.9,
          }}
        />
      )}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: src
            ? "linear-gradient(180deg,rgba(5,5,6,.15),rgba(5,5,6,.86))"
            : "none",
        }}
      />
      {children}
      <span
        className="relative text-center"
        style={{ fontSize: 13.5, fontWeight: 600, textWrap: "balance" }}
      >
        {name}
      </span>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="card text-center" style={{ padding: "52px 30px" }}>
      <div
        className="font-display font-bold uppercase"
        style={{ fontSize: 20, letterSpacing: ".08em", marginBottom: 10 }}
      >
        {title}
      </div>
      <p style={{ fontSize: 14, color: "var(--text-3)", margin: "0 auto 22px", maxWidth: "48ch", lineHeight: 1.6 }}>
        {body}
      </p>
      {cta && (
        <Link href={cta.href} className="btn-primary" style={{ textDecoration: "none" }}>
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export function RatingBadge({ value, delta }: { value: number; delta?: number }) {
  return (
    <div className="flex items-center gap-[9px]" style={{ fontSize: 13.5, fontWeight: 600 }}>
      <StarIcon />
      <span className="tnum">{value.toLocaleString()}</span>
      {delta !== undefined && delta !== 0 && (
        <span style={{ color: delta > 0 ? "var(--success)" : "var(--danger)", fontWeight: 500 }}>
          {delta > 0 ? "↗" : "↘"} {delta > 0 ? "+" : ""}
          {delta}
        </span>
      )}
    </div>
  );
}
