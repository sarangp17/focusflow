import { useState, useEffect } from "react"
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

  // Fetch all data
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
    } catch (e) {
      console.error("API error:", e)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const tabs = ["today", "weekly", "apps"]

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⏱</span>
          <span style={styles.logoText}>FocusFlow</span>
          <span style={styles.tagline}>Track. Understand. Improve.</span>
        </div>

        {/* Live status pill */}
        {status && (
          <div style={{
            ...styles.statusPill,
            background: status.is_productive ? "#1a3a2a" : "#3a1a1a",
            border: `1px solid ${status.is_productive ? "#2d6a4f" : "#6a2d2d"}`
          }}>
            <div style={{
              ...styles.statusDot,
              background: status.is_productive ? "#52b788" : "#e63946"
            }} />
            <span style={{ color: status.is_productive ? "#52b788" : "#e63946", fontSize: 13 }}>
              {status.current_app || "Idle"}
            </span>
          </div>
        )}
      </div>

      {/* Today summary cards */}
      {todayData && (
        <div style={styles.cards}>
          <Card label="Productive" value={todayData.productive_hours} unit="hrs" color="#52b788" />
          <Card label="Non-Productive" value={todayData.nonproductive_hours} unit="hrs" color="#e63946" />
          <Card label="Gaming" value={todayData.game_hours} unit="hrs" color="#f4a261" />
          <Card label="Productivity Score" value={todayData.productive_pct} unit="%" color="#4cc9f0" />
        </div>
      )}

      {/* Tab nav */}
      <div style={styles.tabBar}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.tabBtn,
              background: tab === t ? "#2d2d2d" : "transparent",
              color: tab === t ? "#ffffff" : "#888",
              borderBottom: tab === t ? "2px solid #4cc9f0" : "2px solid transparent"
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={styles.content}>
        {tab === "today" && <Today data={todayData} />}
        {tab === "weekly" && <Weekly data={weeklyData} />}
        {tab === "apps" && <Apps data={appsData} />}
      </div>
    </div>
  )
}

function Card({ label, value, unit, color }) {
  return (
    <div style={styles.card}>
      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 600, color }}>
        {value ?? 0}<span style={{ fontSize: 14, color: "#888", marginLeft: 4 }}>{unit}</span>
      </p>
    </div>
  )
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#111111",
    color: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 28px 16px",
    borderBottom: "1px solid #222"
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 22 },
  logoText: { fontSize: 20, fontWeight: 700, color: "#ffffff" },
  tagline: { fontSize: 12, color: "#555", marginLeft: 4 },
  statusPill: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "6px 14px", borderRadius: 20
  },
  statusDot: {
    width: 8, height: 8, borderRadius: "50%"
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    padding: "20px 28px"
  },
  card: {
    background: "#1a1a1a",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "16px 20px"
  },
  tabBar: {
    display: "flex",
    gap: 4,
    padding: "0 28px",
    borderBottom: "1px solid #222"
  },
  tabBtn: {
    padding: "10px 20px",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: "8px 8px 0 0",
    transition: "all 0.15s"
  },
  content: {
    flex: 1,
    padding: "24px 28px",
    overflowY: "auto"
  }
}