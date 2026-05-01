import React from 'react'
import KPICard from '../components/KPICard'
import FilterBar from '../components/FilterBar'
import TrendsChart from '../components/TrendsChart'
import HourlyChart from '../components/HourlyChart'
import SeverityChart from '../components/SeverityChart'
import LocationsTable from '../components/LocationsTable'
import CauseChart from '../components/CauseChart'
import RiskScoreChart from '../components/RiskScoreChart'
import client from '../api/client'

export default function Dashboard({ data }) {
  const {
    filters, setFilters, clearFilters, filterOptions,
    summary, hourly, severity, trends, locations, causes, riskScores,
    loading,
  } = data

  const fmt = n => (n != null ? Number(n).toLocaleString() : '-')

  const downloadCSV = async () => {
    const p = {}
    if (filters.start)                                  p.start    = filters.start
    if (filters.end)                                    p.end      = filters.end
    if (filters.location && filters.location !== 'All') p.location = filters.location
    if (filters.severity && filters.severity !== 'All') p.severity = filters.severity
    try {
      const { data: rows } = await client.get('/api/export', { params: p })
      if (!rows.length) return alert('No data to export for current filters.')
      const headers = Object.keys(rows[0])
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a'); a.href = url
      a.download = 'traffic_export.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch(e) { console.error(e) }
  }

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 48px' }}>

      {/* Dashboard header + Export */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Dashboard</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>Real-time overview of Indian road accident analytics</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={downloadCSV}
            style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            Export CSV
          </button>
          <button
            onClick={() => window.print()}
            style={{ padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.color = '#a78bfa' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            Print PDF
          </button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        clearFilters={clearFilters}
        loading={loading}
      />

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}>
        <KPICard label="Total Accidents"   value={fmt(summary?.total_accidents)}  sub="In selected period"        icon="🚗" color="var(--accent)"        loading={loading} />
        <KPICard label="Peak Accident Hour" value={summary?.peak_hour ?? '—'}     sub="Highest incident rate"     icon="⏰" color="var(--accent-amber)"  loading={loading} />
        <KPICard label="High-Risk City"    value={summary?.high_risk_zone?.split(',')[0] ?? '—'} sub={summary?.high_risk_zone ?? ''} icon="📍" color="var(--accent-red)" loading={loading} />
        <KPICard label="Total Fatalities"  value={fmt(summary?.total_fatalities)} sub="Confirmed deaths"           icon="☠️" color="#ef4444"              loading={loading} />
        <KPICard label="Total Casualties"  value={fmt(summary?.total_casualties)} sub="Reported casualties"        icon="🏥" color="#f59e0b"              loading={loading} />
        <KPICard label="Avg Risk Score"    value={summary?.avg_risk_score ?? '—'} sub="Scale 0 → 1 (higher = worse)" icon="⚠️" color="#a78bfa"          loading={loading} />
      </div>

      {/* Row 1: Trends + Severity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <TrendsChart data={trends} loading={loading} />
        <SeverityChart data={severity} loading={loading} />
      </div>

      {/* Row 2: Hourly */}
      <div style={{ marginBottom: 16 }}>
        <HourlyChart data={hourly} loading={loading} />
      </div>

      {/* Row 3: Cause + Risk */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <CauseChart data={causes} loading={loading} />
        <RiskScoreChart data={riskScores} loading={loading} />
      </div>

      {/* Row 4: Locations */}
      <LocationsTable data={locations} loading={loading} />
    </main>
  )
}
