import urllib.request
import json
import sys

crops = ['tomato', 'onion', 'potato', 'mango', 'chilli', 'garlic', 'ginger', 'spinach', 'cauliflower', 'wheat']
print("Testing forecasts endpoint for all 10 crops:")
for c in crops:
    try:
        url = f"http://127.0.0.1:8000/api/forecasts/{c}/?cluster=Lucknow"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            d = json.loads(resp.read().decode('utf-8'))
            today = d.get('today', {})
            meta = d.get('source_meta', {})
            rec = d.get('action_recommendation', {})
            mkt_prices = d.get('market_prices', [])
            print(f"[{c.upper()}] today: Rs {today.get('base')}/kg (low={today.get('low')}, high={today.get('high')}) | source: {meta.get('source')} | live: {meta.get('is_live_api')} | rec: {rec.get('action')} | mandis: {len(mkt_prices)}")
            if mkt_prices:
                for mp in mkt_prices[:2]:
                    print(f"    Mandi: {mp.get('market')} -> Rs {mp.get('modal_price')}/kg (min {mp.get('min_price')}, max {mp.get('max_price')}) [{mp.get('date')}]")
    except Exception as e:
        print(f"[{c.upper()}] ERROR: {e}")
