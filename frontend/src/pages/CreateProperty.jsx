import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import DragDropUpload from "../components/DragDropUpload.jsx";

const PROPERTY_TYPES = ["APARTMENT", "VILLA", "INDEPENDENT_HOUSE", "PLOT", "OFFICE_SPACE", "RETAIL", "WAREHOUSE"];
const POSSESSION = ["READY_TO_MOVE", "UNDER_CONSTRUCTION"];
const LISTING_TYPES = ["FOR_SALE", "FOR_RENT"];

const STEPS = ["Basic Info", "Details", "Location", "Pricing", "Amenities", "Review"];

const empty = {
  title: "", propertyType: "APARTMENT", listingType: "FOR_SALE",
  bhkConfig: "", carpetAreaSqft: "", builtUpAreaSqft: "",
  floorNumber: "", totalFloors: "", price: "", monthlyRent: "",
  negotiable: false, maintenanceCharges: "",
  address: "", pincode: "", city: "", state: "", landmark: "",
  amenities: "", reraNumber: "", possessionStatus: "READY_TO_MOVE",
};

export default function CreateProperty() {
  const [form, setForm] = useState(empty);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [createdProperty, setCreatedProperty] = useState(null);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  function canAdvance() {
    if (step === 0) return form.title.trim() !== "" && form.propertyType;
    if (step === 1) return form.carpetAreaSqft !== "";
    if (step === 3) return form.price !== "";
    return true;
  }

  function next() { if (canAdvance() && step < STEPS.length - 1) setStep(step + 1); }
  function prev() { if (step > 0) setStep(step - 1); }

  async function submit() {
    setError("");
    setNotice(null);
    setBusy(true);
    try {
      const body = {
        title: form.title,
        propertyType: form.propertyType,
        listingType: form.listingType,
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
        amenities: form.amenities ? form.amenities.split(",").map((s) => s.trim()).filter(Boolean) : [],
        reraNumber: form.reraNumber || null,
        possessionStatus: form.possessionStatus,
      };
      const created = await api("/properties", { method: "POST", body });
      setCreatedProperty(created);
      setNotice({ kind: "ok", text: `Listing created with ID ${created.propertyId.slice(0, 8)}. Status: ${created.listingStatus}.` });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (createdProperty) {
    return (
      <div>
        <div className="alert ok" style={{ fontSize: 16, padding: "16px 20px" }}>
          ✅ {notice?.text}
        </div>
        <div className="card doc-section" style={{ marginTop: 20 }}>
          <h2 style={{ marginTop: 0 }}>Upload Property Documents</h2>
          <p className="muted small">
            Drag & drop files below or click to browse. Documents will be reviewed by an admin.
          </p>
          <DragDropUpload
            propertyId={createdProperty.propertyId}
            onUploaded={(files) => setNotice({ kind: "ok", text: `${files.length} document(s) uploaded successfully!` })}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to="/" className="btn ghost">← Back to search</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>List a property</h1>
      <p className="muted">
        New listings go to <strong>PENDING_APPROVAL</strong> and are reviewed by an admin before going live.
      </p>

      {/* Step progress */}
      <div className="wizard-steps">
        {STEPS.map((label, i) => (
          <div
            key={i}
            className={`wizard-step ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
            onClick={() => i <= step && setStep(i)}
          >
            <span className="wizard-step-num">{i < step ? "✓" : i + 1}</span>
            <span className="wizard-step-label">{label}</span>
          </div>
        ))}
      </div>

      {error && <div className="alert error">{error}</div>}

      <div className="card form-grid">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <>
            <label className="span2">
              Property Title *
              <input value={form.title} onChange={set("title")} placeholder="e.g. 3BHK Skyline Apartment, Koramangala" required />
            </label>
            <label>
              Property Type *
              <select value={form.propertyType} onChange={set("propertyType")}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label>
              Listing Type *
              <select value={form.listingType} onChange={set("listingType")}>
                {LISTING_TYPES.map((t) => <option key={t} value={t}>{t === "FOR_SALE" ? "🏠 For Sale" : "🔑 For Rent"}</option>)}
              </select>
            </label>
            <label>
              Possession Status *
              <select value={form.possessionStatus} onChange={set("possessionStatus")}>
                {POSSESSION.map((p) => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
              </select>
            </label>
            <label>
              BHK Configuration
              <input value={form.bhkConfig} onChange={set("bhkConfig")} placeholder="e.g. 3 BHK" />
            </label>
          </>
        )}

        {/* Step 1: Property Details */}
        {step === 1 && (
          <>
            <label>
              Carpet Area (sq.ft) *
              <input type="number" min="1" value={form.carpetAreaSqft} onChange={set("carpetAreaSqft")} required placeholder="e.g. 1200" />
            </label>
            <label>
              Built-up Area (sq.ft)
              <input type="number" min="1" value={form.builtUpAreaSqft} onChange={set("builtUpAreaSqft")} placeholder="e.g. 1500" />
            </label>
            <label>
              Floor Number
              <input type="number" min="0" value={form.floorNumber} onChange={set("floorNumber")} placeholder="e.g. 5" />
            </label>
            <label>
              Total Floors
              <input type="number" min="1" value={form.totalFloors} onChange={set("totalFloors")} placeholder="e.g. 12" />
            </label>
          </>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <>
            <label>
              City *
              <input value={form.city} onChange={set("city")} placeholder="e.g. Bengaluru" />
            </label>
            <label>
              State
              <input value={form.state} onChange={set("state")} placeholder="e.g. Karnataka" />
            </label>
            <label>
              Pincode
              <input value={form.pincode} onChange={set("pincode")} placeholder="e.g. 560095" />
            </label>
            <label>
              Landmark
              <input value={form.landmark} onChange={set("landmark")} placeholder="e.g. Near Metro Station" />
            </label>
            <label className="span2">
              Full Address
              <input value={form.address} onChange={set("address")} placeholder="Street / locality / area" />
            </label>
          </>
        )}

        {/* Step 3: Pricing */}
        {step === 3 && (
          <>
            <label>
              {form.listingType === "FOR_RENT" ? "Monthly Rent (₹) *" : "Price (₹) *"}
              <input type="number" min="1" value={form.listingType === "FOR_RENT" ? form.monthlyRent : form.price}
                onChange={set(form.listingType === "FOR_RENT" ? "monthlyRent" : "price")} required
                placeholder={form.listingType === "FOR_RENT" ? "e.g. 25000" : "e.g. 8500000"} />
            </label>
            {form.listingType === "FOR_SALE" && (
              <label>
                Monthly Rent (₹) <span className="muted small">(if also rented)</span>
                <input type="number" min="0" value={form.monthlyRent} onChange={set("monthlyRent")} placeholder="Optional" />
              </label>
            )}
            {form.listingType === "FOR_RENT" && (
              <label>
                Security Deposit (₹) <span className="muted small">(as price)</span>
                <input type="number" min="0" value={form.price} onChange={set("price")} placeholder="e.g. 100000" />
              </label>
            )}
            <label>
              Maintenance (₹/month)
              <input type="number" min="0" value={form.maintenanceCharges} onChange={set("maintenanceCharges")} placeholder="e.g. 3000" />
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.negotiable} onChange={set("negotiable")} />
              Price is negotiable
            </label>
          </>
        )}

        {/* Step 4: Amenities */}
        {step === 4 && (
          <>
            <label className="span2">
              Amenities <span className="muted small">(comma-separated)</span>
              <input value={form.amenities} onChange={set("amenities")} placeholder="Car parking, Gym, Lift, 24x7 water, Security, Swimming Pool" />
            </label>
            <label className="span2">
              RERA Number <span className="muted small">(required for under-construction)</span>
              <input value={form.reraNumber} onChange={set("reraNumber")} placeholder="e.g. RERA/KARN/12345" />
            </label>
          </>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="span2" style={{ padding: "8px 0" }}>
            <h3 style={{ marginTop: 0 }}>Review Your Listing</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><span className="muted">Title:</span> <strong>{form.title || "—"}</strong></div>
              <div><span className="muted">Type:</span> <strong>{form.propertyType?.replace(/_/g, " ")}</strong></div>
              <div><span className="muted">Listing:</span> <strong>{form.listingType === "FOR_SALE" ? "🏠 For Sale" : "🔑 For Rent"}</strong></div>
              <div><span className="muted">Possession:</span> <strong>{form.possessionStatus?.replace(/_/g, " ")}</strong></div>
              <div><span className="muted">BHK:</span> <strong>{form.bhkConfig || "—"}</strong></div>
              <div><span className="muted">Area:</span> <strong>{form.carpetAreaSqft ? form.carpetAreaSqft + " sq.ft" : "—"}</strong></div>
              <div><span className="muted">Price:</span> <strong>{form.price ? "₹" + Number(form.price).toLocaleString("en-IN") : "—"}</strong></div>
              <div><span className="muted">Rent:</span> <strong>{form.monthlyRent ? "₹" + Number(form.monthlyRent).toLocaleString("en-IN") + "/mo" : "—"}</strong></div>
              <div><span className="muted">City:</span> <strong>{form.city || "—"}</strong></div>
              <div><span className="muted">State:</span> <strong>{form.state || "—"}</strong></div>
              <div><span className="muted">Amenities:</span> <strong>{form.amenities || "—"}</strong></div>
              <div><span className="muted">Negotiable:</span> <strong>{form.negotiable ? "Yes" : "No"}</strong></div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="wizard-nav span2">
          <button type="button" className="btn ghost" onClick={prev} disabled={step === 0}>
            ← Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn" onClick={next} disabled={!canAdvance()}>
              Next →
            </button>
          ) : (
            <button type="button" className="btn" onClick={submit} disabled={busy} style={{ minWidth: 180 }}>
              {busy ? "Submitting…" : "✓ Submit for Approval"}
            </button>
          )}
        </div>
      </div>

      <p className="muted small" style={{ marginTop: 16 }}>
        <Link to="/">← Back to search</Link>
      </p>
    </div>
  );
}
