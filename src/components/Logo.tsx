import Image from "next/image";
import Link from "next/link";

export function Logo({
  href = "/",
  markSize = 24,
  fontSize = 16,
  tracking = ".32em",
}: {
  href?: string;
  markSize?: number;
  fontSize?: number;
  tracking?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-[11px] text-[var(--text)] hover:text-[var(--text)]"
    >
      <Image
        src="/assets/trace-mark.png"
        alt="Trace"
        width={Math.round(markSize * 1.45)}
        height={markSize}
        priority
        style={{ height: markSize, width: "auto", display: "block" }}
      />
      <span
        className="font-display font-bold uppercase"
        style={{ fontSize, letterSpacing: tracking }}
      >
        Trace
      </span>
    </Link>
  );
}
