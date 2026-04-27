import React from 'react'

export default function InsightCard({ insight, index }) {
  return (
    <div
      className="glass-card fade-in"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        animationDelay: `${index * 0.08}s`,
        borderLeft: `3px solid ${insight.color}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 120, height: 120,
        background: `radial-gradient(circle, ${insight.color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>{insight.icon}</span>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {insight.title}
          </h3>
        </div>
        {/* Stat badge */}
        <div style={{
          flexShrink: 0,
          padding: '4px 12px',
          borderRadius: 99,
          background: `${insight.color}22`,
          border: `1px solid ${insight.color}44`,
          color: insight.color,
          fontWeight: 800,
          fontSize: '0.85rem',
          whiteSpace: 'nowrap',
        }}>
          {insight.stat}
        </div>
      </div>

      {/* Finding */}
      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
        {insight.finding}
      </p>
    </div>
  )
}
