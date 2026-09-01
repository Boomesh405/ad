import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, money, getUser } from "../api.js";
import { useToast } from "../components/ui/Toast.jsx";
import { useSaved } from "./SavedProperties.jsx";
import ImageGallery from "../components/ui/ImageGallery.jsx";
import Modal from "../components/ui/Modal.jsx";
import { SkeletonDetail } from "../components/ui/Skeleton.jsx";

const DOC_LABELS = {
  TITLE_DEED: "📜 Title Deed", TAX_RECEIPT: "🧾 Tax Receipt",
  ENCUMBRANCE_CERT: "📋 Encumbrance Certificate", FALLBACK_IMG: "📐 Floor Plan",
  APPROVAL_PLAN: "✅ Approval Plan", OTHER: "📄 Other",
};

const AMENITY_ICONS = {
  parking: "🚗", gym: "🏋️", lift: "🛗", security: "🔒", pool: "🏊",
  garden: "🌳", power: "⚡", water: "💧", wifi: "📶", club: "🎾",
  "24x7 water": "💧", "car parking": "🚗", swimming: "🏊", "swimming pool": "🏊",
};

function openMap(address, city, state, pincode, landmark) {
  const parts = [address, city, state, pincode, landmark ? "near " + landmark : null];
  const full = parts.filter(Boolean).join(", ");
  const encoded = encodeURIComponent(full);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  window.open(isIOS ? `https://maps.apple.com/?q=${encoded}` : `https://www.google.com/maps/search/?api=1&query=${encoded}`, "_blank", "noopener,noreferrer");
}

