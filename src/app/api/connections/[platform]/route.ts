import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { PLATFORMS, type Platform } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const user = await requireUser();
    const { platform } = await params;
    if (!PLATFORMS.includes(platform as Platform)) {
      return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
    }
    await query(`delete from platform_accounts where user_id = $1 and platform = $2`, [
      user.id,
      platform,
    ]);
    await query(
      `delete from user_games ug using games g
        where ug.game_id = g.id and ug.user_id = $1 and g.platform = $2`,
      [user.id, platform]
    );
    await query(
      `delete from user_achievements ua using achievements a, games g
        where ua.achievement_id = a.id and a.game_id = g.id
          and ua.user_id = $1 and g.platform = $2`,
      [user.id, platform]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: raw === "UNAUTHORIZED" ? "Not logged in." : raw }, { status: 400 });
  }
}
