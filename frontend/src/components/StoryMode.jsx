import React, { useState } from 'react'

const STEPS = [
  {
    step: 1,
    icon: '📈',
    title: 'The Big Picture',
    subtitle: 'Start with the overall trend',
    body: 'Indian roads record tens of thousands of accidents every year. The Dashboard shows your KPIs at a glance — total accidents, peak hour, and the deadliest city. Start here to understand the scale of the problem.',
    action: 'Go to Dashboard',
    page: 'Dashboard',
    highlight: 'KPI cards at the top',
    color: '#3b82f6',
  },
  {
    step: 2,
    icon: '📅',
    title: 'Year-by-Year Evolution',
    subtitle: 'How has the trend changed over time?',
    body: 'The Insights page shows a year-on-year breakdown of accidents, fatalities, and casualties. Look for years with spikes — these often correlate with policy changes or infrastructure failures.',
    action: 'Go to Insights',
    page: 'Insights',
    highlight: 'Year-on-Year Trend chart',
    color: '#a78bfa',
  },
  {
    step: 3,
    icon: '🗺️',
    title: 'Geographic Hotspots',
    subtitle: 'Where is the danger concentrated?',
    body: 'The Map View shows accident density by state. Use the time slider to animate through years and watch how hotspots shift. Click any state to drill into its city-level data.',
    action: 'Go to Map',
    page: 'Map',
    highlight: 'Choropleth map + click a state',
    color: '#22c55e',
  },
  {
    step: 4,
    icon: '🌧️',
    title: 'Understand the Causes',
    subtitle: 'What drives accidents?',
    body: 'The Analytics page breaks down accidents by weather, day of week, cause, and road type. Rain dramatically increases fatality rate. Highways are deadlier than urban roads — despite lower volume.',
    action: 'Go to Analytics',
    page: 'Analytics',
    highlight: 'Weather & Cause charts',
    color: '#f59e0b',
  },
  {
    step: 5,
    icon: '💡',
    title: 'Key Narrative Insights',
    subtitle: 'Computed findings from 20,000 real records',
    body: '8 automatically generated insights give you the "so what" — the deadliest hour, the #1 cause, the rain risk multiplier, and more. Each insight is derived directly from data, no approximations.',
    action: 'Go to Insights',
    page: 'Insights',
    highlight: 'Storytelling Insights grid',
    color: '#ef4444',
  },
]

export default function StoryMode({ onClose, onNavigate }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else { onClose(); }
  }
  const goPrev = () => { if (step > 0) setStep(s => s - 1) }

  const handleAction = () => {
    onNavigate(current.page)
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 300,
          backdropFilter: 'blur(4px)',
          animation: 'fade-in 0.2s ease',
        }}
      />

      {/* Story Card */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 520,
        maxWidth: 'calc(100vw - 32px)',
        background: 'var(--bg-surface)',
        border: `1px solid ${current.color}44`,
        borderRadius: 20,
        zIndex: 301,
        overflow: 'hidden',
        boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${current.color}22`,
        animation: 'fade-in 0.25s ease',
      }}>

        {/* Colored top bar */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, ${current.color}, transparent)`,
          width: `${((step + 1) / STEPS.length) * 100}%`,
          transition: 'width 0.4s ease',
        }} />

        {/* Content */}
        <div style={{ padding: '28px 32px 24px' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  style={{
                    width: i === step ? 24 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: i === step ? current.color : i < step ? `${current.color}66` : 'var(--border)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Icon + Title */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 44,
              marginBottom: 12,
              display: 'inline-flex',
              background: `${current.color}15`,
              borderRadius: 16,
              padding: '10px 14px',
              border: `1px solid ${current.color}30`,
            }}>
              {current.icon}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {current.title}
            </h2>
            <p style={{ fontSize: '0.82rem', color: current.color, fontWeight: 600, margin: 0 }}>
              {current.subtitle}
            </p>
          </div>

          {/* Body */}
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: 20,
          }}>
            {current.body}
          </p>

          {/* Highlight hint */}
          <div style={{
            background: `${current.color}12`,
            border: `1px solid ${current.color}30`,
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 24,
          }}>
            <span style={{ fontSize: '1rem' }}>👉</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Focus on: <strong style={{ color: current.color }}>{current.highlight}</strong>
            </span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {step > 0 && (
              <button
                onClick={goPrev}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                }}
              >
                ← Back
              </button>
            )}

            <button
              onClick={handleAction}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: `linear-gradient(135deg, ${current.color}, ${current.color}bb)`,
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: `0 4px 20px ${current.color}44`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${current.color}66` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${current.color}44` }}
            >
              {current.action} {step < STEPS.length - 1 ? '→' : '✓ Finish'}
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: 10,
                background: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'color 0.2s',
              }}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
