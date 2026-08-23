# Trace

**Your gaming life. One identity.**

Trace reads the gaming accounts you own — Steam, PlayStation and Xbox — and merges
them into one library, one rating and one public profile.

Built with Next.js 16 (App Router), TypeScript, Tailwind v4 and Postgres.
Designed against the Claude Design "Trace" handoff: same tokens, type, motion and copy.

---

## What actually works

| Area | Status |
| --- | --- |
| Email + password auth (scrypt, cookie sessions) | live |
| Sign in with Steam (OpenID 2.0) | live |
| Steam library, playtime, achievements, global rarity | live |
| PlayStation trophies via NPSSO | live |
| Xbox achievements via OpenXBL | live |
| Trace Rating + nine attributes, computed from real data | live |
| Library, Home, Rating, Profile, Settings | live |
| Suggestions (catalogue scored against your attributes) | live |
| Challenges generated from your own library | live |
| Rewards / milestone badges from real totals | live |
| Friends, requests, public profiles at `/u/username` | live |
| Scheduled background sync (Vercel Cron, daily) | live |
| Epic, Nintendo, GOG, Battle.net, Riot, itch.io | not connected — no usable public API |

Nothing on screen is mock data. If a section is empty it is because nothing has
synced yet, and it says so.

---

## Setup

### 1. Database

Any Postgres works — Trace talks to it directly through `pg`, with no
vendor-specific client.

**Supabase**: Project Settings → Database → Connection string → **Session
pooler** (port 5432). Use that URI as `DATABASE_URL`. Avoid the transaction
pooler on 6543 — it runs PgBouncer in transaction mode, which breaks the
multi-statement transactions the sync engine uses.

**Neon via Vercel**: Storage → Create Database → Neon. `DATABASE_URL` is
injected automatically.

For local work, copy the same connection string into `.env.local`.

> On Supabase, the migration also enables row-level security on every table with
> no public policies. Trace's own connection is unaffected, but it closes off
> Supabase's auto-generated REST API, which would otherwise expose these tables
> to anyone holding the publishable anon key.

### 2. Environment

```bash
cp .env.example .env.local
```

| Variable | Required | Where to get it |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon / any Postgres |
| `ENCRYPTION_KEY` | yes | `openssl rand -hex 32` — encrypts stored platform credentials |
| `STEAM_API_KEY` | yes for Steam | https://steamcommunity.com/dev/apikey |
| `ADMIN_SECRET` | yes | any long random string — protects the migrate endpoint |
| `CRON_SECRET` | recommended | any long random string — protects the scheduled sync |
| `NEXT_PUBLIC_APP_URL` | optional | only if the auto-detected origin is wrong |

### 3. Create the tables

```bash
npm run db:migrate
```

Or, after deploying, hit the protected endpoint once:

```bash
curl -X POST "https://<your-app>/api/admin/migrate?secret=$ADMIN_SECRET"
```

`db/schema.sql` is idempotent — running it twice is safe.

### 4. Push to GitHub

From the project root on Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\push-to-github.ps1
```

It initialises the repo, commits, and either creates the GitHub repo through
the `gh` CLI or walks you through creating it in the browser. On macOS or Linux
do it by hand — `git init && git add -A && git commit && git remote add origin … && git push -u origin main`.

### 5. Run it

```bash
npm install
npm run dev
```

---

## Connecting each platform

**Steam** — one click. Users sign in through Steam's own OpenID, so Trace never
sees a password. Their Steam profile *and* game details must be set to Public or
the library comes back empty.

**PlayStation** — no official API. The user logs in at playstation.com, opens
`https://ca.account.sony.com/api/v1/ssocookie`, and pastes the `npsso` value.
Trace exchanges it for access + refresh tokens and stores them AES-256-GCM
encrypted. NPSSO tokens expire roughly every two months.

**Xbox** — no public API either. The user signs in at [xbl.io](https://xbl.io/)
with their Microsoft account and pastes the OpenXBL API key. The free tier
allows 150 requests/hour, which is why the sync works in batches.

---

## How sync works

One pass per platform per click, bounded so it always finishes inside a
serverless function's time limit:

1. Pull the full owned-games / title list and upsert it (fast, one request).
2. Take the N most-played games that are stale or have no achievements yet
   (Steam 25, PSN 12, Xbox 10) and pull their achievement lists.
3. Report how many games still need a pass; the UI invites another sync.

`/api/cron/sync` does the same for the stalest accounts once a day (Vercel's
Hobby plan allows one cron run per day; on Pro you can raise the frequency in
`vercel.json`).

---

## The Trace Rating

Deterministic and transparent — no black box, no random numbers. Five saturating
components on a 0–1000 scale:

| Component | Weight | Signal |
| --- | --- | --- |
| Depth | 26% | total hours played |
| Completion | 24% | achievements earned ÷ available |
| Breadth | 22% | games in library |
| Rarity | 20% | achievements held by under 10% of players |
| Reach | 8% | platforms connected |

The nine attributes each key off a different real signal — Mastery off the
single deepest game, Versatility off how many games were actually started,
Precision off sub-2% achievements, Consistency off distinct active months, and
so on. See `src/lib/stats.ts`.

---

## Project layout

```
db/schema.sql              idempotent Postgres schema (13 tables)
scripts/migrate.mjs        applies the schema
src/lib/db.ts              pooled pg client
src/lib/crypto.ts          scrypt password hashing + AES-256-GCM credential encryption
src/lib/auth.ts            cookie sessions
src/lib/stats.ts           rating + attribute engine
src/lib/engine.ts          challenge generation + recommendations
src/lib/queries.ts         read layer
src/lib/sync.ts            per-platform sync orchestration
src/lib/platforms/         steam.ts · psn.ts · xbox.ts
src/app/(app)/             the nine authenticated screens behind the sidebar shell
src/app/u/[username]/      public profile
src/app/api/               auth, connections, sync, cron, friends, migrate
```

## Security notes

- Passwords: scrypt (N=16384) with a per-user salt, verified in constant time.
- Sessions: 256-bit random tokens, only the SHA-256 hash is stored, httpOnly +
  SameSite=Lax cookies, 30-day expiry.
- Platform credentials (PSN tokens, OpenXBL keys) are AES-256-GCM encrypted at
  rest with `ENCRYPTION_KEY`. Rotating that key invalidates stored credentials
  and users must reconnect.
- Steam OpenID responses are verified against Steam with `check_authentication`
  before any account is created or linked.
