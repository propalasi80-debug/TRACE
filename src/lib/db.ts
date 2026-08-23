import { Pool, type QueryResultRow } from "pg";

declare global {
  var __gvPool: Pool | undefined;
}

function makePool() {
  const connectionString =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string (Supabase: Settings \u2192 Database \u2192 Session pooler) to .env.local locally, or to the project's environment variables on Vercel."
    );
  }
  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10_000,
  });
}

export function pool(): Pool {
  if (!global.__gvPool) global.__gvPool = makePool();
  return global.__gvPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await pool().query<T>(text, params);
  return res.rows;
}

export async function one<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
