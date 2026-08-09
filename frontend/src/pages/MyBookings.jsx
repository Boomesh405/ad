import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../api.js";

export default function MyBookings() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  async function load() {
    try {
      setBookings(await api("/bookings/mine"));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id) {
    setNotice(null);
    try {
      await api(`/bookings/${id}/cancel`, { method: "POST" });
      setNotice({ kind: "ok", text: "Booking cancelled." });
      load();
    } catch (e) {
      setNotice({ kind: "err", text: e.message });
    }
  }

  if (error) return <div className="alert error">{error}</div>;
  if (!bookings) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1>My bookings</h1>
      {notice && (
        <div className={`alert ${notice.kind === "ok" ? "ok" : "error"}`}>
          {notice.text}
        </div>
      )}
      {bookings.length === 0 ? (
        <div className="empty card">
          You have no bookings yet. <Link to="/">Browse properties</Link> to get started.
        </div>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Token amount</th>
                <th>Property</th>
                <th>Razorpay order</th>
                <th>Placed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.bookingId}>
                  <td>
                    <span className={`badge ${b.status === "CONFIRMED" ? "live" : b.status.toLowerCase()}`}>
                      {b.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>{money(b.tokenAmount)}</td>
                  <td>
                    <Link to={`/properties/${b.propertyId}`}>View property</Link>
                  </td>
                  <td className="muted small">{b.razorpayOrderId || "—"}</td>
                  <td className="muted small">
                    {b.createdAt ? b.createdAt.slice(0, 10) : "—"}
                  </td>
                  <td>
                    {b.status === "PENDING_PAYMENT" && (
                      <button className="btn ghost danger" onClick={() => cancel(b.bookingId)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
