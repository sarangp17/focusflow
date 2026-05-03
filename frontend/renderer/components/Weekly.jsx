import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts"

export default function Weekly({ data }) {
  if (!data) return <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading...</div>

  const chartData = data.weekly?.map(d => ({
    date: d.date.slice(5),
    Productive: parseFloat(d.productive_hours.toFixed(2)),
    NonProductive: parseFloat(d.nonproductive_hours.toFixed(2)),
    Gaming: parseFloat(d.game_hours.toFixed(2))
  }))

  const totalProd = data.weekly?.reduce((a, d) => a + d.productive_hours, 0) ?? 0
  const totalNon = data.weekly?.reduce((a, d) => a + d.nonproductive_hours, 0) ?? 0
  const best = data.weekly?.reduce((a, b) => a.productive_hours > b.productive_hours ? a : b)
  const avgProd = (totalProd / 7).toFixed(1)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total productive", value: `${totalProd.toFixed(1)}h`, color: "#22c55e" },
          { label: "Total wasted", value: `${totalNon.toFixed(1)}h`, color: "#ef4444" },
          { label: "Daily average", value: `${avgProd}h`, color: "#6366f1" },
          { label: "Best day", value: best?.date?.slice(5) || "—", color: "#f59e0b" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px",
            border: "1px solid #e2e8f0", borderTop: `3px solid ${m.color}` }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 16 }}>
          7-day activity
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }}
              formatter={(v, n) => [`${v}h`, n]} />
            <Bar dataKey="Productive" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="NonProductive" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={32} name="Non-Productive" />
            <Bar dataKey="Gaming" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
          {[["#22c55e", "Productive"], ["#ef4444", "Non-Productive"], ["#f59e0b", "Gaming"]].map(([c, l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}