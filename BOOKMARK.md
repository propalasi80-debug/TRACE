# TRACE: where we are, and what is next

Last updated: 23 August 2026, end of the redesign pass.

## Live

| Thing | Where |
| --- | --- |
| Production | https://trace-pearl-six.vercel.app |
| Vercel project | `trace`, **Provio team** (not your personal Vercel scope) |
| Repo | `propalasi80-debug/TRACE`, pushes to `main` auto-deploy |
| Database | Supabase, schema applied, 13 tables plus RLS |
| Code | `C:\Users\Admin\trace` |

If Vercel shows a project linked to a different repo, you are in the wrong scope.
Use the switcher at the top left and pick **Provio**.

## Done in the redesign pass

- **Brand.** The mark and wordmark are keyed out of your supplied artwork with
  transparent alpha (`public/assets/trace-mark.webp`, `trace-wordmark.webp`).
  Never rebuilt in CSS or substituted with a font. `src/app/icon.png` is the favicon.
- **Type.** Saira with its width axis pushed to 106 to 112 percent, which sits close
  to the wordmark geometry. Inter for body. Both self hosted. One type scale in
  `globals.css` (`.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-label`, `.t-num`).
- **Topology.** `src/components/landing/Topology.tsx`. Contours masked to the left
  and right edges, fading out through the middle third where content sits, with a
  separate blurred pass for the blue bloom. Density drops on small screens.
- **Platform marks.** Real brand marks from the CC0 simple-icons set for Steam,
  PlayStation, Epic, GOG, Battle.net, Riot, EA, Ubisoft and itch.io, in
  `src/lib/platforms/registry.ts`. Xbox and Nintendo are deliberately absent from
  that set at their owners' request, so they render as lettered wordmarks rather
  than lookalikes. Drop an official path into `registry.ts` and they pick it up.
- **Copy.** Zero em dashes anywhere in `src/` or `db/`. No placeholder or
  development text.
- **Bugs fixed.** The rating gauge swept the wrong way past halfway. Challenge
  deadlines read "just now" because a past-tense helper was used on a future date.
  Platform tags read "XB Xbox". The library `unplayed` filter was built with a
  string replace that could corrupt the query. Local Postgres was forced through SSL.
- **States added.** Loading skeletons, an error boundary that names a missing
  `DATABASE_URL` specifically, and a 404 page.
- **Privacy.** Three real toggles wired to columns: public profile, show playtime,
  friend activity.
- **Weight.** Assets went from 791 KB to 40 KB. The topo background is 5.5 KB.

## Verified

Typecheck, lint and production build clean. Every page screenshotted at 1440,
820 and 390 px against a seeded local Postgres. No horizontal overflow at any width.

## Next, in priority order

1. **Challenge progress never increments.** Challenges generate correctly and expire
   correctly, but `progress` stays at 0. Wire it into `writeAchievements()` in
   `src/lib/sync.ts`: when a sync satisfies a challenge condition, bump `progress`,
   set `completed_at`, insert into `xp_ledger` and award the badge in `user_badges`.
   This is the single biggest gap.
2. **Badges are computed, not awarded.** `rewards/page.tsx` derives milestones live
   from totals. Write them into `user_badges` at sync time so the earned date is real.
3. **Suggestions catalogue** is ten hand written entries in `src/lib/engine.ts`.
   Swap for IGDB when you have a key.
4. **Game artwork.** Steam returns real cover art. PSN returns trophy icons, Xbox
   returns display images, some titles return nothing. Consider IGDB or SteamGridDB
   for a consistent fallback.
5. **Friend presence** shows last played from the most recent sync. No platform
   offers live presence without a persistent connection, so this may stay as is.
6. **Cron is daily** because Hobby plans reject anything more frequent. On Pro,
   raise the schedule in `vercel.json`.

## Gotchas worth remembering

- Supabase: use the **transaction pooler on 6543** for serverless. Trace uses no
  prepared statements, so transaction mode is safe.
- Environment variables only take effect on a **fresh build**. Adding one and not
  redeploying does nothing.
- The Cowork mount cannot delete files, so git commands run from there leave stale
  `index.lock` files. Run git from PowerShell instead.
- Steam rate limits the API key page aggressively. If you see "too many requests",
  wait and load it once rather than refreshing.
