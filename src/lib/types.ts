export type Platform = "steam" | "psn" | "xbox";

export const PLATFORMS: Platform[] = ["steam", "psn", "xbox"];

export const PLATFORM_META: Record<
  Platform,
  { label: string; short: string; accent: string; ring: string; text: string }
> = {
  steam: {
    label: "Steam",
    short: "ST",
    accent: "bg-[#1b2838]",
    ring: "ring-[#66c0f4]/40",
    text: "text-[#66c0f4]",
  },
  psn: {
    label: "PlayStation",
    short: "PS",
    accent: "bg-[#0d2a6b]",
    ring: "ring-[#4c8bf5]/40",
    text: "text-[#7aa7ff]",
  },
  xbox: {
    label: "Xbox",
    short: "XB",
    accent: "bg-[#0d2f14]",
    ring: "ring-[#52b043]/40",
    text: "text-[#7ddb6a]",
  },
};

export interface SessionUser {
  id: string;
  email: string | null;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
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
