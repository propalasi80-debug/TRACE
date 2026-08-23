import { requireUser } from "@/lib/auth";
import { getConnections } from "@/lib/queries";
import { Connections } from "@/components/app/Connections";
import { PageHeading } from "@/components/app/ui";
import { ProfileForm } from "@/components/app/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings · Trace" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; linked?: string; error?: string }>;
}) {
  const user = await requireUser();
  const [accounts, params] = await Promise.all([getConnections(user.id), searchParams]);

  return (
    <div>
      <PageHeading
        title="Settings"
        subtitle="Connections, privacy and account. Access is read-only and revocable at any time."
      />

      {params.welcome && (
        <p
          className="card"
          style={{
            padding: "14px 18px",
            marginBottom: 22,
            fontSize: 14,
            borderColor: "rgba(46,125,255,.3)",
            color: "var(--text-2)",
          }}
        >
          Welcome to Trace. Connect a platform below, run a sync, and the rest of the app fills in.
        </p>
      )}
      {params.error && (
        <p
          className="card"
          style={{
            padding: "14px 18px",
            marginBottom: 22,
            fontSize: 14,
            borderColor: "rgba(255,90,90,.3)",
            color: "var(--danger)",
          }}
        >
          {params.error}
        </p>
      )}

      <div style={{ maxWidth: 820, display: "flex", flexDirection: "column", gap: 22 }}>
        <Connections accounts={accounts} />
        <ProfileForm
          displayName={user.display_name}
          bio={user.bio}
          isPublic={user.is_public}
          username={user.username}
        />
      </div>
    </div>
  );
}
