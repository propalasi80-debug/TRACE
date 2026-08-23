export default function AppLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="skeleton" style={{ height: 14, width: 110, marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 34, width: 260, marginBottom: 30 }} />
      <div
        data-split
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 340px) minmax(0, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div className="skeleton" style={{ height: 300 }} />
        <div className="skeleton" style={{ height: 300 }} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(172px, 1fr))",
          gap: 14,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 250 }} />
        ))}
      </div>
    </div>
  );
}
