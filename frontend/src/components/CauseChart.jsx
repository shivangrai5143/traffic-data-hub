import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#3b82f6','#a78bfa','#22c55e','#f59e0b','#ef4444','#06b6d4']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'capitalize' }}>{label}</p>
      <p style={{ color: '#a78bfa', fontWeight: 700 }}>{payload[0].value.toLocaleString()} accidents</p>
    </div>
  )
}

export default function CauseChart({ data, loading }) {
  return (
    <div className="glass-card fade-in" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Accident Causes</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Primary cause of each reported incident</p>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 220 }} />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="cause"
              tick={{ fontSize: 11, fill: 'var(--text-secondary)', textTransform: 'capitalize' }}
              axisLine={false}
              tickLine={false}
              width={78}
              tickFormatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="accidents" radius={[0,4,4,0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
