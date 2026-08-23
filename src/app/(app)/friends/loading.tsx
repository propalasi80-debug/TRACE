import { Bar, SkeletonHead, SkeletonRows } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading friends">
      <SkeletonHead withAction />
      <div
        data-split
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 28 }}
      >
        <div>
          <Bar w={100} h={11} mb={14} />
          <SkeletonRows count={5} />
        </div>
        <div>
          <Bar w={80} h={11} mb={14} />
          <Bar h={120} r={14} />
        </div>
      </div>
    </div>
  );
}
