import {
  exchangeNpssoForCode,
  exchangeCodeForAccessToken,
  exchangeRefreshTokenForAuthTokens,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  type AuthTokensResponse,
} from "psn-api";
import type { SyncGame, SyncAchievement } from "../types";

export interface PsnCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const LANG = { headerOverrides: { "Accept-Language": "en-us" } } as const;

export async function authFromNpsso(npsso: string): Promise<PsnCredentials> {
  const code = await exchangeNpssoForCode(npsso.trim());
  const auth = await exchangeCodeForAccessToken(code);
  return toCreds(auth);
}

export async function refreshIfNeeded(creds: PsnCredentials): Promise<PsnCredentials> {
  if (Date.now() < creds.expiresAt - 60_000) return creds;
  const auth = await exchangeRefreshTokenForAuthTokens(creds.refreshToken);
  return toCreds(auth);
}

function toCreds(auth: AuthTokensResponse): PsnCredentials {
  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    expiresAt: Date.now() + auth.expiresIn * 1000,
  };
}

export interface PsnProfile {
  accountId: string;
  onlineId: string;
  avatar: string | null;
}

/** PSN's own profile endpoint via the basic profile API. */
export async function fetchPsnProfile(creds: PsnCredentials): Promise<PsnProfile> {
  const res = await fetch(
    "https://m.np.playstation.com/api/userProfile/v1/internal/users/me/profiles",
    {
      headers: { Authorization: `Bearer ${creds.accessToken}` },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`PSN profile lookup failed (HTTP ${res.status})`);
  const data = (await res.json()) as {
    accountId?: string;
    onlineId?: string;
    avatars?: { size: string; url: string }[];
  };
  const avatar =
    data.avatars?.find((a) => a.size === "xl")?.url ?? data.avatars?.[0]?.url ?? null;
  return {
    accountId: data.accountId ?? "me",
    onlineId: data.onlineId ?? "PSN user",
    avatar,
  };
}

const TROPHY_POINTS: Record<string, number> = {
  bronze: 15,
  silver: 30,
  gold: 90,
  platinum: 300,
};

export async function fetchPsnTitles(creds: PsnCredentials): Promise<
  (SyncGame & { npServiceName: "trophy" | "trophy2" })[]
> {
  const out: (SyncGame & { npServiceName: "trophy" | "trophy2" })[] = [];
  let offset = 0;
  for (let page = 0; page < 20; page++) {
    const res = await getUserTitles({ accessToken: creds.accessToken }, "me", {
      limit: 100,
      offset,
      ...LANG,
    });
    const titles = res.trophyTitles ?? [];
    for (const t of titles) {
      out.push({
        platformGameId: t.npCommunicationId,
        name: t.trophyTitleName,
        coverUrl: t.trophyTitleIconUrl ?? null,
        iconUrl: t.trophyTitleIconUrl ?? null,
        playtimeMinutes: 0,
        lastPlayedAt: t.lastUpdatedDateTime ? new Date(t.lastUpdatedDateTime) : null,
        npServiceName: (t.npServiceName as "trophy" | "trophy2") ?? "trophy2",
      });
    }
    offset += titles.length;
    if (titles.length < 100 || offset >= (res.totalItemCount ?? offset)) break;
  }
  return out;
}

export async function fetchPsnTrophies(
  creds: PsnCredentials,
  npCommunicationId: string,
  npServiceName: "trophy" | "trophy2"
): Promise<SyncAchievement[]> {
  const res = await getUserTrophiesEarnedForTitle(
    { accessToken: creds.accessToken },
    "me",
    npCommunicationId,
    "all",
    { npServiceName, ...LANG }
  );
  // With Accept-Language set, PSN also returns name/detail/icon on each
  // trophy; psn-api's UserThinTrophy type does not model those extras.
  type ThinPlus = (typeof res.trophies)[number] & {
    trophyName?: string;
    trophyDetail?: string;
    trophyIconUrl?: string;
  };

  return ((res.trophies ?? []) as ThinPlus[]).map((t) => {
    const rate = t.trophyEarnedRate ? Number(t.trophyEarnedRate) : null;
    return {
      platformAchievementId: String(t.trophyId),
      name: t.trophyName ?? `Trophy ${t.trophyId}`,
      description: t.trophyDetail ?? null,
      iconUrl: t.trophyIconUrl ?? null,
      rarityPct: Number.isFinite(rate) ? rate : null,
      points: TROPHY_POINTS[t.trophyType ?? "bronze"] ?? 15,
      tier: t.trophyType ?? null,
      unlocked: Boolean(t.earned),
      unlockedAt: t.earnedDateTime ? new Date(t.earnedDateTime) : null,
    };
  });
}
