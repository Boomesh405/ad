import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

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
              <span className="chip">
                {user.name} · {user.role.replace("_", " ")}
              </span>
              <button
                className="btn ghost"
                onClick={() => {
                  logout();
                  nav("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn ghost">
                Login
              </Link>
              <Link to="/register" className="btn">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
