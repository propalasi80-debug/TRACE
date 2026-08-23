/**
 * The TRACE topology field.
 *
 * Contour artwork sits in a fixed layer behind everything, masked so it reads
 * strongly at the left and right edges and falls away to nothing through the
 * middle third, where content lives. A second, blurred copy of the same
 * artwork supplies the blue edge bloom. Density drops on small screens via
 * the [data-topology] rule in globals.css.
 */
export function Topology({
  variant = "page",
}: {
  /** "page" for the marketing shell, "app" for the quieter in-product version. */
  variant?: "page" | "app";
}) {
  const app = variant === "app";

  // Horizontal falloff: opaque at both edges, clear across the middle.
  const edgeMask =
    "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.62) 16%, transparent 38%, transparent 62%, rgba(0,0,0,0.62) 84%, #000 100%)";
  // Vertical falloff so the pattern never crowds the header or the footer.
  const fadeMask =
    "linear-gradient(180deg, transparent 0%, #000 12%, #000 74%, transparent 100%)";
  const bloomMask =
    "linear-gradient(90deg, #000 0%, transparent 26%, transparent 74%, #000 100%)";

  return (
    <div
      aria-hidden="true"
      data-topology
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        opacity: app ? 0.5 : 1,
      }}
    >
      {!app && (
        <>
          <div
            data-orb
            style={{
              position: "absolute",
              top: "-24%",
              left: "-12%",
              width: "62vw",
              height: "62vw",
              maxWidth: 820,
              maxHeight: 820,
              background:
                "radial-gradient(closest-side, rgba(31,111,255,0.34), transparent 72%)",
              filter: "blur(48px)",
              animation: "trace-drift 26s ease-in-out infinite",
            }}
          />
          <div
            data-orb
            style={{
              position: "absolute",
              top: "-8%",
              right: "-14%",
              width: "56vw",
              height: "56vw",
              maxWidth: 760,
              maxHeight: 760,
              background:
                "radial-gradient(closest-side, rgba(0,120,240,0.24), transparent 72%)",
              filter: "blur(56px)",
              animation: "trace-drift 34s ease-in-out infinite reverse",
            }}
          />
        </>
      )}

      {/* contour lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/assets/topo.webp)",
          backgroundSize: app ? "1180px auto" : "1420px auto",
          backgroundPosition: "12% 0",
          backgroundRepeat: "repeat",
          filter: app ? "brightness(1.3) contrast(1.15)" : "brightness(1.75) contrast(1.2)",
          opacity: app ? 0.55 : 1,
          WebkitMaskImage: `${edgeMask}, ${fadeMask}`,
          maskImage: `${edgeMask}, ${fadeMask}`,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      />

      {/* blue bloom, edges only */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/assets/topo.webp)",
          backgroundSize: app ? "1180px auto" : "1420px auto",
          backgroundPosition: "12% 0",
          backgroundRepeat: "repeat",
          opacity: app ? 0.24 : 0.42,
          filter: "blur(10px) saturate(190%)",
          mixBlendMode: "screen",
          WebkitMaskImage: `${bloomMask}, ${fadeMask}`,
          maskImage: `${bloomMask}, ${fadeMask}`,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      />

      {/* settles the whole field into the page ground */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 80% at 50% 30%, transparent 0%, rgba(5,6,9,0.55) 62%, rgba(5,6,9,0.9) 100%)",
        }}
      />
    </div>
  );
}
