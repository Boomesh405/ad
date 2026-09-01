import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, getUser } from "../api.js";

export default function OwnerDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    api("/admin/properties?size=200").then((data) => {
      const mine = (data.content || []).filter((p) => p.ownerId);
      setListings(mine);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading dashboard...</p>;

  const total = listings.length;
  const active = listings.filter((p) => p.listingStatus === "ACTIVE").length;
  const pending = listings.filter((p) => p.listingStatus === "PENDING_APPROVAL").length;
  const totalViews = listings.reduce((sum, p) => sum + (p.viewCount || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>My Dashboard</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>Overview of your listings</p>
        </div>
        <Link to="/create-property" className="btn">+ New Listing</Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 20 }}>
        {[
          { icon: "🏠", label: "Total Listings", value: total, color: "var(--accent)" },
          { icon: "✅", label: "Active", value: active, color: "var(--ok)" },
          { icon: "⏳", label: "Pending", value: pending, color: "var(--purple)" },
          { icon: "👁", label: "Total Views", value: totalViews, color: "var(--blue)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div className="muted small">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Listings table */}
      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>My Listings</h2>
        {listings.length === 0 ? (
          <div className="empty-state">
            <p>No listings yet. <Link to="/create-property">Create your first listing</Link></p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((p) => (
                  <tr key={p.propertyId}>
                    <td><Link to={`/properties/${p.propertyId}`}>{p.title}</Link></td>
                    <td>{p.listingType === "FOR_RENT" ? "🔑 Rent" : "🏠 Sale"}</td>
                    <td>
                      <span className={`badge ${p.listingStatus === "ACTIVE" ? "live" : p.listingStatus.toLowerCase()}`}>
                        {p.listingStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--accent)" }}>
                      {p.listingType === "FOR_RENT" ? `₹${p.monthlyRent}/mo` : `₹${Number(p.price).toLocaleString("en-IN")}`}
                    </td>
                    <td>{p.viewCount || 0}</td>
                    <td><Link to={`/properties/${p.propertyId}`} className="btn small ghost">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
