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

export function rarityTier(pct: number | null | undefined): {
  label: string;
  className: string;
} {
  if (pct == null) return { label: "Unknown", className: "text-zinc-400 bg-zinc-500/10" };
  if (pct < 1) return { label: "Mythic", className: "text-fuchsia-300 bg-fuchsia-500/10" };
  if (pct < 5) return { label: "Ultra rare", className: "text-amber-300 bg-amber-500/10" };
  if (pct < 15) return { label: "Rare", className: "text-sky-300 bg-sky-500/10" };
  if (pct < 40) return { label: "Uncommon", className: "text-emerald-300 bg-emerald-500/10" };
  return { label: "Common", className: "text-zinc-300 bg-zinc-500/10" };
}
