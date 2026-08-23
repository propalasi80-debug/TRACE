import { NextResponse, type NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** One-shot schema apply. Protected by ADMIN_SECRET; the SQL is idempotent. */
export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not set on the server." },
      { status: 400 }
    );
  }
  const provided =
    req.headers.get("x-admin-secret") ?? req.nextUrl.searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = await readFile(path.join(process.cwd(), "db", "schema.sql"), "utf8");
    await pool().query(sql);
    return NextResponse.json({ ok: true, message: "Schema applied." });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
