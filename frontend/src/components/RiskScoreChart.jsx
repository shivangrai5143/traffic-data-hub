import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const BAND_COLORS = ['#22c55e','#84cc16','#f59e0b','#f97316','#ef4444']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#f59e0b', fontWeight: 700 }}>{payload[0].value.toLocaleString()} accidents</p>
    </div>
  )
}

export default function RiskScoreChart({ data, loading }) {
  return (
    <div className="glass-card fade-in" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Risk Score Distribution</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Accidents grouped by incident risk band (0–1)</p>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 220 }} />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="band"
              tick={{ fontSize: 9, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="accidents" radius={[4,4,0,0]}>
              {data.map((_, i) => <Cell key={i} fill={BAND_COLORS[i % BAND_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
