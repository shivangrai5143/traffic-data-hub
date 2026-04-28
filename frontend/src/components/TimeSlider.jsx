import React from 'react'

export default function TimeSlider({
  year, setYear, years, playing, setPlaying, speed, setSpeed,
}) {
  if (!years.length) return null

  const minYear = years[0]
  const maxYear = years[years.length - 1]

  const pct = years.length > 1
    ? ((year - minYear) / (maxYear - minYear)) * 100
    : 0

  const stepBack = () => {
    const idx = years.indexOf(year)
    if (idx > 0) setYear(years[idx - 1])
  }
  const stepForward = () => {
    const idx = years.indexOf(year)
    if (idx < years.length - 1) setYear(years[idx + 1])
  }

  const SPEEDS = [0.5, 1, 2]

  return (
    <div className="glass-card" style={{
      padding: '20px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Year label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Year
          </span>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: 8,
            padding: '4px 14px',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.04em',
            boxShadow: '0 0 20px rgba(59,130,246,0.4)',
          }}>
            {year}
          </div>
        </div>

        {/* Speed selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Speed</span>
          {SPEEDS.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                background: speed === s ? 'rgba(59,130,246,0.2)' : 'transparent',
                border: `1px solid ${speed === s ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 6,
                color: speed === s ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '3px 9px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Slider track */}
      <div style={{ position: 'relative', padding: '4px 0' }}>
        {/* Custom fill track */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          width: `${pct}%`,
          height: 4,
          background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
          borderRadius: 99,
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          transition: 'width 0.3s ease',
          boxShadow: '0 0 8px rgba(59,130,246,0.5)',
        }} />
        <input
          type="range"
          id="time-slider"
          min={minYear}
          max={maxYear}
          step={1}
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="time-range-input"
          style={{ width: '100%' }}
        />
        {/* Year dots */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          position: 'relative',
        }}>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '2px 0',
              }}
            >
              <div style={{
                width: y === year ? 10 : 6,
                height: y === year ? 10 : 6,
                borderRadius: '50%',
                background: y === year
                  ? 'var(--accent)'
                  : y < year ? 'rgba(99,102,241,0.5)' : 'var(--border)',
                transition: 'all 0.3s ease',
                boxShadow: y === year ? '0 0 8px rgba(59,130,246,0.7)' : 'none',
              }} />
              <span style={{
                fontSize: '0.72rem',
                color: y === year ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: y === year ? 700 : 400,
                transition: 'color 0.2s',
              }}>
                {y}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {/* Prev */}
        <button
          onClick={stepBack}
          disabled={year === minYear}
          id="slider-prev-btn"
          style={{
            width: 38, height: 38,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: year === minYear ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: year === minYear ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          ◀
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => setPlaying(p => !p)}
          id="slider-play-btn"
          style={{
            width: 52, height: 52,
            borderRadius: '50%',
            background: playing
              ? 'linear-gradient(135deg, #6366f1, #3b82f6)'
              : 'linear-gradient(135deg, #3b82f6, #6366f1)',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1.3rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(59,130,246,0.5)',
            transition: 'transform 0.15s, box-shadow 0.2s',
            transform: playing ? 'scale(1.05)' : 'scale(1)',
            fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = playing ? 'scale(1.05)' : 'scale(1)' }}
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* Next */}
        <button
          onClick={stepForward}
          disabled={year === maxYear}
          id="slider-next-btn"
          style={{
            width: 38, height: 38,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: year === maxYear ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: year === maxYear ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          ▶
        </button>
      </div>

      {/* Animation status hint */}
      {playing && (
        <div style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--accent)',
          letterSpacing: '0.06em',
          animation: 'pulse-text 1.5s ease-in-out infinite',
        }}>
          ● ANIMATING — {speed}× speed
        </div>
      )}
    </div>
  )
}
