import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const ROLE_COLORS = {
  SUPER_ADMIN: "#f87171",
  BUILDER_OWNER: "#34d399",
  AGENT: "#60a5fa",
  BUYER_TENANT: "#f0b429",
};

export default function NavBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          Estate<span>Hub</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Browse</Link>
          {user?.role === "BUYER_TENANT" && <Link to="/my-bookings">My Bookings</Link>}
          {(user?.role === "BUILDER_OWNER" || user?.role === "AGENT") && (
            <Link to="/create-property">List Property</Link>
          )}
          {user?.role === "SUPER_ADMIN" && <Link to="/admin">Admin</Link>}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <div className="user-chip">
                <span className="role-dot" style={{ background: ROLE_COLORS[user.role] || "var(--ok)" }} />
                {user.name}
              </div>
              <button
                className="btn ghost small"
                onClick={() => { logout(); nav("/"); }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn ghost small">Login</Link>
              <Link to="/register" className="btn small">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
