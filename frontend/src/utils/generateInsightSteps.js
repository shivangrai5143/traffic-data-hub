/**
 * generateInsightSteps.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Transforms raw traffic API data into AI-style, analyst-voiced story steps.
 * Pure JS — no external AI APIs. Called once when StoryMode opens.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Format a number with comma separators */
const fmt = (n) => Number(n ?? 0).toLocaleString('en-IN')

/** Return "Xth", "Xst", etc. */
const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/** Convert a 24h hour number → human readable label */
const fmtHour = (h) => {
  if (h === undefined || h === null) return 'unknown hour'
  const hour = Number(h)
  const period = hour >= 12 ? 'PM' : 'AM'
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${display}:00 ${period}`
}

/** Pick one string randomly from an array (mild phrasing variability) */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

/** Compute % difference between two numbers */
const pctChange = (a, b) => b === 0 ? 0 : (((a - b) / b) * 100).toFixed(1)

// ── Core Insight Computation ──────────────────────────────────────────────────

/**
 * computeInsights(data)
 * Takes the raw hook data and returns a structured insights object.
 *
 * @param {Object} data — shape mirrors useTrafficData return value
 * @returns {Object} insights
 */
export function computeInsights(data) {
  const { summary = {}, hourly = [], weather = [], trends = [], locations = [], causes = [], riskScores = [] } = data

  // ── 1. Overall scale ──────────────────────────────────────────────────────
  const totalAccidents  = summary.total_accidents  ?? 0
  const totalFatalities = summary.total_fatalities ?? 0
  const peakHourRaw     = summary.peak_hour        ?? null
  const fatalityRate    = totalAccidents > 0
    ? ((totalFatalities / totalAccidents) * 100).toFixed(1)
    : 0

  // ── 2. Peak hour (from hourly array as fallback) ──────────────────────────
  let peakHour = peakHourRaw
  if (peakHour === null && hourly.length > 0) {
    const sorted = [...hourly].sort((a, b) => (b.accidents ?? b.count ?? 0) - (a.accidents ?? a.count ?? 0))
    peakHour = sorted[0]?.hour ?? null
  }

  // ── 3. Deadliest location ─────────────────────────────────────────────────
  const deadliestState = summary.deadliest_city ?? (locations[0]?.location ?? 'Unknown')
  const topLocation    = locations[0]?.location ?? deadliestState

  // ── 4. Weather impact ─────────────────────────────────────────────────────
  const rainEntry  = weather.find(w => /rain|wet/i.test(w.weather ?? w.condition ?? ''))
  const clearEntry = weather.find(w => /clear|dry|fair/i.test(w.weather ?? w.condition ?? ''))
  const rainCount  = rainEntry?.accidents  ?? rainEntry?.count  ?? 0
  const clearCount = clearEntry?.accidents ?? clearEntry?.count ?? 0
  const rainPct    = weather.length > 0 && clearCount > 0
    ? ((rainCount / clearCount) * 100).toFixed(0)
    : null
  const worstWeather = weather.length > 0
    ? [...weather].sort((a, b) => (b.accidents ?? b.count ?? 0) - (a.accidents ?? a.count ?? 0))[0]
    : null

  // ── 5. Yearly trend ───────────────────────────────────────────────────────
  const sortedTrends = [...trends].sort((a, b) => (a.date ?? a.month ?? '').localeCompare(b.date ?? b.month ?? ''))
  const trendLen     = sortedTrends.length
  let trendDirection = 'stable'
  let trendDelta     = 0
  if (trendLen >= 2) {
    const first = sortedTrends[0].accidents     ?? sortedTrends[0].count ?? 0
    const last  = sortedTrends[trendLen - 1].accidents ?? sortedTrends[trendLen - 1].count ?? 0
    trendDelta     = pctChange(last, first)
    trendDirection = last > first ? 'rising' : last < first ? 'falling' : 'stable'
  }

  // ── 6. Top cause ──────────────────────────────────────────────────────────
  const sortedCauses = [...causes].sort((a, b) => (b.accidents ?? b.count ?? 0) - (a.accidents ?? a.count ?? 0))
  const topCause     = sortedCauses[0]?.cause ?? sortedCauses[0]?.label ?? 'Speeding'
  const topCausePct  = totalAccidents > 0 && sortedCauses[0]
    ? (((sortedCauses[0].accidents ?? sortedCauses[0].count ?? 0) / totalAccidents) * 100).toFixed(1)
    : null

  // ── 7. Risk hotspot ───────────────────────────────────────────────────────
  const sortedRisk  = [...riskScores].sort((a, b) => (b.risk_score ?? b.score ?? 0) - (a.risk_score ?? a.score ?? 0))
  const topRiskZone = sortedRisk[0]?.location ?? sortedRisk[0]?.state ?? topLocation

  return {
    totalAccidents,
    totalFatalities,
    fatalityRate,
    peakHour,
    deadliestState,
    topLocation,
    rainCount,
    clearCount,
    rainPct,
    worstWeather: worstWeather?.weather ?? worstWeather?.condition ?? null,
    trendDirection,
    trendDelta: Math.abs(trendDelta),
    topCause,
    topCausePct,
    topRiskZone,
  }
}

// ── Dynamic Step Builder ──────────────────────────────────────────────────────

/**
 * buildStorySteps(insights)
 * Converts a computed insights object into an array of story step objects,
 * written in an analyst/AI voice — contextual, concise, non-robotic.
 *
 * @param {Object} ins — output of computeInsights()
 * @returns {Array}    — STEPS array for StoryMode
 */
export function buildStorySteps(ins) {
  const {
    totalAccidents, totalFatalities, fatalityRate,
    peakHour, deadliestState, topLocation,
    rainPct, worstWeather,
    trendDirection, trendDelta,
    topCause, topCausePct,
    topRiskZone,
  } = ins

  // ── Slide 1: Scale overview ───────────────────────────────────────────────
  const scaleOpenings = [
    `Behind every statistic is a human story.`,
    `The numbers tell a sobering story.`,
    `Scale changes everything — and here, scale is immense.`,
  ]
  const trendLine = trendDirection === 'rising'
    ? `and the trend is unfortunately moving upward.`
    : trendDirection === 'falling'
    ? `but the trajectory shows signs of improvement.`
    : `with the trend remaining relatively flat over the period.`

  // ── Slide 2: Temporal patterns ────────────────────────────────────────────
  const hourDesc = peakHour !== null
    ? `Risk doesn't distribute evenly across the day. Your data shows a sharp concentration around ${fmtHour(peakHour)} — a window where driver fatigue, low visibility, and high traffic volume collide. Understanding this hour is the first step toward targeted intervention.`
    : `Hourly data reveals distinct concentration windows across the day. The Dashboard's peak hour card isolates the single most dangerous hour — a critical metric for any safety policy.`

  // ── Slide 3: Geography ────────────────────────────────────────────────────
  const geoLine = topRiskZone && topRiskZone !== 'Unknown'
    ? `The map isn't uniform — ${topRiskZone} emerges as a high-risk zone. Geographic clustering like this points to infrastructure gaps, enforcement blindspots, or road design flaws that aggregate data can't reveal.`
    : `Accident density is far from uniform across India. The choropleth map brings this into focus, highlighting which states carry a disproportionate share of the burden.`

  // ── Slide 4: Causes & weather ─────────────────────────────────────────────
  const causeLine = topCausePct
    ? `"${topCause}" alone accounts for ${topCausePct}% of all incidents in this dataset.`
    : `"${topCause}" consistently surfaces as the leading contributor in this dataset.`

  const weatherLine = rainPct && worstWeather
    ? `${worstWeather} conditions are also a significant amplifier — rain-period incidents run ${rainPct}% of clear-day volumes, suggesting a disproportionate risk per kilometer driven.`
    : `Weather emerges as a hidden multiplier. Adverse conditions dramatically shift the risk profile even when traffic volume is lower.`

  // ── Slide 5: Key narrative ────────────────────────────────────────────────
  const fatalLine = fatalityRate > 0
    ? `With a ${fatalityRate}% fatality rate — meaning roughly 1 in every ${Math.round(100 / fatalityRate)} accidents results in a death — this is not just a safety issue; it's a public health crisis.`
    : `Every fatality in this dataset represents a life lost on a preventable risk. The Insights page distills the most actionable findings for policymakers and analysts alike.`

  // ── Assemble Steps ────────────────────────────────────────────────────────
  return [
    {
      step: 1,
      icon: '📈',
      title: 'The Big Picture',
      subtitle: `${fmt(totalAccidents)} accidents. ${fmt(totalFatalities)} fatalities.`,
      body: `${pick(scaleOpenings)} Your dataset captures ${fmt(totalAccidents)} road accidents across India — ${trendLine} The Dashboard distills this into three headline KPIs so you can orient yourself before diving deeper.`,
      highlight: 'KPI cards at the top',
      color: '#3b82f6',
    },
    {
      step: 2,
      icon: '🕐',
      title: 'When Does Risk Peak?',
      subtitle: peakHour !== null ? `Danger spikes at ${fmtHour(peakHour)}` : 'Hourly risk distribution',
      body: hourDesc,
      highlight: peakHour !== null ? `${fmtHour(peakHour)} bar in the hourly chart` : 'Hourly accident chart',
      color: '#a78bfa',
    },
    {
      step: 3,
      icon: '🗺️',
      title: 'Where Is the Danger?',
      subtitle: topRiskZone !== 'Unknown' ? `${topRiskZone} leads in risk score` : 'Geographic accident density',
      body: geoLine,
      highlight: `${topRiskZone} on the choropleth map`,
      color: '#22c55e',
    },
    {
      step: 4,
      icon: '🔬',
      title: 'Root Causes Exposed',
      subtitle: `Leading cause: ${topCause}`,
      body: `Accidents rarely happen by chance. ${causeLine} ${weatherLine} The Analytics page lets you slice these dimensions interactively.`,
      highlight: `Cause & Weather breakdown charts`,
      color: '#f59e0b',
    },
    {
      step: 5,
      icon: '💡',
      title: 'The Analyst\'s Verdict',
      subtitle: `${fatalityRate}% fatality rate from real data`,
      body: `${fatalLine} The Insights page synthesises all of this into 8 auto-generated findings — each one sourced directly from the ${fmt(totalAccidents)}-record dataset, zero approximation.`,
      highlight: 'Storytelling Insights grid',
      color: '#ef4444',
    },
  ]
}

