/** The signature landing background: drifting colour fields, topographic
 *  contours, an edge glow pass and film grain. Purely decorative. */
export function Backdrop() {
  const orbs = [
    { top: -340, left: "-6%", w: 900, h: 820, c: "rgba(46,125,255,.55)", blur: 30, dur: 34, rev: false },
    { top: -120, right: "-14%", w: 760, h: 700, c: "rgba(124,92,255,.42)", blur: 38, dur: 46, rev: true },
    { top: 420, left: "24%", w: 640, h: 520, c: "rgba(0,209,178,.2)", blur: 44, dur: 58, rev: false },
    { top: 560, right: "12%", w: 520, h: 440, c: "rgba(255,70,85,.16)", blur: 46, dur: 40, rev: true },
    { top: 1420, left: "-8%", w: 820, h: 640, c: "rgba(124,92,255,.2)", blur: 50, dur: 62, rev: false },
    { top: 1760, right: "-10%", w: 760, h: 600, c: "rgba(46,125,255,.22)", blur: 52, dur: 50, rev: true },
  ];
  const topo = "linear-gradient(90deg,#000,rgba(0,0,0,.4) 30%,rgba(0,0,0,.4) 70%,#000)";
  const topoEdge = "linear-gradient(90deg,#000,transparent 26%,transparent 74%,#000)";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {orbs.slice(0, 4).map((o, i) => (
        <div
          key={i}
          data-orb
          style={{
            position: "absolute",
            top: o.top,
            left: o.left,
            right: o.right,
            width: o.w,
            height: o.h,
            background: `radial-gradient(45% 45% at 50% 50%, ${o.c}, transparent 70%)`,
            filter: `blur(${o.blur}px)`,
            animation: `drift ${o.dur}s ease-in-out infinite${o.rev ? " reverse" : ""}`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg,rgba(5,5,6,.34) 0px,rgba(5,5,6,.62) 620px,rgba(5,5,6,.94) 1120px,#050506 1360px)",
        }}
      />
      {orbs.slice(4).map((o, i) => (
        <div
          key={`b${i}`}
          data-orb
          style={{
            position: "absolute",
            top: o.top,
            left: o.left,
            right: o.right,
            width: o.w,
            height: o.h,
            background: `radial-gradient(50% 50% at 50% 50%, ${o.c}, transparent 72%)`,
            filter: `blur(${o.blur}px)`,
            animation: `drift ${o.dur}s ease-in-out infinite${o.rev ? " reverse" : ""}`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/assets/topo.png)",
          backgroundSize: "1500px auto",
          backgroundPosition: "18% 0",
          backgroundRepeat: "repeat",
          filter: "brightness(1.75) contrast(1.05)",
          WebkitMaskImage: topo,
          maskImage: topo,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/assets/topo.png)",
          backgroundSize: "1500px auto",
          backgroundPosition: "18% 0",
          backgroundRepeat: "repeat",
          opacity: 0.55,
          filter: "blur(9px) saturate(150%)",
          mixBlendMode: "screen",
          WebkitMaskImage: topoEdge,
          maskImage: topoEdge,
        }}
      />
      <div data-grain style={{ position: "absolute", inset: 0, opacity: 0.055, mixBlendMode: "overlay" }} />
    </div>
  );
}
