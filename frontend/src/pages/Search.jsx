import { useEffect, useState } from "react";
import { api } from "../api.js";
import PropertyCard from "../components/PropertyCard.jsx";

const PROPERTY_TYPES = [
  "APARTMENT",
  "VILLA",
  "INDEPENDENT_HOUSE",
  "PLOT",
  "OFFICE_SPACE",
  "RETAIL",
  "WAREHOUSE",
];
const POSSESSION = ["READY_TO_MOVE", "UNDER_CONSTRUCTION"];
const SORTS = [
  ["", "Newest first"],
  ["PRICE_ASC", "Price: low to high"],
  ["PRICE_DESC", "Price: high to low"],
  ["AREA", "Largest area"],
];

export default function Search() {
  const [filters, setFilters] = useState({
    keyword: "",
    city: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    possessionStatus: "",
    sortBy: "",
  });
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    api("/properties/search", {
      auth: false,
      params: {
        keyword: filters.keyword || undefined,
        city: filters.city || undefined,
        propertyType: filters.propertyType || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        possessionStatus: filters.possessionStatus || undefined,
        sortBy: filters.sortBy || undefined,
        page,
        size: 12,
      },
    })
      .then((d) => alive && setResult(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [filters, page]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));
  const content = result?.content || [];

  return (
    <div>
      <div className="hero">
        <h1>Find your next home</h1>
        <p className="muted">
          Search ready-to-move and under-construction properties across India.
        </p>
      </div>

      <form
        className="card filters"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(0);
        }}
      >
        <input placeholder="Keyword (title / city / landmark)" value={filters.keyword} onChange={set("keyword")} />
        <input placeholder="City" value={filters.city} onChange={set("city")} />
        <select value={filters.propertyType} onChange={set("propertyType")}>
          <option value="">All types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
        <input placeholder="Min price ₹" type="number" min="0" value={filters.minPrice} onChange={set("minPrice")} />
        <input placeholder="Max price ₹" type="number" min="0" value={filters.maxPrice} onChange={set("maxPrice")} />
        <select value={filters.possessionStatus} onChange={set("possessionStatus")}>
          <option value="">Any possession</option>
          {POSSESSION.map((p) => (
            <option key={p} value={p}>
              {p.replace("_", " ")}
            </option>
          ))}
        </select>
        <select value={filters.sortBy} onChange={set("sortBy")}>
          {SORTS.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
        <button className="btn">Search</button>
      </form>

      {error && <div className="alert error">{error}</div>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && !error && content.length === 0 && (
        <div className="empty card">No properties match your search.</div>
      )}
      {!loading && content.length > 0 && (
        <div className="grid">
          {content.map((p) => (
            <PropertyCard key={p.propertyId} property={p} />
          ))}
        </div>
      )}
      {result && result.totalPages > 1 && (
        <div className="pagination">
          <button className="btn ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
            ‹ Prev
          </button>
          <span>
            Page {page + 1} of {result.totalPages}
          </span>
          <button
            className="btn ghost"
            disabled={page >= result.totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
