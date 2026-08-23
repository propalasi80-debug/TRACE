import {
  siSteam,
  siPlaystation,
  siEpicgames,
  siGogdotcom,
  siBattledotnet,
  siRiotgames,
  siEa,
  siUbisoft,
  siItchdotio,
} from "simple-icons";

export type PlatformKey =
  | "steam"
  | "psn"
  | "xbox"
  | "epic"
  | "nintendo"
  | "gog"
  | "battlenet"
  | "riot"
  | "ea"
  | "ubisoft"
  | "itch";

export interface PlatformBrand {
  key: PlatformKey;
  /** Full name as the platform writes it. */
  label: string;
  /** Short form for tight spaces. */
  short: string;
  /** Brand colour, adjusted where the official mark is black and the UI is dark. */
  color: string;
  /** Official mark path from the CC0 simple-icons set, sized on a 24x24 grid. */
  path?: string;
  /** True once TRACE can actually read data from it. */
  live: boolean;
  /** Why it is not connectable yet. */
  note?: string;
}

/**
 * Official brand marks come from simple-icons (CC0 icon data; trademarks remain
 * with their owners, and are used here only to identify each platform).
 *
 * Xbox and Nintendo are deliberately absent from that set at their owners'
 * request. Rather than drawing a lookalike, those two render as wordmarks. Drop
 * an official SVG path into `path` here and they pick it up with no other change.
 */
export const PLATFORM_BRANDS: Record<PlatformKey, PlatformBrand> = {
  steam: {
    key: "steam",
    label: "Steam",
    short: "ST",
    color: "#c7d5e0",
    path: siSteam.path,
    live: true,
  },
  psn: {
    key: "psn",
    label: "PlayStation",
    short: "PS",
    color: "#2e86ff",
    path: siPlaystation.path,
    live: true,
  },
  xbox: {
    key: "xbox",
    label: "Xbox",
    short: "XB",
    color: "#5ac45a",
    live: true,
  },
  epic: {
    key: "epic",
    label: "Epic Games",
    short: "EG",
    color: "#e8e8e8",
    path: siEpicgames.path,
    live: false,
    note: "No public library API",
  },
  nintendo: {
    key: "nintendo",
    label: "Nintendo",
    short: "NT",
    color: "#ff4d55",
    live: false,
    note: "No public library API",
  },
  gog: {
    key: "gog",
    label: "GOG",
    short: "GG",
    color: "#b070d8",
    path: siGogdotcom.path,
    live: false,
    note: "No public library API",
  },
  battlenet: {
    key: "battlenet",
    label: "Battle.net",
    short: "BN",
    color: "#4381c3",
    path: siBattledotnet.path,
    live: false,
    note: "No public library API",
  },
  riot: {
    key: "riot",
    label: "Riot Games",
    short: "RG",
    color: "#eb0029",
    path: siRiotgames.path,
    live: false,
    note: "Match data only, no library",
  },
  ea: {
    key: "ea",
    label: "EA",
    short: "EA",
    color: "#e8e8e8",
    path: siEa.path,
    live: false,
    note: "No public library API",
  },
  ubisoft: {
    key: "ubisoft",
    label: "Ubisoft",
    short: "UB",
    color: "#e8e8e8",
    path: siUbisoft.path,
    live: false,
    note: "No public library API",
  },
  itch: {
    key: "itch",
    label: "itch.io",
    short: "IT",
    color: "#fa5c5c",
    path: siItchdotio.path,
    live: false,
    note: "No public library API",
  },
};

/** Marquee order: the three that work, then the rest. */
export const MARQUEE_ORDER: PlatformKey[] = [
  "steam",
  "psn",
  "xbox",
  "epic",
  "nintendo",
  "battlenet",
  "riot",
  "ea",
  "ubisoft",
  "gog",
  "itch",
];
