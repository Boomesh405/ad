import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, money, getUser } from "../api.js";

const DOC_LABELS = {
  TITLE_DEED: "📜 Title Deed",
  TAX_RECEIPT: "🧾 Tax Receipt",
  ENCUMBRANCE_CERT: "📋 Encumbrance Certificate",
  FALLBACK_IMG: "📐 Floor Plan",
  APPROVAL_PLAN: "✅ Approval Plan",
  OTHER: "📄 Other",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";

function openMap(address, city, state, pincode, landmark) {
  const parts = [address, city, state, pincode, landmark ? "near " + landmark : null];
  const full = parts.filter(Boolean).join(", ");
  const encoded = encodeURIComponent(full);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const url = isIOS
    ? `https://maps.apple.com/?q=${encoded}`
    : `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function PropertyDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tokenAmount, setTokenAmount] = useState("");
  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [booking, setBooking] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [imgErrors, setImgErrors] = useState({});
  const user = getUser();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    api(`/properties/${id}`, { auth: false })
      .then((d) => {
        if (alive) {
          setP(d);
          api(`/properties/${id}/view`, { method: "POST", auth: false }).catch(() => {});
          api(`/properties/${id}/documents`, { auth: false })
            .then((docs) => alive && setDocuments(docs))
            .catch(() => {});
        }
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  async function book(e) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const b = await api("/bookings", {
        method: "POST",
        params: { propertyId: id, tokenAmount, razorpayOrderId: razorpayOrderId || undefined },
      });
      setBooking(b);
      setNotice({ kind: "ok", text: "Booking initiated. Status: " + b.status });
    } catch (err) {
      setNotice({ kind: "err", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function activate() {
    setBusy(true);
    setNotice(null);
    try {
      const updated = await api(`/properties/${id}/activate`, { method: "POST" });
      setP(updated);
      setNotice({ kind: "ok", text: "Listing activated and live!" });
    } catch (err) {
      setNotice({ kind: "err", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton-thumb" style={{ height: 400, borderRadius: 14, marginBottom: 20 }} />
        <div className="skeleton-line medium" style={{ width: "50%", height: 28 }} />
        <div className="skeleton-line short" style={{ marginTop: 10 }} />
      </div>
    );
  }
  if (error) return <div className="alert error">{error}</div>;
  if (!p) return null;

  const canManage = user && (user.role === "SUPER_ADMIN" || user.role === "BUILDER_OWNER" || user.role === "AGENT");
  const isForRent = p.listingType === "FOR_RENT";
  const photos = (p.media || []).filter((m) => m.mediaType === "PHOTO");

  const specItems = [
    { icon: "🏢", label: "Property Type", value: p.propertyType?.replace(/_/g, " ") },
    { icon: "🛏", label: "BHK", value: p.bhkConfig || "—" },
    { icon: "📐", label: "Carpet Area", value: p.carpetAreaSqft ? p.carpetAreaSqft + " sq.ft" : "—" },
    { icon: "📏", label: "Built-up Area", value: p.builtUpAreaSqft ? p.builtUpAreaSqft + " sq.ft" : "—" },
    { icon: "🏗", label: "Floor", value: p.floorNumber != null ? `${p.floorNumber} / ${p.totalFloors || "?"}` : "—" },
    { icon: "🔑", label: "Possession", value: p.possessionStatus?.replace(/_/g, " ") },
    { icon: "📋", label: "RERA", value: p.reraNumber || "Not registered" },
    { icon: "💰", label: "Maintenance", value: p.maintenanceCharges ? money(p.maintenanceCharges) + "/mo" : "—" },
    { icon: "👁", label: "Views", value: p.viewCount ?? 0 },
  ];

  return (
    <div className="detail">
      <Link to="/" className="back">← Back to search</Link>

      {/* Header */}
      <div className="detail-head">
        <div>
          <h1>{p.title}</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            📍 {p.address ? p.address + " · " : ""}
            {p.city}{p.state ? ", " + p.state : ""}
            {p.pincode ? " · " + p.pincode : ""}
            {p.landmark ? " · near " + p.landmark : ""}
          </p>
        </div>
        <div className="detail-price">
          {isForRent ? (
            <>
              <div className="price">{money(p.monthlyRent)}/mo</div>
              <span className="badge rent" style={{ marginRight: 6 }}>FOR RENT</span>
            </>
          ) : (
            <>
              <div className="price">{money(p.price)}</div>
              <span className="badge sale" style={{ marginRight: 6 }}>FOR SALE</span>
            </>
          )}
          <span className={`badge ${p.listingStatus === "ACTIVE" ? "live" : p.listingStatus.toLowerCase()}`}>
            {p.listingStatus.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Gallery */}
      {photos.length > 0 ? (
        <div className="gallery">
          {photos.map((m, i) => (
            <img
              key={m.mediaId || i}
              src={imgErrors[m.mediaId] ? FALLBACK_IMG : (m.s3Key || FALLBACK_IMG)}
              alt={m.altText || p.title}
              className={`gallery-img${(m.coverPhoto || i === 0) ? " cover" : ""}`}
              loading="lazy"
              onError={() => setImgErrors((prev) => ({ ...prev, [m.mediaId]: true }))}
            />
          ))}
        </div>
      ) : (
        <div className="gallery">
          <img src={FALLBACK_IMG} alt={p.title} className="gallery-img cover" />
        </div>
      )}

      {/* Map Section */}
      <div className="map-section">
        <h3>📍 Property Location</h3>
        <div className="map-placeholder">
          <div className="map-pin">📍</div>
          <div className="map-address">
            {p.address ? p.address + " · " : ""}
            {p.city}{p.state ? ", " + p.state : ""}
            {p.pincode ? " · " + p.pincode : ""}
          </div>
          {p.landmark && <div className="map-hint">Near: {p.landmark}</div>}
          <button
            className="btn map-btn"
            onClick={() => openMap(p.address, p.city, p.state, p.pincode, p.landmark)}
          >
            🗺 Open in Google Maps
          </button>
          <div className="map-hint">Opens in your default map app (Google Maps / Apple Maps)</div>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left: specs + amenities + documents */}
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Property Details</h2>
          <div className="spec-grid">
            {specItems.map((s) => (
              <div key={s.label} className="spec-card-item">
                <div className="spec-card-icon">{s.icon}</div>
                <div className="spec-card-label">{s.label}</div>
                <div className="spec-card-value">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Owner info */}
          <div style={{ marginTop: 16, padding: "14px 0", borderTop: "1px solid var(--border)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>Listed by</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#201a08", fontSize: 16 }}>
                {(p.ownerId || "O")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Owner</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Verified listing</div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {p.amenities && p.amenities.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h2 style={{ marginTop: 0 }}>Amenities</h2>
              <div className="amenities">
                {p.amenities.map((a, i) => (
                  <span key={i} className="chip">✓ {a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {documents.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h2 style={{ marginTop: 0 }}>Property Documents</h2>
              <div className="doc-list">
                {documents.map((doc) => (
                  <div key={doc.documentId} className="doc-item">
                    <span className="doc-type">{DOC_LABELS[doc.docType] || doc.docType}</span>
                    <span className="doc-name">{doc.docName}</span>
                    {doc.verified && <span className="badge live">✓ Verified</span>}
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="doc-link">
                      View ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canManage && (
            <button className="btn block" onClick={activate} disabled={busy} style={{ marginTop: 16 }}>
              {busy ? "Activating…" : "✓ Activate listing"}
            </button>
          )}
        </div>

        {/* Right: booking / contact */}
        <div className="card book-card">
          <h2 style={{ marginTop: 0 }}>
            {isForRent ? " interested in renting?" : user?.role === "BUYER_TENANT" ? "Book this property" : "Interested in this property?"}
          </h2>

          {/* Price highlight */}
          <div style={{
            background: "var(--panel2)",
            borderRadius: 10,
            padding: "16px",
            textAlign: "center",
            marginBottom: 16,
            border: "1px solid var(--border)"
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>
              {isForRent ? money(p.monthlyRent) + "/mo" : money(p.price)}
            </div>
            {isForRent && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Monthly Rent</div>}
            {!isForRent && p.negotiable && (
              <div style={{ fontSize: 13, color: "var(--ok)", marginTop: 4 }}>💬 Price negotiable</div>
            )}
          </div>

          {isForRent ? (
            <div className="muted">
              <p>Contact the owner to arrange a rental agreement.</p>
              {!user && <p>Log in as a buyer to express interest.</p>}
            </div>
          ) : user?.role === "BUYER_TENANT" ? (
            <form onSubmit={book}>
              <label>
                Token amount (₹)
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  required
                />
              </label>
              <label>
                Razorpay order ID <span className="muted small">(optional)</span>
                <input
                  value={razorpayOrderId}
                  onChange={(e) => setRazorpayOrderId(e.target.value)}
                  placeholder="order_xxxxxxxxxx"
                />
              </label>
              <button className="btn block" disabled={busy}>
                {busy ? "Placing…" : "🏠 Book now"}
              </button>
              <p className="muted small" style={{ marginTop: 8 }}>
                The token amount is held against the booking.
              </p>
            </form>
          ) : (
            <p className="muted">
              {user ? "Only buyers can place token bookings." : "Log in as a buyer to book this property."}
              {!user && (
                <>
                  {" "}
                  <Link to="/login">Log in</Link> or <Link to="/register">sign up</Link>.
                </>
              )}
            </p>
          )}

          {/* Trust indicators */}
          <div style={{ marginTop: 16, padding: "12px 0", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "var(--ok)" }}>✓</span>
                <span className="muted">Admin verified listing</span>
              </div>
              {p.reraNumber && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--ok)" }}>✓</span>
                  <span className="muted">RERA registered</span>
                </div>
              )}
              {documents.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--ok)" }}>✓</span>
                  <span className="muted">{documents.length} document(s) uploaded</span>
                </div>
              )}
            </div>
          </div>

          {notice && <div className={`alert ${notice.kind === "ok" ? "ok" : "error"}`} style={{ marginTop: 12 }}>{notice.text}</div>}
          {booking && (
            <div className="booking-result">
              <h3>Booking {booking.bookingId.slice(0, 8)}</h3>
              <p className="muted">Status: <strong>{booking.status}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
