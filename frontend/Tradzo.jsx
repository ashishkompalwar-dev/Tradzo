import { useState, useEffect, useRef } from "react";

// ─── Tiny mock data & helpers ─────────────────────────────────────────────────
const STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2847.50, change: 2.4,  sector: "Energy" },
  { symbol: "TCS",      name: "Tata Consultancy",    price: 3956.20, change: -0.8, sector: "IT" },
  { symbol: "INFY",     name: "Infosys",             price: 1456.80, change: 1.9,  sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank",           price: 1678.30, change: 0.5,  sector: "Banking" },
  { symbol: "WIPRO",    name: "Wipro",               price: 467.90,  change: -1.2, sector: "IT" },
  { symbol: "BAJFINANCE",name:"Bajaj Finance",       price: 6892.40, change: 3.1,  sector: "NBFC" },
];

const IPO_DATA = [
  { id:1, name:"Ola Electric Mobility", symbol:"OLAELEC", sector:"EV / Auto", status:"open",    priceMin:72,  priceMax:76,  lotSize:195, gmp:18,  subscribed:62.4, closeDate:"2025-08-09", rating:4, risk:"High",   logo:"⚡" },
  { id:2, name:"Swiggy Ltd",            symbol:"SWIGGY",  sector:"Foodtech", status:"upcoming", priceMin:371, priceMax:390, lotSize:38,  gmp:22,  subscribed:0,    closeDate:"2025-08-18", rating:3, risk:"High",   logo:"🛵" },
  { id:3, name:"Hyundai India",         symbol:"HYUNDAI", sector:"Auto",     status:"upcoming", priceMin:1865,priceMax:1960,lotSize:7,   gmp:8,   subscribed:0,    closeDate:"2025-08-25", rating:4, risk:"Medium", logo:"🚗" },
  { id:4, name:"NTPC Green Energy",     symbol:"NTPCGREEN",sector:"Energy",  status:"listed",   priceMin:102, priceMax:108, lotSize:138, gmp:5,   subscribed:98.3, closeDate:"2024-11-27", rating:4, risk:"Low",    logo:"🌱" },
];

const PORTFOLIO = [
  { symbol:"RELIANCE", name:"Reliance Industries", qty:10, avg:2650, current:2847.50, sector:"Energy" },
  { symbol:"TCS",      name:"Tata Consultancy",    qty:5,  avg:3800, current:3956.20, sector:"IT" },
  { symbol:"INFY",     name:"Infosys",             qty:20, avg:1300, current:1456.80, sector:"IT" },
  { symbol:"HDFCBANK", name:"HDFC Bank",           qty:15, avg:1550, current:1678.30, sector:"Banking" },
];

const RISK_QUESTIONS = [
  { id:1, q:"What is your investment horizon?", opts:[{t:"< 1 year",s:10},{t:"1–3 years",s:30},{t:"3–7 years",s:60},{t:"7+ years",s:100}] },
  { id:2, q:"If your portfolio fell 20% in a month, you would:", opts:[{t:"Sell everything",s:5},{t:"Sell some",s:25},{t:"Hold steady",s:60},{t:"Buy more",s:100}] },
  { id:3, q:"Your primary investment goal is:", opts:[{t:"Capital preservation",s:10},{t:"Regular income",s:30},{t:"Balanced growth",s:65},{t:"Maximum growth",s:100}] },
  { id:4, q:"What percentage of income do you invest?", opts:[{t:"< 5%",s:15},{t:"5–10%",s:35},{t:"10–20%",s:65},{t:"> 20%",s:100}] },
  { id:5, q:"Your investment knowledge level:", opts:[{t:"Beginner",s:10},{t:"Some knowledge",s:40},{t:"Experienced",s:70},{t:"Expert",s:100}] },
];

const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
const fmtCr = (n) => n >= 1e7 ? `₹${(n/1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(2)}L` : `₹${fmt(n)}`;

