"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import type { ReactNode } from "react";
import { Spinner } from "@/components/Spinner";
import { Icon, type IconName } from "@/components/Icon";

/**
 * Feedback for the gap between clicking and the server responding.
 *
 * A route-level skeleton covers a whole page change, but a filter chip that
 * swaps one grid for another should say "working" in place rather than blanking
 * the screen. useLinkStatus only reports for the Link it sits inside, so these
 * wrappers exist to put it there.
 */
function Pending({ size = 12 }: { size?: number }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner size={size} />;
}

export function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: IconName;
  active: boolean;
}) {
  return (
    <Link href={href} className="nav-item" data-active={active}>
      <Icon name={icon} size={16} />
      <span style={{ flex: 1 }}>{label}</span>
      <Pending />
    </Link>
  );
}

export function ChipLink({
  href,
  active,
  children,
  small,
  style,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
  small?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <Link
      href={href}
      className="chip"
      data-active={active}
      style={small ? { minHeight: 30, fontSize: 12, padding: "0 10px", ...style } : style}
    >
      {children}
      <Pending size={11} />
    </Link>
  );
}

export function TabLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: IconName;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={typeof children === "string" ? children : undefined}
      aria-current={active ? "page" : undefined}
      className="grid place-items-center"
      style={{
        minWidth: 48,
        minHeight: 46,
        gap: 3,
        color: active ? "var(--accent-text)" : "var(--text-4)",
        position: "relative",
      }}
    >
      <Icon name={icon} size={19} />
      <span style={{ fontSize: 9, letterSpacing: "0.06em" }}>{children}</span>
      <span style={{ position: "absolute", top: 2, right: 6 }}>
        <Pending size={9} />
      </span>
    </Link>
  );
}