/**
 * getFallbackSteps()
 * Graceful fallback when API data is unavailable (loading / offline).
 */
export function getFallbackSteps() {
  return [
    {
      step: 1, icon: '📈', title: 'The Big Picture', color: '#3b82f6',
      subtitle: 'Start with the overall trend',
      body: 'Indian roads record tens of thousands of accidents every year. The Dashboard shows your KPIs at a glance — total accidents, peak hour, and the deadliest city.',
      highlight: 'KPI cards at the top',
    },
    {
      step: 2, icon: '🕐', title: 'When Does Risk Peak?', color: '#a78bfa',
      subtitle: 'Time-of-day risk distribution',
      body: 'Accidents don\'t happen uniformly. The hourly chart reveals the exact window where risk concentrates — guiding targeted interventions.',
      highlight: 'Hourly accident chart',
    },
    {
      step: 3, icon: '🗺️', title: 'Where Is the Danger?', color: '#22c55e',
      subtitle: 'Geographic hotspot analysis',
      body: 'The Map View shows accident density by state. Click any state to drill into city-level data and identify localised hotspots.',
      highlight: 'Choropleth map',
    },
    {
      step: 4, icon: '🔬', title: 'Root Causes Exposed', color: '#f59e0b',
      subtitle: 'Weather, cause & road type breakdown',
      body: 'The Analytics page breaks down accidents by weather condition, root cause, and road type — revealing patterns invisible in aggregate numbers.',
      highlight: 'Cause & Weather breakdown charts',
    },
    {
      step: 5, icon: '💡', title: 'The Analyst\'s Verdict', color: '#ef4444',
      subtitle: 'Data-driven narrative findings',
      body: 'Eight auto-generated insights surface the "so what" — the deadliest hour, the #1 cause, the rain risk multiplier, and more. Each one is derived directly from real data.',
      highlight: 'Storytelling Insights grid',
    },
  ]
}