// ─── Sparkline SVG ─────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 40 }) {
  if (!data?.length) return null;
  const w = 100, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, color = "#6366f1" }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: "100%", background: color, borderRadius: "3px 3px 0 0", opacity: 0.85,
            height: `${(d.value / max) * 64}px`, transition: "height 0.5s ease" }} />
          <span style={{ fontSize: 9, color: "#94a3b8" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut Chart ───────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120 }) {
  const r = 40, cx = 60, cy = 60, circumference = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <svg viewBox="0 0 120 120" width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={16} />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
            strokeWidth={16} strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circumference}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.5s" }} />
        );
        offset += pct;
        return el;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#f1f5f9" fontSize={11} fontWeight={600}>{total}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize={8}>Allocated</text>
    </svg>
  );
}

// ─── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "demo@tradzo.in", password: "demo123" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: form.name || "Arjun Mehta", email: form.email });
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#040d1a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -200, right: -100, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>T</span>
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px" }}>Tradzo</span>
          </div>
          <p style={{ color: "#475569", fontSize: 14 }}>India's smartest investment platform</p>
        </div>

        {/* Card */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: 32 }}>
          <div style={{ display: "flex", background: "#1e293b", borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.2s",
                background: mode === m ? "#6366f1" : "transparent", color: mode === m ? "#fff" : "#64748b" }}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#64748b", marginBottom: 6, display: "block" }}>Full Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Arjun Mehta"
                style={{ width: "100%", padding: "12px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#64748b", marginBottom: 6, display: "block" }}>Email</label>
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" type="email"
              style={{ width: "100%", padding: "12px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: "#64748b", marginBottom: 6, display: "block" }}>Password</label>
            <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" type="password"
              style={{ width: "100%", padding: "12px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#4338ca" : "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "wait" : "pointer", transition: "all 0.2s" }}>
            {loading ? "Authenticating…" : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: "#475569", marginTop: 16 }}>
            Use demo@tradzo.in / demo123 to explore
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Overview ────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const totalInvested = PORTFOLIO.reduce((s, h) => s + h.qty * h.avg, 0);
  const currentValue  = PORTFOLIO.reduce((s, h) => s + h.qty * h.current, 0);
  const pnl = currentValue - totalInvested;
  const pnlPct = (pnl / totalInvested) * 100;

  const monthlyData = [
    { label: "Feb", value: 312000 }, { label: "Mar", value: 295000 }, { label: "Apr", value: 330000 },
    { label: "May", value: 318000 }, { label: "Jun", value: 348000 }, { label: "Jul", value: 362000 },
    { label: "Aug", value: currentValue }
  ];

  const allocation = [
    { label: "IT", value: 46, color: "#6366f1" },
    { label: "Energy", value: 26, color: "#10b981" },
    { label: "Banking", value: 22, color: "#f59e0b" },
    { label: "Other", value: 6, color: "#64748b" },
  ];

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 600, margin: 0 }}>Good morning, {user.name.split(" ")[0]} 👋</h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: "4px 0 0" }}>Here's how your investments are doing today</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Portfolio Value", value: fmtCr(currentValue), sub: `${pnlPct > 0 ? "+" : ""}${pnlPct.toFixed(2)}% all time`, color: "#10b981" },
          { label: "Total Invested",  value: fmtCr(totalInvested), sub: "Across 4 holdings", color: "#6366f1" },
          { label: "Total P&L",       value: `${pnl > 0 ? "+" : ""}${fmtCr(pnl)}`, sub: "Unrealised gains", color: pnl > 0 ? "#10b981" : "#f43f5e" },
          { label: "Today's Change",  value: "+₹4,382", sub: "+0.82% today", color: "#10b981" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "20px 22px" }}>
            <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</p>
            <p style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{c.value}</p>
            <p style={{ color: c.color, fontSize: 12, margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        {/* Portfolio Performance Chart */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 600, margin: 0 }}>Portfolio Performance</h3>
            <span style={{ background: "#10b981", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>+16.2%</span>
          </div>
          <BarChart data={monthlyData} color="#6366f1" />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
            <span style={{ color: "#475569", fontSize: 12 }}>Feb 2025</span>
            <span style={{ color: "#475569", fontSize: 12 }}>Aug 2025</span>
          </div>
        </div>

        {/* Allocation */}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
          <h3 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 600, margin: "0 0 20px" }}>Sector Allocation</h3>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <DonutChart segments={allocation} size={120} />
          </div>
          {allocation.map((seg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: seg.color }} />
                <span style={{ color: "#94a3b8", fontSize: 13 }}>{seg.label}</span>
              </div>
              <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{seg.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings Table */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24, marginTop: 20 }}>
        <h3 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 600, margin: "0 0 20px" }}>Holdings</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Stock", "Qty", "Avg Buy", "Current", "Invested", "Value", "P&L", "P&L %"].map(h => (
                <th key={h} style={{ color: "#475569", fontSize: 11, textAlign: "left", padding: "0 12px 12px 0", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {PORTFOLIO.map(h => {
                const inv = h.qty * h.avg, cur = h.qty * h.current, pnl = cur - inv, pct = (pnl/inv)*100;
                return (
                  <tr key={h.symbol} style={{ borderTop: "1px solid #1e293b" }}>
                    <td style={{ padding: "14px 12px 14px 0" }}>
                      <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 13 }}>{h.symbol}</div>
                      <div style={{ color: "#475569", fontSize: 11 }}>{h.name}</div>
                    </td>
                    <td style={{ color: "#94a3b8", fontSize: 13, padding: "0 12px 0 0" }}>{h.qty}</td>
                    <td style={{ color: "#94a3b8", fontSize: 13, padding: "0 12px 0 0" }}>₹{fmt(h.avg)}</td>
                    <td style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 500, padding: "0 12px 0 0" }}>₹{fmt(h.current)}</td>
                    <td style={{ color: "#94a3b8", fontSize: 13, padding: "0 12px 0 0" }}>₹{fmt(inv)}</td>
                    <td style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 500, padding: "0 12px 0 0" }}>₹{fmt(cur)}</td>
                    <td style={{ color: pnl > 0 ? "#10b981" : "#f43f5e", fontSize: 13, fontWeight: 600, padding: "0 12px 0 0" }}>{pnl > 0 ? "+" : ""}₹{fmt(pnl)}</td>
                    <td style={{ padding: "0 0 0 0" }}>
                      <span style={{ background: pct > 0 ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)", color: pct > 0 ? "#10b981" : "#f43f5e",
                        fontSize: 12, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>{pct > 0 ? "+" : ""}{pct.toFixed(2)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── IPO Section ───────────────────────────────────────────────────────────────
function IPOSection() {
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [checkPAN, setCheckPAN] = useState("");
  const [panResult, setPanResult] = useState(null);
  const [applying, setApplying] = useState(null);
  const [lots, setLots] = useState(1);

  const filtered = tab === "all" ? IPO_DATA : IPO_DATA.filter(i => i.status === tab);

  const handleApply = (ipo) => {
    setApplying(null);
    alert(`✅ Applied for ${ipo.name}!\n${lots} lot(s) × ₹${ipo.priceMax} × ${ipo.lotSize} shares\nTotal: ₹${(lots * ipo.lotSize * ipo.priceMax).toLocaleString("en-IN")}`);
  };

  const checkAllotment = () => {
    if (checkPAN.length !== 10) return alert("Enter valid 10-character PAN");
    setPanResult({ status: Math.random() > 0.5 ? "Allotted" : "Not Allotted", lots: 1, refund: 0 });
  };

  const statusColor = { open: "#10b981", upcoming: "#f59e0b", closed: "#64748b", listed: "#6366f1" };
  const statusBg    = { open: "rgba(16,185,129,0.12)", upcoming: "rgba(245,158,11,0.12)", closed: "rgba(100,116,139,0.12)", listed: "rgba(99,102,241,0.12)" };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>IPO Centre</h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Discover, analyse and apply for IPOs</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all","open","upcoming","listed"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 18px", borderRadius: 10, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s",
            background: tab === t ? "#6366f1" : "transparent", color: tab === t ? "#fff" : "#64748b", borderColor: tab === t ? "#6366f1" : "#1e293b" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* IPO Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 28 }}>
        {filtered.map(ipo => (
          <div key={ipo.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 22, cursor: "pointer", transition: "border-color 0.2s" }}
            onClick={() => setSelected(selected?.id === ipo.id ? null : ipo)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{ipo.logo}</div>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>{ipo.name}</div>
                  <div style={{ color: "#475569", fontSize: 11 }}>{ipo.sector}</div>
                </div>
              </div>
              <span style={{ background: statusBg[ipo.status], color: statusColor[ipo.status], fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, textTransform: "capitalize" }}>{ipo.status}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div><p style={{ color: "#475569", fontSize: 11, margin: "0 0 3px" }}>Price Band</p><p style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600, margin: 0 }}>₹{ipo.priceMin}–{ipo.priceMax}</p></div>
              <div><p style={{ color: "#475569", fontSize: 11, margin: "0 0 3px" }}>Lot Size</p><p style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600, margin: 0 }}>{ipo.lotSize} shares</p></div>
              <div><p style={{ color: "#475569", fontSize: 11, margin: "0 0 3px" }}>GMP</p><p style={{ color: "#10b981", fontSize: 13, fontWeight: 600, margin: 0 }}>+₹{ipo.gmp} ({((ipo.gmp/ipo.priceMax)*100).toFixed(1)}%)</p></div>
              <div><p style={{ color: "#475569", fontSize: 11, margin: "0 0 3px" }}>Subscribed</p><p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600, margin: 0 }}>{ipo.subscribed}x</p></div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {ipo.status === "open" && (
                <button onClick={e => { e.stopPropagation(); setApplying(ipo); }} style={{ flex: 1, padding: "9px 0", background: "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Apply Now
                </button>
              )}
              <button onClick={e => { e.stopPropagation(); setSelected(selected?.id === ipo.id ? null : ipo); }} style={{ flex: ipo.status === "open" ? "0 0 44px" : 1, padding: "9px 0", background: "#1e293b", border: "none", borderRadius: 10, color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>
                {selected?.id === ipo.id ? "▲" : "Details ▼"}
              </button>
            </div>

            {/* Expanded Details */}
            {selected?.id === ipo.id && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e293b" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["Risk", ipo.risk], ["Rating", "★".repeat(ipo.rating)], ["Close Date", ipo.closeDate], ["Min Investment", `₹${(ipo.lotSize * ipo.priceMax).toLocaleString("en-IN")}`]].map(([k,v]) => (
                    <div key={k}>
                      <p style={{ color: "#475569", fontSize: 11, margin: "0 0 2px" }}>{k}</p>
                      <p style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 500, margin: 0 }}>{v}</p>
                    </div>
                  ))}
                </div>
                {/* Subscription bars */}
                <div style={{ marginTop: 14 }}>
                  {[["QIB", 128.4],["NII", 47.2],["Retail", 12.8]].map(([cat, x]) => (
                    <div key={cat} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "#64748b", fontSize: 11 }}>{cat}</span>
                        <span style={{ color: "#f1f5f9", fontSize: 11, fontWeight: 600 }}>{x}x</span>
                      </div>
                      <div style={{ background: "#1e293b", borderRadius: 4, height: 5, overflow: "hidden" }}>
                        <div style={{ width: `${Math.min((x/200)*100, 100)}%`, height: "100%", background: "linear-gradient(90deg, #6366f1, #06b6d4)", borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {applying && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => setApplying(null)}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: 32, width: "100%", maxWidth: 380, margin: "0 16px" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 600, margin: "0 0 20px" }}>Apply for {applying.name}</h3>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Price Band</span>
                <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>₹{applying.priceMin}–₹{applying.priceMax}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>Lot Size</span>
                <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{applying.lotSize} shares/lot</span>
              </div>
            </div>
            <label style={{ color: "#64748b", fontSize: 12, marginBottom: 6, display: "block" }}>Number of Lots</label>
            <input type="number" min={1} max={14} value={lots} onChange={e => setLots(Number(e.target.value))}
              style={{ width: "100%", padding: "12px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#f1f5f9", fontSize: 16, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #1e293b", marginBottom: 20 }}>
              <span style={{ color: "#64748b", fontSize: 14 }}>Total Amount</span>
              <span style={{ color: "#10b981", fontSize: 16, fontWeight: 700 }}>₹{(lots * applying.lotSize * applying.priceMax).toLocaleString("en-IN")}</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setApplying(null)} style={{ flex: 1, padding: "12px", background: "#1e293b", border: "none", borderRadius: 12, color: "#64748b", fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleApply(applying)} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Apply →</button>
            </div>
          </div>
        </div>
      )}

      {/* Allotment Checker */}
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 24 }}>
        <h3 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>🔍 IPO Allotment Checker</h3>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={checkPAN} onChange={e => setCheckPAN(e.target.value.toUpperCase())} maxLength={10} placeholder="Enter PAN (e.g. ABCDE1234F)"
            style={{ flex: 1, padding: "12px 16px", background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "#f1f5f9", fontSize: 14, outline: "none" }} />
          <button onClick={checkAllotment} style={{ padding: "12px 20px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            Check
          </button>
        </div>
        {panResult && (
          <div style={{ marginTop: 16, padding: 16, background: panResult.status === "Allotted" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", border: `1px solid ${panResult.status === "Allotted" ? "#10b981" : "#f43f5e"}`, borderRadius: 12 }}>
            <p style={{ color: panResult.status === "Allotted" ? "#10b981" : "#f43f5e", fontWeight: 700, margin: "0 0 4px" }}>
              {panResult.status === "Allotted" ? "🎉 Congratulations! You got allotment." : "❌ Not allotted. Refund will be processed in 2-3 days."}
            </p>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>PAN: {checkPAN} | Status: {panResult.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Financial Tools ───────────────────────────────────────────────────────────
function FinancialTools() {
  const [tool, setTool] = useState("sip");

  // SIP
  const [sip, setSip] = useState({ amount: 5000, rate: 12, years: 10 });
  const sipFV = (() => {
    const r = sip.rate / 12 / 100, n = sip.years * 12;
    return sip.amount * ((Math.pow(1+r, n) - 1) / r) * (1+r);
  })();
  const sipInvested = sip.amount * sip.years * 12;

  // EMI
  const [emi, setEmi] = useState({ principal: 2500000, rate: 8.5, years: 20 });
  const emiMonthly = (() => {
    const r = emi.rate / 12 / 100, n = emi.years * 12;
    return (emi.principal * r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);
  })();

  // Compound
  const [comp, setComp] = useState({ principal: 100000, rate: 10, years: 10 });
  const compFinal = comp.principal * Math.pow(1 + comp.rate/100, comp.years);

  const tools = [
    { id: "sip", label: "SIP Calculator", icon: "📈" },
    { id: "emi", label: "EMI Calculator", icon: "🏠" },
    { id: "compound", label: "Compound Interest", icon: "💹" },
    { id: "risk", label: "Risk Assessment", icon: "🎯" },
  ];

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Financial Tools</h2>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Plan smarter with our calculators</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {tools.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
            background: tool === t.id ? "#6366f1" : "#0f172a", color: tool === t.id ? "#fff" : "#64748b", borderColor: tool === t.id ? "#6366f1" : "#1e293b" }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: 28 }}>
        {/* SIP Calculator */}
        {tool === "sip" && (
          <div>
            <h3 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 600, margin: "0 0 24px" }}>📈 SIP Return Calculator</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {[
                { label: "Monthly Investment", key: "amount", min: 500, max: 100000, step: 500, prefix: "₹" },
                { label: "Expected Annual Return", key: "rate", min: 1, max: 30, step: 0.5, suffix: "%" },
                { label: "Investment Duration", key: "years", min: 1, max: 30, step: 1, suffix: " yrs" },
              ].map(({ label, key, min, max, step, prefix = "", suffix = "" }) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ color: "#64748b", fontSize: 12 }}>{label}</label>
                    <span style={{ color: "#6366f1", fontSize: 13, fontWeight: 600 }}>{prefix}{fmt(sip[key])}{suffix}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={sip[key]}
                    onChange={e => setSip({...sip, [key]: Number(e.target.value)})}
                    style={{ width: "100%", accentColor: "#6366f1" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Total Invested", value: fmtCr(sipInvested), color: "#6366f1" },
                { label: "Estimated Returns", value: fmtCr(sipFV - sipInvested), color: "#10b981" },
                { label: "Future Value", value: fmtCr(sipFV), color: "#f59e0b" },
              ].map(c => (
                <div key={c.label} style={{ background: "#1e293b", borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ color: "#475569", fontSize: 11, margin: "0 0 6px" }}>{c.label}</p>
                  <p style={{ color: c.color, fontSize: 18, fontWeight: 700, margin: 0 }}>{c.value}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 14, background: "rgba(99,102,241,0.08)", borderRadius: 12, border: "1px solid rgba(99,102,241,0.2)" }}>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>💡 Your wealth grows <strong style={{ color: "#6366f1" }}>{((sipFV / sipInvested) - 1 * 100).toFixed(1)}×</strong> — returns of <strong style={{ color: "#10b981" }}>{fmtCr(sipFV - sipInvested)}</strong> on an investment of {fmtCr(sipInvested)}</p>
            </div>
          </div>
        )}

        {/* EMI Calculator */}
        {tool === "emi" && (
          <div>
            <h3 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 600, margin: "0 0 24px" }}>🏠 EMI Calculator</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {[
                { label: "Loan Amount", key: "principal", min: 100000, max: 10000000, step: 100000, prefix: "₹" },
                { label: "Interest Rate (Annual)", key: "rate", min: 5, max: 20, step: 0.1, suffix: "%" },
                { label: "Loan Tenure", key: "years", min: 1, max: 30, step: 1, suffix: " yrs" },
              ].map(({ label, key, min, max, step, prefix = "", suffix = "" }) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ color: "#64748b", fontSize: 12 }}>{label}</label>
                    <span style={{ color: "#6366f1", fontSize: 13, fontWeight: 600 }}>{prefix}{fmt(emi[key])}{suffix}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={emi[key]}
                    onChange={e => setEmi({...emi, [key]: Number(e.target.value)})}
                    style={{ width: "100%", accentColor: "#6366f1" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Monthly EMI", value: `₹${fmt(emiMonthly)}`, color: "#6366f1" },
                { label: "Total Interest", value: fmtCr(emiMonthly * emi.years * 12 - emi.principal), color: "#f43f5e" },
                { label: "Total Payment", value: fmtCr(emiMonthly * emi.years * 12), color: "#f59e0b" },
              ].map(c => (
                <div key={c.label} style={{ background: "#1e293b", borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ color: "#475569", fontSize: 11, margin: "0 0 6px" }}>{c.label}</p>
                  <p style={{ color: c.color, fontSize: 18, fontWeight: 700, margin: 0 }}>{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compound Interest */}
        {tool === "compound" && (
          <div>
            <h3 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 600, margin: "0 0 24px" }}>💹 Compound Interest Calculator</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
              {[
                { label: "Principal Amount", key: "principal", min: 1000, max: 1000000, step: 1000, prefix: "₹" },
                { label: "Annual Interest Rate", key: "rate", min: 1, max: 30, step: 0.5, suffix: "%" },
                { label: "Time Period", key: "years", min: 1, max: 40, step: 1, suffix: " yrs" },
              ].map(({ label, key, min, max, step, prefix = "", suffix = "" }) => (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ color: "#64748b", fontSize: 12 }}>{label}</label>
                    <span style={{ color: "#6366f1", fontSize: 13, fontWeight: 600 }}>{prefix}{fmt(comp[key])}{suffix}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={comp[key]}
                    onChange={e => setComp({...comp, [key]: Number(e.target.value)})}
                    style={{ width: "100%", accentColor: "#6366f1" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[
                { label: "Principal", value: fmtCr(comp.principal), color: "#6366f1" },
                { label: "Interest Earned", value: fmtCr(compFinal - comp.principal), color: "#10b981" },
                { label: "Maturity Amount", value: fmtCr(compFinal), color: "#f59e0b" },
              ].map(c => (
                <div key={c.label} style={{ background: "#1e293b", borderRadius: 12, padding: "16px 18px" }}>
                  <p style={{ color: "#475569", fontSize: 11, margin: "0 0 6px" }}>{c.label}</p>
                  <p style={{ color: c.color, fontSize: 18, fontWeight: 700, margin: 0 }}>{c.value}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 14, background: "rgba(16,185,129,0.08)", borderRadius: 12 }}>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>🚀 Rule of 72: At {comp.rate}% per annum, your money doubles every <strong style={{ color: "#10b981" }}>{(72/comp.rate).toFixed(1)} years</strong></p>
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        {tool === "risk" && <RiskAssessment />}
      </div>
    </div>
  );
}

function RiskAssessment() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const score = Object.values(answers).reduce((s, v) => s + v, 0) / RISK_QUESTIONS.length;
  const category = score < 35 ? "Conservative" : score < 70 ? "Moderate" : "Aggressive";

  const submit = () => {
    if (Object.keys(answers).length < RISK_QUESTIONS.length) return alert("Please answer all questions");
    setResult({ score, category });
  };

  const profiles = {
    Conservative: { emoji: "🛡️", equity: 30, debt: 60, gold: 10, color: "#06b6d4", desc: "You prefer safety. Focus on FDs, debt funds, and government bonds." },
    Moderate:     { emoji: "⚖️", equity: 60, debt: 30, gold: 10, color: "#6366f1", desc: "Balanced risk. Mix of equity mutual funds and stable debt instruments." },
    Aggressive:   { emoji: "🚀", equity: 80, debt: 15, gold: 5,  color: "#f59e0b", desc: "High risk tolerance. Direct stocks, small caps, and growth-focused funds." },
  };

  return (
    <div>
      <h3 style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 600, margin: "0 0 24px" }}>🎯 Investor Risk Profile</h3>
      {!result ? (
        <div>
          {RISK_QUESTIONS.map((q, qi) => (
            <div key={q.id} style={{ marginBottom: 22, padding: 18, background: "#1e293b", borderRadius: 14, border: answers[q.id] ? "1px solid #6366f1" : "1px solid transparent" }}>
              <p style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 500, margin: "0 0 14px" }}>{qi + 1}. {q.q}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {q.opts.map(opt => (
                  <button key={opt.t} onClick={() => setAnswers({...answers, [q.id]: opt.s})} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid", cursor: "pointer", fontSize: 13, textAlign: "left", transition: "all 0.15s",
                    background: answers[q.id] === opt.s ? "rgba(99,102,241,0.15)" : "transparent", color: answers[q.id] === opt.s ? "#6366f1" : "#94a3b8", borderColor: answers[q.id] === opt.s ? "#6366f1" : "#334155" }}>
                    {opt.t}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={submit} style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Analyse My Risk Profile →
          </button>
        </div>
      ) : (
        <div>
          <div style={{ textAlign: "center", padding: "24px 0", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{profiles[result.category].emoji}</div>
            <h3 style={{ color: profiles[result.category].color, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>{result.category} Investor</h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>{profiles[result.category].desc}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {[["Equity", profiles[result.category].equity, "#6366f1"], ["Debt", profiles[result.category].debt, "#10b981"], ["Gold", profiles[result.category].gold, "#f59e0b"]].map(([l, v, c]) => (
              <div key={l} style={{ background: "#1e293b", borderRadius: 12, padding: "16px", textAlign: "center" }}>
                <p style={{ color: c, fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{v}%</p>
                <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>{l}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { setResult(null); setAnswers({}); }} style={{ width: "100%", padding: 12, background: "#1e293b", border: "none", borderRadius: 12, color: "#64748b", fontSize: 14, cursor: "pointer" }}>Retake Assessment</button>
        </div>
      )}
    </div>
  );
}

// ─── Markets Screen ────────────────────────────────────────────────────────────
function Markets() {
  const [search, setSearch] = useState("");
  const sparkData = () => Array.from({ length: 12 }, (_, i) => 100 + Math.sin(i * 0.5) * 10 + Math.random() * 15);

  const filtered = STOCKS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.symbol.includes(search.toUpperCase()));

  return (
    <div>
      <h2 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>Markets</h2>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>Live market data and watchlist</p>

      {/* Index Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { name: "NIFTY 50", value: "24,622.15", change: "+0.47%", up: true },
          { name: "SENSEX",   value: "80,674.48", change: "+0.52%", up: true },
          { name: "NIFTY IT", value: "39,412.80", change: "-0.31%", up: false },
          { name: "NIFTY BANK",value:"52,180.35",change: "+0.18%", up: true },
        ].map(idx => (
          <div key={idx.name} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: "16px 18px" }}>
            <p style={{ color: "#475569", fontSize: 11, margin: "0 0 6px", textTransform: "uppercase" }}>{idx.name}</p>
            <p style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>{idx.value}</p>
            <span style={{ color: idx.up ? "#10b981" : "#f43f5e", fontSize: 12, fontWeight: 600 }}>{idx.change}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search stocks..."
        style={{ width: "100%", padding: "12px 18px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, color: "#f1f5f9", fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none" }} />

      {/* Stock List */}
      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map(stock => {
          const spark = sparkData();
          return (
            <div key={stock.symbol} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#6366f1", fontSize: 12, flexShrink: 0 }}>
                {stock.symbol.slice(0, 2)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "#f1f5f9", fontSize: 13 }}>{stock.symbol}</div>
                <div style={{ color: "#475569", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stock.name}</div>
              </div>
              <div style={{ width: 80, flexShrink: 0 }}>
                <Sparkline data={spark} color={stock.change > 0 ? "#10b981" : "#f43f5e"} height={32} />
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>₹{fmt(stock.price)}</div>
                <span style={{ color: stock.change > 0 ? "#10b981" : "#f43f5e", fontSize: 12, fontWeight: 600 }}>{stock.change > 0 ? "+" : ""}{stock.change}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main App Shell ────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [notifOpen, setNotifOpen] = useState(false);

  const NOTIFS = [
    { id:1, type:"ipo",   title:"Ola Electric IPO Open!", msg:"Apply before Aug 9. Price band ₹72–₹76", time:"2h ago",  read:false },
    { id:2, type:"alert", title:"RELIANCE crossed ₹2850",  msg:"Your price alert was triggered",         time:"4h ago",  read:false },
    { id:3, type:"portfolio",title:"Portfolio up 2.4%",   msg:"Your portfolio gained ₹8,432 today",     time:"Today",   read:true  },
  ];

  const unread = NOTIFS.filter(n => !n.read).length;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "markets",   label: "Markets",   icon: "📊" },
    { id: "ipo",       label: "IPO",        icon: "🏛" },
    { id: "tools",     label: "Tools",      icon: "🔧" },
  ];

  if (!user) return <AuthScreen onLogin={(u) => setUser(u)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#040d1a", fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9" }}>
      {/* Sidebar (desktop) / Bottom nav (mobile) */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#080f1e", borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", padding: "24px 16px", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 28px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #6366f1, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>T</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px" }}>Tradzo</span>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1 }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 12, border: "none", cursor: "pointer", marginBottom: 4, transition: "all 0.15s", textAlign: "left",
                background: tab === item.id ? "rgba(99,102,241,0.12)" : "transparent", color: tab === item.id ? "#6366f1" : "#475569" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: tab === item.id ? 600 : 400 }}>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User */}
          <div style={{ padding: "16px 12px", borderTop: "1px solid #1e293b" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff" }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
                <div style={{ color: "#334155", fontSize: 11 }}>Moderate</div>
              </div>
              <button onClick={() => setUser(null)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: 14 }} title="Logout">⏏</button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {/* Top Bar */}
          <div style={{ background: "#080f1e", borderBottom: "1px solid #1e293b", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
            <div>
              <span style={{ color: "#475569", fontSize: 13 }}>/</span>
              <span style={{ color: "#94a3b8", fontSize: 13, marginLeft: 4 }}>{navItems.find(n => n.id === tab)?.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: "#1e293b", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "#94a3b8", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  🔔
                </button>
                {unread > 0 && <span style={{ position: "absolute", top: -3, right: -3, background: "#f43f5e", color: "#fff", fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div style={{ position: "absolute", top: 44, right: 0, width: 320, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.5)", zIndex: 100 }}>
                    <div style={{ padding: "16px 18px", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>Notifications</span>
                      <span style={{ background: "#f43f5e", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{unread} new</span>
                    </div>
                    {NOTIFS.map(n => (
                      <div key={n.id} style={{ padding: "14px 18px", borderBottom: "1px solid #0f172a", background: n.read ? "transparent" : "rgba(99,102,241,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ color: "#f1f5f9", fontSize: 13, fontWeight: n.read ? 400 : 600 }}>{n.title}</span>
                          <span style={{ color: "#334155", fontSize: 11 }}>{n.time}</span>
                        </div>
                        <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>{n.msg}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div style={{ padding: 28, maxWidth: 1100 }}>
            {tab === "dashboard" && <Dashboard user={user} />}
            {tab === "markets"   && <Markets />}
            {tab === "ipo"       && <IPOSection />}
            {tab === "tools"     && <FinancialTools />}
          </div>
        </div>
      </div>
    </div>
  );
}
