import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const ROLE_NAV = {
  BUYER_TENANT: [
    { to: "/", label: "Browse" },
    { to: "/saved", label: "♡ Saved" },
    { to: "/my-bookings", label: "My Bookings" },
  ],
  BUILDER_OWNER: [
    { to: "/", label: "Browse" },
    { to: "/create-property", label: "+ List Property" },
    { to: "/owner-dashboard", label: "Dashboard" },
  ],
  AGENT: [
    { to: "/", label: "Browse" },
    { to: "/create-property", label: "+ List Property" },
    { to: "/owner-dashboard", label: "Dashboard" },
  ],
  SUPER_ADMIN: [
    { to: "/", label: "Browse" },
    { to: "/admin", label: "Admin" },
    { to: "/admin-dashboard", label: "Analytics" },
  ],
};

const ROLE_COLORS = {
  SUPER_ADMIN: "#ef4444",
  BUILDER_OWNER: "#10b981",
  AGENT: "#3b82f6",
  BUYER_TENANT: "#f59e0b",
};

export default function NavBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    function close(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const links = user ? (ROLE_NAV[user.role] || []) : [
    { to: "/", label: "Browse" },
    { to: "/calculator", label: "Calculator" },
  ];

  const profileLinks = [
    { to: "/profile", label: "👤 My Profile", show: true },
    { to: "/saved", label: "♡ Saved Properties", show: true },
    { to: "/my-bookings", label: "📋 My Bookings", show: user?.role === "BUYER_TENANT" },
    { to: "/create-property", label: "➕ My Listings", show: ["BUILDER_OWNER", "AGENT"].includes(user?.role) },
    { to: "/owner-dashboard", label: "📊 Dashboard", show: ["BUILDER_OWNER", "AGENT"].includes(user?.role) },
    { to: "/admin-dashboard", label: "🛡 Admin Dashboard", show: user?.role === "SUPER_ADMIN" },
    { to: "/calculator", label: "💰 Calculator", show: true },
  ];

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="brand">
            <div className="brand-icon">🏠</div>
            <span className="brand-text">Estate<span>Hub</span></span>
          </Link>

          <nav className="nav-links">
            {links.map((l) => (
              <Link key={l.to + l.label} to={l.to}
                className={`nav-link ${location.pathname === l.to ? "active" : ""}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="nav-right">
            <button className="nav-notif" title="Notifications">
              🔔
              <span className="notif-dot" />
            </button>

            {user ? (
              <div ref={dropRef} style={{ position: "relative" }}>
                <button className="profile-trigger" onClick={() => setDropdown(!dropdown)}>
                  <div className="profile-avatar" style={{ background: ROLE_COLORS[user.role] || "var(--gold)" }}>
                    {(user.name || "U")[0].toUpperCase()}
                  </div>
                  <span className="profile-name">{user.name}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>▾</span>
                </button>

                {dropdown && (
                  <div className="profile-dropdown">
                    <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {user.role.replace(/_/g, " ")}
                      </div>
                    </div>
                    {profileLinks.filter((l) => l.show).map((l) => (
                      <Link key={l.to} to={l.to} onClick={() => setDropdown(false)}>
                        {l.label}
                      </Link>
                    ))}
                    <div className="profile-divider" />
                    <button onClick={() => { logout(); nav("/"); setDropdown(false); }}>
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      {user && (
        <nav className="mobile-nav">
          <div className="mobile-nav-items">
            {links.slice(0, 4).map((l) => (
              <Link key={l.to + l.label} to={l.to}
                className={`mobile-nav-item ${location.pathname === l.to ? "active" : ""}`}>
                <span className="mobile-nav-icon">{l.label.split(" ")[0]}</span>
                <span>{l.label.replace(/[^\w\s]/g, "").trim().split(" ").pop()}</span>
              </Link>
            ))}
            <Link to="/profile" className={`mobile-nav-item ${location.pathname === "/profile" ? "active" : ""}`}>
              <span className="mobile-nav-icon">👤</span>
              <span>Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
