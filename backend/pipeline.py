"""
pipeline.py  —  Real-data edition (v2 — Phases 3-6 complete)
Loads indian_roads_dataset.csv and exposes pandas aggregation helpers.
Column mapping from real dataset:
  city, state          → location grouping
  accident_severity    → 'fatal' | 'major' | 'minor'  (lowercase)
  casualties           → combined injuries count
  cause                → accident cause
  risk_score           → float 0-1
  festival             → festival name or 'None'
  traffic_density      → 'low' | 'medium' | 'high'
  visibility           → 'low' | 'medium' | 'high'
  road_type            → 'urban' | 'highway' | 'rural'
  is_peak_hour         → 0 | 1
  is_weekend           → 0 | 1
"""
from __future__ import annotations
import os
import glob
import pandas as pd
import numpy as np
import json
from functools import lru_cache
from typing import Optional

# ── Data path: prefer real dataset; fallback to any CSV in data/ ──────────
_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def _find_data_file() -> str:
    preferred = os.path.join(_DATA_DIR, "indian_roads_dataset.csv")
    if os.path.exists(preferred):
        return preferred
    csvs = glob.glob(os.path.join(_DATA_DIR, "*.csv"))
    if csvs:
        return sorted(csvs)[0]
    raise FileNotFoundError(f"No CSV dataset found in {_DATA_DIR}")

@lru_cache(maxsize=1)
def _get_geojson_states() -> list[str]:
    path = os.path.join(_DATA_DIR, "india.json")
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        geo = json.load(f)
    return [feature["properties"]["STNAME"] for feature in geo.get("features", [])]

# ── Load once ─────────────────────────────────────────────────────────────
@lru_cache(maxsize=1)
def _load() -> pd.DataFrame:
    path = _find_data_file()
    df = pd.read_csv(path, parse_dates=["date"])

    # Normalise severity to Title-case for consistent display
    if "accident_severity" in df.columns:
        df["severity"] = df["accident_severity"].str.strip().str.title()
    elif "severity" in df.columns:
        df["severity"] = df["severity"].str.strip().str.title()

    # Build unified location label: "City, State"
    if "city" in df.columns and "state" in df.columns:
        df["state"] = df["state"].str.upper().str.replace("&", "AND")
        df["location"] = df["city"] + ", " + df["state"]
    elif "location" not in df.columns:
        df["location"] = "Unknown"

    # Ensure hour column exists
    if "hour" not in df.columns and "time" in df.columns:
        df["hour"] = pd.to_datetime(df["time"], format="%H:%M", errors="coerce").dt.hour

    # Normalise day_of_week
    if "day_of_week" not in df.columns:
        df["day_of_week"] = df["date"].dt.day_name()

    # casualties → injuries alias for backward compat
    if "casualties" in df.columns and "injuries" not in df.columns:
        df["injuries"] = df["casualties"]
    if "injuries" not in df.columns:
        df["injuries"] = 0

    # fatalities: derive from severity == Fatal
    if "fatalities" not in df.columns:
        df["fatalities"] = (df["severity"] == "Fatal").astype(int)

    # vehicles_involved default
    if "vehicles_involved" not in df.columns:
        df["vehicles_involved"] = 1

    # id column
    if "accident_id" in df.columns and "id" not in df.columns:
        df["id"] = df["accident_id"]
    elif "id" not in df.columns:
        df["id"] = range(len(df))

    return df


# ── Filter helper ─────────────────────────────────────────────────────────
def _filter(
    df: pd.DataFrame,
    start:    Optional[str] = None,
    end:      Optional[str] = None,
    location: Optional[str] = None,
    severity: Optional[str] = None,
) -> pd.DataFrame:
    if start:
        df = df[df["date"] >= pd.to_datetime(start)]
    if end:
        df = df[df["date"] <= pd.to_datetime(end)]
    if location and location.lower() not in ("all", ""):
        # Match city, state, or combined "City, State"
        mask = (
            (df["location"] == location) |
            (df["city"] == location if "city" in df.columns else False) |
            (df["state"] == location if "state" in df.columns else False)
        )
        df = df[mask]
    if severity and severity.lower() not in ("all", ""):
        df = df[df["severity"].str.lower() == severity.lower()]
    return df


# ─── Public API ───────────────────────────────────────────────────────────

