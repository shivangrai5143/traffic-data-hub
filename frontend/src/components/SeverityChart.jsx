import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (percentage < 5) return null
  const r  = innerRadius + (outerRadius - innerRadius) * 0.55
  const x  = cx + r * Math.cos(-midAngle * RADIAN)
  const y  = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${percentage}%`}
    </text>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ color: d.color, fontWeight: 700, marginBottom: 4 }}>{d.name}</p>
      <p style={{ color: 'var(--text-primary)' }}>{d.value.toLocaleString()} accidents</p>
      <p style={{ color: 'var(--text-muted)' }}>{d.percentage}% of total</p>
    </div>
  )
}

export default function SeverityChart({ data, loading }) {
  return (
    <div className="glass-card fade-in" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Severity Breakdown</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Incident classification distribution</p>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 220 }} />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
                paddingAngle={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            {data.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {d.name}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {d.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
