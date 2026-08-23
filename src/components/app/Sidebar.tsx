"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/actions/auth";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/suggestions", label: "Suggestions", icon: "suggestions" },
  { href: "/library", label: "Library", icon: "library" },
  { href: "/rating", label: "Gamer Rating", icon: "rating" },
  { href: "/challenges", label: "Challenges", icon: "challenges" },
  { href: "/rewards", label: "Rewards", icon: "rewards" },
  { href: "/friends", label: "Friends", icon: "friends" },
];

const BOTTOM: { href: string; label: string; icon: IconName }[] = [
  { href: "/profile", label: "Profile", icon: "profile" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside
        data-side
        className="sticky self-start flex flex-col"
        style={{
          top: 0,
          height: "100vh",
          background: "var(--bg)",
          borderRight: "1px solid var(--border)",
          padding: "0 14px 18px",
        }}
      >
        <div
          className="flex items-center"
          style={{
            height: 66,
            borderBottom: "1px solid rgba(255,255,255,.06)",
            margin: "0 -14px 18px",
            paddingLeft: 22,
          }}
        >
          <Logo />
        </div>

        <div className="flex flex-col gap-[3px]">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="nav-item" data-active={active(n.href)}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
            </Link>
          ))}
        </div>

        <span className="flex-1" />

        <div
          className="flex flex-col gap-[3px]"
          style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}
        >
          {BOTTOM.map((n) => (
            <Link key={n.href} href={n.href} className="nav-item" data-active={active(n.href)}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
            </Link>
          ))}
          <form action={logoutAction}>
            <button type="submit" className="nav-item w-full" style={{ background: "none", border: "none", cursor: "pointer" }}>
              <Icon name="logout" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      <nav
        data-bottombar
        className="fixed"
        style={{
          display: "none",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 80,
          background: "var(--bg)",
          borderTop: "1px solid rgba(255,255,255,.08)",
          justifyContent: "space-around",
          padding: "6px 4px 10px",
        }}
      >
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            aria-label={n.label}
            className="grid place-items-center"
            style={{
              minWidth: 48,
              minHeight: 44,
              color: active(n.href) ? "var(--text)" : "var(--text-2)",
            }}
          >
            <Icon name={n.icon} size={20} />
          </Link>
        ))}
      </nav>
    </>
  );
}
