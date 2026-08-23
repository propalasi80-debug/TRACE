import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getUserByUsername, getLibrary } from "@/lib/queries";
import { getAttributes, getUserSummary } from "@/lib/stats";
import { ProfileView } from "@/components/app/ProfileView";
import { getCurrentUser } from "@/lib/auth";
import { baseUrl } from "@/lib/base-url";
import { Logo } from "@/components/Logo";
import { Topology } from "@/components/landing/Topology";
import { Empty } from "@/components/app/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getUserByUsername(username).catch(() => null);
  if (!user || !user.is_public) return { title: "Profile" };
  return {
    title: user.display_name,
    description: user.bio ?? `${user.display_name} on TRACE.`,
  };
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
      <Shell viewer={Boolean(viewer)}>
        <Empty
          title="This profile is private"
          body={`${profile.display_name} has turned off public sharing.`}
        />
      </Shell>
    );
  }

  const [summary, attributes, topGames, base] = await Promise.all([
    getUserSummary(profile.id),
    getAttributes(profile.id),
    getLibrary(profile.id, { limit: 6 }),
    baseUrl(),
  ]);

  return (
    <Shell viewer={Boolean(viewer)}>
      <ProfileView
        user={profile}
        summary={summary}
        attributes={attributes}
        topGames={topGames}
        shareUrl={`${base}/u/${profile.username}`}
        owner={Boolean(isOwner)}
        showPlaytime={profile.show_playtime}
      />
    </Shell>
  );
}

function Shell({ children, viewer }: { children: ReactNode; viewer: boolean }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      <Topology variant="app" />
      <header
        className="flex items-center"
        style={{
          position: "relative",
          zIndex: 1,
          height: 64,
          padding: "0 var(--shell-pad-x)",
          borderBottom: "1px solid var(--line)",
          gap: 16,
        }}
      >
        <Logo height={19} />
        <span style={{ flex: 1 }} />
        <Link href={viewer ? "/home" : "/signup"} className="btn btn-sm btn-secondary">
          {viewer ? "Your dashboard" : "Create your own"}
        </Link>
      </header>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "32px var(--shell-pad-x) 72px",
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
