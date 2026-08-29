import { Link } from "react-router-dom";

export default function PropertyCard({ property: p }) {
  const badge =
    p.listingStatus === "ACTIVE"
      ? "live"
      : p.listingStatus === "BOOKED"
        ? "booked"
        : p.listingStatus.toLowerCase();

  const isForRent = p.listingType === "FOR_RENT";
  const cover = p.media?.find(m => m.cover) || p.media?.[0];
  const letter = (p.title || "?")[0].toUpperCase();

  return (
    <Link to={`/properties/${p.propertyId}`} className="card prop-card">
      <div className="prop-thumb">
        {cover ? (
          <img src={cover.s3Key} alt={p.title} loading="lazy" />
        ) : (
          <div className="thumb-letter">{letter}</div>
        )}
      </div>
      <h3>{p.title}</h3>
      <span className={`badge ${badge}`}>{p.listingStatus.replace(/_/g, " ")}</span>
      {isForRent && <span className="badge rent">FOR RENT</span>}
      {!isForRent && p.listingType === "FOR_SALE" && <span className="badge sale">FOR SALE</span>}
      <p>
        {p.city}{p.state ? ", " + p.state : ""}
        {p.pincode ? " · " + p.pincode : ""}
      </p>
      <p className="price">
        {isForRent
          ? "₹" + Number(p.monthlyRent || 0).toLocaleString("en-IN") + "/mo"
          : "₹" + Number(p.price || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
      </p>
      <p>
        {p.propertyType?.replace(/_/g, " ")}
        {p.bhkConfig ? " · " + p.bhkConfig : ""}
        {" · "}
        {p.carpetAreaSqft ? p.carpetAreaSqft + " sq.ft" : "—"}
        {" · "}
        {p.possessionStatus?.replace(/_/g, " ")}
      </p>
    </Link>
  );
}
