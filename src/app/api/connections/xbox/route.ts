import { NextResponse, type NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { query, one } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { fetchXboxProfile } from "@/lib/platforms/xbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser();
    const { apiKey } = (await req.json()) as { apiKey?: string };
    if (!apiKey || apiKey.trim().length < 20) {
      return NextResponse.json({ error: "That OpenXBL API key doesn't look right." }, { status: 400 });
    }

    const profile = await fetchXboxProfile(apiKey.trim());

    const taken = await one<{ user_id: string }>(
      `select user_id from platform_accounts where platform = 'xbox' and platform_user_id = $1`,
      [profile.xuid]
    );
    if (taken && taken.user_id !== user.id) {
      return NextResponse.json(
        { error: "That Xbox account is already linked to another Trace profile." },
        { status: 409 }
      );
    }

    await query(
      `insert into platform_accounts (user_id, platform, platform_user_id, handle, avatar_url, secret)
       values ($1,'xbox',$2,$3,$4,$5)
       on conflict (user_id, platform)
       do update set platform_user_id = excluded.platform_user_id, handle = excluded.handle,
                     avatar_url = excluded.avatar_url, secret = excluded.secret,
                     sync_status = 'idle', sync_error = null`,
      [user.id, profile.xuid, profile.gamertag, profile.avatar, encrypt(apiKey.trim())]
    );

    return NextResponse.json({ ok: true, handle: profile.gamertag });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw === "UNAUTHORIZED") return NextResponse.json({ error: "You need to be logged in." }, { status: 401 });
    return NextResponse.json(
      { error: /40[13]/.test(raw) ? "OpenXBL rejected that key. Check it and try again." : raw.slice(0, 200) },
      { status: 400 }
    );
  }
}
