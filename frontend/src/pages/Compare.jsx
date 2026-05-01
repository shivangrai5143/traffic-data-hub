import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import client from '../api/client'

const ACCENT_A = '#3b82f6'
const ACCENT_B = '#f97316'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Merge two datasets by key for side-by-side chart ─────────────────────
function mergeSeries(dataA, dataB, key, labelA, labelB) {
  const mapA = Object.fromEntries((dataA || []).map(d => [d[key], d]))
  const mapB = Object.fromEntries((dataB || []).map(d => [d[key], d]))
  const allKeys = [...new Set([...Object.keys(mapA), ...Object.keys(mapB)])].sort()
  return allKeys.map(k => ({
    [key]: k,
    [labelA]: mapA[k]?.accidents ?? 0,
    [labelB]: mapB[k]?.accidents ?? 0,
  }))
}

// ── Mode tabs ─────────────────────────────────────────────────────────────
const MODES = [
  { id: 'year', label: '📅 Year vs Year' },
  { id: 'state', label: '🗺️ State vs State' },
]

export default function Compare({ filterOptions }) {
  const [mode, setMode] = useState('year')

  // Year mode
  const years = Array.from({ length: 11 }, (_, i) => 2015 + i)
  const [yearA, setYearA] = useState(2020)
  const [yearB, setYearB] = useState(2023)

  // State mode
  const states = filterOptions?.states?.filter(s => s !== 'All') ?? []
  const [stateA, setStateA] = useState('')
  const [stateB, setStateB] = useState('')

  const [dataA, setDataA] = useState(null)
  const [dataB, setDataB] = useState(null)
  const [ytA, setYtA] = useState([])
  const [ytB, setYtB] = useState([])
  const [loading, setLoading] = useState(false)

  // Init state defaults once options load
  useEffect(() => {
    if (states.length >= 2 && !stateA) {
      setStateA(states[0])
      setStateB(states[1])
    }
  }, [states.length]) // eslint-disable-line

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (mode === 'year') {
        const [a, b, ya, yb] = await Promise.all([
          client.get('/api/summary', { params: { start: `${yearA}-01-01`, end: `${yearA}-12-31` } }),
          client.get('/api/summary', { params: { start: `${yearB}-01-01`, end: `${yearB}-12-31` } }),
          client.get('/api/hourly',  { params: { start: `${yearA}-01-01`, end: `${yearA}-12-31` } }),
          client.get('/api/hourly',  { params: { start: `${yearB}-01-01`, end: `${yearB}-12-31` } }),
        ])
        setDataA({ ...a.data, label: String(yearA) })
        setDataB({ ...b.data, label: String(yearB) })
        setYtA(ya.data)
        setYtB(yb.data)
      } else {
        if (!stateA || !stateB) return
        const [a, b, ya, yb] = await Promise.all([
          client.get('/api/summary',      { params: { location: stateA } }),
          client.get('/api/summary',      { params: { location: stateB } }),
          client.get('/api/yearly-trend', { params: { location: stateA } }),
          client.get('/api/yearly-trend', { params: { location: stateB } }),
        ])
        setDataA({ ...a.data, label: stateA })
        setDataB({ ...b.data, label: stateB })
        setYtA(ya.data)
        setYtB(yb.data)
      }
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [mode, yearA, yearB, stateA, stateB])

  useEffect(() => { fetchData() }, [fetchData])

  // Merge hourly (year mode) or yearly (state mode)
  const hourlyMerged = mergeSeries(ytA, ytB,
    mode === 'year' ? 'hour' : 'year',
    dataA?.label ?? 'A',
    dataB?.label ?? 'B',
  )

  const kpiDefs = [
    { key: 'total_accidents',  label: 'Total Accidents',  icon: '🚗', fmt: n => Number(n).toLocaleString() },
    { key: 'total_fatalities', label: 'Fatalities',       icon: '☠️', fmt: n => Number(n).toLocaleString() },
    { key: 'total_casualties', label: 'Casualties',       icon: '🏥', fmt: n => Number(n).toLocaleString() },
    { key: 'avg_risk_score',   label: 'Avg Risk Score',   icon: '⚠️', fmt: n => Number(n).toFixed(3) },
    { key: 'peak_hour',        label: 'Peak Hour',        icon: '⏰', fmt: n => n },
    { key: 'high_risk_zone',   label: 'High-Risk Zone',   icon: '📍', fmt: n => (n ?? '').split(',')[0] },
  ]

  const labelA = dataA?.label ?? (mode === 'year' ? yearA : stateA)
  const labelB = dataB?.label ?? (mode === 'year' ? yearB : stateB)

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 64px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚖️</span> Compare Mode
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 6 }}>
          Side-by-side analytical comparison — <strong style={{ color: ACCENT_A }}>Year vs Year</strong> or <strong style={{ color: ACCENT_B }}>State vs State</strong>.
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              padding: '9px 20px',
              borderRadius: 10,
              border: `1px solid ${mode === m.id ? 'var(--accent)' : 'var(--border)'}`,
              background: mode === m.id ? 'rgba(59,130,246,0.15)' : 'var(--bg-card)',
              color: mode === m.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Selector Row */}
      <div className="glass-card" style={{ padding: '18px 22px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        {/* A selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.72rem', color: ACCENT_A, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            ▌ {mode === 'year' ? 'Year A' : 'State A'}
          </label>
          {mode === 'year' ? (
            <select value={yearA} onChange={e => setYearA(Number(e.target.value))} className="filter-select">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          ) : (
            <select value={stateA} onChange={e => setStateA(e.target.value)} className="filter-select">
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        <div style={{ fontSize: '1.4rem', color: 'var(--text-muted)', fontWeight: 800, alignSelf: 'flex-end', paddingBottom: 4 }}>vs</div>

        {/* B selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: '0.72rem', color: ACCENT_B, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
            ▌ {mode === 'year' ? 'Year B' : 'State B'}
          </label>
          {mode === 'year' ? (
            <select value={yearB} onChange={e => setYearB(Number(e.target.value))} className="filter-select">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          ) : (
            <select value={stateB} onChange={e => setStateB(e.target.value)} className="filter-select">
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        <button
          onClick={fetchData}
          className="btn-primary"
          style={{ alignSelf: 'flex-end', marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px' }}
        >
          {loading ? '⟳ Loading...' : '⚡ Compare'}
        </button>
      </div>

      {/* KPI Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {kpiDefs.map(kpi => {
          const vA = dataA?.[kpi.key]
          const vB = dataB?.[kpi.key]
          const numA = parseFloat(vA) || 0
          const numB = parseFloat(vB) || 0
          const diff = numA && numB ? (((numB - numA) / numA) * 100).toFixed(1) : null
          return (
            <div key={kpi.key} className="glass-card fade-in" style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: '1rem' }}>{kpi.icon}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: ACCENT_A, fontWeight: 700, marginBottom: 3 }}>{labelA}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {loading ? '—' : (vA != null ? kpi.fmt(vA) : '—')}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: ACCENT_B, fontWeight: 700, marginBottom: 3 }}>{labelB}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {loading ? '—' : (vB != null ? kpi.fmt(vB) : '—')}
                  </div>
                </div>
              </div>
              {diff !== null && !loading && (
                <div style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: parseFloat(diff) > 0 ? '#ef4444' : '#22c55e',
                  padding: '2px 8px',
                  background: parseFloat(diff) > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                  borderRadius: 6,
                  display: 'inline-block',
                }}>
                  {parseFloat(diff) > 0 ? '▲' : '▼'} {Math.abs(diff)}% {parseFloat(diff) > 0 ? 'higher in ' : 'lower in '}{labelB}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Chart comparison */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>
          {mode === 'year' ? 'Hourly Accident Distribution Comparison' : 'Year-on-Year Accident Trend Comparison'}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          {mode === 'year'
            ? `How accident timing differs between ${labelA} and ${labelB}`
            : `How accident volume trended over the years in ${labelA} vs ${labelB}`}
        </p>
        {loading ? (
          <div className="skeleton" style={{ height: 320 }} />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={hourlyMerged} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey={mode === 'year' ? 'hour' : 'year'}
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={false} tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: 12 }} />
              <Bar dataKey={labelA} fill={ACCENT_A} fillOpacity={0.8} radius={[4,4,0,0]} />
              <Bar dataKey={labelB} fill={ACCENT_B} fillOpacity={0.8} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </main>
  )
}