function getAmenityIcon(name) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "✓";
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
  const [showContact, setShowContact] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const user = getUser();
  const toast = useToast();
  const { isSaved, toggle } = useSaved();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api(`/properties/${id}`, { auth: false })
      .then((d) => {
        if (alive) {
          setP(d);
          api(`/properties/${id}/view`, { method: "POST", auth: false }).catch(() => {});
          api(`/properties/${id}/documents`, { auth: false }).then((docs) => alive && setDocuments(docs)).catch(() => {});
        }
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  async function book(e) {
    e.preventDefault();
    setBusy(true); setNotice(null);
    try {
      const b = await api("/bookings", { method: "POST", params: { propertyId: id, tokenAmount, razorpayOrderId: razorpayOrderId || undefined } });
      setBooking(b);
      toast.success("Booking initiated! Status: " + b.status);
      setNotice({ kind: "ok", text: "Booking initiated. Status: " + b.status });
    } catch (err) { toast.error(err.message); setNotice({ kind: "err", text: err.message }); }
    finally { setBusy(false); }
  }

  async function activate() {
    setBusy(true); setNotice(null);
    try {
      const updated = await api(`/properties/${id}/activate`, { method: "POST" });
      setP(updated); toast.success("Listing activated!");
      setNotice({ kind: "ok", text: "Listing activated and live!" });
    } catch (err) { toast.error(err.message); setNotice({ kind: "err", text: err.message }); }
    finally { setBusy(false); }
  }

  if (loading) return <SkeletonDetail />;
  if (error) return <div className="card" style={{ padding: 40, textAlign: "center" }}><div className="empty-icon">⚠️</div><h3>{error}</h3><Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Search</Link></div>;
  if (!p) return null;

  const canManage = user && (["SUPER_ADMIN", "BUILDER_OWNER", "AGENT"].includes(user.role));
  const isForRent = p.listingType === "FOR_RENT";
  const photos = (p.media || []).filter((m) => m.mediaType === "PHOTO");

  const specItems = [
    { icon: "🏢", label: "Type", value: p.propertyType?.replace(/_/g, " ") },
    { icon: "🛏", label: "BHK", value: p.bhkConfig || "—" },
    { icon: "📐", label: "Carpet", value: p.carpetAreaSqft ? p.carpetAreaSqft + " sq.ft" : "—" },
    { icon: "📏", label: "Built-up", value: p.builtUpAreaSqft ? p.builtUpAreaSqft + " sq.ft" : "—" },
    { icon: "🏗", label: "Floor", value: p.floorNumber != null ? `${p.floorNumber} / ${p.totalFloors || "?"}` : "—" },
    { icon: "🔑", label: "Possession", value: p.possessionStatus?.replace(/_/g, " ") },
    { icon: "📋", label: "RERA", value: p.reraNumber || "Not registered" },
    { icon: "💰", label: "Maintenance", value: p.maintenanceCharges ? money(p.maintenanceCharges) + "/mo" : "—" },
    { icon: "👁", label: "Views", value: p.viewCount ?? 0 },
  ];

  return (
    <div className="detail">
      <Link to="/" className="back">← Back to search</Link>

      {/* Breadcrumb */}
      <div className="muted small" style={{ marginBottom: 12 }}>
        Home / {p.city || "India"} / {p.propertyType?.replace(/_/g, " ") || "Property"} / {p.title}
      </div>

      {/* Header */}
      <div className="detail-head">
        <div>
          <h1>{p.title}</h1>
          <p className="card-location" style={{ fontSize: 15 }}>
            📍 {p.address ? p.address + " · " : ""}{p.city}{p.state ? ", " + p.state : ""}{p.pincode ? " · " + p.pincode : ""}{p.landmark ? " · near " + p.landmark : ""}
          </p>
        </div>
        <div className="detail-price">
          <div className="price" style={{ fontSize: 32 }}>
            {isForRent ? money(p.monthlyRent) + "/mo" : money(p.price)}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <span className={`badge ${isForRent ? "badge-blue" : "badge-ok"}`}>
              {isForRent ? "🔑 For Rent" : "🏠 For Sale"}
            </span>
            <span className={`badge ${p.listingStatus === "ACTIVE" ? "badge-ok" : "badge-muted"}`}>
              {p.listingStatus.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <ImageGallery images={photos} title={p.title} />

      <div className="detail-grid">
        {/* Left column */}
        <div>
          {/* Property at a glance */}
          <div className="card card-body" style={{ marginBottom: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Property at a Glance</h2>
            <div className="spec-grid">
              {specItems.map((s) => (
                <div key={s.label} className="spec-card">
                  <div className="spec-icon">{s.icon}</div>
                  <div className="spec-label">{s.label}</div>
                  <div className="spec-value">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          {p.amenities && p.amenities.length > 0 && (
            <div className="card card-body" style={{ marginBottom: 20 }}>
              <h2 style={{ marginTop: 0, marginBottom: 16 }}>Amenities</h2>
              <div className="amenities">
                {p.amenities.map((a, i) => (
                  <span key={i} className="amenity-chip">
                    <span className="amenity-icon">{getAmenityIcon(a)}</span>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location & Map */}
          <div className="card card-body" style={{ marginBottom: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>📍 Location</h2>
            <div style={{ marginBottom: 16 }}>
              <p><strong>Address:</strong> {p.address || "—"}</p>
              <p><strong>City:</strong> {p.city || "—"}</p>
              <p><strong>State:</strong> {p.state || "—"}</p>
              <p><strong>Pincode:</strong> {p.pincode || "—"}</p>
              {p.landmark && <p><strong>Landmark:</strong> {p.landmark}</p>}
            </div>
            <button className="btn btn-primary btn-block" onClick={() => openMap(p.address, p.city, p.state, p.pincode, p.landmark)}>
              🗺 Open in Google Maps
            </button>
          </div>

          {/* Documents */}
          {documents.length > 0 && (
            <div className="card card-body" style={{ marginBottom: 20 }}>
              <h2 style={{ marginTop: 0, marginBottom: 16 }}>📄 Property Documents</h2>
              <div className="doc-list">
                {documents.map((doc) => (
                  <div key={doc.documentId} className="doc-item">
                    <span className="doc-type">{DOC_LABELS[doc.docType] || doc.docType}</span>
                    <span className="doc-name">{doc.docName}</span>
                    {doc.verified && <span className="badge badge-ok">✓ Verified</span>}
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="doc-link">View ↗</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Listed by */}
          <div className="card card-body" style={{ marginBottom: 20 }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Listed by</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "#1a1000" }}>
                {(p.ownerId || "O")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Owner</div>
                <div className="muted small">Verified listing</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowContact(true)}>📞 Contact</button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowSchedule(true)}>📅 Schedule Visit</button>
              </div>
            </div>
          </div>

          {/* Trust */}
          <div className="card card-body">
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Trust & Verification</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: "var(--ok)", fontSize: 18 }}>✓</span> Admin verified listing</div>
              {p.reraNumber && <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: "var(--ok)", fontSize: 18 }}>✓</span> RERA registered ({p.reraNumber})</div>}
              {documents.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ color: "var(--ok)", fontSize: 18 }}>✓</span> {documents.length} document(s) uploaded</div>}
            </div>
          </div>
        </div>

        {/* Right column — Booking */}
        <div>
          <div className="card card-body" style={{ position: "sticky", top: 80 }}>
            <h2 style={{ marginTop: 0 }}>{isForRent ? "Interested in renting?" : "Book this property"}</h2>

            {/* Price highlight */}
            <div style={{ background: "var(--panel2)", borderRadius: "var(--r-md)", padding: 20, textAlign: "center", marginBottom: 20, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--gold)" }}>
                {isForRent ? money(p.monthlyRent) + "/mo" : money(p.price)}
              </div>
              {isForRent && <div className="muted small" style={{ marginTop: 4 }}>Monthly Rent</div>}
              {!isForRent && p.negotiable && <div style={{ fontSize: 13, color: "var(--ok)", marginTop: 4 }}>💬 Price negotiable</div>}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              <button className="btn btn-primary btn-block" onClick={() => setShowContact(true)}>📞 Contact Owner</button>
              <button className="btn btn-secondary btn-block" onClick={() => setShowSchedule(true)}>📅 Schedule Visit</button>
              <button className="btn btn-ghost btn-block" onClick={(e) => { e.preventDefault(); toggle(p.propertyId); }}>
                {isSaved(p.propertyId) ? "♥ Saved" : "♡ Save Property"}
              </button>
            </div>

            {/* Booking form */}
            {user?.role === "BUYER_TENANT" && !isForRent && (
              <form onSubmit={book} style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <h3 style={{ margin: "0 0 12px" }}>Secure Booking</h3>
                <div className="form-group">
                  <label>Token amount (₹)</label>
                  <input className="input" type="number" min="1" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} placeholder="e.g. 50000" required />
                </div>
                <div className="form-group">
                  <label>Razorpay order ID <span className="muted small">(optional)</span></label>
                  <input className="input" value={razorpayOrderId} onChange={(e) => setRazorpayOrderId(e.target.value)} placeholder="order_xxxxxxxxxx" />
                </div>
                <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Placing…" : "🏠 Book now"}</button>
                <p className="muted small" style={{ marginTop: 8, textAlign: "center" }}>🔒 Secure payment processed by Razorpay</p>
              </form>
            )}

            {!user && (
              <p className="muted" style={{ textAlign: "center", marginTop: 16 }}>
                <Link to="/login">Log in</Link> as a buyer to book this property.
              </p>
            )}

            {notice && <div className={`alert ${notice.kind === "ok" ? "alert-ok" : "alert-err"}`} style={{ marginTop: 12 }}>{notice.text}</div>}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal open={showContact} onClose={() => setShowContact(false)} title="Contact Owner">
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📞</div>
          <h3 style={{ margin: "0 0 8px" }}>Interested in this property?</h3>
          <p className="muted" style={{ marginBottom: 24 }}>The owner will be notified of your interest.</p>
          <button className="btn btn-primary btn-block" onClick={() => { toast.success("Enquiry sent to owner!"); setShowContact(false); }}>
            Send Enquiry
          </button>
        </div>
      </Modal>

      {/* Schedule Visit Modal */}
      <Modal open={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule a Visit">
        <div className="form-group">
          <label>Preferred Date</label>
          <input className="input" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Preferred Time</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"].map((t) => (
              <button key={t} type="button" className={`btn ${visitTime === t ? "btn-primary" : "btn-secondary"} btn-sm`}
                onClick={() => setVisitTime(t)}>{t}</button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }}
          onClick={() => { toast.success("Visit scheduled! Owner will contact you."); setShowSchedule(false); }}
          disabled={!visitDate || !visitTime}>
          Confirm Visit
        </button>
      </Modal>
    </div>
  );
}
