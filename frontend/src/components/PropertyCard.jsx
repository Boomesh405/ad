import { Link } from "react-router-dom";
import { money } from "../api.js";

export default function PropertyCard({ property: p }) {
  const badge =
    p.listingStatus === "ACTIVE"
      ? "live"
      : p.listingStatus === "BOOKED"
        ? "booked"
        : p.listingStatus.toLowerCase();

  return (
    <Link to={`/properties/${p.propertyId}`} className="card prop-card">
      <div className="prop-thumb">{p.propertyType ? p.propertyType.charAt(0) : "P"}</div>
      <div className="prop-body">
        <div className="prop-head">
          <h3>{p.title}</h3>
          <span className={`badge ${badge}`}>{p.listingStatus.replace("_", " ")}</span>
        </div>
        <p className="muted">
          {p.city}
          {p.state ? `, ${p.state}` : ""}
          {p.pincode ? ` · ${p.pincode}` : ""}
        </p>
        <p className="price">{money(p.price)}</p>
        <p className="muted small">
          {p.propertyType} · {p.bhkConfig || "—"} · {p.carpetAreaSqft} sq.ft ·{" "}
          {p.possessionStatus?.replace("_", " ")}
        </p>
      </div>
    </Link>
  );
}
