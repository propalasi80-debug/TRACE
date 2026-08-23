"use client";

import { usePathname } from "next/navigation";
import { type IconName } from "@/components/Icon";
import { NavLink, TabLink } from "@/components/app/PendingLink";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/app/LogoutButton";

const PRIMARY: { href: string; label: string; icon: IconName }[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/library", label: "Library", icon: "library" },
  { href: "/achievements", label: "Achievements", icon: "trophy" },
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
            <NavLink key={n.href} href={n.href} label={n.label} icon={n.icon} active={isActive(n.href)} />
          ))}
        </nav>

        <span style={{ flex: 1 }} />

        <nav
          className="stack"
          style={{ gap: 2, paddingTop: 14, borderTop: "1px solid var(--line)" }}
          aria-label="Account"
        >
          {SECONDARY.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} icon={n.icon} active={isActive(n.href)} />
          ))}
          <LogoutButton />
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
        {[...PRIMARY.slice(0, 5), SECONDARY[1]].map((n) => (
          <TabLink key={n.href} href={n.href} icon={n.icon} active={isActive(n.href)}>
            {n.label}
          </TabLink>
        ))}
      </nav>
    </>
  );
}
