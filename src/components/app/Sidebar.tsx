"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/actions/auth";

const PRIMARY: { href: string; label: string; icon: IconName }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/library", label: "Library", icon: "library" },
  { href: "/rating", label: "Rating", icon: "rating" },
  { href: "/suggestions", label: "Suggestions", icon: "suggestions" },
  { href: "/challenges", label: "Challenges", icon: "challenges" },
  { href: "/rewards", label: "Rewards", icon: "rewards" },
  { href: "/friends", label: "Friends", icon: "friends" },
];

const SECONDARY: { href: string; label: string; icon: IconName }[] = [
  { href: "/profile", label: "Profile", icon: "profile" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside
        data-sidebar
        className="stack"
        style={{
          position: "sticky",
          top: 0,
          alignSelf: "start",
          height: "100vh",
          background: "var(--bg)",
          borderRight: "1px solid var(--line)",
          padding: "0 12px 16px",
        }}
      >
        <div
          className="flex items-center"
          style={{
            height: 64,
            paddingLeft: 10,
            marginBottom: 16,
            borderBottom: "1px solid var(--line)",
            marginInline: -12,
            paddingInline: 22,
          }}
        >
          <Logo href="/home" height={19} />
        </div>

        <nav className="stack" style={{ gap: 2 }} aria-label="Main">
          {PRIMARY.map((n) => (
            <Link key={n.href} href={n.href} className="nav-item" data-active={isActive(n.href)}>
              <Icon name={n.icon} size={16} />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>

        <span style={{ flex: 1 }} />

        <nav
          className="stack"
          style={{ gap: 2, paddingTop: 14, borderTop: "1px solid var(--line)" }}
          aria-label="Account"
        >
          {SECONDARY.map((n) => (
            <Link key={n.href} href={n.href} className="nav-item" data-active={isActive(n.href)}>
              <Icon name={n.icon} size={16} />
              <span>{n.label}</span>
            </Link>
          ))}
          <form action={logoutAction}>
            <button
              type="submit"
              className="nav-item"
              style={{ width: "100%", background: "none", border: 0, cursor: "pointer" }}
            >
              <Icon name="logout" size={16} />
              <span>Log out</span>
            </button>
          </form>
        </nav>
      </aside>

      <nav
        data-tabbar
        aria-label="Main"
        style={{
          display: "none",
          position: "fixed",
          insetInline: 0,
          bottom: 0,
          zIndex: 60,
          background: "rgba(5,6,9,0.94)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderTop: "1px solid var(--line)",
          justifyContent: "space-around",
          padding: "6px 4px calc(6px + env(safe-area-inset-bottom))",
        }}
      >
        {[...PRIMARY.slice(0, 5), SECONDARY[1]].map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-label={n.label}
              aria-current={active ? "page" : undefined}
              className="grid place-items-center"
              style={{
                minWidth: 48,
                minHeight: 46,
                gap: 3,
                color: active ? "var(--accent-text)" : "var(--text-4)",
              }}
            >
              <Icon name={n.icon} size={19} />
              <span style={{ fontSize: 9, letterSpacing: "0.06em" }}>{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
