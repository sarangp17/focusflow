import { useState, useEffect, useRef } from "react"
import Today from "./components/Today.jsx"
import Weekly from "./components/Weekly.jsx"
import Apps from "./components/Apps.jsx"

const API = "http://localhost:5000"

export default function App() {
  const [tab, setTab] = useState("today")
  const [status, setStatus] = useState(null)
  const [todayData, setTodayData] = useState(null)
  const [weeklyData, setWeeklyData] = useState(null)
  const [appsData, setAppsData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [pulse, setPulse] = useState(false)

  const fetchData = async () => {
    try {
      const [s, t, w, a] = await Promise.all([
        fetch(`${API}/status`).then(r => r.json()),
        fetch(`${API}/stats/today`).then(r => r.json()),
        fetch(`${API}/stats/weekly`).then(r => r.json()),
        fetch(`${API}/stats/apps`).then(r => r.json()),
      ])
      setStatus(s)
      setTodayData(t)
      setWeeklyData(w)
      setAppsData(a)
      setLastUpdated(new Date())
      setPulse(true)
      setTimeout(() => setPulse(false), 1000)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    fetchData()
    const i = setInterval(fetchData, 30000)
    return () => clearInterval(i)
  }, [])

  const score = todayData?.productive_pct ?? 0
  const scoreColor = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444"
  const tabs = ["Today", "Weekly", "Apps"]

  // Animated ring
  const r = 36, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div style={s.root}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulseRing { 0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0.4) } 50% { box-shadow:0 0 0 8px rgba(99,102,241,0) } }
        @keyframes spin { to { transform:rotate(360deg) } }
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.08); }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#334155; border-radius:4px; }
      `}</style>

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div style={s.brandName}>FocusFlow</div>
            <div style={s.brandTag}>Intelligent Tracker</div>
          </div>
        </div>

        {/* Score ring */}
        <div style={s.scoreWrap}>
          <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="7"/>
            <circle cx="50" cy="50" r={r} fill="none" stroke={scoreColor} strokeWidth="7"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease" }}/>
          </svg>
          <div style={s.scoreOverlay}>
            <div style={{ ...s.scoreNum, color: scoreColor }}>{score.toFixed(0)}%</div>
            <div style={s.scoreText}>focus</div>
          </div>
        </div>
        <div style={s.scoreHint}>
          {score >= 70 ? "🔥 Great focus!" : score >= 40 ? "⚡ Keep pushing" : "💤 Stay focused"}
        </div>

        {/* Nav */}
        <nav style={{ padding: "8px 12px", flex: 1 }}>
          <div style={s.navSection}>MENU</div>
          {tabs.map(t => (
            <button key={t} className="nav-btn" onClick={() => setTab(t.toLowerCase())} style={{
              ...s.navBtn,
              background: tab === t.toLowerCase() ? "rgba(99,102,241,0.15)" : "transparent",
              color: tab === t.toLowerCase() ? "#818cf8" : "#64748b",
              borderLeft: `2px solid ${tab === t.toLowerCase() ? "#6366f1" : "transparent"}`
            }}>
              <span style={s.navIcon}>{t === "Today" ? "◉" : t === "Weekly" ? "▦" : "❑"}</span>
              {t}
            </button>
          ))}
        </nav>

        {/* Live status */}
        <div style={s.liveBox}>
          <div style={s.liveHeader}>
            <div style={{ ...s.liveDot, animation: pulse ? "pulseRing 1s ease" : "none",
              background: status?.is_productive ? "#22c55e" : "#ef4444" }} />
            <span style={s.liveLabel}>LIVE</span>
            {lastUpdated && <span style={s.liveTime}>{lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
          </div>
          <div style={s.liveApp}>{status?.current_app || "Idle"}</div>
          <div style={s.liveCat}>
            <span style={{
              ...s.liveBadge,
              background: status?.is_productive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
              color: status?.is_productive ? "#22c55e" : "#ef4444"
            }}>
              {status?.is_productive ? "productive" : "non-productive"}
            </span>
            <span style={s.liveCatText}>{status?.category || "—"}</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.headerTitle}>{tab.charAt(0).toUpperCase() + tab.slice(1)} Overview</div>
            <div style={s.headerSub}>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          <button onClick={fetchData} style={s.refreshBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Stat cards */}
        {todayData && (
          <div style={s.statsRow}>
            <StatCard label="Productive" value={todayData.productive_hours} color="#22c55e" icon="✓" />
            <StatCard label="Non-Productive" value={todayData.nonproductive_hours} color="#ef4444" icon="✗" />
            <StatCard label="Gaming" value={todayData.game_hours} color="#f59e0b" icon="◈" />
            <StatCard label="Total Tracked" value={todayData.total_hours} color="#6366f1" icon="◎" />
          </div>
        )}

        {/* Content */}
        <div style={s.content}>
          <div style={{ animation: "fadeIn 0.3s ease" }} key={tab}>
            {tab === "today" && <Today data={todayData} />}
            {tab === "weekly" && <Weekly data={weeklyData} />}
            {tab === "apps" && <Apps data={appsData} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card" style={{
      background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14,
      padding: "16px 20px", flex: 1, transition: "all 0.2s ease", cursor: "default"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, letterSpacing: 0.3 }}>{label}</div>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`,
          display: "flex", alignItems: "center", justifyContent: "center", color, fontSize: 14 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", marginTop: 8 }}>
        {(value ?? 0).toFixed(2)}
        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>hrs</span>
      </div>
      <div style={{ height: 3, background: "#f1f5f9", borderRadius: 2, marginTop: 12 }}>
        <div style={{ height: "100%", width: `${Math.min((value ?? 0) / 8 * 100, 100)}%`,
          background: color, borderRadius: 2, transition: "width 1s ease" }} />
      </div>
    </div>
  )
}

