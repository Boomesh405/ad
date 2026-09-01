export default function FilterChips({ filters, onRemove, onClearAll }) {
  const entries = Object.entries(filters).filter(([_, v]) => v !== "" && v !== null && v !== undefined);
  if (entries.length === 0) return null;

  const labels = {
    keyword: "Keyword",
    city: "City",
    propertyType: "Type",
    bhk: "BHK",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    possession: "Possession",
    listingType: "Listing",
    sortBy: "Sort",
  };

  const formatValue = (key, val) => {
    if (key === "minPrice") return `≥ ₹${Number(val).toLocaleString("en-IN")}`;
    if (key === "maxPrice") return `≤ ₹${Number(val).toLocaleString("en-IN")}`;
    if (key === "listingType") return val === "FOR_SALE" ? "For Sale" : "For Rent";
    if (key === "possession") return val.replace(/_/g, " ");
    if (key === "propertyType") return val.replace(/_/g, " ");
    return val;
  };

  return (
    <div className="filter-chips">
      {entries.map(([key, val]) => (
        <span key={key} className="filter-chip">
          <span className="chip-label">{labels[key] || key}:</span>
          <span className="chip-value">{formatValue(key, val)}</span>
          <button className="chip-remove" onClick={() => onRemove(key)} aria-label={`Remove ${labels[key]}`}>✕</button>
        </span>
      ))}
      {entries.length > 1 && (
        <button className="chip-clear" onClick={onClearAll}>Clear All</button>
      )}
    </div>
  );
}
