import { SkeletonHead, SkeletonChips, SkeletonCovers } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading your library">
      <SkeletonHead withAction />
      <SkeletonChips count={5} />
      <SkeletonCovers count={12} />
    </div>
  );
}
