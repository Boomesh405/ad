import { useState, useEffect } from "react";
import { api } from "../api.js";
import PropertyCard from "../components/PropertyCard.jsx";

const INITIAL = { keyword: "", city: "", propertyType: "", minPrice: "", maxPrice: "", possession: "", sortBy: "", bhk: "" };

function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-thumb" />
          <div className="skeleton-lines">
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Search() {
  const [filters, setFilters] = useState(INITIAL);
  const [listingTab, setListingTab] = useState("ALL");
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [saleCount, setSaleCount] = useState(0);
  const [rentCount, setRentCount] = useState(0);
  const [searching, setSearching] = useState(false);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  async function search(p = 0, listingOverride) {
    const activeListing = listingOverride !== undefined ? listingOverride : listingTab;
    setSearching(true);
    const params = { page: p, size: 20 };
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.city) params.city = filters.city;
    if (filters.propertyType) params.propertyType = filters.propertyType;
    if (activeListing && activeListing !== "ALL") params.listingType = activeListing;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.possession) params.possessionStatus = filters.possession;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.bhk) params.bhk = filters.bhk;
    try {
      const data = await api("/properties/search", { params });
      setResults(data.content);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalElements || 0);
      setPage(p);
    } catch (e) {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function fetchCounts() {
    try {
      const [saleData, rentData] = await Promise.all([
        api("/properties/search", { params: { page: 0, size: 1, listingType: "FOR_SALE" } }),
        api("/properties/search", { params: { page: 0, size: 1, listingType: "FOR_RENT" } }),
      ]);
      setSaleCount(saleData.totalElements || 0);
      setRentCount(rentData.totalElements || 0);
    } catch (_) {}
  }

  useEffect(() => { search(0); fetchCounts(); }, []);

  function switchTab(tab) {
    setListingTab(tab);
    search(0, tab);
  }

  function clearFilters() {
    setFilters(INITIAL);
    setListingTab("ALL");
    search(0, "ALL");
  }

  function hasActiveFilters() {
    return Object.values(filters).some((v) => v !== "") || listingTab !== "ALL";
  }

  return (
    <div>
      <div className="hero">
        <h1>Find your next home</h1>
        <p className="hero-subtitle">Search ready-to-move and under-construction properties across India.</p>
      </div>

      {/* Sale / Rent tabs */}
      <div className="listing-tabs">
        <button className={`listing-tab ${listingTab === "ALL" ? "active" : ""}`} onClick={() => switchTab("ALL")}>
          All Properties
        </button>
        <button className={`listing-tab sale ${listingTab === "FOR_SALE" ? "active" : ""}`} onClick={() => switchTab("FOR_SALE")}>
          <span className="tab-icon">🏠</span> For Sale
          <span className="tab-count">{saleCount}</span>
        </button>
        <button className={`listing-tab rent ${listingTab === "FOR_RENT" ? "active" : ""}`} onClick={() => switchTab("FOR_RENT")}>
          <span className="tab-icon">🔑</span> For Rent
          <span className="tab-count">{rentCount}</span>
        </button>
      </div>

      <div className="search-filters card">
        <div className="filter-grid">
          <input placeholder="Keyword (title / city / landmark)" value={filters.keyword} onChange={set("keyword")} />
          <input placeholder="City" value={filters.city} onChange={set("city")} />
          <select value={filters.propertyType} onChange={set("propertyType")}>
            <option value="">All types</option>
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="INDEPENDENT_HOUSE">Independent House</option>
            <option value="PLOT">Plot</option>
            <option value="OFFICE_SPACE">Office Space</option>
            <option value="RETAIL">Retail</option>
            <option value="WAREHOUSE">Warehouse</option>
          </select>
          <select value={filters.bhk} onChange={set("bhk")}>
            <option value="">Any BHK</option>
            <option value="1 BHK">1 BHK</option>
            <option value="2 BHK">2 BHK</option>
            <option value="3 BHK">3 BHK</option>
            <option value="4 BHK">4+ BHK</option>
          </select>
          <input type="number" placeholder="Min price ₹" value={filters.minPrice} onChange={set("minPrice")} />
          <input type="number" placeholder="Max price ₹" value={filters.maxPrice} onChange={set("maxPrice")} />
          <select value={filters.possession} onChange={set("possession")}>
            <option value="">Any possession</option>
            <option value="READY_TO_MOVE">Ready to Move</option>
            <option value="UNDER_CONSTRUCTION">Under Construction</option>
          </select>
          <select value={filters.sortBy} onChange={set("sortBy")}>
            <option value="">Newest first</option>
            <option value="PRICE_ASC">Price: low to high</option>
            <option value="PRICE_DESC">Price: high to low</option>
            <option value="AREA">Largest area</option>
          </select>
        </div>
        <div className="filter-actions">
          <button className="btn" onClick={() => search(0)}>🔍 Search</button>
          {hasActiveFilters() && (
            <button className="btn ghost" onClick={clearFilters}>✕ Clear Filters</button>
          )}
          {results !== null && !searching && (
            <span className="filter-result-count">
              {totalCount} {totalCount === 1 ? "property" : "properties"} found
            </span>
          )}
        </div>
      </div>

      <div className="results">
        {searching || results === null ? (
          <SkeletonGrid />
        ) : results.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">🏠</div>
            <h3 className="empty-title">No properties found</h3>
            <p className="empty-desc">
              We couldn't find any properties matching your current filters.
              Try broadening your search or changing your criteria.
            </p>
            <button className="btn outline" onClick={clearFilters}>Clear All Filters</button>
          </div>
        ) : (
          <>
            <div className="prop-grid">
              {results.map((p) => (
                <PropertyCard key={p.propertyId} property={p} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn ghost small" disabled={page === 0} onClick={() => search(page - 1)}>
                  ← Prev
                </button>
                <span className="page-info">Page {page + 1} of {totalPages}</span>
                <button className="btn ghost small" disabled={page >= totalPages - 1} onClick={() => search(page + 1)}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
