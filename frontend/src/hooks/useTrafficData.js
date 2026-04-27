import { useState, useEffect, useCallback, useRef } from 'react'
import client from '../api/client'

const DEFAULT_FILTERS = { start: '', end: '', location: 'All', severity: 'All' }

function buildParams(filters) {
  const p = {}
  if (filters.start)                                    p.start    = filters.start
  if (filters.end)                                      p.end      = filters.end
  if (filters.location && filters.location !== 'All')   p.location = filters.location
  if (filters.severity && filters.severity !== 'All')   p.severity = filters.severity
  return p
}

export function useTrafficData() {
  const [filters, setFilters]       = useState(DEFAULT_FILTERS)
  const [filterOptions, setFOpts]   = useState({ locations: ['All'], severities: ['All','Fatal','Major','Minor'] })
  const [summary, setSummary]       = useState(null)
  const [hourly, setHourly]         = useState([])
  const [severity, setSeverity]     = useState([])
  const [trends, setTrends]         = useState([])
  const [locations, setLocations]   = useState([])
  const [weather, setWeather]       = useState([])
  const [days, setDays]             = useState([])
  const [causes, setCauses]         = useState([])
  const [cities, setCities]         = useState([])
  const [roadTypes, setRoadTypes]   = useState([])
  const [riskScores, setRiskScores] = useState([])
  const [loading, setLoading]       = useState(true)
  const [backendOnline, setOnline]  = useState(false)
  const pingRef = useRef(null)

  // Heartbeat
  const ping = useCallback(async () => {
    try { await client.get('/health'); setOnline(true) }
    catch { setOnline(false) }
  }, [])

  useEffect(() => {
    ping()
    pingRef.current = setInterval(ping, 10000)
    return () => clearInterval(pingRef.current)
  }, [ping])

  // Load filter options once
  useEffect(() => {
    client.get('/api/filter-options').then(r => setFOpts(r.data)).catch(() => {})
  }, [])

  // Fetch all data when filters change
  const fetchAll = useCallback(async () => {
    setLoading(true)
    const p = buildParams(filters)
    const locParams = { ...p }
    delete locParams.location   // location filter doesn't apply to locations list itself
    try {
      const [sum, hr, sev, tr, loc, wx, dy, cau, cit, rt, rs] = await Promise.all([
        client.get('/api/summary',    { params: p }),
        client.get('/api/hourly',     { params: p }),
        client.get('/api/severity',   { params: p }),
        client.get('/api/trends',     { params: { ...p, days: 90 } }),
        client.get('/api/locations',  { params: { top_n: 10, ...(p.start && { start: p.start }), ...(p.end && { end: p.end }), ...(p.severity && { severity: p.severity }) } }),
        client.get('/api/weather',    { params: p }),
        client.get('/api/days',       { params: p }),
        client.get('/api/causes',     { params: p }),
        client.get('/api/cities',     { params: locParams }),
        client.get('/api/road-types', { params: p }),
        client.get('/api/risk-scores',{ params: p }),
      ])
      setSummary(sum.data)
      setHourly(hr.data)
      setSeverity(sev.data)
      setTrends(tr.data)
      setLocations(loc.data)
      setWeather(wx.data)
      setDays(dy.data)
      setCauses(cau.data)
      setCities(cit.data)
      setRoadTypes(rt.data)
      setRiskScores(rs.data)
    } catch (e) {
      console.error('fetchAll error', e)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchAll() }, [fetchAll])

  const clearFilters = () => setFilters(DEFAULT_FILTERS)

  return {
    filters, setFilters, clearFilters,
    filterOptions,
    summary, hourly, severity, trends, locations,
    weather, days, causes, cities, roadTypes, riskScores,
    loading, backendOnline,
    refetch: fetchAll,
  }
}