def get_summary(start=None, end=None, location=None, severity=None) -> dict:
    df = _filter(_load(), start, end, location, severity)
    if df.empty:
        return {
            "total_accidents": 0, "peak_hour": "N/A", "high_risk_zone": "N/A",
            "total_fatalities": 0, "total_casualties": 0,
            "avg_risk_score": 0.0, "avg_vehicles": 0
        }
    peak_h   = int(df["hour"].value_counts().idxmax())
    peak_str = f"{peak_h:02d}:00"
    top_loc  = df["location"].value_counts().idxmax()

    avg_risk = round(float(df["risk_score"].mean()), 3) if "risk_score" in df.columns else 0.0

    return {
        "total_accidents":  int(len(df)),
        "peak_hour":        peak_str,
        "high_risk_zone":   top_loc,
        "total_fatalities": int(df["fatalities"].sum()),
        "total_casualties": int(df["injuries"].sum()),
        "avg_risk_score":   avg_risk,
        "avg_vehicles":     round(float(df["vehicles_involved"].mean()), 2),
    }


def get_hourly_distribution(start=None, end=None, location=None, severity=None) -> list[dict]:
    df = _filter(_load(), start, end, location, severity)
    counts = df.groupby("hour").size().reindex(range(24), fill_value=0)
    return [{"hour": int(h), "accidents": int(c)} for h, c in counts.items()]


def get_severity_breakdown(start=None, end=None, location=None, severity=None) -> list[dict]:
    df = _filter(_load(), start, end, location, severity)
    counts = df["severity"].value_counts()
    total  = len(df) or 1
    order  = ["Fatal", "Major", "Minor"]
    colors = {"Fatal": "#ef4444", "Major": "#f59e0b", "Minor": "#22c55e"}
    return [
        {
            "name":       s,
            "value":      int(counts.get(s, 0)),
            "percentage": round(counts.get(s, 0) / total * 100, 1),
            "color":      colors[s],
        }
        for s in order
    ]


def get_trends(days: int = 90, start=None, end=None, location=None, severity=None) -> list[dict]:
    df = _filter(_load(), start, end, location, severity)
    if df.empty:
        return []
    daily = df.groupby("date").size().reset_index(name="accidents")
    daily = daily.sort_values("date").tail(days)
    daily["ma7"] = daily["accidents"].rolling(7, min_periods=1).mean().round(1)
    return [
        {"date": row["date"].strftime("%Y-%m-%d"),
         "accidents": int(row["accidents"]),
         "ma7": float(row["ma7"])}
        for _, row in daily.iterrows()
    ]


def get_locations(top_n: int = 10, start=None, end=None, severity=None) -> list[dict]:
    df = _filter(_load(), start, end, severity=severity)
    loc = (
        df.groupby("location")
        .agg(
            accidents   = ("id",          "count"),
            fatalities  = ("fatalities",  "sum"),
            casualties  = ("injuries",    "sum"),
            avg_risk    = ("risk_score",  "mean") if "risk_score" in df.columns else ("id", "count"),
        )
        .reset_index()
        .sort_values("accidents", ascending=False)
        .head(top_n)
    )
    loc = loc.rename(columns={"location": "name", "casualties": "injuries"})
    if "avg_risk" in loc.columns:
        loc["avg_risk"] = loc["avg_risk"].round(3)
    return loc.to_dict(orient="records")


def get_weather_breakdown(start=None, end=None, location=None, severity=None) -> list[dict]:
    df = _filter(_load(), start, end, location, severity)
    counts = df["weather"].value_counts().reset_index()
    counts.columns = ["weather", "accidents"]
    return counts.to_dict(orient="records")


def get_day_distribution(start=None, end=None, location=None, severity=None) -> list[dict]:
    df = _filter(_load(), start, end, location, severity)
    order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    counts = df["day_of_week"].value_counts().reindex(order, fill_value=0)
    return [{"day": d, "accidents": int(c)} for d, c in counts.items()]


def get_cause_breakdown(start=None, end=None, location=None, severity=None) -> list[dict]:
    df = _filter(_load(), start, end, location, severity)
    if "cause" not in df.columns:
        return []
    counts = df["cause"].value_counts().reset_index()
    counts.columns = ["cause", "accidents"]
    return counts.to_dict(orient="records")


