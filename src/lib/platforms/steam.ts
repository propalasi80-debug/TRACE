import { getJson, mapLimit } from "../http";
import type { SyncGame } from "../types";

const API = "https://api.steampowered.com";

function key(): string {
  const k = process.env.STEAM_API_KEY;
  if (!k) throw new Error("STEAM_API_KEY is not configured on the server.");
  return k;
}

export interface SteamProfile {
  steamId: string;
  personaName: string;
  avatar: string | null;
  profileUrl: string | null;
}

export async function fetchSteamProfile(steamId: string): Promise<SteamProfile> {
  const data = await getJson<{
    response: {
      players: {
        steamid: string;
        personaname: string;
        avatarfull?: string;
        profileurl?: string;
      }[];
    };
  }>(`${API}/ISteamUser/GetPlayerSummaries/v2/?key=${key()}&steamids=${steamId}`);
  const p = data.response.players[0];
  if (!p) throw new Error("Steam profile not found. Check that the profile is set to public.");
  return {
    steamId: p.steamid,
    personaName: p.personaname,
    avatar: p.avatarfull ?? null,
    profileUrl: p.profileurl ?? null,
  };
}

export async function fetchOwnedGames(steamId: string): Promise<SyncGame[]> {
  const data = await getJson<{
    response: {
      games?: {
        appid: number;
        name?: string;
        playtime_forever?: number;
        rtime_last_played?: number;
        img_icon_url?: string;
        has_community_visible_stats?: boolean;
      }[];
    };
  }>(
    `${API}/IPlayerService/GetOwnedGames/v1/?key=${key()}&steamid=${steamId}` +
      `&include_appinfo=1&include_played_free_games=1&format=json`,
    { timeoutMs: 25_000 }
  );
  const games = data.response.games ?? [];
  if (games.length === 0) {
    throw new Error(
      "Steam returned no games. Set your Steam profile and game details to Public, then sync again."
    );
  }
  return games.map((g) => ({
    platformGameId: String(g.appid),
    name: g.name?.trim() || `App ${g.appid}`,
    coverUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
    iconUrl: g.img_icon_url
      ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
      : null,
    playtimeMinutes: g.playtime_forever ?? 0,
    lastPlayedAt: g.rtime_last_played ? new Date(g.rtime_last_played * 1000) : null,
  }));
}

interface SchemaAchievement {
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  icongray?: string;
  hidden?: number;
}

export async function fetchGameAchievements(
  steamId: string,
  appId: string
): Promise<SyncGame["achievements"]> {
  const [player, schema, global] = await Promise.all([
    getJson<{
      playerstats?: {
        achievements?: { apiname: string; achieved: number; unlocktime: number }[];
        success?: boolean;
      };
    }>(
      `${API}/ISteamUserStats/GetPlayerAchievements/v1/?key=${key()}&steamid=${steamId}&appid=${appId}&l=en`
    ).catch(() => null),
    getJson<{
      game?: { availableGameStats?: { achievements?: SchemaAchievement[] } };
    }>(`${API}/ISteamUserStats/GetSchemaForGame/v2/?key=${key()}&appid=${appId}&l=en`).catch(
      () => null
    ),
    getJson<{
      achievementpercentages?: { achievements?: { name: string; percent: number }[] };
    }>(
      `${API}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${appId}`
    ).catch(() => null),
  ]);

  const playerList = player?.playerstats?.achievements ?? [];
  if (playerList.length === 0) return [];

  const schemaMap = new Map<string, SchemaAchievement>();
  for (const a of schema?.game?.availableGameStats?.achievements ?? []) schemaMap.set(a.name, a);

  const rarityMap = new Map<string, number>();
  for (const a of global?.achievementpercentages?.achievements ?? [])
    rarityMap.set(a.name, a.percent);

  return playerList.map((a) => {
    const meta = schemaMap.get(a.apiname);
    const unlocked = a.achieved === 1;
    return {
      platformAchievementId: a.apiname,
      name: meta?.displayName?.trim() || a.apiname,
      description: meta?.description ?? null,
      iconUrl: (unlocked ? meta?.icon : meta?.icongray ?? meta?.icon) ?? null,
      rarityPct: rarityMap.get(a.apiname) ?? null,
      points: 0,
      tier: null,
      unlocked,
      unlockedAt: unlocked && a.unlocktime ? new Date(a.unlocktime * 1000) : null,
    };
  });
}

export async function fetchAchievementsForGames(
  steamId: string,
  appIds: string[]
): Promise<Map<string, NonNullable<SyncGame["achievements"]>>> {
  const result = new Map<string, NonNullable<SyncGame["achievements"]>>();
  await mapLimit(appIds, 4, async (appId) => {
    try {
      const list = await fetchGameAchievements(steamId, appId);
      result.set(appId, list ?? []);
    } catch {
      result.set(appId, []);
    }
  });
  return result;
}

/* ---------- Steam OpenID 2.0 ---------- */

const OPENID_ENDPOINT = "https://steamcommunity.com/openid/login";

export function steamLoginUrl(returnTo: string, realm: string): string {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `${OPENID_ENDPOINT}?${params.toString()}`;
}

export async function verifySteamOpenId(searchParams: URLSearchParams): Promise<string | null> {
  const body = new URLSearchParams(searchParams);
  body.set("openid.mode", "check_authentication");
  const res = await fetch(OPENID_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });
  const text = await res.text();
  if (!/is_valid\s*:\s*true/i.test(text)) return null;
  const claimed = searchParams.get("openid.claimed_id") ?? "";
  const match = claimed.match(/\/id\/(\d{17})$/);
  return match ? match[1] : null;
}
