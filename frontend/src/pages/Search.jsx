import { useState, useEffect } from "react";
import { api } from "../api.js";
import PropertyCard from "../components/PropertyCard.jsx";
import FilterChips from "../components/ui/FilterChips.jsx";
import { SkeletonGrid } from "../components/ui/Skeleton.jsx";
import Drawer from "../components/ui/Drawer.jsx";

const CITIES = [
  { name: "Bangalore", img: "https://images.unsplash.com/photo-1624467599724-4b4f1cfba873?w=400&h=250&fit=crop" },
  { name: "Chennai", img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=250&fit=crop" },
  { name: "Mumbai", img: "https://images.unsplash.com/photo-1529158062015-cad638e1f98b?w=400&h=250&fit=crop" },
  { name: "Hyderabad", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=250&fit=crop" },
  { name: "Pune", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=250&fit=crop" },
  { name: "Coimbatore", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=250&fit=crop" },
  { name: "Kolkata", img: "https://images.unsplash.com/photo-1600566753376-12c8ab7c56c8?w=400&h=250&fit=crop" },
  { name: "Delhi NCR", img: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&h=250&fit=crop" },
];

const PROPERTY_TYPES = [
  { icon: "🏢", label: "Apartments", value: "APARTMENT" },
  { icon: "🏡", label: "Villas", value: "VILLA" },
  { icon: "🏠", label: "Houses", value: "INDEPENDENT_HOUSE" },
  { icon: "📐", label: "Plots", value: "PLOT" },
  { icon: "🏬", label: "Commercial", value: "RETAIL" },
  { icon: "💼", label: "Office", value: "OFFICE_SPACE" },
  { icon: "🏭", label: "Warehouse", value: "WAREHOUSE" },
];

const INITIAL = { keyword: "", city: "", propertyType: "", minPrice: "", maxPrice: "", possession: "", sortBy: "", bhk: "", listingType: "" };

export default function Search() {
  const [filters, setFilters] = useState(INITIAL);
  const [listingTab, setListingTab] = useState("ALL");
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [saleCount, setSaleCount] = useState(0);
  const [rentCount, setRentCount] = useState(0);
  const [filterDrawer, setFilterDrawer] = useState(false);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  async function search(p = 0, listingOverride) {
    const activeListing = listingOverride !== undefined ? listingOverride : listingTab;
    const params = { page: p, size: 20 };
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== "") {
        if (k === "listingType" && (activeListing === "ALL" || !listingOverride)) return;
        params[k] = v;
      }
    });
    if (activeListing && activeListing !== "ALL") params.listingType = activeListing;
    try {
      const data = await api("/properties/search", { params });
      setResults(data.content);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalElements || 0);
      setPage(p);
    } catch (e) {
      setResults([]);
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

  function switchTab(tab) { setListingTab(tab); search(0, tab); }

  function clearFilters() {
    setFilters(INITIAL);
    setListingTab("ALL");
    search(0, "ALL");
  }

  function removeFilter(key) {
    const next = { ...filters, [key]: "" };
    setFilters(next);
    // Re-search without this filter
    const params = { page: 0, size: 20 };
    Object.entries(next).forEach(([k, v]) => { if (v) params[k] = v; });
    if (listingTab !== "ALL") params.listingType = listingTab;
    api("/properties/search", { params }).then((data) => {
      setResults(data.content); setTotalPages(data.totalPages); setTotalCount(data.totalElements || 0); setPage(0);
    }).catch(() => setResults([]));
  }

  function applyCity(city) {
    setFilters((f) => ({ ...f, city }));
    const params = { page: 0, size: 20, city };
    if (listingTab !== "ALL") params.listingType = listingTab;
    api("/properties/search", { params }).then((data) => {
      setResults(data.content); setTotalPages(data.totalPages); setTotalCount(data.totalElements || 0); setPage(0);
    }).catch(() => setResults([]));
  }

  function applyType(type) {
    setFilters((f) => ({ ...f, propertyType: type }));
    const params = { page: 0, size: 20, propertyType: type };
    if (listingTab !== "ALL") params.listingType = listingTab;
    api("/properties/search", { params }).then((data) => {
      setResults(data.content); setTotalPages(data.totalPages); setTotalCount(data.totalElements || 0); setPage(0);
    }).catch(() => setResults([]));
  }

  const activeFilterCount = Object.values(filters).filter((v) => v).length + (listingTab !== "ALL" ? 1 : 0);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <h1><span className="gradient-text">Find a place you'll love.</span></h1>
        <p className="hero-sub">Buy, rent and discover properties across India.</p>

        {/* Search bar */}
        <div className="search-bar">
          <input className="input" placeholder="Search by city, locality, landmark, or property name..."
            value={filters.keyword} onChange={set("keyword")}
            onKeyDown={(e) => e.key === "Enter" && search(0)} />
          <input className="input" placeholder="City" style={{ maxWidth: 180 }}
            value={filters.city} onChange={set("city")}
            onKeyDown={(e) => e.key === "Enter" && search(0)} />
          <button className="btn btn-primary" onClick={() => search(0)}>🔍 Search</button>
        </div>

        {/* Quick modes */}
        <div className="search-modes">
          <button className={`tab ${listingTab === "ALL" ? "active" : ""}`} onClick={() => switchTab("ALL")}>All</button>
          <button className={`tab ${listingTab === "FOR_SALE" ? "active" : ""}`} onClick={() => switchTab("FOR_SALE")}>🏠 Buy ({saleCount})</button>
          <button className={`tab ${listingTab === "FOR_RENT" ? "active" : ""}`} onClick={() => switchTab("FOR_RENT")}>🔑 Rent ({rentCount})</button>
        </div>

        {/* Popular searches */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <span className="muted small" style={{ marginRight: 4 }}>Popular:</span>
          {["Bangalore", "Chennai", "Mumbai", "Hyderabad", "Pune", "Coimbatore"].map((c) => (
            <button key={c} className="btn btn-ghost btn-sm" onClick={() => applyCity(c)} style={{ padding: "4px 12px", fontSize: 12 }}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Explore by City */}
      <section style={{ marginBottom: 48 }}>
        <h2>Explore Popular Cities</h2>
        <div className="city-grid">
          {CITIES.map((c) => (
            <div key={c.name} className="city-card" onClick={() => applyCity(c.name)}>
              <img src={c.img} alt={c.name} loading="lazy" />
              <div className="city-overlay">
                <div className="city-name">{c.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Property Types */}
      <section style={{ marginBottom: 48 }}>
        <h2>Browse by Property Type</h2>
        <div className="type-grid">
          {PROPERTY_TYPES.map((t) => (
            <div key={t.value} className="type-card" onClick={() => applyType(t.value)}>
              <div className="type-icon">{t.icon}</div>
              <div className="type-label">{t.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <h2 style={{ margin: 0, flex: 1 }}>Properties ({totalCount})</h2>
        <button className="btn btn-secondary btn-sm" onClick={() => setFilterDrawer(true)}>
          ⚙ Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {/* Active filter chips */}
      <FilterChips filters={filters} onRemove={removeFilter} onClearAll={clearFilters} />

      {/* Results */}
      {results === null ? (
        <SkeletonGrid count={6} />
      ) : results.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">🏠</div>
          <h3 className="empty-title">No properties found</h3>
          <p className="empty-desc">We couldn't find properties matching your current filters. Try broadening your search.</p>
          <button className="btn btn-primary" onClick={clearFilters}>Clear All Filters</button>
        </div>
      ) : (
        <>
          <div className="prop-grid">
            {results.map((p) => <PropertyCard key={p.propertyId} property={p} />)}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => search(page - 1)}>← Prev</button>
              <span className="muted small">Page {page + 1} of {totalPages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => search(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Advanced Filter Drawer */}
      <Drawer open={filterDrawer} onClose={() => setFilterDrawer(false)} title="Advanced Filters">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label>Property Type</label>
            <select className="select" value={filters.propertyType} onChange={set("propertyType")}>
              <option value="">All types</option>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>BHK</label>
            <select className="select" value={filters.bhk} onChange={set("bhk")}>
              <option value="">Any BHK</option>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4+ BHK</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Min Price (₹)</label>
              <input className="input" type="number" value={filters.minPrice} onChange={set("minPrice")} placeholder="0" />
            </div>
            <div className="form-group">
              <label>Max Price (₹)</label>
              <input className="input" type="number" value={filters.maxPrice} onChange={set("maxPrice")} placeholder="No limit" />
            </div>
          </div>
          <div className="form-group">
            <label>Possession</label>
            <select className="select" value={filters.possession} onChange={set("possession")}>
              <option value="">Any</option>
              <option value="READY_TO_MOVE">Ready to Move</option>
              <option value="UNDER_CONSTRUCTION">Under Construction</option>
            </select>
          </div>
          <div className="form-group">
            <label>Sort By</label>
            <select className="select" value={filters.sortBy} onChange={set("sortBy")}>
              <option value="">Newest first</option>
              <option value="PRICE_ASC">Price: low to high</option>
              <option value="PRICE_DESC">Price: high to low</option>
              <option value="AREA">Largest area</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary btn-block" onClick={() => { search(0); setFilterDrawer(false); }}>Apply Filters</button>
            <button className="btn btn-secondary" onClick={() => { clearFilters(); setFilterDrawer(false); }}>Clear</button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
