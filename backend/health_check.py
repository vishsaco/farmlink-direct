"""
Comprehensive Market Predictor Health Check
Tests: API connectivity, price freshness, forecast logic, mandi comparison, all 10 crops
"""
import os, sys, django, json, time, math
from datetime import date, timedelta

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "farmlink.settings")
django.setup()

import forecasts.engine as fe

# Clear all caches to force fresh API calls
fe._ALL_PRICES_CACHE = None
fe._ALL_PRICES_CACHE_TS = 0
fe._LIVE_PRICE_CACHE.clear()
fe._LIVE_PRICE_CACHE_TS.clear()

PASS = "✅"
FAIL = "❌"
WARN = "⚠️"
results = []

def check(name, passed, detail=""):
    status = PASS if passed else FAIL
    results.append((status, name, detail))
    print(f"  {status} {name}" + (f" — {detail}" if detail else ""))

print("=" * 80)
print("  FARMLINK MARKET PREDICTOR — FULL SYSTEM HEALTH CHECK")
print(f"  Date: {date.today()} | Time: {time.strftime('%H:%M:%S')}")
print("=" * 80)

# ============================================================
# TEST 1: API Key & data.gov.in Connectivity
# ============================================================
print("\n[1/7] API KEY & DATA.GOV.IN CONNECTIVITY")
import urllib.request, urllib.parse
api_key = "579b464db66ec23bdd000001154c67779ae44f07596666938a696d0c"
resource_id = "9ef84268-d588-465a-a308-a864a43d0070"
api_url = f"https://api.data.gov.in/resource/{resource_id}"
params = {"api-key": api_key, "format": "json", "filters[commodity]": "Onion", "limit": 5}
full_url = f"{api_url}?{urllib.parse.urlencode(params)}"

try:
    req = urllib.request.Request(full_url, headers={"User-Agent": "Mozilla/5.0"})
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=15) as resp:
        status_code = resp.status
        body = json.loads(resp.read().decode("utf-8"))
        latency = round((time.time() - t0) * 1000)
    
    check("API key authentication", status_code == 200, f"HTTP {status_code}")
    check("API response has records", len(body.get("records", [])) > 0, f"{len(body.get('records', []))} records returned")
    check("API latency acceptable", latency < 5000, f"{latency}ms")
    
    # Check if data is from today
    recs = body.get("records", [])
    if recs:
        first_date = recs[0].get("arrival_date", "")
        today_str = date.today().strftime("%d/%m/%Y")
        check("API data is today's date", first_date == today_str, f"API date: {first_date}, Today: {today_str}")
except Exception as e:
    check("API connectivity", False, str(e))

# ============================================================
# TEST 2: Live Price Fetch for All 10 Crops
# ============================================================
print("\n[2/7] LIVE PRICE FETCH — ALL 10 CROPS")
all_prices = fe.get_all_live_prices()
price_data = all_prices.get("prices", {})
check("All 10 commodities returned", len(price_data) == 10, f"{len(price_data)} commodities")

all_live = True
stale_crops = []
for crop, info in price_data.items():
    is_live = info.get("is_live", False)
    price = info.get("price", 0)
    source = info.get("source", "unknown")
    
    if not is_live:
        all_live = False
        stale_crops.append(crop)
    
    check(f"{crop:<12} price={price:.1f}/kg live={is_live}", is_live and price > 0, source[:50])

check("All crops have live API data", all_live, f"Stale: {stale_crops}" if stale_crops else "All 10 live")

# ============================================================
# TEST 3: Forecast Engine — 7-day and 14-day predictions
# ============================================================
print("\n[3/7] FORECAST ENGINE — 7-DAY & 14-DAY PREDICTIONS")
for crop in fe.COMMODITIES:
    try:
        g = fe.get_price_guidance(crop)
        today_base = g["today"]["base"]
        seven_day = g["seven_day"]
        fourteen_day = g["fourteen_day"]
        
        # Check forecast has correct number of days
        check(f"{crop:<12} 7-day forecast count", len(seven_day) == 7, f"{len(seven_day)} days")
        check(f"{crop:<12} 14-day forecast count", len(fourteen_day) == 14, f"{len(fourteen_day)} days")
        
        # Check prices are reasonable (within 50% of base)
        all_reasonable = True
        for day in seven_day:
            if day["base"] < today_base * 0.5 or day["base"] > today_base * 2.0:
                all_reasonable = False
                break
        check(f"{crop:<12} forecast prices reasonable", all_reasonable, f"base={today_base}, range={seven_day[0]['base']}-{seven_day[-1]['base']}")
        
        # Check confidence bands exist
        has_bands = all("low" in d and "high" in d for d in seven_day)
        check(f"{crop:<12} confidence bands present", has_bands)
        
    except Exception as e:
        check(f"{crop:<12} forecast generation", False, str(e)[:80])

