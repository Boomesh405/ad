import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api("/admin/properties?size=200").catch(() => []),
      api("/analytics/inventory").catch(() => ({})),
    ]).then(([props, inv]) => {
      const all = Array.isArray(props) ? props : (props.content || []);
      const byStatus = {};
      const byType = {};
      const byCity = {};
      all.forEach((p) => {
        byStatus[p.listingStatus] = (byStatus[p.listingStatus] || 0) + 1;
        byType[p.listingType] = (byType[p.listingType] || 0) + 1;
        if (p.city) byCity[p.city] = (byCity[p.city] || 0) + 1;
      });
      setStats({
        total: all.length,
        byStatus,
        byType,
        byCity,
        inventory: inv,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="muted">Loading dashboard...</p>;

  const statCards = [
    { icon: "🏠", label: "Total Properties", value: stats.total, color: "var(--accent)" },
    { icon: "✅", label: "Active", value: stats.byStatus.ACTIVE || 0, color: "var(--ok)" },
    { icon: "⏳", label: "Pending", value: stats.byStatus.PENDING_APPROVAL || 0, color: "var(--purple)" },
    { icon: "🔴", label: "Rejected", value: stats.byStatus.REJECTED || 0, color: "var(--err)" },
    { icon: "🔑", label: "For Rent", value: stats.byType.FOR_RENT || 0, color: "var(--blue)" },
    { icon: "🏠", label: "For Sale", value: stats.byType.FOR_SALE || 0, color: "var(--ok)" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>Platform overview and analytics</p>
        </div>
        <Link to="/admin" className="btn ghost">📋 Listing Management</Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 20 }}>
        {statCards.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div className="muted small">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Property by city */}
      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Properties by City</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
          {Object.entries(stats.byCity).sort((a, b) => b[1] - a[1]).map(([city, count]) => (
            <div key={city} style={{
              padding: "10px 14px", background: "var(--panel2)", borderRadius: 10,
              border: "1px solid var(--border)", display: "flex", justifyContent: "space-between"
            }}>
              <span>{city}</span>
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory stats */}
      {stats.inventory && Object.keys(stats.inventory).length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>Inventory Summary</h2>
          <pre style={{ fontSize: 13, color: "var(--muted)", whiteSpace: "pre-wrap" }}>
            {JSON.stringify(stats.inventory, null, 2)}
          </pre>
        </div>
      )}

      {/* Status breakdown */}
      <div className="card" style={{ marginTop: 20 }}>
        <h2 style={{ marginTop: 0 }}>Status Breakdown</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {Object.entries(stats.byStatus).map(([status, count]) => {
            const colors = {
              ACTIVE: "var(--ok)", PENDING_APPROVAL: "var(--muted)", REJECTED: "var(--err)",
              BOOKED: "var(--accent)", SOLD: "var(--purple)", RENTED: "var(--blue)",
            };
            return (
              <div key={status} style={{
                padding: "12px 16px", background: "var(--panel2)", borderRadius: 10,
                borderLeft: `4px solid ${colors[status] || "var(--border)"}`
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: colors[status] || "var(--text)" }}>{count}</div>
                <div className="muted small">{status.replace(/_/g, " ")}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
