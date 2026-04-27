import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: '0.82rem',
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.name === 'ma7' ? '7-day avg' : 'Accidents'}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

export default function TrendsChart({ data, loading }) {
  // Thin out labels for readability
  const tickCount = Math.min(data.length, 10)
  const step = Math.max(1, Math.floor(data.length / tickCount))

  return (
    <div className="glass-card fade-in" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Traffic Trends</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Daily accidents with 7-day moving average</p>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 220 }} />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              tickFormatter={(v, i) => i % step === 0 ? v.slice(5) : ''}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '0.78rem' }} />
            <Line type="monotone" dataKey="accidents" stroke="#3b82f6" strokeWidth={2} dot={false} name="Accidents" />
            <Line type="monotone" dataKey="ma7" stroke="#a78bfa" strokeWidth={2} dot={false} strokeDasharray="4 3" name="7-day avg" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
