import React from 'react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from 'recharts'

export default function DayChart({ data, loading }) {
  return (
    <div className="glass-card fade-in" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Day of Week Pattern</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Which days are most dangerous?</p>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              tickFormatter={d => d.slice(0, 3)}
            />
            <Radar name="Accidents" dataKey="accidents" stroke="#22c55e" fill="#22c55e" fillOpacity={0.18} strokeWidth={2} />
            <Tooltip
              contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.82rem' }}
              itemStyle={{ color: '#22c55e' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
