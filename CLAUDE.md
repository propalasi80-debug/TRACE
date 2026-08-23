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

## How progress works

A sync is the only moment TRACE learns anything new, so everything derived from
play settles there. `settleProgress()` in `src/lib/sync.ts` runs after a
successful sync and does three things: snapshots the rating (at most once every
20 hours), re-measures every open challenge, and awards any milestone reached.

Challenges carry `metric`, `target_game_id` and `baseline`, captured when the
challenge is issued. Progress is always *current reading minus baseline*, never
an absolute count, so a challenge issued today cannot be satisfied by something
you did last year. `npm run test:engine` proves this against a throwaway
Postgres: it issues challenges, evaluates with no play (expects zero movement),
simulates play, and asserts the right ones complete with the right XP.

## Pages

Nine authenticated screens behind the sidebar shell, plus the public profile.
Two worth knowing about because they were added after the first release:

- `/library/[id]` is the game detail page: per-title stats and the full
  achievement list split into unlocked and still locked. Every library card,
  home card and achievement row links here, so no card is decorative.
- `/achievements` is the browser: unlocked or locked, filtered by platform and
  rarity band, sorted by newest, rarest or game, paginated at 60 a page.

Games with no publisher art get deterministic generated artwork from
`src/lib/art.ts` rather than a grey rectangle. The same title always produces
the same cover, and the hues stay inside the brand's blue to teal arc.

## Loading and pending states

Three layers, because they cover different gaps:

1. **Route skeletons.** Every route has its own `loading.tsx` composed from
   `src/components/app/Skeletons.tsx`. They are shaped like the page that
   follows, so content does not jump when it arrives. A generic skeleton is
   worse than none.
2. **Per-link spinners.** Filter chips and nav items are `ChipLink` / `NavLink`
   from `src/components/app/PendingLink.tsx`, which use `useLinkStatus` to show
   a small spinner in place. This covers the gap before Next commits the
   navigation, which the route skeleton cannot.
3. **Action pending.** Buttons that call server actions or fetch report their
   own state ("Syncing", "Saving", "Logging out") and disable while in flight.

Generated cover art is painted underneath real artwork rather than instead of
it, so a slow image shows the title's own colours instead of an empty box. Same
for avatars, where the initial sits behind the picture.

## Known gaps / next up
- `getRecommendations()` scores a hardcoded 10-game catalogue in
  `src/lib/engine.ts`. Replace with IGDB or a genre feed when there's an API key.
  This is now the largest remaining gap.
- Friend presence shows last-played from the last sync, not live status.
- `second-opinion` counts any two newly started games, not specifically ones
  from the Suggestions list. Tightening that needs a record of what was
  suggested when.
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
