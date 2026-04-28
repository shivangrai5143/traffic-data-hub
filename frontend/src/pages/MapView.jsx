import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ChoroplethMap from '../components/ChoroplethMap'
import TimeSlider from '../components/TimeSlider'
import MapLegend from '../components/MapLegend'
import client from '../api/client'

export default function MapView() {
  const [years, setYears]       = useState([])
  const [year, setYear]         = useState(null)
  const [mapData, setMapData]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [playing, setPlaying]   = useState(false)
  const [speed, setSpeed]       = useState(1)
  const [severity, setSeverity] = useState('All')

  // Response cache: Map<`${year}-${severity}`, data>
  const cache = useRef(new Map())
  const intervalRef = useRef(null)

  // ── Fetch available years once ────────────────────────────────────────
  useEffect(() => {
    client.get('/api/map/years')
      .then(r => {
        const ys = r.data
        setYears(ys)
        if (ys.length) setYear(ys[0])
      })
      .catch(console.error)
  }, [])

  // ── Fetch map data when year / severity changes ───────────────────────
  const fetchMapData = useCallback(async (y, sev) => {
    if (y === null) return
    const key = `${y}-${sev}`
    if (cache.current.has(key)) {
      setMapData(cache.current.get(key))
      return
    }
    setLoading(true)
    try {
      const params = { year: y }
      if (sev && sev !== 'All') params.severity = sev
      const { data } = await client.get('/api/map', { params })
      cache.current.set(key, data)
      setMapData(data)
    } catch (e) {
      console.error('MapView fetch error', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMapData(year, severity)
  }, [year, severity, fetchMapData])

  // ── Animation loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing || !years.length) {
      clearInterval(intervalRef.current)
      return
    }
    const ms = Math.round(1500 / speed)
    intervalRef.current = setInterval(() => {
      setYear(prev => {
        const idx = years.indexOf(prev)
        if (idx < years.length - 1) return years[idx + 1]
        // loop back
        setPlaying(false)
        return prev
      })
    }, ms)
    return () => clearInterval(intervalRef.current)
  }, [playing, speed, years])

  // ── Derived stats ─────────────────────────────────────────────────────
  const stateEntries = useMemo(() => {
    if (!mapData?.states) return []
    return Object.entries(mapData.states)
      .sort((a, b) => b[1] - a[1])
  }, [mapData])

  const minVal = stateEntries.length ? stateEntries[stateEntries.length - 1][1] : 0
  const maxVal = stateEntries.length ? stateEntries[0][1] : 0

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 48px' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🗺️</span> Map View
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 6 }}>
            Interactive choropleth showing accident density by Indian state.
            Use the time slider or press <button onClick={() => setPlaying(p => !p)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', padding: 0, fontSize: 'inherit', fontFamily: 'inherit', textDecoration: 'underline dotted', textUnderlineOffset: 3 }}>Play</button> to animate through years.
          </p>
        </div>

        {/* Severity filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Severity</span>
          <select
            id="map-severity-filter"
            value={severity}
            onChange={e => setSeverity(e.target.value)}
            className="filter-select"
          >
            {['All', 'Fatal', 'Major', 'Minor'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        {[
          { label: 'Year', value: year ?? '—', icon: '📅', color: 'var(--accent)' },
          { label: 'Total Accidents', value: mapData?.total?.toLocaleString() ?? '—', icon: '🚗', color: 'var(--accent-amber)' },
          { label: 'States Tracked', value: stateEntries.length || '—', icon: '📍', color: 'var(--accent-green)' },
          { label: 'Top State', value: stateEntries[0]?.[0] ?? '—', icon: '⚠️', color: 'var(--accent-red)' },
          { label: 'Max Accidents', value: maxVal?.toLocaleString() ?? '—', icon: '📊', color: '#a78bfa' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card fade-in" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: '1.1rem' }}>{kpi.icon}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* ── Main layout: Map + Sidebar ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, marginBottom: 20 }}>

        {/* Map panel */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', position: 'relative', minHeight: 520 }}>
          {/* Map legend overlay */}
          <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 5 }}>
            <MapLegend minVal={minVal} maxVal={maxVal} />
          </div>
          <div style={{ width: '100%', height: '100%', minHeight: 520, padding: 12 }}>
            <ChoroplethMap mapData={mapData} loading={loading} year={year} />
          </div>
        </div>

        {/* Sidebar: State rankings */}
        <div className="glass-card fade-in" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto', maxHeight: 540 }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>State Rankings</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{year ?? 'All years'}</p>
          </div>
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 42, marginBottom: 8, borderRadius: 8 }} />
            ))
          ) : stateEntries.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', marginTop: 40 }}>
              No data for this selection
            </div>
          ) : stateEntries.map(([state, count], idx) => {
            const pct = maxVal > 0 ? (count / maxVal) * 100 : 0
            const rankColors = ['#ef4444', '#f97316', '#f59e0b']
            const rankColor = rankColors[idx] ?? 'var(--text-muted)'
            return (
              <div key={state} style={{
                padding: '10px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800,
                      color: idx < 3 ? rankColor : 'var(--text-muted)',
                      minWidth: 18, textAlign: 'right',
                    }}>
                      #{idx + 1}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{state}</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {count.toLocaleString()}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, background: 'var(--bg-card)', borderRadius: 99, overflow: 'hidden', marginLeft: 26 }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, var(--accent), ${idx < 3 ? rankColor : 'var(--accent)'})`,
                    borderRadius: 99,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Time Slider ─────────────────────────────────────────────── */}
      <TimeSlider
        year={year}
        setYear={y => { setPlaying(false); setYear(y) }}
        years={years}
        playing={playing}
        setPlaying={setPlaying}
        speed={speed}
        setSpeed={setSpeed}
      />
    </main>
  )
}