const s = {
  root: {
    display: "flex", height: "100vh", overflow: "hidden",
    background: "#f1f5f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  sidebar: {
    width: 230, background: "#0f172a", display: "flex",
    flexDirection: "column", padding: "20px 0 16px", flexShrink: 0,
    borderRight: "1px solid #1e293b"
  },
  brand: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "0 20px 20px", borderBottom: "1px solid #1e293b"
  },
  brandIcon: {
    width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#818cf8)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
  },
  brandName: { color: "#f1f5f9", fontWeight: 700, fontSize: 15, letterSpacing: -0.3 },
  brandTag: { color: "#475569", fontSize: 11, marginTop: 1 },
  scoreWrap: { position: "relative", display: "flex", justifyContent: "center", marginTop: 20 },
  scoreOverlay: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" },
  scoreNum: { fontSize: 22, fontWeight: 800, lineHeight: 1 },
  scoreText: { fontSize: 11, color: "#475569", marginTop: 2 },
  scoreHint: { textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 6, marginBottom: 16 },
  navSection: { fontSize: 10, color: "#334155", letterSpacing: 1.5, padding: "8px 16px 6px", fontWeight: 600 },
  navBtn: {
    display: "flex", alignItems: "center", gap: 10, width: "100%",
    textAlign: "left", padding: "9px 16px", border: "none", cursor: "pointer",
    fontSize: 13, fontWeight: 500, transition: "all 0.15s", borderRadius: 6, marginBottom: 2
  },
  navIcon: { fontSize: 14, width: 18, textAlign: "center" },
  liveBox: {
    margin: "0 12px", background: "#1e293b", borderRadius: 12,
    padding: "14px 16px", border: "1px solid #334155"
  },
  liveHeader: { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 },
  liveDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  liveLabel: { fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: 1.5 },
  liveTime: { fontSize: 10, color: "#334155", marginLeft: "auto" },
  liveApp: { fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 6,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  liveCat: { display: "flex", alignItems: "center", gap: 6 },
  liveBadge: { fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600 },
  liveCatText: { fontSize: 11, color: "#475569" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 24px 16px", background: "#fff", borderBottom: "1px solid #e2e8f0"
  },
  headerTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a" },
  headerSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  refreshBtn: {
    display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
    border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff",
    color: "#64748b", fontSize: 13, cursor: "pointer", fontWeight: 500
  },
  statsRow: { display: "flex", gap: 14, padding: "16px 24px", background: "#fff", borderBottom: "1px solid #e2e8f0" },
  content: { flex: 1, overflowY: "auto", padding: "20px 24px" }
}