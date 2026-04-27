import React from 'react'

const ICONS = {
  accidents:   '🚗',
  peak:        '⏰',
  zone:        '📍',
  fatalities:  '☠️',
  injuries:    '🏥',
  vehicles:    '🚙',
}

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="skeleton" style={{ height: 14, width: '60%' }} />
      <div className="skeleton" style={{ height: 36, width: '80%' }} />
      <div className="skeleton" style={{ height: 12, width: '40%' }} />
    </div>
  )
}

export default function KPICard({ label, value, sub, icon, color = 'var(--accent)', loading }) {
  return (
    <div className="glass-card fade-in" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <div style={{
          width: 36, height: 36,
          borderRadius: 8,
          background: `${color}22`,
          border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {icon}
        </div>
      </div>

      {loading ? <Skeleton /> : (
        <>
          <div className="count-anim" style={{
            fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}>
            {value ?? '—'}
          </div>
          {sub && (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</div>
          )}
        </>
      )}

      {/* Bottom accent bar */}
      <div style={{ height: 2, borderRadius: 1, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  )
}
