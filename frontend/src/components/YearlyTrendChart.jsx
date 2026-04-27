import React from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Year {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function YearlyTrendChart({ data, loading }) {
  return (
    <div className="glass-card fade-in" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Year-on-Year Accident Trend</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Total accidents, fatalities, and casualties aggregated by year
        </p>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 260 }} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }} />
            <Bar yAxisId="left" dataKey="accidents"  name="Accidents"  fill="#3b82f6" fillOpacity={0.75} radius={[4,4,0,0]} />
            <Bar yAxisId="left" dataKey="casualties" name="Casualties" fill="#f59e0b" fillOpacity={0.75} radius={[4,4,0,0]} />
            <Line yAxisId="right" type="monotone" dataKey="fatalities" name="Fatalities" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
