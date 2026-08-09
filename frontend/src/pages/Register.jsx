import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

const ROLES = [
  ["BUYER_TENANT", "Buyer / Tenant"],
  ["BUILDER_OWNER", "Builder / Owner"],
  ["AGENT", "Agent"],
];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role: "BUYER_TENANT",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form);
      nav("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="muted">Join EstateHub as a buyer, builder, or agent.</p>
        {error && <div className="alert error">{error}</div>}
        <label>
          Full name
          <input value={form.name} onChange={set("name")} required />
        </label>
        <label>
          Mobile number
          <input value={form.mobile} onChange={set("mobile")} placeholder="9876543210" required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={set("password")} required />
        </label>
        <label>
          I am a…
          <select value={form.role} onChange={set("role")}>
            {ROLES.map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn block" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
        <p className="muted center">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
