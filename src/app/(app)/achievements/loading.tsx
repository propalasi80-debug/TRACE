import { Bar, SkeletonHead, SkeletonChips, SkeletonRows } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading achievements">
      <SkeletonHead />
      <Bar h={104} r={14} mb={24} />
      <SkeletonChips count={6} />
      <SkeletonRows count={10} />
    </div>
  );
}
