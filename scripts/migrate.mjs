#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(path.join(here, "..", "db", "schema.sql"), "utf8");

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local or export it first.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    `select table_name from information_schema.tables
      where table_schema = 'public' order by table_name`
  );
  console.log(`Schema applied. ${rows.length} tables:`);
  for (const r of rows) console.log(`  · ${r.table_name}`);
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
