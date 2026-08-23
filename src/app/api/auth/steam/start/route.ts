import { NextResponse } from "next/server";
import { steamLoginUrl } from "@/lib/platforms/steam";
import { baseUrl } from "@/lib/base-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const base = await baseUrl();
  return NextResponse.redirect(steamLoginUrl(`${base}/api/auth/steam/callback`, `${base}/`));
}
