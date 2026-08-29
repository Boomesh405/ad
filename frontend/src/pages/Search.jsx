import { useState, useEffect } from "react";
import { api, money } from "../api.js";
import PropertyCard from "../components/PropertyCard.jsx";

export default function Search() {
  const [keyword, setKeyword] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [listingTab, setListingTab] = useState("ALL"); // ALL | FOR_SALE | FOR_RENT
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [possession, setPossession] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [saleCount, setSaleCount] = useState(0);
  const [rentCount, setRentCount] = useState(0);

  async function search(p = 0, listingOverride) {
    const activeListing = listingOverride !== undefined ? listingOverride : listingTab;
    const params = { page: p, size: 20 };
    if (keyword) params.keyword = keyword;
    if (city) params.city = city;
    if (propertyType) params.propertyType = propertyType;
    if (activeListing && activeListing !== "ALL") params.listingType = activeListing;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (possession) params.possessionStatus = possession;
    if (sortBy) params.sortBy = sortBy;
    try {
      const data = await api("/properties/search", { params });
      setResults(data.content);
      setTotalPages(data.totalPages);
      setPage(p);
    } catch (e) {
      setResults([]);
    }
  }

  // Fetch sale + rent counts for tab badges
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

  return (
    <div>
      <h1>Find your next home</h1>
      <p className="muted">Search ready-to-move and under-construction properties across India.</p>

      {/* Sale / Rent tabs */}
      <div className="listing-tabs">
        <button
          className={`listing-tab ${listingTab === "ALL" ? "active" : ""}`}
          onClick={() => switchTab("ALL")}
        >
          All Properties
        </button>
        <button
          className={`listing-tab sale ${listingTab === "FOR_SALE" ? "active" : ""}`}
          onClick={() => switchTab("FOR_SALE")}
        >
          <span className="tab-icon">🏠</span> For Sale
          <span className="tab-count">{saleCount}</span>
        </button>
        <button
          className={`listing-tab rent ${listingTab === "FOR_RENT" ? "active" : ""}`}
          onClick={() => switchTab("FOR_RENT")}
        >
          <span className="tab-icon">🔑</span> For Rent
          <span className="tab-count">{rentCount}</span>
        </button>
      </div>

      <div className="search-filters card">
        <div className="filter-grid">
          <input placeholder="Keyword (title / city / landmark)" value={keyword} onChange={e => setKeyword(e.target.value)} />
          <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
          <select value={propertyType} onChange={e => setPropertyType(e.target.value)}>
            <option value="">All types</option>
            <option value="APARTMENT">APARTMENT</option>
            <option value="VILLA">VILLA</option>
            <option value="INDEPENDENT_HOUSE">INDEPENDENT HOUSE</option>
            <option value="PLOT">PLOT</option>
            <option value="OFFICE_SPACE">OFFICE SPACE</option>
            <option value="RETAIL">RETAIL</option>
            <option value="WAREHOUSE">WAREHOUSE</option>
          </select>
          <input type="number" placeholder="Min price ₹" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
          <input type="number" placeholder="Max price ₹" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          <select value={possession} onChange={e => setPossession(e.target.value)}>
            <option value="">Any possession</option>
            <option value="READY_TO_MOVE">READY TO MOVE</option>
            <option value="UNDER_CONSTRUCTION">UNDER CONSTRUCTION</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="">Newest first</option>
            <option value="PRICE_ASC">Price: low to high</option>
            <option value="PRICE_DESC">Price: high to low</option>
            <option value="AREA">Largest area</option>
          </select>
        </div>
        <button className="btn" onClick={() => search(0)}>Search</button>
      </div>

      <div className="results">
        {results === null ? (
          <p className="muted">Loading…</p>
        ) : results.length === 0 ? (
          <div className="empty card">No properties match your filters. Try broadening your search.</div>
        ) : (
          <>
            <p className="muted">{results.length} properties found</p>
            <div className="prop-grid">
              {results.map(p => <PropertyCard key={p.propertyId} property={p} />)}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn ghost" disabled={page === 0} onClick={() => search(page - 1)}>← Prev</button>
                <span className="muted">Page {page + 1} of {totalPages}</span>
                <button className="btn ghost" disabled={page >= totalPages - 1} onClick={() => search(page + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
