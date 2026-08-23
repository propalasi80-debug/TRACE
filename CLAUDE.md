# Working on Trace

Context for Claude Code (or any agent) picking this repo up in VS Code.

## What this is

A gaming identity platform. Users link Steam / PlayStation / Xbox, Trace syncs
their libraries and achievements into Postgres, and derives one rating, nine
attributes, a merged library, challenges, rewards and a public profile.

Design comes from a Claude Design handoff ("Trace App.dc.html" + README).
The design is **final and high fidelity** — colours, type, spacing, radii and
motion are all specified. Do not improvise new visual language; the tokens live
in `src/app/globals.css` under `:root`.

## Conventions

- **Next.js 16 App Router**, all data pages are `export const dynamic = "force-dynamic"`.
- **Server Components by default.** Client components only where there is real
  interaction (`Connections`, `FriendActions`, `AuthCard`, `ProfileForm`, `CopyLink`, `Sidebar`).
- **Postgres via `pg`**, raw parameterised SQL through `src/lib/db.ts`. No ORM.
  Never interpolate user input into SQL — always `$1` placeholders.
- **Styling**: Tailwind v4 for layout utilities, inline `style` objects for the
  exact design values (the handoff specifies 13.5px, `.14em`, etc. — those don't
  map cleanly to Tailwind's scale). Shared pieces are CSS classes in `globals.css`
  (`.card`, `.tile`, `.btn-primary`, `.btn-ghost`, `.field`, `.nav-item`, `.eyebrow`).
- **Fonts are self-hosted** via `@fontsource` — do not switch back to `next/font/google`.
- Reduced motion is honoured; keep new animations behind the existing
  `@media (prefers-reduced-motion: reduce)` block.

## Ground rule: no fake data

Every number on screen comes from the database. Where there's nothing yet, the
page shows a real empty state pointing at `/settings`. The prototype's sample
values (NEXUS_PRIME, 874, "4,218 hours") are **design placeholders** — never
ship them as content.

## Adding a platform

1. `src/lib/platforms/<name>.ts` — export functions returning the normalised
   `SyncGame` / `SyncAchievement` shapes from `src/lib/types.ts`.
2. Add the key to `Platform` and `PLATFORM_META` in `src/lib/types.ts`.
3. Add a branch in `syncPlatform()` in `src/lib/sync.ts` and a batch size in `ACH_BATCH`.
4. Add a connect route under `src/app/api/connections/<name>/`.
5. Add it to the `platforms` array in `src/components/app/Connections.tsx` and
   remove it from the `soon` list.

The sync must stay bounded — pull the full title list, then only N stale games'
achievements per pass, and report `remaining` so the UI can offer another run.

## Known gaps / next up

- Challenge `progress` is never incremented. Wire it into `writeAchievements()`
  in `src/lib/sync.ts`: when a challenge's condition is met, bump `progress`,
  set `completed_at`, and insert into `xp_ledger` + `user_badges`.
- `getRecommendations()` scores a hardcoded 10-game catalogue in
  `src/lib/engine.ts`. Replace with IGDB or a genre feed when there's an API key.
- Friend presence shows last-played from the last sync, not live status.
- Avatars and box art: Steam gives real cover URLs; PSN gives trophy icons; Xbox
  gives display images. There is no art for games that return none — the grey
  placeholder from the design is the fallback.
- `rating_history` is only written once per ~20h during sync, so `ratingDelta`
  is 0 until a user has synced on two different days.

## Commands

```bash
npm run dev         # local dev
npm run build       # production build (must pass before pushing)
npm run typecheck   # tsc --noEmit
npm run db:migrate  # apply db/schema.sql (idempotent)
```
