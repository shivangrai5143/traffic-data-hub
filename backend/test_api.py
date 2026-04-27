"""
test_api.py — Phase 7: API smoke-test suite
Run: python test_api.py
Requires: pip install requests (already satisfied via fastapi deps)
"""
import sys
import json
import time
import requests

BASE = "http://localhost:8000"
PASS = 0
FAIL = 0

def check(label: str, url: str, *, expected_keys: list[str] = None, is_list: bool = False, min_items: int = 0):
    global PASS, FAIL
    try:
        r = requests.get(url, timeout=10)
        assert r.status_code == 200, f"HTTP {r.status_code}"
        data = r.json()

        if is_list:
            assert isinstance(data, list), "Expected list"
            assert len(data) >= min_items, f"Expected >= {min_items} items, got {len(data)}"
        elif expected_keys:
            for k in expected_keys:
                assert k in data, f"Missing key: '{k}'"

        print(f"  [PASS] {label}")
        PASS += 1
        return data
    except Exception as e:
        print(f"  [FAIL] {label}  ->  {e}")
        FAIL += 1
        return None


print("\n" + "="*56)
print("  Traffic Intelligence API — Phase 7 Test Suite")
print("="*56)

# ── Health ────────────────────────────────────────────────────
print("\n[System]")
check("GET /health", f"{BASE}/health", expected_keys=["status", "message"])
check("GET /api/data-quality", f"{BASE}/api/data-quality",
      expected_keys=["source_file", "raw_rows", "clean_rows", "total_nulls", "date_range"])

# ── Core analytics ────────────────────────────────────────────
print("\n[Core Analytics]")
summary = check("GET /api/summary", f"{BASE}/api/summary",
                expected_keys=["total_accidents", "peak_hour", "high_risk_zone"])
if summary:
    assert summary["total_accidents"] > 0,   "total_accidents should be > 0"
    assert ":" in summary["peak_hour"],       "peak_hour should contain ':'"
    print(f"         total_accidents = {summary['total_accidents']:,}")
    print(f"         peak_hour       = {summary['peak_hour']}")
    print(f"         high_risk_zone  = {summary['high_risk_zone']}")

check("GET /api/hourly",        f"{BASE}/api/hourly",        is_list=True, min_items=24)
check("GET /api/severity",      f"{BASE}/api/severity",      is_list=True, min_items=3)
check("GET /api/trends",        f"{BASE}/api/trends",        is_list=True, min_items=1)
check("GET /api/yearly-trend",  f"{BASE}/api/yearly-trend",  is_list=True, min_items=1)
check("GET /api/locations",     f"{BASE}/api/locations",     is_list=True, min_items=1)
check("GET /api/weather",       f"{BASE}/api/weather",       is_list=True, min_items=1)
check("GET /api/days",          f"{BASE}/api/days",          is_list=True, min_items=7)
check("GET /api/causes",        f"{BASE}/api/causes",        is_list=True, min_items=1)
check("GET /api/cities",        f"{BASE}/api/cities",        is_list=True, min_items=1)
check("GET /api/road-types",    f"{BASE}/api/road-types",    is_list=True, min_items=1)
check("GET /api/risk-scores",   f"{BASE}/api/risk-scores",   is_list=True, min_items=1)
check("GET /api/insights",      f"{BASE}/api/insights",      is_list=True, min_items=5)

# ── Filters ───────────────────────────────────────────────────
print("\n[Filters]")
check("GET /api/filter-options", f"{BASE}/api/filter-options",
      expected_keys=["locations", "severities"])

check("GET /api/summary?severity=Fatal", f"{BASE}/api/summary?severity=Fatal",
      expected_keys=["total_accidents"])

check("GET /api/hourly?severity=Major", f"{BASE}/api/hourly?severity=Major",
      is_list=True, min_items=24)

check("GET /api/summary?start=2023-01-01&end=2023-12-31",
      f"{BASE}/api/summary?start=2023-01-01&end=2023-12-31",
      expected_keys=["total_accidents"])

# ── Edge cases ────────────────────────────────────────────────
print("\n[Edge Cases]")
check("Empty date range returns gracefully",
      f"{BASE}/api/summary?start=2030-01-01&end=2030-12-31",
      expected_keys=["total_accidents"])

# ── Results ───────────────────────────────────────────────────
total = PASS + FAIL
print("\n" + "="*56)
print(f"  Results: {PASS}/{total} passed", end="")
if FAIL == 0:
    print("  ALL TESTS PASSED")
else:
    print(f"  {FAIL} FAILED")
print("="*56 + "\n")

sys.exit(0 if FAIL == 0 else 1)
