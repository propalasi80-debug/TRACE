import { Bar, SkeletonPanels } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading profile">
      <div className="flex justify-between" style={{ gap: 12, marginBottom: 20 }}>
        <Bar w={220} h={16} />
        <Bar w={200} h={36} r={10} />
      </div>
      <Bar h={190} r={14} mb={18} />
      <SkeletonPanels cols={2} height={260} />
    </div>
  );
}
