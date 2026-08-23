import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { syncPlatform } from "@/lib/sync";
import { PLATFORMS, type Platform } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const user = await requireApiUser();
    const { platform } = await params;
    if (!PLATFORMS.includes(platform as Platform)) {
      return NextResponse.json({ error: "Unknown platform." }, { status: 400 });
    }
    const result = await syncPlatform(user.id, platform as Platform);
    return NextResponse.json(result);
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: raw === "UNAUTHORIZED" ? "Not logged in." : raw.slice(0, 300) },
      { status: 400 }
    );
  }
}
