import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

export default function Weekly({ data }) {
  if (!data) return <p style={{ color: "#555" }}>Loading...</p>

  const chartData = data.weekly?.map(d => ({
    date: d.date.slice(5),
    Productive: d.productive_hours,
    "Non-Productive": d.nonproductive_hours,
    Gaming: d.game_hours
  }))

  return (
    <div style={card}>
      <p style={cardTitle}>Last 7 days</p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" stroke="#555" tick={{ fill: "#888", fontSize: 12 }} />
          <YAxis stroke="#555" tick={{ fill: "#888", fontSize: 12 }} unit="h" />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
            formatter={(v) => `${v} hrs`}
          />
          <Legend />
          <Bar dataKey="Productive" fill="#52b788" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Non-Productive" fill="#e63946" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gaming" fill="#f4a261" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const card = { background: "#1a1a1a", border: "1px solid #222", borderRadius: 12, padding: "20px" }
const cardTitle = { margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1 }