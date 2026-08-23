import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Topology } from "@/components/landing/Topology";
import { PlatformMarquee, TitleMarquee } from "@/components/landing/Marquee";
import { PlatformMark } from "@/components/PlatformMark";
import { getGlobalStats } from "@/lib/stats";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const HOW = [
  {
    step: "01",
    title: "Connect",
    body: "Sign in through Steam, or paste a PlayStation or Xbox token. Access is read only and you can revoke it at any time.",
  },
  {
    step: "02",
    title: "Sync",
    body: "TRACE pulls your owned games, playtime, achievements and how rare each one is, then keeps them current in the background.",
  },
  {
    step: "03",
    title: "Read",
    body: "One merged library, one rating built from what you actually played, and a profile you can share on a single link.",
  },
];

export default async function LandingPage() {
  const [stats, user] = await Promise.all([getGlobalStats(), getCurrentUser()]);
  const primaryHref = user ? "/home" : "/signup";
  const primaryLabel = user ? "Open TRACE" : "Connect your accounts";

  const band = [
    { value: stats.hasData ? stats.hours.toLocaleString() : null, label: "Hours read" },
    { value: stats.hasData ? stats.games.toLocaleString() : null, label: "Games unified" },
    {
      value: stats.hasData ? stats.achievements.toLocaleString() : null,
      label: "Achievements",
    },
    { value: "3", label: "Platforms live" },
  ];

  return (
    <div style={{ position: "relative", overflow: "hidden", minHeight: "100vh" }}>
      <Topology />

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "0 var(--shell-pad-x)",
          background: "rgba(5,6,9,0.78)",
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <Logo height={20} />
        <span style={{ flex: 1 }} />
        {user ? (
          <Link href="/home" className="btn btn-sm btn-quiet">
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              style={{ fontSize: 13.5, color: "var(--text-2)", marginRight: 4 }}
            >
              Log in
            </Link>
            <Link href="/signup" className="btn btn-sm btn-primary">
              Get started
            </Link>
          </>
        )}
      </header>

      <main style={{ position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <section
          style={{
            padding: "clamp(64px, 11vw, 128px) var(--shell-pad-x) clamp(48px, 7vw, 84px)",
            maxWidth: 1180,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <span
            data-rise
            className="badge badge-accent"
            style={{ padding: "6px 12px", marginBottom: 26 }}
          >
            <span
              style={{
                position: "relative",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: -3,
                  borderRadius: "50%",
                  border: "1px solid var(--accent)",
                  animation: "trace-pulse 2.6s ease-out infinite",
                }}
              />
            </span>
            Steam, PlayStation and Xbox in one place
          </span>

          <h1
            data-rise
            className="t-display"
            style={{
              fontSize: "clamp(34px, 6.6vw, 76px)",
              lineHeight: 0.98,
              margin: "0 auto 22px",
              maxWidth: "17ch",
              textWrap: "balance",
              animationDelay: "0.06s",
            }}
          >
            Your gaming life.
            <br />
            <span style={{ color: "var(--accent-text)" }}>One identity.</span>
          </h1>

          <p
            data-rise
            style={{
              fontSize: "clamp(15px, 1.6vw, 17px)",
              lineHeight: 1.62,
              color: "var(--text-2)",
              margin: "0 auto 32px",
              maxWidth: "54ch",
              animationDelay: "0.12s",
            }}
          >
            Your history is scattered across accounts that will never talk to each other.
            TRACE reads all of them and gives you one library, one rating and one profile
            that belongs to you.
          </p>

          <div
            data-rise
            className="flex flex-wrap items-center justify-center"
            style={{ gap: 12, animationDelay: "0.18s" }}
          >
            <Link href={primaryHref} className="btn btn-lg btn-primary">
              {primaryLabel}
            </Link>
            <Link href="/login" className="btn btn-lg btn-secondary">
              I already have an account
            </Link>
          </div>

          <p
            data-rise
            style={{
              fontSize: 12.5,
              color: "var(--text-4)",
              marginTop: 20,
              animationDelay: "0.24s",
            }}
          >
            Read only access. Revocable any time. Never sold.
          </p>
        </section>

        {/* Marquees */}
        <section style={{ padding: "8px 0 clamp(56px, 8vw, 96px)" }}>
          <PlatformMarquee perPlatform={stats.perPlatform} />
          <div style={{ height: 12 }} />
          <TitleMarquee games={stats.topGames} />
        </section>

        {/* Stat band */}
        <section
          style={{
            borderTop: "1px solid var(--line)",
            borderBottom: "1px solid var(--line)",
            background: "rgba(11,13,18,0.6)",
          }}
        >
          <div
            data-cols="4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              maxWidth: "var(--page-max)",
              margin: "0 auto",
            }}
          >
            {band.map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: "clamp(28px, 4vw, 44px) clamp(18px, 3vw, 32px)",
                  borderRight: i < band.length - 1 ? "1px solid var(--line)" : undefined,
                }}
              >
                <div
                  className="t-num"
                  style={{ fontSize: "clamp(26px, 3.6vw, 38px)", color: "var(--text)" }}
                >
                  {s.value ?? (
                    <span style={{ color: "var(--text-5)" }} title="No data synced yet">
                      0
                    </span>
                  )}
                </div>
                <div className="t-label" style={{ marginTop: 8 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          style={{
            padding: "clamp(56px, 8vw, 100px) var(--shell-pad-x)",
            maxWidth: "var(--page-max)",
            margin: "0 auto",
          }}
        >
          <div className="t-label" style={{ marginBottom: 14 }}>
            How it works
          </div>
          <h2
            className="t-display"
            style={{ fontSize: "clamp(24px, 3.4vw, 34px)", marginBottom: 40, maxWidth: "18ch" }}
          >
            Three steps, then it runs itself
          </h2>
          <div
            data-cols="3"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            {HOW.map((h) => (
              <div key={h.step} className="card" style={{ padding: 24 }}>
                <div
                  className="t-num"
                  style={{ fontSize: 13, color: "var(--accent-text)", marginBottom: 16 }}
                >
                  {h.step}
                </div>
                <h3 className="t-h2" style={{ marginBottom: 10 }}>
                  {h.title}
                </h3>
                <p className="t-body" style={{ margin: 0 }}>
                  {h.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing */}
        <section
          style={{
            padding: "clamp(56px, 8vw, 100px) var(--shell-pad-x)",
            textAlign: "center",
            borderTop: "1px solid var(--line)",
          }}
        >
          <h2
            className="t-display"
            style={{
              fontSize: "clamp(26px, 4.4vw, 44px)",
              lineHeight: 1.05,
              margin: "0 auto 24px",
              maxWidth: "16ch",
            }}
          >
            A decade of playing, finally readable
          </h2>
          <Link href={primaryHref} className="btn btn-lg btn-primary">
            {primaryLabel}
          </Link>
        </section>

        <footer
          style={{
            borderTop: "1px solid var(--line)",
            padding: "28px var(--shell-pad-x)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 16,
            maxWidth: "var(--page-max)",
            margin: "0 auto",
          }}
        >
          <Logo height={18} />
          <span style={{ flex: 1 }} />
          <div className="flex items-center" style={{ gap: 14 }}>
            {(["steam", "psn", "xbox"] as const).map((p) => (
              <PlatformMark key={p} platform={p} size={16} color="var(--text-5)" />
            ))}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-4)" }}>
            Platform names and marks belong to their respective owners.
          </span>
        </footer>
      </main>
    </div>
  );
}