# ============================================================
# TEST 4: Mandi Comparison & FarmLink Direct Economics
# ============================================================
print("\n[4/7] MANDI COMPARISON & FARMLINK DIRECT ECONOMICS")
for crop in fe.COMMODITIES:
    try:
        g = fe.get_price_guidance(crop)
        mandis = g.get("mandi_comparison", [])
        breakdown = g.get("price_breakdown", {})
        today_base = g["today"]["base"]
        
        check(f"{crop:<12} has 6 mandis (5 APMC + FarmLink)", len(mandis) == 6, f"{len(mandis)} entries")
        
        # FarmLink Direct must be cheapest
        fl = next((m for m in mandis if "FarmLink" in m["market_name"]), None)
        apmc_mandis = [m for m in mandis if "FarmLink" not in m["market_name"]]
        
        if fl and apmc_mandis:
            cheapest_apmc = min(m["price_per_kg"] for m in apmc_mandis)
            check(f"{crop:<12} FarmLink < all APMCs", fl["price_per_kg"] < cheapest_apmc, 
                  f"FL={fl['price_per_kg']} vs cheapest APMC={cheapest_apmc}")
        
        # Farmer gets more through FarmLink
        farmer_extra = breakdown.get("farmer_extra_margin_per_kg", 0)
        buyer_saves = breakdown.get("buyer_savings_per_kg", 0)
        check(f"{crop:<12} farmer earns extra", farmer_extra > 0, f"+Rs {farmer_extra}/kg")
        check(f"{crop:<12} buyer saves money", buyer_saves > 0, f"-Rs {buyer_saves}/kg")
        
    except Exception as e:
        check(f"{crop:<12} mandi comparison", False, str(e)[:80])

# ============================================================
# TEST 5: Action Recommendations (Seller & Buyer)
# ============================================================
print("\n[5/7] ACTION RECOMMENDATIONS — SELLER & BUYER")
for crop in fe.COMMODITIES:
    try:
        g = fe.get_price_guidance(crop)
        action = g.get("action_recommendation", {})
        
        has_seller = "seller_action" in action and "seller_badge" in action and "seller_advice" in action
        has_buyer = "buyer_badge" in action and "buyer_advice" in action
        has_optimal = "optimal_harvest_date" in action and "optimal_price" in action
        
        check(f"{crop:<12} seller recommendation", has_seller, action.get("seller_action", "missing"))
        check(f"{crop:<12} buyer recommendation", has_buyer, action.get("buyer_badge", "missing")[:40])
        check(f"{crop:<12} optimal timing data", has_optimal, f"peak={action.get('optimal_price', '?')}")
        
    except Exception as e:
        check(f"{crop:<12} action recommendation", False, str(e)[:80])

# ============================================================
# TEST 6: Market Drivers & Weather
# ============================================================
print("\n[6/7] MARKET DRIVERS & WEATHER DATA")
for crop in fe.COMMODITIES:
    try:
        g = fe.get_price_guidance(crop)
        drivers = g.get("market_drivers", {})
        weather = g.get("weather", {})
        
        has_drivers = all(k in drivers for k in ["arrival_volume_trend", "demand_index", "spoilage_risk_gauge"])
        has_weather = all(k in weather for k in ["temperature_c", "humidity_pct", "rainfall_mm"])
        
        check(f"{crop:<12} market drivers present", has_drivers)
        check(f"{crop:<12} weather data present", has_weather, f"{weather.get('temperature_c')}°C, {weather.get('condition', '?')}")
        
    except Exception as e:
        check(f"{crop:<12} market/weather data", False, str(e)[:80])

# ============================================================
# TEST 7: Model Accuracy Metrics
# ============================================================
print("\n[7/7] MODEL ACCURACY METRICS")
for crop in fe.COMMODITIES:
    try:
        g = fe.get_price_guidance(crop)
        acc = g.get("accuracy", {})
        
        mape = acc.get("overall_mape", 999)
        score = acc.get("accuracy_score", 0)
        target_met = acc.get("target_met", False)
        
        check(f"{crop:<12} MAPE < 10%", mape < 10, f"MAPE={mape}%")
        check(f"{crop:<12} accuracy score", score >= 80, f"{score}/100")
        check(f"{crop:<12} target met", target_met)
        
    except Exception as e:
        check(f"{crop:<12} accuracy metrics", False, str(e)[:80])

# ============================================================
# SUMMARY
# ============================================================
print("\n" + "=" * 80)
total = len(results)
passed = sum(1 for r in results if r[0] == PASS)
failed = sum(1 for r in results if r[0] == FAIL)
print(f"  TOTAL: {total} checks | {PASS} PASSED: {passed} | {FAIL} FAILED: {failed}")
if failed == 0:
    print(f"  🏆 ALL SYSTEMS OPERATIONAL — Market Predictor is running at 100%")
else:
    print(f"\n  FAILURES:")
    for status, name, detail in results:
        if status == FAIL:
            print(f"    {FAIL} {name}: {detail}")
print("=" * 80)
