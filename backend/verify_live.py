import os
import sys
import django

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "farmlink.settings")
django.setup()

from forecasts.engine import fetch_real_lucknow_mandi_prices, get_price_guidance, COMMODITIES

print("=" * 85)
print("  FARMLINK DIRECT — REAL-TIME APMC WHOLESALE PRICES VERIFICATION")
print("=" * 85)

for c in COMMODITIES:
    res = fetch_real_lucknow_mandi_prices(c)
    bp = res.get("base_price", 0)
    is_live = res.get("is_live_api", False)
    src = res.get("source", "")
    mkt = res.get("market_name", "")
    print(f"  {c:<12} -> Rs {bp:>5.1f}/kg | Live: {str(is_live):<5} | {src}")

print("\n" + "=" * 85)
print("  SAMPLE GUIDANCE FOR ONION, GARLIC, POTATO, TOMATO:")
print("=" * 85)
for test_c in ["onion", "garlic", "potato", "tomato"]:
    g = get_price_guidance(test_c)
    today = g["today"]["base"]
    p_break = g.get("price_breakdown", {})
    action = g.get("action_recommendation", {})
    mandis = g.get("mandi_comparison", [])
    fl = next((m for m in mandis if "FarmLink" in m["market_name"]), {})
    print(f"\n[{test_c.upper()}] Today Base: Rs {today}/kg | Trend: {g.get('trend')}")
    print(f"   Seller Action: {action.get('seller_badge')}")
    print(f"   Buyer Action:  {action.get('buyer_badge')}")
    print(f"   FarmLink Direct Rate: Rs {fl.get('price_per_kg')}/kg")
    print(f"   Farmer Extra Margin:  +Rs {p_break.get('farmer_extra_margin_per_kg')}/kg")
    print(f"   Buyer Savings:        -Rs {p_break.get('buyer_savings_per_kg')}/kg")
