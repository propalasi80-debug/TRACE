import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getFriends, getFriendRequests } from "@/lib/queries";
import { PageHead, Avatar, Empty } from "@/components/app/ui";
import { AddFriend, RequestActions } from "@/components/app/FriendActions";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Friends" };

export default async function FriendsPage() {
  const user = await requireUser();
  const [friends, requests] = await Promise.all([getFriends(user.id), getFriendRequests(user.id)]);

  return (
    <>
      <PageHead
        title="Friends"
        subtitle={
          friends.length === 0
            ? "Add people by their TRACE username to see their libraries and ratings."
            : `${friends.length} connected${requests.length > 0 ? `, ${requests.length} pending` : ""}.`
        }
        actions={<AddFriend />}
      />

      <div
        data-split
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
          gap: 28,
        }}
      >
        <section>
          <h2 className="t-label" style={{ marginBottom: 14 }}>
            Your friends
          </h2>
          {friends.length === 0 ? (
            <Empty
              title="No friends yet"
              body="Share your profile link, or add someone using the username on their TRACE profile."
            />
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {friends.map((f) => (
                <Link
                  key={f.id}
                  href={`/u/${f.username}`}
                  className="card card-hover flex items-center"
                  style={{ gap: 14, padding: "14px 18px", color: "var(--text)" }}
                >
                  <Avatar size={40} radius={9} name={f.display_name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="truncate-1" style={{ fontSize: 14, fontWeight: 600 }}>
                      {f.display_name}
                    </div>
                    <div className="truncate-1 t-sm" style={{ fontSize: 12.5 }}>
                      {f.playing
                        ? `${f.playing} · ${timeAgo(f.last_played_at)}`
                        : `@${f.username}`}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="t-label" style={{ marginBottom: 14 }}>
            Requests
          </h2>
          {requests.length === 0 ? (
            <p className="t-sm">No pending requests.</p>
          ) : (
            <div className="stack" style={{ gap: 10 }}>
              {requests.map((r) => (
                <div key={r.friendship_id} className="card" style={{ padding: 16 }}>
                  <div className="flex items-center" style={{ gap: 12, marginBottom: 14 }}>
                    <Avatar size={34} radius={8} name={r.display_name} />
                    <div style={{ minWidth: 0 }}>
                      <div className="truncate-1" style={{ fontSize: 13.5, fontWeight: 600 }}>
                        {r.display_name}
                      </div>
                      <div className="t-sm" style={{ fontSize: 12 }}>
                        @{r.username}
                      </div>
                    </div>
                  </div>
                  <RequestActions friendshipId={r.friendship_id} />
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ padding: 18, marginTop: 20 }}>
            <h3 className="t-label" style={{ marginBottom: 10 }}>
              Your link
            </h3>
            <p className="t-sm" style={{ margin: 0, fontFamily: "ui-monospace, monospace" }}>
              /u/{user.username}
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
