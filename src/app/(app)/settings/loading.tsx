import { Bar, SkeletonHead } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading settings">
      <SkeletonHead />
      <div style={{ maxWidth: 780, display: "flex", flexDirection: "column", gap: 18 }}>
        <Bar h={430} r={14} />
        <Bar h={380} r={14} />
      </div>
    </div>
  );
}
