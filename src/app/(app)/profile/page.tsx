import { requireUser } from "@/lib/auth";
import { getAttributes, getUserSummary } from "@/lib/stats";
import { getLibrary } from "@/lib/queries";
import { ProfileView } from "@/components/app/ProfileView";
import { Notice } from "@/components/app/ui";
import { baseUrl } from "@/lib/base-url";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const [summary, attributes, topGames, base] = await Promise.all([
    getUserSummary(user.id),
    getAttributes(user.id),
    getLibrary(user.id, { limit: 6 }),
    baseUrl(),
  ]);

  return (
    <>
      {!user.is_public && (
        <div style={{ marginBottom: 18 }}>
          <Notice>
            Your profile is private, so this link only works for you. You can change that in
            Settings.
          </Notice>
        </div>
      )}
      <ProfileView
        user={user}
        summary={summary}
        attributes={attributes}
        topGames={topGames}
        shareUrl={`${base}/u/${user.username}`}
        owner
        showPlaytime={user.show_playtime}
      />
    </>
  );
}
