import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { query, one } from "./db";
import { randomToken, sha256 } from "./crypto";
import type { SessionUser } from "./types";

const COOKIE = "gv_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId: string): Promise<void> {
  const token = randomToken(32);
  const expires = new Date(Date.now() + MAX_AGE * 1000);
  await query(
    `insert into sessions (token_hash, user_id, expires_at) values ($1, $2, $3)`,
    [sha256(token), userId, expires]
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await query(`delete from sessions where token_hash = $1`, [sha256(token)]);
  jar.delete(COOKIE);
}

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    return await one<SessionUser>(
      `select u.id, u.email, u.username, u.display_name, u.avatar_url, u.bio,
              u.is_public, u.show_playtime, u.share_activity
         from sessions s join users u on u.id = s.user_id
        where s.token_hash = $1 and s.expires_at > now()`,
      [sha256(token)]
    );
  } catch {
    return null;
  }
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function slugifyUsername(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return base.length >= 3 ? base : `player-${randomToken(3).toLowerCase()}`;
}

export async function uniqueUsername(desired: string): Promise<string> {
  const base = slugifyUsername(desired);
  for (let i = 0; i < 25; i++) {
    const candidate = i === 0 ? base : `${base}-${i}`;
    const hit = await one(`select 1 from users where lower(username) = lower($1)`, [candidate]);
    if (!hit) return candidate;
  }
  return `${base}-${randomToken(3).toLowerCase()}`;
}
