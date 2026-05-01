import React, { useState, useEffect, useMemo } from 'react'
import { computeInsights, buildStorySteps, getFallbackSteps } from '../utils/generateInsightSteps'

// ── Auto-slide timer (ms per slide) ──────────────────────────────────────────
const SLIDE_DURATION = 5000

export default function StoryMode({ onClose, onNavigate, data }) {
  const [step,      setStep]     = useState(0)
  const [isPaused,  setIsPaused] = useState(false)
  const [progress,  setProgress] = useState(0)

  // ── Build steps dynamically from real API data ────────────────────────────
  const STEPS = useMemo(() => {
    if (!data || data.loading) return getFallbackSteps()
    try {
      const insights = computeInsights(data)
      return buildStorySteps(insights)
    } catch {
      return getFallbackSteps()
    }
  }, [data])

  const current    = STEPS[step]
  const isLast     = step === STEPS.length - 1
  const isFirst    = step === 0

  // ── Auto-slide with smooth progress bar ──────────────────────────────────
  useEffect(() => {
    setProgress(0)                    // reset progress on step change
  }, [step])

  useEffect(() => {
    if (isPaused || isLast) return

    // Animate the internal progress ring/bar
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + (100 / (SLIDE_DURATION / 100)), 100))
    }, 100)

    const slideTimer = setTimeout(() => setStep(s => s + 1), SLIDE_DURATION)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(slideTimer)
    }
  }, [step, isPaused, isLast])

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => {
    if (!isLast) {
      setProgress(0)
      setStep(s => s + 1)
    }
  }

  const goPrev = () => {
    if (!isFirst) {
      setProgress(0)
      setStep(s => s - 1)
    }
  }

  const handleExit = () => onNavigate('Dashboard')

  // ── Loading state ─────────────────────────────────────────────────────────
  const isLoading = data?.loading

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[300]"
        style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fade-in 0.2s ease',
        }}
      />

      {/* ── Story Card ────────────────────────────────────────────────────── */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(480px, calc(100vw - 32px))',
          maxHeight: 'min(580px, calc(100vh - 48px))',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 301,
          overflow: 'hidden',
          borderRadius: 20,
          background: 'var(--bg-surface)',
          border: `1px solid ${current.color}44`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${current.color}22`,
          animation: 'fade-in 0.25s ease',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        {/* ── Progress bar strips (Instagram-style) ───────────────────────── */}
        <div style={{ display: 'flex', gap: 3, padding: '10px 14px 0', flexShrink: 0 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => { setProgress(0); setStep(i) }}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 99,
                background: 'rgba(255,255,255,0.15)',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 99,
                  background: current.color,
                  width: i < step ? '100%' : i === step ? `${progress}%` : '0%',
                  transition: i === step ? 'none' : 'width 0.35s ease',
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Header row ──────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px 4px',
            flexShrink: 0,
          }}
        >
          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 5 }}>
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setProgress(0); setStep(i) }}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === step ? 20 : 7,
                  height: 7,
                  borderRadius: 99,
                  background: i === step
                    ? current.color
                    : i < step
                    ? `${current.color}70`
                    : 'rgba(255,255,255,0.15)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Counter + pause indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isPaused && !isLast && (
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                ⏸ PAUSED
              </span>
            )}
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              {step + 1} / {STEPS.length}
            </span>
            <button
              onClick={onClose}
              aria-label="Close story"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                width: 26,
                height: 26,
                borderRadius: 99,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Scrollable slide content ─────────────────────────────────────── */}
        <div
          key={step}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 22px 8px',
            scrollbarWidth: 'none',
            animation: 'fade-in 0.28s ease-out',
          }}
        >
          {/* Loading shimmer */}
          {isLoading ? (
            <div>
              <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: '60%', height: 22, borderRadius: 8, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 8, marginBottom: 16 }} />
              <div className="skeleton" style={{ width: '100%', height: 70, borderRadius: 8, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '100%', height: 40, borderRadius: 8 }} />
            </div>
          ) : (
            <>
              {/* Icon */}
              <div
                style={{
                  display: 'inline-flex',
                  fontSize: 36,
                  marginBottom: 12,
                  borderRadius: 14,
                  padding: '8px 12px',
                  background: `${current.color}18`,
                  border: `1px solid ${current.color}35`,
                  transition: 'all 0.4s ease',
                }}
              >
                {current.icon}
              </div>

              {/* Title */}
              <h2
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: 4,
                  lineHeight: 1.25,
                }}
              >
                {current.title}
              </h2>

              {/* Subtitle — data-derived label */}
              <p
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: current.color,
                  marginBottom: 12,
                  letterSpacing: '0.01em',
                }}
              >
                {current.subtitle}
              </p>

              {/* Body — analyst-voiced narrative */}
              <p
                style={{
                  fontSize: '0.865rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.72,
                  marginBottom: 14,
                }}
              >
                {current.body}
              </p>

              {/* Highlight hint */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  borderRadius: 10,
                  padding: '9px 12px',
                  background: `${current.color}10`,
                  border: `1px solid ${current.color}28`,
                  transition: 'all 0.4s ease',
                }}
              >
                <span style={{ fontSize: '0.9rem', flexShrink: 0, marginTop: 1 }}>👉</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Focus on:{' '}
                  <strong style={{ color: current.color, fontWeight: 700 }}>
                    {current.highlight}
                  </strong>
                </span>
              </div>
            </>
          )}
        </div>

        {/* ── Button row — always visible at bottom ────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 22px 16px',
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Back button — only visible when not on first slide */}
          <button
            onClick={goPrev}
            disabled={isFirst}
            aria-label="Previous slide"
            style={{
              padding: '9px 16px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: isFirst ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: isFirst ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              flexShrink: 0,
              opacity: isFirst ? 0.4 : 1,
            }}
            onMouseEnter={e => { if (!isFirst) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          >
            ← Back
          </button>

          {/* Primary action button */}
          {isLast ? (
            <button
              onClick={handleExit}
              style={{
                flex: 1,
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`,
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: `0 4px 18px ${current.color}50`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${current.color}70` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 18px ${current.color}50` }}
            >
              Go to Dashboard ✓
            </button>
          ) : (
            <button
              onClick={goNext}
              style={{
                flex: 1,
                padding: '10px 18px',
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`,
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: `0 4px 18px ${current.color}50`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${current.color}70` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 18px ${current.color}50` }}
            >
              Next →
            </button>
          )}

          {/* Skip button — only visible on non-last slides */}
          {!isLast && (
            <button
              onClick={handleExit}
              aria-label="Skip onboarding"
              style={{
                padding: '9px 14px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.35)',
                fontSize: '0.78rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </>
  )
}