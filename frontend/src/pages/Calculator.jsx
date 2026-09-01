import { useState, useMemo } from "react";
import { money } from "../api.js";

export default function Calculator() {
  const [tab, setTab] = useState("emi");

  return (
    <div>
      <h1>Financial Calculators</h1>
      <p className="muted">Plan your property purchase with our financial tools</p>

      <div className="listing-tabs" style={{ marginTop: 16 }}>
        <button className={`listing-tab ${tab === "emi" ? "active" : ""}`} onClick={() => setTab("emi")}>
          💰 EMI Calculator
        </button>
        <button className={`listing-tab ${tab === "afford" ? "active" : ""}`} onClick={() => setTab("afford")}>
          🏠 Affordability Calculator
        </button>
        <button className={`listing-tab ${tab === "rental" ? "active" : ""}`} onClick={() => setTab("rental")}>
          📈 Rental Yield
        </button>
      </div>

      {tab === "emi" && <EMICalculator />}
      {tab === "afford" && <AffordabilityCalculator />}
      {tab === "rental" && <RentalYieldCalculator />}
    </div>
  );
}

function EMICalculator() {
  const [price, setPrice] = useState(5000000);
  const [downPayment, setDownPayment] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const calc = useMemo(() => {
    const principal = price - downPayment;
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    if (monthlyRate === 0) return { emi: principal / months, total: principal, interest: 0, principal };
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const total = emi * months;
    return { emi, total, interest: total - principal, principal };
  }, [price, downPayment, rate, tenure]);

  return (
    <div className="card form-grid" style={{ maxWidth: 700 }}>
      <label>
        Property Price (₹)
        <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} min="0" />
      </label>
      <label>
        Down Payment (₹)
        <input type="number" value={downPayment} onChange={(e) => setDownPayment(+e.target.value)} min="0" />
      </label>
      <label>
        Interest Rate (% p.a.)
        <input type="number" value={rate} onChange={(e) => setRate(+e.target.value)} min="0" step="0.1" />
      </label>
      <label>
        Loan Tenure (years)
        <input type="number" value={tenure} onChange={(e) => setTenure(+e.target.value)} min="1" max="30" />
      </label>

      <div className="span2" style={{ marginTop: 20, padding: 20, background: "var(--panel2)", borderRadius: 12, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>Estimated Monthly EMI</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "var(--accent)" }}>{money(Math.round(calc.emi))}</div>
      </div>

      <div className="span2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
        <div className="spec-card-item">
          <div className="spec-card-icon">💵</div>
          <div className="spec-card-label">Loan Amount</div>
          <div className="spec-card-value">{money(calc.principal)}</div>
        </div>
        <div className="spec-card-item">
          <div className="spec-card-icon">📊</div>
          <div className="spec-card-label">Total Interest</div>
          <div className="spec-card-value" style={{ color: "var(--err)" }}>{money(Math.round(calc.interest))}</div>
        </div>
        <div className="spec-card-item">
          <div className="spec-card-icon">💰</div>
          <div className="spec-card-label">Total Payment</div>
          <div className="spec-card-value">{money(Math.round(calc.total))}</div>
        </div>
      </div>
    </div>
  );
}

function AffordabilityCalculator() {
  const [income, setIncome] = useState(80000);
  const [existingEmi, setExistingEmi] = useState(10000);
  const [savings, setSavings] = useState(800000);
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const calc = useMemo(() => {
    const maxEmi = income * 0.4 - existingEmi;
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    if (monthlyRate === 0 || maxEmi <= 0) return { maxLoan: 0, maxProperty: savings, maxEmi: Math.max(0, maxEmi) };
    const maxLoan = maxEmi * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months));
    return { maxLoan, maxProperty: maxLoan + savings, maxEmi: Math.max(0, maxEmi) };
  }, [income, existingEmi, savings, rate, tenure]);

  return (
    <div className="card form-grid" style={{ maxWidth: 700 }}>
      <label>
        Monthly Income (₹)
        <input type="number" value={income} onChange={(e) => setIncome(+e.target.value)} min="0" />
      </label>
      <label>
        Existing EMI (₹)
        <input type="number" value={existingEmi} onChange={(e) => setExistingEmi(+e.target.value)} min="0" />
      </label>
      <label>
        Savings (₹)
        <input type="number" value={savings} onChange={(e) => setSavings(+e.target.value)} min="0" />
      </label>
      <label>
        Interest Rate (% p.a.)
        <input type="number" value={rate} onChange={(e) => setRate(+e.target.value)} min="0" step="0.1" />
      </label>

      <div className="span2" style={{ marginTop: 20, padding: 20, background: "var(--panel2)", borderRadius: 12, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>You can afford up to</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "var(--ok)" }}>{money(Math.round(calc.maxProperty))}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Max EMI: {money(Math.round(calc.maxEmi))}/month</div>
      </div>

      <div className="span2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 16 }}>
        <div className="spec-card-item">
          <div className="spec-card-icon">🏦</div>
          <div className="spec-card-label">Max Loan</div>
          <div className="spec-card-value">{money(Math.round(calc.maxLoan))}</div>
        </div>
        <div className="spec-card-item">
          <div className="spec-card-icon">💰</div>
          <div className="spec-card-label">Your Savings</div>
          <div className="spec-card-value">{money(savings)}</div>
        </div>
      </div>
    </div>
  );
}

function RentalYieldCalculator() {
  const [price, setPrice] = useState(8000000);
  const [rent, setRent] = useState(35000);

  const annualRent = rent * 12;
  const yieldPct = price > 0 ? ((annualRent / price) * 100).toFixed(2) : 0;

  return (
    <div className="card form-grid" style={{ maxWidth: 700 }}>
      <label>
        Property Price (₹)
        <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} min="0" />
      </label>
      <label>
        Monthly Rent (₹)
        <input type="number" value={rent} onChange={(e) => setRent(+e.target.value)} min="0" />
      </label>

      <div className="span2" style={{ marginTop: 20, padding: 20, background: "var(--panel2)", borderRadius: 12, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}>Gross Rental Yield</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: "var(--blue)" }}>{yieldPct}%</div>
      </div>

      <div className="span2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 16 }}>
        <div className="spec-card-item">
          <div className="spec-card-icon">📅</div>
          <div className="spec-card-label">Annual Rent</div>
          <div className="spec-card-value">{money(annualRent)}</div>
        </div>
        <div className="spec-card-item">
          <div className="spec-card-icon">📊</div>
          <div className="spec-card-label">Rent-to-Price</div>
          <div className="spec-card-value">{price > 0 ? (rent / price * 100).toFixed(2) : 0}%</div>
        </div>
      </div>
    </div>
  );
}
