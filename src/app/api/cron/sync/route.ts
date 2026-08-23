import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/db";
import { syncPlatform } from "@/lib/sync";
import type { Platform } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Vercel Cron hits this. Syncs the accounts that have gone stalest. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await query<{ user_id: string; platform: Platform }>(
    `select user_id, platform from platform_accounts
      where last_synced_at is null or last_synced_at < now() - interval '12 hours'
      order by last_synced_at asc nulls first
      limit 5`
  );

  const results: { user_id: string; platform: string; ok: boolean; message: string }[] = [];
  for (const row of due) {
    try {
      const r = await syncPlatform(row.user_id, row.platform);
      results.push({ ...row, ok: true, message: r.message });
    } catch (err) {
      results.push({
        ...row,
        ok: false,
        message: err instanceof Error ? err.message.slice(0, 160) : "failed",
      });
    }
  }

  return NextResponse.json({ ran: results.length, results });
}
