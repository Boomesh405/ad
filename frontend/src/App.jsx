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
import SavedProperties from "./pages/SavedProperties.jsx";
import Compare from "./pages/Compare.jsx";
import Profile from "./pages/Profile.jsx";
import Calculator from "./pages/Calculator.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";

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
          <Route path="/saved" element={<SavedProperties />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/profile" element={
            <RequireRole roles={["BUYER_TENANT", "BUILDER_OWNER", "AGENT", "SUPER_ADMIN"]}>
              <Profile />
            </RequireRole>
          } />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/my-bookings" element={
            <RequireRole roles={["BUYER_TENANT"]}>
              <MyBookings />
            </RequireRole>
          } />
          <Route path="/create-property" element={
            <RequireRole roles={["BUILDER_OWNER", "AGENT"]}>
              <CreateProperty />
            </RequireRole>
          } />
          <Route path="/owner-dashboard" element={
            <RequireRole roles={["BUILDER_OWNER", "AGENT"]}>
              <OwnerDashboard />
            </RequireRole>
          } />
          <Route path="/admin" element={
            <RequireRole roles={["SUPER_ADMIN"]}>
              <AdminApprovals />
            </RequireRole>
          } />
          <Route path="/admin-dashboard" element={
            <RequireRole roles={["SUPER_ADMIN"]}>
              <AdminDashboard />
            </RequireRole>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer muted">EstateHub · demo frontend for the EstateHub API</footer>
    </div>
  );
}
