import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money } from "../api.js";

const STATUSES = [
  "PENDING_APPROVAL",
  "ACTIVE",
  "REJECTED",
  "BOOKED",
  "SOLD",
  "RENTED",
  "SUSPENDED",
  "INACTIVE",
];

export default function AdminApprovals() {
  const [status, setStatus] = useState("PENDING_APPROVAL");
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  async function load() {
    try {
      setList(await api("/admin/properties", { params: { status } }));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function approve(id) {
    setNotice(null);
    try {
      await api(`/admin/properties/${id}/approve`, { method: "PUT" });
      setNotice({ kind: "ok", text: "Listing approved and live." });
      load();
    } catch (e) {
      setNotice({ kind: "err", text: e.message });
    }
  }

  async function reject(id) {
    const reason = window.prompt("Rejection reason:");
    if (reason === null) return;
    setNotice(null);
    try {
      await api(`/admin/properties/${id}/reject`, { method: "PUT", body: reason });
      setNotice({ kind: "ok", text: "Listing rejected." });
      load();
    } catch (e) {
      setNotice({ kind: "err", text: e.message });
    }
  }

  return (
    <div>
      <h1>Admin console</h1>
      <p className="muted">Review and moderate property listings.</p>
      {notice && (
        <div className={`alert ${notice.kind === "ok" ? "ok" : "error"}`}>{notice.text}</div>
      )}
      {error && <div className="alert error">{error}</div>}

      <div className="tabs">
        <button className={status === "" ? "tab active" : "tab"} onClick={() => setStatus("")}>
          All
        </button>
        {STATUSES.map((s) => (
          <button key={s} className={status === s ? "tab active" : "tab"} onClick={() => setStatus(s)}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {!list ? (
        <p className="muted">Loading…</p>
      ) : list.length === 0 ? (
        <div className="empty card">No listings with this status.</div>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>City</th>
                <th>Price</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.propertyId}>
                  <td>
                    <Link to={`/properties/${p.propertyId}`}>{p.title}</Link>
                  </td>
                  <td>{p.city || "—"}</td>
                  <td>{money(p.price)}</td>
                  <td className="muted small">
                    {p.propertyType}
                    {p.bhkConfig ? " · " + p.bhkConfig : ""}
                  </td>
                  <td>
                    <span className={`badge ${p.listingStatus === "ACTIVE" ? "live" : p.listingStatus.toLowerCase()}`}>
                      {p.listingStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="actions">
                    {p.listingStatus === "PENDING_APPROVAL" && (
                      <>
                        <button className="btn small" onClick={() => approve(p.propertyId)}>
                          Approve
                        </button>
                        <button className="btn ghost danger small" onClick={() => reject(p.propertyId)}>
                          Reject
                        </button>
                      </>
                    )}
                    {p.listingStatus === "REJECTED" && (
                      <span className="muted small">{p.rejectionReason || "Rejected"}</span>
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
