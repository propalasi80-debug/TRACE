import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getFriends, getFriendRequests } from "@/lib/queries";
import { PageHeading, Avatar, EmptyState } from "@/components/app/ui";
import { AddFriend, RequestActions } from "@/components/app/FriendActions";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Friends · Trace" };

export default async function FriendsPage() {
  const user = await requireUser();
  const [friends, requests] = await Promise.all([getFriends(user.id), getFriendRequests(user.id)]);

  return (
    <div>
      <PageHeading
        title="Friends"
        subtitle={`${friends.length} connected${requests.length > 0 ? ` · ${requests.length} pending` : ""}`}
        right={<AddFriend />}
      />

      <div data-cols2 className="grid" style={{ gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 32 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Activity
          </div>
          {friends.length === 0 ? (
            <EmptyState
              title="No friends yet"
              body="Add someone by their Trace username and their library, rating and recent activity show up here."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {friends.map((f) => (
                <Link
                  key={f.id}
                  href={`/u/${f.username}`}
                  className="card flex items-center gap-[14px]"
                  style={{ borderRadius: 12, padding: "14px 18px", color: "var(--text)" }}
                >
                  <Avatar size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold" style={{ fontSize: 15, letterSpacing: ".05em" }}>
                      {f.display_name.toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: f.playing ? "var(--accent)" : "rgba(245,246,247,.4)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {f.playing ? `${f.playing} · ${timeAgo(f.last_played_at)}` : "No activity yet"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Requests
          </div>
          {requests.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--text-3)" }}>No pending requests.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {requests.map((r) => (
                <div key={r.friendship_id} className="card" style={{ borderRadius: 12, padding: "16px 18px" }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                    <Avatar size={36} radius={8} />
                    <div>
                      <div className="font-display font-bold" style={{ fontSize: 14, letterSpacing: ".05em" }}>
                        {r.display_name.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-4)" }}>@{r.username}</div>
                    </div>
                  </div>
                  <RequestActions friendshipId={r.friendship_id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