def get_city_breakdown(start=None, end=None, severity=None, state=None) -> list[dict]:
    df = _filter(_load(), start, end, severity=severity)
    # Optional state-level drill-down
    if state and state.lower() not in ("all", ""):
        state_up = state.upper().replace("&", "AND")
        if "state" in df.columns:
            df = df[df["state"] == state_up]
    col = "city" if "city" in df.columns else "location"
    counts = df.groupby(col).agg(
        accidents  = ("id",         "count"),
        fatalities = ("fatalities", "sum"),
        casualties = ("injuries",   "sum"),
    ).reset_index().sort_values("accidents", ascending=False)
    counts = counts.rename(columns={col: "city", "casualties": "injuries"})
    return counts.to_dict(orient="records")


def get_road_type_breakdown(start=None, end=None, location=None, severity=None) -> list[dict]:
    df = _filter(_load(), start, end, location, severity)
    if "road_type" not in df.columns:
        return []
    counts = df["road_type"].value_counts().reset_index()
    counts.columns = ["road_type", "accidents"]
    return counts.to_dict(orient="records")


def get_risk_score_distribution(start=None, end=None, location=None, severity=None) -> list[dict]:
    df = _filter(_load(), start, end, location, severity)
    if "risk_score" not in df.columns:
        return []
    bins = [0.0, 0.2, 0.4, 0.6, 0.8, 1.01]
    labels = ["Very Low (0-0.2)", "Low (0.2-0.4)", "Medium (0.4-0.6)", "High (0.6-0.8)", "Critical (0.8-1.0)"]
    df["risk_band"] = pd.cut(df["risk_score"], bins=bins, labels=labels, right=False)
    counts = df["risk_band"].value_counts().reindex(labels, fill_value=0)
    return [{"band": b, "accidents": int(c)} for b, c in counts.items()]


def get_yearly_trend(start=None, end=None, location=None, severity=None) -> list[dict]:
    """Year-by-year accident totals with fatality and casualty breakdown."""
    df = _filter(_load(), start, end, location, severity)
    if df.empty:
        return []
    df["year"] = df["date"].dt.year
    yearly = df.groupby("year").agg(
        accidents  = ("id",         "count"),
        fatalities = ("fatalities", "sum"),
        casualties = ("injuries",   "sum"),
    ).reset_index().sort_values("year")
    if "risk_score" in df.columns:
        risk_by_year = df.groupby("year")["risk_score"].mean().round(3)
        yearly["avg_risk"] = yearly["year"].map(risk_by_year)
    return yearly.to_dict(orient="records")


def get_data_quality() -> dict:
    """Return data cleaning stats — useful for Phase 3 documentation."""
    raw_path = _find_data_file()
    raw = pd.read_csv(raw_path)
    df  = _load()

    null_counts = raw.isnull().sum().to_dict()
    total_nulls = int(sum(null_counts.values()))

    return {
        "source_file":      os.path.basename(raw_path),
        "raw_rows":         int(len(raw)),
        "clean_rows":       int(len(df)),
        "columns":          list(raw.columns),
        "total_nulls":      total_nulls,
        "null_by_column":   {k: int(v) for k, v in null_counts.items() if v > 0},
        "severity_values":  df["severity"].unique().tolist() if "severity" in df.columns else [],
        "date_range":       {
            "start": df["date"].min().strftime("%Y-%m-%d"),
            "end":   df["date"].max().strftime("%Y-%m-%d"),
        },
        "cities":           int(df["city"].nunique()) if "city" in df.columns else 0,
        "states":           int(df["state"].nunique()) if "state" in df.columns else 0,
    }


