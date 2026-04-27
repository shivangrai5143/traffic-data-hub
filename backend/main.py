"""
main.py — FastAPI backend for Traffic Intelligence System (Real Data Edition)
Run: uvicorn main:app --reload --port 8000
"""
from __future__ import annotations
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import pipeline

app = FastAPI(
    title="Traffic Intelligence API",
    description="Indian Roads Accident Analytics — powered by FastAPI + pandas",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "message": "Traffic Intelligence API is running"}


# ── KPI Summary ───────────────────────────────────────────────────────────
@app.get("/api/summary", tags=["Analytics"])
def summary(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_summary(start, end, location, severity)


# ── Hourly Distribution ───────────────────────────────────────────────────
@app.get("/api/hourly", tags=["Analytics"])
def hourly(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_hourly_distribution(start, end, location, severity)


# ── Severity Breakdown ────────────────────────────────────────────────────
@app.get("/api/severity", tags=["Analytics"])
def severity_breakdown(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_severity_breakdown(start, end, location, severity)


# ── Daily Trends ──────────────────────────────────────────────────────────
@app.get("/api/trends", tags=["Analytics"])
def trends(
    days:     int           = Query(90, ge=7, le=730),
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_trends(days, start, end, location, severity)


# ── Top Locations (City, State) ───────────────────────────────────────────
@app.get("/api/locations", tags=["Analytics"])
def locations(
    top_n:    int           = Query(10, ge=1, le=50),
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_locations(top_n, start, end, severity)


# ── Weather Breakdown ─────────────────────────────────────────────────────
@app.get("/api/weather", tags=["Analytics"])
def weather(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_weather_breakdown(start, end, location, severity)


# ── Day-of-Week Distribution ──────────────────────────────────────────────
@app.get("/api/days", tags=["Analytics"])
def days(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_day_distribution(start, end, location, severity)


# ── Cause Breakdown (NEW) ─────────────────────────────────────────────────
@app.get("/api/causes", tags=["Analytics"])
def causes(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_cause_breakdown(start, end, location, severity)


# ── City Breakdown (NEW) ──────────────────────────────────────────────────
@app.get("/api/cities", tags=["Analytics"])
def cities(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_city_breakdown(start, end, severity)


# ── Road Type Breakdown (NEW) ─────────────────────────────────────────────
@app.get("/api/road-types", tags=["Analytics"])
def road_types(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_road_type_breakdown(start, end, location, severity)


# ── Risk Score Distribution (NEW) ─────────────────────────────────────────
@app.get("/api/risk-scores", tags=["Analytics"])
def risk_scores(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_risk_score_distribution(start, end, location, severity)


# ── Yearly Trend (NEW — Phase 3/4) ───────────────────────────────────────
@app.get("/api/yearly-trend", tags=["Analytics"])
def yearly_trend(
    start:    Optional[str] = Query(None),
    end:      Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
):
    return pipeline.get_yearly_trend(start, end, location, severity)


# ── Data Quality Report (NEW — Phase 3) ──────────────────────────────────
@app.get("/api/data-quality", tags=["System"])
def data_quality():
    return pipeline.get_data_quality()


# ── Insights (NEW — Phase 6) ──────────────────────────────────────────────
@app.get("/api/insights", tags=["Analytics"])
def insights():
    return pipeline.get_insights()


# ── Filter Options ────────────────────────────────────────────────────────
@app.get("/api/filter-options", tags=["Filters"])
def filter_options():
    return pipeline.get_filter_options()
