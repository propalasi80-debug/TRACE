import { Bar, SkeletonHead, SkeletonPanels } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading challenges">
      <SkeletonHead />
      <Bar h={72} r={14} mb={26} />
      <Bar w={90} h={20} r={6} mb={16} />
      <SkeletonPanels cols={2} height={190} count={2} />
      <div style={{ height: 32 }} />
      <Bar w={110} h={20} r={6} mb={16} />
      <SkeletonPanels cols={2} height={190} count={4} />
    </div>
  );
}
