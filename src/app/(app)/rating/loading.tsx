import { Bar, SkeletonHead, SkeletonPanels } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading rating">
      <SkeletonHead />
      <div
        data-split
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: 16,
          marginBottom: 36,
        }}
      >
        <Bar h={320} r={14} />
        <Bar h={320} r={14} />
      </div>
      <Bar w={130} h={20} r={6} mb={16} />
      <SkeletonPanels cols={3} height={148} count={9} />
    </div>
  );
}
