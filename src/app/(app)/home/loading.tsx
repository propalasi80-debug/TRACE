import { Bar, SkeletonCovers, SkeletonPanels } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading your dashboard">
      <Bar w={100} h={11} mb={12} />
      <Bar w={240} h={32} r={8} mb={28} />
      <div
        data-split
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 340px) minmax(0, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <Bar h={330} r={14} />
        <Bar h={330} r={14} />
      </div>
      <Bar w={160} h={20} r={6} mb={16} />
      <SkeletonCovers count={4} min={168} />
      <div style={{ height: 32 }} />
      <SkeletonPanels cols={3} height={170} />
    </div>
  );
}
