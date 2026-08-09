import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

const PROPERTY_TYPES = [
  "APARTMENT",
  "VILLA",
  "INDEPENDENT_HOUSE",
  "PLOT",
  "OFFICE_SPACE",
  "RETAIL",
  "WAREHOUSE",
];
const POSSESSION = ["READY_TO_MOVE", "UNDER_CONSTRUCTION"];

const empty = {
  title: "",
  propertyType: "APARTMENT",
  bhkConfig: "",
  carpetAreaSqft: "",
  builtUpAreaSqft: "",
  floorNumber: "",
  totalFloors: "",
  price: "",
  monthlyRent: "",
  negotiable: false,
  maintenanceCharges: "",
  address: "",
  pincode: "",
  city: "",
  state: "",
  landmark: "",
  amenities: "",
  reraNumber: "",
  possessionStatus: "READY_TO_MOVE",
};

export default function CreateProperty() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice(null);
    setBusy(true);
    try {
      const body = {
        title: form.title,
        propertyType: form.propertyType,
        bhkConfig: form.bhkConfig || null,
        carpetAreaSqft: parseFloat(form.carpetAreaSqft),
        builtUpAreaSqft: form.builtUpAreaSqft ? parseFloat(form.builtUpAreaSqft) : null,
        floorNumber: form.floorNumber ? parseInt(form.floorNumber, 10) : null,
        totalFloors: form.totalFloors ? parseInt(form.totalFloors, 10) : null,
        price: parseFloat(form.price),
        monthlyRent: form.monthlyRent ? parseFloat(form.monthlyRent) : null,
        negotiable: form.negotiable,
        maintenanceCharges: form.maintenanceCharges ? parseFloat(form.maintenanceCharges) : null,
        address: form.address || null,
        pincode: form.pincode || null,
        city: form.city || null,
        state: form.state || null,
        landmark: form.landmark || null,
        amenities: form.amenities
          ? form.amenities.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        reraNumber: form.reraNumber || null,
        possessionStatus: form.possessionStatus,
      };
      const created = await api("/properties", { method: "POST", body });
      setNotice({
        kind: "ok",
        text: `Listing created with ID ${created.propertyId}. Status: ${created.listingStatus} — it will appear on the site once an admin approves it.`,
      });
      setForm(empty);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1>List a property</h1>
      <p className="muted">
        New listings go to <strong>PENDING_APPROVAL</strong> and are reviewed by an admin before going live.
      </p>
      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert ok">{notice.text}</div>}

      <form className="card form-grid" onSubmit={submit}>
        <label className="span2">
          Title *
          <input value={form.title} onChange={set("title")} placeholder="e.g. 3BHK Skyline Apartment, Koramangala" required />
        </label>
        <label>
          Property type *
          <select value={form.propertyType} onChange={set("propertyType")}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </label>
        <label>
          Possession *
          <select value={form.possessionStatus} onChange={set("possessionStatus")}>
            {POSSESSION.map((p) => (
              <option key={p} value={p}>{p.replace("_", " ")}</option>
            ))}
          </select>
        </label>
        <label>
          BHK config
          <input value={form.bhkConfig} onChange={set("bhkConfig")} placeholder="3 BHK" />
        </label>
        <label>
          Carpet area (sq.ft) *
          <input type="number" min="1" value={form.carpetAreaSqft} onChange={set("carpetAreaSqft")} required />
        </label>
        <label>
          Built-up area (sq.ft)
          <input type="number" min="1" value={form.builtUpAreaSqft} onChange={set("builtUpAreaSqft")} />
        </label>
        <label>
          Price (₹) *
          <input type="number" min="1" value={form.price} onChange={set("price")} required />
        </label>
        <label>
          Monthly rent (₹)
          <input type="number" min="0" value={form.monthlyRent} onChange={set("monthlyRent")} />
        </label>
        <label>
          Maintenance (₹/mo)
          <input type="number" min="0" value={form.maintenanceCharges} onChange={set("maintenanceCharges")} />
        </label>
        <label>
          Floor
          <input type="number" min="0" value={form.floorNumber} onChange={set("floorNumber")} />
        </label>
        <label>
          Total floors
          <input type="number" min="1" value={form.totalFloors} onChange={set("totalFloors")} />
        </label>
        <label>
          City
          <input value={form.city} onChange={set("city")} placeholder="Bengaluru" />
        </label>
        <label>
          State
          <input value={form.state} onChange={set("state")} placeholder="Karnataka" />
        </label>
        <label>
          Pincode
          <input value={form.pincode} onChange={set("pincode")} placeholder="560095" />
        </label>
        <label className="span2">
          Address
          <input value={form.address} onChange={set("address")} placeholder="Street / locality" />
        </label>
        <label>
          Landmark
          <input value={form.landmark} onChange={set("landmark")} />
        </label>
        <label>
          RERA number
          <input value={form.reraNumber} onChange={set("reraNumber")} placeholder="Required for under-construction" />
        </label>
        <label className="span2">
          Amenities <span className="muted small">(comma-separated)</span>
          <input value={form.amenities} onChange={set("amenities")} placeholder="Car parking, Gym, Lift, 24x7 water" />
        </label>
        <label className="checkbox-label span2">
          <input type="checkbox" checked={form.negotiable} onChange={set("negotiable")} />
          Price is negotiable
        </label>
        <button className="btn block span2" disabled={busy}>
          {busy ? "Submitting…" : "Submit for approval"}
        </button>
      </form>
      <p className="muted small">
        <Link to="/">← Back to search</Link>
      </p>
    </div>
  );
}
