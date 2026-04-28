import React, { useState, useMemo } from 'react'

// ── Color scale helpers ──────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t }

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
}

// Low → Mid → High: green → amber → red
const COLOR_LOW  = hexToRgb('#22c55e')
const COLOR_MID  = hexToRgb('#f97316')
const COLOR_HIGH = hexToRgb('#ef4444')

function getColor(value, min, max) {
  if (max <= min) return rgbToHex(...COLOR_LOW)
  const t = (value - min) / (max - min)  // 0..1
  let r, g, b
  if (t < 0.5) {
    const s = t * 2
    r = lerp(COLOR_LOW[0], COLOR_MID[0], s)
    g = lerp(COLOR_LOW[1], COLOR_MID[1], s)
    b = lerp(COLOR_LOW[2], COLOR_MID[2], s)
  } else {
    const s = (t - 0.5) * 2
    r = lerp(COLOR_MID[0], COLOR_HIGH[0], s)
    g = lerp(COLOR_MID[1], COLOR_HIGH[1], s)
    b = lerp(COLOR_MID[2], COLOR_HIGH[2], s)
  }
  return rgbToHex(r, g, b)
}

// ── India SVG path data (simplified, viewBox 68 6 30 30) ─────────────────
// Each entry: { id, name, d }
// Simplified outlines — good enough for a choropleth visualization
const INDIA_STATES = [
  {
    id: 'JK',
    name: 'Jammu & Kashmir',
    d: 'M 72 7 L 75 6.5 L 77 8 L 78 10 L 76 12 L 74 13 L 72 11 L 71 9 Z',
    cx: 74.5, cy: 9.5,
  },
  {
    id: 'HP',
    name: 'Himachal Pradesh',
    d: 'M 75 13 L 77 12 L 79 14 L 78 16 L 76 16 L 74 15 Z',
    cx: 76.5, cy: 14.5,
  },
  {
    id: 'PB',
    name: 'Punjab',
    d: 'M 72 14 L 75 13 L 76 16 L 74 17 L 72 16 Z',
    cx: 73.5, cy: 15.2,
  },
  {
    id: 'UK',
    name: 'Uttarakhand',
    d: 'M 78 14 L 81 13.5 L 82 16 L 79 17 L 78 16 Z',
    cx: 79.5, cy: 15.3,
  },
  {
    id: 'HR',
    name: 'Haryana',
    d: 'M 73 16 L 76 16 L 76 19 L 73 19 Z',
    cx: 74.5, cy: 17.5,
  },
  {
    id: 'DL',
    name: 'Delhi',
    d: 'M 76 17.5 L 78 17.5 L 78 19.5 L 76 19.5 Z',
    cx: 77, cy: 18.5,
  },
  {
    id: 'RJ',
    name: 'Rajasthan',
    d: 'M 69 16 L 73 16 L 74 19 L 73 24 L 69 24 L 68 20 Z',
    cx: 71, cy: 20,
  },
  {
    id: 'UP',
    name: 'Uttar Pradesh',
    d: 'M 76 17 L 82 16 L 84 18 L 84 22 L 80 23 L 76 23 L 74 21 L 74 19 Z',
    cx: 79, cy: 20,
  },
  {
    id: 'BR',
    name: 'Bihar',
    d: 'M 84 18 L 88 18 L 88 22 L 84 22 Z',
    cx: 86, cy: 20,
  },
  {
    id: 'SK',
    name: 'Sikkim',
    d: 'M 88 16 L 90 16 L 90 18 L 88 18 Z',
    cx: 89, cy: 17,
  },
  {
    id: 'AR',
    name: 'Arunachal Pradesh',
    d: 'M 90 14 L 97 14 L 97 17 L 90 17 Z',
    cx: 93.5, cy: 15.5,
  },
  {
    id: 'NL',
    name: 'Nagaland',
    d: 'M 93 17 L 96 17 L 96 19 L 93 19 Z',
    cx: 94.5, cy: 18,
  },
  {
    id: 'MN',
    name: 'Manipur',
    d: 'M 93 19 L 96 19 L 96 21 L 93 21 Z',
    cx: 94.5, cy: 20,
  },
  {
    id: 'MZ',
    name: 'Mizoram',
    d: 'M 91 21 L 94 21 L 94 23 L 91 23 Z',
    cx: 92.5, cy: 22,
  },
  {
    id: 'TR',
    name: 'Tripura',
    d: 'M 89 20 L 91 20 L 91 22.5 L 89 22.5 Z',
    cx: 90, cy: 21.2,
  },
  {
    id: 'ML',
    name: 'Meghalaya',
    d: 'M 88 18 L 92 18 L 92 21 L 88 21 Z',
    cx: 90, cy: 19.5,
  },
  {
    id: 'AS',
    name: 'Assam',
    d: 'M 88 16 L 93 16 L 93 18 L 88 18 Z',
    cx: 90.5, cy: 17,
  },
  {
    id: 'WB',
    name: 'West Bengal',
    d: 'M 86 18 L 90 18 L 90 26 L 86 26 Z',
    cx: 88, cy: 22,
  },
  {
    id: 'JH',
    name: 'Jharkhand',
    d: 'M 84 22 L 88 22 L 88 26 L 84 26 Z',
    cx: 86, cy: 24,
  },
  {
    id: 'OD',
    name: 'Odisha',
    d: 'M 82 24 L 87 24 L 87 29 L 82 29 Z',
    cx: 84.5, cy: 26.5,
  },
  {
    id: 'CG',
    name: 'Chhattisgarh',
    d: 'M 78 22 L 84 22 L 84 28 L 78 28 Z',
    cx: 81, cy: 25,
  },
  {
    id: 'MP',
    name: 'Madhya Pradesh',
    d: 'M 73 22 L 80 22 L 80 27 L 73 27 Z',
    cx: 76.5, cy: 24.5,
  },
  {
    id: 'GJ',
    name: 'Gujarat',
    d: 'M 68 20 L 73 20 L 73 27 L 69 27 L 68 24 Z',
    cx: 70.5, cy: 23.5,
  },
  {
    id: 'MH',
    name: 'Maharashtra',
    d: 'M 70 27 L 80 27 L 80 32 L 74 34 L 70 31 Z',
    cx: 75, cy: 30.5,
  },
  {
    id: 'TS',
    name: 'Telangana',
    d: 'M 78 27 L 84 27 L 84 32 L 78 32 Z',
    cx: 81, cy: 29.5,
  },
  {
    id: 'AP',
    name: 'Andhra Pradesh',
    d: 'M 78 32 L 86 32 L 86 35 L 80 36 L 78 34 Z',
    cx: 82, cy: 34,
  },
  {
    id: 'KA',
    name: 'Karnataka',
    d: 'M 72 32 L 79 32 L 79 37 L 74 38 L 71 36 Z',
    cx: 75, cy: 35,
  },
  {
    id: 'TN',
    name: 'Tamil Nadu',
    d: 'M 75 37 L 81 36 L 81 40 L 78 42 L 75 40 Z',
    cx: 78, cy: 39,
  },
  {
    id: 'KL',
    name: 'Kerala',
    d: 'M 72 36 L 75 36 L 75 42 L 72 42 Z',
    cx: 73.5, cy: 39,
  },
  {
    id: 'GA',
    name: 'Goa',
    d: 'M 71.5 33 L 73.5 33 L 73.5 35 L 71.5 35 Z',
    cx: 72.5, cy: 34,
  },
]

