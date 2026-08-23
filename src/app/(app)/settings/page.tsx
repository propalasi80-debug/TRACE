import { requireUser } from "@/lib/auth";
import { getConnections } from "@/lib/queries";
import { Connections } from "@/components/app/Connections";
import { ProfileForm } from "@/components/app/ProfileForm";
import { PageHead, Notice } from "@/components/app/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; linked?: string; error?: string }>;
}) {
  const user = await requireUser();
  const [accounts, params] = await Promise.all([getConnections(user.id), searchParams]);

  return (
    <>
      <PageHead
        title="Settings"
        subtitle="Connections, privacy and your public profile. Platform access is read only and revocable at any time."
      />

      {(params.welcome || params.error || params.linked) && (
        <div style={{ marginBottom: 22 }}>
          {params.error ? (
            <Notice kind="bad">{params.error}</Notice>
          ) : (
            <Notice kind={params.linked ? "ok" : "info"}>
              {params.linked
                ? "Account linked. Run a sync below to pull your library."
                : "Welcome to TRACE. Connect a platform below, run a sync, and the rest of the app fills in."}
            </Notice>
          )}
        </div>
      )}

      <div className="stack" style={{ gap: 18, maxWidth: 780 }}>
        <Connections accounts={accounts} />
        <ProfileForm
          displayName={user.display_name}
          bio={user.bio}
          username={user.username}
          isPublic={user.is_public}
          showPlaytime={user.show_playtime}
          shareActivity={user.share_activity}
        />
      </div>
    </>
  );
}
