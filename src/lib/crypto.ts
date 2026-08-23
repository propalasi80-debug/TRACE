import crypto from "node:crypto";

/* ---------- password hashing (scrypt) ---------- */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const key = crypto.scryptSync(password.normalize("NFKC"), Buffer.from(saltHex, "hex"), 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  const expected = Buffer.from(keyHex, "hex");
  return key.length === expected.length && crypto.timingSafeEqual(key, expected);
}

/* ---------- symmetric encryption for platform credentials ---------- */

function secretKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY is not set (generate one with: openssl rand -hex 32)");
  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), enc.toString("base64url")].join(".");
}

export function decrypt(payload: string): string {
  const [ivB, tagB, dataB] = payload.split(".");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    secretKey(),
    Buffer.from(ivB, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagB, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
