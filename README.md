# 🚦 Traffic Intelligence System

A production-grade, end-to-end **road accident analytics dashboard** built on real Indian road accident data.  
Processes 20,000 records through a pandas pipeline → FastAPI backend → React dashboard with live filters and insights.

---

## 🧩 Architecture

```
Frontend  (React + Vite + Tailwind + Recharts)
      │  Axios HTTP
      ▼
Backend   (FastAPI + pandas)
      │  CSV read + aggregations
      ▼
Dataset   (indian_roads_dataset.csv — 20,000 rows, 24 columns)
```

---

## 📁 Project Structure

```
Traffic/
├── backend/
│   ├── data/
│   │   └── indian_roads_dataset.csv   # Real dataset
│   ├── main.py                        # FastAPI app — 14 endpoints
│   ├── pipeline.py                    # pandas processing layer
│   ├── test_api.py                    # Phase 7: smoke tests
│   ├── requirements.txt
│   ├── Procfile                       # Render deployment
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── api/client.js              # Axios instance
    │   ├── hooks/useTrafficData.js    # Central data hook
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── KPICard.jsx
    │   │   ├── TrendsChart.jsx
    │   │   ├── HourlyChart.jsx
    │   │   ├── SeverityChart.jsx
    │   │   ├── LocationsTable.jsx
    │   │   ├── WeatherChart.jsx
    │   │   ├── DayChart.jsx
    │   │   ├── CauseChart.jsx
    │   │   ├── RiskScoreChart.jsx
    │   │   ├── InsightCard.jsx
    │   │   └── YearlyTrendChart.jsx
    │   └── pages/
    │       ├── Dashboard.jsx          # KPI + main charts
    │       ├── Analytics.jsx          # Deep-dive charts
    │       └── Insights.jsx           # Phase 6 storytelling
    └── vercel.json
```

---

## 📊 Dataset

**File:** `indian_roads_dataset.csv`  
**Rows:** 20,000 | **Columns:** 24

| Column | Description |
|---|---|
| `city`, `state` | Location |
| `date`, `hour` | Temporal |
| `accident_severity` | `fatal` / `major` / `minor` |
| `cause` | Distraction, Overspeeding, Weather, Drunk Driving, Poor Road |
| `weather` | Clear, Rain, Fog, Snow, Cloudy |
| `road_type` | Urban, Highway, Rural |
| `risk_score` | Float 0–1 (model-assigned) |
| `casualties` | Reported injuries |
| `vehicles_involved` | Count |
| `festival` | Festival context |
| `is_weekend`, `is_peak_hour` | Boolean flags |

---

## 🚀 Local Setup

### Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Dashboard: http://localhost:5173

---

## 📡 API Endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Backend heartbeat |
| `GET /api/summary` | KPI: total accidents, peak hour, high-risk zone |
| `GET /api/hourly` | Accidents by hour (0–23) |
| `GET /api/severity` | Fatal / Major / Minor breakdown |
| `GET /api/trends` | Daily trend with 7-day MA |
| `GET /api/yearly-trend` | Year-on-year aggregation |
| `GET /api/locations` | Top locations ranked |
| `GET /api/weather` | Accidents by weather condition |
| `GET /api/days` | Day-of-week distribution |
| `GET /api/causes` | Accident cause breakdown |
| `GET /api/cities` | City-level aggregation |
| `GET /api/road-types` | Urban vs highway vs rural |
| `GET /api/risk-scores` | Risk score band distribution |
| `GET /api/insights` | Computed narrative insights |
| `GET /api/data-quality` | Dataset cleaning stats |
| `GET /api/filter-options` | Available filter values |

All analytics endpoints accept `?start=`, `?end=`, `?location=`, `?severity=` query params.

---

## ✅ Phase 7: Running Tests

```bash
cd backend
.\venv\Scripts\python.exe test_api.py
```

Expected output: `16/16 passed — ALL TESTS PASSED`

---

## 🌍 Deployment (Phase 8)

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
# Set env var: VITE_API_BASE_URL=https://your-api.onrender.com
```

### Backend → Render

1. Push repo to GitHub
2. New Web Service on Render → connect repo → select `backend/` folder
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 💡 Key Insights (Phase 6)

Automatically computed from the dataset:

- **02:00** is the peak accident hour overall
- **Distraction** is the #1 cause (~22% of all accidents)
- Rain increases fatal accident rate vs clear weather
- **Chandigarh, Punjab** has the highest accident density
- Highways have a higher fatality rate than urban roads
- Fatal incidents score ~2× higher on the risk_score model

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4, Recharts |
| Backend | Python 3.12, FastAPI, uvicorn |
| Data | pandas, numpy |
| HTTP | Axios |
| Deploy (FE) | Vercel |
| Deploy (BE) | Render / Railway |

---

## 🎤 Interview Talking Points (Phase 10)

**Data Pipeline:**  
Raw CSV → `pipeline.py` loads once with `@lru_cache` → filter helper slices by date/location/severity → aggregation functions return JSON.

**API Design:**  
REST endpoints, each single-responsibility. Query params for all filters. No auth needed for read-only analytics. CORS enabled for cross-origin React calls.

**Visualization Choices:**  
- Line chart for trends (shows temporal patterns)
- Bar chart for hourly/cause (categorical comparison)
- Donut pie for severity (part-of-whole)
- Radar for day-of-week (circular periodicity)
- Composed chart for yearly (multi-metric)

**Key Insights:**  
Derived from real aggregations — no approximations. `get_insights()` auto-computes 8 findings every time the backend starts.

---
