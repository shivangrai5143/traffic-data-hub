import React from 'react'
import KPICard from '../components/KPICard'
import FilterBar from '../components/FilterBar'
import TrendsChart from '../components/TrendsChart'
import HourlyChart from '../components/HourlyChart'
import SeverityChart from '../components/SeverityChart'
import LocationsTable from '../components/LocationsTable'
import CauseChart from '../components/CauseChart'
import RiskScoreChart from '../components/RiskScoreChart'

export default function Dashboard({ data }) {
  const {
    filters, setFilters, clearFilters, filterOptions,
    summary, hourly, severity, trends, locations, causes, riskScores,
    loading,
  } = data

  const fmt = n => (n != null ? Number(n).toLocaleString() : '—')

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 48px' }}>
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
