import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import NavBar from "./components/NavBar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Search from "./pages/Search.jsx";
import PropertyDetail from "./pages/PropertyDetail.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import CreateProperty from "./pages/CreateProperty.jsx";
import AdminApprovals from "./pages/AdminApprovals.jsx";

function RequireRole({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app">
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Search />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route
            path="/my-bookings"
            element={
              <RequireRole roles={["BUYER_TENANT"]}>
                <MyBookings />
              </RequireRole>
            }
          />
          <Route
            path="/create-property"
            element={
              <RequireRole roles={["BUILDER_OWNER", "AGENT"]}>
                <CreateProperty />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole roles={["SUPER_ADMIN"]}>
                <AdminApprovals />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer muted">EstateHub · demo frontend for the EstateHub API</footer>
    </div>
  );
}
