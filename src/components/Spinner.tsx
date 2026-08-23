export function Spinner({
  size = 14,
  label,
}: {
  size?: number;
  /** Announced to screen readers. Omit inside a control that already has a label. */
  label?: string;
}) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flex: "none",
        borderRadius: "50%",
        border: `${Math.max(1.5, size / 9)}px solid currentColor`,
        borderTopColor: "transparent",
        opacity: 0.85,
        animation: "trace-spin 0.7s linear infinite",
      }}
    />
  );
}
