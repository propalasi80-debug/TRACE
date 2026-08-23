"use server";

import { redirect } from "next/navigation";
import { one, query } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { createSession, destroySession, uniqueUsername } from "@/lib/auth";

export interface FormState {
  error?: string;
  ok?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  try {
    const existing = await one(`select 1 from users where lower(email) = $1`, [email]);
    if (existing) return { error: "That email is already registered. Try logging in." };

    const username = await uniqueUsername(displayName || email.split("@")[0]);
    const user = await one<{ id: string }>(
      `insert into users (email, password_hash, username, display_name)
       values ($1, $2, $3, $4) returning id`,
      [email, hashPassword(password), username, displayName || username]
    );
    if (!user) return { error: "Could not create the account. Try again." };
    await createSession(user.id);
  } catch (err) {
    return { error: friendly(err) };
  }
  redirect("/settings?welcome=1");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  try {
    const user = await one<{ id: string; password_hash: string | null }>(
      `select id, password_hash from users where lower(email) = $1`,
      [email]
    );
    if (!user || !verifyPassword(password, user.password_hash)) {
      return { error: "Those credentials don't match an account." };
    }
    await createSession(user.id);
  } catch (err) {
    return { error: friendly(err) };
  }
  redirect("/home");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { requireUser } = await import("@/lib/auth");
  try {
    const user = await requireUser();
    const displayName = String(formData.get("display_name") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const isPublic = formData.get("is_public") === "on";
    await query(
      `update users set display_name = coalesce(nullif($2,''), display_name),
                        bio = nullif($3,''), is_public = $4, updated_at = now()
        where id = $1`,
      [user.id, displayName, bio, isPublic]
    );
    return { ok: true };
  } catch (err) {
    return { error: friendly(err) };
  }
}

function friendly(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("DATABASE_URL")) {
    return "The database isn't configured yet. Add DATABASE_URL and run the migration.";
  }
  if (msg.includes('relation "users" does not exist')) {
    return "The database tables haven't been created yet. Run the migration first.";
  }
  return msg.slice(0, 200);
}
