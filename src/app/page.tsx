import Link from "next/link";
import { Backdrop } from "@/components/landing/Backdrop";
import { Marquee } from "@/components/landing/Marquee";
import { Logo } from "@/components/Logo";
import { getGlobalStats } from "@/lib/stats";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [stats, user] = await Promise.all([getGlobalStats(), getCurrentUser()]);
  const primaryHref = user ? "/home" : "/signup";

  const bands = [
    { n: stats.hasData ? stats.hours.toLocaleString() : "—", label: "Hours read" },
    { n: stats.hasData ? stats.games.toLocaleString() : "—", label: "Games unified" },
    { n: stats.hasData ? stats.achievements.toLocaleString() : "—", label: "Achievements" },
    { n: "3", label: "Platforms live" },
  ];

  return (
    <div className="relative overflow-hidden" style={{ background: "var(--bg)" }}>
      <Backdrop />

      {/* Header */}
      <div
        className="sticky z-60 flex items-center gap-7"
        style={{
          top: 0,
          height: 66,
          padding: "0 40px",
          background: "rgba(5,5,6,.82)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Logo />
        <div className="flex-1" />
        {user ? (
          <Link href="/home" style={{ fontSize: 13.5, color: "var(--text-2)" }}>
            Dashboard
          </Link>
        ) : (
          <Link href="/login" style={{ fontSize: 13.5, color: "var(--text-2)" }}>
            Log in
          </Link>
        )}
        <Link
          href={primaryHref}
          className="flex items-center"
          style={{
            minHeight: 42,
            padding: "0 18px",
            background: "var(--accent)",
            borderRadius: 9,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {user ? "Open Trace" : "Get started"}
        </Link>
      </div>

      {/* Hero */}
      <section data-hero className="relative text-center" style={{ padding: "110px 40px 76px" }}>
        <div
          aria-hidden="true"
          data-aurora
          style={{
            position: "absolute",
            top: 40,
            left: "50%",
            width: 1100,
            height: 1100,
            marginLeft: -550,
            pointerEvents: "none",
            zIndex: -1,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg,rgba(46,125,255,.26),rgba(124,92,255,.2) 25%,rgba(0,209,178,.14) 50%,rgba(255,70,85,.16) 72%,rgba(46,125,255,.26))",
            filter: "blur(90px)",
            animation: "spin 68s linear infinite",
            opacity: 0.3,
            WebkitMaskImage: "radial-gradient(closest-side,#000 30%,transparent 72%)",
            maskImage: "radial-gradient(closest-side,#000 30%,transparent 72%)",
          }}
        />

        <div
          data-rise
          className="inline-flex items-center gap-[10px]"
          style={{
            border: "1px solid rgba(46,125,255,.35)",
            background: "rgba(46,125,255,.09)",
            borderRadius: 100,
            padding: "7px 15px",
            marginBottom: 34,
          }}
        >
          <span className="relative" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }}>
            <span
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: "1px solid var(--accent)",
                animation: "pulseRing 2.4s ease-out infinite",
              }}
            />
          </span>
          <span
            className="uppercase"
            style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: ".14em", color: "rgba(245,246,247,.78)" }}
          >
            Three platforms. One history.
          </span>
        </div>

        <h1
          data-rise
          className="font-display font-bold uppercase"
          style={{
            fontSize: 96,
            lineHeight: 0.92,
            letterSpacing: ".01em",
            margin: "0 auto 26px",
            maxWidth: "15ch",
            textWrap: "balance",
            animationDelay: ".08s",
            textShadow: "0 0 90px rgba(46,125,255,.28)",
          }}
        >
          Your gaming life.
          <br />
          <span
            style={{
              background: "linear-gradient(96deg,#8FB7FF,#2E7DFF 30%,#7C5CFF 55%,#00D1B2 80%,#8FB7FF)",
              backgroundSize: "260% 100%",
              animation: "hueflow 9s ease-in-out infinite",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 14px 44px rgba(46,125,255,.35))",
            }}
          >
            One identity.
          </span>
        </h1>

        <p
          data-rise
          style={{
            fontSize: 17.5,
            lineHeight: 1.6,
            color: "var(--text-2)",
            margin: "0 auto 38px",
            maxWidth: "56ch",
            animationDelay: ".16s",
          }}
        >
          Trace reads every account you own and turns years of playing into one rating, one library and
          one profile that finally belongs to you.
        </p>

        <div data-rise className="flex flex-wrap gap-[14px] justify-center" style={{ animationDelay: ".24s" }}>
          <Link
            href={primaryHref}
            className="relative overflow-hidden flex items-center gap-[10px] whitespace-nowrap"
            style={{
              minHeight: 52,
              padding: "0 26px",
              background: "var(--accent)",
              borderRadius: 11,
              color: "#fff",
              fontSize: 15.5,
              fontWeight: 700,
              boxShadow: "0 18px 50px -18px rgba(46,125,255,.9)",
            }}
          >
            <span
              data-sweep
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "38%",
                background: "linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent)",
                animation: "sweep 3.6s ease-in-out infinite",
              }}
            />
            <span className="relative">Connect your accounts</span>
            <span className="relative">→</span>
          </Link>
          <Link
            href="/rating"
            className="flex items-center"
            style={{
              minHeight: 52,
              padding: "0 24px",
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 11,
              color: "var(--text)",
              fontSize: 15.5,
              fontWeight: 600,
            }}
          >
            See a live rating
          </Link>
        </div>
      </section>

      <Marquee perPlatform={stats.perPlatform} topGames={stats.topGames} />

      {/* Stat band */}
      <section
        className="relative"
        style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div
          data-cols3
          className="grid"
          style={{ maxWidth: 1340, margin: "0 auto", gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}
        >
          {bands.map((s) => (
            <div key={s.label} style={{ padding: "52px 30px", borderRight: "1px solid var(--border)" }}>
              <div className="font-display font-bold tnum" style={{ fontSize: 44, lineHeight: 1 }}>
                {s.n}
              </div>
              <div
                className="uppercase"
                style={{ fontSize: 11, letterSpacing: ".2em", color: "var(--text-4)", marginTop: 10 }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative text-center overflow-hidden" style={{ padding: "110px 40px" }}>
        <div
          aria-hidden="true"
          data-orb
          style={{
            position: "absolute",
            bottom: -260,
            left: "50%",
            transform: "translateX(-50%)",
            width: 760,
            height: 520,
            background: "radial-gradient(ellipse at center,rgba(46,125,255,.28),transparent 70%)",
            filter: "blur(14px)",
            animation: "orb 15s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
        <h2
          className="relative font-display font-bold uppercase"
          style={{ fontSize: 52, lineHeight: 1.02, letterSpacing: ".03em", margin: "0 0 30px", textWrap: "balance" }}
        >
          A decade of playing,
          <br />
          finally readable
        </h2>
        <Link
          href={primaryHref}
          className="relative inline-flex items-center gap-[10px] whitespace-nowrap"
          style={{
            minHeight: 52,
            padding: "0 28px",
            background: "var(--accent)",
            borderRadius: 11,
            color: "#fff",
            fontSize: 15.5,
            fontWeight: 700,
            boxShadow: "0 18px 50px -18px rgba(46,125,255,.9)",
          }}
        >
          Connect your accounts →
        </Link>
        <p className="relative" style={{ fontSize: 13, color: "rgba(245,246,247,.45)", margin: "22px 0 0" }}>
          Read-only access. Revocable any time. Never sold.
        </p>
      </section>
    </div>
  );
}
