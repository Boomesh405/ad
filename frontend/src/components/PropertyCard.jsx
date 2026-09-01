import { useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop";

function openMap(address, city, state, pincode) {
  const full = [address, city, state, pincode].filter(Boolean).join(", ");
  const encoded = encodeURIComponent(full);
  // Detect iOS → Apple Maps, else Google Maps
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = isIOS
    ? `https://maps.apple.com/?q=${encoded}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function PropertyCard({ property: p }) {
  const [imgError, setImgError] = useState(false);
  const [fav, setFav] = useState(false);

  const badge =
    p.listingStatus === "ACTIVE"
      ? "live"
      : p.listingStatus === "BOOKED"
        ? "booked"
        : p.listingStatus.toLowerCase();

  const isForRent = p.listingType === "FOR_RENT";
  const cover = p.media?.find((m) => m.coverPhoto || m.cover) || p.media?.[0];
  const imgSrc = cover?.s3Key && !imgError ? cover.s3Key : FALLBACK_IMG;

  return (
    <Link to={`/properties/${p.propertyId}`} className="card prop-card">
      {/* Image section */}
      <div className="prop-thumb">
        <img
          src={imgSrc}
          alt={p.title || "Property"}
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <span className={`card-badge ${isForRent ? "rent" : "sale"}`}>
          {isForRent ? "🔑 For Rent" : "🏠 For Sale"}
        </span>
        <button
          className={`fav-btn ${fav ? "active" : ""}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFav(!fav); }}
          aria-label={fav ? "Remove from saved" : "Save property"}
        >
          {fav ? "♥" : "♡"}
        </button>
        {p.listingStatus !== "ACTIVE" && (
          <span className={`card-badge status ${badge}`}>
            {p.listingStatus.replace(/_/g, " ")}
          </span>
        )}
      </div>

      {/* Info section */}
      <div className="card-info">
        <div className="card-top-row">
          <h3 className="card-title">{p.title}</h3>
          <span className="price">
            {isForRent
              ? "₹" + Number(p.monthlyRent || 0).toLocaleString("en-IN") + "/mo"
              : "₹" + Number(p.price || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>

        <p className="card-location">
          <span className="loc-icon">📍</span>
          {p.city}{p.state ? ", " + p.state : ""}
          {p.pincode ? " · " + p.pincode : ""}
        </p>

        <div className="card-specs">
          {p.bhkConfig && (
            <span className="spec-item"><span className="spec-icon">🛏</span> {p.bhkConfig}</span>
          )}
          {p.carpetAreaSqft && (
            <span className="spec-item"><span className="spec-icon">📐</span> {p.carpetAreaSqft} sq.ft</span>
          )}
          <span className="spec-item">
            <span className="spec-icon">🏢</span> {p.propertyType?.replace(/_/g, " ")}
          </span>
        </div>

        <div className="card-footer">
          <span className={`possession-badge ${p.possessionStatus === "READY_TO_MOVE" ? "ready" : "uc"}`}>
            {p.possessionStatus === "READY_TO_MOVE" ? "✓ Ready to Move" : "🔨 Under Construction"}
          </span>
          <button
            className="card-map-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openMap(p.address, p.city, p.state, p.pincode);
            }}
            title="Open in Maps"
          >
            🗺 View on Map
          </button>
          {p.negotiable && <span className="nego-badge">Negotiable</span>}
        </div>
      </div>
    </Link>
  );
}
