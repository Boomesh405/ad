import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, money, getUser } from "../api.js";

const DOC_LABELS = {
  TITLE_DEED: "📜 Title Deed",
  TAX_RECEIPT: "🧾 Tax Receipt",
  ENCUMBRANCE_CERT: "📋 Encumbrance Certificate",
  FLOOR_PLAN: "📐 Floor Plan",
  APPROVAL_PLAN: "✅ Approval Plan",
  OTHER: "📄 Other Document",
};

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
  const user = getUser();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    api(`/properties/${id}`, { auth: false })
      .then((d) => {
        if (alive) {
          setP(d);
          // Fire-and-forget view counter
          api(`/properties/${id}/view`, { method: "POST", auth: false }).catch(() => {});
          // Load documents
          api(`/properties/${id}/documents`, { auth: false })
            .then((docs) => alive && setDocuments(docs))
            .catch(() => {});
        }
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  async function book(e) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const b = await api("/bookings", {
        method: "POST",
        params: {
          propertyId: id,
          tokenAmount,
          razorpayOrderId: razorpayOrderId || undefined,
        },
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

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <div className="alert error">{error}</div>;
  if (!p) return null;

  const canManage =
    user &&
    (user.role === "SUPER_ADMIN" ||
      user.role === "BUILDER_OWNER" ||
      user.role === "AGENT");

  const specs = [
    ["Property type", p.propertyType],
    ["BHK config", p.bhkConfig || "—"],
    ["Carpet area", p.carpetAreaSqft ? p.carpetAreaSqft + " sq.ft" : "—"],
    ["Built-up area", p.builtUpAreaSqft ? p.builtUpAreaSqft + " sq.ft" : "—"],
    ["Floor", p.floorNumber != null ? `${p.floorNumber} of ${p.totalFloors || "?"}` : "—"],
    ["Possession", p.possessionStatus],
    ["RERA number", p.reraNumber || "—"],
    ["Maintenance", p.maintenanceCharges ? money(p.maintenanceCharges) + "/mo" : "—"],
    ["Negotiable", p.negotiable ? "Yes" : "No"],
    ["Views", p.viewCount ?? 0],
  ];

  return (
    <div className="detail">
      <Link to="/" className="back">← Back to search</Link>
      <div className="detail-head">
        <div>
          <h1>{p.title}</h1>
          <p className="muted">
            {p.address ? p.address + " · " : ""}
            {p.city}
            {p.state ? ", " + p.state : ""}
            {p.pincode ? " · " + p.pincode : ""}
            {p.landmark ? " · near " + p.landmark : ""}
          </p>
        </div>
        <div className="detail-price">
          {p.listingType === "FOR_RENT" ? (
            <>
              <div className="price">{money(p.monthlyRent)}/mo</div>
              <span className="badge rent">FOR RENT</span>
            </>
          ) : (
            <>
              <div className="price">{money(p.price)}</div>
              <span className="badge sale">FOR SALE</span>
            </>
          )}
          <span className={`badge ${p.listingStatus === "ACTIVE" ? "live" : p.listingStatus.toLowerCase()}`}>
            {p.listingStatus.replace("_", " ")}
          </span>
        </div>
      </div>

      {p.media?.length > 0 && (
        <div className="gallery">
          {p.media
            .filter((m) => m.mediaType === "PHOTO")
            .map((m, i) => (
              <img
                key={m.mediaId || i}
                src={m.s3Key}
                alt={m.altText || p.title}
                className={`gallery-img${m.coverPhoto ? " cover" : ""}`}
                loading="lazy"
              />
            ))}
        </div>
      )}

      <div className="detail-grid">
        <div className="card spec-card">
          <h2>Overview</h2>
          <table className="specs">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {p.amenities && p.amenities.length > 0 && (
            <>
              <h2>Amenities</h2>
              <div className="amenities">
                {p.amenities.map((a, i) => (
                  <span key={i} className="chip">{a}</span>
                ))}
              </div>
            </>
          )}
          {documents.length > 0 && (
            <>
              <h2>Property Documents</h2>
              <div className="doc-list">
                {documents.map((doc) => (
                  <div key={doc.documentId} className="doc-item">
                    <span className="doc-type">{DOC_LABELS[doc.docType] || doc.docType}</span>
                    <span className="doc-name">{doc.docName}</span>
                    {doc.verified && <span className="badge live">Verified</span>}
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="doc-link">
                      View ↗
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}
          {canManage && (
            <button className="btn block" onClick={activate} disabled={busy}>
              Activate listing
            </button>
          )}
        </div>

        <div className="card book-card">
          <h2>{p.listingType === "FOR_RENT" ? "Rent this property" : user?.role === "BUYER_TENANT" ? "Book this property" : "Interested in this property?"}</h2>
          {p.listingType === "FOR_RENT" ? (
            <div className="muted">
              <p>Monthly rent: <strong>{money(p.monthlyRent)}</strong></p>
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
                {busy ? "Placing…" : "Book now"}
              </button>
              <p className="muted small">
                The token amount is held against the booking. A booking without a
                Razorpay order ID stays pending until payment is verified.
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
          {notice && <div className={`alert ${notice.kind === "ok" ? "ok" : "error"}`}>{notice.text}</div>}
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
