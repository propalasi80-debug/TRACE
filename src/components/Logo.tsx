import Image from "next/image";
import Link from "next/link";

/**
 * The TRACE lockup. Both the mark and the wordmark are the supplied brand
 * artwork, keyed to transparency. Never rebuild either from type or CSS.
 */
export function Logo({
  href = "/",
  height = 22,
  wordmark = true,
}: {
  href?: string | null;
  height?: number;
  wordmark?: boolean;
}) {
  const inner = (
    <>
      <Image
        src="/assets/trace-mark.webp"
        alt=""
        width={Math.round(height * 1.486)}
        height={height}
        priority
        style={{ height, width: "auto", display: "block" }}
      />
      {wordmark && (
        <Image
          src="/assets/trace-wordmark.webp"
          alt="TRACE"
          width={Math.round(height * 6.2)}
          height={Math.round(height * 0.69)}
          priority
          style={{ height: Math.round(height * 0.69), width: "auto", display: "block" }}
        />
      )}
      {!wordmark && <span className="sr-only">TRACE</span>}
    </>
  );

  const className = "flex items-center";
  const style = { gap: Math.round(height * 0.5) };

  if (!href) {
    return (
      <span className={className} style={style}>
        {inner}
      </span>
    );
  }

  return (
    <Link href={href} className={className} style={style} aria-label="TRACE home">
      {inner}
    </Link>
  );
}
