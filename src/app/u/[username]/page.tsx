import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserByUsername, getLibrary } from "@/lib/queries";
import { getAttributes, getUserSummary } from "@/lib/stats";
import { ProfileView } from "@/components/app/ProfileView";
import { getCurrentUser } from "@/lib/auth";
import { baseUrl } from "@/lib/base-url";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getUserByUsername(username).catch(() => null);
  return { title: user ? `${user.display_name} · Trace` : "Player not found · Trace" };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getUserByUsername(username).catch(() => null);
  if (!profile) notFound();

  const viewer = await getCurrentUser();
  const isOwner = viewer?.id === profile.id;

  if (!profile.is_public && !isOwner) {
    return (
      <Shell>
        <div className="card text-center" style={{ padding: "52px 30px" }}>
          <div className="font-display font-bold uppercase" style={{ fontSize: 20, letterSpacing: ".08em", marginBottom: 10 }}>
            This profile is private
          </div>
          <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0 }}>
            {profile.display_name} has turned off public sharing.
          </p>
        </div>
      </Shell>
    );
  }

  const [summary, attributes, topGames, base] = await Promise.all([
    getUserSummary(profile.id),
    getAttributes(profile.id),
    getLibrary(profile.id, { limit: 5 }),
    baseUrl(),
  ]);

  return (
    <Shell>
      <ProfileView
        user={profile}
        summary={summary}
        attributes={attributes}
        topGames={topGames}
        shareUrl={`${base}/u/${profile.username}`}
        owner={Boolean(isOwner)}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div
        className="flex items-center"
        style={{
          height: 66,
          padding: "0 40px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <Logo />
        <div className="flex-1" />
        <Link href="/signup" style={{ fontSize: 13.5, fontWeight: 600 }}>
          Create your own →
        </Link>
      </div>
      <div style={{ padding: "36px 44px 64px", maxWidth: 1200, margin: "0 auto" }}>{children}</div>
    </div>
  );
}
