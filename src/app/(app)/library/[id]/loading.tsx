import { Bar, SkeletonRows } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading game">
      <Bar w={120} h={13} mb={18} />
      <div
        data-split
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 220px) minmax(0, 1fr)",
          gap: 24,
          marginBottom: 36,
        }}
      >
        <Bar h={293} r={14} />
        <div>
          <Bar w="55%" h={34} r={8} mb={12} />
          <Bar w="30%" h={13} mb={22} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, maxWidth: 460 }}>
            <Bar h={72} r={10} />
            <Bar h={72} r={10} />
            <Bar h={72} r={10} />
          </div>
        </div>
      </div>
      <Bar w={140} h={20} r={6} mb={16} />
      <SkeletonRows count={6} />
    </div>
  );
}