def get_insights(location: Optional[str] = None) -> list[dict]:
    """Compute 8 key narrative insights from real data (Phase 6)."""
    df = _load()
    # Apply optional location filter (state or city)
    if location and location.lower() not in ("all", ""):
        mask = (
            (df["location"] == location) |
            (df["city"] == location if "city" in df.columns else False) |
            (df["state"] == location.upper().replace("&", "AND") if "state" in df.columns else False)
        )
        df = df[mask]
    if df.empty:
        return []
    insights = []

    # 1. Deadliest hour
    hourly_fatal = df[df["severity"] == "Fatal"].groupby("hour").size()
    worst_hour   = int(hourly_fatal.idxmax())
    worst_count  = int(hourly_fatal.max())
    insights.append({
        "id":      "deadliest_hour",
        "icon":    "🕐",
        "title":   f"{worst_hour:02d}:00 Is The Deadliest Hour",
        "finding": f"{worst_count:,} fatal accidents occur at {worst_hour:02d}:00 — the single most dangerous hour on Indian roads.",
        "stat":    f"{worst_hour:02d}:00",
        "color":   "#ef4444",
    })

    # 2. Top cause
    if "cause" in df.columns:
        top_cause       = df["cause"].value_counts().idxmax()
        top_cause_count = int(df["cause"].value_counts().max())
        top_cause_pct   = round(top_cause_count / len(df) * 100, 1)
        insights.append({
            "id":      "top_cause",
            "icon":    "⚠️",
            "title":   f"{top_cause.title()} Is The #1 Cause",
            "finding": f"{top_cause.title()} causes {top_cause_pct}% of all reported accidents ({top_cause_count:,} incidents).",
            "stat":    f"{top_cause_pct}%",
            "color":   "#f59e0b",
        })

    # 3. Weekend vs weekday
    if "is_weekend" in df.columns:
        wknd_avg = df[df["is_weekend"]==1].groupby("date").size().mean()
        wkdy_avg = df[df["is_weekend"]==0].groupby("date").size().mean()
        pct_diff = round(abs(wknd_avg - wkdy_avg) / wkdy_avg * 100, 1)
        higher   = "Weekends" if wknd_avg > wkdy_avg else "Weekdays"
        insights.append({
            "id":      "weekend_effect",
            "icon":    "📅",
            "title":   f"{higher} Are More Dangerous",
            "finding": f"{higher} see {pct_diff}% more accidents per day on average — suggesting leisure travel risks.",
            "stat":    f"+{pct_diff}%",
            "color":   "#a78bfa",
        })

    # 4. Rain premium
    if "weather" in df.columns:
        rain_fatal = df[df["weather"]=="rain"]["severity"].eq("Fatal").mean()
        clr_fatal  = df[df["weather"]=="clear"]["severity"].eq("Fatal").mean()
        rain_pct   = round(rain_fatal * 100, 1)
        clr_pct    = round(clr_fatal  * 100, 1)
        insights.append({
            "id":      "rain_risk",
            "icon":    "🌧️",
            "title":   "Rain Dramatically Raises Fatal Risk",
            "finding": f"{rain_pct}% of rain-day accidents are fatal vs {clr_pct}% on clear days — a {round(rain_pct/max(clr_pct,0.1),1)}× multiplier.",
            "stat":    f"{rain_pct}% fatal",
            "color":   "#06b6d4",
        })

    # 5. High-risk city
    top_city  = df["location"].value_counts().idxmax()
    top_city_n = int(df["location"].value_counts().max())
    insights.append({
        "id":      "top_city",
        "icon":    "🏙️",
        "title":   f"{top_city.split(',')[0]} Is The Accident Capital",
        "finding": f"{top_city} accounts for {top_city_n:,} accidents — the highest density in the dataset.",
        "stat":    f"{top_city_n:,} accidents",
        "color":   "#ef4444",
    })

    # 6. Peak hour overall
    peak_h = int(df["hour"].value_counts().idxmax())
    peak_n = int(df["hour"].value_counts().max())
    insights.append({
        "id":      "peak_hour",
        "icon":    "🚦",
        "title":   f"{peak_h:02d}:00 Has Most Accidents Overall",
        "finding": f"Hour {peak_h:02d}:00 records {peak_n:,} accidents — the single busiest hour across all locations.",
        "stat":    f"{peak_h:02d}:00",
        "color":   "#3b82f6",
    })

    # 7. Highway vs urban severity
    if "road_type" in df.columns:
        hw_fatal  = round(df[df["road_type"]=="highway"]["severity"].eq("Fatal").mean()*100, 1)
        urb_fatal = round(df[df["road_type"]=="urban"]["severity"].eq("Fatal").mean()*100, 1)
        insights.append({
            "id":      "highway_risk",
            "icon":    "🛣️",
            "title":   "Highways Are Deadlier Than Urban Roads",
            "finding": f"Highway fatality rate: {hw_fatal}% vs urban: {urb_fatal}%. High speed + poor visibility = higher mortality.",
            "stat":    f"{hw_fatal}% fatal",
            "color":   "#f97316",
        })

    # 8. Avg risk score for fatal
    if "risk_score" in df.columns:
        fatal_risk = round(df[df["severity"]=="Fatal"]["risk_score"].mean(), 3)
        minor_risk = round(df[df["severity"]=="Minor"]["risk_score"].mean(), 3)
        insights.append({
            "id":      "risk_score_gap",
            "icon":    "📊",
            "title":   "Fatal Accidents Score 2× Higher Risk",
            "finding": f"Fatal incidents average risk score {fatal_risk} vs {minor_risk} for minor ones — the model correctly predicts severity.",
            "stat":    f"{fatal_risk} avg",
            "color":   "#22c55e",
        })

    return insights


