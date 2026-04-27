import React from 'react'

export default function LocationsTable({ data, loading }) {
  return (
    <div className="glass-card fade-in" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>High-Risk Cities</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Top locations by accident count — Indian road network</p>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 44 }} />
          ))}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>City / State</th>
                <th style={{ textAlign: 'right' }}>Accidents</th>
                <th style={{ textAlign: 'right' }}>Fatalities</th>
                <th style={{ textAlign: 'right' }}>Casualties</th>
                <th style={{ textAlign: 'right' }}>Avg Risk</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const maxAcc  = data[0]?.accidents || 1
                const pct     = (row.accidents / maxAcc * 100)
                const risk    = pct > 80 ? 'fatal' : pct > 50 ? 'major' : 'minor'
                const riskLbl = pct > 80 ? 'Critical' : pct > 50 ? 'High' : 'Moderate'
                const riskVal = row.avg_risk != null ? Number(row.avg_risk).toFixed(2) : '—'
                return (
                  <tr key={row.name || i}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>📍</span>
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                      {Number(row.accidents).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', color: '#ef4444' }}>{row.fatalities}</td>
                    <td style={{ textAlign: 'right', color: '#f59e0b' }}>{Number(row.injuries ?? row.casualties ?? 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#a78bfa' }}>{riskVal}</td>
                    <td><span className={`badge badge-${risk}`}>{riskLbl}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
