import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api, money } from "../api.js";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop";

export default function Compare() {
  const [searchParams] = useSearchParams();
  const ids = (searchParams.get("ids") || "").split(",").filter(Boolean);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) =>
      api(`/properties/${id}`, { auth: false }).catch(() => null)
    )).then((results) => { setProperties(results.filter(Boolean)); setLoading(false); });
  }, []);

  if (loading) return <p className="muted">Loading properties...</p>;
  if (properties.length < 2) return (
    <div className="empty-state card">
      <div className="empty-icon">⚖</div>
      <h3 className="empty-title">Select properties to compare</h3>
      <p className="empty-desc">Go to Saved Properties and select at least 2 properties to compare them side by side.</p>
      <Link to="/saved" className="btn">Go to Saved Properties</Link>
    </div>
  );

  const features = [
    { label: "Price", key: "price", format: (v, p) => p.listingType === "FOR_RENT" ? money(p.monthlyRent) + "/mo" : money(v) },
    { label: "Property Type", key: "propertyType", format: (v) => v?.replace(/_/g, " ") || "—" },
    { label: "BHK", key: "bhkConfig", format: (v) => v || "—" },
    { label: "Carpet Area", key: "carpetAreaSqft", format: (v) => v ? v + " sq.ft" : "—" },
    { label: "Built-up Area", key: "builtUpAreaSqft", format: (v) => v ? v + " sq.ft" : "—" },
    { label: "Floor", key: "floorNumber", format: (v, p) => v != null ? `${v} / ${p.totalFloors || "?"}` : "—" },
    { label: "Possession", key: "possessionStatus", format: (v) => v?.replace(/_/g, " ") || "—" },
    { label: "Maintenance", key: "maintenanceCharges", format: (v) => v ? money(v) + "/mo" : "—" },
    { label: "Negotiable", key: "negotiable", format: (v) => v ? "Yes" : "No" },
    { label: "RERA", key: "reraNumber", format: (v) => v || "Not registered" },
    { label: "Views", key: "viewCount", format: (v) => v ?? 0 },
    { label: "City", key: "city", format: (v) => v || "—" },
    { label: "Listing Type", key: "listingType", format: (v) => v === "FOR_RENT" ? "🔑 For Rent" : "🏠 For Sale" },
    { label: "Status", key: "listingStatus", format: (v) => v?.replace(/_/g, " ") || "—" },
  ];

  return (
    <div>
      <Link to="/saved" className="back">← Back to Saved</Link>
      <h1>Compare Properties</h1>
      <p className="muted">Comparing {properties.length} properties side by side</p>

      <div style={{ overflowX: "auto" }}>
        <table className="table" style={{ minWidth: 600 }}>
          <thead>
            <tr>
              <th style={{ width: 160 }}>Feature</th>
              {properties.map((p) => (
                <th key={p.propertyId} style={{ minWidth: 200, textAlign: "center" }}>
                  <img src={FALLBACK_IMG} alt="" style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                  <Link to={`/properties/${p.propertyId}`} style={{ fontWeight: 700, fontSize: 15 }}>
                    {p.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.label}>
                <td style={{ fontWeight: 600 }}>{f.label}</td>
                {properties.map((p) => (
                  <td key={p.propertyId} style={{ textAlign: "center" }}>
                    {f.label === "Price" ? (
                      <span style={{ color: "var(--accent)", fontWeight: 800, fontSize: 16 }}>
                        {f.format(p[f.key], p)}
                      </span>
                    ) : f.format(p[f.key], p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td style={{ fontWeight: 600 }}>Amenities</td>
              {properties.map((p) => (
                <td key={p.propertyId} style={{ textAlign: "center", fontSize: 13 }}>
                  {p.amenities?.length > 0 ? p.amenities.join(", ") : "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td></td>
              {properties.map((p) => (
                <td key={p.propertyId} style={{ textAlign: "center" }}>
                  <Link to={`/properties/${p.propertyId}`} className="btn small">View Details</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
