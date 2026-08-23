import { NextResponse, type NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { query, one } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { authFromNpsso, fetchPsnProfile } from "@/lib/platforms/psn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await requireApiUser();
    const { npsso } = (await req.json()) as { npsso?: string };
    if (!npsso || npsso.trim().length < 32) {
      return NextResponse.json({ error: "That NPSSO token doesn't look right." }, { status: 400 });
    }

    const creds = await authFromNpsso(npsso);
    const profile = await fetchPsnProfile(creds);

    const taken = await one<{ user_id: string }>(
      `select user_id from platform_accounts where platform = 'psn' and platform_user_id = $1`,
      [profile.accountId]
    );
    if (taken && taken.user_id !== user.id) {
      return NextResponse.json(
        { error: "That PSN account is already linked to another Trace profile." },
        { status: 409 }
      );
    }

    await query(
      `insert into platform_accounts (user_id, platform, platform_user_id, handle, avatar_url, secret)
       values ($1,'psn',$2,$3,$4,$5)
       on conflict (user_id, platform)
       do update set platform_user_id = excluded.platform_user_id, handle = excluded.handle,
                     avatar_url = excluded.avatar_url, secret = excluded.secret,
                     sync_status = 'idle', sync_error = null`,
      [user.id, profile.accountId, profile.onlineId, profile.avatar, encrypt(JSON.stringify(creds))]
    );

    return NextResponse.json({ ok: true, handle: profile.onlineId });
  } catch (err) {
    return NextResponse.json({ error: message(err) }, { status: 400 });
  }
}

function message(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw === "UNAUTHORIZED") return "You need to be logged in.";
  if (/npsso|code|401|403/i.test(raw))
    return "PSN rejected that token. Grab a fresh NPSSO, they expire after about two months.";
  return raw.slice(0, 200);
}