// Map from our dataset state names → SVG state IDs
const STATE_NAME_TO_ID = {
  'delhi':       'DL',
  'karnataka':   'KA',
  'maharashtra': 'MH',
  'punjab':      'PB',
  'tamil nadu':  'TN',
  'telangana':   'TS',
  'west bengal': 'WB',
}

// ── Component ────────────────────────────────────────────────────────────
export default function ChoroplethMap({ mapData, loading, year }) {
  const [tooltip, setTooltip] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Build lookup: state-id → count
  const countById = useMemo(() => {
    if (!mapData?.states) return {}
    const lookup = {}
    Object.entries(mapData.states).forEach(([stateName, count]) => {
      const id = STATE_NAME_TO_ID[stateName.toLowerCase().trim()]
      if (id) lookup[id] = { count, stateName }
      else console.warn('[ChoroplethMap] Unmatched state:', stateName)
    })
    return lookup
  }, [mapData])

  // Color scale bounds
  const { minVal, maxVal } = useMemo(() => {
    const vals = Object.values(countById).map(v => v.count)
    return { minVal: Math.min(...vals, 0), maxVal: Math.max(...vals, 1) }
  }, [countById])

  const handleMouseMove = (e, state, entry) => {
    const rect = e.currentTarget.closest('svg').getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setTooltip({ state, entry })
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,13,20,0.7)', borderRadius: 'var(--radius)',
          zIndex: 10,
        }}>
          <div style={{
            width: 36, height: 36, border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%',
            animation: 'map-spin 0.8s linear infinite',
          }} />
        </div>
      )}

      <svg
        viewBox="66 5 34 42"
        style={{ width: '100%', height: '100%', display: 'block' }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <filter id="state-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.3" floodOpacity="0.4" />
          </filter>
        </defs>

        {INDIA_STATES.map(state => {
          const entry = countById[state.id]
          const hasData = Boolean(entry)
          const fill = hasData
            ? getColor(entry.count, minVal, maxVal)
            : '#1e293b'
          const stroke = hasData ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'

          return (
            <path
              key={state.id}
              d={state.d}
              fill={fill}
              stroke={stroke}
              strokeWidth={0.15}
              style={{
                transition: 'fill 0.5s ease',
                cursor: hasData ? 'pointer' : 'default',
                filter: hasData ? 'url(#state-shadow)' : 'none',
              }}
              onMouseEnter={e => handleMouseMove(e, state, entry)}
              onMouseMove={e => handleMouseMove(e, state, entry)}
              onMouseLeave={() => setTooltip(null)}
            />
          )
        })}

        {/* State labels for data states */}
        {INDIA_STATES.filter(s => countById[s.id]).map(state => (
          <text
            key={`label-${state.id}`}
            x={state.cx}
            y={state.cy}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: state.id === 'DL' ? '0.6px' : '0.8px',
              fill: '#fff',
              fontWeight: 700,
              pointerEvents: 'none',
              textShadow: '0 0 2px rgba(0,0,0,0.8)',
              userSelect: 'none',
            }}
          >
            {state.id}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: mousePos.x + 12,
          top: mousePos.y - 10,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          pointerEvents: 'none',
          zIndex: 20,
          minWidth: 180,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'tooltip-in 0.15s ease',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, fontSize: '0.9rem' }}>
            {tooltip.entry?.stateName ?? tooltip.state.name}
          </div>
          {tooltip.entry ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Accidents</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{tooltip.entry.count.toLocaleString()}</span>
              </div>
              {mapData?.severity?.[tooltip.entry.stateName] && (() => {
                const sev = mapData.severity[tooltip.entry.stateName]
                return (
                  <>
                    <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                    {[['Fatal', '#ef4444'], ['Major', '#f59e0b'], ['Minor', '#22c55e']].map(([k, c]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <span style={{ color: c, fontSize: '0.75rem' }}>{k}</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600 }}>{(sev[k] ?? 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </>
                )
              })()}
              {mapData?.avg_risk?.[tooltip.entry.stateName] != null && (
                <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Avg Risk: <strong style={{ color: '#a78bfa' }}>{mapData.avg_risk[tooltip.entry.stateName]}</strong>
                </div>
              )}
              <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Year: <strong style={{ color: 'var(--text-secondary)' }}>{year ?? 'All'}</strong>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No data available</div>
          )}
        </div>
      )}
    </div>
  )
}
