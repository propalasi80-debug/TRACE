export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

export function formatHours(minutes: number): string {
  if (!minutes) return "0h";
  const hours = minutes / 60;
  if (hours < 1) return `${Math.round(minutes)}m`;
  if (hours < 100) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours).toLocaleString()}h`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function timeAgo(input: string | Date | null | undefined): string {
  if (!input) return "never";
  const then = new Date(input).getTime();
  const diff = Date.now() - then;
  if (Number.isNaN(diff)) return "unknown";
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export interface RarityTier {
  label: string;
  color: string;
  border: string;
}

/** Achievement rarity, banded by the share of players who hold it. */
export function rarityTier(pct: number | null | undefined): RarityTier {
  if (pct == null) return { label: "Unrated", color: "var(--text-4)", border: "var(--line-2)" };
  if (pct < 1) return { label: "Mythic", color: "#e6a8ff", border: "rgba(230,168,255,0.32)" };
  if (pct < 5) return { label: "Ultra rare", color: "#ffc86b", border: "rgba(255,200,107,0.32)" };
  if (pct < 15) return { label: "Rare", color: "#6fa4ff", border: "rgba(111,164,255,0.32)" };
  if (pct < 40) return { label: "Uncommon", color: "#3ecf8e", border: "rgba(62,207,142,0.3)" };
  return { label: "Common", color: "var(--text-3)", border: "var(--line-2)" };
}

/** Compact "3 of 12" style progress label. */
export function ofLabel(done: number, total: number): string {
  return `${done.toLocaleString()} of ${total.toLocaleString()}`;
}

/** Time left until a future instant, for deadlines and expiries. */
export function timeUntil(input: string | Date | null | undefined): string {
  if (!input) return "no deadline";
  const ms = new Date(input).getTime() - Date.now();
  if (Number.isNaN(ms)) return "unknown";
  if (ms <= 0) return "expired";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    const rem = mins % 60;
    return rem > 0 ? `${hours}h ${rem}m left` : `${hours}h left`;
  }
  const days = Math.floor(hours / 24);
  const remH = hours % 24;
  return remH > 0 ? `${days}d ${remH}h left` : `${days}d left`;
}
