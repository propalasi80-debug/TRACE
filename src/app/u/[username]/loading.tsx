import { Bar, SkeletonPanels } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading profile"
      style={{ padding: "32px var(--shell-pad-x) 72px", maxWidth: 1080, margin: "0 auto" }}
    >
      <Bar w={220} h={16} mb={20} />
      <Bar h={190} r={14} mb={18} />
      <SkeletonPanels cols={2} height={260} />
    </div>
  );
}
