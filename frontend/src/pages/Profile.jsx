import { Link } from "react-router-dom";
import { getUser } from "../api.js";

const ROLE_LABELS = {
  SUPER_ADMIN: "🛡 Super Admin",
  BUILDER_OWNER: "🏗 Builder / Owner",
  AGENT: "👔 Property Agent",
  BUYER_TENANT: "🏠 Buyer / Tenant",
};

const ROLE_COLORS = {
  SUPER_ADMIN: "#f87171",
  BUILDER_OWNER: "#34d399",
  AGENT: "#60a5fa",
  BUYER_TENANT: "#f0b429",
};

export default function Profile() {
  const user = getUser();
  if (!user) return null;

  const roleActions = {
    BUYER_TENANT: [
      { icon: "🏠", label: "My Bookings", to: "/my-bookings", desc: "View your property bookings" },
      { icon: "♡", label: "Saved Properties", to: "/saved", desc: "Properties you've saved" },
      { icon: "⚖", label: "Compare", to: "/saved", desc: "Compare saved properties" },
      { icon: "📋", label: "Calculator", to: "/calculator", desc: "EMI & affordability calculators" },
    ],
    BUILDER_OWNER: [
      { icon: "➕", label: "List Property", to: "/create-property", desc: "Create a new listing" },
      { icon: "♡", label: "Saved Properties", to: "/saved", desc: "Properties you've saved" },
      { icon: "📊", label: "My Dashboard", to: "/owner-dashboard", desc: "View your listing analytics" },
    ],
    AGENT: [
      { icon: "➕", label: "List Property", to: "/create-property", desc: "Create a new listing" },
      { icon: "♡", label: "Saved Properties", to: "/saved", desc: "Properties you've saved" },
    ],
    SUPER_ADMIN: [
      { icon: "🛡", label: "Admin Panel", to: "/admin", desc: "Approve/reject listings" },
      { icon: "📊", label: "Analytics", to: "/admin-dashboard", desc: "Platform analytics" },
      { icon: "📋", label: "Calculator", to: "/calculator", desc: "EMI & affordability calculators" },
    ],
  };

  return (
    <div>
      <h1>My Profile</h1>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: ROLE_COLORS[user.role] || "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, fontWeight: 900, color: "#1a1000",
          boxShadow: `0 0 20px ${ROLE_COLORS[user.role] || "var(--accent)"}40`
        }}>
          {(user.name || "U")[0].toUpperCase()}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 24 }}>{user.name}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span style={{
              padding: "3px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: `${ROLE_COLORS[user.role] || "var(--accent)"}20`,
              color: ROLE_COLORS[user.role] || "var(--accent)",
              border: `1px solid ${ROLE_COLORS[user.role] || "var(--accent)"}40`
            }}>
              {ROLE_LABELS[user.role] || user.role}
            </span>
          </div>
          <p className="muted small" style={{ margin: "6px 0 0" }}>
            {user.email || "No email provided"} · {user.phone || "No phone"}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <h2>Quick Actions</h2>
      <div className="grid" style={{ marginTop: 12 }}>
        {(roleActions[user.role] || []).map((action) => (
          <Link key={action.label} to={action.to} className="card" style={{ textDecoration: "none", color: "var(--text)", display: "flex", alignItems: "center", gap: 14, transition: "all 0.2s" }}>
            <div style={{ fontSize: 28 }}>{action.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{action.label}</div>
              <div className="muted small">{action.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
