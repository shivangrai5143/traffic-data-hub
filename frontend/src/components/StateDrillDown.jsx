import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import client from '../api/client'

const PANEL_W = 400

function MiniTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: '0.78rem' }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color ?? 'var(--accent)', margin: 0 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function StateDrillDown({ stateName, onClose }) {
  const [cities,    setCities]    = useState([])
  const [causes,    setCauses]    = useState([])
  const [yearTrend, setYearTrend] = useState([])
  const [summary,   setSummary]   = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!stateName) return
    setLoading(true)
    // Normalise state name to match filter format
    const loc = stateName
    Promise.all([
      client.get('/api/cities',       { params: { state: loc } }),
      client.get('/api/causes',       { params: { location: loc } }),
      client.get('/api/yearly-trend', { params: { location: loc } }),
      client.get('/api/summary',      { params: { location: loc } }),
    ]).then(([c, ca, yt, sm]) => {
      setCities(c.data.slice(0, 8))
      setCauses(ca.data.slice(0, 6))
      setYearTrend(yt.data)
      setSummary(sm.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [stateName])

  if (!stateName) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
          backdropFilter: 'blur(2px)',
          animation: 'fade-in 0.2s ease',
        }}
      />

      {/* Slide-in Panel */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0,
        width: PANEL_W,
        height: '100vh',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        zIndex: 201,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
        animation: 'slide-in-right 0.3s cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 22px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky', top: 0,
          background: 'var(--bg-surface)',
          zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              State Drill-Down
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              📍 {stateName}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              borderRadius: 8,
              width: 34, height: 34,
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* KPI Strip */}
          {loading ? (
            <div className="skeleton" style={{ height: 72, borderRadius: 12 }} />
          ) : summary && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'Accidents',   value: summary.total_accidents?.toLocaleString(),  color: 'var(--accent)',       icon: '🚗' },
                { label: 'Fatalities',  value: summary.total_fatalities?.toLocaleString(), color: '#ef4444',             icon: '☠️' },
                { label: 'Avg Risk',    value: summary.avg_risk_score,                     color: '#a78bfa',             icon: '⚠️' },
              ].map(kpi => (
                <div key={kpi.label} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px 10px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{kpi.icon}</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: kpi.color }}>{kpi.value ?? '—'}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{kpi.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Year-on-Year Trend */}
          <div>
            <SectionLabel>Year-on-Year Trend</SectionLabel>
            {loading ? (
              <div className="skeleton" style={{ height: 150, borderRadius: 10 }} />
            ) : yearTrend.length === 0 ? (
              <Empty />
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 10px 8px' }}>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={yearTrend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<MiniTooltip />} />
                    <Line type="monotone" dataKey="accidents" name="Accidents" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                    <Line type="monotone" dataKey="fatalities" name="Fatalities" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Cities */}
          <div>
            <SectionLabel>Top Cities</SectionLabel>
            {loading ? (
              <div className="skeleton" style={{ height: 180, borderRadius: 10 }} />
            ) : cities.length === 0 ? (
              <Empty />
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 10px 8px' }}>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={cities} layout="vertical" margin={{ top: 0, right: 8, left: 4, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="city" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<MiniTooltip />} />
                    <Bar dataKey="accidents" name="Accidents" fill="#3b82f6" fillOpacity={0.8} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Causes */}
          <div>
            <SectionLabel>Top Causes</SectionLabel>
            {loading ? (
              <div className="skeleton" style={{ height: 160, borderRadius: 10 }} />
            ) : causes.length === 0 ? (
              <Empty />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {causes.map((c, i) => {
                  const max = causes[0]?.accidents || 1
                  const pct = Math.round((c.accidents / max) * 100)
                  const colors = ['#ef4444','#f97316','#f59e0b','#22c55e','#3b82f6','#a78bfa']
                  return (
                    <div key={c.cause} style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, padding: '10px 14px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{c.cause}</span>
                        <span style={{ fontSize: '0.8rem', color: colors[i] ?? 'var(--accent)', fontWeight: 700 }}>{c.accidents.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-surface)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: colors[i] ?? 'var(--accent)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
      {children}
    </div>
  )
}

function Empty() {
  return <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No data available</div>
}
