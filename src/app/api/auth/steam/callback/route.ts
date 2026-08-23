import { NextResponse, type NextRequest } from "next/server";
import { verifySteamOpenId, fetchSteamProfile } from "@/lib/platforms/steam";
import { one, query } from "@/lib/db";
import { createSession, getCurrentUser, uniqueUsername } from "@/lib/auth";
import { baseUrl } from "@/lib/base-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const base = await baseUrl();
  const fail = (msg: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(msg)}`);

  try {
    const steamId = await verifySteamOpenId(req.nextUrl.searchParams);
    if (!steamId) return fail("Steam sign-in could not be verified.");

    let profile: Awaited<ReturnType<typeof fetchSteamProfile>> | null = null;
    try {
      profile = await fetchSteamProfile(steamId);
    } catch {
      // STEAM_API_KEY may be missing, linking still works without the profile.
    }

    const current = await getCurrentUser();

    // Already linked to somebody?
    const linked = await one<{ user_id: string }>(
      `select user_id from platform_accounts where platform = 'steam' and platform_user_id = $1`,
      [steamId]
    );

    if (current) {
      if (linked && linked.user_id !== current.id) {
        return NextResponse.redirect(
          `${base}/settings?error=${encodeURIComponent("That Steam account is already linked to another Trace profile.")}`
        );
      }
      await upsertSteamAccount(current.id, steamId, profile);
      return NextResponse.redirect(`${base}/settings?linked=steam`);
    }

    if (linked) {
      await createSession(linked.user_id);
      return NextResponse.redirect(`${base}/home`);
    }

    const username = await uniqueUsername(profile?.personaName ?? `player-${steamId.slice(-6)}`);
    const user = await one<{ id: string }>(
      `insert into users (username, display_name, avatar_url) values ($1,$2,$3) returning id`,
      [username, profile?.personaName ?? username, profile?.avatar ?? null]
    );
    if (!user) return fail("Could not create your account.");
    await upsertSteamAccount(user.id, steamId, profile);
    await createSession(user.id);
    return NextResponse.redirect(`${base}/settings?welcome=1&linked=steam`);
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Steam sign-in failed.");
  }
}

async function upsertSteamAccount(
  userId: string,
  steamId: string,
  profile: { personaName: string; avatar: string | null; profileUrl: string | null } | null
) {
  await query(
    `insert into platform_accounts (user_id, platform, platform_user_id, handle, avatar_url, profile_url)
     values ($1,'steam',$2,$3,$4,$5)
     on conflict (user_id, platform)
     do update set platform_user_id = excluded.platform_user_id,
                   handle = coalesce(excluded.handle, platform_accounts.handle),
                   avatar_url = coalesce(excluded.avatar_url, platform_accounts.avatar_url),
                   profile_url = coalesce(excluded.profile_url, platform_accounts.profile_url),
                   sync_status = 'idle', sync_error = null`,
    [userId, steamId, profile?.personaName ?? null, profile?.avatar ?? null, profile?.profileUrl ?? null]
  );
}
