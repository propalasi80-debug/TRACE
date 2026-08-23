import { NextResponse, type NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { one, query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser();
    const { username } = (await req.json()) as { username?: string };
    if (!username) return NextResponse.json({ error: "Enter a username." }, { status: 400 });

    const target = await one<{ id: string }>(
      `select id from users where lower(username) = lower($1)`,
      [username.trim()]
    );
    if (!target) return NextResponse.json({ error: "No Trace player with that username." }, { status: 404 });
    if (target.id === user.id) return NextResponse.json({ error: "That's you." }, { status: 400 });

    const existing = await one(
      `select 1 from friendships
        where (user_id = $1 and friend_id = $2) or (user_id = $2 and friend_id = $1)`,
      [user.id, target.id]
    );
    if (existing) return NextResponse.json({ error: "You're already connected or a request is pending." }, { status: 409 });

    await query(`insert into friendships (user_id, friend_id, status) values ($1,$2,'pending')`, [
      user.id,
      target.id,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: raw === "UNAUTHORIZED" ? "Not logged in." : raw }, { status: 400 });
  }
}
