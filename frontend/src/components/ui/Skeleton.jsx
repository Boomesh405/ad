export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-thumb" />
      <div className="skeleton-lines">
        <div className="skeleton-line medium" />
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div>
      <div className="skeleton-thumb" style={{ height: 400, borderRadius: 14, marginBottom: 20 }} />
      <div className="skeleton-line" style={{ width: "50%", height: 28 }} />
      <div className="skeleton-line short" style={{ marginTop: 12 }} />
      <div className="skeleton-line" style={{ marginTop: 20, height: 120 }} />
    </div>
  );
}

export function SkeletonText({ lines = 3, width }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line" style={{ width: width || (i === lines - 1 ? "60%" : "100%") }} />
      ))}
    </div>
  );
}
