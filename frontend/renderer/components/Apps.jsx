export default function Apps({ data }) {
  if (!data) return <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading...</div>

  const apps = data.apps || []
  const productive = apps.filter(a => a.is_productive)
  const nonproductive = apps.filter(a => !a.is_productive && !a.is_game && !a.is_neutral)
  const games = apps.filter(a => a.is_game)
  const neutral = apps.filter(a => a.is_neutral)
  const maxHours = Math.max(...apps.map(a => a.hours), 0.01)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary pills */}
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "Productive apps", count: productive.length, color: "#22c55e", bg: "#f0fdf4" },
          { label: "Non-productive", count: nonproductive.length, color: "#ef4444", bg: "#fef2f2" },
          { label: "Games", count: games.length, color: "#f59e0b", bg: "#fffbeb" },
          { label: "Neutral", count: neutral.length, color: "#6366f1", bg: "#eef2ff" },
        ].map((p, i) => (
          <div key={i} style={{ background: p.bg, borderRadius: 10, padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: p.color }}>{p.count}</div>
            <div style={{ fontSize: 11, color: p.color, fontWeight: 500 }}>{p.label}</div>
          </div>
        ))}
      </div>

      <Section title="Productive" color="#22c55e" apps={productive} maxHours={maxHours} />
      <Section title="Non-Productive" color="#ef4444" apps={nonproductive} maxHours={maxHours} />
      {games.length > 0 && <Section title="Gaming" color="#f59e0b" apps={games} maxHours={maxHours} />}
      {neutral.length > 0 && <Section title="Neutral" color="#6366f1" apps={neutral} maxHours={maxHours} />}
    </div>
  )
}

function Section({ title, color, apps, maxHours }) {
  if (!apps.length) return null
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8 }}>{title}</span>
        <span style={{ fontSize: 11, background: `${color}18`, color, borderRadius: 20,
          padding: "2px 8px", fontWeight: 600, marginLeft: 2 }}>{apps.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {apps.map((app, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                  {app.app_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{app.app_name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{app.category}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color }}>{app.hours}h</div>
            </div>
            <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2, marginLeft: 40 }}>
              <div style={{ height: "100%", width: `${(app.hours / maxHours) * 100}%`,
                background: color, borderRadius: 2, transition: "width 1s ease",
                opacity: 0.7 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}