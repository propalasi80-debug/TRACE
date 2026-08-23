export const ICON_PATHS = {
  home: "M3 10.6 12 3.2l9 7.4V21H3z",
  suggestions: "M12 3.2l1.9 5.6 5.6 1.9-5.6 1.9L12 18.2l-1.9-5.6L4.5 10.7l5.6-1.9z",
  library: "M4 20V9M9 20V4M14 20v-7M19 20V7",
  rating: "M3.6 17.5a8.8 8.8 0 1 1 16.8 0M12 17l4.2-5.4",
  challenges: "M4 4.2l6.6 6.6M20 4.2l-6.6 6.6M13.6 13.4l6.4 6.4M10.4 13.4 4 19.8",
  rewards:
    "M3 9h18v3.2H3zM4.6 12.2V21h14.8v-8.8M12 9v12M8.2 9a2.6 2.6 0 1 1 0-5.2c2.1 0 3.8 5.2 3.8 5.2s1.7-5.2 3.8-5.2a2.6 2.6 0 1 1 0 5.2",
  friends:
    "M16.4 20.4v-1.2a4 4 0 0 0-4-4H6.2a4 4 0 0 0-4 4v1.2M13.2 7.4a4 4 0 1 1-8 0 4 4 0 0 1 8 0M21.8 20.4v-1.2a4 4 0 0 0-3-3.9M16.4 4a4 4 0 0 1 0 7",
  profile: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.6 8.4l1.6-1-2-3.4-1.8.8a7.6 7.6 0 0 0-2.2-1.3L14.8 1.6h-4l-.4 1.9a7.6 7.6 0 0 0-2.2 1.3l-1.8-.8-2 3.4 1.6 1a7.7 7.7 0 0 0 0 2.6l-1.6 1 2 3.4 1.8-.8a7.6 7.6 0 0 0 2.2 1.3l.4 1.9h4l.4-1.9a7.6 7.6 0 0 0 2.2-1.3l1.8.8 2-3.4-1.6-1a7.7 7.7 0 0 0 0-2.6z",
  logout: "M9.4 21H5.6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.8M16 16.6l4.6-4.6L16 7.4M20.6 12H9.4",
  search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14M16.5 16.5l4 4",
  clock: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18M12 7v5l3 2",
  trophy: "M8 21h8M12 17v4M6 4h12v4a6 6 0 0 1-12 0z",
  refresh: "M20.5 12a8.5 8.5 0 1 1-2.5-6M20.5 4.5V10h-5.5",
  mail: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2M3 7l9 6 9-6",
  lock: "M6 10h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2M8 10V7a4 4 0 0 1 8 0v3",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  link: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7",
  check: "M20 6 9 17l-5-5",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  plus: "M12 5v14M5 12h14",
  chevron: "m9 6 6 6-6 6",
  external: "M14 4h6v6M20 4l-8.5 8.5M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5",
  sort: "M7 4v16M7 4 4 7.5M7 4l3 3.5M17 20V4M17 20l3-3.5M17 20l-3-3.5",
  arrowRight: "M4 12h15M13 6l6 6-6 6",
  sparkle: "M12 3.4l1.7 5 5 1.7-5 1.7-1.7 5-1.7-5-5-1.7 5-1.7z",
  target: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18M12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9M12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2",
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({
  name,
  size = 17,
  className,
  strokeWidth = 1.5,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
