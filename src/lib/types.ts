export type Platform = "steam" | "psn" | "xbox";

export const PLATFORMS: Platform[] = ["steam", "psn", "xbox"];

export const PLATFORM_META: Record<
  Platform,
  { label: string; short: string; color: string }
> = {
  steam: { label: "Steam", short: "ST", color: "#c7d5e0" },
  psn: { label: "PlayStation", short: "PS", color: "#2e86ff" },
  xbox: { label: "Xbox", short: "XB", color: "#5ac45a" },
};

export interface SessionUser {
  id: string;
  email: string | null;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
  show_playtime: boolean;
  share_activity: boolean;
}

export interface PlatformAccountRow {
  id: string;
  user_id: string;
  platform: Platform;
  platform_user_id: string;
  handle: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  last_synced_at: string | null;
  sync_status: string;
  sync_error: string | null;
}

/** Normalised shape every platform adapter returns. */
export interface SyncGame {
  platformGameId: string;
  name: string;
  coverUrl?: string | null;
  iconUrl?: string | null;
  playtimeMinutes?: number;
  lastPlayedAt?: Date | null;
  achievements?: SyncAchievement[];
}

export interface SyncAchievement {
  platformAchievementId: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  rarityPct?: number | null;
  points?: number;
  tier?: string | null;
  unlocked: boolean;
  unlockedAt?: Date | null;
}
