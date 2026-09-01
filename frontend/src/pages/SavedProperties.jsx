import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropertyCard from "../components/PropertyCard.jsx";

const STORAGE_KEY = "eh_saved";

function getSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function saveSaved(ids) { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); }

export function useSaved() {
  const [ids, setIds] = useState(getSaved);
  useEffect(() => { saveSaved(ids); }, [ids]);
  const toggle = (id) => setIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const isSaved = (id) => ids.includes(id);
  return { ids, toggle, isSaved, count: ids.length };
}

export default function SavedProperties() {
  const { ids, toggle, isSaved } = useSaved();
  const [properties, setProperties] = useState([]);
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    if (ids.length === 0) { setProperties([]); return; }
    Promise.all(ids.map((id) =>
      fetch(`/api/v1/properties/${id}`).then((r) => r.ok ? r.json() : null).catch(() => null)
    )).then((results) => setProperties(results.filter(Boolean)));
  }, [ids]);

  function toggleCompare(id) {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  }

  return (
    <div>
      <h1>My Saved Properties</h1>
      <p className="muted">{ids.length} {ids.length === 1 ? "property" : "properties"} saved</p>

      {ids.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">♡</div>
          <h3 className="empty-title">No saved properties yet</h3>
          <p className="empty-desc">Click the heart button on any property to save it here for later.</p>
          <Link to="/" className="btn">Browse Properties</Link>
        </div>
      ) : (
        <>
          {compareIds.length >= 2 && (
            <div style={{ marginBottom: 16 }}>
              <Link to={`/compare?ids=${compareIds.join(",")}`} className="btn map-btn">
                ⚖ Compare {compareIds.length} Properties
              </Link>
              <span className="muted small" style={{ marginLeft: 10 }}>
                (Select up to 3 to compare)
              </span>
            </div>
          )}

          <div className="prop-grid">
            {properties.map((p) => (
              <div key={p.propertyId} style={{ position: "relative" }}>
                <PropertyCard property={p} />
                <div style={{ position: "absolute", top: 56, right: 12, display: "flex", gap: 6, zIndex: 3 }}>
                  <button
                    className={`fav-btn ${isSaved(p.propertyId) ? "active" : ""}`}
                    onClick={(e) => { e.preventDefault(); toggle(p.propertyId); }}
                    title="Remove from saved"
                  >
                    {isSaved(p.propertyId) ? "♥" : "♡"}
                  </button>
                  <button
                    className={`fav-btn ${compareIds.includes(p.propertyId) ? "active" : ""}`}
                    onClick={(e) => { e.preventDefault(); toggleCompare(p.propertyId); }}
                    title="Add to compare"
                    style={{ fontSize: 14, color: compareIds.includes(p.propertyId) ? "var(--blue)" : undefined }}
                  >
                    ⚖
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
