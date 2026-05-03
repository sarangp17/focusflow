import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#6366f1"]

export default function Today({ data }) {
  if (!data) return <Loader />

  const pieData = [
    { name: "Productive", value: parseFloat(data.productive_hours) },
    { name: "Non-Productive", value: parseFloat(data.nonproductive_hours) },
    { name: "Gaming", value: parseFloat(data.game_hours) },
    { name: "Neutral", value: parseFloat(data.neutral_hours) },
  ].filter(d => d.value > 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Donut */}
        <div style={card}>
          <SectionTitle>Today's breakdown</SectionTitle>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v} hrs`]}
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </div>

        {/* Top apps */}
        <div style={card}>
          <SectionTitle>Top apps</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.top_apps?.slice(0, 5).map((app, i) => {
              const pct = data.total_hours > 0 ? (app.hours / data.total_hours * 100) : 0
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                        background: app.is_productive ? "#f0fdf4" : "#fef2f2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: app.is_productive ? "#22c55e" : "#ef4444"
                      }}>{app.app_name.charAt(0)}</div>
                      <span style={{ fontSize: 12, color: "#334155", fontWeight: 500 }}>{app.app_name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>{app.hours}h</span>
                  </div>
                  <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${pct}%`,
                      background: app.is_productive ? "#22c55e" : "#ef4444",
                      borderRadius: 2, transition: "width 1s ease" }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top sites */}
      <div style={card}>
        <SectionTitle>Top sites</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {data.top_sites?.slice(0, 6).map((site, i) => (
            <div key={i} style={{
              padding: "10px 14px", background: "#f8fafc", borderRadius: 10,
              border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: site.is_productive ? "#22c55e" : "#ef4444" }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                  {site.site?.split("/")[0]}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{site.hours}h</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const card = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px" }
const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase",
    letterSpacing: 0.8, marginBottom: 14 }}>{children}</div>
)
const Loader = () => <div style={{ color: "#94a3b8", fontSize: 13, padding: 20 }}>Loading...</div>
const Empty = () => <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "50px 0" }}>No data yet</div>