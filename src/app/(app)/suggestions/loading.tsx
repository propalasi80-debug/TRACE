import { SkeletonHead, SkeletonChips, SkeletonPanels } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading suggestions">
      <SkeletonHead />
      <SkeletonChips count={6} />
      <SkeletonPanels cols={2} height={170} count={6} />
    </div>
  );
}
