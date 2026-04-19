/* Tradzo Vanilla Frontend (no React)
   - Single-file state + render
   - Uses the same mock data as Tradzo.jsx
*/

// ─── Mock data ────────────────────────────────────────────────────────────────
const STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2847.5, change: 2.4, sector: "Energy" },
  { symbol: "TCS", name: "Tata Consultancy", price: 3956.2, change: -0.8, sector: "IT" },
  { symbol: "INFY", name: "Infosys", price: 1456.8, change: 1.9, sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1678.3, change: 0.5, sector: "Banking" },
  { symbol: "WIPRO", name: "Wipro", price: 467.9, change: -1.2, sector: "IT" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 6892.4, change: 3.1, sector: "NBFC" },
];

const IPO_DATA = [
  { id: 1, name: "Ola Electric Mobility", symbol: "OLAELEC", sector: "EV / Auto", status: "open", priceMin: 72, priceMax: 76, lotSize: 195, gmp: 18, subscribed: 62.4, closeDate: "2025-08-09", rating: 4, risk: "High", logo: "⚡" },
  { id: 2, name: "Swiggy Ltd", symbol: "SWIGGY", sector: "Foodtech", status: "upcoming", priceMin: 371, priceMax: 390, lotSize: 38, gmp: 22, subscribed: 0, closeDate: "2025-08-18", rating: 3, risk: "High", logo: "🛵" },
  { id: 3, name: "Hyundai India", symbol: "HYUNDAI", sector: "Auto", status: "upcoming", priceMin: 1865, priceMax: 1960, lotSize: 7, gmp: 8, subscribed: 0, closeDate: "2025-08-25", rating: 4, risk: "Medium", logo: "🚗" },
  { id: 4, name: "NTPC Green Energy", symbol: "NTPCGREEN", sector: "Energy", status: "listed", priceMin: 102, priceMax: 108, lotSize: 138, gmp: 5, subscribed: 98.3, closeDate: "2024-11-27", rating: 4, risk: "Low", logo: "🌱" },
];

