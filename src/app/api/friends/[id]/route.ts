import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await query(`update friendships set status = 'accepted' where id = $1 and friend_id = $2`, [
    id,
    user.id,
  ]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await query(`delete from friendships where id = $1 and (friend_id = $2 or user_id = $2)`, [
    id,
    user.id,
  ]);
  return NextResponse.json({ ok: true });
}
