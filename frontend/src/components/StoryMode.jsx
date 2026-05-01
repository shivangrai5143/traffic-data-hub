import React, { useState, useEffect } from 'react'

const STEPS = [
  {
    step: 1,
    icon: '📈',
    title: 'The Big Picture',
    subtitle: 'Start with the overall trend',
    body: 'Indian roads record tens of thousands of accidents every year. The Dashboard shows your KPIs at a glance — total accidents, peak hour, and the deadliest city. Start here to understand the scale of the problem.',
    highlight: 'KPI cards at the top',
    color: '#3b82f6',
  },
  {
    step: 2,
    icon: '📅',
    title: 'Year-by-Year Evolution',
    subtitle: 'How has the trend changed over time?',
    body: 'The Insights page shows a year-on-year breakdown of accidents, fatalities, and casualties.',
    highlight: 'Year-on-Year Trend chart',
    color: '#a78bfa',
  },
  {
    step: 3,
    icon: '🗺️',
    title: 'Geographic Hotspots',
    subtitle: 'Where is the danger concentrated?',
    body: 'The Map View shows accident density by state.',
    highlight: 'Choropleth map',
    color: '#22c55e',
  },
  {
    step: 4,
    icon: '🌧️',
    title: 'Understand the Causes',
    subtitle: 'What drives accidents?',
    body: 'The Analytics page breaks down accidents by weather and cause.',
    highlight: 'Weather & Cause charts',
    color: '#f59e0b',
  },
  {
    step: 5,
    icon: '💡',
    title: 'Key Insights',
    subtitle: 'Data-driven findings',
    body: 'Automatically generated insights give you the real story.',
    highlight: 'Insights grid',
    color: '#ef4444',
  },
]

export default function StoryMode({ onClose, onNavigate }) {
  const [step, setStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const current = STEPS[step]

  // Auto slide
  useEffect(() => {
    if (isPaused || step === STEPS.length - 1) return
    const timer = setTimeout(() => setStep(s => s + 1), 5000)
    return () => clearTimeout(timer)
  }, [step, isPaused])

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
  }

  const goPrev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const handleExit = () => {
    onNavigate('Dashboard')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[300] backdrop-blur-sm"
        style={{ background: 'rgba(0,0,0,0.65)' }}
      />

      {/* Story Card */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="
          fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[92vw] max-w-[520px]
          h-[85vh] max-h-[620px]
          flex flex-col
          z-[301] overflow-hidden rounded-[20px]
        "
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid ${current.color}44`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${current.color}22`,
        }}
      >
        {/* Progress Bar */}
        <div
          style={{
            height: 4,
            width: `${((step + 1) / STEPS.length) * 100}%`,
            background: current.color,
            transition: 'width 0.4s ease',
          }}
        />

        {/* Content Wrapper */}
        <div className="px-8 pt-6 pb-5 flex flex-col h-full">

          {/* Top Indicators */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === step ? 24 : 8,
                    background:
                      i === step
                        ? current.color
                        : i < step
                          ? `${current.color}66`
                          : 'var(--border)',
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-400">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pr-1">

            {/* Icon */}
            <div
              className="inline-flex mb-3 rounded-2xl px-3 py-2"
              style={{
                fontSize: 40,
                background: `${current.color}15`,
                border: `1px solid ${current.color}30`,
              }}
            >
              {current.icon}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold mb-1 text-white">
              {current.title}
            </h2>

            {/* Subtitle */}
            <p className="text-sm font-semibold mb-3" style={{ color: current.color }}>
              {current.subtitle}
            </p>

            {/* Body */}
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              {current.body}
            </p>

            {/* Highlight */}
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                background: `${current.color}12`,
                border: `1px solid ${current.color}30`,
              }}
            >
              👉
              <span className="text-sm text-gray-300">
                Focus on: <strong style={{ color: current.color }}>{current.highlight}</strong>
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 mt-4">
            {step > 0 && (
              <button
                onClick={goPrev}
                className="px-4 py-2 border rounded-lg text-sm text-gray-300"
              >
                ← Back
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={goNext}
                className="flex-1 px-4 py-2 rounded-lg text-white font-semibold"
                style={{
                  background: current.color,
                }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleExit}
                className="flex-1 px-4 py-2 rounded-lg text-white font-semibold"
                style={{
                  background: current.color,
                }}
              >
                Go to Dashboard ✓
              </button>
            )}

            {step < STEPS.length - 1 && (
              <button
                onClick={handleExit}
                className="px-3 py-2 border rounded-lg text-xs text-gray-400"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}