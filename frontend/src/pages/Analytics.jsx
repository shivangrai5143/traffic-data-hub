import React from 'react'
import WeatherChart from '../components/WeatherChart'
import DayChart from '../components/DayChart'
import HourlyChart from '../components/HourlyChart'
import TrendsChart from '../components/TrendsChart'
import CauseChart from '../components/CauseChart'
import RiskScoreChart from '../components/RiskScoreChart'
import FilterBar from '../components/FilterBar'

export default function Analytics({ data }) {
  const {
    filters, setFilters, clearFilters, filterOptions,
    weather, days, hourly, trends, causes, roadTypes, riskScores,
    cities, loading,
  } = data

  return (
    <main style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 24px 48px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>Deep Analytics</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 6 }}>
          Advanced breakdown of Indian road accident patterns across cause, weather, time, and risk dimensions.
        </p>
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        clearFilters={clearFilters}
        loading={loading}
      />

      {/* Row 1: Weather + Day */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <WeatherChart data={weather} loading={loading} />
        <DayChart data={days} loading={loading} />
      </div>

      {/* Row 2: Cause + Risk Score */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <CauseChart data={causes} loading={loading} />
        <RiskScoreChart data={riskScores} loading={loading} />
      </div>

      {/* Row 3: Hourly */}
      <div style={{ marginBottom: 16 }}>
        <HourlyChart data={hourly} loading={loading} />
      </div>

      {/* Row 4: Trends */}
      <TrendsChart data={trends} loading={loading} />
    </main>
  )
}
