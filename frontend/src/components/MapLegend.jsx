import React from 'react'

const STOPS = [
  { pct: 0,   color: '#22c55e', label: 'Low' },
  { pct: 50,  color: '#f97316', label: 'Medium' },
  { pct: 100, color: '#ef4444', label: 'High' },
]

export default function MapLegend({ minVal, maxVal }) {
  return (
    <div style={{
      background: 'rgba(10,13,20,0.85)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '14px 18px',
      minWidth: 180,
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Accident Density
      </div>

      {/* Gradient bar */}
      <div style={{
        height: 10,
        borderRadius: 99,
        background: 'linear-gradient(90deg, #22c55e, #f97316, #ef4444)',
        marginBottom: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }} />

      {/* Min / Max labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 600 }}>
          {(minVal ?? 0).toLocaleString()}
        </span>
        <span style={{ fontSize: '0.72rem', color: '#f97316', fontWeight: 600 }}>
          {Math.round(((minVal ?? 0) + (maxVal ?? 0)) / 2).toLocaleString()}
        </span>
        <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>
          {(maxVal ?? 0).toLocaleString()}
        </span>
      </div>

      {/* Category dots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[
          { color: '#22c55e', label: 'Low risk zone', range: '< 1/3 max' },
          { color: '#f97316', label: 'Medium risk',   range: '1/3 – 2/3 max' },
          { color: '#ef4444', label: 'High risk zone', range: '> 2/3 max' },
          { color: '#1e293b', label: 'No data',        range: '' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 10, height: 10,
              borderRadius: '50%',
              background: item.color,
              border: '1px solid rgba(255,255,255,0.15)',
              flexShrink: 0,
            }} />
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
              {item.label}
              {item.range && <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>({item.range})</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
