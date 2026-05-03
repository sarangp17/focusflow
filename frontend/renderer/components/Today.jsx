import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = ["#52b788", "#e63946", "#f4a261", "#adb5bd"]

export default function Today({ data }) {
  if (!data) return <p style={{ color: "#555" }}>Loading...</p>

  const pieData = [
    { name: "Productive", value: data.productive_hours },
    { name: "Non-Productive", value: data.nonproductive_hours },
    { name: "Gaming", value: data.game_hours },
    { name: "Neutral", value: data.neutral_hours },
  ].filter(d => d.value > 0)

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Pie chart */}
        <div style={card}>
          <p style={cardTitle}>Today's breakdown</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v} hrs`} contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: "#555", textAlign: "center", paddingTop: 80 }}>No data yet — start tracking!</p>
          )}
        </div>

        {/* Top apps */}
        <div style={card}>
          <p style={cardTitle}>Top apps today</p>
          {data.top_apps?.map((app, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #222" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: app.is_productive ? "#52b788" : "#e63946" }} />
                <span style={{ fontSize: 13, color: "#ccc" }}>{app.app_name}</span>
              </div>
              <span style={{ fontSize: 13, color: "#888" }}>{app.hours}h</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top sites */}
      <div style={{ ...card, marginTop: 24 }}>
        <p style={cardTitle}>Top sites today</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {data.top_sites?.map((site, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#111", borderRadius: 8, border: "1px solid #222" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: site.is_productive ? "#52b788" : "#e63946", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                  {site.site?.split("/")[0]}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "#888", flexShrink: 0 }}>{site.hours}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const card = { background: "#1a1a1a", border: "1px solid #222", borderRadius: 12, padding: "20px" }
const cardTitle = { margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1 }