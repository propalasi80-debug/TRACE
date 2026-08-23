import { requireUser } from "@/lib/auth";
import { getAttributes, getUserSummary } from "@/lib/stats";
import { getLibrary } from "@/lib/queries";
import { ProfileView } from "@/components/app/ProfileView";
import { baseUrl } from "@/lib/base-url";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile · Trace" };

export default async function ProfilePage() {
  const user = await requireUser();
  const [summary, attributes, topGames, base] = await Promise.all([
    getUserSummary(user.id),
    getAttributes(user.id),
    getLibrary(user.id, { limit: 5 }),
    baseUrl(),
  ]);

  return (
    <ProfileView
      user={user}
      summary={summary}
      attributes={attributes}
      topGames={topGames}
      shareUrl={`${base}/u/${user.username}`}
      owner
    />
  );
}
