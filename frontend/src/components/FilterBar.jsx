import React from 'react'

export default function FilterBar({ filters, setFilters, filterOptions, clearFilters, loading }) {
  const update = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  return (
    <div className="glass-card" style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
      padding: '14px 20px',
      marginBottom: 24,
    }}>
      {/* Label */}
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginRight: 4 }}>
        Filters
      </span>

      {/* Date Start */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</label>
        <input
          type="date"
          value={filters.start}
          onChange={e => update('start', e.target.value)}
          className="filter-select"
          style={{ minWidth: 140 }}
        />
      </div>

      {/* Date End */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</label>
        <input
          type="date"
          value={filters.end}
          onChange={e => update('end', e.target.value)}
          className="filter-select"
          style={{ minWidth: 140 }}
        />
      </div>

      {/* Location */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
        <select
          value={filters.location}
          onChange={e => update('location', e.target.value)}
          className="filter-select"
        >
          {filterOptions.locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Severity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Severity</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {filterOptions.severities.map(s => (
            <button
              key={s}
              onClick={() => update('severity', s)}
              style={{
                padding: '7px 14px',
                borderRadius: 6,
                border: '1px solid',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.15s',
                borderColor: filters.severity === s ? 'var(--accent)' : 'var(--border)',
                background: filters.severity === s ? 'rgba(59,130,246,0.2)' : 'var(--bg-card)',
                color: filters.severity === s ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      <button
        onClick={clearFilters}
        style={{
          marginLeft: 'auto',
          padding: '8px 16px',
          border: '1px solid var(--border)',
          borderRadius: 6,
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: '0.82rem',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-active)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        ✕ Clear Filters
      </button>

      {loading && (
        <div style={{ marginLeft: 8, fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 500 }}>
          ⟳ Loading...
        </div>
      )}
    </div>
  )
}
