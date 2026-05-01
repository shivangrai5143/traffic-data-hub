import React, { useState, useEffect } from 'react'
import InsightCard from '../components/InsightCard'
import YearlyTrendChart from '../components/YearlyTrendChart'
import client from '../api/client'

function DataQualityBadge({ dq }) {
  if (!dq) return null
  return (
    <div className="glass-card" style={{ padding: '18px 22px', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Source File</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#3b82f6' }}>{dq.source_file}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Rows</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{dq.raw_rows?.toLocaleString()}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Null Values</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: dq.total_nulls > 0 ? '#f59e0b' : '#22c55e' }}>
          {dq.total_nulls === 0 ? '✓ None' : dq.total_nulls}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date Range</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {dq.date_range?.start} → {dq.date_range?.end}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cities</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{dq.cities}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>States</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{dq.states}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Columns</span>
        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{dq.columns?.length}</span>
      </div>
    </div>
  )
}

export default function Insights({ filterOptions }) {
  const [insights,    setInsights]    = useState([])
  const [yearlyData,  setYearlyData]  = useState([])
  const [dataQuality, setDataQuality] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [location,    setLocation]    = useState('All')

  useEffect(() => {
    setLoading(true)
    const params = location && location !== 'All' ? { location } : {}
    Promise.all([
      client.get('/api/insights',     { params }),
      client.get('/api/yearly-trend', { params }),
      client.get('/api/data-quality'),
    ]).then(([ins, yr, dq]) => {
      setInsights(ins.data)
      setYearlyData(yr.data)
      setDataQuality(dq.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [location])

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 64px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>💡</span> Key Insights
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 8, maxWidth: 640 }}>
              Automatically computed narrative findings from <strong style={{ color: 'var(--accent)' }}>20,000 real Indian road accident records</strong>.
              Each insight is derived directly from the dataset — no approximations.
            </p>
          </div>
          {/* Location filter */}
          {filterOptions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter by State/City</label>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="filter-select"
                style={{ minWidth: 200 }}
              >
                {(filterOptions.locations ?? ['All']).map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Data Quality Badge — Phase 3 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Phase 3 — Data Quality Report
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        {loading
          ? <div className="skeleton" style={{ height: 88 }} />
          : <DataQualityBadge dq={dataQuality} />
        }
      </div>

      {/* Yearly Trend — Phase 4 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Phase 4 — Yearly Trend Analysis
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <YearlyTrendChart data={yearlyData} loading={loading} />
      </div>

      {/* Insights Grid — Phase 6 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Phase 6 — Storytelling Insights
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 130 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {insights.map((ins, i) => (
            <InsightCard key={ins.id} insight={ins} index={i} />
          ))}
        </div>
      )}

      {/* Pipeline diagram — Phase 10 reference */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Architecture — End-to-End Pipeline
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <div className="glass-card" style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
            {[
              { icon: '📄', label: 'CSV Dataset', sub: 'indian_roads_dataset.csv\n20,000 rows · 24 columns', color: '#22c55e' },
              { arrow: true },
              { icon: '🐍', label: 'pandas Pipeline', sub: 'Cleaning · Feature Eng.\nAggregations · Insights', color: '#f59e0b' },
              { arrow: true },
              { icon: '⚡', label: 'FastAPI Backend', sub: '14 REST endpoints\nPort 8000', color: '#3b82f6' },
              { arrow: true },
              { icon: '⚛️', label: 'React Dashboard', sub: 'Recharts · Tailwind\nLive filters + 3 pages', color: '#a78bfa' },
            ].map((item, i) =>
              item.arrow ? (
                <div key={i} style={{ fontSize: 24, color: 'var(--text-muted)', padding: '0 8px', userSelect: 'none' }}>→</div>
              ) : (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 24px',
                  borderRadius: 12,
                  background: `${item.color}10`,
                  border: `1px solid ${item.color}30`,
                  minWidth: 160,
                  textAlign: 'center',
                }}>
                  <span style={{ fontSize: 28 }}>{item.icon}</span>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{item.sub}</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
