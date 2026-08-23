/**
 * Deterministic artwork for titles the platforms give us nothing for.
 *
 * Steam returns real key art, PlayStation returns trophy icons and Xbox
 * returns display images, but plenty of titles return none of the above. A
 * grey rectangle reads as a broken image; a generated mark reads as designed.
 * The same title always produces the same artwork.
 */

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Hues kept inside the brand's blue-violet-teal arc so covers never clash. */
const HUES = [212, 224, 236, 248, 260, 196, 184, 206];

export interface GeneratedArt {
  background: string;
  monogram: string;
  accent: string;
}

export function generateArt(name: string): GeneratedArt {
  const h = hash(name);
  const hue = HUES[h % HUES.length];
  const shift = 14 + (h % 22);
  const angle = 145 + (h % 60);

  const words = name
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const monogram =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (words[0]?.slice(0, 2) ?? "??").toUpperCase();

  return {
    background: `linear-gradient(${angle}deg, hsl(${hue} 62% 17%), hsl(${(hue + shift) % 360} 54% 9%))`,
    accent: `hsl(${hue} 78% 68%)`,
    monogram,
  };
}
