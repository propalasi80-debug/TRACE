import { Bar, SkeletonHead, SkeletonPanels, SkeletonRows } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading rewards">
      <SkeletonHead />
      <SkeletonPanels cols={3} height={104} />
      <div style={{ height: 36 }} />
      <Bar w={110} h={20} r={6} mb={16} />
      <SkeletonPanels cols={4} height={116} count={8} />
      <div style={{ height: 36 }} />
      <SkeletonRows count={4} />
    </div>
  );
}
