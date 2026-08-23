import { getJson } from "../http";
import type { SyncAchievement, SyncGame } from "../types";

const BASE = "https://xbl.io/api/v2";

function headers(apiKey: string): Record<string, string> {
  return { "X-Authorization": apiKey, accept: "application/json" };
}

export interface XboxProfile {
  xuid: string;
  gamertag: string;
  avatar: string | null;
  gamerscore: number;
}

interface XblSetting {
  id: string;
  value: string;
}

export async function fetchXboxProfile(apiKey: string): Promise<XboxProfile> {
  const data = await getJson<{
    profileUsers?: { id: string; settings: XblSetting[] }[];
  }>(`${BASE}/account`, { headers: headers(apiKey) });
  const user = data.profileUsers?.[0];
  if (!user) throw new Error("OpenXBL returned no account — check the API key.");
  const get = (id: string) => user.settings.find((s) => s.id === id)?.value ?? null;
  return {
    xuid: user.id,
    gamertag: get("Gamertag") ?? "Xbox user",
    avatar: get("GameDisplayPicRaw"),
    gamerscore: Number(get("Gamerscore") ?? 0) || 0,
  };
}

interface XblTitle {
  titleId: string;
  name: string;
  displayImage?: string;
  titleHistory?: { lastTimePlayed?: string };
  achievement?: { currentAchievements?: number; totalAchievements?: number; currentGamerscore?: number; totalGamerscore?: number };
}

export async function fetchXboxTitles(apiKey: string, xuid: string): Promise<SyncGame[]> {
  const data = await getJson<{ titles?: XblTitle[] }>(
    `${BASE}/player/titleHistory/${xuid}`,
    { headers: headers(apiKey), timeoutMs: 25_000 }
  );
  return (data.titles ?? []).map((t) => ({
    platformGameId: String(t.titleId),
    name: t.name,
    coverUrl: t.displayImage ?? null,
    iconUrl: t.displayImage ?? null,
    playtimeMinutes: 0,
    lastPlayedAt: t.titleHistory?.lastTimePlayed ? new Date(t.titleHistory.lastTimePlayed) : null,
  }));
}

interface XblAchievement {
  id?: string | number;
  achievementId?: string | number;
  name: string;
  description?: string;
  lockedDescription?: string;
  progressState?: string;
  progression?: { timeUnlocked?: string };
  timeUnlocked?: string;
  rarity?: { currentPercentage?: string | number };
  rewards?: { type: string; value: string }[];
  mediaAssets?: { name: string; type: string; url: string }[];
}

export async function fetchXboxAchievements(
  apiKey: string,
  xuid: string,
  titleId: string
): Promise<SyncAchievement[]> {
  const data = await getJson<{ achievements?: XblAchievement[] }>(
    `${BASE}/achievements/player/${xuid}/${titleId}`,
    { headers: headers(apiKey) }
  );
  return (data.achievements ?? []).map((a, idx) => {
    const unlocked = (a.progressState ?? "").toLowerCase() === "achieved";
    const when = a.progression?.timeUnlocked ?? a.timeUnlocked ?? null;
    const gamerscore = a.rewards?.find((r) => r.type === "Gamerscore")?.value;
    const rarity = a.rarity?.currentPercentage;
    return {
      platformAchievementId: String(a.id ?? a.achievementId ?? idx),
      name: a.name,
      description: unlocked ? a.description ?? null : a.lockedDescription ?? a.description ?? null,
      iconUrl: a.mediaAssets?.find((m) => m.type === "Icon")?.url ?? null,
      rarityPct: rarity != null ? Number(rarity) : null,
      points: gamerscore ? Number(gamerscore) : 0,
      tier: null,
      unlocked,
      unlockedAt: unlocked && when ? new Date(when) : null,
    };
  });
}