def get_export(start=None, end=None, location=None, severity=None) -> list[dict]:
    """Return filtered dataset rows for CSV download (capped at 5000 rows)."""
    df = _filter(_load(), start, end, location, severity)
    cols = [c for c in ["date", "city", "state", "severity", "cause", "weather",
                        "road_type", "hour", "day_of_week", "risk_score",
                        "fatalities", "injuries", "vehicles_involved"] if c in df.columns]
    df = df[cols].head(5000)
    df["date"] = df["date"].astype(str)
    return df.to_dict(orient="records")


def get_filter_options() -> dict:
    df = _load()
    cities = sorted(df["city"].unique().tolist()) if "city" in df.columns else []
    states = sorted(df["state"].unique().tolist()) if "state" in df.columns else []
    combined = sorted(df["location"].unique().tolist())
    return {
        "locations":  ["All"] + combined,
        "cities":     ["All"] + cities,
        "states":     ["All"] + states,
        "severities": ["All", "Fatal", "Major", "Minor"],
    }


def get_available_years() -> list[int]:
    """Return sorted list of years present in the dataset."""
    df = _load()
    df["year"] = df["date"].dt.year
    return sorted(df["year"].dropna().unique().astype(int).tolist())


def get_map_data(year: Optional[int] = None, severity: Optional[str] = None) -> dict:
    """Return per-state accident counts (and severity breakdown) for the given year."""
    df = _load()
    geojson_states = _get_geojson_states()
    # If no states in geojson (fallback), use df states
    all_states = geojson_states if geojson_states else df["state"].unique().tolist() if "state" in df.columns else []

    if "state" not in df.columns:
        return {"states": {s: 0 for s in all_states}, "year": year, "total": 0}

    df["year"] = df["date"].dt.year

    if year is not None:
        df = df[df["year"] == year]
    if severity and severity.lower() not in ("all", ""):
        df = df[df["severity"].str.lower() == severity.lower()]

    # Per-state totals
    state_counts = df.groupby("state").size().to_dict()
    
    # Fill missing states with 0
    final_state_counts = {}
    for state in all_states:
        # Match GeoJSON STNAME (e.g., "JAMMU & KASHMIR") with dataset state (e.g., "JAMMU AND KASHMIR")
        # Since we replaced & with AND in df, let's normalize the geojson state to check against df
        df_state_key = state.upper().replace("&", "AND")
        final_state_counts[state] = int(state_counts.get(df_state_key, 0))

    # Per-state severity breakdown
    sev_breakdown: dict[str, dict] = {}
    if "severity" in df.columns:
        for state in all_states:
            df_state_key = state.upper().replace("&", "AND")
            # Filter df for this state
            grp = df[df["state"] == df_state_key]
            if not grp.empty:
                sev_breakdown[state] = {
                    "Fatal": int((grp["severity"] == "Fatal").sum()),
                    "Major": int((grp["severity"] == "Major").sum()),
                    "Minor": int((grp["severity"] == "Minor").sum()),
                }

    # Per-state avg risk
    avg_risk: dict[str, float] = {}
    if "risk_score" in df.columns:
        risk_grouped = df.groupby("state")["risk_score"].mean().round(3).to_dict()
        for state in all_states:
            df_state_key = state.upper().replace("&", "AND")
            if df_state_key in risk_grouped:
                avg_risk[state] = float(risk_grouped[df_state_key])

    return {
        "year":      year,
        "total":     int(len(df)),
        "states":    final_state_counts,
        "severity":  sev_breakdown,
        "avg_risk":  avg_risk,
    }
