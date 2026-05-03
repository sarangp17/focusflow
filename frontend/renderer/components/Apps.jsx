export default function Apps({ data }) {
  if (!data) return <p style={{ color: "#555" }}>Loading...</p>

  const apps = data.apps || []

  return (
    <div style={card}>
      <p style={cardTitle}>App usage today</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {apps.map((app, i) => (
          <div key={i} style={appRow}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                background: app.is_productive ? "#52b788" : app.is_game ? "#f4a261" : app.is_neutral ? "#4cc9f0" : "#e63946"
              }} />
              <div>
                <p style={{ margin: 0, fontSize: 13, color: "#ccc" }}>{app.app_name}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{app.category}</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{app.hours}h</p>
              <p style={{ margin: 0, fontSize: 11, color: app.is_productive ? "#52b788" : "#e63946" }}>
                {app.is_productive ? "productive" : app.is_game ? "game" : app.is_neutral ? "neutral" : "non-productive"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const card = { background: "#1a1a1a", border: "1px solid #222", borderRadius: 12, padding: "20px" }
const cardTitle = { margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1 }
const appRow = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#111", borderRadius: 8, border: "1px solid #222" }