import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
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
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{`${label}:00`}</p>
      <p style={{ color: '#3b82f6', fontWeight: 700 }}>{payload[0].value.toLocaleString()} accidents</p>
    </div>
  )
}

const PEAK_HOURS = [7, 8, 16, 17, 18]

export default function HourlyChart({ data, loading }) {
  return (
    <div className="glass-card fade-in" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Hourly Distribution</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>Accidents by hour of day (0–23)</p>
      </div>
      {loading ? (
        <div className="skeleton" style={{ height: 220 }} />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
              tickFormatter={h => `${h}h`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="accidents" radius={[4,4,0,0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.hour}
                  fill={PEAK_HOURS.includes(entry.hour) ? '#f59e0b' : '#3b82f6'}
                  fillOpacity={PEAK_HOURS.includes(entry.hour) ? 1 : 0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span><span style={{ color: '#f59e0b' }}>■</span> Rush hour peaks</span>
        <span><span style={{ color: '#3b82f6' }}>■</span> Off-peak hours</span>
      </div>
    </div>
  )
}