const PORTFOLIO = [
  { symbol: "RELIANCE", name: "Reliance Industries", qty: 10, avg: 2650, current: 2847.5, sector: "Energy" },
  { symbol: "TCS", name: "Tata Consultancy", qty: 5, avg: 3800, current: 3956.2, sector: "IT" },
  { symbol: "INFY", name: "Infosys", qty: 20, avg: 1300, current: 1456.8, sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank", qty: 15, avg: 1550, current: 1678.3, sector: "Banking" },
];

const RISK_QUESTIONS = [
  { id: 1, q: "What is your investment horizon?", opts: [{ t: "< 1 year", s: 10 }, { t: "1–3 years", s: 30 }, { t: "3–7 years", s: 60 }, { t: "7+ years", s: 100 }] },
  { id: 2, q: "If your portfolio fell 20% in a month, you would:", opts: [{ t: "Sell everything", s: 5 }, { t: "Sell some", s: 25 }, { t: "Hold steady", s: 60 }, { t: "Buy more", s: 100 }] },
  { id: 3, q: "Your primary investment goal is:", opts: [{ t: "Capital preservation", s: 10 }, { t: "Regular income", s: 30 }, { t: "Balanced growth", s: 65 }, { t: "Maximum growth", s: 100 }] },
  { id: 4, q: "What percentage of income do you invest?", opts: [{ t: "< 5%", s: 15 }, { t: "5–10%", s: 35 }, { t: "10–20%", s: 65 }, { t: "> 20%", s: 100 }] },
  { id: 5, q: "Your investment knowledge level:", opts: [{ t: "Beginner", s: 10 }, { t: "Some knowledge", s: 40 }, { t: "Experienced", s: 70 }, { t: "Expert", s: 100 }] },
];

const DEMO_EMAIL = "demo@tradzo.in";
const DEMO_PASSWORD = "demo123";
const DEMO_TOKEN = "demo-local-session-token";
const DEMO_STARTING_CASH = 500000;

function createDemoWallet() {
  return {
    cash: DEMO_STARTING_CASH,
    holdings: [],
    history: [],
    form: {
      symbol: STOCKS[0]?.symbol || "",
      quantity: 1,
    },
    error: "",
    success: "",
  };
}

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  initializing: true,
  user: null,
  tab: "dashboard",
  notifOpen: false,
  auth: {
    mode: "login",
    name: "",
    email: "",
    password: "",
    loading: false,
    error: "",
  },
  demo: createDemoWallet(),
  chatbot: {
    input: "",
    loading: false,
    error: "",
    messages: [
      {
        role: "assistant",
        text: "Namaste! I am your Indian stock market assistant. Ask me for tips on SIP, risk management, sector rotation, stock analysis checklist, or beginner-friendly investing habits.",
        time: new Date().toLocaleTimeString(),
      },
    ],
    quickPrompts: [
      "How should a beginner start investing in Indian stocks?",
      "Give me a checklist before buying a stock in NSE.",
      "How do I manage risk in a volatile market?",
      "What is a good long-term SIP discipline strategy?",
    ],
  },
  profile: {
    loading: false,
    error: "",
    success: "",
    form: {
      name: "",
      phone: "",
    },
  },
  portfolio: {
    loading: false,
    error: "",
    summary: { totalInvested: 0, currentValue: 0, totalPnl: 0, totalPnlPercent: 0, totalHoldings: 0, totalQuantity: 0 },
    holdings: [],
    transactions: [],
    form: {
      mode: "buy",
      symbol: "",
      name: "",
      sector: "Other",
      quantity: 1,
      price: 0,
    },
  },
  markets: { search: "" },
  ipo: { tab: "all", selectedId: null, applyingId: null, lots: 1, checkPAN: "", panResult: null },
  tools: {
    tool: "sip",
    sip: { amount: 5000, rate: 12, years: 10 },
    emi: { principal: 2500000, rate: 8.5, years: 20 },
    loanEmi: { principal: 1200000, rate: 9.2, years: 7 },
    monthly: { amount: 6000, rate: 11, months: 120 },
    lumpsum: { principal: 250000, rate: 11, years: 12 },
    comp: { principal: 100000, rate: 10, years: 10 },
    retirement: {
      currentAge: 30,
      retirementAge: 60,
      lifeExpectancy: 85,
      monthlyExpenseToday: 50000,
      inflationRate: 6,
      preRetirementReturn: 12,
      postRetirementReturn: 8,
    },
    swp: { corpus: 10000000, withdrawal: 50000, rate: 8, years: 25 },
    risk: { answers: {}, result: null },
  },
  notifs: [
    { id: 1, type: "ipo", title: "Ola Electric IPO Open!", msg: "Apply before Aug 9. Price band ₹72–₹76", time: "2h ago", read: false },
    { id: 2, type: "alert", title: "RELIANCE crossed ₹2850", msg: "Your price alert was triggered", time: "4h ago", read: false },
    { id: 3, type: "portfolio", title: "Portfolio up 2.4%", msg: "Your portfolio gained ₹8,432 today", time: "Today", read: true },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const root = document.getElementById("app");
const API_BASE = "http://localhost:5000/api";
const TOKEN_KEY = "tradzo_token";

function createDemoUser() {
  return {
    id: "demo-user",
    name: "Demo Investor",
    email: DEMO_EMAIL,
    phone: "",
    isDemo: true,
  };
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function parseApiError(error, fallback) {
  if (error?.message) return error.message;
  return fallback;
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

async function loadPortfolioData() {
  setState((s) => {
    s.portfolio.loading = true;
    s.portfolio.error = "";
  });

  try {
    const [summaryRes, holdingsRes, txRes] = await Promise.all([
      apiRequest("/portfolio/summary"),
      apiRequest("/portfolio/holdings"),
      apiRequest("/portfolio/transactions?limit=10"),
    ]);

    setState((s) => {
      s.portfolio.summary = summaryRes.summary || s.portfolio.summary;
      s.portfolio.holdings = holdingsRes.holdings || [];
      s.portfolio.transactions = txRes.transactions || [];
      s.portfolio.loading = false;
    });
  } catch (error) {
    setState((s) => {
      s.portfolio.loading = false;
      s.portfolio.error = parseApiError(error, "Could not load portfolio data");
    });
  }
}

async function sendChatMessage(rawMessage) {
  const message = String(rawMessage || "").trim();
  if (!message || state.chatbot.loading) return;

  const stamp = new Date().toLocaleTimeString();
  setState((s) => {
    s.chatbot.messages.push({ role: "user", text: message, time: stamp });
    s.chatbot.messages = s.chatbot.messages.slice(-40);
    s.chatbot.input = "";
    s.chatbot.loading = true;
    s.chatbot.error = "";
  });

  try {
    const context = {
      name: state.user?.name || "Investor",
      demoMode: Boolean(state.user?.isDemo),
      riskProfile: state.tools?.risk?.result?.category || "Unknown",
      holdingsCount: state.portfolio?.summary?.totalHoldings || 0,
      totalInvested: state.portfolio?.summary?.totalInvested || 0,
    };

    const result = await apiRequest("/chatbot/suggest", {
      method: "POST",
      body: {
        message,
        context,
      },
    });

    setState((s) => {
      s.chatbot.loading = false;
      s.chatbot.error = "";
      s.chatbot.messages.push({
        role: "assistant",
        text: result.reply || "I could not generate suggestions right now.",
        time: new Date().toLocaleTimeString(),
      });
      s.chatbot.messages = s.chatbot.messages.slice(-40);
    });
  } catch (error) {
    setState((s) => {
      s.chatbot.loading = false;
      s.chatbot.error = parseApiError(error, "Unable to fetch AI suggestions");
      s.chatbot.messages.push({
        role: "assistant",
        text: "I could not connect to Gemini right now. Please ensure GEMINI_API_KEY is set in backend .env and try again.",
        time: new Date().toLocaleTimeString(),
      });
      s.chatbot.messages = s.chatbot.messages.slice(-40);
    });
  }
}

async function initializeSession() {
  const token = getToken();
  if (!token) {
    setState((s) => {
      s.initializing = false;
    });
    return;
  }

  if (token === DEMO_TOKEN) {
    const demoUser = createDemoUser();
    setState((s) => {
      s.user = demoUser;
      s.initializing = false;
      s.profile.form.name = demoUser.name;
      s.profile.form.phone = demoUser.phone;
      s.profile.error = "";
      s.profile.success = "";
      s.demo = createDemoWallet();
    });
    return;
  }

  try {
    const me = await apiRequest("/auth/me");
    setState((s) => {
      s.user = me.user;
      s.initializing = false;
      s.profile.form.name = me.user?.name || "";
      s.profile.form.phone = me.user?.phone || "";
      s.profile.error = "";
      s.profile.success = "";
    });
    await loadPortfolioData();
  } catch (error) {
    clearToken();
    setState((s) => {
      s.user = null;
      s.initializing = false;
    });
  }
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escMultiline(s) {
  return esc(s).replaceAll("\n", "<br>");
}

function fmt(n) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
}

function fmtCr(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${fmt(n)}`;
}

function unreadCount() {
  return state.notifs.filter((n) => !n.read).length;
}

function setState(mutator) {
  const active = document.activeElement;
  const shouldPreserve = active && root.contains(active);
  const bind = shouldPreserve ? active.getAttribute?.("data-bind") : null;
  const selectionStart = shouldPreserve && typeof active.selectionStart === "number" ? active.selectionStart : null;
  const selectionEnd = shouldPreserve && typeof active.selectionEnd === "number" ? active.selectionEnd : null;

  mutator(state);
  render();

  if (bind) {
    const safeBind = String(bind).replace(/"/g, "\\\"");
    const next = root.querySelector(`[data-bind="${safeBind}"]`);
    if (next && document.activeElement !== next) {
      next.focus({ preventScroll: true });
      if (selectionStart !== null && selectionEnd !== null && typeof next.setSelectionRange === "function") {
        const len = String(next.value || "").length;
        next.setSelectionRange(Math.min(selectionStart, len), Math.min(selectionEnd, len));
      }
    }
  }
}

function sparkData() {
  return Array.from({ length: 12 }, (_, i) => 100 + Math.sin(i * 0.5) * 10 + Math.random() * 15);
}

function sparklineSVG(data, color, height = 32) {
  if (!data?.length) return "";
  const w = 100;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return `
    <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:${h}px">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
  `;
}

function donutSVG(segments, size = 120) {
  const r = 40;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;

  const segCircles = segments
    .map((seg) => {
      const pct = seg.value / total;
      const dash = pct * circumference;
      const gap = circumference - dash;
      const circle = `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}"
          stroke-width="16" stroke-dasharray="${dash} ${gap}"
          stroke-dashoffset="${-offset * circumference}"
          style="transform:rotate(-90deg);transform-origin:50% 50%;transition:stroke-dasharray .5s"></circle>
      `;
      offset += pct;
      return circle;
    })
    .join("");

  return `
    <svg viewBox="0 0 120 120" width="${size}" height="${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1e293b" stroke-width="16"></circle>
      ${segCircles}
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="600">${Math.round(total)}%</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="#64748b" font-size="8">Allocated</text>
    </svg>
  `;
}

function barChartHTML(data, color = "#6366f1") {
  const max = Math.max(...data.map((d) => d.value), 1);
  const cols = data
    .map(
      (d) => `
        <div class="barCol">
          <div class="bar" style="background:${color};height:${(d.value / max) * 64}px"></div>
          <span class="barLbl">${esc(d.label)}</span>
        </div>
      `,
    )
    .join("");

  return `<div class="bars">${cols}</div>`;
}

function pageTitleHTML(title, subtitle) {
  return `
    <div style="margin-bottom:24px">
      <h2 class="h2">${esc(title)}</h2>
      <p class="pMuted">${esc(subtitle)}</p>
    </div>
  `;
}

// ─── Views ────────────────────────────────────────────────────────────────────
function authView() {
  const { mode, name, email, password, loading, error } = state.auth;

  return `
    <div class="authShell">
      <div class="glow1"></div>
      <div class="glow2"></div>

      <div class="authWrap">
        <div class="authLogo">
          <div class="authBrand">
            <div class="authMark">T</div>
            <span class="authName">Tradzo</span>
          </div>
          <p class="authTag">India's smartest investment platform</p>
        </div>

        <div class="authCard">
          <div class="switch">
            <button class="switchBtn ${mode === "login" ? "active" : ""}" data-action="auth:setMode" data-mode="login">Sign In</button>
            <button class="switchBtn ${mode === "signup" ? "active" : ""}" data-action="auth:setMode" data-mode="signup">Sign Up</button>
          </div>

          ${mode === "signup"
            ? `
              <div style="margin-bottom:16px">
                <label class="label">Full Name</label>
                <input class="input small" data-bind="auth.name" value="${esc(name)}" placeholder="Arjun Mehta" />
              </div>
            `
            : ""}

          <div style="margin-bottom:16px">
            <label class="label">Email</label>
            <input class="input small" data-bind="auth.email" value="${esc(email)}" placeholder="you@example.com" type="email" />
          </div>

          <div style="margin-bottom:24px">
            <label class="label">Password</label>
            <input class="input small" data-bind="auth.password" value="${esc(password)}" placeholder="••••••••" type="password" />
          </div>

          <button class="btnPrimary big" data-action="auth:submit" ${loading ? "disabled" : ""} style="${loading ? "opacity:.9;cursor:wait" : ""}">
            ${loading ? "Authenticating…" : mode === "login" ? "Sign In →" : "Create Account →"}
          </button>

          <button class="btnSecondary med" style="width:100%;margin-top:10px" data-action="auth:useDemo">Use Demo Credentials</button>

          ${error
            ? `<p class="authHint" style="color:var(--red)">${esc(error)}</p>`
            : `<p class="authHint">Demo login: <b>${DEMO_EMAIL}</b> / <b>${DEMO_PASSWORD}</b></p>`}
        </div>
      </div>
    </div>
  `;
}

function shellView() {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "markets", label: "Markets", icon: "📊" },
    { id: "demo", label: "Demo Shares", icon: "🪙" },
    { id: "chatbot", label: "AI Chatbot", icon: "🤖" },
    { id: "ipo", label: "IPO", icon: "🏛" },
    { id: "tools", label: "Tools", icon: "🔧" },
  ];
  const crumb = navItems.find((n) => n.id === state.tab)?.label || "";

  return `
    <div class="appShell">
      <aside class="sidebar">
        <div class="logoRow">
          <div class="logoMark">T</div>
          <div class="logoText">Tradzo</div>
        </div>

        <nav class="nav">
          ${navItems
            .map(
              (item) => `
              <button class="navBtn ${state.tab === item.id ? "active" : ""}" data-action="nav:tab" data-tab="${item.id}">
                <span class="navIcon">${esc(item.icon)}</span>
                <span class="navLabel" style="font-weight:${state.tab === item.id ? 600 : 400}">${esc(item.label)}</span>
              </button>
            `,
            )
            .join("")}
        </nav>

        <div class="userBox">
          <div class="userRow">
            <div class="avatar">${esc(state.user?.name?.charAt(0) || "U")}</div>
            <div class="userMeta">
              <div class="userName">${esc(state.user?.name || "")}</div>
              <div class="userTag">Moderate</div>
            </div>
            <button class="logoutBtn" title="Logout" data-action="auth:logout">⏏</button>
          </div>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div class="crumb"><span>/</span><span>${esc(crumb)}</span></div>
          <div class="topbarActions">
            <div class="notifWrap">
              <button class="iconBtn" data-action="notif:toggle" aria-label="Notifications">🔔</button>
              ${unreadCount() > 0 ? `<span class="badge">${unreadCount()}</span>` : ""}
              ${state.notifOpen ? notifDropdown() : ""}
            </div>
          </div>
        </header>

        <section class="page">
          ${state.tab === "dashboard" ? dashboardView() : ""}
          ${state.tab === "markets" ? marketsView() : ""}
          ${state.tab === "demo" ? demoSharesView() : ""}
          ${state.tab === "chatbot" ? chatbotView() : ""}
          ${state.tab === "ipo" ? ipoView() : ""}
          ${state.tab === "tools" ? toolsView() : ""}
        </section>
      </main>
    </div>
  `;
}

function notifDropdown() {
  return `
    <div class="dropdown" data-action="noop">
      <div class="dropHeader">
        <span class="dropTitle">Notifications</span>
        <span class="pill">${unreadCount()} new</span>
      </div>
      ${state.notifs
        .map(
          (n) => `
          <div class="dropItem ${n.read ? "" : "unread"}">
            <div class="dropRow">
              <span class="dropItemTitle ${n.read ? "" : "bold"}">${esc(n.title)}</span>
              <span class="dropTime">${esc(n.time)}</span>
            </div>
            <p class="dropMsg">${esc(n.msg)}</p>
          </div>
        `,
        )
        .join("")}
      <div style="padding:12px 18px">
        <button class="btnSecondary med" style="width:100%" data-action="notif:markAllRead">Mark all read</button>
      </div>
    </div>
  `;
}

function dashboardView() {
  const totalInvested = state.portfolio.summary.totalInvested || 0;
  const currentValue = state.portfolio.summary.currentValue || 0;
  const pnl = state.portfolio.summary.totalPnl || 0;
  const pnlPct = state.portfolio.summary.totalPnlPercent || 0;
  const totalHoldings = state.portfolio.summary.totalHoldings || 0;

  const monthlyData = [
    { label: "Feb", value: 312000 },
    { label: "Mar", value: 295000 },
    { label: "Apr", value: 330000 },
    { label: "May", value: 318000 },
    { label: "Jun", value: 348000 },
    { label: "Jul", value: 362000 },
    { label: "Aug", value: currentValue },
  ];

  const allocation = [
    { label: "IT", value: 40, color: "#6366f1" },
    { label: "Energy", value: 25, color: "#10b981" },
    { label: "Banking", value: 20, color: "#f59e0b" },
    { label: "Other", value: 15, color: "#64748b" },
  ];

  const pf = state.portfolio.form;
  const profile = state.profile.form;
  const modeLabel = pf.mode === "buy" ? "Buy" : "Sell";

  const txRows = state.portfolio.transactions
    .slice(0, 6)
    .map((tx) => {
      const positive = tx.type === "BUY";
      return `
        <tr>
          <td class="tdStrong">${esc(tx.symbol)}</td>
          <td class="tdMuted">${esc(tx.type)}</td>
          <td class="tdMuted">${fmt(tx.quantity)}</td>
          <td class="tdMuted">₹${fmt(tx.price)}</td>
          <td style="color:${positive ? "var(--green)" : "var(--amber)"};font-size:13px;font-weight:600">₹${fmt(tx.amount)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <div>
      <div style="margin-bottom:28px">
        <h2 class="h2">Good morning, ${esc((state.user?.name || "Investor").split(" ")[0])} 👋</h2>
        <p class="pMuted">Here's how your investments are doing today</p>
      </div>

      <div class="gridCards">
        ${[
          { label: "Portfolio Value", value: fmtCr(currentValue), sub: `${pnlPct > 0 ? "+" : ""}${pnlPct.toFixed(2)}% all time`, color: "var(--green)" },
          { label: "Total Invested", value: fmtCr(totalInvested), sub: `Across ${totalHoldings} holdings`, color: "var(--indigo)" },
          { label: "Total P&L", value: `${pnl > 0 ? "+" : ""}${fmtCr(pnl)}`, sub: "Unrealised gains", color: pnl > 0 ? "var(--green)" : "var(--red)" },
          { label: "Status", value: state.portfolio.loading ? "Syncing…" : "Synced", sub: state.portfolio.loading ? "Updating from MongoDB" : "Live portfolio snapshot", color: state.portfolio.loading ? "var(--amber)" : "var(--green)" },
        ]
          .map(
            (c) => `
            <div class="statCard">
              <p class="statLabel">${esc(c.label)}</p>
              <p class="statValue">${esc(c.value)}</p>
              <p class="statSub" style="color:${c.color}">${esc(c.sub)}</p>
            </div>
          `,
          )
          .join("")}
      </div>

      <div class="split">
        <div class="card pad">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h3 style="margin:0;font-size:15px;font-weight:600">Portfolio Performance</h3>
            <span class="kpiPill">+16.2%</span>
          </div>
          ${barChartHTML(monthlyData, "#6366f1")}
          <div style="display:flex;justify-content:space-between;margin-top:16px">
            <span style="color:var(--muted2);font-size:12px">Feb 2025</span>
            <span style="color:var(--muted2);font-size:12px">Aug 2025</span>
          </div>
        </div>

        <div class="card pad">
          <h3 style="margin:0 0 20px;font-size:15px;font-weight:600">Sector Allocation</h3>
          <div style="display:flex;justify-content:center;margin-bottom:20px">
            ${donutSVG(allocation, 120)}
          </div>
          ${allocation
            .map(
              (seg) => `
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:10px;height:10px;border-radius:2px;background:${seg.color}"></div>
                  <span style="color:#94a3b8;font-size:13px">${esc(seg.label)}</span>
                </div>
                <span style="color:var(--text);font-size:13px;font-weight:600">${seg.value}%</span>
              </div>
            `,
            )
            .join("")}
        </div>
      </div>

      <div class="card pad" style="margin-top:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;flex-wrap:wrap">
          <h3 style="margin:0;font-size:15px;font-weight:600">Portfolio Management</h3>
          <div style="display:flex;gap:8px">
            <button class="tabBtn ${pf.mode === "buy" ? "active" : ""}" data-action="portfolio:setMode" data-mode="buy">Buy</button>
            <button class="tabBtn ${pf.mode === "sell" ? "active" : ""}" data-action="portfolio:setMode" data-mode="sell">Sell</button>
            <button class="btnSecondary med" data-action="portfolio:refresh">Refresh</button>
          </div>
        </div>

        ${state.portfolio.error ? `<p class="pMuted" style="color:var(--red);margin-bottom:12px">${esc(state.portfolio.error)}</p>` : ""}

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
          <input class="input small" data-bind="portfolio.symbol" value="${esc(pf.symbol)}" placeholder="Symbol (e.g. TCS)" />
          <input class="input small" data-bind="portfolio.name" value="${esc(pf.name)}" placeholder="Stock name" ${pf.mode === "sell" ? "disabled" : ""} />
          <input class="input small" data-bind="portfolio.sector" value="${esc(pf.sector)}" placeholder="Sector" ${pf.mode === "sell" ? "disabled" : ""} />
          <input class="input small" data-bind="portfolio.quantity" type="number" min="1" step="1" value="${pf.quantity}" placeholder="Quantity" />
          <input class="input small" data-bind="portfolio.price" type="number" min="0" step="0.01" value="${pf.price}" placeholder="Price" />
          <button class="btnPrimary med" data-action="portfolio:submit">${modeLabel} Transaction</button>
        </div>
      </div>

      <div class="card pad" style="margin-top:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;flex-wrap:wrap">
          <h3 style="margin:0;font-size:15px;font-weight:600">Account Details</h3>
          <button class="btnPrimary med" data-action="profile:save" ${state.profile.loading ? "disabled" : ""}>
            ${state.profile.loading ? "Saving…" : "Save Details"}
          </button>
        </div>
        ${state.profile.error ? `<p class="pMuted" style="color:var(--red);margin-bottom:10px">${esc(state.profile.error)}</p>` : ""}
        ${state.profile.success ? `<p class="pMuted" style="color:var(--green);margin-bottom:10px">${esc(state.profile.success)}</p>` : ""}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          <input class="input small" data-bind="profile.name" value="${esc(profile.name)}" placeholder="Full name" />
          <input class="input small" data-bind="profile.phone" value="${esc(profile.phone)}" placeholder="Phone" />
          <input class="input small" value="${esc(state.user?.email || "")}" placeholder="Email" disabled />
        </div>
      </div>

      <div class="card pad" style="margin-top:20px">
        <h3 style="margin:0 0 20px;font-size:15px;font-weight:600">Holdings</h3>
        <div class="tableWrap">
          <table>
            <thead>
              <tr>
                ${["Stock", "Qty", "Avg Buy", "Current", "Invested", "Value", "P&L", "P&L %"]
                  .map((h) => `<th>${esc(h)}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${state.portfolio.holdings.length === 0
                ? `
                <tr>
                  <td colspan="8" class="tdMuted" style="text-align:center;padding:24px">No holdings yet. Add your first buy transaction above.</td>
                </tr>
              `
                : state.portfolio.holdings.map((h) => {
                const inv = h.invested;
                const cur = h.currentValue;
                const p = cur - inv;
                const pct = (p / inv) * 100;
                const up = pct > 0;
                const bg = up ? "rgba(16,185,129,0.12)" : "rgba(244,63,94,0.12)";
                const col = up ? "var(--green)" : "var(--red)";
                return `
                  <tr>
                    <td>
                      <div class="sym">${esc(h.symbol)}</div>
                      <div class="name2">${esc(h.name)}</div>
                    </td>
                    <td class="tdMuted">${fmt(h.quantity)}</td>
                    <td class="tdMuted">₹${fmt(h.averagePrice)}</td>
                    <td class="tdStrong">₹${fmt(h.currentPrice)}</td>
                    <td class="tdMuted">₹${fmt(inv)}</td>
                    <td class="tdStrong">₹${fmt(cur)}</td>
                    <td style="color:${col};font-size:13px;font-weight:600">${p > 0 ? "+" : ""}₹${fmt(p)}</td>
                    <td>
                      <span class="pillPct" style="background:${bg};color:${col}">
                        ${pct > 0 ? "+" : ""}${pct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card pad" style="margin-top:20px">
        <h3 style="margin:0 0 20px;font-size:15px;font-weight:600">Recent Transactions</h3>
        <div class="tableWrap">
          <table>
            <thead>
              <tr>
                ${["Symbol", "Type", "Qty", "Price", "Amount"].map((h) => `<th>${esc(h)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${txRows || `<tr><td colspan="5" class="tdMuted" style="text-align:center;padding:20px">No transactions yet</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function marketsView() {
  const q = state.markets.search.trim().toLowerCase();
  const filtered = STOCKS.filter((s) => s.name.toLowerCase().includes(q) || s.symbol.includes(q.toUpperCase()));

  return `
    <div>
      ${pageTitleHTML("Markets", "Live market data and watchlist")}

      <div class="marketGrid">
        ${[
          { name: "NIFTY 50", value: "24,622.15", change: "+0.47%", up: true },
          { name: "SENSEX", value: "80,674.48", change: "+0.52%", up: true },
          { name: "NIFTY IT", value: "39,412.80", change: "-0.31%", up: false },
          { name: "NIFTY BANK", value: "52,180.35", change: "+0.18%", up: true },
        ]
          .map(
            (idx) => `
            <div class="idxCard">
              <p class="idxName">${esc(idx.name)}</p>
              <p class="idxVal">${esc(idx.value)}</p>
              <span class="idxChg" style="color:${idx.up ? "var(--green)" : "var(--red)"}">${esc(idx.change)}</span>
            </div>
          `,
          )
          .join("")}
      </div>

      <input class="input" placeholder="🔍  Search stocks..." data-bind="markets.search" value="${esc(state.markets.search)}" />

      <div style="height:16px"></div>

      <div class="stockList">
        ${filtered
          .map((stock) => {
            const spark = sparkData();
            const color = stock.change > 0 ? "var(--green)" : "var(--red)";
            return `
              <div class="stockRow">
                <div class="stockBadge">${esc(stock.symbol.slice(0, 2))}</div>
                <div class="stockMid">
                  <div class="stockSym">${esc(stock.symbol)}</div>
                  <div class="stockNm">${esc(stock.name)}</div>
                </div>
                <div class="sparkWrap">
                  ${sparklineSVG(spark, stock.change > 0 ? "#10b981" : "#f43f5e", 32)}
                </div>
                <div class="stockRight">
                  <div class="stockPx">₹${fmt(stock.price)}</div>
                  <div class="idxChg" style="color:${color}">${stock.change > 0 ? "+" : ""}${stock.change}%</div>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function demoSharesView() {
  const d = state.demo;
  const enriched = d.holdings.map((h) => {
    const stock = STOCKS.find((s) => s.symbol === h.symbol);
    const currentPrice = stock?.price || h.averagePrice;
    const invested = h.quantity * h.averagePrice;
    const currentValue = h.quantity * currentPrice;
    return {
      ...h,
      currentPrice,
      invested,
      currentValue,
      pnl: currentValue - invested,
    };
  });

  const holdingsValue = enriched.reduce((sum, h) => sum + h.currentValue, 0);
  const investedValue = enriched.reduce((sum, h) => sum + h.invested, 0);
  const totalValue = d.cash + holdingsValue;
  const pnl = holdingsValue - investedValue;

  return `
    <div>
      ${pageTitleHTML("Demo Shares", "Buy stocks with virtual demo tokens and practice safely")}

      <div class="gridCards">
        ${[
          { label: "Demo Tokens", value: fmtCr(d.cash), sub: "Available virtual cash", color: "var(--green)" },
          { label: "Holdings Value", value: fmtCr(holdingsValue), sub: `${d.holdings.length} active positions`, color: "var(--indigo)" },
          { label: "Demo Net Worth", value: fmtCr(totalValue), sub: "Cash + holdings", color: "var(--amber)" },
          { label: "Unrealised P&L", value: `${pnl >= 0 ? "+" : ""}${fmtCr(pnl)}`, sub: "Mark-to-market", color: pnl >= 0 ? "var(--green)" : "var(--red)" },
        ]
          .map(
            (c) => `
            <div class="statCard">
              <p class="statLabel">${esc(c.label)}</p>
              <p class="statValue">${esc(c.value)}</p>
              <p class="statSub" style="color:${c.color}">${esc(c.sub)}</p>
            </div>
          `,
          )
          .join("")}
      </div>

      <div class="card pad" style="margin-top:20px">
        <h3 style="margin:0 0 16px;font-size:15px;font-weight:600">Buy Demo Shares</h3>
        ${d.error ? `<p class="pMuted" style="color:var(--red);margin-bottom:10px">${esc(d.error)}</p>` : ""}
        ${d.success ? `<p class="pMuted" style="color:var(--green);margin-bottom:10px">${esc(d.success)}</p>` : ""}
        <div style="display:grid;grid-template-columns:2fr 1fr auto;gap:10px;align-items:center">
          <select class="input small" data-bind="demo.symbol">
            ${STOCKS.map((s) => `<option value="${esc(s.symbol)}" ${d.form.symbol === s.symbol ? "selected" : ""}>${esc(s.symbol)} • ${esc(s.name)} • ₹${fmt(s.price)}</option>`).join("")}
          </select>
          <input class="input small" data-bind="demo.quantity" type="number" min="1" step="1" value="${d.form.quantity}" />
          <button class="btnPrimary med" data-action="demo:buy">Buy Now</button>
        </div>
      </div>

      <div class="card pad" style="margin-top:20px">
        <h3 style="margin:0 0 16px;font-size:15px;font-weight:600">Demo Holdings</h3>
        <div class="tableWrap">
          <table>
            <thead>
              <tr>
                ${["Stock", "Qty", "Avg Buy", "Current", "Invested", "Value", "P&L"].map((h) => `<th>${esc(h)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${enriched.length === 0
                ? `<tr><td colspan="7" class="tdMuted" style="text-align:center;padding:20px">No demo holdings yet. Buy your first share above.</td></tr>`
                : enriched
                    .map((h) => {
                      const up = h.pnl >= 0;
                      return `
                        <tr>
                          <td><div class="sym">${esc(h.symbol)}</div><div class="name2">${esc(h.name)}</div></td>
                          <td class="tdMuted">${fmt(h.quantity)}</td>
                          <td class="tdMuted">₹${fmt(h.averagePrice)}</td>
                          <td class="tdStrong">₹${fmt(h.currentPrice)}</td>
                          <td class="tdMuted">₹${fmt(h.invested)}</td>
                          <td class="tdStrong">₹${fmt(h.currentValue)}</td>
                          <td style="color:${up ? "var(--green)" : "var(--red)"};font-weight:600">${up ? "+" : ""}₹${fmt(h.pnl)}</td>
                        </tr>
                      `;
                    })
                    .join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card pad" style="margin-top:20px">
        <h3 style="margin:0 0 16px;font-size:15px;font-weight:600">Recent Demo Buys</h3>
        <div class="tableWrap">
          <table>
            <thead>
              <tr>
                ${["Stock", "Qty", "Price", "Amount", "Time"].map((h) => `<th>${esc(h)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${d.history.length === 0
                ? `<tr><td colspan="5" class="tdMuted" style="text-align:center;padding:20px">No demo trades yet.</td></tr>`
                : d.history
                    .slice(0, 10)
                    .map(
                      (x) => `
                        <tr>
                          <td class="tdStrong">${esc(x.symbol)}</td>
                          <td class="tdMuted">${fmt(x.quantity)}</td>
                          <td class="tdMuted">₹${fmt(x.price)}</td>
                          <td class="tdStrong">₹${fmt(x.amount)}</td>
                          <td class="tdMuted">${esc(x.time)}</td>
                        </tr>
                      `,
                    )
                    .join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function chatbotView() {
  const chat = state.chatbot;

  return `
    <div>
      ${pageTitleHTML("AI Stock Coach", "Get practical tips and tricks for Indian stock market investing")}

      <div class="card pad" style="margin-bottom:16px">
        <p class="pMuted" style="margin-bottom:10px">Quick asks:</p>
        <div class="tabs" style="margin:0">
          ${chat.quickPrompts
            .map(
              (p) => `<button class="tabBtn" data-action="chat:quick" data-prompt="${esc(p)}">${esc(p)}</button>`,
            )
            .join("")}
        </div>
      </div>

      <div class="card pad chatWrap">
        <div class="chatFeed">
          ${chat.messages
            .map(
              (m) => `
                <div class="chatRow ${m.role === "user" ? "user" : "assistant"}">
                  <div class="chatBubble ${m.role === "user" ? "user" : "assistant"}">
                    <p>${escMultiline(m.text)}</p>
                    <span>${esc(m.time || "")}</span>
                  </div>
                </div>
              `,
            )
            .join("")}

          ${chat.loading
            ? `
              <div class="chatRow assistant">
                <div class="chatBubble assistant">
                  <p>Thinking and preparing suggestions…</p>
                </div>
              </div>
            `
            : ""}
        </div>

        ${chat.error ? `<p class="pMuted" style="color:var(--red);margin:8px 0 0">${esc(chat.error)}</p>` : ""}

        <div class="chatComposer">
          <input class="input" data-bind="chat.input" value="${esc(chat.input)}" placeholder="Ask about SIP discipline, stock selection, risk management, valuation, or sector allocation" />
          <button class="btnSecondary med" data-action="chat:clear">Clear</button>
          <button class="btnPrimary med" data-action="chat:send" ${chat.loading ? "disabled" : ""}>Send</button>
        </div>

        <p class="pMuted" style="font-size:12px;margin-top:10px">Educational content only. Not financial advice.</p>
      </div>
    </div>
  `;
}

function ipoView() {
  const tab = state.ipo.tab;
  const filtered = tab === "all" ? IPO_DATA : IPO_DATA.filter((i) => i.status === tab);
  const selected = IPO_DATA.find((i) => i.id === state.ipo.selectedId) || null;

  const statusColor = { open: "#10b981", upcoming: "#f59e0b", closed: "#64748b", listed: "#6366f1" };
  const statusBg = { open: "rgba(16,185,129,0.12)", upcoming: "rgba(245,158,11,0.12)", closed: "rgba(100,116,139,0.12)", listed: "rgba(99,102,241,0.12)" };

  return `
    <div>
      ${pageTitleHTML("IPO Centre", "Discover, analyse and apply for IPOs")}

      <div class="tabs">
        ${["all", "open", "upcoming", "listed"]
          .map(
            (t) => `
            <button class="tabBtn ${tab === t ? "active" : ""}" data-action="ipo:setTab" data-tab="${t}">
              ${esc(t.charAt(0).toUpperCase() + t.slice(1))}
            </button>
          `,
          )
          .join("")}
      </div>

      <div class="ipoGrid">
        ${filtered
          .map((ipo) => {
            const isOpen = ipo.status === "open";
            const isSel = selected?.id === ipo.id;
            return `
              <div class="ipoCard" data-action="ipo:toggleDetails" data-id="${ipo.id}">
                <div class="ipoTop">
                  <div class="ipoLeft">
                    <div class="ipoLogo">${esc(ipo.logo)}</div>
                    <div style="min-width:0">
                      <div class="ipoName">${esc(ipo.name)}</div>
                      <div class="ipoSector">${esc(ipo.sector)}</div>
                    </div>
                  </div>
                  <span class="status" style="background:${statusBg[ipo.status]};color:${statusColor[ipo.status]}">${esc(ipo.status)}</span>
                </div>

                <div class="ipoGrid2">
                  <div><p class="k">Price Band</p><p class="v">₹${ipo.priceMin}–${ipo.priceMax}</p></div>
                  <div><p class="k">Lot Size</p><p class="v">${ipo.lotSize} shares</p></div>
                  <div><p class="k">GMP</p><p class="v" style="color:var(--green)">+₹${ipo.gmp} (${((ipo.gmp / ipo.priceMax) * 100).toFixed(1)}%)</p></div>
                  <div><p class="k">Subscribed</p><p class="v" style="color:var(--amber)">${ipo.subscribed}x</p></div>
                </div>

                <div class="ipoBtns">
                  ${isOpen
                    ? `<button class="btnMini primary" data-action="ipo:openApply" data-id="${ipo.id}">Apply Now</button>`
                    : ""}
                  <button class="btnMini ghost" data-action="ipo:toggleDetails" data-id="${ipo.id}">
                    ${isSel ? "▲" : `Details ▼`}
                  </button>
                </div>

                ${isSel
                  ? `
                  <div class="expand">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                      ${[
                        ["Risk", ipo.risk],
                        ["Rating", "★".repeat(ipo.rating)],
                        ["Close Date", ipo.closeDate],
                        ["Min Investment", `₹${(ipo.lotSize * ipo.priceMax).toLocaleString("en-IN")}`],
                      ]
                        .map(
                          ([k, v]) => `
                          <div>
                            <p class="k">${esc(k)}</p>
                            <p class="v" style="font-weight:500">${esc(v)}</p>
                          </div>
                        `,
                        )
                        .join("")}
                    </div>

                    <div style="margin-top:14px">
                      ${[
                        ["QIB", 128.4],
                        ["NII", 47.2],
                        ["Retail", 12.8],
                      ]
                        .map(([cat, x]) => {
                          const w = Math.min((x / 200) * 100, 100);
                          return `
                            <div style="margin-bottom:8px">
                              <div class="rowBetween" style="margin-bottom:4px">
                                <span style="color:var(--muted);font-size:11px">${esc(cat)}</span>
                                <span style="color:var(--text);font-size:11px;font-weight:600">${x}x</span>
                              </div>
                              <div class="subBarTrack">
                                <div class="subBarFill" style="width:${w}%"></div>
                              </div>
                            </div>
                          `;
                        })
                        .join("")}
                    </div>
                  </div>
                `
                  : ""}
              </div>
            `;
          })
          .join("")}
      </div>

      <div class="card pad">
        <h3 style="margin:0 0 16px;font-size:15px;font-weight:600">🔍 IPO Allotment Checker</h3>
        <div class="allotRow">
          <input class="input small" data-bind="ipo.checkPAN" value="${esc(state.ipo.checkPAN)}" maxlength="10" placeholder="Enter PAN (e.g. ABCDE1234F)" />
          <button class="btnPrimary med" data-action="ipo:checkAllotment">Check</button>
        </div>
        ${state.ipo.panResult ? allotmentResultHTML() : ""}
      </div>

      ${state.ipo.applyingId ? applyModalHTML() : ""}
    </div>
  `;
}

function allotmentResultHTML() {
  const r = state.ipo.panResult;
  const good = r.status === "Allotted";
  return `
    <div class="allotBox" style="background:${good ? "rgba(16,185,129,0.10)" : "rgba(244,63,94,0.10)"};border-color:${good ? "var(--green)" : "var(--red)"}">
      <p style="color:${good ? "var(--green)" : "var(--red)"};font-weight:700;margin:0 0 4px">
        ${good ? "🎉 Congratulations! You got allotment." : "❌ Not allotted. Refund will be processed in 2-3 days."}
      </p>
      <p style="color:var(--muted);font-size:13px;margin:0">PAN: ${esc(state.ipo.checkPAN)} | Status: ${esc(r.status)}</p>
    </div>
  `;
}

function applyModalHTML() {
  const ipo = IPO_DATA.find((i) => i.id === state.ipo.applyingId);
  if (!ipo) return "";
  const lots = state.ipo.lots;
  const total = lots * ipo.lotSize * ipo.priceMax;

  return `
    <div class="modalOverlay" data-action="ipo:closeApply">
      <div class="modal" data-action="noop">
        <h3 style="margin:0 0 20px;font-size:17px;font-weight:600">Apply for ${esc(ipo.name)}</h3>

        <div class="amountBox">
          <div class="rowBetween" style="margin-bottom:8px">
            <span style="color:var(--muted);font-size:13px">Price Band</span>
            <span style="color:var(--text);font-size:13px;font-weight:600">₹${ipo.priceMin}–₹${ipo.priceMax}</span>
          </div>
          <div class="rowBetween">
            <span style="color:var(--muted);font-size:13px">Lot Size</span>
            <span style="color:var(--text);font-size:13px;font-weight:600">${ipo.lotSize} shares/lot</span>
          </div>
        </div>

        <label class="label">Number of Lots</label>
        <input class="input small" type="number" min="1" max="14" data-bind="ipo.lots" value="${lots}" />

        <div class="rowBetween dividerTop" style="padding:12px 0;margin:12px 0 20px">
          <span style="color:var(--muted);font-size:14px">Total Amount</span>
          <span style="color:var(--green);font-size:16px;font-weight:700">₹${total.toLocaleString("en-IN")}</span>
        </div>

        <div style="display:flex;gap:10px">
          <button class="btnSecondary med" style="flex:1" data-action="ipo:closeApply">Cancel</button>
          <button class="btnPrimary med" style="flex:1" data-action="ipo:confirmApply">Apply →</button>
        </div>
      </div>
    </div>
  `;
}

function toolsView() {
  const t = state.tools.tool;
  const tools = [
    { id: "sip", label: "SIP Calculator", icon: "📈" },
    { id: "emi", label: "EMI Calculator", icon: "🏠" },
    { id: "loanEmi", label: "Loan EMI", icon: "🏦" },
    { id: "monthly", label: "Monthly Returns", icon: "📅" },
    { id: "lumpsum", label: "Lumpsum", icon: "💰" },
    { id: "compound", label: "Compound Interest", icon: "💹" },
    { id: "retirement", label: "Retirement", icon: "🧓" },
    { id: "swp", label: "SWP Calculator", icon: "🔁" },
    { id: "risk", label: "Risk Assessment", icon: "🎯" },
  ];

  return `
    <div>
      ${pageTitleHTML("Financial Tools", "Plan smarter with our calculators")}

      <div class="tabs toolTabs">
        ${tools
          .map(
            (x) => `
            <button class="tabBtn ${t === x.id ? "active" : ""}" data-action="tools:setTool" data-tool="${x.id}">
              <span style="margin-right:6px">${esc(x.icon)}</span>${esc(x.label)}
            </button>
          `,
          )
          .join("")}
      </div>

      <div class="card toolCard">
        ${t === "sip" ? sipView() : ""}
        ${t === "emi" ? emiView() : ""}
        ${t === "loanEmi" ? loanEmiView() : ""}
        ${t === "monthly" ? monthlyReturnsView() : ""}
        ${t === "lumpsum" ? lumpsumView() : ""}
        ${t === "compound" ? compoundView() : ""}
        ${t === "retirement" ? retirementView() : ""}
        ${t === "swp" ? swpView() : ""}
        ${t === "risk" ? riskView() : ""}
      </div>
    </div>
  `;
}

function sipView() {
  const sip = state.tools.sip;
  const r = sip.rate / 12 / 100;
  const n = sip.years * 12;
  const fv = sip.amount * ((Math.pow(1 + r, n) - 1) / (r || 1e-9)) * (1 + r);
  const invested = sip.amount * n;
  const returns = fv - invested;
  const multiple = invested > 0 ? fv / invested : 0;

  return `
    <div>
      <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">📈 SIP Return Calculator</h3>

      <div class="rangeRow">
        ${rangeControl("Monthly Investment", "tools.sip.amount", sip.amount, 500, 100000, 500, `₹${fmt(sip.amount)}`)}
        ${rangeControl("Expected Annual Return", "tools.sip.rate", sip.rate, 1, 30, 0.5, `${fmt(sip.rate)}%`)}
        ${rangeControl("Investment Duration", "tools.sip.years", sip.years, 1, 30, 1, `${sip.years} yrs`)}
      </div>

      <div class="miniKpis">
        ${miniKpi("Total Invested", fmtCr(invested), "var(--indigo)")}
        ${miniKpi("Estimated Returns", fmtCr(returns), "var(--green)")}
        ${miniKpi("Future Value", fmtCr(fv), "var(--amber)")}
      </div>

      <div class="info">
        💡 Your wealth grows <b style="color:var(--indigo)">${multiple.toFixed(1)}×</b> — returns of
        <b style="color:var(--green)">${fmtCr(returns)}</b> on an investment of ${fmtCr(invested)}
      </div>
    </div>
  `;
}

function emiView() {
  const emi = state.tools.emi;
  const r = emi.rate / 12 / 100;
  const n = emi.years * 12;
  const monthly = r === 0 ? emi.principal / n : (emi.principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1 || 1e-9);
  const totalPay = monthly * n;
  const totalInt = totalPay - emi.principal;

  return `
    <div>
      <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">🏠 EMI Calculator</h3>

      <div class="rangeRow">
        ${rangeControl("Loan Amount", "tools.emi.principal", emi.principal, 100000, 10000000, 100000, `₹${fmt(emi.principal)}`)}
        ${rangeControl("Interest Rate (Annual)", "tools.emi.rate", emi.rate, 5, 20, 0.1, `${fmt(emi.rate)}%`)}
        ${rangeControl("Loan Tenure", "tools.emi.years", emi.years, 1, 30, 1, `${emi.years} yrs`)}
      </div>

      <div class="miniKpis">
        ${miniKpi("Monthly EMI", `₹${fmt(monthly)}`, "var(--indigo)")}
        ${miniKpi("Total Interest", fmtCr(totalInt), "var(--red)")}
        ${miniKpi("Total Payment", fmtCr(totalPay), "var(--amber)")}
      </div>
    </div>
  `;
}

function loanEmiView() {
  const emi = state.tools.loanEmi;
  const r = emi.rate / 12 / 100;
  const n = emi.years * 12;
  const monthly = r === 0 ? emi.principal / n : (emi.principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1 || 1e-9);
  const totalPay = monthly * n;
  const totalInt = totalPay - emi.principal;

  return `
    <div>
      <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">🏦 Loan EMI Calculator</h3>
      <div class="rangeRow">
        ${rangeControl("Loan Principal", "tools.loanEmi.principal", emi.principal, 100000, 20000000, 100000, `₹${fmt(emi.principal)}`)}
        ${rangeControl("Annual Interest Rate", "tools.loanEmi.rate", emi.rate, 1, 20, 0.1, `${fmt(emi.rate)}%`)}
        ${rangeControl("Tenure", "tools.loanEmi.years", emi.years, 1, 35, 1, `${emi.years} yrs`)}
      </div>
      <div class="miniKpis">
        ${miniKpi("Monthly EMI", `₹${fmt(monthly)}`, "var(--indigo)")}
        ${miniKpi("Total Interest", fmtCr(totalInt), "var(--red)")}
        ${miniKpi("Total Repayment", fmtCr(totalPay), "var(--amber)")}
      </div>
    </div>
  `;
}

function monthlyReturnsView() {
  const m = state.tools.monthly;
  const r = m.rate / 12 / 100;
  const n = Math.max(1, Math.round(m.months));
  const fv = r === 0 ? m.amount * n : m.amount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = m.amount * n;
  const returns = fv - invested;

  return `
    <div>
      <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">📅 Monthly Investment Returns</h3>
      <div class="rangeRow">
        ${rangeControl("Monthly Contribution", "tools.monthly.amount", m.amount, 500, 100000, 500, `₹${fmt(m.amount)}`)}
        ${rangeControl("Annual Return", "tools.monthly.rate", m.rate, 1, 30, 0.5, `${fmt(m.rate)}%`)}
        ${rangeControl("Duration (Months)", "tools.monthly.months", m.months, 12, 480, 1, `${m.months} months`)}
      </div>
      <div class="miniKpis">
        ${miniKpi("Invested Amount", fmtCr(invested), "var(--indigo)")}
        ${miniKpi("Returns Earned", fmtCr(returns), "var(--green)")}
        ${miniKpi("Maturity Value", fmtCr(fv), "var(--amber)")}
      </div>
    </div>
  `;
}

function lumpsumView() {
  const l = state.tools.lumpsum;
  const amount = l.principal * Math.pow(1 + l.rate / 100, l.years);
  const gain = amount - l.principal;

  return `
    <div>
      <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">💰 Lumpsum Calculator</h3>
      <div class="rangeRow">
        ${rangeControl("One-time Investment", "tools.lumpsum.principal", l.principal, 10000, 20000000, 10000, `₹${fmt(l.principal)}`)}
        ${rangeControl("Expected Annual Return", "tools.lumpsum.rate", l.rate, 1, 30, 0.5, `${fmt(l.rate)}%`)}
        ${rangeControl("Investment Duration", "tools.lumpsum.years", l.years, 1, 40, 1, `${l.years} yrs`)}
      </div>
      <div class="miniKpis">
        ${miniKpi("Invested", fmtCr(l.principal), "var(--indigo)")}
        ${miniKpi("Gains", fmtCr(gain), "var(--green)")}
        ${miniKpi("Future Value", fmtCr(amount), "var(--amber)")}
      </div>
    </div>
  `;
}

function compoundView() {
  const comp = state.tools.comp;
  const finalAmt = comp.principal * Math.pow(1 + comp.rate / 100, comp.years);
  const earned = finalAmt - comp.principal;

  return `
    <div>
      <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">💹 Compound Interest Calculator</h3>

      <div class="rangeRow">
        ${rangeControl("Principal Amount", "tools.comp.principal", comp.principal, 1000, 1000000, 1000, `₹${fmt(comp.principal)}`)}
        ${rangeControl("Annual Interest Rate", "tools.comp.rate", comp.rate, 1, 30, 0.5, `${fmt(comp.rate)}%`)}
        ${rangeControl("Time Period", "tools.comp.years", comp.years, 1, 40, 1, `${comp.years} yrs`)}
      </div>

      <div class="miniKpis">
        ${miniKpi("Principal", fmtCr(comp.principal), "var(--indigo)")}
        ${miniKpi("Interest Earned", fmtCr(earned), "var(--green)")}
        ${miniKpi("Maturity Amount", fmtCr(finalAmt), "var(--amber)")}
      </div>

      <div class="info" style="background:rgba(16,185,129,0.08);border:none">
        🚀 Rule of 72: At ${fmt(comp.rate)}% per annum, your money doubles every <b style="color:var(--green)">${(72 / (comp.rate || 1)).toFixed(1)} years</b>
      </div>
    </div>
  `;
}

function retirementView() {
  const r = state.tools.retirement;
  const yearsToRet = Math.max(0, r.retirementAge - r.currentAge);
  const retirementYears = Math.max(1, r.lifeExpectancy - r.retirementAge);
  const infl = r.inflationRate / 100;
  const pre = r.preRetirementReturn / 100;
  const post = r.postRetirementReturn / 100;

  const monthlyExpenseAtRetirement = r.monthlyExpenseToday * Math.pow(1 + infl, yearsToRet);
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  const requiredCorpus =
    Math.abs(post - infl) < 1e-9
      ? (annualExpenseAtRetirement * retirementYears) / (1 + post)
      : (annualExpenseAtRetirement / (post - infl)) * (1 - Math.pow((1 + infl) / (1 + post), retirementYears));

  const monthsToRet = Math.max(1, yearsToRet * 12);
  const rm = pre / 12;
  const sip = rm === 0 ? requiredCorpus / monthsToRet : (requiredCorpus * rm) / (Math.pow(1 + rm, monthsToRet) - 1);

  return `
    <div>
      <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">🧓 Retirement Calculator</h3>
      <div class="rangeRow">
        ${rangeControl("Current Age", "tools.retirement.currentAge", r.currentAge, 20, 55, 1, `${r.currentAge} yrs`)}
        ${rangeControl("Retirement Age", "tools.retirement.retirementAge", r.retirementAge, 45, 70, 1, `${r.retirementAge} yrs`)}
        ${rangeControl("Life Expectancy", "tools.retirement.lifeExpectancy", r.lifeExpectancy, 70, 100, 1, `${r.lifeExpectancy} yrs`)}
      </div>
      <div class="rangeRow">
        ${rangeControl("Monthly Expense Today", "tools.retirement.monthlyExpenseToday", r.monthlyExpenseToday, 10000, 300000, 1000, `₹${fmt(r.monthlyExpenseToday)}`)}
        ${rangeControl("Inflation", "tools.retirement.inflationRate", r.inflationRate, 1, 12, 0.1, `${fmt(r.inflationRate)}%`)}
        ${rangeControl("Pre-ret Return", "tools.retirement.preRetirementReturn", r.preRetirementReturn, 1, 20, 0.1, `${fmt(r.preRetirementReturn)}%`)}
      </div>
      <div class="rangeRow">
        ${rangeControl("Post-ret Return", "tools.retirement.postRetirementReturn", r.postRetirementReturn, 1, 15, 0.1, `${fmt(r.postRetirementReturn)}%`)}
      </div>
      <div class="miniKpis">
        ${miniKpi("Retirement Corpus", fmtCr(requiredCorpus), "var(--amber)")}
        ${miniKpi("Expense at Retirement", fmtCr(monthlyExpenseAtRetirement), "var(--red)")}
        ${miniKpi("Required Monthly SIP", fmtCr(sip), "var(--green)")}
      </div>
    </div>
  `;
}

function swpView() {
  const swp = state.tools.swp;
  const months = swp.years * 12;
  const rm = swp.rate / 12 / 100;
  let corpus = swp.corpus;
  let sustained = 0;

  for (let i = 1; i <= months; i += 1) {
    if (corpus <= 0) break;
    corpus = corpus * (1 + rm) - swp.withdrawal;
    sustained = i;
  }

  return `
    <div>
      <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">🔁 SWP Calculator</h3>
      <div class="rangeRow">
        ${rangeControl("Initial Corpus", "tools.swp.corpus", swp.corpus, 100000, 50000000, 100000, `₹${fmt(swp.corpus)}`)}
        ${rangeControl("Monthly Withdrawal", "tools.swp.withdrawal", swp.withdrawal, 5000, 300000, 1000, `₹${fmt(swp.withdrawal)}`)}
        ${rangeControl("Expected Annual Return", "tools.swp.rate", swp.rate, 1, 20, 0.1, `${fmt(swp.rate)}%`)}
      </div>
      <div class="rangeRow">
        ${rangeControl("Projection Horizon", "tools.swp.years", swp.years, 1, 40, 1, `${swp.years} yrs`)}
      </div>
      <div class="miniKpis">
        ${miniKpi("Sustainability", `${(sustained / 12).toFixed(1)} yrs`, "var(--indigo)")}
        ${miniKpi("Months Sustained", `${sustained}`, "var(--amber)")}
        ${miniKpi("Ending Corpus", fmtCr(Math.max(0, corpus)), corpus > 0 ? "var(--green)" : "var(--red)")}
      </div>
      <div class="info">
        ${corpus > 0 ? "Corpus survives projection period with planned withdrawals." : "Corpus depletes before projection end; reduce withdrawal or raise return assumptions."}
      </div>
    </div>
  `;
}

function riskView() {
  const { answers, result } = state.tools.risk;

  const score = Object.values(answers).reduce((s, v) => s + v, 0) / RISK_QUESTIONS.length || 0;
  const category = score < 35 ? "Conservative" : score < 70 ? "Moderate" : "Aggressive";

  const profiles = {
    Conservative: { emoji: "🛡️", equity: 30, debt: 60, gold: 10, color: "#06b6d4", desc: "You prefer safety. Focus on FDs, debt funds, and government bonds." },
    Moderate: { emoji: "⚖️", equity: 60, debt: 30, gold: 10, color: "#6366f1", desc: "Balanced risk. Mix of equity mutual funds and stable debt instruments." },
    Aggressive: { emoji: "🚀", equity: 80, debt: 15, gold: 5, color: "#f59e0b", desc: "High risk tolerance. Direct stocks, small caps, and growth-focused funds." },
  };

  if (result) {
    const p = profiles[result.category];
    return `
      <div>
        <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">🎯 Investor Risk Profile</h3>
        <div class="center" style="padding:24px 0;margin-bottom:24px">
          <div class="riskEmoji">${esc(p.emoji)}</div>
          <h3 class="riskTitle" style="color:${p.color}">${esc(result.category)} Investor</h3>
          <p class="riskDesc">${esc(p.desc)}</p>
        </div>

        <div class="riskGrid">
          ${riskBox("Equity", p.equity, "#6366f1")}
          ${riskBox("Debt", p.debt, "#10b981")}
          ${riskBox("Gold", p.gold, "#f59e0b")}
        </div>

        <button class="btnSecondary med" style="width:100%" data-action="risk:reset">Retake Assessment</button>
      </div>
    `;
  }

  return `
    <div>
      <h3 style="margin:0 0 24px;font-size:16px;font-weight:600">🎯 Investor Risk Profile</h3>
      ${RISK_QUESTIONS.map((q, idx) => {
        const ans = answers[q.id];
        return `
          <div class="qa ${ans ? "active" : ""}">
            <p class="q">${idx + 1}. ${esc(q.q)}</p>
            <div class="opts">
              ${q.opts
                .map(
                  (opt) => `
                  <button class="optBtn ${ans === opt.s ? "sel" : ""}" data-action="risk:answer" data-qid="${q.id}" data-score="${opt.s}">
                    ${esc(opt.t)}
                  </button>
                `,
                )
                .join("")}
            </div>
          </div>
        `;
      }).join("")}

      <button class="btnPrimary big" data-action="risk:submit">Analyse My Risk Profile →</button>
      <div style="margin-top:10px;color:var(--muted2);font-size:12px">
        Current score (preview): <b>${score.toFixed(1)}</b> → <b>${category}</b>
      </div>
    </div>
  `;
}

function rangeControl(label, bindKey, value, min, max, step, displayValue) {
  return `
    <div>
      <div class="rangeHead">
        <label class="label" style="margin:0">${esc(label)}</label>
        <span class="rangeVal">${esc(displayValue)}</span>
      </div>
      <input type="range" min="${min}" max="${max}" step="${step}" data-bind="${bindKey}" value="${value}">
    </div>
  `;
}

function miniKpi(label, value, color) {
  return `
    <div class="mini">
      <p class="miniK">${esc(label)}</p>
      <p class="miniV" style="color:${color}">${esc(value)}</p>
    </div>
  `;
}

function riskBox(label, pct, color) {
  return `
    <div class="riskBox">
      <p class="riskPct" style="color:${color}">${pct}%</p>
      <p class="riskLbl">${esc(label)}</p>
    </div>
  `;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  if (state.initializing) {
    root.innerHTML = `
      <div class="authShell">
        <div class="authWrap" style="justify-content:center">
          <div class="authCard" style="text-align:center">
            <h2 style="margin:0 0 8px">Tradzo</h2>
            <p class="authHint">Restoring your secure session…</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  root.innerHTML = state.user ? shellView() : authView();
}

// ─── Events ───────────────────────────────────────────────────────────────────
function closestAction(el) {
  return el?.closest?.("[data-action]") || null;
}

root.addEventListener("click", async (e) => {
  const btn = closestAction(e.target);
  if (!btn) return;
  const action = btn.getAttribute("data-action");
  if (!action || action === "noop") return;

  // Prevent card clicks from also triggering overlay close, etc.
  if (btn.classList.contains("btnMini") || btn.classList.contains("optBtn") || btn.classList.contains("tabBtn") || btn.classList.contains("navBtn") || btn.classList.contains("switchBtn")) {
    e.stopPropagation();
  }

  if (action === "auth:setMode") {
    const mode = btn.getAttribute("data-mode");
    setState((s) => {
      s.auth.mode = mode;
      s.auth.error = "";
    });
    return;
  }

  if (action === "auth:useDemo") {
    setState((s) => {
      s.auth.mode = "login";
      s.auth.email = DEMO_EMAIL;
      s.auth.password = DEMO_PASSWORD;
      s.auth.error = "";
    });
    return;
  }

  if (action === "auth:submit") {
    if (state.auth.loading) return;

    const mode = state.auth.mode;
    const payload = {
      email: state.auth.email.trim(),
      password: state.auth.password,
    };

    if (mode === "signup") {
      payload.name = state.auth.name.trim();
      if (!payload.name) {
        setState((s) => {
          s.auth.error = "Name is required for signup";
        });
        return;
      }
    }

    if (!payload.email || !payload.password) {
      setState((s) => {
        s.auth.error = "Email and password are required";
      });
      return;
    }

    setState((s) => {
      s.auth.loading = true;
      s.auth.error = "";
    });

    const emailLower = payload.email.toLowerCase();
    if (mode === "login" && emailLower === DEMO_EMAIL && payload.password === DEMO_PASSWORD) {
      const demoUser = createDemoUser();
      setToken(DEMO_TOKEN);
      setState((s) => {
        s.auth.loading = false;
        s.user = demoUser;
        s.tab = "dashboard";
        s.notifOpen = false;
        s.auth.password = "";
        s.profile.form.name = demoUser.name;
        s.profile.form.phone = demoUser.phone;
        s.profile.error = "";
        s.profile.success = "";
        s.demo = createDemoWallet();
      });
      return;
    }

    try {
      const endpoint = mode === "signup" ? "/auth/register" : "/auth/login";
      const res = await apiRequest(endpoint, { method: "POST", body: payload });
      setToken(res.token);

      setState((s) => {
        s.auth.loading = false;
        s.user = res.user;
        s.tab = "dashboard";
        s.notifOpen = false;
        s.auth.password = "";
        s.profile.form.name = res.user?.name || "";
        s.profile.form.phone = res.user?.phone || "";
        s.profile.error = "";
        s.profile.success = "";
      });

      await loadPortfolioData();
    } catch (error) {
      setState((s) => {
        s.auth.loading = false;
        s.auth.error = parseApiError(error, "Authentication failed");
      });
    }
    return;
  }

  if (action === "auth:logout") {
    clearToken();
    setState((s) => {
      s.user = null;
      s.notifOpen = false;
      s.auth.password = "";
      s.auth.error = "";
      s.profile.form.name = "";
      s.profile.form.phone = "";
      s.profile.error = "";
      s.profile.success = "";
      s.chatbot.input = "";
      s.chatbot.loading = false;
      s.chatbot.error = "";
      s.chatbot.messages = [
        {
          role: "assistant",
          text: "Namaste! I am your Indian stock market assistant. Ask me for tips on SIP, risk management, sector rotation, stock analysis checklist, or beginner-friendly investing habits.",
          time: new Date().toLocaleTimeString(),
        },
      ];
      s.demo = createDemoWallet();
      s.portfolio.holdings = [];
      s.portfolio.transactions = [];
      s.portfolio.summary = { totalInvested: 0, currentValue: 0, totalPnl: 0, totalPnlPercent: 0, totalHoldings: 0, totalQuantity: 0 };
    });
    return;
  }

  if (action === "chat:quick") {
    const prompt = btn.getAttribute("data-prompt") || "";
    setState((s) => {
      s.chatbot.input = prompt;
      s.chatbot.error = "";
    });
    return;
  }

  if (action === "chat:clear") {
    setState((s) => {
      s.chatbot.messages = [
        {
          role: "assistant",
          text: "Chat cleared. Ask me anything about Indian stock market tips, risk controls, and investing discipline.",
          time: new Date().toLocaleTimeString(),
        },
      ];
      s.chatbot.error = "";
      s.chatbot.input = "";
    });
    return;
  }

  if (action === "chat:send") {
    await sendChatMessage(state.chatbot.input);
    return;
  }

  if (action === "portfolio:setMode") {
    const mode = btn.getAttribute("data-mode") === "sell" ? "sell" : "buy";
    setState((s) => {
      s.portfolio.form.mode = mode;
      s.portfolio.error = "";
    });
    return;
  }

  if (action === "portfolio:refresh") {
    await loadPortfolioData();
    return;
  }

  if (action === "portfolio:submit") {
    const f = state.portfolio.form;
    const symbol = String(f.symbol || "").trim().toUpperCase();
    const qty = Number(f.quantity);
    const price = Number(f.price);

    if (!symbol || qty <= 0 || price <= 0) {
      setState((s) => {
        s.portfolio.error = "Symbol, quantity and price should be valid";
      });
      return;
    }

    if (f.mode === "buy" && !String(f.name || "").trim()) {
      setState((s) => {
        s.portfolio.error = "Stock name is required for buy transactions";
      });
      return;
    }

    setState((s) => {
      s.portfolio.loading = true;
      s.portfolio.error = "";
    });

    try {
      if (f.mode === "buy") {
        await apiRequest("/portfolio/buy", {
          method: "POST",
          body: {
            symbol,
            name: String(f.name).trim(),
            sector: String(f.sector || "Other").trim() || "Other",
            quantity: qty,
            price,
          },
        });
      } else {
        await apiRequest("/portfolio/sell", {
          method: "POST",
          body: {
            symbol,
            quantity: qty,
            price,
          },
        });
      }

      setState((s) => {
        s.portfolio.form.symbol = "";
        s.portfolio.form.name = "";
        s.portfolio.form.quantity = 1;
        s.portfolio.form.price = 0;
      });

      await loadPortfolioData();
    } catch (error) {
      setState((s) => {
        s.portfolio.loading = false;
        s.portfolio.error = parseApiError(error, "Portfolio transaction failed");
      });
    }
    return;
  }

  if (action === "profile:save") {
    if (state.user?.isDemo) {
      setState((s) => {
        const name = String(s.profile.form.name || "").trim() || "Demo Investor";
        s.user.name = name;
        s.profile.success = "Demo profile updated locally";
        s.profile.error = "";
      });
      return;
    }

    const name = String(state.profile.form.name || "").trim();
    const phone = String(state.profile.form.phone || "").trim();

    if (!name) {
      setState((s) => {
        s.profile.error = "Name is required";
        s.profile.success = "";
      });
      return;
    }

    setState((s) => {
      s.profile.loading = true;
      s.profile.error = "";
      s.profile.success = "";
    });

    try {
      const res = await apiRequest("/user/profile", {
        method: "PUT",
        body: { name, phone },
      });

      setState((s) => {
        s.profile.loading = false;
        s.profile.success = "Profile updated successfully";
        s.user = { ...s.user, ...res.user };
        s.profile.form.name = res.user?.name || s.profile.form.name;
        s.profile.form.phone = res.user?.phone || "";
      });
    } catch (error) {
      setState((s) => {
        s.profile.loading = false;
        s.profile.error = parseApiError(error, "Could not update profile");
      });
    }

    return;
  }

  if (action === "demo:buy") {
    const symbol = String(state.demo.form.symbol || "").trim().toUpperCase();
    const quantity = Math.max(1, Number(state.demo.form.quantity) || 1);
    const stock = STOCKS.find((s) => s.symbol === symbol);

    if (!stock) {
      setState((s) => {
        s.demo.error = "Please select a valid stock";
        s.demo.success = "";
      });
      return;
    }

    const amount = stock.price * quantity;
    if (state.demo.cash < amount) {
      setState((s) => {
        s.demo.error = "Insufficient demo tokens for this order";
        s.demo.success = "";
      });
      return;
    }

    setState((s) => {
      const existing = s.demo.holdings.find((h) => h.symbol === symbol);

      if (existing) {
        const newQty = existing.quantity + quantity;
        existing.averagePrice = (existing.averagePrice * existing.quantity + stock.price * quantity) / newQty;
        existing.quantity = newQty;
      } else {
        s.demo.holdings.push({
          symbol: stock.symbol,
          name: stock.name,
          quantity,
          averagePrice: stock.price,
        });
      }

      s.demo.cash -= amount;
      s.demo.history.unshift({
        symbol: stock.symbol,
        quantity,
        price: stock.price,
        amount,
        time: new Date().toLocaleTimeString(),
      });
      s.demo.history = s.demo.history.slice(0, 25);
      s.demo.error = "";
      s.demo.success = `Bought ${quantity} ${stock.symbol} for ₹${fmt(amount)}`;
      s.demo.form.quantity = 1;
    });
    return;
  }

  if (action === "nav:tab") {
    const tab = btn.getAttribute("data-tab");
    setState((s) => {
      s.tab = tab;
      s.notifOpen = false;
    });
    return;
  }

  if (action === "notif:toggle") {
    setState((s) => {
      s.notifOpen = !s.notifOpen;
    });
    return;
  }

  if (action === "notif:markAllRead") {
    setState((s) => {
      s.notifs = s.notifs.map((n) => ({ ...n, read: true }));
    });
    return;
  }

  if (action === "ipo:setTab") {
    const t = btn.getAttribute("data-tab");
    setState((s) => {
      s.ipo.tab = t;
      s.ipo.selectedId = null;
      s.ipo.applyingId = null;
      s.ipo.panResult = null;
    });
    return;
  }

  if (action === "ipo:toggleDetails") {
    const id = Number(btn.getAttribute("data-id") || btn.getAttribute("data-id"));
    // If click came from card itself, dataset is on card
    const card = btn.closest(".ipoCard");
    const cardId = card ? Number(card.getAttribute("data-id")) : id;
    const nextId = cardId || id;
    setState((s) => {
      s.ipo.selectedId = s.ipo.selectedId === nextId ? null : nextId;
    });
    return;
  }

  if (action === "ipo:openApply") {
    const id = Number(btn.getAttribute("data-id"));
    setState((s) => {
      s.ipo.applyingId = id;
      s.ipo.lots = 1;
    });
    return;
  }

  if (action === "ipo:closeApply") {
    setState((s) => {
      s.ipo.applyingId = null;
    });
    return;
  }

  if (action === "ipo:confirmApply") {
    const ipo = IPO_DATA.find((i) => i.id === state.ipo.applyingId);
    if (!ipo) return;
    const lots = state.ipo.lots;
    const total = lots * ipo.lotSize * ipo.priceMax;
    alert(`✅ Applied for ${ipo.name}!\n${lots} lot(s) × ₹${ipo.priceMax} × ${ipo.lotSize} shares\nTotal: ₹${total.toLocaleString("en-IN")}`);
    setState((s) => {
      s.ipo.applyingId = null;
    });
    return;
  }

  if (action === "ipo:checkAllotment") {
    const pan = state.ipo.checkPAN.trim();
    if (pan.length !== 10) {
      alert("Enter valid 10-character PAN");
      return;
    }
    setState((s) => {
      s.ipo.panResult = { status: Math.random() > 0.5 ? "Allotted" : "Not Allotted", lots: 1, refund: 0 };
    });
    return;
  }

  if (action === "tools:setTool") {
    const tool = btn.getAttribute("data-tool");
    setState((s) => {
      s.tools.tool = tool;
      s.tools.risk.result = null;
    });
    return;
  }

  if (action === "risk:answer") {
    const qid = Number(btn.getAttribute("data-qid"));
    const score = Number(btn.getAttribute("data-score"));
    setState((s) => {
      s.tools.risk.answers = { ...s.tools.risk.answers, [qid]: score };
    });
    return;
  }

  if (action === "risk:submit") {
    const ans = state.tools.risk.answers;
    if (Object.keys(ans).length < RISK_QUESTIONS.length) {
      alert("Please answer all questions");
      return;
    }
    const score = Object.values(ans).reduce((sum, v) => sum + v, 0) / RISK_QUESTIONS.length;
    const category = score < 35 ? "Conservative" : score < 70 ? "Moderate" : "Aggressive";
    setState((s) => {
      s.tools.risk.result = { score, category };
    });
    return;
  }

  if (action === "risk:reset") {
    setState((s) => {
      s.tools.risk.answers = {};
      s.tools.risk.result = null;
    });
    return;
  }
});

root.addEventListener("input", (e) => {
  const el = e.target;
  const bind = el?.getAttribute?.("data-bind");
  if (!bind) return;

  const val = el.type === "range" || el.type === "number" ? Number(el.value) : el.value;

  setState((s) => {
    // Small, explicit binder (keeps things predictable)
    switch (bind) {
      case "auth.name":
        s.auth.name = String(val);
        s.auth.error = "";
        break;
      case "auth.email":
        s.auth.email = String(val);
        s.auth.error = "";
        break;
      case "auth.password":
        s.auth.password = String(val);
        s.auth.error = "";
        break;
      case "chat.input":
        s.chatbot.input = String(val);
        s.chatbot.error = "";
        break;
      case "profile.name":
        s.profile.form.name = String(val);
        s.profile.error = "";
        s.profile.success = "";
        break;
      case "profile.phone":
        s.profile.form.phone = String(val);
        s.profile.error = "";
        s.profile.success = "";
        break;
      case "portfolio.symbol":
        s.portfolio.form.symbol = String(val).toUpperCase();
        s.portfolio.error = "";
        break;
      case "portfolio.name":
        s.portfolio.form.name = String(val);
        s.portfolio.error = "";
        break;
      case "portfolio.sector":
        s.portfolio.form.sector = String(val);
        s.portfolio.error = "";
        break;
      case "portfolio.quantity":
        s.portfolio.form.quantity = Math.max(1, Number(val) || 1);
        s.portfolio.error = "";
        break;
      case "portfolio.price":
        s.portfolio.form.price = Math.max(0, Number(val) || 0);
        s.portfolio.error = "";
        break;
      case "demo.symbol":
        s.demo.form.symbol = String(val).toUpperCase();
        s.demo.error = "";
        s.demo.success = "";
        break;
      case "demo.quantity":
        s.demo.form.quantity = Math.max(1, Number(val) || 1);
        s.demo.error = "";
        s.demo.success = "";
        break;
      case "markets.search":
        s.markets.search = String(val);
        break;
      case "ipo.checkPAN":
        s.ipo.checkPAN = String(val).toUpperCase().slice(0, 10);
        break;
      case "ipo.lots":
        s.ipo.lots = Math.max(1, Math.min(14, Number(val) || 1));
        break;
      case "tools.sip.amount":
        s.tools.sip.amount = Number(val);
        break;
      case "tools.sip.rate":
        s.tools.sip.rate = Number(val);
        break;
      case "tools.sip.years":
        s.tools.sip.years = Number(val);
        break;
      case "tools.emi.principal":
        s.tools.emi.principal = Number(val);
        break;
      case "tools.emi.rate":
        s.tools.emi.rate = Number(val);
        break;
      case "tools.emi.years":
        s.tools.emi.years = Number(val);
        break;
      case "tools.loanEmi.principal":
        s.tools.loanEmi.principal = Number(val);
        break;
      case "tools.loanEmi.rate":
        s.tools.loanEmi.rate = Number(val);
        break;
      case "tools.loanEmi.years":
        s.tools.loanEmi.years = Number(val);
        break;
      case "tools.monthly.amount":
        s.tools.monthly.amount = Number(val);
        break;
      case "tools.monthly.rate":
        s.tools.monthly.rate = Number(val);
        break;
      case "tools.monthly.months":
        s.tools.monthly.months = Number(val);
        break;
      case "tools.lumpsum.principal":
        s.tools.lumpsum.principal = Number(val);
        break;
      case "tools.lumpsum.rate":
        s.tools.lumpsum.rate = Number(val);
        break;
      case "tools.lumpsum.years":
        s.tools.lumpsum.years = Number(val);
        break;
      case "tools.comp.principal":
        s.tools.comp.principal = Number(val);
        break;
      case "tools.comp.rate":
        s.tools.comp.rate = Number(val);
        break;
      case "tools.comp.years":
        s.tools.comp.years = Number(val);
        break;
      case "tools.retirement.currentAge":
        s.tools.retirement.currentAge = Number(val);
        break;
      case "tools.retirement.retirementAge":
        s.tools.retirement.retirementAge = Number(val);
        break;
      case "tools.retirement.lifeExpectancy":
        s.tools.retirement.lifeExpectancy = Number(val);
        break;
      case "tools.retirement.monthlyExpenseToday":
        s.tools.retirement.monthlyExpenseToday = Number(val);
        break;
      case "tools.retirement.inflationRate":
        s.tools.retirement.inflationRate = Number(val);
        break;
      case "tools.retirement.preRetirementReturn":
        s.tools.retirement.preRetirementReturn = Number(val);
        break;
      case "tools.retirement.postRetirementReturn":
        s.tools.retirement.postRetirementReturn = Number(val);
        break;
      case "tools.swp.corpus":
        s.tools.swp.corpus = Number(val);
        break;
      case "tools.swp.withdrawal":
        s.tools.swp.withdrawal = Number(val);
        break;
      case "tools.swp.rate":
        s.tools.swp.rate = Number(val);
        break;
      case "tools.swp.years":
        s.tools.swp.years = Number(val);
        break;
      default:
        break;
    }
  });
});

root.addEventListener("keydown", async (e) => {
  const el = e.target;
  const bind = el?.getAttribute?.("data-bind");
  if (bind !== "chat.input") return;
  if (e.key !== "Enter" || e.shiftKey) return;

  e.preventDefault();
  await sendChatMessage(state.chatbot.input);
});

// Close notifications when clicking outside dropdown
document.addEventListener("click", (e) => {
  if (!state.user) return;
  const drop = document.querySelector(".dropdown");
  const bell = document.querySelector('[data-action="notif:toggle"]');
  if (!drop || !bell) return;
  if (drop.contains(e.target) || bell.contains(e.target)) return;
  if (state.notifOpen) setState((s) => void (s.notifOpen = false));
});

render();
initializeSession();

